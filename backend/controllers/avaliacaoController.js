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

        // 1. Verificar se o frete existe e buscar os envolvidos
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

        // Auto-resolver o avaliado_id e tipo_avaliacao se não foram passados
        if (!avaliado_id || !tipo_avaliacao) {
            if (userId === frete.embarcador_pessoa_id) {
                // Usuário logado é o Embarcador -> avalia o Transportador
                avaliado_id = frete.transportador_pessoa_id;
                tipo_avaliacao = 'EMPRESA_TRANSPORTADOR';
            } else if (userId === frete.transportador_pessoa_id || (frete.motorista_pessoa_id && userId === frete.motorista_pessoa_id)) {
                // Usuário logado é o Transportador (Frota/Autônomo/Vinculado) -> avalia o Embarcador
                avaliado_id = frete.embarcador_pessoa_id;
                tipo_avaliacao = 'TRANSPORTADOR_EMPRESA';
            } else {
                return res.status(403).json({ error: 'Apenas o embarcador ou o transportador deste frete podem avaliá-lo.' });
            }
        }

        if (!avaliado_id) {
            return res.status(400).json({ error: 'Não foi possível identificar o participante a ser avaliado.' });
        }

        // 2. Verificar se o usuário já avaliou este frete
        const [existente] = await db.query(
            'SELECT id FROM avaliacoes WHERE frete_id = ? AND avaliador_id = ?',
            [frete_id, userId]
        );
        if (existente.length > 0) {
            return res.status(400).json({ error: 'Você já avaliou este frete.' });
        }

        // 3. Normalizar notas de 1 a 5
        const notaGeralFinal = Math.min(5, Math.max(1, parseInt(nota_geral) || 5));
        const notaPontualidadeFinal = Math.min(5, Math.max(1, parseInt(nota_pontualidade) || notaGeralFinal));
        const notaComunicacaoFinal = Math.min(5, Math.max(1, parseInt(nota_comunicacao) || notaGeralFinal));
        const notaCuidadoCargaFinal = Math.min(5, Math.max(1, parseInt(nota_cuidado_carga) || notaGeralFinal));

        // 4. Inserir avaliação
        const [result] = await db.query(`
            INSERT INTO avaliacoes 
            (frete_id, avaliador_id, avaliado_id, tipo_avaliacao, 
             nota_geral, nota_pontualidade, nota_comunicacao, nota_cuidado_carga, comentario) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
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

        // 5. Recalcular média e total de avaliações do usuário avaliado
        const [mediaResult] = await db.query(`
            SELECT AVG(nota_geral) as media, COUNT(*) as total 
            FROM avaliacoes WHERE avaliado_id = ?
        `, [avaliado_id]);

        const mediaNota = parseFloat(mediaResult[0].media || 0).toFixed(1);
        const totalAvaliacoes = mediaResult[0].total || 0;

        if (tipo_avaliacao === 'EMPRESA_TRANSPORTADOR') {
            await db.query(
                'UPDATE transportadores SET avaliacao_media = ?, total_avaliacoes = ? WHERE pessoa_id = ?',
                [mediaNota, totalAvaliacoes, avaliado_id]
            );
        } else {
            await db.query(
                'UPDATE embarcadores SET score_credito = ? WHERE pessoa_id = ?',
                [mediaNota, avaliado_id]
            );
        }

        console.log(`✅ Avaliação criada para o frete #${frete_id} de [${userId}] para [${avaliado_id}] - Nota: ${notaGeralFinal}`);

        res.status(201).json({ 
            message: 'Avaliação enviada com sucesso!', 
            id: result.insertId,
            mediaAtualizada: mediaNota
        });
    } catch (error) {
        console.error('Erro ao criar avaliação:', error);
        res.status(500).json({ error: error.message || 'Erro ao criar avaliação' });
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