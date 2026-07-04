const db = require('../config/database');

const findByPessoaId = async (pessoaId) => {
    const [rows] = await db.query('SELECT * FROM documentos WHERE pessoa_id = ?', [pessoaId]);
    return rows;
};

const findById = async (id) => {
    const [rows] = await db.query('SELECT * FROM documentos WHERE id = ?', [id]);
    return rows[0];
};

const create = async (data) => {
    const { pessoa_id, frete_id, tipo_documento, nome_arquivo, caminho_arquivo, tamanho_bytes, tipo_mime, data_validade } = data;
    const [result] = await db.query(
        'INSERT INTO documentos (pessoa_id, frete_id, tipo_documento, nome_arquivo, caminho_arquivo, tamanho_bytes, tipo_mime, data_validade, status_verificacao) VALUES (?, ?, ?, ?, ?, ?, ?, ?, "PENDENTE")',
        [pessoa_id, frete_id, tipo_documento, nome_arquivo, caminho_arquivo, tamanho_bytes, tipo_mime, data_validade]
    );
    return result.insertId;
};

const remove = async (id) => {
    await db.query('DELETE FROM documentos WHERE id = ?', [id]);
};

module.exports = { findByPessoaId, findById, create, remove };