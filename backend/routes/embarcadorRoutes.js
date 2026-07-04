// routes/embarcadorRoutes.js
const express = require('express');
const router = express.Router();
const embarcadorController = require('../controllers/embarcadorController');
const { authenticateToken } = require('../middleware/authMiddleware');
const db = require('../config/database');

router.get('/perfil', authenticateToken, embarcadorController.getPerfil);
router.put('/perfil', authenticateToken, embarcadorController.atualizarPerfil);
router.get('/estatisticas', authenticateToken, embarcadorController.getEstatisticas);

// Nova rota para buscar embarcador por pessoa_id
router.get('/pessoa/:pessoa_id', authenticateToken, async (req, res) => {
    try {
        const { pessoa_id } = req.params;
        
        const [rows] = await db.query(
            'SELECT id FROM embarcadores WHERE pessoa_id = ?',
            [pessoa_id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Embarcador nao encontrado' });
        }
        
        res.json({ id: rows[0].id });
    } catch (error) {
        console.error('Erro ao buscar embarcador:', error);
        res.status(500).json({ error: 'Erro ao buscar embarcador' });
    }
});

module.exports = router;