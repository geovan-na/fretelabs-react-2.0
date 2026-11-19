// controllers/avaliacaoController.js
const db = require('../config/database');

const criarAvaliacao = async (req, res) => {
    try {
        let { 
            frete_id, 
            avaliado_id, 
            nota_geral, 
            nota_pontualidade, 
            nota_comunicacao, 
            nota_cuidado_carga, 
            comentario, 
            tipo_avaliacao 
        } = req.body;

        if (!frete_id) {
            return res.status(400).json({ error: 'O ID do frete é obrigatório' });
        }

        // 1. Verificar se o frete existe e buscar todos os envolvidos
        const [freteRows] = await db.query(`
            SELECT 
                f.id, 
                f.status, 
                f.embarcador_id, 
                f.transportador_id,
                f.motorista_vinculado_id,
                e.pessoa_id as embarcador_pessoa_id,
                t.pessoa_id as transportador_pessoa_id,
                mv.pessoa_id as motorista_pessoa_id
            FROM fretes f
            LEFT JOIN embarcadores e ON f.embarcador_id = e.id
            LEFT JOIN transportadores t ON f.transportador_id = t.id
            LEFT JOIN motoristas_vinculados mv ON f.motorista_vinculado_id = mv.id
            WHERE f.id = ?
        `, [frete_id]);

        if (freteRows.length === 0) {
            return res.status(404).json({ error: 'Frete não encontrado' });
        }

        const frete = freteRows[0];

        // Regra fundamental: Apenas fretes CONCLUIDOS podem ser avaliados
        if (frete.status !== 'CONCLUIDO') {
            return res.status(400).json({ error: 'Apenas fretes concluídos podem ser avaliados.' });
        }

        const userId = req.userId;

        // Resolvendo ID da pessoa do Embarcador
        let embarcadorPessoaId = frete.embarcador_pessoa_id;
        if (!embarcadorPessoaId && frete.embarcador_id) {
            const [pEmb] = await db.query('SELECT pessoa_id FROM embarcadores WHERE id = ?', [frete.embarcador_id]);
            if (pEmb.length > 0) embarcadorPessoaId = pEmb[0].pessoa_id;
        }

        // Resolvendo ID da pessoa do Transportador com fallbacks
        let transportadorPessoaId = frete.transportador_pessoa_id;
        if (!transportadorPessoaId && frete.transportador_id) {
            const [pTrans] = await db.query('SELECT pessoa_id FROM transportadores WHERE id = ?', [frete.transportador_id]);
            if (pTrans.length > 0) transportadorPessoaId = pTrans[0].pessoa_id;
        }

        // Fallback da candidatura aceita
        if (!transportadorPessoaId) {
            const [candRows] = await db.query(`
                SELECT t.pessoa_id, c.transportador_id
                FROM candidaturas c
                JOIN transportadores t ON c.transportador_id = t.id
                WHERE c.frete_id = ? AND c.status = 'ACEITO'
                LIMIT 1
            `, [frete_id]);
            if (candRows.length > 0) {
                transportadorPessoaId = candRows[0].pessoa_id;
                if (!frete.transportador_id && candRows[0].transportador_id) {
                    await db.query('UPDATE fretes SET transportador_id = ? WHERE id = ?', [candRows[0].transportador_id, frete_id]);
                }
            }
        }

        // Resolvendo ID da pessoa do motorista vinculado
        let motoristaPessoaId = frete.motorista_pessoa_id;
        if (!motoristaPessoaId && frete.motorista_vinculado_id) {
            const [pMot] = await db.query('SELECT pessoa_id FROM motoristas_vinculados WHERE id = ?', [frete.motorista_vinculado_id]);
            if (pMot.length > 0) motoristaPessoaId = pMot[0].pessoa_id;
        }

        // Verificar se avaliado_id fornecido pelo cliente é válido
        let avaliadoValido = false;
        if (avaliado_id) {
            const [pCheck] = await db.query('SELECT id FROM pessoas WHERE id = ?', [avaliado_id]);
            if (pCheck.length > 0 && Number(avaliado_id) !== Number(userId)) {
                avaliadoValido = true;
            }
        }

        // Se avaliado_id não for válido ou não for enviado, auto-resolver com inteligência
        if (!avaliadoValido) {
            // Verificar se o usuário logado é motorista vinculado à frota deste frete
            let isMotoristaDaFrota = false;
            if (frete.transportador_id) {
                const [motVinc] = await db.query(
                    'SELECT transportador_id FROM motoristas_vinculados WHERE pessoa_id = ?',
                    [userId]
                );
                if (motVinc.length > 0 && motVinc[0].transportador_id === frete.transportador_id) {
                    isMotoristaDaFrota = true;
                }
            }

            if (userId === embarcadorPessoaId) {
                // Usuário é o Embarcador -> avalia a Frota ou o Motorista
                avaliado_id = transportadorPessoaId || motoristaPessoaId;
                tipo_avaliacao = 'EMPRESA_TRANSPORTADOR';
            } else if (userId === transportadorPessoaId || userId === motoristaPessoaId || isMotoristaDaFrota) {
                // Usuário é o Transportador / Motorista -> avalia o Embarcador
                avaliado_id = embarcadorPessoaId;
                tipo_avaliacao = 'TRANSPORTADOR_EMPRESA';
            } else {
                // Fallback por eliminação
                if (embarcadorPessoaId && userId !== embarcadorPessoaId) {
                    avaliado_id = embarcadorPessoaId;
                    tipo_avaliacao = 'TRANSPORTADOR_EMPRESA';
                } else if (transportadorPessoaId && userId !== transportadorPessoaId) {
                    avaliado_id = transportadorPessoaId;
                    tipo_avaliacao = 'EMPRESA_TRANSPORTADOR';
                } else if (motoristaPessoaId && userId !== motoristaPessoaId) {
                    avaliado_id = motoristaPessoaId;
                    tipo_avaliacao = 'EMPRESA_TRANSPORTADOR';
                }
            }
        }

        if (!avaliado_id) {
            return res.status(400).json({ error: 'Não foi possível identificar o usuário a ser avaliado.' });
        }

        if (!tipo_avaliacao) {
            tipo_avaliacao = (userId === embarcadorPessoaId) ? 'EMPRESA_TRANSPORTADOR' : 'TRANSPORTADOR_EMPRESA';
        }

        // 2. Normalizar notas de 1 a 5
        const notaGeralFinal = Math.min(5, Math.max(1, parseInt(nota_geral, 10) || 5));
        const notaPontualidadeFinal = Math.min(5, Math.max(1, parseInt(nota_pontualidade, 10) || notaGeralFinal));
        const notaComunicacaoFinal = Math.min(5, Math.max(1, parseInt(nota_comunicacao, 10) || notaGeralFinal));
        const notaCuidadoCargaFinal = Math.min(5, Math.max(1, parseInt(nota_cuidado_carga, 10) || notaGeralFinal));

        // 3. Verificar se já avaliou este frete (se já avaliou, faz UPDATE; se não, faz INSERT)
        const [existente] = await db.query(
            'SELECT id FROM avaliacoes WHERE frete_id = ? AND avaliador_id = ?',
            [frete_id, userId]
        );

        let avaliacaoId;
        if (existente.length > 0) {
            avaliacaoId = existente[0].id;
            await db.query(`
                UPDATE avaliacoes 
                SET avaliado_id = ?, tipo_avaliacao = ?, 
                    nota_geral = ?, nota_pontualidade = ?, nota_comunicacao = ?, nota_cuidado_carga = ?, 
                    comentario = ?, data_avaliacao = NOW()
                WHERE id = ?
            `, [
                avaliado_id, 
                tipo_avaliacao, 
                notaGeralFinal, 
                notaPontualidadeFinal, 
                notaComunicacaoFinal, 
                notaCuidadoCargaFinal, 
                comentario || null,
                avaliacaoId
            ]);
        } else {
            const [result] = await db.query(`
                INSERT INTO avaliacoes 
                (frete_id, avaliador_id, avaliado_id, tipo_avaliacao, 
                 nota_geral, nota_pontualidade, nota_comunicacao, nota_cuidado_carga, comentario, data_avaliacao) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
            `, [
                frete_id, 
                userId, 
                avaliado_id, 
                tipo_avaliacao, 
                notaGeralFinal, 
                notaPontualidadeFinal, 
                notaComunicacaoFinal, 
                notaCuidadoCargaFinal, 
                comentario || null
            ]);
            avaliacaoId = result.insertId;
        }

        // 4. Recalcular média e total de avaliações do usuário avaliado
        const [mediaResult] = await db.query(`
            SELECT AVG(nota_geral) as media, COUNT(*) as total 
            FROM avaliacoes WHERE avaliado_id = ?
        `, [avaliado_id]);

        const mediaNota = parseFloat(mediaResult[0].media || 0).toFixed(1);
        const totalAvaliacoes = mediaResult[0].total || 0;

        if (tipo_avaliacao === 'EMPRESA_TRANSPORTADOR') {
            await db.query(
                'UPDATE transportadores SET avaliacao_media = ?, total_avaliacoes = ? WHERE pessoa_id = ? OR id = ?',
                [mediaNota, totalAvaliacoes, avaliado_id, avaliado_id]
            );
        } else {
            await db.query(
                'UPDATE embarcadores SET score_credito = ? WHERE pessoa_id = ? OR id = ?',
                [mediaNota, avaliado_id, avaliado_id]
            );
        }

        console.log(`✅ Avaliação processada para o frete #${frete_id} de [${userId}] para [${avaliado_id}] - Nota: ${notaGeralFinal}`);

        return res.status(201).json({ 
            message: 'Avaliação enviada com sucesso!', 
            id: avaliacaoId,
            mediaAtualizada: mediaNota
        });
    } catch (error) {
        console.error('Erro ao processar avaliação:', error);
        return res.status(500).json({ error: error.message || 'Erro ao processar avaliação' });
    }
};

