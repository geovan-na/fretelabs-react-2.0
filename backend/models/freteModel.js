const db = require('../config/database');

const findAll = async () => {
    const [rows] = await db.query(`
        SELECT f.*, p.nome_razao_social as embarcador_nome 
        FROM fretes f
        JOIN embarcadores e ON f.embarcador_id = e.id
        JOIN pessoas p ON e.pessoa_id = p.id
        WHERE f.status IN ('AGUARDANDO', 'NEGOCIACAO')
        ORDER BY f.data_publicacao DESC
    `);
    return rows;
};

const findById = async (id) => {
    const [rows] = await db.query('SELECT * FROM fretes WHERE id = ?', [id]);
    return rows[0];
};

const create = async (data) => {
    const { embarcador_id, criado_por, origem_cep, origem_endereco, destino_cep, destino_endereco, tipo_carga, peso_kg, valor_ofertado, data_coleta_prevista, data_entrega_prevista } = data;
    const [result] = await db.query(
        'INSERT INTO fretes (embarcador_id, criado_por, origem_cep, origem_endereco, destino_cep, destino_endereco, tipo_carga, peso_kg, valor_ofertado, data_coleta_prevista, data_entrega_prevista, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, "AGUARDANDO")',
        [embarcador_id, criado_por, origem_cep, origem_endereco, destino_cep, destino_endereco, tipo_carga, peso_kg, valor_ofertado, data_coleta_prevista, data_entrega_prevista]
    );
    return result.insertId;
};

const update = async (id, data) => {
    const { origem_cep, origem_endereco, destino_cep, destino_endereco, tipo_carga, peso_kg, valor_ofertado, data_coleta_prevista, data_entrega_prevista } = data;
    await db.query(
        'UPDATE fretes SET origem_cep = ?, origem_endereco = ?, destino_cep = ?, destino_endereco = ?, tipo_carga = ?, peso_kg = ?, valor_ofertado = ?, data_coleta_prevista = ?, data_entrega_prevista = ? WHERE id = ?',
        [origem_cep, origem_endereco, destino_cep, destino_endereco, tipo_carga, peso_kg, valor_ofertado, data_coleta_prevista, data_entrega_prevista, id]
    );
};

const remove = async (id) => {
    await db.query('DELETE FROM fretes WHERE id = ?', [id]);
};

module.exports = { findAll, findById, create, update, remove };