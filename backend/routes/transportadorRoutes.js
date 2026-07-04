const express = require('express');
const router = express.Router();
const transportadorController = require('../controllers/transportadorController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/perfil', authenticateToken, transportadorController.getPerfil);
router.put('/perfil', authenticateToken, transportadorController.atualizarPerfil);
router.get('/estatisticas', authenticateToken, transportadorController.getEstatisticas);

module.exports = router;