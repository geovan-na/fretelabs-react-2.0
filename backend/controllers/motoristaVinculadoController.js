// backend/controllers/motoristaVinculadoController.js
const db = require('../config/database');

// ============================================
// FUNÇÃO AUXILIAR: Buscar ID do motorista
// ============================================
const getMotoristaVinculadoId = async (userId) => {
    const [rows] = await db.query(
        'SELECT id FROM motoristas_vinculados WHERE pessoa_id = ?',
        [userId]
    );
    return rows.length > 0 ? rows[0].id : null;
};

// ============================================
// 1. LISTAR FRETES (Filtros dinâmicos: status)
// ============================================
const listarMeusFretes = async (req, res) => {
    try {
        const userId = req.userId;
        const { status } = req.query;

        const motoristaId = await getMotoristaVinculadoId(userId);
        if (!motoristaId) {
            return res.status(200).json({ data: [] }); // Retorna array vazio se não achar o perfil
        }

        let query = `
            SELECT 
                f.id,
                CONCAT('FR', LPAD(f.id, 5, '0')) as codigo,
                f.origem_cep,
                f.origem_endereco,
                f.destino_cep,
                f.destino_endereco,
                CONCAT(f.origem_cep, ' - ', f.origem_endereco) as origem,
                CONCAT(f.destino_cep, ' - ', f.destino_endereco) as destino,
                f.tipo_carga,
                f.peso_kg,
                f.valor_ofertado,
                f.valor_fechado as valor,
                f.data_coleta_prevista,
                f.data_entrega_prevista,
                f.data_coleta_realizada,
                f.data_entrega_realizada,
                f.status,
                f.prioridade,
                p.nome_razao_social as embarcador_nome,
                v.placa,
                v.modelo as veiculo_modelo
            FROM fretes f
            JOIN veiculos v ON f.veiculo_id = v.id
            JOIN embarcadores e ON f.embarcador_id = e.id
            JOIN pessoas p ON e.pessoa_id = p.id
            WHERE v.motorista_vinculado_id = ?
        `;

        const params = [motoristaId];

        if (status && status !== 'TODOS') {
            query += ` AND f.status = ?`;
            params.push(status);
        }

        query += ` ORDER BY f.data_coleta_prevista DESC`;

        const [rows] = await db.query(query, params);
        res.json({ data: rows });
    } catch (error) {
        console.error('Erro ao listar fretes:', error);
        res.status(500).json({ error: 'Erro ao listar fretes' });
    }
};

// ============================================
// 2. ATUALIZAR STATUS
// ============================================
const atualizarStatusFrete = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const { status, observacao } = req.body;

        const motoristaId = await getMotoristaVinculadoId(userId);
        if (!motoristaId) {
            return res.status(404).json({ error: 'Motorista não encontrado' });
        }

        const [freteRows] = await db.query(
            `SELECT f.* 
             FROM fretes f
             JOIN veiculos v ON f.veiculo_id = v.id
             WHERE f.id = ? AND v.motorista_vinculado_id = ?`,
            [id, motoristaId]
        );

        if (freteRows.length === 0) {
            return res.status(404).json({ error: 'Frete não encontrado' });
        }

        const frete = freteRows[0];

        const transicoesValidas = {
            'ACEITO': ['TRANSITO'],
            'TRANSITO': ['CONCLUIDO'],
            'CONCLUIDO': []
        };

        if (!transicoesValidas[frete.status]?.includes(status)) {
            return res.status(400).json({
                error: `Transição inválida. Status atual: ${frete.status}`
            });
        }

        let updateQuery = `UPDATE fretes SET status = ?`;
        const params = [status];

        if (status === 'TRANSITO') {
            updateQuery += `, data_coleta_realizada = NOW()`;
        }
        if (status === 'CONCLUIDO') {
            updateQuery += `, data_entrega_realizada = NOW()`;
        }

        updateQuery += ` WHERE id = ?`;
        params.push(id);

        await db.query(updateQuery, params);

        await db.query(
            `INSERT INTO historico_status_frete (frete_id, status_anterior, status_novo, observacao) 
             VALUES (?, ?, ?, ?)`,
            [id, frete.status, status, observacao || null]
        );

        res.json({
            message: `Status atualizado para "${status}"`,
            id: parseInt(id),
            status
        });
    } catch (error) {
        console.error('Erro ao atualizar status:', error);
        res.status(500).json({ error: 'Erro ao atualizar status' });
    }
};

