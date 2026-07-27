// routes/motoristaRoutes.js
const express = require('express');
const router = express.Router();
const motoristaController = require('../controllers/motoristaController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Rotas para frota
router.get('/vinculados', authenticateToken, motoristaController.listarMotoristasVinculados);
router.get('/disponiveis', authenticateToken, motoristaController.listarMotoristasDisponiveis);
router.get('/:id', authenticateToken, motoristaController.buscarMotorista);
router.patch('/:id/designar-veiculo', authenticateToken, motoristaController.designarVeiculo);
router.patch('/:id/remover-veiculo', authenticateToken, motoristaController.removerVeiculo);
router.patch('/:id/finalizar-vinculo', authenticateToken, motoristaController.finalizarVinculo);

module.exports = router;