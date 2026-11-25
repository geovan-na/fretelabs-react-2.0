// controllers/propostaController.js
const db = require('../config/database');

const TIPOS_CONTRATO_VALIDOS = ['SALARIO', 'COMISSAO', 'MISTO'];
const STATUS_ATIVOS_PROPOSTA = ['PENDENTE', 'MODIFICADA', 'EM_NEGOCIACAO'];
const STATUS_VINCULO_ATIVO = ['ATIVO', 'FERIAS', 'LICENCA'];

// ============================================
// FUNÇÕES AUXILIARES
// ============================================
const getTransportadorId = async (userId, conn = db) => {
    const [rows] = await conn.query(
        "SELECT id FROM transportadores WHERE pessoa_id = ? AND tipo_transportador = 'FROTA'",
        [userId]
    );
    return rows.length > 0 ? rows[0].id : null;
};

const getMotoristaPessoaId = async (userId, userRole = '', conn = db) => {
    const [rows] = await conn.query(
        'SELECT id FROM motoristas_vinculados WHERE pessoa_id = ?',
        [userId]
    );
    if (rows.length > 0) {
        return userId;
    }

    const roleNormalizada = (userRole || '').toString().toLowerCase();
    if (['vinculado', 'motorista_vinculado'].includes(roleNormalizada)) {
        return userId;
    }

    return null;
};

const parseHistorico = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (typeof raw === 'string') {
        try {
            const parsed = JSON.parse(raw);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }
    return [];
};

const normalizarBeneficios = (valor) => {
    if (valor === undefined || valor === null || valor === '') return null;
    if (typeof valor === 'string') {
        try {
            JSON.parse(valor);
            return valor;
        } catch {
            return JSON.stringify([valor]);
        }
    }
    if (Array.isArray(valor) || typeof valor === 'object') {
        return JSON.stringify(valor);
    }
    return null;
};

const parseDecimalOpcional = (valor) => {
    if (valor === undefined || valor === null || valor === '') return null;
    const numero = Number(valor);
    if (!Number.isFinite(numero) || numero < 0) {
        return NaN;
    }
    return numero;
};

const normalizarDataOpcional = (valor) => {
    if (!valor || typeof valor !== 'string' || valor.trim() === '') return null;
    return valor.trim().slice(0, 10);
};

// Determina de quem é a vez de responder (aceitar, recusar ou contrapropor)
const getQuemDeveResponder = (proposta) => {
    if (!proposta || !STATUS_ATIVOS_PROPOSTA.includes(proposta.status)) {
        return null;
    }

    if (proposta.status === 'MODIFICADA' || proposta.status === 'EM_NEGOCIACAO') {
        const historico = parseHistorico(proposta.historico_negociacao);
        if (historico.length > 0) {
            const ultimo = historico[historico.length - 1];
            if (ultimo?.quem === 'MOTORISTA') return 'FROTA';
            if (ultimo?.quem === 'FROTA') return 'MOTORISTA';
        }
    }

    return proposta.tipo === 'FROTA_PARA_MOTORISTA' ? 'MOTORISTA' : 'FROTA';
};

const enriquecerProposta = (proposta) => ({
    ...proposta,
    aguardando_resposta_de: getQuemDeveResponder(proposta)
});