// ============================================
// 3. BUSCAR PERFIL COMPLETO
// ============================================
const getPerfil = async (req, res) => {
    try {
        const userId = req.userId;

        const [rows] = await db.query(
            `SELECT 
                p.id AS pessoa_id,
                p.nome_razao_social AS nome,
                p.email,
                p.telefone,
                mv.cnh,
                mv.cnh_categoria,
                mv.status AS situacao,
                mv.data_admissao,
                t.id AS frota_id,
                pf.nome_razao_social AS frota_nome,
                v.id as veiculo_id,
                v.placa,
                v.modelo AS veiculo_modelo,
                c.valor_salario,
                c.status AS contrato_status
            FROM motoristas_vinculados mv
            JOIN pessoas p ON mv.pessoa_id = p.id
            LEFT JOIN transportadores t ON mv.transportador_id = t.id
            LEFT JOIN pessoas pf ON t.pessoa_id = pf.id
            LEFT JOIN veiculos v ON mv.id = v.motorista_vinculado_id
            LEFT JOIN contratos c ON mv.id = c.motorista_vinculado_id AND c.status = 'ATIVO'
            WHERE p.id = ?`,
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Perfil não encontrado' });
        }
        res.json({ data: rows[0] });
    } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        res.status(500).json({ error: 'Erro ao buscar perfil' });
    }
};

// ============================================
// 4. RESUMO
// ============================================
const getResumo = async (req, res) => {
    try {
        const userId = req.userId;
        const motoristaId = await getMotoristaVinculadoId(userId);
        if (!motoristaId) {
            return res.json({
                data: {
                    total_fretes: 0, fretes_aceitos: 0, fretes_em_andamento: 0,
                    fretes_concluidos: 0, total_recebido: 0, a_receber: 0
                }
            });
        }

        const [rows] = await db.query(
            `SELECT 
                COUNT(*) AS total_fretes,
                SUM(CASE WHEN f.status = 'ACEITO' THEN 1 ELSE 0 END) AS fretes_aceitos,
                SUM(CASE WHEN f.status = 'TRANSITO' THEN 1 ELSE 0 END) AS fretes_em_andamento,
                SUM(CASE WHEN f.status = 'CONCLUIDO' THEN 1 ELSE 0 END) AS fretes_concluidos,
                COALESCE(SUM(CASE WHEN f.status = 'CONCLUIDO' THEN f.valor_fechado ELSE 0 END), 0) AS total_recebido,
                COALESCE(SUM(CASE WHEN f.status IN ('ACEITO', 'TRANSITO') THEN f.valor_ofertado ELSE 0 END), 0) AS a_receber
            FROM fretes f
            JOIN veiculos v ON f.veiculo_id = v.id
            WHERE v.motorista_vinculado_id = ?`,
            [motoristaId]
        );

        res.json({ data: rows[0] });
    } catch (error) {
        console.error('Erro ao buscar resumo:', error);
        res.status(500).json({ error: 'Erro ao buscar resumo' });
    }
};

