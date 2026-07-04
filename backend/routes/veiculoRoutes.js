const express = require('express');
const router = express.Router();
const veiculoController = require('../controllers/veiculoController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, veiculoController.listarVeiculos);
router.get('/:id', authenticateToken, veiculoController.buscarVeiculo);
router.post('/', authenticateToken, veiculoController.criarVeiculo);
router.put('/:id', authenticateToken, veiculoController.atualizarVeiculo);
router.delete('/:id', authenticateToken, veiculoController.deletarVeiculo);

module.exports = router;