// routes/avaliacaoRoutes.js
const express = require('express');
const router = express.Router();
const avaliacaoController = require('../controllers/avaliacaoController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Rotas
router.post('/', authenticateToken, avaliacaoController.criarAvaliacao);
router.get('/', authenticateToken, avaliacaoController.listarAvaliacoesRecebidas);
router.get('/minhas', authenticateToken, avaliacaoController.listarMinhasAvaliacoes);
router.get('/recebidas', authenticateToken, avaliacaoController.listarAvaliacoesRecebidas);
router.get('/verificar/:frete_id', authenticateToken, avaliacaoController.verificarSeJaAvaliou);

module.exports = router;