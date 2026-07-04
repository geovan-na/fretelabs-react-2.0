// controllers/financeiroController.js
const db = require('../config/database');

// ============================================
// FUNÇÃO AUXILIAR: Buscar ID do usuário
// ============================================

const getIds = async (userId) => {
    // Buscar embarcador_id
    const [embarcadorRows] = await db.query(
        'SELECT id FROM embarcadores WHERE pessoa_id = ?',
        [userId]
    );

    // Buscar transportador_id
    const [transportadorRows] = await db.query(
        'SELECT id FROM transportadores WHERE pessoa_id = ?',
        [userId]
    );

    // Buscar motorista_vinculado_id
    const [motoristaRows] = await db.query(
        'SELECT id FROM motoristas_vinculados WHERE pessoa_id = ?',
        [userId]
    );

    return {
        embarcadorId: embarcadorRows.length > 0 ? embarcadorRows[0].id : null,
        transportadorId: transportadorRows.length > 0 ? transportadorRows[0].id : null,
        motoristaId: motoristaRows.length > 0 ? motoristaRows[0].id : null,
        isEmbarcador: embarcadorRows.length > 0,
        isTransportador: transportadorRows.length > 0,
        isMotorista: motoristaRows.length > 0
    };
};

// ============================================
// 1. GET RESUMO FINANCEIRO
// ============================================

const getResumo = async (req, res) => {
    try {
        const userId = req.userId;
        const ids = await getIds(userId);

        let resultado = {
            total: 0,
            totalTransacoes: 0,
            media: 0,
            aReceber: 0,
            aPagar: 0,
            transacoes: []
        };

        if (ids.isEmbarcador) {
            // EMBARCADOR: Gastos com fretes
            const [rows] = await db.query(`
                SELECT 
                    COUNT(*) AS totalTransacoes,
                    COALESCE(SUM(valor_fechado), 0) AS total,
                    COALESCE(AVG(valor_fechado), 0) AS media,
                    COALESCE(SUM(CASE WHEN status IN ('ACEITO', 'TRANSITO') THEN valor_fechado ELSE 0 END), 0) AS aPagar
                FROM fretes
                WHERE embarcador_id = ? AND status IN ('ACEITO', 'TRANSITO', 'CONCLUIDO')
            `, [ids.embarcadorId]);

            resultado = { ...rows[0], ...resultado };
            resultado.isEmbarcador = true;

        } else if (ids.isTransportador) {
            // TRANSPORTADOR (FROTA/AUTÔNOMO): Ganhos com fretes
            const [rows] = await db.query(`
                SELECT 
                    COUNT(*) AS totalTransacoes,
                    COALESCE(SUM(valor_fechado), 0) AS total,
                    COALESCE(AVG(valor_fechado), 0) AS media,
                    COALESCE(SUM(CASE WHEN status IN ('ACEITO', 'TRANSITO') THEN valor_fechado ELSE 0 END), 0) AS aReceber
                FROM fretes
                WHERE transportador_id = ? AND status IN ('ACEITO', 'TRANSITO', 'CONCLUIDO')
            `, [ids.transportadorId]);

            resultado = { ...rows[0], ...resultado };
            resultado.isTransportador = true;

        } else if (ids.isMotorista) {
            // MOTORISTA VINCULADO: Ganhos como motorista
            const [rows] = await db.query(`
                SELECT 
                    COUNT(*) AS totalTransacoes,
                    COALESCE(SUM(valor), 0) AS total,
                    COALESCE(AVG(valor), 0) AS media,
                    COALESCE(SUM(CASE WHEN status = 'PENDENTE' THEN valor ELSE 0 END), 0) AS aReceber
                FROM transacoes_financeiras
                WHERE motorista_vinculado_id = ?
            `, [ids.motoristaId]);

            resultado = { ...rows[0], ...resultado };
            resultado.isMotorista = true;
        }

        res.json(resultado);
    } catch (error) {
        console.error('Erro ao buscar resumo financeiro:', error);
        res.status(500).json({ error: 'Erro ao buscar resumo financeiro' });
    }
};

// ============================================
// 2. GET TRANSAÇÕES
// ============================================