const listarMinhasAvaliacoes = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                a.*, 
                p.nome_razao_social as avaliado_nome, 
                f.origem_cep, 
                f.destino_cep,
                f.id as frete_id
            FROM avaliacoes a
            JOIN pessoas p ON a.avaliado_id = p.id
            JOIN fretes f ON a.frete_id = f.id
            WHERE a.avaliador_id = ?
            ORDER BY a.data_avaliacao DESC
        `, [req.userId]);

        res.json({ data: rows });
    } catch (error) {
        console.error('Erro ao listar minhas avaliações enviadas:', error);
        res.status(500).json({ error: 'Erro ao listar avaliações enviadas' });
    }
};

const listarAvaliacoesRecebidas = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                a.*, 
                p.nome_razao_social as avaliador_nome,
                f.id as frete_id,
                f.origem_cep,
                f.destino_cep
            FROM avaliacoes a
            JOIN pessoas p ON a.avaliador_id = p.id
            JOIN fretes f ON a.frete_id = f.id
            WHERE a.avaliado_id = ?
            ORDER BY a.data_avaliacao DESC
        `, [req.userId]);

        res.json({ data: rows });
    } catch (error) {
        console.error('Erro ao listar avaliações recebidas:', error);
        res.status(500).json({ error: 'Erro ao listar avaliações recebidas' });
    }
};

const verificarSeJaAvaliou = async (req, res) => {
    try {
        const { frete_id } = req.params;
        
        const [rows] = await db.query(
            'SELECT * FROM avaliacoes WHERE frete_id = ? AND avaliador_id = ? LIMIT 1',
            [frete_id, req.userId]
        );

        res.json({ 
            jaAvaliou: rows.length > 0,
            avaliacao: rows.length > 0 ? rows[0] : null
        });
    } catch (error) {
        console.error('Erro ao verificar avaliação:', error);
        res.status(500).json({ error: 'Erro ao verificar avaliação' });
    }
};

module.exports = { 
    criarAvaliacao, 
    listarMinhasAvaliacoes, 
    listarAvaliacoesRecebidas,
    verificarSeJaAvaliou
};
