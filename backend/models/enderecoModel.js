const db = require('../config/database');

const findByPessoaId = async (pessoaId) => {
    const [rows] = await db.query('SELECT * FROM enderecos WHERE pessoa_id = ? ORDER BY principal DESC', [pessoaId]);
    return rows;
};

const findById = async (id) => {
    const [rows] = await db.query('SELECT * FROM enderecos WHERE id = ?', [id]);
    return rows[0];
};

const create = async (data) => {
    const { pessoa_id, tipo_endereco, cep, logradouro, numero, complemento, bairro, cidade, estado, principal } = data;
    const [result] = await db.query(
        'INSERT INTO enderecos (pessoa_id, tipo_endereco, cep, logradouro, numero, complemento, bairro, cidade, estado, principal) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [pessoa_id, tipo_endereco, cep, logradouro, numero, complemento, bairro, cidade, estado, principal || false]
    );
    return result.insertId;
};

const update = async (id, data) => {
    const { tipo_endereco, cep, logradouro, numero, complemento, bairro, cidade, estado, principal } = data;
    await db.query(
        'UPDATE enderecos SET tipo_endereco = ?, cep = ?, logradouro = ?, numero = ?, complemento = ?, bairro = ?, cidade = ?, estado = ?, principal = ? WHERE id = ?',
        [tipo_endereco, cep, logradouro, numero, complemento, bairro, cidade, estado, principal || false, id]
    );
};

const remove = async (id) => {
    await db.query('DELETE FROM enderecos WHERE id = ?', [id]);
};

const desmarcarPrincipal = async (pessoaId, excludeId = null) => {
    let query = 'UPDATE enderecos SET principal = false WHERE pessoa_id = ?';
    const params = [pessoaId];
    if (excludeId) {
        query += ' AND id != ?';
        params.push(excludeId);
    }
    await db.query(query, params);
};

module.exports = { findByPessoaId, findById, create, update, remove, desmarcarPrincipal };