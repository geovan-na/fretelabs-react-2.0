// controllers/adminController.js
const db = require('../config/database');

const getDashboardStats = async (req, res) => {
    try {
        const [usuarios] = await db.query(`
            SELECT 
                COUNT(*) as totalUsuarios,
                SUM(CASE WHEN status = 'PENDENTE' THEN 1 ELSE 0 END) as pendentes,
                SUM(CASE WHEN status = 'APROVADO' THEN 1 ELSE 0 END) as aprovados,
                SUM(CASE WHEN status = 'BLOQUEADO' THEN 1 ELSE 0 END) as bloqueados
            FROM pessoas
        `);
        
        const [fretes] = await db.query(`
            SELECT 
                COUNT(*) as totalFretes,
                SUM(CASE WHEN status = 'TRANSITO' THEN 1 ELSE 0 END) as emTransito,
                SUM(CASE WHEN status = 'CONCLUIDO' THEN 1 ELSE 0 END) as concluidos,
                SUM(CASE WHEN status = 'CANCELADO' THEN 1 ELSE 0 END) as cancelados
            FROM fretes
        `);
        
        const [veiculos] = await db.query(`
            SELECT COUNT(*) as totalVeiculos
            FROM veiculos
        `);
        
        res.json({
            usuarios: usuarios[0],
            fretes: fretes[0],
            veiculos: veiculos[0]
        });
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
};

module.exports = { getDashboardStats };