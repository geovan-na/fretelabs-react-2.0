const db = require('../config/database');

const listarPorFrete = async (req, res) => {
    try {
        const { frete_id } = req.params;
        const [rows] = await db.query(
            'SELECT * FROM ocorrencias WHERE frete_id = ? ORDER BY data_ocorrencia DESC',
            [frete_id]
        );
        res.json({ data: rows });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar ocorrências' });
    }
};

const criarOcorrencia = async (req, res) => {
    try {
        const { frete_id, tipo, gravidade, descricao, latitude, longitude } = req.body;
        
        const [result] = await db.query(`
            INSERT INTO ocorrencias (frete_id, tipo, gravidade, descricao, latitude, longitude) 
            VALUES (?, ?, ?, ?, ?, ?)
        `, [frete_id, tipo, gravidade, descricao, latitude, longitude]);
        
        // Atualizar status do frete para indicar problema
        await db.query('UPDATE fretes SET status = "NEGOCIACAO" WHERE id = ?', [frete_id]);
        
        res.status(201).json({ message: 'Ocorrência registrada', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao registrar ocorrência' });
    }
};

const resolverOcorrencia = async (req, res) => {
    try {
        const { id } = req.params;
        const { solucao } = req.body;
        await db.query(
            'UPDATE ocorrencias SET resolvida = true, data_resolucao = NOW(), solucao = ? WHERE id = ?',
            [solucao, id]
        );
        res.json({ message: 'Ocorrência resolvida' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao resolver ocorrência' });
    }
};

const listarPorTransportador = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT o.*, f.origem_cep, f.destino_cep
            FROM ocorrencias o
            JOIN fretes f ON o.frete_id = f.id
            WHERE f.transportador_id = (SELECT id FROM transportadores WHERE pessoa_id = ?)
            ORDER BY o.data_ocorrencia DESC
        `, [req.userId]);
        res.json({ data: rows });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar ocorrências' });
    }
};

module.exports = { listarPorFrete, criarOcorrencia, resolverOcorrencia, listarPorTransportador };