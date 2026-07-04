const express = require('express');
const router = express.Router();
const enderecoController = require('../controllers/enderecoController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/pessoa/:pessoa_id', authenticateToken, enderecoController.listarEnderecos);
router.post('/', authenticateToken, enderecoController.criarEndereco);
router.put('/:id', authenticateToken, enderecoController.atualizarEndereco);
router.delete('/:id', authenticateToken, enderecoController.deletarEndereco);

module.exports = router;