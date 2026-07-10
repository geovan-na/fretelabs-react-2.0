const db = require('../config/database');

const listarFretes = async (req, res) => {
    try {
        const { 
            status,
            origem, 
            destino, 
            tipo_carga, 
            peso_min, 
            peso_max, 
            valor_min, 
            valor_max,
            page = 1,
            limit = 10
        } = req.query;
        
        const limitInt = parseInt(limit);
        const offset = (parseInt(page) - 1) * limitInt;

        // Query Base: Busca direta na tabela fretes (f)
        // Junta com 'embarcadores' e 'pessoas' para pegar o nome de quem publicou
        let query = `
            SELECT 
                f.*,
                p.nome_razao_social as embarcador_nome
            FROM fretes f
            JOIN embarcadores e ON f.embarcador_id = e.id
            JOIN pessoas p ON e.pessoa_id = p.id
            WHERE 1=1
        `;

        const params = [];

        // Filtro de Status: Se não for passado nenhum, traz o que está aberto no mercado
        if (status && status !== 'TODOS') {
            query += ` AND f.status = ?`;
            params.push(status);
        } else if (!status) {
            query += ` AND f.status IN ('AGUARDANDO', 'NEGOCIACAO')`;
        }

        // Filtros por CEP (Origem e Destino)
        if (origem) {
            query += ` AND f.origem_cep LIKE ?`;
            params.push(`%${origem}%`);
        }
        if (destino) {
            query += ` AND f.destino_cep LIKE ?`;
            params.push(`%${destino}%`);
        }

        // Filtro por Tipo de Carga
        if (tipo_carga) {
            query += ` AND f.tipo_carga LIKE ?`;
            params.push(`%${tipo_carga}%`);
        }

        // Filtros por Peso
        if (peso_min) {
            query += ` AND f.peso_kg >= ?`;
            params.push(parseFloat(peso_min));
        }
        if (peso_max) {
            query += ` AND f.peso_kg <= ?`;
            params.push(parseFloat(peso_max));
        }

        // Filtros por Valor Ofertado
        if (valor_min) {
            query += ` AND f.valor_ofertado >= ?`;
            params.push(parseFloat(valor_min));
        }
        if (valor_max) {
            query += ` AND f.valor_ofertado <= ?`;
            params.push(parseFloat(valor_max));
        }

        // Ordenação usando sua coluna real 'data_publicacao' e limite para paginação
        query += ` ORDER BY f.data_publicacao DESC LIMIT ? OFFSET ?`;
        params.push(limitInt, offset);

        // Executa a busca principal dos fretes disponíveis
        const [rows] = await db.query(query, params);

        // Query de Contagem (COUNT) para alimentar a paginação do componente React
        let countQuery = `
            SELECT COUNT(*) as total 
            FROM fretes f
            WHERE 1=1
        `;
        const countParams = [];

        if (status && status !== 'TODOS') {
            countQuery += ` AND f.status = ?`;
            countParams.push(status);
        } else if (!status) {
            countQuery += ` AND f.status IN ('AGUARDANDO', 'NEGOCIACAO')`;
        }

        if (origem) { countQuery += ` AND f.origem_cep LIKE ?`; countParams.push(`%${origem}%`); }
        if (destino) { countQuery += ` AND f.destino_cep LIKE ?`; countParams.push(`%${destino}%`); }
        if (tipo_carga) { countQuery += ` AND f.tipo_carga LIKE ?`; countParams.push(`%${tipo_carga}%`); }

        const [countResult] = await db.query(countQuery, countParams);
        const total = countResult[0].total;

        // Resposta formatada de forma limpa para o front-end
        return res.json({
            data: rows,
            total: total,
            page: parseInt(page),
            limit: limitInt,
            totalPages: Math.ceil(total / limitInt)
        });

    } catch (error) {
        console.error('Erro ao listar fretes diretamente:', error);
        return res.status(500).json({ error: 'Erro interno ao listar fretes' });
    }
};
const buscarFrete = async (req, res) => {
    try {
        const { id } = req.params;

        // 🌟 Busca DIRETAMENTE na tabela de fretes pelo ID solicitado
        // Faz o JOIN para trazer o nome legível de quem publicou
        const [rows] = await db.query(`
            SELECT 
                f.*,
                p.nome_razao_social as embarcador_nome
            FROM fretes f
            JOIN embarcadores e ON f.embarcador_id = e.id
            JOIN pessoas p ON e.pessoa_id = p.id
            WHERE f.id = ?
        `, [id]);
        
        // Se o ID não existir na tabela de fretes
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Frete não encontrado.' });
        }
        
        const frete = rows[0];

        // Retorna o frete encontrado no mesmo formato esperado pelo seu React ({ data: ... })
        return res.json({ data: frete });

    } catch (error) {
        console.error('Erro ao buscar detalhes do frete:', error);
        return res.status(500).json({ error: 'Erro interno ao buscar detalhes do frete' });
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