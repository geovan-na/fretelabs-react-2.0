// routes/dadosBancariosRoutes.js
const express = require('express');
const router = express.Router();
const dadosBancariosController = require('../controllers/dadosBancariosController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, dadosBancariosController.listar);
router.get('/principal', authenticateToken, dadosBancariosController.buscarPrincipal);
router.post('/', authenticateToken, dadosBancariosController.criar);
router.put('/:id', authenticateToken, dadosBancariosController.atualizar);
router.delete('/:id', authenticateToken, dadosBancariosController.deletar);

module.exports = router;