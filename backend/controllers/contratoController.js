// controllers/contratoController.js
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
// 1. CRIAR CONTRATO (após proposta aceita)
// ============================================
const criarContrato = async (req, res) => {
    try {
        const userId = req.userId;
        const { proposta_id } = req.body;

        // Buscar proposta
        const [propostaRows] = await db.query(
            `SELECT p.*, 
                    mv.transportador_id as frota_id,
                    mv.id as motorista_vinculado_id
             FROM propostas p
             JOIN motoristas_vinculados mv ON p.motorista_vinculado_id = mv.id
             WHERE p.id = ? AND p.status = 'ACEITA'`,
            [proposta_id]
        );

        if (propostaRows.length === 0) {
            return res.status(404).json({ 
                error: 'Proposta não encontrada ou não está aceita' 
            });
        }

        const proposta = propostaRows[0];

        // Verificar permissão (quem está criando o contrato)
        const transportadorId = await getTransportadorId(userId);
        const motoristaId = await getMotoristaVinculadoId(userId);

        if (proposta.tipo === 'FROTA_PARA_MOTORISTA') {
            // Motorista criando contrato (já aceitou a proposta)
            if (proposta.motorista_vinculado_id !== motoristaId) {
                return res.status(403).json({ 
                    error: 'Apenas o motorista que aceitou a proposta pode criar o contrato' 
                });
            }
        } else if (proposta.tipo === 'MOTORISTA_PARA_FROTA') {
            // Frota criando contrato (já aceitou a proposta)
            if (proposta.transportador_id !== transportadorId) {
                return res.status(403).json({ 
                    error: 'Apenas a frota que aceitou a proposta pode criar o contrato' 
                });
            }
        } else {
            return res.status(403).json({ error: 'Usuário não autorizado' });
        }

        // Verificar se já existe contrato para esta proposta
        const [contratoExistente] = await db.query(
            'SELECT id FROM contratos WHERE proposta_id = ?',
            [proposta_id]
        );

        if (contratoExistente.length > 0) {
            return res.status(400).json({ 
                error: 'Já existe um contrato para esta proposta' 
            });
        }

        // Criar contrato baseado na proposta
        const [result] = await db.query(
            `INSERT INTO contratos (
                motorista_vinculado_id,
                transportador_id,
                proposta_id,
                tipo_contrato,
                valor_salario,
                valor_comissao,
                valor_adiantamento,
                beneficios,
                carga_horaria,
                dias_descanso,
                ferias_remuneradas,
                decimo_terceiro,
                adicional_noturno,
                periodo_experiencia,
                data_inicio,
                status,
                criado_por
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'EM_EXPERIENCIA', ?)`,
            [
                proposta.motorista_vinculado_id,
                proposta.transportador_id,
                proposta_id,
                proposta.tipo_contrato,
                proposta.valor_salario,
                proposta.valor_comissao,
                proposta.valor_adiantamento,
                proposta.beneficios,
                proposta.carga_horaria,
                proposta.dias_descanso,
                proposta.ferias_remuneradas,
                proposta.decimo_terceiro,
                proposta.adicional_noturno,
                proposta.periodo_experiencia || 90,
                proposta.data_inicio_prevista || new Date(),
                userId
            ]
        );

        // Atualizar proposta com o ID do contrato
        await db.query(
            'UPDATE propostas SET contrato_id = ?, status = "CONTRATO_ASSINADO" WHERE id = ?',
            [result.insertId, proposta_id]
        );

        // Atualizar motorista_vinculado com o transportador_id
        await db.query(
            'UPDATE motoristas_vinculados SET transportador_id = ? WHERE id = ?',
            [proposta.transportador_id, proposta.motorista_vinculado_id]
        );

        // Buscar contrato criado
        const [contrato] = await db.query(
            `SELECT c.*, 
                    pm.nome_razao_social as motorista_nome,
                    pf.nome_razao_social as frota_nome,
                    mv.cnh,
                    mv.cnh_categoria
             FROM contratos c
             JOIN motoristas_vinculados mv ON c.motorista_vinculado_id = mv.id
             JOIN pessoas pm ON mv.pessoa_id = pm.id
             JOIN pessoas pf ON pf.id = (SELECT pessoa_id FROM transportadores WHERE id = c.transportador_id)
             WHERE c.id = ?`,
            [result.insertId]
        );

        res.status(201).json({
            message: 'Contrato criado com sucesso',
            contrato: contrato[0]
        });

    } catch (error) {
        console.error('Erro ao criar contrato:', error);
        res.status(500).json({ error: 'Erro ao criar contrato' });
    }
};

