const db = require('../config/database');

const criarAvaliacao = async (req, res) => {
    try {
        const { frete_id, avaliado_id, nota_geral, nota_pontualidade, nota_comunicacao, nota_cuidado_carga, comentario, tipo_avaliacao } = req.body;
        
        // Verificar se o frete já foi concluído
        const [frete] = await db.query('SELECT status FROM fretes WHERE id = ?', [frete_id]);
        if (frete.length === 0 || frete[0].status !== 'CONCLUIDO') {
            return res.status(400).json({ error: 'Apenas fretes concluídos podem ser avaliados' });
        }
        
        // Verificar se já existe avaliação
        const [existente] = await db.query(
            'SELECT id FROM avaliacoes WHERE frete_id = ? AND avaliador_id = ?',
            [frete_id, req.userId]
        );
        if (existente.length > 0) {
            return res.status(400).json({ error: 'Você já avaliou este frete' });
        }
        
        const [result] = await db.query(`
            INSERT INTO avaliacoes 
            (frete_id, avaliador_id, avaliado_id, tipo_avaliacao, nota_geral, nota_pontualidade, nota_comunicacao, nota_cuidado_carga, comentario) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [frete_id, req.userId, avaliado_id, tipo_avaliacao, nota_geral, nota_pontualidade, nota_comunicacao, nota_cuidado_carga, comentario]);
        
        // Atualizar média do avaliado
        const [media] = await db.query(`
            SELECT AVG(nota_geral) as media, COUNT(*) as total 
            FROM avaliacoes WHERE avaliado_id = ?
        `, [avaliado_id]);
        
        if (tipo_avaliacao === 'EMPRESA_TRANSPORTADOR') {
            await db.query(
                'UPDATE transportadores SET avaliacao_media = ?, total_avaliacoes = ? WHERE pessoa_id = ?',
                [media[0].media, media[0].total, avaliado_id]
            );
        } else {
            await db.query(
                'UPDATE embarcadores SET score_credito = ? WHERE pessoa_id = ?',
                [media[0].media, avaliado_id]
            );
        }
        
        res.status(201).json({ message: 'Avaliação enviada', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar avaliação' });
    }
};

const listarMinhasAvaliacoes = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT a.*, p.nome_razao_social as avaliador_nome, f.origem_cep, f.destino_cep
            FROM avaliacoes a
            JOIN pessoas p ON a.avaliador_id = p.id
            JOIN fretes f ON a.frete_id = f.id
            WHERE a.avaliado_id = ?
            ORDER BY a.data_avaliacao DESC
        `, [req.userId]);
        res.json({ data: rows });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar avaliações' });
    }
};

const listarAvaliacoesRecebidas = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT a.*, p.nome_razao_social as avaliador_nome
            FROM avaliacoes a
            JOIN pessoas p ON a.avaliador_id = p.id
            WHERE a.avaliado_id = ?
            ORDER BY a.data_avaliacao DESC
        `, [req.userId]);
        res.json({ data: rows });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar avaliações' });
    }
};

module.exports = { criarAvaliacao, listarMinhasAvaliacoes, listarAvaliacoesRecebidas };