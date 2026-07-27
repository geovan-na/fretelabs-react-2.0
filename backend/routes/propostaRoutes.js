// routes/propostaRoutes.js
const express = require('express');
const router = express.Router();
const propostaController = require('../controllers/propostaController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/', authenticateToken, propostaController.enviarProposta);
router.get('/enviadas', authenticateToken, propostaController.listarPropostasEnviadas);
router.get('/recebidas', authenticateToken, propostaController.listarPropostasRecebidas);
router.get('/:id', authenticateToken, propostaController.buscarProposta);
router.patch('/:id/aceitar', authenticateToken, propostaController.aceitarProposta);
router.patch('/:id/recusar', authenticateToken, propostaController.recusarProposta);
router.patch('/:id/contraproposta', authenticateToken, propostaController.enviarContraProposta);
router.patch('/:id/cancelar', authenticateToken, propostaController.cancelarProposta);

module.exports = router;