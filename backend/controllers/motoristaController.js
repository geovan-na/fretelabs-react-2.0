// controllers/motoristaController.js
const db = require('../config/database');

// Função auxiliar para buscar o transportador associado ao usuário logado
const getTransportadorId = async (userId) => {
    const [rows] = await db.query(
        'SELECT id FROM transportadores WHERE pessoa_id = ? AND tipo_transportador = "FROTA"',
        [userId]
    );
    return rows.length > 0 ? rows[0].id : null;
};

// ============================================
// 1. LISTAR MOTORISTAS VINCULADOS
// ============================================
const listarMotoristasVinculados = async (req, res) => {
    try {
        const userId = req.userId;
        const { status } = req.query;

        const transportadorId = await getTransportadorId(userId);

        if (!transportadorId) {
            return res.status(403).json({ 
                error: 'Apenas frotas podem listar motoristas vinculados' 
            });
        }

        let query = `
            SELECT 
                mv.id AS motorista_vinculado_id,
                p.id AS pessoa_id,
                p.nome_razao_social AS nome,
                p.email,
                p.telefone,
                p.celular,
                p.cpf_cnpj,
                mv.cnh,
                mv.cnh_categoria,
                mv.cnh_validade,
                mv.data_admissao,
                mv.data_demissao,
                mv.status AS situacao,
                mv.registro_funcionario,

                -- ⚡ CAMPOS DO VEÍCULO COMPATÍVEIS COM A TABELA VEICULOS ⚡
                v.id AS veiculo_id,
                CONCAT(v.marca, ' ', v.modelo) AS veiculo_modelo, -- Combina "Volvo" + "FH540" por exemplo
                v.placa,
                v.tipo_veiculo,
                v.tipo_carroceria,

                c.id AS contrato_id,
                c.tipo_contrato,
                c.valor_salario,
                c.valor_comissao,
                c.status AS contrato_status,
                (
                    SELECT COUNT(*) 
                    FROM pagamentos_motoristas pm 
                    WHERE pm.motorista_vinculado_id = mv.id
                    AND pm.status = 'PENDENTE'
                ) AS pagamentos_pendentes
            FROM motoristas_vinculados mv
            JOIN pessoas p ON mv.pessoa_id = p.id
            -- ⚡ JUNÇÃO COM A TABELA VEICULOS ATRAVÉS DO motorista_vinculado_id
            LEFT JOIN veiculos v ON v.motorista_vinculado_id = mv.id 
            LEFT JOIN contratos c ON mv.id = c.motorista_vinculado_id AND c.status IN ('ATIVO', 'EM_EXPERIENCIA')
            WHERE mv.transportador_id = ?
        `;

        const params = [transportadorId];

        if (status) {
            query += ` AND mv.status = ?`;
            params.push(status);
        }

        query += ` ORDER BY p.nome_razao_social ASC`;

        const [rows] = await db.query(query, params);
        res.json({ data: rows });

    } catch (error) {
        console.error('Erro ao listar motoristas vinculados:', error);
        res.status(500).json({ error: 'Erro ao listar motoristas vinculados' });
    }
};

// ============================================
// 2. LISTAR MOTORISTAS DISPONÍVEIS
// ============================================
const listarMotoristasDisponiveis = async (req, res) => {
    try {
        const userId = req.userId;
        const { cnh_categoria, avaliacao_min } = req.query;

        const transportadorId = await getTransportadorId(userId);

        if (!transportadorId) {
            return res.status(403).json({ 
                error: 'Apenas frotas podem listar motoristas disponíveis' 
            });
        }

        let query = `
            SELECT 
                p.id AS pessoa_id,
                p.nome_razao_social AS nome,
                p.email,
                p.telefone,
                p.celular,
                p.cpf_cnpj,
                mv.id AS motorista_vinculado_id,
                mv.cnh,
                mv.cnh_categoria,
                mv.cnh_validade,
                mv.status AS situacao,
                t.avaliacao_media,
                t.total_avaliacoes
            FROM motoristas_vinculados mv
            JOIN pessoas p ON mv.pessoa_id = p.id
            LEFT JOIN transportadores t ON mv.transportador_id = t.id
            WHERE mv.transportador_id IS NULL
            AND mv.status = 'ATIVO'
        `;

        const params = [];

        if (cnh_categoria) {
            query += ` AND mv.cnh_categoria = ?`;
            params.push(cnh_categoria);
        }

        if (avaliacao_min) {
            query += ` AND t.avaliacao_media >= ?`;
            params.push(parseFloat(avaliacao_min));
        }

        query += ` ORDER BY p.nome_razao_social ASC`;

        const [rows] = await db.query(query, params);
        res.json({ data: rows });

    } catch (error) {
        console.error('Erro ao listar motoristas disponíveis:', error);
        res.status(500).json({ error: 'Erro ao listar motoristas disponíveis' });
    }
};

