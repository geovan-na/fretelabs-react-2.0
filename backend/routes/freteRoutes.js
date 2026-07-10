// routes/freteRoutes.js
const express = require('express');
const router = express.Router();
const freteController = require('../controllers/freteController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Rotas
router.get('/', authenticateToken, freteController.listarFretes);
router.get('/:id', authenticateToken, freteController.buscarFrete);
router.post('/', authenticateToken, freteController.criarFrete);
router.put('/:id', authenticateToken, freteController.atualizarFrete);
router.patch('/:id/cancelar', authenticateToken, freteController.cancelarFrete);

module.exports = router;