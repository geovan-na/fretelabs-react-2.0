const db = require('../config/database');

const listarVeiculos = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT v.*, p.nome_razao_social as transportador_nome 
            FROM veiculos v
            JOIN transportadores t ON v.transportador_id = t.id
            JOIN pessoas p ON t.pessoa_id = p.id
        `);
        res.json({ data: rows, total: rows.length });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar veículos' });
    }
};

const buscarVeiculo = async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT * FROM veiculos WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Veículo não encontrado' });
        }
        res.json({ data: rows[0] });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar veículo' });
    }
};

const criarVeiculo = async (req, res) => {
    try {
        const { transportador_id, placa, modelo, marca, ano_fabricacao, capacidade_kg, tipo_carroceria, tipo_veiculo } = req.body;
        
        const [result] = await db.query(
            `INSERT INTO veiculos (transportador_id, placa, modelo, marca, ano_fabricacao, capacidade_kg, tipo_carroceria, tipo_veiculo, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'ATIVO')`,
            [transportador_id, placa, modelo, marca, ano_fabricacao, capacidade_kg, tipo_carroceria, tipo_veiculo]
        );
        
        res.status(201).json({ message: 'Veículo cadastrado com sucesso', id: result.insertId });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao cadastrar veículo' });
    }
};

const atualizarVeiculo = async (req, res) => {
    try {
        const { id } = req.params;
        const { placa, modelo, marca, ano_fabricacao, capacidade_kg, tipo_carroceria, tipo_veiculo, status } = req.body;
        
        await db.query(
            `UPDATE veiculos SET placa = ?, modelo = ?, marca = ?, ano_fabricacao = ?, capacidade_kg = ?, tipo_carroceria = ?, tipo_veiculo = ?, status = ? WHERE id = ?`,
            [placa, modelo, marca, ano_fabricacao, capacidade_kg, tipo_carroceria, tipo_veiculo, status, id]
        );
        
        res.json({ message: 'Veículo atualizado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar veículo' });
    }
};

const deletarVeiculo = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM veiculos WHERE id = ?', [id]);
        res.json({ message: 'Veículo deletado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar veículo' });
    }
};

module.exports = { listarVeiculos, buscarVeiculo, criarVeiculo, atualizarVeiculo, deletarVeiculo };