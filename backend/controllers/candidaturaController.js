const db = require('../config/database');

// =========================================================================
// 1. LISTAR TODAS AS CANDIDATURAS RECEBIDAS PELO EMBARCADOR
// =========================================================================
const listarCandidaturasEmbarcador = async (req, res) => {
    try {
        const userId = req.userId;

        // Buscar o embarcador_id
        const [embarcadorRows] = await db.query(
            'SELECT id FROM embarcadores WHERE pessoa_id = ?',
            [userId]
        );

        if (embarcadorRows.length === 0) {
            return res.status(404).json({ error: 'Embarcador não encontrado' });
        }

        const embarcadorId = embarcadorRows[0].id;

        // Buscar todas as candidaturas dos fretes do embarcador
        const [rows] = await db.query(`
            SELECT 
                c.*,
                f.id as frete_id,
                f.origem_cep,
                f.destino_cep,
                f.tipo_carga,
                f.valor_ofertado as frete_valor,
                p_transportador.nome_razao_social as transportador_nome,
                p_transportador.id as transportador_pessoa_id
            FROM candidaturas c
            JOIN fretes f ON c.frete_id = f.id
            JOIN transportadores t ON c.transportador_id = t.id
            JOIN pessoas p_transportador ON t.pessoa_id = p_transportador.id
            WHERE f.embarcador_id = ?
            ORDER BY c.data_candidatura DESC
        `, [embarcadorId]);

        res.json({ data: rows });
    } catch (error) {
        console.error('Erro ao listar candidaturas do embarcador:', error);
        res.status(500).json({ error: 'Erro ao listar candidaturas' });
    }
};

// =========================================================================
// 2. LISTAR CANDIDATURAS DE UM FRETE ESPECÍFICO (EMBARCADOR)
// =========================================================================
const listarPorFrete = async (req, res) => {
    try {
        const { frete_id } = req.params;
        
        const [rows] = await db.query(`
            SELECT 
                c.*, 
                p.nome_razao_social as motorista_nome,
                p.id as pessoa_id
            FROM candidaturas c
            JOIN transportadores t ON c.transportador_id = t.id
            JOIN pessoas p ON t.pessoa_id = p.id
            WHERE c.frete_id = ?
            ORDER BY c.valor_lance ASC
        `, [frete_id]);
        
        res.json({ data: rows });
    } catch (error) {
        console.error('Erro ao listar candidaturas do frete:', error);
        res.status(500).json({ error: 'Erro ao listar candidaturas' });
    }
};

// =========================================================================
// 3. LISTAR MINHAS CANDIDATURAS (TRANSPORTADOR)
// =========================================================================
const listarMinhasCandidaturas = async (req, res) => {
    try {
        const userId = req.userId;

        // 1. Buscar primeiro o id do transportador (sua Frota) de forma isolada
        const [transportadorRows] = await db.query(
            'SELECT id FROM transportadores WHERE pessoa_id = ?',
            [userId]
        );

        // Se este usuário logado não for um transportador válido, retorna vazio de forma limpa
        if (transportadorRows.length === 0) {
            return res.json({ data: [] });
        }

        const transportadorId = transportadorRows[0].id;

        // 2. Query limpa e sem referências a motoristas vinculados
        const [rows] = await db.query(`
            SELECT 
                c.*, 
                f.origem_cep, 
                f.destino_cep, 
                f.tipo_carga, 
                f.valor_ofertado,
                f.status as frete_status,
                p_embarcador.nome_razao_social as embarcador_nome
            FROM candidaturas c
            JOIN fretes f ON c.frete_id = f.id
            JOIN embarcadores e ON f.embarcador_id = e.id
            JOIN pessoas p_embarcador ON e.pessoa_id = p_embarcador.id
            WHERE c.transportador_id = ?
            ORDER BY c.data_candidatura DESC
        `, [transportadorId]);
        
        return res.json({ data: rows });

    } catch (error) {
        console.error('Erro ao listar minhas candidaturas:', error);
        return res.status(500).json({ error: 'Erro ao listar candidaturas' });
    }
};
// =========================================================================
// 4. CRIAR CANDIDATURA
// =========================================================================
const criarCandidatura = async (req, res) => {
    try {
        const { frete_id, valor_lance, mensagem } = req.body;
        const userId = req.userId;

        if (!frete_id) {
            return res.status(400).json({ error: 'ID do frete é obrigatório' });
        }
        if (!valor_lance) {
            return res.status(400).json({ error: 'Valor do lance é obrigatório' });
        }
        if (valor_lance <= 0) {
            return res.status(400).json({ error: 'Valor do lance deve ser maior que zero' });
        }

        const [transportador] = await db.query(
            'SELECT id FROM transportadores WHERE pessoa_id = ?',
            [userId]
        );
        
        if (transportador.length === 0) {
            return res.status(404).json({ error: 'Perfil de transportador não encontrado' });
        }

        const transportadorId = transportador[0].id;

        const [freteRows] = await db.query(
            'SELECT id, status FROM fretes WHERE id = ?',
            [frete_id]
        );

        if (freteRows.length === 0) {
            return res.status(404).json({ error: 'Frete não encontrado' });
        }

        const frete = freteRows[0];
        if (!['AGUARDANDO', 'NEGOCIACAO'].includes(frete.status)) {
            return res.status(400).json({ 
                error: `Não é possível se candidatar a um frete com status "${frete.status}"` 
            });
        }

        const [existing] = await db.query(
            'SELECT id FROM candidaturas WHERE frete_id = ? AND transportador_id = ? AND status != "RECUSADO"',
            [frete_id, transportadorId]
        );

        if (existing.length > 0) {
            return res.status(400).json({ error: 'Você já possui uma candidatura activa para este frete' });
        }

        const [result] = await db.query(
            `INSERT INTO candidaturas 
             (frete_id, transportador_id, valor_lance, mensagem, status) 
             VALUES (?, ?, ?, ?, 'PENDENTE')`,
            [frete_id, transportadorId, valor_lance, mensagem || null]
        );
        
        res.status(201).json({ 
            message: 'Candidatura realizada com sucesso', 
            id: result.insertId 
        });
    } catch (error) {
        console.error('Erro ao criar candidatura:', error);
        res.status(500).json({ error: 'Erro ao criar candidatura' });
    }
};

