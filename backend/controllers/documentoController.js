const db = require('../config/database');

const uploadDocumento = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Nenhum arquivo enviado' });
        }
        
        const { pessoa_id, frete_id, tipo_documento, data_validade } = req.body;
        const { filename, path: caminho_arquivo, size, mimetype } = req.file;
        
        const [result] = await db.query(
            `INSERT INTO documentos (pessoa_id, frete_id, tipo_documento, nome_arquivo, caminho_arquivo, tamanho_bytes, tipo_mime, data_validade, status_verificacao) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PENDENTE')`,
            [pessoa_id || null, frete_id || null, tipo_documento, filename, caminho_arquivo, size, mimetype, data_validade || null]
        );
        
        res.status(201).json({ message: 'Documento enviado com sucesso', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao enviar documento' });
    }
};

const listarDocumentos = async (req, res) => {
    try {
        const { pessoa_id } = req.params;
        const [rows] = await db.query('SELECT * FROM documentos WHERE pessoa_id = ?', [pessoa_id]);
        res.json({ data: rows, total: rows.length });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar documentos' });
    }
};

const deletarDocumento = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM documentos WHERE id = ?', [id]);
        res.json({ message: 'Documento deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar documento' });
    }
};

module.exports = { uploadDocumento, listarDocumentos, deletarDocumento };