// ============================================
// 3. BUSCAR MOTORISTA ESPECÍFICO
// ============================================
const buscarMotorista = async (req, res) => {
    try {
        const { id } = req.params; // id vindo da rota mapeando motoristas_vinculados.id
        const userId = req.userId;

        const transportadorId = await getTransportadorId(userId);

        const [rows] = await db.query(
            `SELECT 
                mv.id AS motorista_vinculado_id,
                mv.transportador_id,
                p.id AS pessoa_id,
                p.nome_razao_social AS nome,
                p.email,
                p.telefone,
                p.celular,
                p.cpf_cnpj,
                p.data_cadastro,
                mv.cnh,
                mv.cnh_categoria,
                mv.cnh_validade,
                mv.data_admissao,
                mv.data_demissao,
                mv.status AS situacao,
                mv.registro_funcionario,
                c.id AS contrato_id,
                c.tipo_contrato,
                c.valor_salario,
                c.valor_comissao,
                c.status AS contrato_status,
                c.data_inicio AS contrato_inicio,
                c.data_fim AS contrato_fim
            FROM motoristas_vinculados mv
            JOIN pessoas p ON mv.pessoa_id = p.id
            LEFT JOIN contratos c ON mv.id = c.motorista_vinculado_id AND c.status IN ('ATIVO', 'EM_EXPERIENCIA')
            WHERE mv.id = ?`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Motorista não encontrado' });
        }

        const motorista = rows[0];

        if (motorista.transportador_id !== transportadorId) {
            return res.status(403).json({ 
                error: 'Você não tem permissão para ver este motorista' 
            });
        }

        res.json({ data: motorista });

    } catch (error) {
        console.error('Erro ao buscar motorista:', error);
        res.status(500).json({ error: 'Erro ao buscar motorista' });
    }
};