// ============================================
// 5. BUSCAR FRETE ESPECÍFICO
// ============================================
const buscarFrete = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const motoristaId = await getMotoristaVinculadoId(userId);

        if (!motoristaId) {
            return res.status(404).json({ error: 'Motorista não encontrado' });
        }

        const [rows] = await db.query(
            `SELECT 
                f.*,
                CONCAT('FR', LPAD(f.id, 5, '0')) as codigo,
                CONCAT(f.origem_cep, ' - ', f.origem_endereco) as origem,
                CONCAT(f.destino_cep, ' - ', f.destino_endereco) as destino,
                p.nome_razao_social as embarcador_nome,
                v.placa,
                v.modelo as veiculo_modelo
             FROM fretes f
             JOIN veiculos v ON f.veiculo_id = v.id
             JOIN embarcadores e ON f.embarcador_id = e.id
             JOIN pessoas p ON e.pessoa_id = p.id
             WHERE f.id = ? AND v.motorista_vinculado_id = ?`,
            [id, motoristaId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Frete não encontrado' });
        }

        const [historico] = await db.query(
            `SELECT status_anterior, status_novo, observacao, data_mudanca
             FROM historico_status_frete
             WHERE frete_id = ?
             ORDER BY data_mudanca ASC`,
            [id]
        );

        res.json({
            data: rows[0],
            historico_status: historico
        });
    } catch (error) {
        console.error('Erro ao buscar frete:', error);
        res.status(500).json({ error: 'Erro ao buscar frete' });
    }
};

// ============================================
// 6. LISTAR FRETES PARA ATUALIZAR STATUS
// ============================================
const listarFretesParaAtualizar = async (req, res) => {
    try {
        const userId = req.userId;

        const motoristaId = await getMotoristaVinculadoId(userId);
        if (!motoristaId) {
            return res.json({ data: [] });
        }

        const [fretes] = await db.query(
            `SELECT 
                f.id,
                CONCAT('FR', LPAD(f.id, 5, '0')) as codigo,
                f.origem_cep,
                f.origem_endereco,
                f.destino_cep,
                f.destino_endereco,
                CONCAT(f.origem_cep, ' - ', f.origem_endereco) as origem,
                CONCAT(f.destino_cep, ' - ', f.destino_endereco) as destino,
                f.tipo_carga,
                f.valor_fechado as valor,
                f.data_coleta_prevista,
                f.status,
                f.prioridade,
                p.nome_razao_social as embarcador_nome,
                v.placa as veiculo_placa
            FROM fretes f
            JOIN veiculos v ON f.veiculo_id = v.id
            JOIN embarcadores e ON f.embarcador_id = e.id
            JOIN pessoas p ON e.pessoa_id = p.id
            WHERE v.motorista_vinculado_id = ?
              AND f.status IN ('ACEITO', 'TRANSITO')
            ORDER BY f.data_coleta_prevista ASC`,
            [motoristaId]
        );

        return res.json({ data: fretes });
    } catch (error) {
        console.error('Erro ao listar fretes para atualizar:', error);
        return res.status(500).json({ error: 'Erro ao listar fretes para atualizar' });
    }
};

