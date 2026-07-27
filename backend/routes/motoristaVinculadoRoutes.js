const express = require('express');
const router = express.Router();

// Importação do controller
const motoristaVinculadoController = require('../controllers/motoristaVinculadoController');

// Importação do middleware de autenticação (ajuste o caminho conforme sua estrutura)
const { authenticateToken } = require('../middleware/authMiddleware');
// Aplica autenticação para todas as rotas de motorista vinculado
router.use(authenticateToken);

// ============================================
// ROTAS DE PERFIL E RESUMO
// ============================================

// GET /api/motorista-vinculado/perfil
router.get('/perfil', motoristaVinculadoController.getPerfil);

// GET /api/motorista-vinculado/resumo
router.get('/resumo', motoristaVinculadoController.getResumo);

// ============================================
// ROTAS DE FRETES
// ============================================

// GET /api/motorista-vinculado/fretes
router.get('/fretes', motoristaVinculadoController.listarMeusFretes);

// GET /api/motorista-vinculado/fretes/para-atualizar
router.get('/fretes/para-atualizar', motoristaVinculadoController.listarFretesParaAtualizar);

// GET /api/motorista-vinculado/fretes/em-andamento
router.get('/fretes/em-andamento', motoristaVinculadoController.listarFretesEmAndamento);

// GET /api/motorista-vinculado/fretes/concluidos
router.get('/fretes/concluidos', motoristaVinculadoController.listarEntregasRealizadas);

// GET /api/motorista-vinculado/fretes/:id
router.get('/fretes/:id', motoristaVinculadoController.buscarFrete);

// PATCH /api/motorista-vinculado/fretes/:id/status
router.patch('/fretes/:id/status', motoristaVinculadoController.atualizarStatusFrete);

// ============================================
// ROTAS DE FROTAS
// ============================================

// GET /api/motorista-vinculado/frotas-disponiveis
router.get('/frotas-disponiveis', motoristaVinculadoController.listarFrotasDisponiveis);
router.get('/minha-frota', motoristaVinculadoController.getMinhaFrota);       
router.patch('/finalizar-vinculo', motoristaVinculadoController.finalizarVinculo);

module.exports = router;