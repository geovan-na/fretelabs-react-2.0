// controllers/propostaController.js
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
// FUNÇÃO AUXILIAR: Obter id de pessoa do motorista logado
// ============================================
const getMotoristaPessoaId = async (userId) => {
    // Verifica se o usuário atual é de fato um motorista cadastrado no sistema
    const [rows] = await db.query(
        'SELECT id FROM motoristas_vinculados WHERE pessoa_id = ?',
        [userId]
    );
    // Se existir o vínculo, o ID da pessoa associada é o próprio userId (req.userId)
    return rows.length > 0 ? userId : null;
};

// ============================================
// 1. ENVIAR PROPOSTA
// ============================================
const enviarProposta = async (req, res) => {
    try {
        const userId = req.userId || req.user?.id || req.user?.pessoa_id || req.user?.usuario_id;

        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado ou token inválido' });
        }

        const rawTipo = (req.user?.tipo_usuario || req.tipo_usuario || req.user?.tipo || '').toString().toUpperCase();
        
        let isFrota = ['TRANSPORTADOR', 'FROTA', 'EMPRESA'].includes(rawTipo);
        let isMotorista = ['MOTORISTA', 'AUTONOMO', 'VINCULADO', 'MOTORISTA_VINCULADO'].includes(rawTipo) || !isFrota;

        const {
            motorista_id,
            transportador_id,
            frota_id,
            veiculo_id,
            tipo_contrato,
            valor_por_km,
            valor_por_tonelada,
            valor_fixo,
            percentual_frete,
            valor_salario,
            frequencia_pagamento,
            observacoes,
            mensagem
        } = req.body;

        let motoristaIdFinal = null;
        let transportadorIdFinal = null;
        let tipo = null;

        if (isFrota) {
            tipo = 'FROTA_PARA_MOTORISTA';
            
            const [transportador] = await db.query(
                'SELECT id FROM transportadores WHERE pessoa_id = ? OR id = ?',
                [userId, userId]
            );

            if (transportador.length === 0) {
                return res.status(404).json({ error: 'Perfil de frota não encontrado' });
            }
            transportadorIdFinal = transportador[0].id;
            motoristaIdFinal = motorista_id;

            if (!motoristaIdFinal) {
                return res.status(400).json({ error: 'ID do motorista é obrigatório' });
            }

        } else if (isMotorista) {
            tipo = 'MOTORISTA_PARA_FROTA';
            motoristaIdFinal = userId;
            
            const targetFrotaId = transportador_id || frota_id;

            if (!targetFrotaId) {
                return res.status(400).json({ error: 'ID da frota é obrigatório' });
            }

            const [frota] = await db.query(
                `SELECT id FROM transportadores WHERE id = ? OR pessoa_id = ?`,
                [targetFrotaId, targetFrotaId]
            );

            if (frota.length === 0) {
                // Se não achou na tabela de transportadores, usa o próprio ID enviado
                transportadorIdFinal = targetFrotaId;
            } else {
                transportadorIdFinal = frota[0].id;
            }
        } else {
            return res.status(403).json({ error: 'Tipo de usuário não permitido para enviar proposta' });
        }

        // Tenta descobrir o nome exato das colunas da tabela 'propostas' no seu MySQL
        const [colunasTabela] = await db.query(`SHOW COLUMNS FROM propostas`);
        const colunas = colunasTabela.map(c => c.Field);

        // Mapeia qual coluna de motorista/solicitante existe na tabela
        const campoMotorista = colunas.find(c => ['motorista_id', 'motorista_pessoa_id', 'solicitante_id', 'usuario_id', 'pessoa_id'].includes(c)) || 'motorista_id';
        const campoTransportador = colunas.find(c => ['transportador_id', 'frota_id', 'empresa_id', 'destinatario_id'].includes(c)) || 'transportador_id';

        // 1. Verificar duplicidade de proposta pendente (dinâmico conforme as colunas reais)
        try {
            const [propostaExistente] = await db.query(
                `SELECT * FROM propostas 
                 WHERE ${campoMotorista} = ? AND ${campoTransportador} = ? AND status = "PENDENTE"`,
                [motoristaIdFinal, transportadorIdFinal]
            );

            if (propostaExistente.length > 0) {
                return res.status(400).json({ 
                    error: 'Já existe uma proposta pendente entre você e esta frota/motorista' 
                });
            }
        } catch (errCheck) {
            // Se a busca falhar por divergência de schema, segue em frente para a inserção
            console.warn('Aviso ao checar proposta existente:', errCheck.message);
        }

        // 2. Monta o objeto com os dados para inserir apenas nas colunas que REALMENTE existem na tabela
        const dadosParaInserir = {};

        if (colunas.includes(campoMotorista)) dadosParaInserir[campoMotorista] = motoristaIdFinal;
        if (colunas.includes(campoTransportador)) dadosParaInserir[campoTransportador] = transportadorIdFinal;
        if (colunas.includes('tipo')) dadosParaInserir['tipo'] = tipo;
        if (colunas.includes('veiculo_id')) dadosParaInserir['veiculo_id'] = veiculo_id || null;
        if (colunas.includes('tipo_contrato')) dadosParaInserir['tipo_contrato'] = tipo_contrato || 'MENSAL';
        if (colunas.includes('valor_por_km')) dadosParaInserir['valor_por_km'] = valor_por_km || null;
        if (colunas.includes('valor_por_tonelada')) dadosParaInserir['valor_por_tonelada'] = valor_por_tonelada || null;
        if (colunas.includes('valor_fixo')) dadosParaInserir['valor_fixo'] = valor_fixo || req.body.valor || null;
        if (colunas.includes('percentual_frete')) dadosParaInserir['percentual_frete'] = percentual_frete || null;
        if (colunas.includes('valor_salario')) dadosParaInserir['valor_salario'] = valor_salario || null;
        if (colunas.includes('frequencia_pagamento')) dadosParaInserir['frequencia_pagamento'] = frequencia_pagamento || null;
        if (colunas.includes('observacoes')) dadosParaInserir['observacoes'] = observacoes || mensagem || null;
        if (colunas.includes('mensagem')) dadosParaInserir['mensagem'] = mensagem || observacoes || null;
        if (colunas.includes('status')) dadosParaInserir['status'] = 'PENDENTE';
        if (colunas.includes('criado_em')) dadosParaInserir['criado_em'] = new Date();

        const chaves = Object.keys(dadosParaInserir);
        const valores = Object.values(dadosParaInserir);
        const interrogacoes = chaves.map(() => '?').join(', ');

        const sql = `INSERT INTO propostas (${chaves.join(', ')}) VALUES (${interrogacoes})`;

        const [result] = await db.query(sql, valores);

        return res.status(201).json({
            message: 'Proposta enviada com sucesso',
            propostaId: result.insertId
        });

    } catch (error) {
        console.error('Erro ao enviar proposta:', error);
        return res.status(500).json({ error: 'Erro interno ao processar a proposta' });
    }
};
// ============================================
// 2. LISTAR PROPOSTAS ENVIADAS
// ============================================
const listarPropostasEnviadas = async (req, res) => {
    try {
        const userId = req.userId;

        const transportadorId = await getTransportadorId(userId);
        const motoristaId = await getMotoristaPessoaId(userId);

        let query = '';
        const params = [];

        if (transportadorId) {
            // Frota vê propostas que enviou
            query = `
                SELECT p.*, 
                       pm.nome_razao_social as motorista_nome,
                       pf.nome_razao_social as frota_nome
                FROM propostas p
                LEFT JOIN pessoas pm ON p.motorista_pessoa_id = pm.id
                LEFT JOIN transportadores t ON p.transportador_id = t.id
                LEFT JOIN pessoas pf ON t.pessoa_id = pf.id
                WHERE p.transportador_id = ? AND p.tipo = 'FROTA_PARA_MOTORISTA'
                ORDER BY p.data_envio DESC
            `;
            params.push(transportadorId);
        } else if (motoristaId) {
            // Motorista vê propostas que enviou
            query = `
                SELECT p.*, 
                       pm.nome_razao_social as motorista_nome,
                       pf.nome_razao_social as frota_nome
                FROM propostas p
                LEFT JOIN pessoas pm ON p.motorista_pessoa_id = pm.id
                LEFT JOIN transportadores t ON p.transportador_id = t.id
                LEFT JOIN pessoas pf ON t.pessoa_id = pf.id
                WHERE p.motorista_pessoa_id = ? AND p.tipo = 'MOTORISTA_PARA_FROTA'
                ORDER BY p.data_envio DESC
            `;
            params.push(motoristaId);
        } else {
            return res.status(403).json({ 
                error: 'Usuário não autorizado' 
            });
        }

        const [rows] = await db.query(query, params);
        res.json({ data: rows });

    } catch (error) {
        console.error('Erro ao listar propostas enviadas:', error);
        res.status(500).json({ error: 'Erro ao listar propostas enviadas' });
    }
};

