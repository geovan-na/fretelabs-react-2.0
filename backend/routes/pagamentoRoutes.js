// routes/pagamentoRoutes.js
const express = require('express');
const router = express.Router();
const pagamentoController = require('../controllers/pagamentoController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, pagamentoController.criarPagamento);
router.get('/frota', authenticateToken, pagamentoController.listarPagamentosFrota);
router.get('/motorista', authenticateToken, pagamentoController.listarPagamentosMotorista);
router.get('/resumo', authenticateToken, pagamentoController.resumoPagamentos);
router.get('/:id', authenticateToken, pagamentoController.buscarPagamento);
router.patch('/:id/pagar', authenticateToken, pagamentoController.marcarPagamentoPago);
router.patch('/:id/cancelar', authenticateToken, pagamentoController.cancelarPagamento);

module.exports = router;