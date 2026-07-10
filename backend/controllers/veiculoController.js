// controllers/veiculoController.js
const db = require('../config/database');

const listarVeiculos = async (req, res) => {
    try {
        const userId = req.userId;

        // Buscar transportador_id do usuário
        const [transportadorRows] = await db.query(
            'SELECT id FROM transportadores WHERE pessoa_id = ?',
            [userId]
        );

        if (transportadorRows.length === 0) {
            return res.status(404).json({ error: 'Transportador não encontrado' });
        }

        const transportadorId = transportadorRows[0].id;

        const [rows] = await db.query(
            `SELECT v.*, p.nome_razao_social as transportador_nome 
             FROM veiculos v
             JOIN transportadores t ON v.transportador_id = t.id
             JOIN pessoas p ON t.pessoa_id = p.id
             WHERE v.transportador_id = ?`,
            [transportadorId]
        );
        res.json({ data: rows, total: rows.length });
    } catch (error) {
        console.error('Erro ao listar veículos:', error);
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
        console.error('Erro ao buscar veículo:', error);
        res.status(500).json({ error: 'Erro ao buscar veículo' });
    }
};

const criarVeiculo = async (req, res) => {
    try {
        const { 
            transportador_id, 
            placa, 
            renavam,
            modelo, 
            marca, 
            ano_fabricacao,
            ano_modelo,
            capacidade_kg,
            capacidade_m3,
            tipo_carroceria, 
            tipo_veiculo,
            eixos,
            possui_rastreador,
            possui_seguro,
            seguro_apolice,
            seguro_validade,
            status
        } = req.body;

        console.log('📝 Criando veículo:', { placa, modelo, tipo_veiculo });

        // Verificar se placa já existe
        const [existing] = await db.query('SELECT id FROM veiculos WHERE placa = ?', [placa]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Placa já cadastrada' });
        }

        const [result] = await db.query(
            `INSERT INTO veiculos (
                transportador_id, 
                placa, 
                renavam,
                modelo, 
                marca, 
                ano_fabricacao,
                ano_modelo,
                capacidade_kg,
                capacidade_m3,
                tipo_carroceria, 
                tipo_veiculo,
                eixos,
                possui_rastreador,
                possui_seguro,
                seguro_apolice,
                seguro_validade,
                status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                transportador_id, 
                placa, 
                renavam || null,
                modelo, 
                marca || null, 
                ano_fabricacao || null,
                ano_modelo || null,
                capacidade_kg || null,
                capacidade_m3 || null,
                tipo_carroceria || null, 
                tipo_veiculo || null,
                eixos || null,
                possui_rastreador || false,
                possui_seguro || false,
                seguro_apolice || null,
                seguro_validade || null,
                status || 'ATIVO'
            ]
        );

        console.log('✅ Veículo criado com ID:', result.insertId);

        res.status(201).json({ 
            message: 'Veículo cadastrado com sucesso', 
            id: result.insertId 
        });
    } catch (error) {
        console.error('Erro ao cadastrar veículo:', error);
        res.status(500).json({ error: 'Erro ao cadastrar veículo' });
    }
};

const atualizarVeiculo = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            placa, 
            renavam,
            modelo, 
            marca, 
            ano_fabricacao,
            ano_modelo,
            capacidade_kg,
            capacidade_m3,
            tipo_carroceria, 
            tipo_veiculo,
            eixos,
            possui_rastreador,
            possui_seguro,
            seguro_apolice,
            seguro_validade,
            status
        } = req.body;

        // Verificar se placa já existe para outro veículo
        const [existing] = await db.query(
            'SELECT id FROM veiculos WHERE placa = ? AND id != ?',
            [placa, id]
        );
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Placa já cadastrada para outro veículo' });
        }

        await db.query(
            `UPDATE veiculos SET 
                placa = ?,
                renavam = ?,
                modelo = ?,
                marca = ?,
                ano_fabricacao = ?,
                ano_modelo = ?,
                capacidade_kg = ?,
                capacidade_m3 = ?,
                tipo_carroceria = ?,
                tipo_veiculo = ?,
                eixos = ?,
                possui_rastreador = ?,
                possui_seguro = ?,
                seguro_apolice = ?,
                seguro_validade = ?,
                status = ?
            WHERE id = ?`,
            [
                placa,
                renavam || null,
                modelo,
                marca || null,
                ano_fabricacao || null,
                ano_modelo || null,
                capacidade_kg || null,
                capacidade_m3 || null,
                tipo_carroceria || null,
                tipo_veiculo || null,
                eixos || null,
                possui_rastreador || false,
                possui_seguro || false,
                seguro_apolice || null,
                seguro_validade || null,
                status || 'ATIVO',
                id
            ]
        );

        res.json({ message: 'Veículo atualizado com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar veículo:', error);
        res.status(500).json({ error: 'Erro ao atualizar veículo' });
    }
};

const deletarVeiculo = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM veiculos WHERE id = ?', [id]);
        res.json({ message: 'Veículo deletado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar veículo:', error);
        res.status(500).json({ error: 'Erro ao deletar veículo' });
    }
};

module.exports = { 
    listarVeiculos, 
    buscarVeiculo, 
    criarVeiculo, 
    atualizarVeiculo, 
    deletarVeiculo 
};