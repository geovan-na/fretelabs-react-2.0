const db = require('../config/database');

const listar = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM notificacoes WHERE usuario_id = ? ORDER BY data_criacao DESC LIMIT 50',
            [req.userId]
        );
        const [naoLidas] = await db.query(
            'SELECT COUNT(*) as total FROM notificacoes WHERE usuario_id = ? AND lida = false',
            [req.userId]
        );
        res.json({ data: rows, naoLidas: naoLidas[0].total });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar notificações' });
    }
};

const marcarComoLida = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('UPDATE notificacoes SET lida = true, data_leitura = NOW() WHERE id = ?', [id]);
        res.json({ message: 'Notificação marcada como lida' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao marcar notificação' });
    }
};

const marcarTodasComoLidas = async (req, res) => {
    try {
        await db.query('UPDATE notificacoes SET lida = true, data_leitura = NOW() WHERE usuario_id = ?', [req.userId]);
        res.json({ message: 'Todas notificações marcadas como lidas' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao marcar notificações' });
    }
};

const criarNotificacao = async (usuarioId, titulo, mensagem, tipo = 'info', link = null) => {
    try {
        await db.query(
            'INSERT INTO notificacoes (usuario_id, titulo, mensagem, tipo, link) VALUES (?, ?, ?, ?, ?)',
            [usuarioId, titulo, mensagem, tipo, link]
        );
    } catch (error) {
        console.error('Erro ao criar notificação:', error);
    }
};

const deletar = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM notificacoes WHERE id = ?', [id]);
        res.json({ message: 'Notificação removida' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar notificação' });
    }
};

module.exports = { listar, marcarComoLida, marcarTodasComoLidas, criarNotificacao, deletar };