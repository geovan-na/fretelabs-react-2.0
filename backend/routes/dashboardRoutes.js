// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Estatísticas
router.get('/embarcador/stats', authenticateToken, dashboardController.getEmbarcadorStats);
router.get('/frota/stats', authenticateToken, dashboardController.getFrotaStats);
router.get('/autonomo/stats', authenticateToken, dashboardController.getAutonomoStats);
router.get('/vinculado/stats', authenticateToken, dashboardController.getVinculadoStats);
router.get('/admin/stats', authenticateToken, dashboardController.getAdminStats);

// Gráficos
router.get('/embarcador/charts', authenticateToken, dashboardController.getEmbarcadorCharts);
router.get('/frota/charts', authenticateToken, dashboardController.getFrotaCharts);
router.get('/autonomo/charts', authenticateToken, dashboardController.getAutonomoCharts);
router.get('/admin/charts', authenticateToken, dashboardController.getAdminCharts);

// Atividades e Alertas
router.get('/atividades', authenticateToken, dashboardController.getAtividades);
router.get('/alertas', authenticateToken, dashboardController.getAlertas);

// Dados específicos
router.get('/favoritos', authenticateToken, dashboardController.getFavoriteMotoristas);
router.get('/proximos-fretes', authenticateToken, dashboardController.getProximosFretes);
router.get('/veiculos-ranking', authenticateToken, dashboardController.getVeiculosRanking);

module.exports = router;