const db = require('../config/database');

const listarEnderecos = async (req, res) => {
    try {
        const { pessoa_id } = req.params;
        const [rows] = await db.query('SELECT * FROM enderecos WHERE pessoa_id = ? ORDER BY principal DESC', [pessoa_id]);
        res.json({ data: rows, total: rows.length });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar endereços' });
    }
};

const criarEndereco = async (req, res) => {
    try {
        const { pessoa_id, tipo_endereco, cep, logradouro, numero, complemento, bairro, cidade, estado, principal } = req.body;
        
        if (principal) {
            await db.query('UPDATE enderecos SET principal = false WHERE pessoa_id = ?', [pessoa_id]);
        }
        
        const [result] = await db.query(
            `INSERT INTO enderecos (pessoa_id, tipo_endereco, cep, logradouro, numero, complemento, bairro, cidade, estado, principal) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [pessoa_id, tipo_endereco, cep, logradouro, numero, complemento, bairro, cidade, estado, principal || false]
        );
        
        res.status(201).json({ message: 'Endereço cadastrado com sucesso', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao cadastrar endereço' });
    }
};

const atualizarEndereco = async (req, res) => {
    try {
        const { id } = req.params;
        const { tipo_endereco, cep, logradouro, numero, complemento, bairro, cidade, estado, principal } = req.body;
        
        const [endereco] = await db.query('SELECT pessoa_id FROM enderecos WHERE id = ?', [id]);
        if (endereco.length > 0 && principal) {
            await db.query('UPDATE enderecos SET principal = false WHERE pessoa_id = ? AND id != ?', [endereco[0].pessoa_id, id]);
        }
        
        await db.query(
            `UPDATE enderecos SET tipo_endereco = ?, cep = ?, logradouro = ?, numero = ?, complemento = ?, bairro = ?, cidade = ?, estado = ?, principal = ? WHERE id = ?`,
            [tipo_endereco, cep, logradouro, numero, complemento, bairro, cidade, estado, principal || false, id]
        );
        
        res.json({ message: 'Endereço atualizado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar endereço' });
    }
};

const deletarEndereco = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM enderecos WHERE id = ?', [id]);
        res.json({ message: 'Endereço deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar endereço' });
    }
};

module.exports = { listarEnderecos, criarEndereco, atualizarEndereco, deletarEndereco };