// ============================================
// 4. FINALIZAR VÍNCULO (DEMISSÃO/DESLIGAMENTO)
// ============================================
// ============================================
// 4. FINALIZAR VÍNCULO (DEMISSÃO/DESLIGAMENTO)
// ============================================
const finalizarVinculo = async (req, res) => {
    try {
        const { id } = req.params; // ID do vínculo (motoristas_vinculados.id)
        const userId = req.userId;
        const { motivo } = req.body;

        const transportadorId = await getTransportadorId(userId);

        if (!transportadorId) {
            return res.status(403).json({ 
                error: 'Apenas frotas podem finalizar vínculos' 
            });
        }

        const [motorista] = await db.query(
            'SELECT * FROM motoristas_vinculados WHERE id = ? AND transportador_id = ?',
            [id, transportadorId]
        );

        if (motorista.length === 0) {
            return res.status(404).json({ 
                error: 'Motorista não encontrado ou não pertence a esta frota' 
            });
        }

        // Validação correta: impede a demissão se houver pagamentos pendentes
        const [pagamentos] = await db.query(
            'SELECT COUNT(*) as total FROM pagamentos_motoristas WHERE motorista_vinculado_id = ? AND status = "PENDENTE"',
            [id]
        );

        if (pagamentos[0].total > 0) {
            return res.status(400).json({ 
                error: `Existem ${pagamentos[0].total} pagamentos pendentes para este motorista. Regularize o financeiro antes de realizar o desligamento.` 
            });
        }

        // 1. Atualiza o status do vínculo para 'DESLIGADO'
        await db.query(
            `UPDATE motoristas_vinculados 
             SET status = 'DESLIGADO', 
                 data_demissao = NOW() 
             WHERE id = ?`,
            [id]
        );

        // 2. ⚡ ADICIONADO: Remove o motorista de qualquer veículo vinculado a ele
        await db.query(
            `UPDATE veiculos 
             SET motorista_vinculado_id = NULL 
             WHERE motorista_vinculado_id = ? AND transportador_id = ?`,
            [id, transportadorId]
        );

        // 3. Encerra qualquer contrato ativo associado a esse vínculo
        const [contrato] = await db.query(
            'SELECT id FROM contratos WHERE motorista_vinculado_id = ? AND status IN ("ATIVO", "EM_EXPERIENCIA")',
            [id]
        );

        if (contrato.length > 0) {
            await db.query(
                `UPDATE contratos 
                 SET status = 'ENCERRADO', 
                     data_fim = NOW(),
                     motivo_encerramento = ? 
                 WHERE id = ?`,
                [motivo || 'Vínculo finalizado pela frota', contrato[0].id]
            );
        }

        res.json({
            message: 'Vínculo finalizado e veículo desvinculado com sucesso',
            motorista_id: parseInt(id)
        });

    } catch (error) {
        console.error('Erro ao finalizar vínculo:', error);
        res.status(500).json({ error: 'Erro ao finalizar vínculo' });
    }
};
// ============================================
// 4. DESIGNAR VEÍCULO (Assign Vehicle)
// ============================================
const designarVeiculo = async (req, res) => {
    try {
        const { id } = req.params; // ID do motorista vinculado (motoristas_vinculados.id)
        const { veiculo_id } = req.body; // ID do veículo a ser designado
        const userId = req.userId;

        const transportadorId = await getTransportadorId(userId);

        if (!transportadorId) {
            return res.status(403).json({ 
                error: 'Apenas frotas podem designar veículos' 
            });
        }

        // 1. Verifica se o motorista pertence à frota
        const [motorista] = await db.query(
            'SELECT * FROM motoristas_vinculados WHERE id = ? AND transportador_id = ?',
            [id, transportadorId]
        );

        if (motorista.length === 0) {
            return res.status(404).json({ 
                error: 'Motorista não encontrado ou não pertence a esta frota' 
            });
        }

        // 2. Verifica se o veículo pertence à frota
        const [veiculo] = await db.query(
            'SELECT * FROM veiculos WHERE id = ? AND transportador_id = ?',
            [veiculo_id, transportadorId]
        );

        if (veiculo.length === 0) {
            return res.status(404).json({ 
                error: 'Veículo não encontrado ou não pertence a esta frota' 
            });
        }

        // 3. Remove esse motorista de qualquer outro veículo que ele possa estar dirigindo antes
        await db.query(
            'UPDATE veiculos SET motorista_vinculado_id = NULL WHERE motorista_vinculado_id = ? AND transportador_id = ?',
            [id, transportadorId]
        );

        // 4. Associa o motorista ao novo veículo (atualizando a tabela veiculos de acordo com o seu banco)
        await db.query(
            'UPDATE veiculos SET motorista_vinculado_id = ? WHERE id = ?',
            [id, veiculo_id]
        );

        res.json({ 
            message: 'Veículo designado com sucesso para o motorista',
            motorista_id: parseInt(id),
            veiculo_id: parseInt(veiculo_id)
        });

    } catch (error) {
        console.error('Erro ao designar veículo:', error);
        res.status(500).json({ error: 'Erro ao designar veículo' });
    }
};

// ============================================
// 5. REMOVER VEÍCULO (Remove Vehicle)
// ============================================
const removerVeiculo = async (req, res) => {
    try {
        const { id } = req.params; // ID do motorista vinculado
        const userId = req.userId;

        const transportadorId = await getTransportadorId(userId);

        if (!transportadorId) {
            return res.status(403).json({ 
                error: 'Apenas frotas podem remover veículos' 
            });
        }

        // 1. Verifica se o motorista pertence à frota
        const [motorista] = await db.query(
            'SELECT * FROM motoristas_vinculados WHERE id = ? AND transportador_id = ?',
            [id, transportadorId]
        );

        if (motorista.length === 0) {
            return res.status(404).json({ 
                error: 'Motorista não encontrado ou não pertence a esta frota' 
            });
        }

        // 2. Remove o vínculo definindo motorista_vinculado_id como NULL no veículo dele
        await db.query(
            'UPDATE veiculos SET motorista_vinculado_id = NULL WHERE motorista_vinculado_id = ? AND transportador_id = ?',
            [id, transportadorId]
        );

        res.json({ 
            message: 'Veículo removido do motorista com sucesso',
            motorista_id: parseInt(id)
        });

    } catch (error) {
        console.error('Erro ao remover veículo:', error);
        res.status(500).json({ error: 'Erro ao remover veículo' });
    }
};
module.exports = {
    listarMotoristasVinculados,
    listarMotoristasDisponiveis,
    buscarMotorista,
    designarVeiculo, 
    removerVeiculo,
    finalizarVinculo
};