const getTransacoes = async (req, res) => {
    try {
        const userId = req.userId;
        const ids = await getIds(userId);
        const { periodo } = req.query; // 'MES', 'TRIMESTRE', 'ANO'

        // Definir período
        let dataLimite = '';
        if (periodo === 'MES') {
            dataLimite = "DATE_SUB(NOW(), INTERVAL 30 DAY)";
        } else if (periodo === 'TRIMESTRE') {
            dataLimite = "DATE_SUB(NOW(), INTERVAL 90 DAY)";
        } else if (periodo === 'ANO') {
            dataLimite = "DATE_SUB(NOW(), INTERVAL 365 DAY)";
        } else {
            dataLimite = "DATE_SUB(NOW(), INTERVAL 30 DAY)";
        }

        let transacoes = [];

        if (ids.isEmbarcador) {
            // EMBARCADOR: Pagamentos realizados (saídas)
            const [rows] = await db.query(`
                SELECT 
                    f.id AS id,
                    'SAIDA' AS tipo,
                    f.valor_fechado AS valor,
                    f.data_publicacao AS data,
                    CONCAT('Frete #', f.id, ' - ', p.nome_razao_social) AS descricao,
                    f.status,
                    'EMBARCADOR' AS perfil
                FROM fretes f
                JOIN transportadores t ON f.transportador_id = t.id
                JOIN pessoas p ON t.pessoa_id = p.id
                WHERE f.embarcador_id = ? 
                AND f.status IN ('CONCLUIDO', 'ACEITO', 'TRANSITO')
                AND f.data_publicacao >= ${dataLimite}
                ORDER BY f.data_publicacao DESC
                LIMIT 50
            `, [ids.embarcadorId]);
            transacoes = rows;

        } else if (ids.isTransportador) {
            // TRANSPORTADOR (FROTA/AUTÔNOMO): Recebimentos (entradas)
            const [rows] = await db.query(`
                SELECT 
                    f.id AS id,
                    'ENTRADA' AS tipo,
                    f.valor_fechado AS valor,
                    f.data_publicacao AS data,
                    CONCAT('Frete #', f.id, ' - ', p.nome_razao_social) AS descricao,
                    f.status,
                    'TRANSPORTADOR' AS perfil
                FROM fretes f
                JOIN embarcadores e ON f.embarcador_id = e.id
                JOIN pessoas p ON e.pessoa_id = p.id
                WHERE f.transportador_id = ? 
                AND f.status IN ('CONCLUIDO', 'ACEITO', 'TRANSITO')
                AND f.data_publicacao >= ${dataLimite}
                ORDER BY f.data_publicacao DESC
                LIMIT 50
            `, [ids.transportadorId]);
            transacoes = rows;

        } else if (ids.isMotorista) {
            // MOTORISTA VINCULADO: Pagamentos recebidos
            const [rows] = await db.query(`
                SELECT 
                    id,
                    'ENTRADA' AS tipo,
                    valor,
                    data_solicitacao AS data,
                    CONCAT('Pagamento frete #', frete_id) AS descricao,
                    status,
                    'MOTORISTA' AS perfil
                FROM transacoes_financeiras
                WHERE motorista_vinculado_id = ?
                AND data_solicitacao >= ${dataLimite}
                ORDER BY data_solicitacao DESC
                LIMIT 50
            `, [ids.motoristaId]);
            transacoes = rows;
        }

        res.json({ data: transacoes });
    } catch (error) {
        console.error('Erro ao buscar transações:', error);
        res.status(500).json({ error: 'Erro ao buscar transações' });
    }
};

// ============================================
// 3. GET EXTRATO COMPLETO
// ============================================

const getExtrato = async (req, res) => {
    try {
        const userId = req.userId;
        const ids = await getIds(userId);

        let extrato = [];

        if (ids.isEmbarcador) {
            const [rows] = await db.query(`
                SELECT 
                    f.id AS id,
                    'SAIDA' AS tipo,
                    f.valor_fechado AS valor,
                    f.data_publicacao AS data,
                    CONCAT('Frete #', f.id, ' - ', p.nome_razao_social) AS descricao,
                    f.status,
                    'EMBARCADOR' AS perfil
                FROM fretes f
                JOIN transportadores t ON f.transportador_id = t.id
                JOIN pessoas p ON t.pessoa_id = p.id
                WHERE f.embarcador_id = ? 
                AND f.status IN ('CONCLUIDO', 'ACEITO', 'TRANSITO')
                ORDER BY f.data_publicacao DESC
                LIMIT 100
            `, [ids.embarcadorId]);
            extrato = rows;

        } else if (ids.isTransportador) {
            const [rows] = await db.query(`
                SELECT 
                    f.id AS id,
                    'ENTRADA' AS tipo,
                    f.valor_fechado AS valor,
                    f.data_publicacao AS data,
                    CONCAT('Frete #', f.id, ' - ', p.nome_razao_social) AS descricao,
                    f.status,
                    'TRANSPORTADOR' AS perfil
                FROM fretes f
                JOIN embarcadores e ON f.embarcador_id = e.id
                JOIN pessoas p ON e.pessoa_id = p.id
                WHERE f.transportador_id = ? 
                AND f.status IN ('CONCLUIDO', 'ACEITO', 'TRANSITO')
                ORDER BY f.data_publicacao DESC
                LIMIT 100
            `, [ids.transportadorId]);
            extrato = rows;

        } else if (ids.isMotorista) {
            const [rows] = await db.query(`
                SELECT 
                    id,
                    'ENTRADA' AS tipo,
                    valor,
                    data_solicitacao AS data,
                    CONCAT('Pagamento frete #', frete_id) AS descricao,
                    status,
                    'MOTORISTA' AS perfil
                FROM transacoes_financeiras
                WHERE motorista_vinculado_id = ?
                ORDER BY data_solicitacao DESC
                LIMIT 100
            `, [ids.motoristaId]);
            extrato = rows;
        }

        res.json({ data: extrato });
    } catch (error) {
        console.error('Erro ao buscar extrato:', error);
        res.status(500).json({ error: 'Erro ao buscar extrato' });
    }
};

