// routes/perfilRoutes.js
const express = require('express');
const router = express.Router();
const perfilController = require('../controllers/perfilController');
const { authenticateToken } = require('../middleware/authMiddleware'); 

router.get('/', authenticateToken, perfilController.getPerfilUnificado);
router.put('/', authenticateToken, perfilController.updatePerfil);
router.put('/alterar-senha', authenticateToken, perfilController.alterarSenha);


module.exports = router;

