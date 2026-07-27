const db = require('../config/database');
// 1. Busca Geral (Apenas fretes disponíveis)
const listarDisponiveis = async (req, res) => {
    try {
        // Busca apenas fretes com status 'AGUARDANDO'
        const query = `
            SELECT f.*, p.nome_razao_social as embarcador_nome 
            FROM fretes f 
            JOIN embarcadores e ON f.embarcador_id = e.id 
            JOIN pessoas p ON e.pessoa_id = p.id 
            WHERE f.status IN ('AGUARDANDO', 'NEGOCIACAO')
            ORDER BY f.data_publicacao DESC
        `;
        const [rows] = await db.query(query);
        res.json({ data: rows });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar fretes disponíveis' });
    }
};
const listarFretesAceitos = async (req, res) => {
    try {
        const userId = req.userId;
        let { status } = req.query;

        // Normaliza o status vindo da URL/Aba
        if (status === 'EM TRÂNSITO' || status === 'EM_TRANSITO') {
            status = 'TRANSITO';
        }

        const [transportadorRows] = await db.query(
            'SELECT id FROM transportadores WHERE pessoa_id = ?',
            [userId]
        );

        const [motoristaRows] = await db.query(
            'SELECT transportador_id FROM motoristas_vinculados WHERE pessoa_id = ?',
            [userId]
        );

        const transportadorId = transportadorRows.length > 0 ? transportadorRows[0].id : null;
        const transportadorIdVinculado = motoristaRows.length > 0 ? motoristaRows[0].transportador_id : null;
        const transportadorIdFinal = transportadorId || transportadorIdVinculado;

        if (!transportadorIdFinal) {
            return res.json({ data: [], total: 0 });
        }

        let query = `
            SELECT 
                f.*, 
                p.nome_razao_social as embarcador_nome,
                mv.id as motorista_id,
                p_mot.nome_razao_social as motorista_nome
            FROM fretes f
            LEFT JOIN embarcadores e ON f.embarcador_id = e.id
            LEFT JOIN pessoas p ON e.pessoa_id = p.id
            LEFT JOIN motoristas_vinculados mv ON f.motorista_vinculado_id = mv.id
            LEFT JOIN pessoas p_mot ON mv.pessoa_id = p_mot.id
            WHERE f.transportador_id = ?
        `;
        const params = [transportadorIdFinal];

        if (status && status !== 'TODOS') {
            query += ` AND f.status = ?`;
            params.push(status);
        } else {
            query += ` AND f.status IN ('ACEITO', 'TRANSITO', 'CONCLUIDO')`;
        }

        query += ` ORDER BY f.data_publicacao DESC`;

        const [rows] = await db.query(query, params);
        res.json({ data: rows });

    } catch (error) {
        console.error('Erro ao listar fretes aceitos:', error);
        res.status(500).json({ error: 'Erro ao listar fretes aceitos' });
    }
};
const listarFretes = async (req, res) => {
    try {
        const userId = req.userId;
        const {
            status,
            origem,
            destino,
            tipo_carga,
            peso_min,
            peso_max,
            valor_min,
            valor_max,
            data_coleta,
            page = 1,
            limit = 10
        } = req.query;
        
        console.log('Listando fretes - Status:', status);
        console.log('Listando fretes - Usuario:', userId);

        // Buscar embarcador_id do usuário
        const [embarcadorRows] = await db.query(
            'SELECT id FROM embarcadores WHERE pessoa_id = ?',
            [userId]
        );

        // Buscar transportador_id do usuário
        const [transportadorRows] = await db.query(
            'SELECT id FROM transportadores WHERE pessoa_id = ?',
            [userId]
        );

        // Buscar motorista_vinculado
        const [motoristaRows] = await db.query(
            'SELECT id, transportador_id FROM motoristas_vinculados WHERE pessoa_id = ?',
            [userId]
        );

        const embarcadorId = embarcadorRows.length > 0 ? embarcadorRows[0].id : null;
        const transportadorId = transportadorRows.length > 0 ? transportadorRows[0].id : null;
        const motoristaId = motoristaRows.length > 0 ? motoristaRows[0].id : null;
        const transportadorIdVinculado = motoristaRows.length > 0 ? motoristaRows[0].transportador_id : null;

        let transportadorIdFinal = transportadorId;
        if (motoristaId && !transportadorId) {
            transportadorIdFinal = transportadorIdVinculado;
        }

        console.log('Embarcador ID:', embarcadorId);
        console.log('Transportador ID:', transportadorIdFinal);

        // 🔥 CONSTRUIR A QUERY BASE
        // Usamos LEFT JOIN em vez de INNER JOIN para garantir que, se listarmos fretes gerais, 
        // a falta de vínculo correto com alguma tabela não suma com o frete da lista.
        let query = `
            SELECT 
                f.*,
                p.nome_razao_social as embarcador_nome
            FROM fretes f
            LEFT JOIN embarcadores e ON f.embarcador_id = e.id
            LEFT JOIN pessoas p ON e.pessoa_id = p.id
            WHERE 1=1
        `;

        const params = [];

        // 🔥 SE FOR EMBARCADOR (Meus Fretes)
        if (embarcadorId) {
            query += ` AND f.embarcador_id = ?`;
            params.push(embarcadorId);
            
            // Se o embarcador não escolheu um status específico no filtro, 
            // mostramos todos os fretes dele (exceto os excluídos, se houver essa flag no seu banco)
            if (status && status !== 'TODOS') {
                query += ` AND f.status = ?`;
                params.push(status);
            }
        } 
        // 🔥 SE FOR TRANSPORTADOR / MOTORISTA (Fretes Aceitos por ele)
        else if (transportadorIdFinal) {
            query += ` AND f.transportador_id = ?`;
            params.push(transportadorIdFinal);

            if (status && status !== 'TODOS') {
                query += ` AND f.status = ?`;
                params.push(status);
            } else {
                // Status padrão que um transportador visualiza nos seus aceitos
                query += ` AND f.status IN ('ACEITO', 'TRANSITO', 'CONCLUIDO')`;
            }
        } 
        // 🔥 SE NÃO FOR NENHUM DOS DOIS (Visitante / Busca Geral de Disponíveis)
        else {
            if (status && status !== 'TODOS' && status !== 'DISPONIVEIS') {
                query += ` AND f.status = ?`;
                params.push(status);
            } else {
                query += ` AND f.status IN ('AGUARDANDO', 'NEGOCIACAO')`;
            }
        }

        // 🔥 FILTROS DE BUSCA (Preservados para quando a rota for acionada com parâmetros)
        if (origem) {
            query += ` AND (f.origem_cep LIKE ? OR f.origem_endereco LIKE ?)`;
            params.push(`%${origem}%`, `%${origem}%`);
        }
        if (destino) {
            query += ` AND (f.destino_cep LIKE ? OR f.destino_endereco LIKE ?)`;
            params.push(`%${destino}%`, `%${destino}%`);
        }
        if (tipo_carga) {
            query += ` AND f.tipo_carga = ?`;
            params.push(tipo_carga);
        }
        if (peso_min) {
            query += ` AND f.peso_kg >= ?`;
            params.push(parseFloat(peso_min));
        }
        if (peso_max) {
            query += ` AND f.peso_kg <= ?`;
            params.push(parseFloat(peso_max));
        }
        if (valor_min) {
            query += ` AND f.valor_ofertado >= ?`;
            params.push(parseFloat(valor_min));
        }
        if (valor_max) {
            query += ` AND f.valor_ofertado <= ?`;
            params.push(parseFloat(valor_max));
        }
        if (data_coleta) {
            query += ` AND DATE(f.data_coleta_prevista) >= ?`;
            params.push(data_coleta);
        }

        // Ordenação e Paginação
        query += ` ORDER BY f.data_publicacao DESC LIMIT ? OFFSET ?`;
        const offset = (parseInt(page) - 1) * parseInt(limit);
        params.push(parseInt(limit), offset);

        const [rows] = await db.query(query, params);
        console.log('Fretes encontrados:', rows.length);

        // 🔥 CONTAR TOTAL (Refletindo exatamente a mesma lógica estruturada acima)
        let countQuery = `
            SELECT COUNT(*) as total
            FROM fretes f
            WHERE 1=1
        `;
        const countParams = [];

        if (embarcadorId) {
            countQuery += ` AND f.embarcador_id = ?`;
            countParams.push(embarcadorId);
            if (status && status !== 'TODOS') {
                countQuery += ` AND f.status = ?`;
                countParams.push(status);
            }
        } else if (transportadorIdFinal) {
            countQuery += ` AND f.transportador_id = ?`;
            countParams.push(transportadorIdFinal);
            if (status && status !== 'TODOS') {
                countQuery += ` AND f.status = ?`;
                countParams.push(status);
            } else {
                countQuery += ` AND f.status IN ('ACEITO', 'TRANSITO', 'CONCLUIDO')`;
            }
        } else {
            if (status && status !== 'TODOS' && status !== 'DISPONIVEIS') {
                countQuery += ` AND f.status = ?`;
                countParams.push(status);
            } else {
                countQuery += ` AND f.status IN ('AGUARDANDO', 'NEGOCIACAO')`;
            }
        }

        // Filtros no COUNT
        if (origem) { countQuery += ` AND (f.origem_cep LIKE ? OR f.origem_endereco LIKE ?)`; countParams.push(`%${origem}%`, `%${origem}%`); }
        if (destino) { countQuery += ` AND (f.destino_cep LIKE ? OR f.destino_endereco LIKE ?)`; countParams.push(`%${destino}%`, `%${destino}%`); }
        if (tipo_carga) { countQuery += ` AND f.tipo_carga = ?`; countParams.push(tipo_carga); }
        if (peso_min) { countQuery += ` AND f.peso_kg >= ?`; countParams.push(parseFloat(peso_min)); }
        if (peso_max) { countQuery += ` AND f.peso_kg <= ?`; countParams.push(parseFloat(peso_max)); }
        if (valor_min) { countQuery += ` AND f.valor_ofertado >= ?`; countParams.push(parseFloat(valor_min)); }
        if (valor_max) { countQuery += ` AND f.valor_ofertado <= ?`; countParams.push(parseFloat(valor_max)); }
        if (data_coleta) { countQuery += ` AND DATE(f.data_coleta_prevista) >= ?`; countParams.push(data_coleta); }

        const [countResult] = await db.query(countQuery, countParams);
        const total = countResult[0].total;

        res.json({
            data: rows,
            total: total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit))
        });
    } catch (error) {
        console.error('Erro ao listar fretes:', error);
        res.status(500).json({ error: 'Erro ao listar fretes' });
    }
};
const listarMeusFretes = async (req, res) => {
    try {
        const userId = req.userId; // Garante o id do usuário vindo do token
        const { status } = req.query; // Pega o status enviado pelo frontend

        // 1. Busca o ID do embarcador vinculado a essa pessoa logada
        const [embarcadorRows] = await db.query(
            'SELECT id FROM embarcadores WHERE pessoa_id = ?',
            [userId]
        );

        if (embarcadorRows.length === 0) {
            return res.status(403).json({ error: 'Usuário não possui perfil de embarcador registrado.' });
        }

        const embarcadorId = embarcadorRows[0].id;

        // 2. Monta a query base filtrando pelo embarcador
        let query = 'SELECT * FROM fretes WHERE embarcador_id = ?';
        const params = [embarcadorId];

        // 3. Adiciona o filtro de status caso não seja 'TODOS'
        if (status && status !== 'TODOS') {
            query += ' AND status = ?';
            params.push(status);
        }

        // Ordena pelos publicados mais recentemente
        query += ' ORDER BY data_publicacao DESC';

        const [rows] = await db.query(query, params);
        
        // Retorna a propriedade data contendo as linhas, exatamente como seu frontend lê
        res.json({ data: rows });

    } catch (error) {
        console.error('Erro ao listar meus fretes:', error);
        res.status(500).json({ error: 'Erro ao listar meus fretes' });
    }
};
const buscarFrete = async (req, res) => {
    try {
        const { id } = req.params;

        const [rows] = await db.query(`
            SELECT 
                f.*,
                p.nome_razao_social as embarcador_nome
            FROM fretes f
            JOIN embarcadores e ON f.embarcador_id = e.id
            JOIN pessoas p ON e.pessoa_id = p.id
            WHERE f.id = ?
        `, [id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Frete não encontrado.' });
        }
        
        const frete = rows[0];
        return res.json({ data: frete });

    } catch (error) {
        console.error('Erro ao buscar detalhes do frete:', error);
        return res.status(500).json({ error: 'Erro interno ao buscar detalhes do frete' });
    }
};

const criarFrete = async (req, res) => {
    try {
        console.log('📦 Dados recebidos:', req.body); 
        console.log('👤 Usuário ID:', req.userId); 

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
        
        console.log('🔍 Verificando embarcador_id:', embarcador_id); 

        const [result] = await db.query(
            `INSERT INTO fretes (embarcador_id, criado_por, origem_cep, origem_endereco, destino_cep, destino_endereco, tipo_carga, peso_kg, valor_ofertado, data_coleta_prevista, data_entrega_prevista, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'AGUARDANDO')`,
            [embarcador_id, req.userId, origem_cep, origem_endereco, destino_cep, destino_endereco, tipo_carga, peso_kg, valor_ofertado, data_coleta_prevista, data_entrega_prevista]
        );
        
        console.log('✅ Frete criado com ID:', result.insertId); 

        res.status(201).json({ message: 'Frete publicado com sucesso', id: result.insertId });
    } catch (error) {
        console.error('❌ ERRO COMPLETO:', error); 
        console.error('❌ Mensagem:', error.message);
        console.error('❌ SQL:', error.sql);
        res.status(500).json({ error: 'Erro ao criar frete' });
    }
};

const atualizarFrete = async (req, res) => {
    try {
        const { id } = req.params;
        const body = req.body;

        // Se for enviado APENAS o status para alterar o estado do frete
        if (body.status && Object.keys(body).length === 1) {
            let statusQuery = `UPDATE fretes SET status = ?`;
            const statusParams = [body.status];

            if (body.status === 'TRANSITO' || body.status === 'EM TRÂNSITO') {
                statusQuery += `, data_coleta_realizada = NOW()`;
            }
            if (body.status === 'CONCLUIDO') {
                statusQuery += `, data_entrega_realizada = NOW()`;
            }

            statusQuery += ` WHERE id = ?`;
            statusParams.push(id);

            await db.query(statusQuery, statusParams);
            return res.json({ message: 'Status do frete atualizado com sucesso' });
        }

        // Caso seja uma edição completa do frete
        const { 
            origem_cep, origem_endereco, destino_cep, destino_endereco, 
            tipo_carga, peso_kg, valor_ofertado, data_coleta_prevista, 
            data_entrega_prevista, status 
        } = body;

        let query = `
            UPDATE fretes SET 
                origem_cep = COALESCE(?, origem_cep), 
                origem_endereco = COALESCE(?, origem_endereco), 
                destino_cep = COALESCE(?, destino_cep), 
                destino_endereco = COALESCE(?, destino_endereco), 
                tipo_carga = COALESCE(?, tipo_carga), 
                peso_kg = COALESCE(?, peso_kg), 
                valor_ofertado = COALESCE(?, valor_ofertado), 
                data_coleta_prevista = COALESCE(?, data_coleta_prevista), 
                data_entrega_prevista = COALESCE(?, data_entrega_prevista)
        `;
        const params = [
            origem_cep, origem_endereco, destino_cep, destino_endereco, 
            tipo_carga, peso_kg, valor_ofertado, data_coleta_prevista, 
            data_entrega_prevista
        ];

        if (status) {
            query += `, status = ?`;
            params.push(status);

            if (status === 'TRANSITO' || status === 'EM TRÂNSITO') {
                query += `, data_coleta_realizada = NOW()`;
            }
            if (status === 'CONCLUIDO') {
                query += `, data_entrega_realizada = NOW()`;
            }
        }

        query += ` WHERE id = ?`;
        params.push(id);

        await db.query(query, params);
        res.json({ message: 'Frete atualizado com sucesso' });

    } catch (error) {
        console.error('Erro ao atualizar frete:', error);
        res.status(500).json({ error: 'Erro ao atualizar frete' });
    }
};
const cancelarFrete = async (req, res) => {
    try {
        const { id } = req.params;
        const { motivo } = req.body;
        const userId = req.userId;

        const [embarcadorRows] = await db.query(
            'SELECT id FROM embarcadores WHERE pessoa_id = ?',
            [userId]
        );

        if (embarcadorRows.length === 0) {
            return res.status(404).json({ error: 'Embarcador não encontrado' });
        }

        const embarcadorId = embarcadorRows[0].id;

        const [freteRows] = await db.query(
            'SELECT id, status FROM fretes WHERE id = ? AND embarcador_id = ?',
            [id, embarcadorId]
        );

        if (freteRows.length === 0) {
            return res.status(404).json({ error: 'Frete não encontrado' });
        }

        const frete = freteRows[0];
        const statusPermitidos = ['AGUARDANDO', 'NEGOCIACAO'];
        if (!statusPermitidos.includes(frete.status)) {
            return res.status(400).json({ 
                error: `Não é possível cancelar um frete com status "${frete.status}".` 
            });
        }

        await db.query(
            `UPDATE fretes SET status = 'CANCELADO', motivo_cancelamento = ? WHERE id = ?`,
            [motivo || 'Cancelado pelo embarcador', id]
        );

        res.json({ 
            message: 'Frete canceled com sucesso',
            id: id,
            status: 'CANCELADO'
        });
    } catch (error) {
        console.error('Erro ao cancelar frete:', error);
        res.status(500).json({ error: 'Erro ao cancelar frete' });
    }
};

module.exports = { listarMeusFretes,   listarFretesAceitos, listarDisponiveis, listarFretes, buscarFrete, criarFrete, atualizarFrete, cancelarFrete };