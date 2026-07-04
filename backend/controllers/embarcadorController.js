// controllers/embarcadorController.js
const db = require('../config/database');

const getPerfil = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT e.*, p.nome_razao_social, p.email, p.telefone, p.status
            FROM embarcadores e
            JOIN pessoas p ON e.pessoa_id = p.id
            WHERE e.pessoa_id = ?
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
        const { inscricao_estadual, porte_empresa, score_credito, limite_credito, dias_pagamento } = req.body;
        await db.query(
            'UPDATE embarcadores SET inscricao_estadual = ?, porte_empresa = ?, score_credito = ?, limite_credito = ?, dias_pagamento = ? WHERE pessoa_id = ?',
            [inscricao_estadual, porte_empresa, score_credito, limite_credito, dias_pagamento, req.userId]
        );
        res.json({ message: 'Perfil atualizado com sucesso' });
    } catch (error) {
        console.error('Erro ao atualizar perfil:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

const getEstatisticas = async (req, res) => {
    try {
        // 1. Executa a query trazendo a contagem exata baseada nos ENUMs da tabela fretes
        const [fretes] = await db.query(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'CONCLUIDO' THEN 1 ELSE 0 END) as concluidos,
                SUM(CASE WHEN status = 'CANCELADO' THEN 1 ELSE 0 END) as cancelados,
                SUM(CASE WHEN status = 'AGUARDANDO' THEN 1 ELSE 0 END) as aguardando,
                SUM(CASE WHEN status IN ('NEGOCIACAO', 'ACEITO', 'TRANSITO') THEN 1 ELSE 0 END) as emAndamento,
                COALESCE(SUM(CASE WHEN status = 'CONCLUIDO' THEN valor_fechado ELSE valor_ofertado END), 0) as faturamentoTotal
            FROM fretes 
            WHERE embarcador_id = (SELECT id FROM embarcadores WHERE pessoa_id = ?)
        `, [req.userId]);
        
        const dadosFrete = fretes[0] || { total: 0, concluidos: 0, cancelados: 0, aguardando: 0, emAndamento: 0, faturamentoTotal: 0 };

        // 2. Busca a média de avaliações recebidas
        const [avaliacoes] = await db.query(`
            SELECT AVG(nota_geral) as media
            FROM avaliacoes 
            WHERE avaliado_id = ? AND tipo_avaliacao = 'TRANSPORTADOR_EMPRESA'
        `, [req.userId]);
        
        // 3. Retorna as chaves EXATAMENTE como o seu useDashboard.js precisa receber
        res.json({ 
            totalFretes: dadosFrete.total || 0,
            emAndamento: dadosFrete.emAndamento || 0,
            aguardando: dadosFrete.aguardando || 0,
            concluidos: dadosFrete.concluidos || 0,
            cancelados: dadosFrete.cancelados || 0,
            faturamento: parseFloat(dadosFrete.faturamentoTotal) || 0,
            avaliacaoMedia: parseFloat(avaliacoes[0]?.media) || 0
        });

    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};
const getEmbarcadorPorPessoa = async (req, res) => {
    try {
        const { pessoa_id } = req.params;
        
        const [rows] = await db.query(
            'SELECT id FROM embarcadores WHERE pessoa_id = ?',
            [pessoa_id]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Embarcador nao encontrado' });
        }
        
        res.json({ id: rows[0].id });
    } catch (error) {
        console.error('Erro ao buscar embarcador:', error);
        res.status(500).json({ error: 'Erro ao buscar embarcador' });
    }
};

module.exports = { getPerfil, atualizarPerfil, getEmbarcadorPorPessoa, getEstatisticas };