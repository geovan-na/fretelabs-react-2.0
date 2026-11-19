// controllers/transportadorController.js
const db = require('../config/database');

const getPerfil = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT t.*, p.nome_razao_social, p.email, p.telefone, p.status
            FROM transportadores t
            JOIN pessoas p ON t.pessoa_id = p.id
            WHERE t.pessoa_id = ?
        `, [req.userId]);
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Perfil não encontrado' });
        }
        res.json({ data: rows[0] });
    } catch (error) {
        console.error('Erro ao buscar perfil:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

const atualizarPerfil = async (req, res) => {
    try {
        const { registro_nacional_transportador, area_atuacao, tipos_carga, verificacao_documental } = req.body;
        await db.query(
            'UPDATE transportadores SET registro_nacional_transportador = ?, area_atuacao = ?, tipos_carga = ?, verificacao_documental = ? WHERE pessoa_id = ?',
            [registro_nacional_transportador, area_atuacao, tipos_carga, verificacao_documental || false, req.userId]
        );
        res.json({ message: 'Perfil atualizado com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

const getEstatisticas = async (req, res) => {
    try {
        const [fretes] = await db.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'CONCLUIDO' THEN 1 ELSE 0 END) as concluidos,
                COALESCE(SUM(valor_fechado), 0) as faturamento
            FROM fretes 
            WHERE transportador_id = (SELECT id FROM transportadores WHERE pessoa_id = ?)
        `, [req.userId]);
        
        const [veiculos] = await db.query(`
            SELECT COUNT(*) as total
            FROM veiculos 
            WHERE transportador_id = (SELECT id FROM transportadores WHERE pessoa_id = ?)
        `, [req.userId]);
        
        const [avaliacoes] = await db.query(`
            SELECT AVG(nota_geral) as media
            FROM avaliacoes 
            WHERE avaliado_id = ? AND tipo_avaliacao = 'EMPRESA_TRANSPORTADOR'
        `, [req.userId]);
        
        res.json({ 
            fretes: fretes[0] || { total: 0, concluidos: 0, faturamento: 0 },
            totalVeiculos: veiculos[0]?.total || 0,
            avaliacaoMedia: avaliacoes[0]?.media || 0
        });
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

const buscarPorPessoa = async (req, res) => {
    try {
        const userId = req.userId;

        const [rows] = await db.query(
            'SELECT id FROM transportadores WHERE pessoa_id = ?',
            [userId]
        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Transportador não encontrado' });
        }

        res.json({ id: rows[0].id });
    } catch (error) {
        console.error('Erro ao buscar transportador:', error);
        res.status(500).json({ error: 'Erro ao buscar transportador' });
    }
};

const listarFretesRastreamento = async (req, res) => {
    try {
        const userId = req.userId;

        // Busca transportador_id da pessoa logada (FROTA)
        const [transportadores] = await db.query(
            'SELECT id FROM transportadores WHERE pessoa_id = ?',
            [userId]
        );

        if (transportadores.length === 0) {
            return res.json({ data: [] });
        }

        const transportadorId = transportadores[0].id;

        // A frota pode rastrear todos os seus fretes aceitos/em trânsito
        const [rows] = await db.query(`
            SELECT 
                f.id,
                CONCAT('FR', LPAD(f.id, 5, '0')) as codigo,
                f.origem_cep,
                f.origem_endereco,
                f.destino_cep,
                f.destino_endereco,
                CONCAT(f.origem_cep, ' - ', f.origem_endereco) as origem,
                CONCAT(f.destino_cep, ' - ', f.destino_endereco) as destino,
                f.tipo_carga,
                f.peso_kg as peso,
                f.status,
                f.prioridade,
                f.codigo_rastreamento,
                f.data_coleta_prevista,
                f.data_coleta_realizada,
                f.data_entrega_prevista,
                f.data_entrega_realizada,
                COALESCE(f.valor_fechado, f.valor_ofertado) as valor,
                -- Informações do EMBARCADOR
                p_emb.nome_razao_social as embarcador_nome,
                p_emb.telefone as embarcador_telefone,
                -- Informações do MOTORISTA que está transportando essa carga
                COALESCE(p_mot.nome_razao_social, 'Motorista pendente de designação') as motorista_nome,
                p_mot.telefone as motorista_telefone,
                mv.cnh_categoria as motorista_cnh_categoria,
                -- Informações do Veículo
                v.placa as veiculo_placa,
                v.modelo as veiculo_modelo,
                v.marca as veiculo_marca
            FROM fretes f
            LEFT JOIN embarcadores e ON f.embarcador_id = e.id
            LEFT JOIN pessoas p_emb ON e.pessoa_id = p_emb.id
            LEFT JOIN motoristas_vinculados mv ON f.motorista_vinculado_id = mv.id
            LEFT JOIN pessoas p_mot ON mv.pessoa_id = p_mot.id
            LEFT JOIN veiculos v ON f.veiculo_id = v.id
            WHERE f.transportador_id = ?
              AND f.status IN ('ACEITO', 'TRANSITO', 'CONCLUIDO')
            ORDER BY 
                CASE f.status 
                    WHEN 'TRANSITO' THEN 1 
                    WHEN 'ACEITO' THEN 2 
                    WHEN 'CONCLUIDO' THEN 3 
                    ELSE 4 
                END,
                f.data_coleta_prevista DESC
        `, [transportadorId]);

        for (let frete of rows) {
            const [historico] = await db.query(`
                SELECT status_anterior, status_novo, observacao, data_mudanca
                FROM historico_status_frete
                WHERE frete_id = ?
                ORDER BY data_mudanca ASC
            `, [frete.id]);

            frete.historico_status = historico;
        }

        res.json({ data: rows });
    } catch (error) {
        console.error('Erro ao listar fretes para rastreamento (frota):', error);
        res.status(500).json({ error: 'Erro ao carregar rastreamento da frota' });
    }
};

module.exports = { getPerfil, atualizarPerfil, getEstatisticas, buscarPorPessoa, listarFretesRastreamento };
