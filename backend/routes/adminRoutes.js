// backend/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

// ============================================
// PERFIL DO ADMIN
// ============================================
router.get('/perfil', authenticateToken, isAdmin, adminController.getPerfil);
router.put('/perfil', authenticateToken, isAdmin, adminController.atualizarPerfil);

// ============================================
// GESTÃO DE USUÁRIOS
// ============================================
router.get('/usuarios', authenticateToken, isAdmin, adminController.listarUsuarios);
router.get('/usuarios/:id', authenticateToken, isAdmin, adminController.buscarUsuario);
router.patch('/usuarios/:id/bloquear', authenticateToken, isAdmin, adminController.bloquearUsuario);
router.patch('/usuarios/:id/desbloquear', authenticateToken, isAdmin, adminController.desbloquearUsuario);
router.patch('/usuarios/:id/aprovar', authenticateToken, isAdmin, adminController.aprovarUsuario);
router.patch('/usuarios/:id/reprovar', authenticateToken, isAdmin, adminController.reprovarUsuario);
router.patch('/usuarios/:id/role', authenticateToken, isAdmin, adminController.alterarRole);

// ============================================
// GESTÃO DE FRETES
// ============================================
router.get('/fretes', authenticateToken, isAdmin, adminController.listarFretes);
router.get('/fretes/:id', authenticateToken, isAdmin, adminController.buscarFrete);
router.patch('/fretes/:id/cancelar', authenticateToken, isAdmin, adminController.cancelarFrete);

// ============================================
// BLACKLIST
// ============================================
router.get('/blacklist', authenticateToken, isAdmin, adminController.listarBlacklist);
router.post('/blacklist', authenticateToken, isAdmin, adminController.adicionarBlacklist);
router.delete('/blacklist/:id', authenticateToken, isAdmin, adminController.removerBlacklist);

// ============================================
// GESTÃO DE VEÍCULOS
// ============================================
router.get('/veiculos', authenticateToken, isAdmin, adminController.listarVeiculos);
router.get('/veiculos/:id', authenticateToken, isAdmin, adminController.buscarVeiculo);

// ============================================
// ESTATÍSTICAS DO DASHBOARD
// ============================================
router.get('/estatisticas', authenticateToken, isAdmin, adminController.getEstatisticas);

module.exports = router;