// ============================================
// 3. LISTAR PROPOSTAS RECEBIDAS
// ============================================
const listarPropostasRecebidas = async (req, res) => {
    try {
        const userId = req.userId;

        const transportadorId = await getTransportadorId(userId);
        const motoristaId = await getMotoristaPessoaId(userId);

        let query = '';
        const params = [];

        if (transportadorId) {
            // Frota vê propostas que recebeu de motoristas
            query = `
                SELECT p.*, 
                       pm.nome_razao_social as motorista_nome,
                       pf.nome_razao_social as frota_nome
                FROM propostas p
                LEFT JOIN pessoas pm ON p.motorista_pessoa_id = pm.id
                LEFT JOIN transportadores t ON p.transportador_id = t.id
                LEFT JOIN pessoas pf ON t.pessoa_id = pf.id
                WHERE p.transportador_id = ? AND p.tipo = 'MOTORISTA_PARA_FROTA'
                ORDER BY p.data_envio DESC
            `;
            params.push(transportadorId);
        } else if (motoristaId) {
            // Motorista vê propostas que recebeu de frotas
            query = `
                SELECT p.*, 
                       pm.nome_razao_social as motorista_nome,
                       pf.nome_razao_social as frota_nome
                FROM propostas p
                LEFT JOIN pessoas pm ON p.motorista_pessoa_id = pm.id
                LEFT JOIN transportadores t ON p.transportador_id = t.id
                LEFT JOIN pessoas pf ON t.pessoa_id = pf.id
                WHERE p.motorista_pessoa_id = ? AND p.tipo = 'FROTA_PARA_MOTORISTA'
                ORDER BY p.data_envio DESC
            `;
            params.push(motoristaId);
        } else {
            return res.status(403).json({ 
                error: 'Usuário não autorizado' 
            });
        }

        const [rows] = await db.query(query, params);
        res.json({ data: rows });

    } catch (error) {
        console.error('Erro ao listar propostas recebidas:', error);
        res.status(500).json({ error: 'Erro ao listar propostas recebidas' });
    }
};

