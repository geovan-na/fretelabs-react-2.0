// routes/contratoRoutes.js
const express = require('express');
const router = express.Router();
const contratoController = require('../controllers/contratoController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, contratoController.criarContrato);
router.get('/', authenticateToken, contratoController.listarContratos);
router.get('/:id', authenticateToken, contratoController.buscarContrato);
router.patch('/:id/assinar-motorista', authenticateToken, contratoController.assinarContratoMotorista);
router.patch('/:id/assinar-frota', authenticateToken, contratoController.assinarContratoFrota);
router.patch('/:id/encerrar', authenticateToken, contratoController.encerrarContrato);
router.patch('/:id/renovar', authenticateToken, contratoController.renovarContrato);

module.exports = router;