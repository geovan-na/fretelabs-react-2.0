// routes/financeiroRoutes.js
const express = require('express');
const router = express.Router();
const financeiroController = require('../controllers/financeiroController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/resumo', authenticateToken, financeiroController.getResumo);
router.get('/transacoes', authenticateToken, financeiroController.getTransacoes);
router.get('/extrato', authenticateToken, financeiroController.getExtrato);
router.get('/saldo', authenticateToken, financeiroController.getSaldo);
router.post('/saque', authenticateToken, financeiroController.solicitarSaque);

module.exports = router;