// ============================================
// 4. BUSCAR PROPOSTA ESPECÍFICA
// ============================================
const buscarProposta = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const [rows] = await db.query(
            `SELECT p.*, 
                    pm.nome_razao_social as motorista_nome,
                    pf.nome_razao_social as frota_nome,
                    mv.cnh,
                    mv.cnh_categoria
             FROM propostas p
             LEFT JOIN pessoas pm ON p.motorista_pessoa_id = pm.id
             LEFT JOIN motoristas_vinculados mv ON pm.id = mv.pessoa_id
             LEFT JOIN transportadores t ON p.transportador_id = t.id
             LEFT JOIN pessoas pf ON t.pessoa_id = pf.id
             WHERE p.id = ?`,
            [id]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Proposta não encontrada' });
        }

        const proposta = rows[0];
        const transportadorId = await getTransportadorId(userId);
        const motoristaId = await getMotoristaPessoaId(userId);

        if (proposta.transportador_id !== transportadorId && 
            proposta.motorista_pessoa_id !== motoristaId) {
            return res.status(403).json({ 
                error: 'Você não tem permissão para ver esta proposta' 
            });
        }

        res.json({ data: rows[0] });

    } catch (error) {
        console.error('Erro ao buscar proposta:', error);
        res.status(500).json({ error: 'Erro ao buscar proposta' });
    }
};
// ============================================
// ACEITAR PROPOSTA (E CRIAR VÍNCULO)
// ============================================
const aceitarProposta = async (req, res) => {
    try {
        const { id } = req.params;

        const [propostaRows] = await db.query(
            'SELECT * FROM propostas WHERE id = ?',
            [id]
        );

        if (propostaRows.length === 0) {
            return res.status(404).json({ error: 'Proposta não encontrada' });
        }

        const proposta = propostaRows[0];

        if (!['PENDENTE', 'MODIFICADA', 'EM_NEGOCIACAO'].includes(proposta.status)) {
            return res.status(400).json({ 
                error: `Não é possível aceitar uma proposta com status ${proposta.status}` 
            });
        }

        await db.query('START TRANSACTION');

        // 1. Atualiza a proposta para ACEITA
        await db.query(
            `UPDATE propostas 
             SET status = 'ACEITA', data_resposta = NOW() 
             WHERE id = ?`,
            [id]
        );

        // 2. Insere/Atualiza o registro na tabela motoristas_vinculados para ele aparecer em "Meus Motoristas"
        await db.query(
            `INSERT INTO motoristas_vinculados (
                pessoa_id, 
                transportador_id, 
                status, 
                data_admissao, 
                tipo_contrato, 
                valor_salario, 
                valor_comissao, 
                criado_em
            ) VALUES (?, ?, 'ATIVO', NOW(), ?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE 
                status = 'ATIVO', 
                tipo_contrato = VALUES(tipo_contrato), 
                valor_salario = VALUES(valor_salario), 
                valor_comissao = VALUES(valor_comissao)`,
            [
                proposta.motorista_pessoa_id,
                proposta.transportador_id,
                proposta.tipo_contrato,
                proposta.valor_salario,
                proposta.valor_comissao
            ]
        );

        await db.query('COMMIT');

        return res.json({ message: 'Proposta aceita e motorista vinculado com sucesso!' });

    } catch (error) {
        await db.query('ROLLBACK');
        console.error('Erro ao aceitar proposta:', error);
        return res.status(500).json({ error: 'Erro interno ao aceitar proposta' });
    }
};
// ============================================
// 6. RECUSAR PROPOSTA
// ============================================
const recusarProposta = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const { motivo } = req.body;

        const [propostaRows] = await db.query(
            'SELECT * FROM propostas WHERE id = ?',
            [id]
        );

        if (propostaRows.length === 0) {
            return res.status(404).json({ error: 'Proposta não encontrada' });
        }

        const proposta = propostaRows[0];

        if (proposta.status !== 'PENDENTE' && proposta.status !== 'MODIFICADA') {
            return res.status(400).json({ 
                error: 'Apenas propostas pendentes ou modificadas podem ser recusadas' 
            });
        }

        const transportadorId = await getTransportadorId(userId);
        const motoristaId = await getMotoristaPessoaId(userId);

        if (proposta.tipo === 'FROTA_PARA_MOTORISTA') {
            if (proposta.motorista_pessoa_id !== motoristaId) {
                return res.status(403).json({ 
                    error: 'Apenas o motorista destinatário pode recusar esta proposta' 
                });
            }
        } else if (proposta.tipo === 'MOTORISTA_PARA_FROTA') {
            if (proposta.transportador_id !== transportadorId) {
                return res.status(403).json({ 
                    error: 'Apenas a frota destinatária pode recusar esta proposta' 
                });
            }
        } else {
            return res.status(403).json({ error: 'Usuário não autorizado' });
        }

        await db.query(
            `UPDATE propostas 
             SET status = 'RECUSADA', 
                 data_resposta = NOW(),
                 mensagem = ? 
             WHERE id = ?`,
            [motivo || 'Recusada pelo destinatário', id]
        );

        res.json({
            message: 'Proposta recusada com sucesso',
            id: parseInt(id)
        });

    } catch (error) {
        console.error('Erro ao recusar proposta:', error);
        res.status(500).json({ error: 'Erro ao recusar proposta' });
    }
};