// =========================================================================
// 5. ATUALIZAR STATUS DA CANDIDATURA
// =========================================================================
const atualizarCandidatura = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.userId;

        const statusPermitidos = ['PENDENTE', 'ACEITO', 'RECUSADO', 'CANCELADO'];
        if (!statusPermitidos.includes(status)) {
            return res.status(400).json({ 
                error: 'Status inválido. Use: PENDENTE, ACEITO, RECUSADO ou CANCELADO' 
            });
        }

        const [candidaturaRows] = await db.query(
            `SELECT c.*, f.embarcador_id 
             FROM candidaturas c
             JOIN fretes f ON c.frete_id = f.id
             WHERE c.id = ?`,
            [id]
        );

        if (candidaturaRows.length === 0) {
            return res.status(404).json({ error: 'Candidatura não encontrada' });
        }

        const candidatura = candidaturaRows[0];

        if (status === 'ACEITO' || status === 'RECUSADO') {
            const [embarcadorRows] = await db.query(
                'SELECT id FROM embarcadores WHERE pessoa_id = ?',
                [userId]
            );

            if (embarcadorRows.length === 0 || embarcadorRows[0].id !== candidatura.embarcador_id) {
                return res.status(403).json({ 
                    error: 'Apenas o embarcador pode aceitar ou recusar candidaturas' 
                });
            }
        }

        if (status === 'CANCELADO') {
            const [transportadorRows] = await db.query(
                'SELECT id FROM transportadores WHERE pessoa_id = ?',
                [userId]
            );

            if (transportadorRows.length === 0 || transportadorRows[0].id !== candidatura.transportador_id) {
                return res.status(403).json({ 
                    error: 'Apenas o transportador pode cancelar sua própria candidatura' 
                });
            }

            if (candidatura.status !== 'PENDENTE') {
                return res.status(400).json({ 
                    error: 'Apenas candidaturas pendentes podem ser canceladas' 
                });
            }
        }

        await db.query(
            'UPDATE candidaturas SET status = ?, data_resposta = NOW() WHERE id = ?', 
            [status, id]
        );

        if (status === 'ACEITO') {
            await db.query(
                'UPDATE fretes SET status = "ACEITO", transportador_id = ? WHERE id = ?',
                [candidatura.transportador_id, candidatura.frete_id]
            );
        }

        res.json({ 
            message: `Candidatura ${status.toLowerCase()} com sucesso`,
            status
        });
    } catch (error) {
        console.error('Erro ao atualizar candidatura:', error);
        res.status(500).json({ error: 'Erro ao atualizar candidatura' });
    }
};

// =========================================================================
// 6. DELETAR CANDIDATURA (APENAS PENDENTE)
// =========================================================================
const deletarCandidatura = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const [rows] = await db.query(
            `SELECT c.*, t.pessoa_id 
             FROM candidaturas c
             JOIN transportadores t ON c.transportador_id = t.id
             WHERE c.id = ?`,
            [id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Candidatura não encontrada' });
        }

        const candidatura = rows[0];

        if (candidatura.pessoa_id !== userId) {
            return res.status(403).json({ 
                error: 'Você não tem permissão para deletar esta candidatura' 
            });
        }

        if (candidatura.status !== 'PENDENTE') {
            return res.status(400).json({ 
                error: 'Apenas candidaturas pendentes podem ser deletadas' 
            });
        }

        await db.query('DELETE FROM candidaturas WHERE id = ?', [id]);
        res.json({ message: 'Candidatura removida com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar candidatura:', error);
        res.status(500).json({ error: 'Erro ao deletar candidatura' });
    }
};

