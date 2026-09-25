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

        // Resolver transportador_id automaticamente caso não seja enviado no body
        let transportadorIdFinal = transportador_id;
        if (!transportadorIdFinal) {
            const [tRows] = await db.query(
                'SELECT id FROM transportadores WHERE pessoa_id = ?',
                [req.userId]
            );
            if (tRows.length > 0) {
                transportadorIdFinal = tRows[0].id;
            }
        }

        if (!transportadorIdFinal) {
            return res.status(400).json({ error: 'Transportador não identificado para vincular ao veículo' });
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
                transportadorIdFinal, 
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

        const [veicRows] = await db.query('SELECT * FROM veiculos WHERE id = ?', [id]);
        if (veicRows.length === 0) {
            return res.status(404).json({ error: 'Veículo não encontrado' });
        }
        const current = veicRows[0];

        // Verificar se placa já existe para outro veículo (apenas se foi alterada)
        const finalPlaca = placa !== undefined ? placa : current.placa;
        if (placa && placa !== current.placa) {
            const [existing] = await db.query(
                'SELECT id FROM veiculos WHERE placa = ? AND id != ?',
                [placa, id]
            );
            if (existing.length > 0) {
                return res.status(400).json({ error: 'Placa já cadastrada para outro veículo' });
            }
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
                finalPlaca,
                renavam !== undefined ? renavam : current.renavam,
                modelo !== undefined ? modelo : current.modelo,
                marca !== undefined ? marca : current.marca,
                ano_fabricacao !== undefined ? ano_fabricacao : current.ano_fabricacao,
                ano_modelo !== undefined ? ano_modelo : current.ano_modelo,
                capacidade_kg !== undefined ? capacidade_kg : current.capacidade_kg,
                capacidade_m3 !== undefined ? capacidade_m3 : current.capacidade_m3,
                tipo_carroceria !== undefined ? tipo_carroceria : current.tipo_carroceria,
                tipo_veiculo !== undefined ? tipo_veiculo : current.tipo_veiculo,
                eixos !== undefined ? eixos : current.eixos,
                possui_rastreador !== undefined ? possui_rastreador : current.possui_rastreador,
                possui_seguro !== undefined ? possui_seguro : current.possui_seguro,
                seguro_apolice !== undefined ? seguro_apolice : current.seguro_apolice,
                seguro_validade !== undefined ? seguro_validade : current.seguro_validade,
                status !== undefined ? status : current.status,
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