// ============================================
// 4. SOLICITAR SAQUE (APENAS TRANSPORTADORES)
// ============================================

const solicitarSaque = async (req, res) => {
    try {
        const userId = req.userId;
        const { valor, dados_bancarios_id } = req.body;

        // Verificar se o usuário é transportador
        const [transportadorRows] = await db.query(
            'SELECT id FROM transportadores WHERE pessoa_id = ?',
            [userId]
        );

        if (transportadorRows.length === 0) {
            return res.status(403).json({ 
                error: 'Apenas transportadores podem solicitar saque' 
            });
        }

        const transportadorId = transportadorRows[0].id;

        // Verificar saldo disponível
        const [saldo] = await db.query(`
            SELECT COALESCE(SUM(valor_fechado), 0) AS disponivel
            FROM fretes
            WHERE transportador_id = ? AND status = 'CONCLUIDO'
        `, [transportadorId]);

        if (saldo[0].disponivel < valor) {
            return res.status(400).json({ error: 'Saldo insuficiente' });
        }

        // Verificar dados bancários
        const [dadosBancarios] = await db.query(
            'SELECT id FROM dados_bancarios WHERE id = ? AND pessoa_id = ?',
            [dados_bancarios_id, userId]
        );

        if (dadosBancarios.length === 0) {
            return res.status(404).json({ 
                error: 'Dados bancários não encontrados' 
            });
        }

        // Criar transação de saque
        const [result] = await db.query(`
            INSERT INTO transacoes_financeiras 
            (transportador_id, tipo_transacao, valor, status, metodo_pagamento, dados_bancarios_id) 
            VALUES (?, 'PAGAMENTO_MOTORISTA', ?, 'PENDENTE', 'PIX', ?)
        `, [transportadorId, valor, dados_bancarios_id]);

        res.status(201).json({ 
            message: 'Saque solicitado com sucesso', 
            id: result.insertId 
        });
    } catch (error) {
        console.error('Erro ao solicitar saque:', error);
        res.status(500).json({ error: 'Erro ao solicitar saque' });
    }
};

// ============================================
// 5. GET SALDO
// ============================================

const getSaldo = async (req, res) => {
    try {
        const userId = req.userId;
        const ids = await getIds(userId);

        let saldo = { disponivel: 0, aReceber: 0, aPagar: 0 };

        if (ids.isEmbarcador) {
            const [rows] = await db.query(`
                SELECT 
                    COALESCE(SUM(CASE WHEN status = 'CONCLUIDO' THEN valor_fechado ELSE 0 END), 0) AS totalPago,
                    COALESCE(SUM(CASE WHEN status IN ('ACEITO', 'TRANSITO') THEN valor_fechado ELSE 0 END), 0) AS aPagar
                FROM fretes
                WHERE embarcador_id = ?
            `, [ids.embarcadorId]);
            saldo = { disponivel: 0, aPagar: rows[0].aPagar };

        } else if (ids.isTransportador) {
            const [rows] = await db.query(`
                SELECT 
                    COALESCE(SUM(CASE WHEN status = 'CONCLUIDO' THEN valor_fechado ELSE 0 END), 0) AS recebido,
                    COALESCE(SUM(CASE WHEN status IN ('ACEITO', 'TRANSITO') THEN valor_fechado ELSE 0 END), 0) AS aReceber
                FROM fretes
                WHERE transportador_id = ?
            `, [ids.transportadorId]);
            saldo = { disponivel: rows[0].recebido, aReceber: rows[0].aReceber };

        } else if (ids.isMotorista) {
            const [rows] = await db.query(`
                SELECT 
                    COALESCE(SUM(CASE WHEN status = 'CONCLUIDO' THEN valor ELSE 0 END), 0) AS recebido,
                    COALESCE(SUM(CASE WHEN status = 'PENDENTE' THEN valor ELSE 0 END), 0) AS aReceber
                FROM transacoes_financeiras
                WHERE motorista_vinculado_id = ?
            `, [ids.motoristaId]);
            saldo = { disponivel: rows[0].recebido, aReceber: rows[0].aReceber };
        }

        res.json(saldo);
    } catch (error) {
        console.error('Erro ao buscar saldo:', error);
        res.status(500).json({ error: 'Erro ao buscar saldo' });
    }
};

// ============================================
// EXPORTAÇÃO
// ============================================

module.exports = { 
    getResumo, 
    getTransacoes, 
    getExtrato, 
    solicitarSaque,
    getSaldo
};