const express = require('express');
const router = express.Router();
const avaliacaoController = require('../controllers/avaliacaoController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/minhas', authenticateToken, avaliacaoController.listarMinhasAvaliacoes);
router.get('/recebidas', authenticateToken, avaliacaoController.listarAvaliacoesRecebidas);
router.post('/', authenticateToken, avaliacaoController.criarAvaliacao);

module.exports = router;