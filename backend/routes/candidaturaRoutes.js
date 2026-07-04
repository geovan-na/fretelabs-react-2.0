const express = require('express');
const router = express.Router();
const candidaturaController = require('../controllers/candidaturaController');
const { authenticateToken } = require('../middleware/authMiddleware');

// =========================================================================
// 1. ROTAS FIXAS / ESTÁTICAS (Sempre no topo para evitar conflito com :id)
// =========================================================================
router.get('/minhas', authenticateToken, candidaturaController.listarMinhasCandidaturas);
router.get('/embarcador', authenticateToken, candidaturaController.listarCandidaturasEmbarcador);
router.get('/motoristas/disponiveis', authenticateToken, candidaturaController.listarMotoristasVinculados);

// =========================================================================
// 2. ROTAS COM PARÂMETROS ESPECÍFICOS
// =========================================================================
router.get('/frete/:frete_id', authenticateToken, candidaturaController.listarPorFrete);

// =========================================================================
// 3. ROTAS GENÉRICAS / DINÂMICAS (Sempre por último)
// =========================================================================
router.post('/', authenticateToken, candidaturaController.criarCandidatura);
router.patch('/:id', authenticateToken, candidaturaController.atualizarCandidatura);
router.delete('/:id', authenticateToken, candidaturaController.deletarCandidatura);
router.patch('/:id/designar-motorista', authenticateToken, candidaturaController.designarMotorista);

module.exports = router;