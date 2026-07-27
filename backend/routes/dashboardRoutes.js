// backend/routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Todas as rotas exigem autenticação
router.use(authenticateToken);

// Dashboards por tipo de usuário
router.get('/embarcador', dashboardController.getEmbarcadorDashboard);
router.get('/frota', dashboardController.getFrotaDashboard);
router.get('/autonomo', dashboardController.getAutonomoDashboard);
router.get('/vinculado', dashboardController.getVinculadoDashboard);

// Dashboard do admin (você pode adicionar verificação extra se quiser)
router.get('/admin', dashboardController.getAdminDashboard);

module.exports = router;