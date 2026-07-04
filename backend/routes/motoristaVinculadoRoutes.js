const express = require('express');
const router = express.Router();
const motoristaVinculadoController = require('../controllers/motoristaVinculadoController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/meu-vinculo', authenticateToken, motoristaVinculadoController.getMeuVinculo);
router.get('/frota/motoristas', authenticateToken, motoristaVinculadoController.listarMotoristasDaFrota);
router.post('/vincular', authenticateToken, motoristaVinculadoController.vincularMotorista);
router.patch('/:id/desvincular', authenticateToken, motoristaVinculadoController.desvincularMotorista);

module.exports = router;