// =========================================================================
// 7. DESIGNAR MOTORISTA (APENAS FROTA)
// =========================================================================
const designarMotorista = async (req, res) => {
    try {
        const { id } = req.params; // ID da candidatura
        const motoristaVinculadoId = req.body.motorista_vinculado_id || req.body.motorista_id;
        const userId = req.userId;

        if (!motoristaVinculadoId) {
            return res.status(400).json({ error: 'ID do motorista é obrigatório' });
        }

        // 1. Obter o ID do transportador (Frota) do usuário logado
        const [transportadores] = await db.query(
            'SELECT id FROM transportadores WHERE pessoa_id = ? AND tipo_transportador = "FROTA"',
            [userId]
        );

        if (transportadores.length === 0) {
            return res.status(403).json({ error: 'Apenas frotas podem designar motoristas.' });
        }

        const transportadorId = transportadores[0].id;

        // 2. Verificar se o motorista pertence à frota logada e buscar o veículo dele (se houver)
        const [motoristas] = await db.query(
            `SELECT 
                mv.id, 
                v.id AS veiculo_id 
             FROM motoristas_vinculados mv
             LEFT JOIN veiculos v ON v.motorista_vinculado_id = mv.id
             WHERE mv.id = ? 
               AND mv.transportador_id = ? 
               AND mv.status = 'ATIVO'`,
            [motoristaVinculadoId, transportadorId]
        );

        if (motoristas.length === 0) {
            return res.status(404).json({ error: 'Motorista não encontrado ou inativo nesta frota.' });
        }

        const veiculoId = motoristas[0].veiculo_id;

        // 3. Designar o Motorista (e o seu Veículo) DIRETAMENTE no FRETE
        const [result] = await db.query(
            `UPDATE fretes f
             JOIN candidaturas c ON f.id = c.frete_id
             SET f.motorista_vinculado_id = ?,
                 f.veiculo_id = COALESCE(?, f.veiculo_id)
             WHERE c.id = ?`,
            [motoristaVinculadoId, veiculoId, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Candidatura ou frete correspondente não encontrado.' });
        }

        res.json({ 
            message: 'Motorista designado com sucesso para o frete!',
            candidatura_id: parseInt(id),
            motorista_vinculado_id: parseInt(motoristaVinculadoId),
            veiculo_id: veiculoId ? parseInt(veiculoId) : null
        });

    } catch (error) {
        console.error('Erro ao designar motorista no frete:', error);
        res.status(500).json({ error: 'Erro interno ao designar motorista.' });
    }
};
// =========================================================================
// 8. LISTAR MOTORISTAS VINCULADOS (APENAS FROTA)
// =========================================================================
const listarMotoristasVinculados = async (req, res) => {
    try {
        const userId = req.userId;

        const [transportadorRows] = await db.query(
            'SELECT id FROM transportadores WHERE pessoa_id = ?',
            [userId]
        );

        if (transportadorRows.length === 0) {
            return res.status(404).json({ error: 'Transportador não encontrado' });
        }

        const transportadorId = transportadorRows[0].id;

        const [motoristas] = await db.query(
            `SELECT 
                mv.id,
                mv.pessoa_id,
                p.nome_razao_social as nome,
                mv.cnh,
                mv.cnh_categoria,
                mv.status,
                v.placa,
                v.modelo as veiculo_modelo
             FROM motoristas_vinculados mv
             JOIN pessoas p ON mv.pessoa_id = p.id
             LEFT JOIN veiculos v ON mv.id = v.motorista_vinculado_id
             WHERE mv.transportador_id = ? AND mv.status = 'ATIVO'
             ORDER BY p.nome_razao_social ASC`,
            [transportadorId]
        );

        // Padronizado com { data: motoristas }
        res.json({ data: motoristas }); 
    } catch (error) {
        console.error('Erro ao listar motoristas:', error);
        res.status(500).json({ error: 'Erro ao listar motoristas' });
    }
};
// =========================================================================
// 9. BUSCAR CANDIDATURA ESPECÍFICA
// =========================================================================
const buscarCandidatura = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.query(`
            SELECT 
                c.*,
                p.nome_razao_social as transportador_nome,
                p.email as transportador_email,
                f.origem_cep,
                f.destino_cep,
                f.tipo_carga,
                f.valor_ofertado,
                p_motorista.nome_razao_social as motorista_designado_nome
            FROM candidaturas c
            JOIN transportadores t ON c.transportador_id = t.id
            JOIN pessoas p ON t.pessoa_id = p.id
            JOIN fretes f ON c.frete_id = f.id
            LEFT JOIN motoristas_vinculados mv ON c.motorista_vinculado_id = mv.id
            LEFT JOIN pessoas p_motorista ON mv.pessoa_id = p_motorista.id
            WHERE c.id = ?
        `, [id]);

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Candidatura não encontrada' });
        }

        res.json({ data: rows[0] });
    } catch (error) {
        console.error('Erro ao buscar candidatura:', error);
        res.status(500).json({ error: 'Erro ao buscar candidatura' });
    }
};

// =========================================================================
// EXPORTAÇÃO (Com todas as funções integradas)
// =========================================================================
module.exports = { 
    listarCandidaturasEmbarcador,
    listarPorFrete,
    listarMinhasCandidaturas,
    criarCandidatura,
    atualizarCandidatura,
    deletarCandidatura,
    designarMotorista,
    listarMotoristasVinculados,
    buscarCandidatura
};