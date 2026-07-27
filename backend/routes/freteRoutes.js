// routes/freteRoutes.js
const express = require('express');
const router = express.Router();
const freteController = require('../controllers/freteController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Rotas
router.get('/', authenticateToken, freteController.listarDisponiveis);
router.get('/aceitos', authenticateToken, freteController.listarFretesAceitos);
router.get('/meus-fretes', authenticateToken, freteController.listarMeusFretes);
router.get('/:id', authenticateToken, freteController.buscarFrete);
router.post('/', authenticateToken, freteController.criarFrete);
router.put('/:id', authenticateToken, freteController.atualizarFrete);
router.patch('/:id/cancelar', authenticateToken, freteController.cancelarFrete);
router.get('/', authenticateToken, freteController.listarFretes);
module.exports = router;