// ============================================
// 1. ENVIAR PROPOSTA
// ============================================
const enviarProposta = async (req, res) => {
    try {
        const userId = req.userId || req.user?.id || req.user?.pessoa_id || req.user?.usuario_id;

        if (!userId) {
            return res.status(401).json({ error: 'Usuário não autenticado ou token inválido' });
        }

        const transportadorLogadoId = await getTransportadorId(userId);
        const motoristaLogadoPessoaId = transportadorLogadoId
            ? null
            : await getMotoristaPessoaId(userId, req.userRole);

        if (!transportadorLogadoId && !motoristaLogadoPessoaId) {
            return res.status(403).json({
                error: 'Apenas frotas e motoristas vinculados podem enviar propostas'
            });
        }

        const {
            motorista_pessoa_id,
            motorista_id,
            motorista_vinculado_id,
            transportador_id,
            frota_id,
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
            disponibilidade,
            data_validade,
            data_inicio_prevista,
            observacoes,
            mensagem
        } = req.body;

        let motoristaIdFinal = null;
        let transportadorIdFinal = null;
        let tipo = null;

        if (transportadorLogadoId) {
            tipo = 'FROTA_PARA_MOTORISTA';
            transportadorIdFinal = transportadorLogadoId;

            const alvoMotoristaId = motorista_pessoa_id || motorista_id;

            if (alvoMotoristaId) {
                const [mvPorPessoa] = await db.query(
                    'SELECT id, pessoa_id FROM motoristas_vinculados WHERE pessoa_id = ?',
                    [alvoMotoristaId]
                );

                if (mvPorPessoa.length > 0) {
                    motoristaIdFinal = mvPorPessoa[0].pessoa_id;
                } else {
                    const [pessoaRows] = await db.query(
                        'SELECT id FROM pessoas WHERE id = ?',
                        [alvoMotoristaId]
                    );
                    if (pessoaRows.length === 0) {
                        return res.status(404).json({ error: 'Motorista não encontrado' });
                    }
                    motoristaIdFinal = pessoaRows[0].id;
                }
            } else if (motorista_vinculado_id) {
                const [mvPorId] = await db.query(
                    'SELECT pessoa_id FROM motoristas_vinculados WHERE id = ?',
                    [motorista_vinculado_id]
                );
                if (mvPorId.length === 0) {
                    return res.status(404).json({ error: 'Motorista não encontrado' });
                }
                motoristaIdFinal = mvPorId[0].pessoa_id;
            } else {
                return res.status(400).json({ error: 'ID do motorista é obrigatório' });
            }

            if (Number(motoristaIdFinal) === Number(userId)) {
                return res.status(400).json({ error: 'Não é possível enviar uma proposta para si mesmo' });
            }
        } else {
            tipo = 'MOTORISTA_PARA_FROTA';
            motoristaIdFinal = motoristaLogadoPessoaId;

            const targetFrotaId = transportador_id || frota_id;
            if (!targetFrotaId) {
                return res.status(400).json({ error: 'ID da frota é obrigatório' });
            }

            const [frotaRows] = await db.query(
                "SELECT id FROM transportadores WHERE (id = ? OR pessoa_id = ?) AND tipo_transportador = 'FROTA'",
                [targetFrotaId, targetFrotaId]
            );

            if (frotaRows.length === 0) {
                return res.status(404).json({ error: 'Frota não encontrada' });
            }

            transportadorIdFinal = frotaRows[0].id;
        }

        // Validar se já existe vínculo ativo com a MESMA frota
        const [vinculoMesmaFrota] = await db.query(
            `SELECT id FROM motoristas_vinculados
             WHERE pessoa_id = ?
               AND transportador_id = ?
               AND status IN ('ATIVO', 'FERIAS', 'LICENCA')`,
            [motoristaIdFinal, transportadorIdFinal]
        );

        if (vinculoMesmaFrota.length > 0) {
            return res.status(400).json({
                error: 'Já existe um vínculo ativo entre este motorista e esta frota'
            });
        }

        // Validar duplicidade de proposta em andamento
        const [propostaExistente] = await db.query(
            `SELECT id, status FROM propostas
             WHERE motorista_pessoa_id = ?
               AND transportador_id = ?
               AND status IN ('PENDENTE', 'MODIFICADA', 'EM_NEGOCIACAO')`,
            [motoristaIdFinal, transportadorIdFinal]
        );

        if (propostaExistente.length > 0) {
            return res.status(400).json({
                error: 'Já existe uma proposta em andamento entre você e esta frota/motorista'
            });
        }

        // Validar tipo de contrato e valores financeiros
        const tipoContratoFinal = (tipo_contrato || 'SALARIO').toString().toUpperCase();
        if (!TIPOS_CONTRATO_VALIDOS.includes(tipoContratoFinal)) {
            return res.status(400).json({
                error: 'Tipo de contrato inválido. Utilize SALARIO, COMISSAO ou MISTO'
            });
        }

        const salarioFinal = parseDecimalOpcional(valor_salario);
        const comissaoFinal = parseDecimalOpcional(valor_comissao);
        const adiantamentoFinal = parseDecimalOpcional(valor_adiantamento);

        if (Number.isNaN(salarioFinal) || Number.isNaN(comissaoFinal) || Number.isNaN(adiantamentoFinal)) {
            return res.status(400).json({ error: 'Valores financeiros inválidos' });
        }

        if (tipoContratoFinal === 'SALARIO' && (!salarioFinal || salarioFinal <= 0)) {
            return res.status(400).json({ error: 'Informe um valor de salário válido para contrato SALARIO' });
        }
        if (tipoContratoFinal === 'COMISSAO' && (!comissaoFinal || comissaoFinal <= 0)) {
            return res.status(400).json({ error: 'Informe um percentual de comissão válido para contrato COMISSAO' });
        }
        if (tipoContratoFinal === 'MISTO' && (!salarioFinal || salarioFinal <= 0) && (!comissaoFinal || comissaoFinal <= 0)) {
            return res.status(400).json({ error: 'Informe salário e/ou comissão válidos para contrato MISTO' });
        }

        const beneficiosJson = normalizarBeneficios(beneficios);
        const mensagemFinal = mensagem || observacoes || null;
        const dataValidadeFinal = normalizarDataOpcional(data_validade);
        const dataInicioFinal = normalizarDataOpcional(data_inicio_prevista);
        const periodoExpFinal = periodo_experiencia !== undefined && periodo_experiencia !== '' && periodo_experiencia !== null
            ? parseInt(periodo_experiencia, 10)
            : 90;

        const [result] = await db.query(
            `INSERT INTO propostas (
                motorista_pessoa_id,
                transportador_id,
                tipo,
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
                mensagem,
                disponibilidade,
                data_validade,
                data_inicio_prevista,
                status,
                criado_por
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDENTE', ?)`,
            [
                motoristaIdFinal,
                transportadorIdFinal,
                tipo,
                tipoContratoFinal,
                salarioFinal,
                comissaoFinal,
                adiantamentoFinal,
                beneficiosJson,
                carga_horaria || null,
                dias_descanso || null,
                ferias_remuneradas !== undefined ? (ferias_remuneradas ? 1 : 0) : 1,
                decimo_terceiro !== undefined ? (decimo_terceiro ? 1 : 0) : 1,
                adicional_noturno !== undefined ? (adicional_noturno ? 1 : 0) : 0,
                Number.isNaN(periodoExpFinal) ? 90 : periodoExpFinal,
                mensagemFinal,
                disponibilidade || null,
                dataValidadeFinal,
                dataInicioFinal,
                userId
            ]
        );

        return res.status(201).json({
            message: 'Proposta enviada com sucesso',
            propostaId: result.insertId,
            tipo
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
        const motoristaId = transportadorId ? null : await getMotoristaPessoaId(userId, req.userRole);

        let query = '';
        const params = [];

        if (transportadorId) {
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
            return res.status(403).json({ error: 'Usuário não autorizado' });
        }

        const [rows] = await db.query(query, params);
        res.json({ data: rows.map(enriquecerProposta) });
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
        const motoristaId = transportadorId ? null : await getMotoristaPessoaId(userId, req.userRole);

        let query = '';
        const params = [];

        if (transportadorId) {
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
            return res.status(403).json({ error: 'Usuário não autorizado' });
        }

        const [rows] = await db.query(query, params);
        res.json({ data: rows.map(enriquecerProposta) });
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
        const motoristaId = await getMotoristaPessoaId(userId, req.userRole);

        if (proposta.transportador_id !== transportadorId &&
            proposta.motorista_pessoa_id !== motoristaId) {
            return res.status(403).json({
                error: 'Você não tem permissão para ver esta proposta'
            });
        }

        res.json({ data: enriquecerProposta(proposta) });
    } catch (error) {
        console.error('Erro ao buscar proposta:', error);
        res.status(500).json({ error: 'Erro ao buscar proposta' });
    }
};

// ============================================
// 5. ACEITAR PROPOSTA (E CRIAR VÍNCULO + CONTRATO)
// ============================================
const aceitarProposta = async (req, res) => {
    let conn;
    try {
        const { id } = req.params;
        const userId = req.userId;

        conn = await db.getConnection();
        await conn.beginTransaction();

        // 1. Bloqueia a proposta para evitar aceite duplicado concorrente
        const [propostaRows] = await conn.query(
            `SELECT p.*,
                    (p.data_validade IS NOT NULL AND p.data_validade < CURDATE()) AS expirada
             FROM propostas p
             WHERE p.id = ?
             FOR UPDATE`,
            [id]
        );

        if (propostaRows.length === 0) {
            await conn.rollback();
            return res.status(404).json({ error: 'Proposta não encontrada' });
        }

        const proposta = propostaRows[0];

        if (!STATUS_ATIVOS_PROPOSTA.includes(proposta.status)) {
            await conn.rollback();
            return res.status(400).json({
                error: `Não é possível aceitar uma proposta com status ${proposta.status}`
            });
        }

        if (proposta.expirada) {
            await conn.query(
                "UPDATE propostas SET status = 'EXPIRADA' WHERE id = ?",
                [id]
            );
            await conn.commit();
            return res.status(400).json({
                error: 'Esta proposta expirou e não pode mais ser aceita'
            });
        }

        // 2. Valida autorização de quem está aceitando (respeitando turno em contrapropostas)
        const transportadorId = await getTransportadorId(userId, conn);
        const motoristaId = transportadorId ? null : await getMotoristaPessoaId(userId, req.userRole, conn);
        const quemDeveResponder = getQuemDeveResponder(proposta);

        if (quemDeveResponder === 'MOTORISTA') {
            if (!motoristaId || proposta.motorista_pessoa_id !== motoristaId) {
                await conn.rollback();
                return res.status(403).json({
                    error: 'Apenas o motorista destinatário pode aceitar esta proposta'
                });
            }
        } else if (quemDeveResponder === 'FROTA') {
            if (!transportadorId || proposta.transportador_id !== transportadorId) {
                await conn.rollback();
                return res.status(403).json({
                    error: 'Apenas a frota destinatária pode aceitar esta proposta'
                });
            }
        } else {
            await conn.rollback();
            return res.status(403).json({ error: 'Usuário não autorizado a aceitar esta proposta' });
        }

        // 3. Bloqueia o registro do motorista e verifica se já possui vínculo ativo com alguma frota
        const [mvRows] = await conn.query(
            'SELECT * FROM motoristas_vinculados WHERE pessoa_id = ? FOR UPDATE',
            [proposta.motorista_pessoa_id]
        );

        const mvAtual = mvRows.length > 0 ? mvRows[0] : null;
        const possuiVinculoAtivo = Boolean(
            mvAtual &&
            mvAtual.transportador_id !== null &&
            STATUS_VINCULO_ATIVO.includes(mvAtual.status)
        );

        if (possuiVinculoAtivo) {
            await conn.rollback();
            const mensagemBloqueio = quemDeveResponder === 'MOTORISTA'
                ? 'Você já possui vínculo ativo com uma frota. Finalize seu vínculo atual em "Minha Frota" antes de aceitar uma nova proposta.'
                : 'Este motorista já possui vínculo ativo com outra frota e não pode ser vinculado no momento.';
            return res.status(400).json({ error: mensagemBloqueio });
        }

        // 4. Cria ou atualiza o vínculo na tabela motoristas_vinculados (somente colunas reais)
        let motoristaVinculadoId;
        const dadosAnteriores = mvAtual
            ? {
                transportador_id: mvAtual.transportador_id,
                status: mvAtual.status,
                data_admissao: mvAtual.data_admissao,
                data_demissao: mvAtual.data_demissao
            }
            : null;

        if (mvAtual) {
            await conn.query(
                `UPDATE motoristas_vinculados
                 SET transportador_id = ?,
                     status = 'ATIVO',
                     data_admissao = CURDATE(),
                     data_demissao = NULL
                 WHERE id = ?`,
                [proposta.transportador_id, mvAtual.id]
            );
            motoristaVinculadoId = mvAtual.id;
        } else {
            // Fallback defensivo caso o motorista ainda não tenha linha em motoristas_vinculados
            const [transpCnh] = await conn.query(
                'SELECT cnh, cnh_categoria, cnh_validade FROM transportadores WHERE pessoa_id = ? LIMIT 1',
                [proposta.motorista_pessoa_id]
            );
            const cnh = transpCnh[0]?.cnh || 'PENDENTE';
            const cnhCategoria = transpCnh[0]?.cnh_categoria || 'B';
            const cnhValidade = transpCnh[0]?.cnh_validade || '2099-12-31';

            const [insertMv] = await conn.query(
                `INSERT INTO motoristas_vinculados (
                    pessoa_id,
                    transportador_id,
                    cnh,
                    cnh_categoria,
                    cnh_validade,
                    data_admissao,
                    status
                ) VALUES (?, ?, ?, ?, ?, CURDATE(), 'ATIVO')`,
                [
                    proposta.motorista_pessoa_id,
                    proposta.transportador_id,
                    cnh,
                    cnhCategoria,
                    cnhValidade
                ]
            );
            motoristaVinculadoId = insertMv.insertId;
        }

        // 5. Atualiza status de vínculo na tabela pessoas
        await conn.query(
            `UPDATE pessoas
             SET tipo_vinculo_motorista = 'VINCULADO',
                 data_vinculo = NOW(),
                 data_desvinculo = NULL
             WHERE id = ?`,
            [proposta.motorista_pessoa_id]
        );

        // 6. Encerra eventuais contratos antigos ainda abertos por segurança
        await conn.query(
            `UPDATE contratos
             SET status = 'ENCERRADO',
                 data_fim = COALESCE(data_fim, CURDATE()),
                 motivo_encerramento = COALESCE(motivo_encerramento, 'Encerrado automaticamente ao iniciar novo vínculo')
             WHERE motorista_vinculado_id = ?
               AND status IN ('ATIVO', 'EM_EXPERIENCIA')`,
            [motoristaVinculadoId]
        );

        // 7. Cria o contrato correspondente na tabela contratos (3FN)
        const beneficiosContrato = normalizarBeneficios(proposta.beneficios);
        const [contratoResult] = await conn.query(
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
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, COALESCE(?, CURDATE()), 'EM_EXPERIENCIA', ?)`,
            [
                motoristaVinculadoId,
                proposta.transportador_id,
                proposta.id,
                proposta.tipo_contrato,
                proposta.valor_salario,
                proposta.valor_comissao,
                proposta.valor_adiantamento,
                beneficiosContrato,
                proposta.carga_horaria,
                proposta.dias_descanso,
                proposta.ferias_remuneradas ?? 1,
                proposta.decimo_terceiro ?? 1,
                proposta.adicional_noturno ?? 0,
                proposta.periodo_experiencia ?? 90,
                proposta.data_inicio_prevista || null,
                userId
            ]
        );

        const contratoId = contratoResult.insertId;

        // 8. Atualiza a proposta para ACEITA e vincula o contrato criado
        await conn.query(
            `UPDATE propostas
             SET status = 'ACEITA',
                 contrato_id = ?,
                 data_resposta = NOW()
             WHERE id = ?`,
            [contratoId, id]
        );

        // 9. Registra auditoria no historico_vinculos
        await conn.query(
            `INSERT INTO historico_vinculos (
                motorista_vinculado_id,
                transportador_id,
                contrato_id,
                acao,
                dados_anteriores,
                dados_novos,
                observacoes,
                data_acao,
                criado_por
            ) VALUES (?, ?, ?, 'VINCULACAO', ?, ?, ?, NOW(), ?)`,
            [
                motoristaVinculadoId,
                proposta.transportador_id,
                contratoId,
                dadosAnteriores ? JSON.stringify(dadosAnteriores) : null,
                JSON.stringify({
                    transportador_id: proposta.transportador_id,
                    status: 'ATIVO',
                    proposta_id: proposta.id,
                    contrato_id: contratoId,
                    tipo_contrato: proposta.tipo_contrato
                }),
                `Vínculo criado mediante aceite da proposta #${proposta.id}`,
                userId
            ]
        );

        await conn.commit();

        return res.json({
            message: 'Proposta aceita e motorista vinculado com sucesso!',
            proposta_id: parseInt(id, 10),
            motorista_vinculado_id: motoristaVinculadoId,
            contrato_id: contratoId
        });
    } catch (error) {
        if (conn) {
            try {
                await conn.rollback();
            } catch (rollbackErr) {
                console.error('Erro no rollback ao aceitar proposta:', rollbackErr);
            }
        }
        console.error('Erro ao aceitar proposta:', error);
        return res.status(500).json({ error: 'Erro interno ao aceitar proposta' });
    } finally {
        if (conn) conn.release();
    }
};

