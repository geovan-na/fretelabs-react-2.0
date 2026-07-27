// controllers/pagamentoController.js
const db = require('../config/database');

// ============================================
// FUNÇÃO AUXILIAR: Verificar se usuário é frota
// ============================================
const getTransportadorId = async (userId) => {
    const [rows] = await db.query(
        'SELECT id FROM transportadores WHERE pessoa_id = ? AND tipo_transportador = "FROTA"',
        [userId]
    );
    return rows.length > 0 ? rows[0].id : null;
};

// ============================================
// FUNÇÃO AUXILIAR: Verificar se usuário é motorista vinculado
// ============================================
const getMotoristaVinculadoId = async (userId) => {
    const [rows] = await db.query(
        'SELECT id FROM motoristas_vinculados WHERE pessoa_id = ?',
        [userId]
    );
    return rows.length > 0 ? rows[0].id : null;
};

// ============================================
// 1. CRIAR PAGAMENTO
// ============================================
const criarPagamento = async (req, res) => {
    try {
        const userId = req.userId;
        const { 
            motorista_vinculado_id,
            tipo,
            valor_bruto,
            valor_descontos = 0,
            mes_referencia,
            data_vencimento,
            observacoes,
            frete_id,
            data_inicio_periodo,
            data_fim_periodo
        } = req.body;

        const transportadorId = await getTransportadorId(userId);

        if (!transportadorId) {
            return res.status(403).json({ 
                error: 'Apenas frotas podem criar pagamentos' 
            });
        }

        // Verificar se o motorista pertence à frota
        const [motorista] = await db.query(
            'SELECT * FROM motoristas_vinculados WHERE id = ? AND transportador_id = ?',
            [motorista_vinculado_id, transportadorId]
        );

        if (motorista.length === 0) {
            return res.status(404).json({ 
                error: 'Motorista não encontrado ou não pertence a esta frota' 
            });
        }

        // Verificar se motorista está ativo
        if (motorista[0].status !== 'ATIVO') {
            return res.status(400).json({ 
                error: 'Motorista não está ativo' 
            });
        }

        // Verificar se já existe pagamento para esta referência
        if (mes_referencia && tipo === 'SALARIO') {
            const [existente] = await db.query(
                'SELECT id FROM pagamentos_motoristas WHERE motorista_vinculado_id = ? AND mes_referencia = ? AND tipo = "SALARIO"',
                [motorista_vinculado_id, mes_referencia]
            );

            if (existente.length > 0) {
                return res.status(400).json({ 
                    error: 'Já existe um pagamento de salário para este mês' 
                });
            }
        }

        // Calcular valor líquido
        const valor_liquido = parseFloat(valor_bruto) - parseFloat(valor_descontos);

        // Criar pagamento
        const [result] = await db.query(
            `INSERT INTO pagamentos_motoristas (
                motorista_vinculado_id,
                contrato_id,
                frete_id,
                tipo,
                valor_bruto,
                valor_descontos,
                valor_liquido,
                mes_referencia,
                data_vencimento,
                data_inicio_periodo,
                data_fim_periodo,
                observacoes,
                status,
                criado_por
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDENTE', ?)`,
            [
                motorista_vinculado_id,
                motorista[0].contrato_id || null,
                frete_id || null,
                tipo,
                valor_bruto,
                valor_descontos,
                valor_liquido,
                mes_referencia || null,
                data_vencimento,
                data_inicio_periodo || null,
                data_fim_periodo || null,
                observacoes || null,
                userId
            ]
        );

        // Buscar pagamento criado
        const [pagamento] = await db.query(
            `SELECT p.*, 
                    pm.nome_razao_social as motorista_nome,
                    pf.nome_razao_social as frota_nome
             FROM pagamentos_motoristas p
             JOIN motoristas_vinculados mv ON p.motorista_vinculado_id = mv.id
             JOIN pessoas pm ON mv.pessoa_id = pm.id
             JOIN pessoas pf ON pf.id = (SELECT pessoa_id FROM transportadores WHERE id = mv.transportador_id)
             WHERE p.id = ?`,
            [result.insertId]
        );

        res.status(201).json({
            message: 'Pagamento criado com sucesso',
            pagamento: pagamento[0]
        });

    } catch (error) {
        console.error('Erro ao criar pagamento:', error);
        res.status(500).json({ error: 'Erro ao criar pagamento' });
    }
};