// ============================================
// 2. LISTAR CONTRATOS
// ============================================
const listarContratos = async (req, res) => {
    try {
        const userId = req.userId;
        const { status } = req.query;

        const transportadorId = await getTransportadorId(userId);
        const motoristaId = await getMotoristaVinculadoId(userId);

        let query = `
            SELECT c.*, 
                   pm.nome_razao_social as motorista_nome,
                   pf.nome_razao_social as frota_nome,
                   mv.cnh,
                   mv.cnh_categoria
            FROM contratos c
            JOIN motoristas_vinculados mv ON c.motorista_vinculado_id = mv.id
            JOIN pessoas pm ON mv.pessoa_id = pm.id
            JOIN pessoas pf ON pf.id = (SELECT pessoa_id FROM transportadores WHERE id = c.transportador_id)
            WHERE 1=1
        `;
        
        const params = [];

        if (transportadorId) {
            query += ` AND c.transportador_id = ?`;
            params.push(transportadorId);
        } else if (motoristaId) {
            query += ` AND c.motorista_vinculado_id = ?`;
            params.push(motoristaId);
        } else {
            return res.status(403).json({ 
                error: 'Usuário não autorizado' 
            });
        }

        if (status) {
            query += ` AND c.status = ?`;
            params.push(status);
        }

        query += ` ORDER BY c.data_inicio DESC`;

        const [rows] = await db.query(query, params);
        res.json({ data: rows });

    } catch (error) {
        console.error('Erro ao listar contratos:', error);
        res.status(500).json({ error: 'Erro ao listar contratos' });
    }
};

// ============================================
// 3. BUSCAR CONTRATO ESPECÍFICO
// ============================================
const buscarContrato = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const [rows] = await db.query(
            `SELECT c.*, 
                    pm.nome_razao_social as motorista_nome,
                    pf.nome_razao_social as frota_nome,
                    mv.cnh,
                    mv.cnh_categoria,
                    p.historico_negociacao
             FROM contratos c
             JOIN motoristas_vinculados mv ON c.motorista_vinculado_id = mv.id
             JOIN pessoas pm ON mv.pessoa_id = pm.id
             JOIN pessoas pf ON pf.id = (SELECT pessoa_id FROM transportadores WHERE id = c.transportador_id)
             LEFT JOIN propostas p ON c.proposta_id = p.id
             WHERE c.id = ?`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Contrato não encontrado' });
        }

        // Verificar permissão
        const contrato = rows[0];
        const transportadorId = await getTransportadorId(userId);
        const motoristaId = await getMotoristaVinculadoId(userId);

        if (contrato.transportador_id !== transportadorId && 
            contrato.motorista_vinculado_id !== motoristaId) {
            return res.status(403).json({ 
                error: 'Você não tem permissão para ver este contrato' 
            });
        }

        res.json({ data: rows[0] });

    } catch (error) {
        console.error('Erro ao buscar contrato:', error);
        res.status(500).json({ error: 'Erro ao buscar contrato' });
    }
};

