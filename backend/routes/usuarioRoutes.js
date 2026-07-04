const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.get('/', authenticateToken, usuarioController.listarUsuarios);
router.get('/:id', authenticateToken, usuarioController.buscarUsuario);
router.put('/:id', authenticateToken, usuarioController.atualizarUsuario);
router.delete('/:id', authenticateToken, usuarioController.deletarUsuario);
router.patch('/:id/status', authenticateToken, usuarioController.alterarStatus);

module.exports = router;