// ============================================
// 7. ENVIAR CONTRA PROPOSTA
// ============================================
const enviarContraProposta = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const { 
            valor_salario,
            valor_comissao,
            valor_adiantamento,
            mensagem,
            tipo_contrato,
            beneficios,
            carga_horaria,
            dias_descanso,
            ferias_remuneradas,
            decimo_terceiro,
            adicional_noturno,
            periodo_experiencia
        } = req.body;

        const [propostaRows] = await db.query(
            'SELECT * FROM propostas WHERE id = ?',
            [id]
        );

        if (propostaRows.length === 0) {
            return res.status(404).json({ error: 'Proposta não encontrada' });
        }

        const proposta = propostaRows[0];

        if (proposta.status !== 'PENDENTE' && proposta.status !== 'MODIFICADA') {
            return res.status(400).json({ 
                error: 'Apenas propostas pendentes podem ser modificadas' 
            });
        }

        const transportadorId = await getTransportadorId(userId);
        const motoristaId = await getMotoristaPessoaId(userId);

        if (proposta.tipo === 'FROTA_PARA_MOTORISTA') {
            if (proposta.motorista_pessoa_id !== motoristaId) {
                return res.status(403).json({ 
                    error: 'Apenas o motorista destinatário pode enviar contraproposta' 
                });
            }
        } else if (proposta.tipo === 'MOTORISTA_PARA_FROTA') {
            if (proposta.transportador_id !== transportadorId) {
                return res.status(403).json({ 
                    error: 'Apenas a frota destinatária pode enviar contraproposta' 
                });
            }
        } else {
            return res.status(403).json({ error: 'Usuário não autorizado' });
        }

        let historico = proposta.historico_negociacao || [];
        if (typeof historico === 'string') {
            historico = JSON.parse(historico);
        }
        
        historico.push({
            data: new Date().toISOString(),
            quem: proposta.tipo === 'FROTA_PARA_MOTORISTA' ? 'MOTORISTA' : 'FROTA',
            mensagem: mensagem || 'Contraproposta enviada',
            valor_salario: valor_salario,
            valor_comissao: valor_comissao,
            tipo_contrato: tipo_contrato
        });

        await db.query(
            `UPDATE propostas 
             SET status = 'MODIFICADA',
                 valor_salario = ?,
                 valor_comissao = ?,
                 valor_adiantamento = ?,
                 tipo_contrato = ?,
                 beneficios = ?,
                 carga_horaria = ?,
                 dias_descanso = ?,
                 ferias_remuneradas = ?,
                 decimo_terceiro = ?,
                 adicional_noturno = ?,
                 periodo_experiencia = ?,
                 mensagem = ?,
                 historico_negociacao = ?,
                 data_resposta = NOW()
             WHERE id = ?`,
            [
                valor_salario || proposta.valor_salario,
                valor_comissao || proposta.valor_comissao,
                valor_adiantamento || proposta.valor_adiantamento,
                tipo_contrato || proposta.tipo_contrato,
                beneficios ? JSON.stringify(beneficios) : proposta.beneficios,
                carga_horaria || proposta.carga_horaria,
                dias_descanso || proposta.dias_descanso,
                ferias_remuneradas !== undefined ? ferias_remuneradas : proposta.ferias_remuneradas,
                decimo_terceiro !== undefined ? decimo_terceiro : proposta.decimo_terceiro,
                adicional_noturno || proposta.adicional_noturno,
                periodo_experiencia || proposta.periodo_experiencia,
                mensagem || proposta.mensagem,
                JSON.stringify(historico),
                id
            ]
        );

        const [updated] = await db.query(
            `SELECT p.*, 
                    pm.nome_razao_social as motorista_nome,
                    pf.nome_razao_social as frota_nome
             FROM propostas p
             LEFT JOIN pessoas pm ON p.motorista_pessoa_id = pm.id
             LEFT JOIN transportadores t ON p.transportador_id = t.id
             LEFT JOIN pessoas pf ON t.pessoa_id = pf.id
             WHERE p.id = ?`,
            [id]
        );

        res.json({
            message: 'Contraproposta enviada com sucesso',
            proposta: updated[0]
        });

    } catch (error) {
        console.error('Erro ao enviar contraproposta:', error);
        res.status(500).json({ error: 'Erro ao enviar contraproposta' });
    }
};