// ============================================
// 4. ASSINAR CONTRATO (MOTORISTA)
// ============================================
const assinarContratoMotorista = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const motoristaId = await getMotoristaVinculadoId(userId);

        if (!motoristaId) {
            return res.status(403).json({ 
                error: 'Apenas motoristas vinculados podem assinar contratos' 
            });
        }

        // Verificar contrato
        const [contratoRows] = await db.query(
            'SELECT * FROM contratos WHERE id = ? AND motorista_vinculado_id = ?',
            [id, motoristaId]
        );

        if (contratoRows.length === 0) {
            return res.status(404).json({ 
                error: 'Contrato não encontrado ou não pertence a este motorista' 
            });
        }

        if (contratoRows[0].assinatura_motorista) {
            return res.status(400).json({ 
                error: 'Motorista já assinou este contrato' 
            });
        }

        await db.query(
            `UPDATE contratos 
             SET assinatura_motorista = TRUE, 
                 data_assinatura_motorista = NOW() 
             WHERE id = ?`,
            [id]
        );

        // Verificar se ambos assinaram para mudar status
        const [updated] = await db.query(
            'SELECT assinatura_motorista, assinatura_frota FROM contratos WHERE id = ?',
            [id]
        );

        if (updated[0].assinatura_motorista && updated[0].assinatura_frota) {
            await db.query(
                `UPDATE contratos SET status = 'ATIVO' WHERE id = ?`,
                [id]
            );
        }

        res.json({
            message: 'Contrato assinado pelo motorista com sucesso',
            id: parseInt(id)
        });

    } catch (error) {
        console.error('Erro ao assinar contrato:', error);
        res.status(500).json({ error: 'Erro ao assinar contrato' });
    }
};

// ============================================
// 5. ASSINAR CONTRATO (FROTA)
// ============================================
const assinarContratoFrota = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const transportadorId = await getTransportadorId(userId);

        if (!transportadorId) {
            return res.status(403).json({ 
                error: 'Apenas frotas podem assinar contratos' 
            });
        }

        // Verificar contrato
        const [contratoRows] = await db.query(
            'SELECT * FROM contratos WHERE id = ? AND transportador_id = ?',
            [id, transportadorId]
        );

        if (contratoRows.length === 0) {
            return res.status(404).json({ 
                error: 'Contrato não encontrado ou não pertence a esta frota' 
            });
        }

        if (contratoRows[0].assinatura_frota) {
            return res.status(400).json({ 
                error: 'Frota já assinou este contrato' 
            });
        }

        await db.query(
            `UPDATE contratos 
             SET assinatura_frota = TRUE, 
                 data_assinatura_frota = NOW() 
             WHERE id = ?`,
            [id]
        );

        // Verificar se ambos assinaram para mudar status
        const [updated] = await db.query(
            'SELECT assinatura_motorista, assinatura_frota FROM contratos WHERE id = ?',
            [id]
        );

        if (updated[0].assinatura_motorista && updated[0].assinatura_frota) {
            await db.query(
                `UPDATE contratos SET status = 'ATIVO' WHERE id = ?`,
                [id]
            );
        }

        res.json({
            message: 'Contrato assinado pela frota com sucesso',
            id: parseInt(id)
        });

    } catch (error) {
        console.error('Erro ao assinar contrato:', error);
        res.status(500).json({ error: 'Erro ao assinar contrato' });
    }
};

