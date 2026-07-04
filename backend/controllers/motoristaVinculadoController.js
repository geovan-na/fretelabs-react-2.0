// controllers/motoristaVinculadoController.js
const db = require('../config/database');

const getMeuVinculo = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT mv.*, p.nome_razao_social as frota_nome, p.cpf_cnpj as frota_cnpj
            FROM motoristas_vinculados mv
            JOIN transportadores t ON mv.transportador_id = t.id
            JOIN pessoas p ON t.pessoa_id = p.id
            WHERE mv.pessoa_id = ?
        `, [req.userId]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Nenhum vínculo encontrado' });
        }
        res.json({ data: rows[0] });
    } catch (error) {
        console.error('Erro ao buscar vínculo:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

const listarMotoristasDaFrota = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT mv.*, p.nome_razao_social, p.email, p.telefone
            FROM motoristas_vinculados mv
            JOIN pessoas p ON mv.pessoa_id = p.id
            WHERE mv.transportador_id = (SELECT id FROM transportadores WHERE pessoa_id = ?)
        `, [req.userId]);
        res.json({ data: rows });
    } catch (error) {
        console.error('Erro ao listar motoristas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

const vincularMotorista = async (req, res) => {
    try {
        const { pessoa_id, cnh, cnh_categoria, cnh_validade, data_admissao } = req.body;
        
        const [transportador] = await db.query('SELECT id FROM transportadores WHERE pessoa_id = ?', [req.userId]);
        if (transportador.length === 0) {
            return res.status(404).json({ error: 'Perfil de transportador não encontrado' });
        }
        
        const [result] = await db.query(`
            INSERT INTO motoristas_vinculados 
            (pessoa_id, transportador_id, cnh, cnh_categoria, cnh_validade, data_admissao, status) 
            VALUES (?, ?, ?, ?, ?, ?, 'ATIVO')
        `, [pessoa_id, transportador[0].id, cnh, cnh_categoria, cnh_validade, data_admissao]);
        
        res.status(201).json({ message: 'Motorista vinculado com sucesso', id: result.insertId });
    } catch (error) {
        console.error('Erro ao vincular motorista:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

const desvincularMotorista = async (req, res) => {
    try {
        const { id } = req.params;
        const { data_demissao } = req.body;
        await db.query(
            'UPDATE motoristas_vinculados SET status = "DESLIGADO", data_demissao = ? WHERE id = ?',
            [data_demissao, id]
        );
        res.json({ message: 'Motorista desvinculado com sucesso' });
    } catch (error) {
        console.error('Erro ao desvincular motorista:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

module.exports = { getMeuVinculo, listarMotoristasDaFrota, vincularMotorista, desvincularMotorista };