// ============================================
// 7. LISTAR FRETES EM ANDAMENTO (RASTREAMENTO)
// ============================================
const listarFretesEmAndamento = async (req, res) => {
    try {
        const userId = req.userId;

        const motoristaId = await getMotoristaVinculadoId(userId);
        if (!motoristaId) {
            return res.json({ data: [] }); 
        }

        const [fretes] = await db.query(
            `SELECT 
                f.id,
                CONCAT('FR', LPAD(f.id, 5, '0')) as codigo,
                f.origem_cep,
                f.origem_endereco,
                f.destino_cep,
                f.destino_endereco,
                CONCAT(f.origem_cep, ' - ', f.origem_endereco) as origem,
                CONCAT(f.destino_cep, ' - ', f.destino_endereco) as destino,
                f.tipo_carga,
                f.valor_fechado as valor,
                f.data_coleta_prevista,
                f.data_coleta_realizada,
                f.data_entrega_prevista,
                f.data_entrega_realizada,
                f.status,
                f.prioridade,
                f.origem_latitude,
                f.origem_longitude,
                f.destino_latitude,
                f.destino_longitude,
                p.nome_razao_social as embarcador_nome,
                v.placa as veiculo_placa,
                v.modelo as veiculo_modelo
            FROM fretes f
            JOIN veiculos v ON f.veiculo_id = v.id
            JOIN embarcadores e ON f.embarcador_id = e.id
            JOIN pessoas p ON e.pessoa_id = p.id
            WHERE v.motorista_vinculado_id = ?
              AND f.status IN ('ACEITO', 'TRANSITO')
            ORDER BY f.data_coleta_prevista ASC`,
            [motoristaId]
        );

        for (let frete of fretes) {
            const [historico] = await db.query(
                `SELECT status_anterior, status_novo, observacao, data_mudanca
                 FROM historico_status_frete
                 WHERE frete_id = ?
                 ORDER BY data_mudanca ASC`,
                [frete.id]
            );
            frete.historico_status = historico;

            const [ocorrencias] = await db.query(
                `SELECT tipo, gravidade, descricao, data_ocorrencia, resolvida
                 FROM ocorrencias
                 WHERE frete_id = ?
                 ORDER BY data_ocorrencia DESC
                 LIMIT 5`,
                [frete.id]
            );
            frete.ocorrencias = ocorrencias;
        }

        // Retorna envelopado em { data: [...] } para manter a padronização
        return res.json({ data: fretes });
    } catch (error) {
        console.error('Erro ao listar fretes em andamento:', error);
        return res.status(500).json({ error: 'Erro ao listar fretes em andamento' });
    }
};

// ============================================
// 8. LISTAR ENTREGAS REALIZADAS (HISTÓRICO)
// ============================================
const listarEntregasRealizadas = async (req, res) => {
    try {
        const userId = req.userId;
        const { mes, ano } = req.query;

        const motoristaId = await getMotoristaVinculadoId(userId);
        if (!motoristaId) {
            return res.json({
                resumo: { total_entregas: 0, total_recebido: 0, media_por_entrega: 0, meses_trabalhados: 0 },
                entregas: []
            });
        }

        let query = `
            SELECT 
                f.id,
                CONCAT('FR', LPAD(f.id, 5, '0')) as codigo,
                f.origem_cep,
                f.origem_endereco,
                f.destino_cep,
                f.destino_endereco,
                CONCAT(f.origem_cep, ' - ', f.origem_endereco) as origem,
                CONCAT(f.destino_cep, ' - ', f.destino_endereco) as destino,
                f.tipo_carga,
                f.valor_fechado as valor,
                f.data_entrega_realizada as data_entrega,
                f.data_coleta_prevista,
                f.data_coleta_realizada,
                p.nome_razao_social as embarcador_nome,
                v.placa as veiculo_placa,
                (SELECT AVG(nota_geral) FROM avaliacoes WHERE frete_id = f.id) as avaliacao_media
            FROM fretes f
            JOIN veiculos v ON f.veiculo_id = v.id
            JOIN embarcadores e ON f.embarcador_id = e.id
            JOIN pessoas p ON e.pessoa_id = p.id
            WHERE v.motorista_vinculado_id = ?
              AND f.status = 'CONCLUIDO'
        `;

        const params = [motoristaId];

        if (mes && ano) {
            query += ` AND MONTH(f.data_entrega_realizada) = ? AND YEAR(f.data_entrega_realizada) = ?`;
            params.push(mes, ano);
        }

        query += ` ORDER BY f.data_entrega_realizada DESC`;

        const [entregas] = await db.query(query, params);

        const [resumo] = await db.query(
            `SELECT 
                COUNT(*) as total_entregas,
                COALESCE(SUM(f.valor_fechado), 0) as total_recebido,
                ROUND(COALESCE(AVG(f.valor_fechado), 0), 2) as media_por_entrega,
                COUNT(DISTINCT DATE_FORMAT(f.data_entrega_realizada, '%Y-%m')) as meses_trabalhados
             FROM fretes f
             JOIN veiculos v ON f.veiculo_id = v.id
             WHERE v.motorista_vinculado_id = ?
               AND f.status = 'CONCLUIDO'`,
            [motoristaId]
        );

        return res.json({
            resumo: resumo[0] || { total_entregas: 0, total_recebido: 0, media_por_entrega: 0, meses_trabalhados: 0 },
            entregas: entregas
        });
    } catch (error) {
        console.error('Erro ao listar entregas realizadas:', error);
        return res.status(500).json({ error: 'Erro ao listar entregas realizadas' });
    }
};

