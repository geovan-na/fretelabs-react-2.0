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

module.exports = { getPerfil, atualizarPerfil, getEstatisticas };