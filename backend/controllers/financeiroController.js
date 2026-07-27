// controllers/financeiroController.js
const db = require('../config/database');

// ============================================
// FUNÇÃO AUXILIAR: Buscar IDs do usuário
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

    // Buscar motorista_vinculado (para saber se é vinculado)
    const [motoristaRows] = await db.query(
        'SELECT id, transportador_id FROM motoristas_vinculados WHERE pessoa_id = ?',
        [userId]
    );

    let motoristaId = null;
    let transportadorIdVinculado = null;
    if (motoristaRows.length > 0) {
        motoristaId = motoristaRows[0].id;
        transportadorIdVinculado = motoristaRows[0].transportador_id;
    }

    return {
        embarcadorId: embarcadorRows.length > 0 ? embarcadorRows[0].id : null,
        transportadorId: transportadorRows.length > 0 ? transportadorRows[0].id : null,
        motoristaId: motoristaId,
        transportadorIdVinculado: transportadorIdVinculado,
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

        console.log('Resumo financeiro - Usuario:', userId);
        console.log('IDs encontrados:', ids);

        let resultado = {
            total: 0,
            totalTransacoes: 0,
            media: 0,
            aReceber: 0,
            aPagar: 0
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
            // VINCULADO: Usar o transportador_id da frota que ele está vinculado
            const [rows] = await db.query(`
                SELECT 
                    COUNT(*) AS totalTransacoes,
                    COALESCE(SUM(valor_fechado), 0) AS total,
                    COALESCE(AVG(valor_fechado), 0) AS media,
                    COALESCE(SUM(CASE WHEN status IN ('ACEITO', 'TRANSITO') THEN valor_fechado ELSE 0 END), 0) AS aReceber
                FROM fretes
                WHERE transportador_id = ? AND status IN ('ACEITO', 'TRANSITO', 'CONCLUIDO')
            `, [ids.transportadorIdVinculado]);

            resultado = { ...rows[0], ...resultado };
            resultado.isMotorista = true;
            resultado.frotaId = ids.transportadorIdVinculado;
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
        const { periodo } = req.query;

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
            // VINCULADO: Transações da frota (transportador_id)
            const [rows] = await db.query(`
                SELECT 
                    f.id AS id,
                    'ENTRADA' AS tipo,
                    f.valor_fechado AS valor,
                    f.data_publicacao AS data,
                    CONCAT('Frete #', f.id) AS descricao,
                    f.status,
                    'VINCULADO' AS perfil
                FROM fretes f
                WHERE f.transportador_id = ? 
                AND f.status IN ('CONCLUIDO', 'ACEITO', 'TRANSITO')
                AND f.data_publicacao >= ${dataLimite}
                ORDER BY f.data_publicacao DESC
                LIMIT 50
            `, [ids.transportadorIdVinculado]);
            transacoes = rows;
        }

        res.json({ data: transacoes });
    } catch (error) {
        console.error('Erro ao buscar transações:', error);
        res.status(500).json({ error: 'Erro ao buscar transações' });
    }
};

// ============================================
// 3. GET EXTRATO
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
            // VINCULADO: Extrato da frota
            const [rows] = await db.query(`
                SELECT 
                    f.id AS id,
                    'ENTRADA' AS tipo,
                    f.valor_fechado AS valor,
                    f.data_publicacao AS data,
                    CONCAT('Frete #', f.id) AS descricao,
                    f.status,
                    'VINCULADO' AS perfil
                FROM fretes f
                WHERE f.transportador_id = ? 
                AND f.status IN ('CONCLUIDO', 'ACEITO', 'TRANSITO')
                ORDER BY f.data_publicacao DESC
                LIMIT 100
            `, [ids.transportadorIdVinculado]);
            extrato = rows;
        }

        res.json({ data: extrato });
    } catch (error) {
        console.error('Erro ao buscar extrato:', error);
        res.status(500).json({ error: 'Erro ao buscar extrato' });
    }
};

// ============================================
// 4. GET SALDO
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
            // VINCULADO: Saldo da frota
            const [rows] = await db.query(`
                SELECT 
                    COALESCE(SUM(CASE WHEN status = 'CONCLUIDO' THEN valor_fechado ELSE 0 END), 0) AS recebido,
                    COALESCE(SUM(CASE WHEN status IN ('ACEITO', 'TRANSITO') THEN valor_fechado ELSE 0 END), 0) AS aReceber
                FROM fretes
                WHERE transportador_id = ?
            `, [ids.transportadorIdVinculado]);
            saldo = { disponivel: rows[0].recebido, aReceber: rows[0].aReceber };
        }

        res.json(saldo);
    } catch (error) {
        console.error('Erro ao buscar saldo:', error);
        res.status(500).json({ error: 'Erro ao buscar saldo' });
    }
};

// ============================================
// 5. SOLICITAR SAQUE (APENAS TRANSPORTADORES)
// ============================================

const solicitarSaque = async (req, res) => {
    try {
        const userId = req.userId;
        const { valor } = req.body;

        console.log('Solicitando saque:', { userId, valor });

        // Validar valor
        if (!valor || valor <= 0) {
            return res.status(400).json({ error: 'Valor inválido para saque' });
        }

        // Buscar transportador_id
        const [transportadorRows] = await db.query(
            'SELECT id FROM transportadores WHERE pessoa_id = ?',
            [userId]
        );

        if (transportadorRows.length === 0) {
            return res.status(404).json({ error: 'Transportador não encontrado' });
        }

        const transportadorId = transportadorRows[0].id;

        // Verificar saldo disponível (total recebido - total já sacado)
        const [saldoRows] = await db.query(`
            SELECT 
                COALESCE(SUM(CASE 
                    WHEN f.status = 'CONCLUIDO' THEN f.valor_fechado 
                    ELSE 0 
                END), 0) - 
                COALESCE(SUM(CASE 
                    WHEN t.tipo_transacao = 'ESTORNO' AND t.status IN ('PENDENTE', 'CONCLUIDO') THEN t.valor 
                    ELSE 0 
                END), 0) 
                AS disponivel
            FROM fretes f
            LEFT JOIN transacoes_financeiras t ON f.id = t.frete_id
            WHERE f.transportador_id = ?
        `, [transportadorId]);

        const saldoDisponivel = parseFloat(saldoRows[0]?.disponivel || 0);

        console.log('Saldo disponível:', saldoDisponivel);

        if (saldoDisponivel < valor) {
            return res.status(400).json({ error: 'Saldo insuficiente' });
        }

        // Verificar se tem dados bancários cadastrados
        const [dadosBancariosRows] = await db.query(
            'SELECT id FROM dados_bancarios WHERE pessoa_id = ?',
            [userId]
        );

        if (dadosBancariosRows.length === 0) {
            return res.status(400).json({ error: 'Cadastre seus dados bancários antes de solicitar um saque' });
        }

        // Criar transação de saque (usando ESTORNO como saque)
        const [result] = await db.query(`
            INSERT INTO transacoes_financeiras 
            (transportador_id, tipo_transacao, valor, status, metodo_pagamento) 
            VALUES (?, 'ESTORNO', ?, 'PENDENTE', 'PIX')
        `, [transportadorId, valor]);

        console.log('Saque solicitado com ID:', result.insertId);

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
// EXPORTAÇÃO
// ============================================

module.exports = { 
    getResumo, 
    getTransacoes, 
    getExtrato, 
    getSaldo,
    solicitarSaque
};