// ============================================
// 2. LISTAR PAGAMENTOS DA FROTA
// ============================================
const listarPagamentosFrota = async (req, res) => {
    try {
        const userId = req.userId;
        const { status, motorista_id, mes_referencia } = req.query;

        const transportadorId = await getTransportadorId(userId);

        if (!transportadorId) {
            return res.status(403).json({ 
                error: 'Apenas frotas podem listar pagamentos' 
            });
        }

        let query = `
            SELECT p.*, 
                   pm.nome_razao_social as motorista_nome,
                   pf.nome_razao_social as frota_nome,
                   mv.cnh,
                   mv.cnh_categoria
            FROM pagamentos_motoristas p
            JOIN motoristas_vinculados mv ON p.motorista_vinculado_id = mv.id
            JOIN pessoas pm ON mv.pessoa_id = pm.id
            JOIN pessoas pf ON pf.id = (SELECT pessoa_id FROM transportadores WHERE id = mv.transportador_id)
            WHERE mv.transportador_id = ?
        `;

        const params = [transportadorId];

        if (status) {
            query += ` AND p.status = ?`;
            params.push(status);
        }

        if (motorista_id) {
            query += ` AND p.motorista_vinculado_id = ?`;
            params.push(motorista_id);
        }

        if (mes_referencia) {
            query += ` AND p.mes_referencia = ?`;
            params.push(mes_referencia);
        }

        query += ` ORDER BY p.data_vencimento DESC`;

        const [rows] = await db.query(query, params);
        res.json({ data: rows });

    } catch (error) {
        console.error('Erro ao listar pagamentos da frota:', error);
        res.status(500).json({ error: 'Erro ao listar pagamentos' });
    }
};

// ============================================
// 3. LISTAR PAGAMENTOS DO MOTORISTA
// ============================================
const listarPagamentosMotorista = async (req, res) => {
    try {
        const userId = req.userId;
        const { status } = req.query;

        const motoristaId = await getMotoristaVinculadoId(userId);

        if (!motoristaId) {
            return res.status(403).json({ 
                error: 'Apenas motoristas vinculados podem ver seus pagamentos' 
            });
        }

        let query = `
            SELECT p.*, 
                   pm.nome_razao_social as motorista_nome,
                   pf.nome_razao_social as frota_nome
            FROM pagamentos_motoristas p
            JOIN motoristas_vinculados mv ON p.motorista_vinculado_id = mv.id
            JOIN pessoas pm ON mv.pessoa_id = pm.id
            JOIN pessoas pf ON pf.id = (SELECT pessoa_id FROM transportadores WHERE id = mv.transportador_id)
            WHERE p.motorista_vinculado_id = ?
        `;

        const params = [motoristaId];

        if (status) {
            query += ` AND p.status = ?`;
            params.push(status);
        }

        query += ` ORDER BY p.data_vencimento DESC`;

        const [rows] = await db.query(query, params);
        res.json({ data: rows });

    } catch (error) {
        console.error('Erro ao listar pagamentos do motorista:', error);
        res.status(500).json({ error: 'Erro ao listar pagamentos' });
    }
};

// ============================================
// 4. BUSCAR PAGAMENTO ESPECÍFICO
// ============================================
const buscarPagamento = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const [rows] = await db.query(
            `SELECT p.*, 
                    pm.nome_razao_social as motorista_nome,
                    pf.nome_razao_social as frota_nome,
                    mv.cnh,
                    mv.cnh_categoria
             FROM pagamentos_motoristas p
             JOIN motoristas_vinculados mv ON p.motorista_vinculado_id = mv.id
             JOIN pessoas pm ON mv.pessoa_id = pm.id
             JOIN pessoas pf ON pf.id = (SELECT pessoa_id FROM transportadores WHERE id = mv.transportador_id)
             WHERE p.id = ?`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Pagamento não encontrado' });
        }

        // Verificar permissão
        const pagamento = rows[0];
        const transportadorId = await getTransportadorId(userId);
        const motoristaId = await getMotoristaVinculadoId(userId);

        if (pagamento.transportador_id !== transportadorId && 
            pagamento.motorista_vinculado_id !== motoristaId) {
            return res.status(403).json({ 
                error: 'Você não tem permissão para ver este pagamento' 
            });
        }

        res.json({ data: rows[0] });

    } catch (error) {
        console.error('Erro ao buscar pagamento:', error);
        res.status(500).json({ error: 'Erro ao buscar pagamento' });
    }
};

// ============================================
// 5. MARCAR PAGAMENTO COMO PAGO
// ============================================
const marcarPagamentoPago = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const { comprovante_id } = req.body;

        const transportadorId = await getTransportadorId(userId);

        if (!transportadorId) {
            return res.status(403).json({ 
                error: 'Apenas frotas podem marcar pagamentos como pagos' 
            });
        }

        // Verificar se o pagamento existe e pertence à frota
        const [pagamentoRows] = await db.query(
            `SELECT p.*, mv.transportador_id 
             FROM pagamentos_motoristas p
             JOIN motoristas_vinculados mv ON p.motorista_vinculado_id = mv.id
             WHERE p.id = ? AND mv.transportador_id = ?`,
            [id, transportadorId]
        );

        if (pagamentoRows.length === 0) {
            return res.status(404).json({ 
                error: 'Pagamento não encontrado ou não pertence a esta frota' 
            });
        }

        if (pagamentoRows[0].status === 'PAGO') {
            return res.status(400).json({ 
                error: 'Este pagamento já foi marcado como pago' 
            });
        }

        // Marcar como pago
        await db.query(
            `UPDATE pagamentos_motoristas 
             SET status = 'PAGO', 
                 data_pagamento = NOW(),
                 comprovante_id = ?
             WHERE id = ?`,
            [comprovante_id || null, id]
        );

        res.json({
            message: 'Pagamento marcado como pago com sucesso',
            id: parseInt(id)
        });

    } catch (error) {
        console.error('Erro ao marcar pagamento como pago:', error);
        res.status(500).json({ error: 'Erro ao marcar pagamento como pago' });
    }
};

