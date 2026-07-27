const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token não fornecido' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;
        req.userEmail = decoded.email;
        req.userRole = decoded.tipo;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Token inválido ou expirado' });
    }
};
 const isAdmin = async (req, res, next) => {
    try {
        const db = require('../config/database');
        
        const [rows] = await db.execute(
            'SELECT is_admin FROM pessoas WHERE id = ?',
            [req.userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: 'Usuário não encontrado' 
            });
        }

        if (!rows[0].is_admin) {
            return res.status(403).json({ 
                success: false, 
                message: 'Acesso negado. Apenas administradores podem acessar esta rota.' 
            });
        }

        next();
    } catch (error) {
        console.error('Erro ao verificar admin:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Erro interno ao verificar permissões' 
        });
    }
};

module.exports = { authenticateToken, isAdmin };