// ============================================
// 6. ENCERRAR CONTRATO
// ============================================
const encerrarContrato = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const { motivo } = req.body;

        const transportadorId = await getTransportadorId(userId);
        const motoristaId = await getMotoristaVinculadoId(userId);

        // Buscar contrato
        const [contratoRows] = await db.query(
            'SELECT * FROM contratos WHERE id = ?',
            [id]
        );

        if (contratoRows.length === 0) {
            return res.status(404).json({ error: 'Contrato não encontrado' });
        }

        const contrato = contratoRows[0];

        // Verificar permissão (frota ou motorista podem encerrar)
        if (contrato.transportador_id !== transportadorId && 
            contrato.motorista_vinculado_id !== motoristaId) {
            return res.status(403).json({ 
                error: 'Apenas a frota ou o motorista podem encerrar este contrato' 
            });
        }

        // Verificar se há pagamentos pendentes
        const [pagamentosPendentes] = await db.query(
            'SELECT COUNT(*) as total FROM pagamentos_motoristas WHERE contrato_id = ? AND status != "PAGO"',
            [id]
        );

        if (pagamentosPendentes[0].total > 0) {
            return res.status(400).json({ 
                error: `Existem ${pagamentosPendentes[0].total} pagamentos pendentes. Regularize antes de encerrar o contrato.` 
            });
        }

        // Encerrar contrato
        await db.query(
            `UPDATE contratos 
             SET status = 'ENCERRADO', 
                 data_fim = NOW(),
                 motivo_encerramento = ? 
             WHERE id = ?`,
            [motivo || 'Encerrado por acordo entre as partes', id]
        );

        // Atualizar motorista_vinculado
        await db.query(
            `UPDATE motoristas_vinculados 
             SET status = 'DESLIGADO', 
                 data_demissao = NOW() 
             WHERE id = ?`,
            [contrato.motorista_vinculado_id]
        );

        // Remover veículo do motorista
        await db.query(
            'UPDATE veiculos SET motorista_vinculado_id = NULL WHERE motorista_vinculado_id = ?',
            [contrato.motorista_vinculado_id]
        );

        // Registrar histórico
        await db.query(
            `INSERT INTO historico_vinculos 
             (motorista_vinculado_id, transportador_id, contrato_id, acao, observacoes, criado_por) 
             VALUES (?, ?, ?, 'DESVINCULACAO', ?, ?)`,
            [
                contrato.motorista_vinculado_id,
                contrato.transportador_id,
                id,
                motivo || 'Contrato encerrado',
                userId
            ]
        );

        res.json({
            message: 'Contrato encerrado com sucesso',
            id: parseInt(id)
        });

    } catch (error) {
        console.error('Erro ao encerrar contrato:', error);
        res.status(500).json({ error: 'Erro ao encerrar contrato' });
    }
};

// ============================================
// 7. RENOVAR CONTRATO
// ============================================
const renovarContrato = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const { nova_data_fim, observacoes } = req.body;

        const transportadorId = await getTransportadorId(userId);
        const motoristaId = await getMotoristaVinculadoId(userId);

        // Buscar contrato
        const [contratoRows] = await db.query(
            'SELECT * FROM contratos WHERE id = ?',
            [id]
        );

        if (contratoRows.length === 0) {
            return res.status(404).json({ error: 'Contrato não encontrado' });
        }

        const contrato = contratoRows[0];

        // Apenas a frota pode renovar o contrato
        if (contrato.transportador_id !== transportadorId) {
            return res.status(403).json({ 
                error: 'Apenas a frota pode renovar o contrato' 
            });
        }

        if (contrato.status !== 'ATIVO' && contrato.status !== 'EM_EXPERIENCIA') {
            return res.status(400).json({ 
                error: 'Apenas contratos ativos podem ser renovados' 
            });
        }

        // Renovar contrato
        await db.query(
            `UPDATE contratos 
             SET status = 'RENOVADO',
                 data_fim = ?,
                 data_renovacao = NOW(),
                 observacoes = CONCAT(observacoes, '\nRenovado em ', NOW(), ': ', ?)
             WHERE id = ?`,
            [nova_data_fim || null, observacoes || 'Renovação automática', id]
        );

        // Registrar histórico
        await db.query(
            `INSERT INTO historico_vinculos 
             (motorista_vinculado_id, transportador_id, contrato_id, acao, observacoes, criado_por) 
             VALUES (?, ?, ?, 'RENOVACAO', ?, ?)`,
            [
                contrato.motorista_vinculado_id,
                contrato.transportador_id,
                id,
                observacoes || 'Contrato renovado',
                userId
            ]
        );

        res.json({
            message: 'Contrato renovado com sucesso',
            id: parseInt(id)
        });

    } catch (error) {
        console.error('Erro ao renovar contrato:', error);
        res.status(500).json({ error: 'Erro ao renovar contrato' });
    }
};

// ============================================
// EXPORTAÇÃO
// ============================================
module.exports = {
    criarContrato,
    listarContratos,
    buscarContrato,
    assinarContratoMotorista,
    assinarContratoFrota,
    encerrarContrato,
    renovarContrato
};