// ============================================
// 6. CANCELAR PAGAMENTO
// ============================================
const cancelarPagamento = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const { motivo } = req.body;

        const transportadorId = await getTransportadorId(userId);

        if (!transportadorId) {
            return res.status(403).json({ 
                error: 'Apenas frotas podem cancelar pagamentos' 
            });
        }

        // Verificar se o pagamento existe e pertence à frota
        const [pagamentoRows] = await db.query(
            `SELECT p.*, mv.transportador_id 
             FROM pagamentos_motoristas p
             JOIN motoristas_vinculados mv ON p.motorista_vinculado_id = mv.id
             WHERE p.id = ? AND mv.transportador_id = ?`,
            [id, transportadorId]
        );

        if (pagamentoRows.length === 0) {
            return res.status(404).json({ 
                error: 'Pagamento não encontrado ou não pertence a esta frota' 
            });
        }

        if (pagamentoRows[0].status === 'PAGO') {
            return res.status(400).json({ 
                error: 'Pagamentos já pagos não podem ser cancelados' 
            });
        }

        // Cancelar pagamento
        await db.query(
            `UPDATE pagamentos_motoristas 
             SET status = 'CANCELADO',
                 observacoes = CONCAT(COALESCE(observacoes, ''), '\nCancelado em ', NOW(), ': ', ?)
             WHERE id = ?`,
            [motivo || 'Cancelado pela frota', id]
        );

        res.json({
            message: 'Pagamento cancelado com sucesso',
            id: parseInt(id)
        });

    } catch (error) {
        console.error('Erro ao cancelar pagamento:', error);
        res.status(500).json({ error: 'Erro ao cancelar pagamento' });
    }
};

// ============================================
// 7. RESUMO DE PAGAMENTOS (Dashboard)
// ============================================
const resumoPagamentos = async (req, res) => {
    try {
        const userId = req.userId;

        const transportadorId = await getTransportadorId(userId);
        const motoristaId = await getMotoristaVinculadoId(userId);

        let query = '';
        const params = [];

        if (transportadorId) {
            // Resumo da frota
            query = `
                SELECT 
                    COUNT(*) as total_pagamentos,
                    SUM(CASE WHEN status = 'PENDENTE' THEN 1 ELSE 0 END) as pendentes,
                    SUM(CASE WHEN status = 'PROCESSANDO' THEN 1 ELSE 0 END) as processando,
                    SUM(CASE WHEN status = 'PAGO' THEN 1 ELSE 0 END) as pagos,
                    SUM(CASE WHEN status = 'CANCELADO' THEN 1 ELSE 0 END) as cancelados,
                    COALESCE(SUM(CASE WHEN status != 'PAGO' AND status != 'CANCELADO' THEN valor_liquido ELSE 0 END), 0) as total_pendente,
                    COALESCE(SUM(CASE WHEN status = 'PAGO' THEN valor_liquido ELSE 0 END), 0) as total_pago
                FROM pagamentos_motoristas p
                JOIN motoristas_vinculados mv ON p.motorista_vinculado_id = mv.id
                WHERE mv.transportador_id = ?
            `;
            params.push(transportadorId);
        } else if (motoristaId) {
            // Resumo do motorista
            query = `
                SELECT 
                    COUNT(*) as total_pagamentos,
                    SUM(CASE WHEN status = 'PENDENTE' THEN 1 ELSE 0 END) as pendentes,
                    SUM(CASE WHEN status = 'PROCESSANDO' THEN 1 ELSE 0 END) as processando,
                    SUM(CASE WHEN status = 'PAGO' THEN 1 ELSE 0 END) as pagos,
                    SUM(CASE WHEN status = 'CANCELADO' THEN 1 ELSE 0 END) as cancelados,
                    COALESCE(SUM(CASE WHEN status != 'PAGO' AND status != 'CANCELADO' THEN valor_liquido ELSE 0 END), 0) as total_pendente,
                    COALESCE(SUM(CASE WHEN status = 'PAGO' THEN valor_liquido ELSE 0 END), 0) as total_pago
                FROM pagamentos_motoristas
                WHERE motorista_vinculado_id = ?
            `;
            params.push(motoristaId);
        } else {
            return res.status(403).json({ 
                error: 'Usuário não autorizado' 
            });
        }

        const [rows] = await db.query(query, params);
        res.json(rows[0]);

    } catch (error) {
        console.error('Erro ao buscar resumo de pagamentos:', error);
        res.status(500).json({ error: 'Erro ao buscar resumo de pagamentos' });
    }
};

// ============================================
// EXPORTAÇÃO
// ============================================
module.exports = {
    criarPagamento,
    listarPagamentosFrota,
    listarPagamentosMotorista,
    buscarPagamento,
    marcarPagamentoPago,
    cancelarPagamento,
    resumoPagamentos
};