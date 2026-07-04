const express = require('express');
const router = express.Router();
const documentoController = require('../controllers/documentoController');
const upload = require('../config/multer');
const { authenticateToken } = require('../middleware/authMiddleware');

router.post('/upload', authenticateToken, upload.single('arquivo'), documentoController.uploadDocumento);
router.get('/pessoa/:pessoa_id', authenticateToken, documentoController.listarDocumentos);
router.delete('/:id', authenticateToken, documentoController.deletarDocumento);

module.exports = router;