// ============================================
// 6. RECUSAR PROPOSTA
// ============================================
const recusarProposta = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;
        const { motivo } = req.body || {};

        const [propostaRows] = await db.query(
            'SELECT * FROM propostas WHERE id = ?',
            [id]
        );

        if (propostaRows.length === 0) {
            return res.status(404).json({ error: 'Proposta não encontrada' });
        }

        const proposta = propostaRows[0];

        if (!STATUS_ATIVOS_PROPOSTA.includes(proposta.status)) {
            return res.status(400).json({
                error: 'Apenas propostas pendentes ou modificadas podem ser recusadas'
            });
        }

        const transportadorId = await getTransportadorId(userId);
        const motoristaId = transportadorId ? null : await getMotoristaPessoaId(userId, req.userRole);
        const quemDeveResponder = getQuemDeveResponder(proposta);

        if (quemDeveResponder === 'MOTORISTA') {
            if (!motoristaId || proposta.motorista_pessoa_id !== motoristaId) {
                return res.status(403).json({
                    error: 'Apenas o motorista destinatário pode recusar esta proposta'
                });
            }
        } else if (quemDeveResponder === 'FROTA') {
            if (!transportadorId || proposta.transportador_id !== transportadorId) {
                return res.status(403).json({
                    error: 'Apenas a frota destinatária pode recusar esta proposta'
                });
            }
        } else {
            return res.status(403).json({ error: 'Usuário não autorizado' });
        }

        const historico = parseHistorico(proposta.historico_negociacao);
        historico.push({
            data: new Date().toISOString(),
            quem: quemDeveResponder,
            acao: 'RECUSADA',
            mensagem: motivo || 'Recusada pelo destinatário'
        });

        await db.query(
            `UPDATE propostas
             SET status = 'RECUSADA',
                 data_resposta = NOW(),
                 mensagem = ?,
                 historico_negociacao = ?
             WHERE id = ?`,
            [motivo || 'Recusada pelo destinatário', JSON.stringify(historico), id]
        );

        res.json({
            message: 'Proposta recusada com sucesso',
            id: parseInt(id, 10)
        });
    } catch (error) {
        console.error('Erro ao recusar proposta:', error);
        res.status(500).json({ error: 'Erro ao recusar proposta' });
    }
};

