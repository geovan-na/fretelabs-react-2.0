const db = require('../config/database');

const findAll = async () => {
    const [rows] = await db.query(`
        SELECT v.*, p.nome_razao_social as transportador_nome 
        FROM veiculos v
        JOIN transportadores t ON v.transportador_id = t.id
        JOIN pessoas p ON t.pessoa_id = p.id
    `);
    return rows;
};

const findById = async (id) => {
    const [rows] = await db.query('SELECT * FROM veiculos WHERE id = ?', [id]);
    return rows[0];
};

const create = async (data) => {
    const { transportador_id, placa, modelo, marca, ano_fabricacao, capacidade_kg, tipo_carroceria, tipo_veiculo } = data;
    const [result] = await db.query(
        'INSERT INTO veiculos (transportador_id, placa, modelo, marca, ano_fabricacao, capacidade_kg, tipo_carroceria, tipo_veiculo, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, "ATIVO")',
        [transportador_id, placa, modelo, marca, ano_fabricacao, capacidade_kg, tipo_carroceria, tipo_veiculo]
    );
    return result.insertId;
};

const update = async (id, data) => {
    const { placa, modelo, marca, ano_fabricacao, capacidade_kg, tipo_carroceria, tipo_veiculo, status } = data;
    await db.query(
        'UPDATE veiculos SET placa = ?, modelo = ?, marca = ?, ano_fabricacao = ?, capacidade_kg = ?, tipo_carroceria = ?, tipo_veiculo = ?, status = ? WHERE id = ?',
        [placa, modelo, marca, ano_fabricacao, capacidade_kg, tipo_carroceria, tipo_veiculo, status, id]
    );
};

const remove = async (id) => {
    await db.query('DELETE FROM veiculos WHERE id = ?', [id]);
};

module.exports = { findAll, findById, create, update, remove };