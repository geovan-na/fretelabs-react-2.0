// controllers/avaliacaoController.js
const db = require('../config/database');

const criarAvaliacao = async (req, res) => {
    try {
        const { 
            frete_id, 
            avaliado_id, 
            nota_geral, 
            nota_pontualidade, 
            nota_comunicacao, 
            nota_cuidado_carga, 
            comentario, 
            tipo_avaliacao 
        } = req.body;

        console.log('Criando avaliação:', { frete_id, avaliado_id, tipo_avaliacao });

        // Verificar se o frete existe e está concluído
        const [frete] = await db.query('SELECT status FROM fretes WHERE id = ?', [frete_id]);
        if (frete.length === 0) {
            return res.status(404).json({ error: 'Frete não encontrado' });
        }
        if (frete[0].status !== 'CONCLUIDO') {
            return res.status(400).json({ error: 'Apenas fretes concluídos podem ser avaliados' });
        }

        // Verificar se o usuário já avaliou este frete
        const [existente] = await db.query(
            'SELECT id FROM avaliacoes WHERE frete_id = ? AND avaliador_id = ?',
            [frete_id, req.userId]
        );
        if (existente.length > 0) {
            return res.status(400).json({ error: 'Você já avaliou este frete' });
        }

        // Verificar se o avaliado existe
        const [avaliado] = await db.query('SELECT id FROM pessoas WHERE id = ?', [avaliado_id]);
        if (avaliado.length === 0) {
            return res.status(404).json({ error: 'Usuário avaliado não encontrado' });
        }

        // Inserir avaliação
        const [result] = await db.query(`
            INSERT INTO avaliacoes 
            (frete_id, avaliador_id, avaliado_id, tipo_avaliacao, 
             nota_geral, nota_pontualidade, nota_comunicacao, nota_cuidado_carga, comentario) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
            frete_id, 
            req.userId, 
            avaliado_id, 
            tipo_avaliacao, 
            nota_geral, 
            nota_pontualidade, 
            nota_comunicacao, 
            nota_cuidado_carga, 
            comentario || null
        ]);

        // Atualizar média do avaliado
        const [media] = await db.query(`
            SELECT AVG(nota_geral) as media, COUNT(*) as total 
            FROM avaliacoes WHERE avaliado_id = ?
        `, [avaliado_id]);

        // Atualizar a média na tabela apropriada
        if (tipo_avaliacao === 'EMPRESA_TRANSPORTADOR') {
            // Embarcador avaliando transportador
            await db.query(
                'UPDATE transportadores SET avaliacao_media = ?, total_avaliacoes = ? WHERE pessoa_id = ?',
                [media[0].media || 0, media[0].total || 0, avaliado_id]
            );
        } else {
            // Transportador avaliando embarcador
            await db.query(
                'UPDATE embarcadores SET score_credito = ? WHERE pessoa_id = ?',
                [media[0].media || 0, avaliado_id]
            );
        }

        res.status(201).json({ 
            message: 'Avaliação enviada com sucesso', 
            id: result.insertId 
        });
    } catch (error) {
        console.error('Erro ao criar avaliação:', error);
        res.status(500).json({ error: 'Erro ao criar avaliação' });
    }
};

const listarMinhasAvaliacoes = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                a.*, 
                p.nome_razao_social as avaliador_nome, 
                f.origem_cep, 
                f.destino_cep,
                f.id as frete_id
            FROM avaliacoes a
            JOIN pessoas p ON a.avaliador_id = p.id
            JOIN fretes f ON a.frete_id = f.id
            WHERE a.avaliado_id = ?
            ORDER BY a.data_avaliacao DESC
        `, [req.userId]);

        res.json({ data: rows });
    } catch (error) {
        console.error('Erro ao listar avaliações:', error);
        res.status(500).json({ error: 'Erro ao listar avaliações' });
    }
};

const listarAvaliacoesRecebidas = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT 
                a.*, 
                p.nome_razao_social as avaliador_nome,
                f.id as frete_id
            FROM avaliacoes a
            JOIN pessoas p ON a.avaliador_id = p.id
            JOIN fretes f ON a.frete_id = f.id
            WHERE a.avaliado_id = ?
            ORDER BY a.data_avaliacao DESC
        `, [req.userId]);

        res.json({ data: rows });
    } catch (error) {
        console.error('Erro ao listar avaliações recebidas:', error);
        res.status(500).json({ error: 'Erro ao listar avaliações' });
    }
};

const verificarSeJaAvaliou = async (req, res) => {
    try {
        const { frete_id } = req.params;
        
        const [rows] = await db.query(
            'SELECT id FROM avaliacoes WHERE frete_id = ? AND avaliador_id = ?',
            [frete_id, req.userId]
        );

        res.json({ 
            jaAvaliou: rows.length > 0,
            avaliacaoId: rows.length > 0 ? rows[0].id : null
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