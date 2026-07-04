// controllers/dashboardController.js
const db = require('../config/database');

// 1. Estatísticas do Embarcador
const getEmbarcadorStats = async (req, res) => {
    try {
        const userId = req.userId;
        
        const [fretes] = await db.query(`
            SELECT 
                COUNT(*) as totalFretes,
                SUM(CASE WHEN status = 'AGUARDANDO' THEN 1 ELSE 0 END) as aguardando,
                SUM(CASE WHEN status = 'NEGOCIACAO' THEN 1 ELSE 0 END) as emNegociacao,
                SUM(CASE WHEN status = 'TRANSITO' THEN 1 ELSE 0 END) as emTransito,
                SUM(CASE WHEN status = 'CONCLUIDO' THEN 1 ELSE 0 END) as concluidos,
                COALESCE(SUM(valor_fechado), 0) as gastoTotal
            FROM fretes 
            WHERE embarcador_id = (SELECT id FROM embarcadores WHERE pessoa_id = ?)
        `, [userId]);
        
        const [candidaturasPendentes] = await db.query(`
            SELECT COUNT(*) as total 
            FROM candidaturas c
            JOIN fretes f ON c.frete_id = f.id
            WHERE f.embarcador_id = (SELECT id FROM embarcadores WHERE pessoa_id = ?)
            AND c.status = 'PENDENTE'
        `, [userId]);
        
        res.json({
            stats: {
                totalFretes: fretes[0]?.totalFretes || 0,
                aguardando: fretes[0]?.aguardando || 0,
                emNegociacao: fretes[0]?.emNegociacao || 0,
                emTransito: fretes[0]?.emTransito || 0,
                concluidos: fretes[0]?.concluidos || 0,
                gastoTotal: fretes[0]?.gastoTotal || 0,
                candidaturasPendentes: candidaturasPendentes[0]?.total || 0
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. Estatísticas da Frota
const getFrotaStats = async (req, res) => {
    try {
        const userId = req.userId;
        
        const [veiculos] = await db.query(`
            SELECT 
                COUNT(*) as totalVeiculos,
                SUM(CASE WHEN status = 'ATIVO' THEN 1 ELSE 0 END) as veiculosAtivos,
                SUM(CASE WHEN status = 'MANUTENCAO' THEN 1 ELSE 0 END) as emManutencao
            FROM veiculos 
            WHERE transportador_id = (SELECT id FROM transportadores WHERE pessoa_id = ?)
        `, [userId]);
        
        const [motoristas] = await db.query(`
            SELECT 
                COUNT(*) as totalMotoristas,
                SUM(CASE WHEN status = 'ATIVO' THEN 1 ELSE 0 END) as motoristasAtivos
            FROM motoristas_vinculados 
            WHERE transportador_id = (SELECT id FROM transportadores WHERE pessoa_id = ?)
        `, [userId]);
        
        const [fretes] = await db.query(`
            SELECT 
                COUNT(*) as totalFretes,
                SUM(CASE WHEN status = 'ACEITO' THEN 1 ELSE 0 END) as fretesAceitos,
                SUM(CASE WHEN status = 'TRANSITO' THEN 1 ELSE 0 END) as fretesEmTransito,
                SUM(CASE WHEN status = 'CONCLUIDO' THEN 1 ELSE 0 END) as fretesConcluidos,
                COALESCE(SUM(valor_fechado), 0) as faturamento
            FROM fretes 
            WHERE transportador_id = (SELECT id FROM transportadores WHERE pessoa_id = ?)
        `, [userId]);
        
        res.json({
            stats: {
                totalVeiculos: veiculos[0]?.totalVeiculos || 0,
                veiculosAtivos: veiculos[0]?.veiculosAtivos || 0,
                emManutencao: veiculos[0]?.emManutencao || 0,
                totalMotoristas: motoristas[0]?.totalMotoristas || 0,
                motoristasAtivos: motoristas[0]?.motoristasAtivos || 0,
                totalFretes: fretes[0]?.totalFretes || 0,
                fretesAceitos: fretes[0]?.fretesAceitos || 0,
                fretesEmTransito: fretes[0]?.fretesEmTransito || 0,
                fretesConcluidos: fretes[0]?.fretesConcluidos || 0,
                faturamento: fretes[0]?.faturamento || 0
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. Estatísticas do Autônomo
const getAutonomoStats = async (req, res) => {
    try {
        const userId = req.userId;
        
        const [veiculo] = await db.query(`
            SELECT id, placa, modelo, status 
            FROM veiculos 
            WHERE transportador_id = (SELECT id FROM transportadores WHERE pessoa_id = ?)
            LIMIT 1
        `, [userId]);
        
        const [fretes] = await db.query(`
            SELECT 
                COUNT(*) as totalFretes,
                SUM(CASE WHEN status = 'ACEITO' THEN 1 ELSE 0 END) as fretesAceitos,
                SUM(CASE WHEN status = 'TRANSITO' THEN 1 ELSE 0 END) as fretesEmTransito,
                SUM(CASE WHEN status = 'CONCLUIDO' THEN 1 ELSE 0 END) as fretesConcluidos,
                COALESCE(SUM(valor_fechado), 0) as receitaTotal
            FROM fretes 
            WHERE transportador_id = (SELECT id FROM transportadores WHERE pessoa_id = ?)
        `, [userId]);
        
        const [candidaturas] = await db.query(`
            SELECT COUNT(*) as total 
            FROM candidaturas 
            WHERE transportador_id = (SELECT id FROM transportadores WHERE pessoa_id = ?)
            AND status = 'PENDENTE'
        `, [userId]);
        
        const totalFretes = fretes[0]?.totalFretes || 0;
        const fretesConcluidos = fretes[0]?.fretesConcluidos || 0;
        
        res.json({
            stats: {
                possuiVeiculo: veiculo.length > 0,
                veiculoPlaca: veiculo[0]?.placa || null,
                veiculoModelo: veiculo[0]?.modelo || null,
                veiculoStatus: veiculo[0]?.status || null,
                totalFretes: totalFretes,
                fretesAceitos: fretes[0]?.fretesAceitos || 0,
                fretesEmTransito: fretes[0]?.fretesEmTransito || 0,
                fretesConcluidos: fretesConcluidos,
                receitaTotal: fretes[0]?.receitaTotal || 0,
                candidaturasPendentes: candidaturas[0]?.total || 0,
                taxaAceite: totalFretes > 0 ? Math.round((fretesConcluidos / totalFretes) * 100) : 0
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. Estatísticas do Motorista Vinculado
const getVinculadoStats = async (req, res) => {
    try {
        const userId = req.userId;
        
        const [motorista] = await db.query(`
            SELECT transportador_id, status, data_admissao
            FROM motoristas_vinculados 
            WHERE pessoa_id = ?
        `, [userId]);
        
        const [fretes] = await db.query(`
            SELECT 
                COUNT(*) as totalFretes,
                SUM(CASE WHEN status = 'ACEITO' THEN 1 ELSE 0 END) as fretesAceitos,
                SUM(CASE WHEN status = 'TRANSITO' THEN 1 ELSE 0 END) as fretesEmTransito,
                SUM(CASE WHEN status = 'CONCLUIDO' THEN 1 ELSE 0 END) as fretesConcluidos,
                COALESCE(SUM(valor_fechado), 0) as totalRecebido
            FROM fretes 
            WHERE transportador_id = ? AND veiculo_id IS NOT NULL
        `, [motorista[0]?.transportador_id || 0]);
        
        const [avaliacao] = await db.query(`
            SELECT AVG(nota_geral) as media
            FROM avaliacoes 
            WHERE avaliado_id = ?
        `, [userId]);
        
        res.json({
            stats: {
                totalFretes: fretes[0]?.totalFretes || 0,
                fretesAceitos: fretes[0]?.fretesAceitos || 0,
                fretesEmTransito: fretes[0]?.fretesEmTransito || 0,
                fretesConcluidos: fretes[0]?.fretesConcluidos || 0,
                totalRecebido: fretes[0]?.totalRecebido || 0,
                statusVinculo: motorista[0]?.status || 'DESLIGADO',
                dataAdmissao: motorista[0]?.data_admissao || null,
                avaliacaoMedia: parseFloat(avaliacao[0]?.media) || 0
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 5. Estatísticas do Admin
const getAdminStats = async (req, res) => {
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
                SUM(CASE WHEN status = 'CANCELADO' THEN 1 ELSE 0 END) as cancelados,
                COALESCE(SUM(valor_fechado), 0) as faturamento
            FROM fretes
        `);
        
        const [veiculos] = await db.query(`
            SELECT 
                COUNT(*) as totalVeiculos,
                SUM(CASE WHEN status = 'ATIVO' THEN 1 ELSE 0 END) as veiculosAtivos
            FROM veiculos
        `);
        
        const totalVeiculos = veiculos[0]?.totalVeiculos || 0;
        const veiculosAtivos = veiculos[0]?.veiculosAtivos || 0;
        
        res.json({
            stats: {
                totalUsuarios: usuarios[0]?.totalUsuarios || 0,
                pendentes: usuarios[0]?.pendentes || 0,
                aprovados: usuarios[0]?.aprovados || 0,
                bloqueados: usuarios[0]?.bloqueados || 0,
                totalFretes: fretes[0]?.totalFretes || 0,
                emTransito: fretes[0]?.emTransito || 0,
                concluidos: fretes[0]?.concluidos || 0,
                cancelados: fretes[0]?.cancelados || 0,
                faturamento: fretes[0]?.faturamento || 0,
                totalVeiculos: totalVeiculos,
                veiculosAtivos: veiculosAtivos,
                taxaOcupacao: totalVeiculos > 0 ? Math.round((veiculosAtivos / totalVeiculos) * 100) : 0
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 6. Atividades Recentes
const getAtividades = async (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;
        
        let rows = [];
        
        if (userRole === 'embarcador') {
            [rows] = await db.query(`
                SELECT 
                    f.id as id,
                    'frete' as tipo,
                    CONCAT('Frete #', f.id, ' - ', f.status) as descricao,
                    f.data_publicacao as data,
                    f.status
                FROM fretes f
                WHERE f.embarcador_id = (SELECT id FROM embarcadores WHERE pessoa_id = ?)
                ORDER BY f.data_publicacao DESC
                LIMIT 10
            `, [userId]);
        } else if (userRole === 'frota' || userRole === 'autonomo') {
            [rows] = await db.query(`
                SELECT 
                    f.id as id,
                    'frete' as tipo,
                    CONCAT('Frete #', f.id, ' - ', f.status) as descricao,
                    f.data_publicacao as data,
                    f.status
                FROM fretes f
                WHERE f.transportador_id = (SELECT id FROM transportadores WHERE pessoa_id = ?)
                ORDER BY f.data_publicacao DESC
                LIMIT 10
            `, [userId]);
        } else if (userRole === 'admin') {
            [rows] = await db.query(`
                (SELECT 
                    p.id as id,
                    'usuario' as tipo,
                    CONCAT('Novo usuário cadastrado: ', p.nome_razao_social) as descricao,
                    p.data_cadastro as data,
                    p.status
                FROM pessoas p
                ORDER BY p.data_cadastro DESC
                LIMIT 5)
                UNION ALL
                (SELECT 
                    f.id as id,
                    'frete' as tipo,
                    CONCAT('Frete #', f.id, ' - ', f.status) as descricao,
                    f.data_publicacao as data,
                    f.status
                FROM fretes f
                ORDER BY f.data_publicacao DESC
                LIMIT 5)
                ORDER BY data DESC
                LIMIT 10
            `);
        }
        
        res.json({ atividades: rows });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 7. Alertas do Sistema
const getAlertas = async (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;
        
        let alertas = [];
        
        if (userRole === 'admin') {
            const [pendentes] = await db.query(`
                SELECT COUNT(*) as total FROM pessoas WHERE status = 'PENDENTE'
            `);
            
            const [blacklist] = await db.query(`
                SELECT COUNT(*) as total FROM blacklist WHERE ativo = true
            `);
            
            alertas = [
                {
                    tipo: 'warning',
                    mensagem: `${pendentes[0]?.total || 0} usuários com documentos pendentes`,
                    detalhes: 'Ver detalhes'
                },
                {
                    tipo: 'danger',
                    mensagem: `${blacklist[0]?.total || 0} usuários na blacklist`,
                    detalhes: 'Ver detalhes'
                }
            ];
            
            // Taxa de cancelamento
            const [cancelamento] = await db.query(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'CANCELADO' THEN 1 ELSE 0 END) as cancelados
                FROM fretes
            `);
            
            const total = cancelamento[0]?.total || 0;
            const cancelados = cancelamento[0]?.cancelados || 0;
            const taxaCancelamento = total > 0 ? Math.round((cancelados / total) * 100) : 0;
            
            alertas.push({
                tipo: 'info',
                mensagem: `Taxa de cancelamento: ${taxaCancelamento}%`,
                detalhes: 'Ver relatório'
            });
            
        } else if (userRole === 'frota' || userRole === 'autonomo') {
            const [manutencao] = await db.query(`
                SELECT COUNT(*) as total 
                FROM veiculos 
                WHERE transportador_id = (SELECT id FROM transportadores WHERE pessoa_id = ?)
                AND status = 'MANUTENCAO'
            `, [userId]);
            
            if (manutencao[0]?.total > 0) {
                alertas.push({
                    tipo: 'warning',
                    mensagem: `${manutencao[0].total} veículo(s) em manutenção`,
                    detalhes: 'Verificar status'
                });
            }
            
            // Seguro vencendo
            const [seguro] = await db.query(`
                SELECT COUNT(*) as total 
                FROM veiculos 
                WHERE transportador_id = (SELECT id FROM transportadores WHERE pessoa_id = ?)
                AND seguro_validade IS NOT NULL 
                AND seguro_validade <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
            `, [userId]);
            
            if (seguro[0]?.total > 0) {
                alertas.push({
                    tipo: 'warning',
                    mensagem: `${seguro[0].total} veículo(s) com seguro vencendo em 30 dias`,
                    detalhes: 'Verificar seguros'
                });
            }
        }
        
        res.json({ alertas });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 8. Dados para Gráficos - Embarcador
const getEmbarcadorCharts = async (req, res) => {
    try {
        const userId = req.userId;
        
        const [fretesPorMes] = await db.query(`
            SELECT 
                MONTH(data_publicacao) as mes,
                COUNT(*) as total
            FROM fretes
            WHERE embarcador_id = (SELECT id FROM embarcadores WHERE pessoa_id = ?)
            AND YEAR(data_publicacao) = YEAR(CURDATE())
            GROUP BY MONTH(data_publicacao)
            ORDER BY mes
        `, [userId]);
        
        const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const dados = meses.map((mes, index) => {
            const encontrado = fretesPorMes.find(f => f.mes === index + 1);
            return { label: mes, value: encontrado?.total || 0 };
        });
        
        res.json({ data: dados });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 9. Dados para Gráficos - Frota
const getFrotaCharts = async (req, res) => {
    try {
        const userId = req.userId;
        
        const [dados] = await db.query(`
            SELECT 
                MONTH(data_publicacao) as mes,
                COUNT(*) as totalFretes,
                COALESCE(SUM(valor_fechado), 0) as faturamento
            FROM fretes
            WHERE transportador_id = (SELECT id FROM transportadores WHERE pessoa_id = ?)
            AND YEAR(data_publicacao) = YEAR(CURDATE())
            GROUP BY MONTH(data_publicacao)
            ORDER BY mes
        `, [userId]);
        
        const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const resultado = meses.map((mes, index) => {
            const encontrado = dados.find(f => f.mes === index + 1);
            return { 
                label: mes, 
                fretes: encontrado?.totalFretes || 0,
                faturamento: encontrado?.faturamento || 0
            };
        });
        
        res.json({ data: resultado });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 10. Dados para Gráficos - Autônomo
const getAutonomoCharts = async (req, res) => {
    try {
        const userId = req.userId;
        
        const [receita] = await db.query(`
            SELECT 
                MONTH(data_publicacao) as mes,
                COALESCE(SUM(valor_fechado), 0) as total
            FROM fretes
            WHERE transportador_id = (SELECT id FROM transportadores WHERE pessoa_id = ?)
            AND YEAR(data_publicacao) = YEAR(CURDATE())
            AND status = 'CONCLUIDO'
            GROUP BY MONTH(data_publicacao)
            ORDER BY mes
        `, [userId]);
        
        const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const dados = meses.map((mes, index) => {
            const encontrado = receita.find(f => f.mes === index + 1);
            return { label: mes, value: encontrado?.total || 0 };
        });
        
        res.json({ data: dados });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 11. Dados para Gráficos - Admin
const getAdminCharts = async (req, res) => {
    try {
        const [usuarios] = await db.query(`
            SELECT 
                MONTH(data_cadastro) as mes,
                COUNT(*) as total
            FROM pessoas
            WHERE YEAR(data_cadastro) = YEAR(CURDATE())
            GROUP BY MONTH(data_cadastro)
            ORDER BY mes
        `);
        
        const [fretes] = await db.query(`
            SELECT 
                MONTH(data_publicacao) as mes,
                COUNT(*) as total
            FROM fretes
            WHERE YEAR(data_publicacao) = YEAR(CURDATE())
            GROUP BY MONTH(data_publicacao)
            ORDER BY mes
        `);
        
        const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        const dados = meses.map((mes, index) => {
            const usuariosEncontrado = usuarios.find(f => f.mes === index + 1);
            const fretesEncontrado = fretes.find(f => f.mes === index + 1);
            return { 
                label: mes, 
                usuarios: usuariosEncontrado?.total || 0,
                fretes: fretesEncontrado?.total || 0
            };
        });
        
        res.json({ data: dados });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 12. Motoristas Favoritos (Embarcador)
const getFavoriteMotoristas = async (req, res) => {
    try {
        const userId = req.userId;
        
        // Buscar motoristas com melhores avaliações que já trabalharam com o embarcador
        const [motoristas] = await db.query(`
            SELECT 
                p.id,
                p.nome_razao_social as nome,
                t.avaliacao_media as avaliacao,
                COUNT(f.id) as totalFretes
            FROM transportadores t
            JOIN pessoas p ON t.pessoa_id = p.id
            JOIN fretes f ON f.transportador_id = t.id
            WHERE f.embarcador_id = (SELECT id FROM embarcadores WHERE pessoa_id = ?)
            AND f.status = 'CONCLUIDO'
            GROUP BY p.id, p.nome_razao_social, t.avaliacao_media
            ORDER BY t.avaliacao_media DESC
            LIMIT 5
        `, [userId]);
        
        res.json({ motoristas });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 13. Próximos Fretes (Autônomo/Vinculado)
const getProximosFretes = async (req, res) => {
    try {
        const userId = req.userId;
        const userRole = req.userRole;
        
        let fretes = [];
        
        if (userRole === 'autonomo' || userRole === 'frota') {
            [fretes] = await db.query(`
                SELECT 
                    f.id,
                    f.origem_cep,
                    f.destino_cep,
                    f.valor_fechado as valor,
                    f.data_coleta_prevista as data,
                    f.status
                FROM fretes f
                WHERE f.transportador_id = (SELECT id FROM transportadores WHERE pessoa_id = ?)
                AND f.status IN ('ACEITO', 'TRANSITO')
                ORDER BY f.data_coleta_prevista ASC
                LIMIT 5
            `, [userId]);
        } else if (userRole === 'vinculado') {
            [fretes] = await db.query(`
                SELECT 
                    f.id,
                    f.origem_cep,
                    f.destino_cep,
                    f.valor_fechado as valor,
                    f.data_coleta_prevista as data,
                    f.status
                FROM fretes f
                WHERE f.transportador_id = (
                    SELECT transportador_id FROM motoristas_vinculados WHERE pessoa_id = ?
                )
                AND f.status IN ('ACEITO', 'TRANSITO')
                ORDER BY f.data_coleta_prevista ASC
                LIMIT 5
            `, [userId]);
        }
        
        res.json({ fretes });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 14. Veículos Ranking (Frota)
const getVeiculosRanking = async (req, res) => {
    try {
        const userId = req.userId;
        
        const [veiculos] = await db.query(`
            SELECT 
                v.id,
                v.placa,
                v.modelo,
                COUNT(f.id) as fretesRealizados
            FROM veiculos v
            LEFT JOIN fretes f ON f.veiculo_id = v.id AND f.status = 'CONCLUIDO'
            WHERE v.transportador_id = (SELECT id FROM transportadores WHERE pessoa_id = ?)
            GROUP BY v.id, v.placa, v.modelo
            ORDER BY fretesRealizados DESC
            LIMIT 5
        `, [userId]);
        
        res.json({ veiculos });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { 
    getEmbarcadorStats,
    getFrotaStats,
    getAutonomoStats,
    getVinculadoStats,
    getAdminStats,
    getAtividades,
    getAlertas,
    getEmbarcadorCharts,
    getFrotaCharts,
    getAutonomoCharts,
    getAdminCharts,
    getFavoriteMotoristas,
    getProximosFretes,
    getVeiculosRanking
};