// ============================================
// 7. ENVIAR CONTRAPROPOSTA
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
            `SELECT p.*,
                    (p.data_validade IS NOT NULL AND p.data_validade < CURDATE()) AS expirada
             FROM propostas p
             WHERE p.id = ?`,
            [id]
        );

        if (propostaRows.length === 0) {
            return res.status(404).json({ error: 'Proposta não encontrada' });
        }

        const proposta = propostaRows[0];

        if (!STATUS_ATIVOS_PROPOSTA.includes(proposta.status)) {
            return res.status(400).json({
                error: 'Apenas propostas pendentes ou modificadas podem receber contraproposta'
            });
        }

        if (proposta.expirada) {
            return res.status(400).json({
                error: 'Esta proposta expirou e não pode mais ser negociada'
            });
        }

        const transportadorId = await getTransportadorId(userId);
        const motoristaId = transportadorId ? null : await getMotoristaPessoaId(userId, req.userRole);
        const quemDeveResponder = getQuemDeveResponder(proposta);

        if (quemDeveResponder === 'MOTORISTA') {
            if (!motoristaId || proposta.motorista_pessoa_id !== motoristaId) {
                return res.status(403).json({
                    error: 'Apenas o motorista destinatário pode enviar contraproposta neste momento'
                });
            }
        } else if (quemDeveResponder === 'FROTA') {
            if (!transportadorId || proposta.transportador_id !== transportadorId) {
                return res.status(403).json({
                    error: 'Apenas a frota destinatária pode enviar contraproposta neste momento'
                });
            }
        } else {
            return res.status(403).json({ error: 'Usuário não autorizado' });
        }

        const tipoContratoFinal = tipo_contrato
            ? tipo_contrato.toString().toUpperCase()
            : proposta.tipo_contrato;

        if (!TIPOS_CONTRATO_VALIDOS.includes(tipoContratoFinal)) {
            return res.status(400).json({
                error: 'Tipo de contrato inválido. Utilize SALARIO, COMISSAO ou MISTO'
            });
        }

        const salarioNovo = valor_salario !== undefined
            ? parseDecimalOpcional(valor_salario)
            : proposta.valor_salario;
        const comissaoNova = valor_comissao !== undefined
            ? parseDecimalOpcional(valor_comissao)
            : proposta.valor_comissao;
        const adiantamentoNovo = valor_adiantamento !== undefined
            ? parseDecimalOpcional(valor_adiantamento)
            : proposta.valor_adiantamento;

        if (Number.isNaN(salarioNovo) || Number.isNaN(comissaoNova) || Number.isNaN(adiantamentoNovo)) {
            return res.status(400).json({ error: 'Valores financeiros inválidos' });
        }

        if (tipoContratoFinal === 'SALARIO' && (!salarioNovo || Number(salarioNovo) <= 0)) {
            return res.status(400).json({ error: 'Informe um valor de salário válido para contrato SALARIO' });
        }
        if (tipoContratoFinal === 'COMISSAO' && (!comissaoNova || Number(comissaoNova) <= 0)) {
            return res.status(400).json({ error: 'Informe um percentual de comissão válido para contrato COMISSAO' });
        }
        if (tipoContratoFinal === 'MISTO' && (!salarioNovo || Number(salarioNovo) <= 0) && (!comissaoNova || Number(comissaoNova) <= 0)) {
            return res.status(400).json({ error: 'Informe salário e/ou comissão válidos para contrato MISTO' });
        }

        const beneficiosFinal = beneficios !== undefined
            ? normalizarBeneficios(beneficios)
            : normalizarBeneficios(proposta.beneficios);

        const historico = parseHistorico(proposta.historico_negociacao);
        historico.push({
            data: new Date().toISOString(),
            quem: quemDeveResponder,
            acao: 'CONTRAPROPOSTA',
            mensagem: mensagem || 'Contraproposta enviada',
            valor_salario: salarioNovo,
            valor_comissao: comissaoNova,
            valor_adiantamento: adiantamentoNovo,
            tipo_contrato: tipoContratoFinal
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
                salarioNovo,
                comissaoNova,
                adiantamentoNovo,
                tipoContratoFinal,
                beneficiosFinal,
                carga_horaria !== undefined ? (carga_horaria || null) : proposta.carga_horaria,
                dias_descanso !== undefined ? (dias_descanso || null) : proposta.dias_descanso,
                ferias_remuneradas !== undefined ? (ferias_remuneradas ? 1 : 0) : proposta.ferias_remuneradas,
                decimo_terceiro !== undefined ? (decimo_terceiro ? 1 : 0) : proposta.decimo_terceiro,
                adicional_noturno !== undefined ? (adicional_noturno ? 1 : 0) : proposta.adicional_noturno,
                periodo_experiencia !== undefined && periodo_experiencia !== '' && periodo_experiencia !== null
                    ? parseInt(periodo_experiencia, 10)
                    : proposta.periodo_experiencia,
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
            proposta: enriquecerProposta(updated[0])
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
        const motoristaId = transportadorId ? null : await getMotoristaPessoaId(userId, req.userRole);

        const isEnviador = (proposta.tipo === 'FROTA_PARA_MOTORISTA' &&
                            proposta.transportador_id === transportadorId) ||
                           (proposta.tipo === 'MOTORISTA_PARA_FROTA' &&
                            proposta.motorista_pessoa_id === motoristaId);

        if (!isEnviador) {
            return res.status(403).json({
                error: 'Apenas quem enviou a proposta pode cancelá-la'
            });
        }

        if (!STATUS_ATIVOS_PROPOSTA.includes(proposta.status)) {
            return res.status(400).json({
                error: 'Apenas propostas pendentes ou modificadas podem ser canceladas'
            });
        }

        await db.query(
            `UPDATE propostas SET status = 'CANCELADA', data_resposta = NOW() WHERE id = ?`,
            [id]
        );

        res.json({
            message: 'Proposta cancelada com sucesso',
            id: parseInt(id, 10)
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
