const db = require('../config/database');

// controllers/freteController.js

const listarFretes = async (req, res) => {
    try {
        const userId = req.userId; // Do middleware authenticateToken
        const { status, page = 1, limit = 10 } = req.query;
        
        // Buscar o embarcador_id do usuário logado
        const [embarcadorRows] = await db.query(
            'SELECT id FROM embarcadores WHERE pessoa_id = ?',
            [userId]
        );

        if (embarcadorRows.length === 0) {
            return res.status(404).json({ error: 'Embarcador não encontrado' });
        }

        const embarcadorId = embarcadorRows[0].id;

        // Construir a query com filtros
        let query = `
            SELECT 
                f.*,
                p.nome_razao_social as embarcador_nome
            FROM fretes f
            JOIN embarcadores e ON f.embarcador_id = e.id
            JOIN pessoas p ON e.pessoa_id = p.id
            WHERE f.embarcador_id = ?
        `;
        
        const params = [embarcadorId];

        // Filtrar por status (se fornecido)
        if (status && status !== 'TODOS') {
            query += ` AND f.status = ?`;
            params.push(status);
        }

        // Ordenar e paginar
        query += ` ORDER BY f.data_publicacao DESC LIMIT ? OFFSET ?`;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        params.push(parseInt(limit), offset);

        // Executar query
        const [rows] = await db.query(query, params);

        // Contar total
        let countQuery = `
            SELECT COUNT(*) as total 
            FROM fretes f
            WHERE f.embarcador_id = ?
        `;
        const countParams = [embarcadorId];

        if (status && status !== 'TODOS') {
            countQuery += ` AND f.status = ?`;
            countParams.push(status);
        }

        const [countResult] = await db.query(countQuery, countParams);
        const total = countResult[0].total;

        res.json({
            data: rows,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit))
        });
    } catch (error) {
        console.error('Erro ao listar fretes:', error);
        res.status(500).json({ error: 'Erro ao listar fretes' });
    }
};
const buscarFrete = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        // Buscar o embarcador_id do usuário
        const [embarcadorRows] = await db.query(
            'SELECT id FROM embarcadores WHERE pessoa_id = ?',
            [userId]
        );

        if (embarcadorRows.length === 0) {
            return res.status(404).json({ error: 'Embarcador não encontrado' });
        }

        const embarcadorId = embarcadorRows[0].id;

        // Buscar o frete com verificação de pertencimento
        const [rows] = await db.query(`
            SELECT 
                f.*,
                p.nome_razao_social as embarcador_nome
            FROM fretes f
            JOIN embarcadores e ON f.embarcador_id = e.id
            JOIN pessoas p ON e.pessoa_id = p.id
            WHERE f.id = ? AND f.embarcador_id = ?
        `, [id, embarcadorId]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Frete não encontrado ou não pertence a este embarcador' });
        }
        
        res.json({ data: rows[0] });
    } catch (error) {
        console.error('Erro ao buscar frete:', error);
        res.status(500).json({ error: 'Erro ao buscar frete' });
    }
};
const criarFrete = async (req, res) => {
    try {
        console.log('📦 Dados recebidos:', req.body); // LOG 1
        console.log('👤 Usuário ID:', req.userId); // LOG 2

        const { 
            embarcador_id, 
            origem_cep, 
            origem_endereco, 
            destino_cep, 
            destino_endereco, 
            tipo_carga, 
            peso_kg, 
            valor_ofertado, 
            data_coleta_prevista, 
            data_entrega_prevista 
        } = req.body;
        
        console.log('🔍 Verificando embarcador_id:', embarcador_id); // LOG 3

        const [result] = await db.query(
            `INSERT INTO fretes (embarcador_id, criado_por, origem_cep, origem_endereco, destino_cep, destino_endereco, tipo_carga, peso_kg, valor_ofertado, data_coleta_prevista, data_entrega_prevista, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'AGUARDANDO')`,
            [embarcador_id, req.userId, origem_cep, origem_endereco, destino_cep, destino_endereco, tipo_carga, peso_kg, valor_ofertado, data_coleta_prevista, data_entrega_prevista]
        );
        
        console.log('✅ Frete criado com ID:', result.insertId); // LOG 4

        res.status(201).json({ message: 'Frete publicado com sucesso', id: result.insertId });
    } catch (error) {
        console.error('❌ ERRO COMPLETO:', error); // LOG 5 - ESSE É O MAIS IMPORTANTE!
        console.error('❌ Mensagem:', error.message);
        console.error('❌ SQL:', error.sql);
        res.status(500).json({ error: 'Erro ao criar frete' });
    }
};

const atualizarFrete = async (req, res) => {
    try {
        const { id } = req.params;
        const { origem_cep, origem_endereco, destino_cep, destino_endereco, tipo_carga, peso_kg, valor_ofertado, data_coleta_prevista, data_entrega_prevista } = req.body;
        
        await db.query(
            `UPDATE fretes SET origem_cep = ?, origem_endereco = ?, destino_cep = ?, destino_endereco = ?, tipo_carga = ?, peso_kg = ?, valor_ofertado = ?, data_coleta_prevista = ?, data_entrega_prevista = ? WHERE id = ?`,
            [origem_cep, origem_endereco, destino_cep, destino_endereco, tipo_carga, peso_kg, valor_ofertado, data_coleta_prevista, data_entrega_prevista, id]
        );
        
        res.json({ message: 'Frete atualizado com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar frete' });
    }
};

// controllers/freteController.js

const cancelarFrete = async (req, res) => {
    try {
        const { id } = req.params;
        const { motivo } = req.body;
        const userId = req.userId;

        // Buscar o embarcador_id do usuário
        const [embarcadorRows] = await db.query(
            'SELECT id FROM embarcadores WHERE pessoa_id = ?',
            [userId]
        );

        if (embarcadorRows.length === 0) {
            return res.status(404).json({ error: 'Embarcador não encontrado' });
        }

        const embarcadorId = embarcadorRows[0].id;

        // Verificar se o frete existe e pertence ao embarcador
        const [freteRows] = await db.query(
            'SELECT id, status FROM fretes WHERE id = ? AND embarcador_id = ?',
            [id, embarcadorId]
        );

        if (freteRows.length === 0) {
            return res.status(404).json({ error: 'Frete não encontrado' });
        }

        const frete = freteRows[0];

        // Verificar se o frete pode ser cancelado
        const statusPermitidos = ['AGUARDANDO', 'NEGOCIACAO'];
        if (!statusPermitidos.includes(frete.status)) {
            return res.status(400).json({ 
                error: `Não é possível cancelar um frete com status "${frete.status}". 
                       Apenas fretes em "Aguardando" ou "Negociação" podem ser cancelados.` 
            });
        }

        // Cancelar o frete
        await db.query(
            `UPDATE fretes 
             SET status = 'CANCELADO', 
                 motivo_cancelamento = ?
             WHERE id = ?`,
            [motivo || 'Cancelado pelo embarcador', id]
        );

        res.json({ 
            message: 'Frete cancelado com sucesso',
            id: id,
            status: 'CANCELADO'
        });
    } catch (error) {
        console.error('Erro ao cancelar frete:', error);
        res.status(500).json({ error: 'Erro ao cancelar frete' });
    }
};


module.exports = { listarFretes, buscarFrete, criarFrete, atualizarFrete, cancelarFrete };