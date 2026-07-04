const express = require('express');
const router = express.Router();
const ocorrenciaController = require('../controllers/ocorrenciaController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/frete/:frete_id', authenticateToken, ocorrenciaController.listarPorFrete);
router.get('/minhas', authenticateToken, ocorrenciaController.listarPorTransportador);
router.post('/', authenticateToken, ocorrenciaController.criarOcorrencia);
router.patch('/:id/resolver', authenticateToken, ocorrenciaController.resolverOcorrencia);

module.exports = router;