// ============================================
// 9. LISTAR FROTAS DISPONÍVEIS (CORRIGIDO)
// ============================================
const listarFrotasDisponiveis = async (req, res) => {
    try {
        const userId = req.userId;
        const { search } = req.query;

        // 1. Busca vínculo existente, sem travar caso não exista
        const [motorista] = await db.query(
            'SELECT id, transportador_id FROM motoristas_vinculados WHERE pessoa_id = ?',
            [userId]
        );

        const transportadorIdAtual = motorista.length > 0 ? motorista[0].transportador_id : null;

        // 2. Monta a consulta de frotas
        let query = `
            SELECT 
                t.id,
                p.id as pessoa_id,
                p.nome_razao_social,
                p.cpf_cnpj,
                p.email,
                p.telefone,
                t.avaliacao_media,
                t.total_avaliacoes,
                t.area_atuacao,
                t.tipos_carga,
                t.registro_nacional_transportador,
                COUNT(DISTINCT v.id) as total_veiculos,
                (SELECT COUNT(*) FROM motoristas_vinculados mv WHERE mv.transportador_id = t.id AND mv.status = 'ATIVO') as motoristas_ativos,
                (SELECT COUNT(*) FROM fretes f WHERE f.transportador_id = t.id AND f.status IN ('TRANSITO', 'ACEITO')) as fretes_ativos
            FROM transportadores t
            JOIN pessoas p ON t.pessoa_id = p.id
            LEFT JOIN veiculos v ON v.transportador_id = t.id AND v.status = 'ATIVO'
            WHERE (t.tipo_transportador = 'FROTA' OR t.tipo_transportador IS NULL)
        `;

        const params = [];

        // Exclui a frota atual apenas se o motorista já tiver uma vinculada
        if (transportadorIdAtual) {
            query += ` AND t.id != ?`;
            params.push(transportadorIdAtual);
        }

        // Aplica o filtro de busca por termo
        if (search && search.trim() !== '') {
            query += ` AND (p.nome_razao_social LIKE ? OR p.cpf_cnpj LIKE ? OR t.area_atuacao LIKE ?)`;
            const searchTerm = `%${search.trim()}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        query += `
            GROUP BY t.id, p.id, p.nome_razao_social, p.cpf_cnpj, p.email, p.telefone, 
                     t.avaliacao_media, t.total_avaliacoes, t.area_atuacao, t.tipos_carga,
                     t.registro_nacional_transportador
            ORDER BY t.avaliacao_media DESC, t.total_avaliacoes DESC
        `;

        const [frotas] = await db.query(query, params);

        // 3. Verifica propostas pendentes para cada frota
        for (let frota of frotas) {
            const [propostaExistente] = await db.query(
                `SELECT id, status FROM propostas 
                 WHERE motorista_pessoa_id = ? 
                 AND transportador_id = ? 
                 AND status IN ('PENDENTE', 'MODIFICADA', 'EM_NEGOCIACAO')`,
                [userId, frota.id]
            );
            
            frota.proposta_pendente = propostaExistente.length > 0;
            frota.proposta_id = propostaExistente.length > 0 ? propostaExistente[0].id : null;
            frota.proposta_status = propostaExistente.length > 0 ? propostaExistente[0].status : null;
        }

        return res.json({ data: frotas });
    } catch (error) {
        console.error('Erro ao listar frotas disponíveis:', error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
// ============================================
// 10. BUSCAR INFORMAÇÕES DA FROTA DO VINCULADO
// ============================================
const getMinhaFrota = async (req, res) => {
    try {
        const userId = req.userId;

        // Buscar motorista vinculado
        const [motoristaRows] = await db.query(
            `SELECT mv.id, mv.transportador_id, mv.data_admissao, mv.status as situacao,
                    mv.cnh, mv.cnh_categoria
             FROM motoristas_vinculados mv
             WHERE mv.pessoa_id = ?`,
            [userId]
        );

        if (motoristaRows.length === 0) {
            return res.status(404).json({ error: 'Motorista vinculado não encontrado' });
        }

        const motorista = motoristaRows[0];

        // Buscar informações da frota
        const [frotaRows] = await db.query(
            `SELECT 
                t.id,
                p.id as pessoa_id,
                p.nome_razao_social,
                p.nome_fantasia,
                p.cpf_cnpj,
                p.email,
                p.telefone,
                p.celular,
                p.status as pessoa_status,
                t.avaliacao_media,
                t.total_avaliacoes,
                t.area_atuacao,
                t.tipos_carga,
                t.registro_nacional_transportador,
                t.inscricao_estadual,
                t.verificacao_documental,
                t.data_verificacao,
                (SELECT COUNT(*) FROM veiculos v WHERE v.transportador_id = t.id AND v.status = 'ATIVO') as total_veiculos_ativos,
                (SELECT COUNT(*) FROM motoristas_vinculados mv2 WHERE mv2.transportador_id = t.id AND mv2.status = 'ATIVO') as total_motoristas_ativos,
                (SELECT COUNT(*) FROM fretes f WHERE f.transportador_id = t.id AND f.status IN ('TRANSITO', 'ACEITO')) as fretes_ativos
            FROM transportadores t
            JOIN pessoas p ON t.pessoa_id = p.id
            WHERE t.id = ?`,
            [motorista.transportador_id]
        );

        if (frotaRows.length === 0) {
            return res.status(404).json({ error: 'Frota não encontrada' });
        }

        const frota = frotaRows[0];

        // Buscar veículo designado ao motorista
        const [veiculoRows] = await db.query(
            `SELECT 
                v.id,
                v.placa,
                v.modelo,
                v.marca,
                v.ano_fabricacao,
                v.ano_modelo,
                v.capacidade_kg,
                v.capacidade_m3,
                v.tipo_veiculo,
                v.status as veiculo_status
            FROM veiculos v
            WHERE v.motorista_vinculado_id = ?
            LIMIT 1`,
            [motorista.id]
        );

        const veiculo = veiculoRows.length > 0 ? veiculoRows[0] : null;

        // Buscar contrato ativo
        const [contratoRows] = await db.query(
            `SELECT 
                c.id,
                c.tipo_contrato,
                c.valor_salario,
                c.valor_comissao,
                c.valor_adiantamento,
                c.data_inicio,
                c.data_fim,
                c.status as contrato_status,
                c.periodo_experiencia,
                c.beneficios
            FROM contratos c
            WHERE c.motorista_vinculado_id = ?
              AND c.status IN ('ATIVO', 'EM_EXPERIENCIA')
            ORDER BY c.data_inicio DESC
            LIMIT 1`,
            [motorista.id]
        );

        const contrato = contratoRows.length > 0 ? contratoRows[0] : null;

        // Verificar se há fretes em andamento
        const [fretesEmAndamento] = await db.query(
            `SELECT COUNT(*) as total
             FROM fretes f
             JOIN veiculos v ON f.veiculo_id = v.id
             WHERE v.motorista_vinculado_id = ?
               AND f.status IN ('ACEITO', 'TRANSITO')`,
            [motorista.id]
        );

        const temFreteEmAndamento = fretesEmAndamento[0].total > 0;

        return res.json({
            motorista: {
                id: motorista.id,
                data_admissao: motorista.data_admissao,
                situacao: motorista.situacao,
                cnh: motorista.cnh,
                cnh_categoria: motorista.cnh_categoria
            },
            frota: frota,
            veiculo: veiculo,
            contrato: contrato,
            tem_frete_em_andamento: temFreteEmAndamento
        });

    } catch (error) {
        console.error('Erro ao buscar informações da frota:', error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

// ============================================
// 11. FINALIZAR VÍNCULO COM A FROTA
// ============================================
const finalizarVinculo = async (req, res) => {
    try {
        const userId = req.userId;
        const { motivo } = req.body;

        // Buscar motorista vinculado
        const [motoristaRows] = await db.query(
            `SELECT mv.id, mv.transportador_id, mv.status as situacao
             FROM motoristas_vinculados mv
             WHERE mv.pessoa_id = ?`,
            [userId]
        );

        if (motoristaRows.length === 0) {
            return res.status(404).json({ error: 'Motorista vinculado não encontrado' });
        }

        const motorista = motoristaRows[0];

        // Verificar se já está desligado
        if (motorista.situacao === 'DESLIGADO') {
            return res.status(400).json({ error: 'Vínculo já foi finalizado' });
        }

        // Verificar se há fretes em andamento
        const [fretesEmAndamento] = await db.query(
            `SELECT COUNT(*) as total
             FROM fretes f
             JOIN veiculos v ON f.veiculo_id = v.id
             WHERE v.motorista_vinculado_id = ?
               AND f.status IN ('ACEITO', 'TRANSITO')`,
            [motorista.id]
        );

        if (fretesEmAndamento[0].total > 0) {
            return res.status(400).json({
                error: 'Não é possível finalizar o vínculo pois você possui fretes em andamento'
            });
        }

        // Iniciar transação
        await db.query('START TRANSACTION');

        // Atualizar status do motorista vinculado
        await db.query(
            `UPDATE motoristas_vinculados 
             SET status = 'DESLIGADO', 
                 data_demissao = NOW() 
             WHERE id = ?`,
            [motorista.id]
        );

        // Atualizar pessoa para não motorista
        await db.query(
            `UPDATE pessoas 
             SET tipo_vinculo_motorista = 'NAO_MOTORISTA',
                 data_desvinculo = NOW()
             WHERE id = ?`,
            [userId]
        );

        // Remover vínculo do veículo (se tiver)
        await db.query(
            `UPDATE veiculos 
             SET motorista_vinculado_id = NULL 
             WHERE motorista_vinculado_id = ?`,
            [motorista.id]
        );

        // Atualizar contratos ativos para encerrados
        await db.query(
            `UPDATE contratos 
             SET status = 'ENCERRADO',
                 data_fim = NOW(),
                 motivo_encerramento = ?
             WHERE motorista_vinculado_id = ?
               AND status IN ('ATIVO', 'EM_EXPERIENCIA')`,
            [motivo || 'Finalizado pelo motorista', motorista.id]
        );

        // Registrar no histórico de vínculos
        await db.query(
            `INSERT INTO historico_vinculos 
             (motorista_vinculado_id, transportador_id, acao, observacoes, data_acao, criado_por)
             VALUES (?, ?, 'DESVINCULACAO', ?, NOW(), ?)`,
            [motorista.id, motorista.transportador_id, motivo || 'Finalizado pelo motorista', userId]
        );

        await db.query('COMMIT');

        return res.json({
            message: 'Vínculo finalizado com sucesso',
            motorista_id: motorista.id
        });

    } catch (error) {
        await db.query('ROLLBACK');
        console.error('Erro ao finalizar vínculo:', error);
        return res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

module.exports = {
    listarMeusFretes,
    atualizarStatusFrete,
    getPerfil,
    getResumo,
    buscarFrete,
    listarFretesParaAtualizar,
    listarFretesEmAndamento,
    listarEntregasRealizadas,
    listarFrotasDisponiveis,
    getMinhaFrota,        
    finalizarVinculo  
};