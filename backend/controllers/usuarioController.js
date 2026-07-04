const db = require('../config/database');

const listarUsuarios = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, tipo_pessoa, nome_razao_social, email, telefone, status FROM pessoas');
        res.json({ data: rows, total: rows.length });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar usuários' });
    }
};

const buscarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT id, tipo_pessoa, nome_razao_social, email, telefone, status FROM pessoas WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }
        res.json({ data: rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar usuário' });
    }
};

const atualizarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const { nome_razao_social, email, telefone } = req.body;
        
        await db.query('UPDATE pessoas SET nome_razao_social = ?, email = ?, telefone = ? WHERE id = ?', 
            [nome_razao_social, email, telefone, id]);
        
        res.json({ message: 'Usuário atualizado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
};

const deletarUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM pessoas WHERE id = ?', [id]);
        res.json({ message: 'Usuário deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar usuário' });
    }
};

const alterarStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        await db.query('UPDATE pessoas SET status = ? WHERE id = ?', [status, id]);
        res.json({ message: 'Status atualizado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao alterar status' });
    }
};

module.exports = { listarUsuarios, buscarUsuario, atualizarUsuario, deletarUsuario, alterarStatus };