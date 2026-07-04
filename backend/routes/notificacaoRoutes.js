const express = require('express');
const router = express.Router();
const notificacaoController = require('../controllers/notificacaoController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, notificacaoController.listar);
router.patch('/:id/ler', authenticateToken, notificacaoController.marcarComoLida);
router.patch('/ler-todas', authenticateToken, notificacaoController.marcarTodasComoLidas);
router.delete('/:id', authenticateToken, notificacaoController.deletar);

module.exports = router;