// ============================================
// 8. CANCELAR PROPOSTA
// ============================================
const cancelarProposta = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const [propostaRows] = await db.query(
            'SELECT * FROM propostas WHERE id = ?',
            [id]
        );

        if (propostaRows.length === 0) {
            return res.status(404).json({ error: 'Proposta não encontrada' });
        }

        const proposta = propostaRows[0];

        const transportadorId = await getTransportadorId(userId);
        const motoristaId = await getMotoristaPessoaId(userId);

        const isEnviador = (proposta.tipo === 'FROTA_PARA_MOTORISTA' && 
                            proposta.transportador_id === transportadorId) ||
                           (proposta.tipo === 'MOTORISTA_PARA_FROTA' && 
                            proposta.motorista_pessoa_id === motoristaId);

        if (!isEnviador) {
            return res.status(403).json({ 
                error: 'Apenas quem enviou a proposta pode cancelá-la' 
            });
        }

        if (!['PENDENTE', 'MODIFICADA'].includes(proposta.status)) {
            return res.status(400).json({ 
                error: 'Apenas propostas pendentes ou modificadas podem ser canceladas' 
            });
        }

        await db.query(
            `UPDATE propostas SET status = 'CANCELADA' WHERE id = ?`,
            [id]
        );

        res.json({
            message: 'Proposta cancelada com sucesso',
            id: parseInt(id)
        });

    } catch (error) {
        console.error('Erro ao cancelar proposta:', error);
        res.status(500).json({ error: 'Erro ao cancelar proposta' });
    }
};

// ============================================
// EXPORTAÇÃO
// ============================================
module.exports = {
    enviarProposta,
    listarPropostasEnviadas,
    listarPropostasRecebidas,
    buscarProposta,
    aceitarProposta,
    recusarProposta,
    enviarContraProposta,
    cancelarProposta
};