const db = require('../config/database');

const findByEmail = async (email) => {
    const [rows] = await db.query('SELECT * FROM pessoas WHERE email = ?', [email]);
    return rows[0];
};

const findById = async (id) => {
    const [rows] = await db.query('SELECT id, tipo_pessoa, nome_razao_social, email, telefone, status FROM pessoas WHERE id = ?', [id]);
    return rows[0];
};

const create = async (data) => {
    const { tipo_pessoa, nome_razao_social, nome_fantasia, cpf_cnpj, email, senha, telefone } = data;
    const [result] = await db.query(
        'INSERT INTO pessoas (tipo_pessoa, nome_razao_social, nome_fantasia, cpf_cnpj, email, senha, telefone, status) VALUES (?, ?, ?, ?, ?, ?, ?, "PENDENTE")',
        [tipo_pessoa, nome_razao_social, nome_fantasia, cpf_cnpj, email, senha, telefone]
    );
    return result.insertId;
};

const update = async (id, data) => {
    const { nome_razao_social, email, telefone } = data;
    await db.query('UPDATE pessoas SET nome_razao_social = ?, email = ?, telefone = ? WHERE id = ?', [nome_razao_social, email, telefone, id]);
};

const remove = async (id) => {
    await db.query('DELETE FROM pessoas WHERE id = ?', [id]);
};

module.exports = { findByEmail, findById, create, update, remove };