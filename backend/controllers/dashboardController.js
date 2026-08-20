// backend/controllers/dashboardController.js
const db = require('../config/database');

// ============================================
// 1. DASHBOARD DO EMBARCADOR
// ============================================
const getEmbarcadorDashboard = async (req, res) => {
    try {
        const userId = req.userId; // Do middleware authenticateToken
        
        // Buscar o embarcador_id
        const [embarcadorRows] = await db.execute(
            'SELECT id FROM embarcadores WHERE pessoa_id = ?',
            [userId]
        );
        
        if (embarcadorRows.length === 0) {
            return res.status(404).json({ error: 'Embarcador não encontrado' });
        }
        
        const embarcadorId = embarcadorRows[0].id;
        
        // 1.1 Total de fretes por status
        const [fretesResumo] = await db.execute(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'AGUARDANDO' THEN 1 ELSE 0 END) as aguardando,
                SUM(CASE WHEN status = 'NEGOCIACAO' THEN 1 ELSE 0 END) as negociacao,
                SUM(CASE WHEN status = 'TRANSITO' THEN 1 ELSE 0 END) as transito,
                SUM(CASE WHEN status = 'CONCLUIDO' THEN 1 ELSE 0 END) as concluido,
                SUM(CASE WHEN status = 'CANCELADO' THEN 1 ELSE 0 END) as cancelado,
                COALESCE(SUM(valor_fechado), 0) as gasto_total
            FROM fretes
            WHERE embarcador_id = ?
        `, [embarcadorId]);
        
        // 1.2 Fretes por mês (últimos 6 meses)
        const [fretesPorMes] = await db.execute(`
            SELECT 
                DATE_FORMAT(data_publicacao, '%Y-%m') as mes,
                DATE_FORMAT(data_publicacao, '%b') as mes_label,
                COUNT(*) as total
            FROM fretes
            WHERE embarcador_id = ?
              AND data_publicacao >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(data_publicacao, '%Y-%m'), DATE_FORMAT(data_publicacao, '%b')
            ORDER BY mes ASC
        `, [embarcadorId]);
        
        // 1.3 Candidaturas pendentes
        const [candidaturasPendentes] = await db.execute(`
            SELECT 
                c.id,
                c.valor_lance,
                c.data_candidatura,
                p.nome_razao_social as transportador_nome,
                t.avaliacao_media,
                t.total_avaliacoes,
                f.id as frete_id,
                CONCAT(f.origem_cep, ' - ', f.origem_endereco) as origem,
                CONCAT(f.destino_cep, ' - ', f.destino_endereco) as destino
            FROM candidaturas c
            JOIN transportadores t ON c.transportador_id = t.id
            JOIN pessoas p ON t.pessoa_id = p.id
            JOIN fretes f ON c.frete_id = f.id
            WHERE f.embarcador_id = ?
              AND c.status = 'PENDENTE'
            ORDER BY c.data_candidatura DESC
            LIMIT 5
        `, [embarcadorId]);
        
        // 1.4 Atividades recentes
        const [atividadesRecentes] = await db.execute(`
            SELECT 
                id,
                CONCAT('FR', LPAD(id, 5, '0')) as codigo,
                CONCAT(origem_cep, ' - ', origem_endereco) as origem,
                CONCAT(destino_cep, ' - ', destino_endereco) as destino,
                data_publicacao as data,
                status
            FROM fretes
            WHERE embarcador_id = ?
            ORDER BY data_publicacao DESC
            LIMIT 5
        `, [embarcadorId]);
        
        // 1.5 Motoristas favoritos
        const [motoristasFavoritos] = await db.execute(`
            SELECT 
                p.id,
                p.nome_razao_social as nome,
                COUNT(f.id) as total_viagens,
                t.avaliacao_media
            FROM fretes f
            JOIN transportadores t ON f.transportador_id = t.id
            JOIN pessoas p ON t.pessoa_id = p.id
            WHERE f.embarcador_id = ?
              AND f.status = 'CONCLUIDO'
              AND f.transportador_id IS NOT NULL
            GROUP BY p.id, p.nome_razao_social, t.avaliacao_media
            ORDER BY total_viagens DESC
            LIMIT 5
        `, [embarcadorId]);
        
        return res.json({
            resumo: fretesResumo[0] || { total: 0, aguardando: 0, negociacao: 0, transito: 0, concluido: 0, cancelado: 0, gasto_total: 0 },
            fretes_por_mes: fretesPorMes,
            candidaturas_pendentes: candidaturasPendentes,
            atividades_recentes: atividadesRecentes,
            motoristas_favoritos: motoristasFavoritos
        });
        
    } catch (error) {
        console.error('Erro ao buscar dashboard do embarcador:', error);
        return res.status(500).json({ error: error.message || 'Erro interno do servidor' });
    }
};

// ============================================
// 2. DASHBOARD DA FROTA
// ============================================
const getFrotaDashboard = async (req, res) => {
    try {
        const userId = req.userId;
        
        const [transportadorRows] = await db.execute(
            "SELECT id FROM transportadores WHERE pessoa_id = ? AND tipo_transportador = 'FROTA'",
            [userId]
        );
        
        if (transportadorRows.length === 0) {
            return res.status(404).json({ error: 'Frota não encontrada' });
        }
        
        const transportadorId = transportadorRows[0].id;
        
        // 2.1 Resumo de veículos
        const [veiculosResumo] = await db.execute(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'ATIVO' THEN 1 ELSE 0 END) as ativos,
                SUM(CASE WHEN status = 'MANUTENCAO' THEN 1 ELSE 0 END) as manutencao,
                SUM(CASE WHEN status = 'INATIVO' THEN 1 ELSE 0 END) as inativos
            FROM veiculos
            WHERE transportador_id = ?
        `, [transportadorId]);
        
        // 2.2 Resumo de motoristas
        const [motoristasResumo] = await db.execute(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'ATIVO' THEN 1 ELSE 0 END) as ativos,
                SUM(CASE WHEN status = 'FERIAS' THEN 1 ELSE 0 END) as ferias,
                SUM(CASE WHEN status = 'LICENCA' THEN 1 ELSE 0 END) as licenca,
                SUM(CASE WHEN status = 'DESLIGADO' THEN 1 ELSE 0 END) as desligados
            FROM motoristas_vinculados
            WHERE transportador_id = ?
        `, [transportadorId]);
        
        // 2.3 Fretes em trânsito
        const [fretesTransito] = await db.execute(`
            SELECT COUNT(*) as total
            FROM fretes
            WHERE transportador_id = ? AND status = 'TRANSITO'
        `, [transportadorId]);
        
        // 2.4 Faturamento total
        const [faturamento] = await db.execute(`
            SELECT COALESCE(SUM(valor_fechado), 0) as total
            FROM fretes
            WHERE transportador_id = ? AND status = 'CONCLUIDO'
        `, [transportadorId]);
        
        // 2.5 Fretes e faturamento por mês
        const [fretesFaturamentoMes] = await db.execute(`
            SELECT 
                DATE_FORMAT(data_publicacao, '%Y-%m') as mes,
                DATE_FORMAT(data_publicacao, '%b') as mes_label,
                COUNT(*) as total_fretes,
                COALESCE(SUM(valor_fechado), 0) as faturamento
            FROM fretes
            WHERE transportador_id = ?
              AND status IN ('TRANSITO', 'CONCLUIDO')
              AND data_publicacao >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
            GROUP BY DATE_FORMAT(data_publicacao, '%Y-%m'), DATE_FORMAT(data_publicacao, '%b')
            ORDER BY mes ASC
        `, [transportadorId]);
        
        // 2.6 Alertas
        const [alertas] = await db.execute(`
            SELECT 
                'manutencao' as tipo,
                placa as identificador,
                CONCAT('Veículo ', placa, ' - Revisão pendente') as titulo,
                'A revisão deste veículo está vencida.' as descricao,
                ultima_manutencao as data
            FROM veiculos
            WHERE transportador_id = ?
              AND status = 'MANUTENCAO'
            UNION ALL
            SELECT 
                'seguro' as tipo,
                placa as identificador,
                CONCAT('Seguro do veículo ', placa, ' vence em ', 
                       DATEDIFF(seguro_validade, CURDATE()), ' dias') as titulo,
                CONCAT('O seguro deste veículo vence em ', 
                       DATEDIFF(seguro_validade, CURDATE()), ' dias.') as descricao,
                seguro_validade as data
            FROM veiculos
            WHERE transportador_id = ?
              AND seguro_validade IS NOT NULL
              AND DATEDIFF(seguro_validade, CURDATE()) BETWEEN 1 AND 5
            LIMIT 10
        `, [transportadorId, transportadorId]);
        
        // 2.7 Desempenho dos motoristas
        const [desempenhoMotoristas] = await db.execute(`
            SELECT 
                mv.id,
                p.nome_razao_social as nome,
                COUNT(f.id) as fretes_realizados,
                ROUND(COALESCE(AVG(a.nota_geral), 0), 1) as avaliacao,
                mv.status
            FROM motoristas_vinculados mv
            JOIN pessoas p ON mv.pessoa_id = p.id
            LEFT JOIN fretes f ON f.transportador_id = mv.transportador_id 
                AND f.status = 'CONCLUIDO'
                AND f.veiculo_id IN (SELECT id FROM veiculos WHERE motorista_vinculado_id = mv.id)
            LEFT JOIN avaliacoes a ON a.avaliado_id = p.id
            WHERE mv.transportador_id = ?
            GROUP BY mv.id, p.nome_razao_social, mv.status
            ORDER BY fretes_realizados DESC
            LIMIT 5
        `, [transportadorId]);
        
        // 2.8 Veículos mais utilizados
        const [veiculosMaisUtilizados] = await db.execute(`
            SELECT 
                v.id,
                v.placa,
                v.modelo,
                v.marca,
                COUNT(f.id) as fretes_realizados
            FROM veiculos v
            LEFT JOIN fretes f ON f.veiculo_id = v.id AND f.status = 'CONCLUIDO'
            WHERE v.transportador_id = ?
            GROUP BY v.id, v.placa, v.modelo, v.marca
            ORDER BY fretes_realizados DESC
            LIMIT 5
        `, [transportadorId]);
        
        return res.json({
            veiculos: veiculosResumo[0] || { total: 0, ativos: 0, manutencao: 0, inativos: 0 },
            motoristas: motoristasResumo[0] || { total: 0, ativos: 0, ferias: 0, licenca: 0, desligados: 0 },
            fretes_transito: fretesTransito[0]?.total || 0,
            faturamento_total: faturamento[0]?.total || 0,
            fretes_faturamento_mes: fretesFaturamentoMes,
            alertas: alertas,
            desempenho_motoristas: desempenhoMotoristas,
            veiculos_mais_utilizados: veiculosMaisUtilizados
        });
        
    } catch (error) {
        console.error('Erro ao buscar dashboard da frota:', error);
        return res.status(500).json({ error: error.message || 'Erro interno do servidor' });
    }
};

// ============================================
// 3. DASHBOARD DO AUTÔNOMO
// ============================================
const getAutonomoDashboard = async (req, res) => {
    try {
        const userId = req.userId;
        
        const [transportadorRows] = await db.execute(
            "SELECT id FROM transportadores WHERE pessoa_id = ? AND tipo_transportador = 'AUTONOMO'",
            [userId]
        );
        
        if (transportadorRows.length === 0) {
            return res.status(404).json({ error: 'Autônomo não encontrado' });
        }
        
        const transportadorId = transportadorRows[0].id;
        
        // 3.1 Resumo
        const [resumo] = await db.execute(`
            SELECT 
                COUNT(CASE WHEN f.status = 'CONCLUIDO' THEN 1 END) as fretes_concluidos,
                COUNT(CASE WHEN f.status = 'TRANSITO' THEN 1 END) as em_transito,
                COUNT(CASE WHEN c.status = 'PENDENTE' THEN 1 END) as candidaturas_pendentes,
                COALESCE(SUM(f.valor_fechado), 0) as receita_total,
                ROUND(
                    COUNT(CASE WHEN f.status = 'CONCLUIDO' THEN 1 END) * 100.0 / 
                    NULLIF(COUNT(f.id), 0), 
                    1
                ) as taxa_aceite,
                COUNT(f.id) as total_fretes
            FROM transportadores t
            LEFT JOIN fretes f ON f.transportador_id = t.id
            LEFT JOIN candidaturas c ON c.transportador_id = t.id AND c.status = 'PENDENTE'
            WHERE t.id = ?
        `, [transportadorId]);
        
        // 3.2 Veículo
        const [veiculo] = await db.execute(`
            SELECT 
                id,
                placa,
                modelo,
                marca,
                ano_fabricacao,
                status
            FROM veiculos
            WHERE transportador_id = ?
            LIMIT 1
        `, [transportadorId]);
        
        // 3.3 CNH
        const [cnh] = await db.execute(`
            SELECT 
                cnh,
                cnh_categoria,
                cnh_validade
            FROM transportadores
            WHERE id = ?
        `, [transportadorId]);
        
        // 3.4 Receita por mês
        const [receitaPorMes] = await db.execute(`
            SELECT 
                DATE_FORMAT(data_publicacao, '%Y-%m') as mes,
                DATE_FORMAT(data_publicacao, '%b') as mes_label,
                COALESCE(SUM(valor_fechado), 0) as receita
            FROM fretes
            WHERE transportador_id = ?
              AND status = 'CONCLUIDO'
              AND data_publicacao >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(data_publicacao, '%Y-%m'), DATE_FORMAT(data_publicacao, '%b')
            ORDER BY mes ASC
        `, [transportadorId]);
        
        // 3.5 Próximos fretes
        const [proximosFretes] = await db.execute(`
            SELECT 
                f.id,
                CONCAT('FR', LPAD(f.id, 5, '0')) as codigo,
                CONCAT(f.origem_cep, ' - ', f.origem_endereco) as origem,
                CONCAT(f.destino_cep, ' - ', f.destino_endereco) as destino,
                f.data_coleta_prevista as data,
                f.valor_fechado as valor,
                f.status
            FROM fretes f
            WHERE f.transportador_id = ?
              AND f.status IN ('ACEITO', 'TRANSITO')
            ORDER BY f.data_coleta_prevista ASC
            LIMIT 3
        `, [transportadorId]);
        
        // 3.6 Alertas
        const [alertas] = await db.execute(`
            SELECT 
                'cnh' as tipo,
                'CNH' as titulo,
                CONCAT('CNH vence em ', DATEDIFF(cnh_validade, CURDATE()), ' dias') as descricao,
                cnh_validade as data
            FROM transportadores
            WHERE id = ?
              AND cnh_validade IS NOT NULL
              AND DATEDIFF(cnh_validade, CURDATE()) BETWEEN 1 AND 30
        `, [transportadorId]);
        
        return res.json({
            resumo: resumo[0] || { fretes_concluidos: 0, em_transito: 0, candidaturas_pendentes: 0, receita_total: 0, taxa_aceite: 0, total_fretes: 0 },
            veiculo: veiculo[0] || null,
            cnh: cnh[0] || null,
            receita_por_mes: receitaPorMes,
            proximos_fretes: proximosFretes,
            alertas: alertas
        });
        
    } catch (error) {
        console.error('Erro ao buscar dashboard do autônomo:', error);
        return res.status(500).json({ error: error.message || 'Erro interno do servidor' });
    }
};

// ============================================
// 4. DASHBOARD DO VINCULADO
// ============================================
const getVinculadoDashboard = async (req, res) => {
    try {
        const userId = req.userId;
        
        const [motoristaRows] = await db.execute(
            'SELECT id, transportador_id FROM motoristas_vinculados WHERE pessoa_id = ?',
            [userId]
        );
        
        if (motoristaRows.length === 0) {
            return res.status(404).json({ error: 'Motorista vinculado não encontrado' });
        }
        
        const motoristaId = motoristaRows[0].id;
        
        // 4.1 Resumo
        const [resumo] = await db.execute(`
            SELECT 
                COUNT(CASE WHEN f.status = 'CONCLUIDO' THEN 1 END) as fretes_concluidos,
                COUNT(CASE WHEN f.status = 'TRANSITO' THEN 1 END) as em_transito,
                COALESCE(SUM(pm.valor_liquido), 0) as total_recebido,
                ROUND(COALESCE(AVG(a.nota_geral), 0), 1) as avaliacao_media,
                COUNT(f.id) as total_fretes
            FROM motoristas_vinculados mv
            LEFT JOIN veiculos v ON v.motorista_vinculado_id = mv.id
            LEFT JOIN fretes f ON f.veiculo_id = v.id
            LEFT JOIN pagamentos_motoristas pm ON pm.motorista_vinculado_id = mv.id AND pm.status = 'PAGO'
            LEFT JOIN avaliacoes a ON a.avaliado_id = mv.pessoa_id
            WHERE mv.id = ?
        `, [motoristaId]);
        
        // 4.2 Frota
        const [frota] = await db.execute(`
            SELECT 
                p.nome_razao_social as nome,
                t.id as transportador_id
            FROM transportadores t
            JOIN pessoas p ON t.pessoa_id = p.id
            WHERE t.id = ?
        `, [motoristaRows[0].transportador_id]);
        
        // 4.3 Próximos fretes
        const [proximosFretes] = await db.execute(`
            SELECT 
                f.id,
                CONCAT('FR', LPAD(f.id, 5, '0')) as codigo,
                CONCAT(f.origem_cep, ' - ', f.origem_endereco) as origem,
                CONCAT(f.destino_cep, ' - ', f.destino_endereco) as destino,
                f.data_coleta_prevista as data,
                f.tipo_carga,
                f.status
            FROM fretes f
            JOIN veiculos v ON f.veiculo_id = v.id
            WHERE v.motorista_vinculado_id = ?
              AND f.status IN ('ACEITO', 'TRANSITO')
            ORDER BY f.data_coleta_prevista ASC
            LIMIT 3
        `, [motoristaId]);
        
        // 4.4 Histórico de entregas
        const [historicoEntregas] = await db.execute(`
            SELECT 
                f.id,
                CONCAT('FLB-', LPAD(f.id, 4, '0')) as codigo,
                CONCAT(f.origem_cep, ' → ', f.destino_cep) as rota,
                f.data_entrega_realizada as data_entrega,
                f.status,
                f.valor_fechado as valor
            FROM fretes f
            JOIN veiculos v ON f.veiculo_id = v.id
            WHERE v.motorista_vinculado_id = ?
              AND f.status = 'CONCLUIDO'
            ORDER BY f.data_entrega_realizada DESC
            LIMIT 5
        `, [motoristaId]);
        
        // 4.5 Desempenho
        const [desempenho] = await db.execute(`
            SELECT 
                COUNT(CASE WHEN f.status = 'CONCLUIDO' THEN 1 END) as total_entregas,
                ROUND(COUNT(CASE WHEN f.status = 'CONCLUIDO' THEN 1 END) * 100.0 / 
                      NULLIF(COUNT(f.id), 0), 1) as taxa_entrega,
                ROUND(AVG(a.nota_geral), 1) as avaliacao_media
            FROM motoristas_vinculados mv
            LEFT JOIN veiculos v ON v.motorista_vinculado_id = mv.id
            LEFT JOIN fretes f ON f.veiculo_id = v.id
            LEFT JOIN avaliacoes a ON a.avaliado_id = mv.pessoa_id
            WHERE mv.id = ?
        `, [motoristaId]);
        
        // 4.6 Dias trabalhados
        const [diasTrabalhados] = await db.execute(`
            SELECT 
                COUNT(DISTINCT DATE(data_entrega_realizada)) as dias_trabalhados
            FROM fretes f
            JOIN veiculos v ON f.veiculo_id = v.id
            WHERE v.motorista_vinculado_id = ?
              AND f.status = 'CONCLUIDO'
              AND f.data_entrega_realizada >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        `, [motoristaId]);
        
        return res.json({
            resumo: resumo[0] || { fretes_concluidos: 0, em_transito: 0, total_recebido: 0, avaliacao_media: 0, total_fretes: 0 },
            frota: frota[0] || null,
            proximos_fretes: proximosFretes,
            historico_entregas: historicoEntregas,
            desempenho: {
                ...(desempenho[0] || { total_entregas: 0, taxa_entrega: 0, avaliacao_media: 0 }),
                dias_trabalhados: diasTrabalhados[0]?.dias_trabalhados || 0,
                dias_folga: Math.max(0, 30 - (diasTrabalhados[0]?.dias_trabalhados || 0))
            }
        });
        
    } catch (error) {
        console.error('Erro ao buscar dashboard do vinculado:', error);
        return res.status(500).json({ error: error.message || 'Erro interno do servidor' });
    }
};

// ============================================
// 5. DASHBOARD DO ADMIN
// ============================================
const getAdminDashboard = async (req, res) => {
    try {
        // 5.1 Resumo de usuários
        const [usuariosResumo] = await db.execute(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'PENDENTE' THEN 1 ELSE 0 END) as pendentes,
                SUM(CASE WHEN status = 'APROVADO' THEN 1 ELSE 0 END) as aprovados,
                SUM(CASE WHEN status = 'BLOQUEADO' THEN 1 ELSE 0 END) as bloqueados,
                SUM(CASE WHEN status = 'REPROVADO' THEN 1 ELSE 0 END) as reprovados
            FROM pessoas
        `);
        
        // 5.2 Resumo de fretes
        const [fretesResumo] = await db.execute(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'TRANSITO' THEN 1 ELSE 0 END) as em_transito,
                SUM(CASE WHEN status = 'CONCLUIDO' THEN 1 ELSE 0 END) as concluidos,
                SUM(CASE WHEN status = 'CANCELADO' THEN 1 ELSE 0 END) as cancelados,
                COALESCE(SUM(valor_fechado), 0) as faturamento_total
            FROM fretes
            WHERE status IN ('TRANSITO', 'CONCLUIDO', 'CANCELADO')
        `);
        
        // 5.3 Total de veículos
        const [veiculosTotal] = await db.execute(`
            SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN status = 'ATIVO' THEN 1 ELSE 0 END) as ativos
            FROM veiculos
        `);
        
        // 5.4 Taxa de ocupação
        const [ocupacao] = await db.execute(`
            SELECT 
                COUNT(DISTINCT f.veiculo_id) as veiculos_ocupados,
                (SELECT COUNT(*) FROM veiculos WHERE status = 'ATIVO') as veiculos_ativos
            FROM fretes f
            WHERE f.status IN ('TRANSITO', 'ACEITO')
        `);
        
        const taxaOcupacao = ocupacao[0]?.veiculos_ativos > 0 
            ? Math.round((ocupacao[0].veiculos_ocupados / ocupacao[0].veiculos_ativos) * 100)
            : 0;
        
        // 5.5 Dados por mês (usuários e fretes)
        const [usuariosPorMes] = await db.execute(`
            SELECT 
                DATE_FORMAT(data_cadastro, '%Y-%m') as mes,
                DATE_FORMAT(data_cadastro, '%b') as mes_label,
                COUNT(*) as total
            FROM pessoas
            WHERE data_cadastro >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(data_cadastro, '%Y-%m'), DATE_FORMAT(data_cadastro, '%b')
        `);
        
        const [fretesPorMes] = await db.execute(`
            SELECT 
                DATE_FORMAT(data_publicacao, '%Y-%m') as mes,
                DATE_FORMAT(data_publicacao, '%b') as mes_label,
                COUNT(*) as total
            FROM fretes
            WHERE data_publicacao >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
            GROUP BY DATE_FORMAT(data_publicacao, '%Y-%m'), DATE_FORMAT(data_publicacao, '%b')
        `);
        
        // Combinar dados por mês
        const meses = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const mesAtual = new Date().getMonth();
        const dadosPorMes = [];
        
        for (let i = 5; i >= 0; i--) {
            const mesIndex = (mesAtual - i + 12) % 12;
            const mesLabel = meses[mesIndex];
            const mesKey = `${new Date().getFullYear()}-${String(mesIndex + 1).padStart(2, '0')}`;
            
            const usuarios = usuariosPorMes.find(u => u.mes === mesKey);
            const fretes = fretesPorMes.find(f => f.mes === mesKey);
            
            dadosPorMes.push({
                mes: mesLabel,
                usuarios: usuarios ? usuarios.total : 0,
                fretes: fretes ? fretes.total : 0
            });
        }
        
        // 5.6 Atividades recentes
        const [atividadesRecentes] = await db.execute(`
            (SELECT 
                'usuario_cadastrado' as tipo,
                CONCAT('Novo usuário cadastrado: ', nome_razao_social) as descricao,
                data_cadastro as data
            FROM pessoas
            ORDER BY data_cadastro DESC
            LIMIT 2)
            UNION ALL
            (SELECT 
                'frete_atualizado' as tipo,
                CONCAT('Frete #', id, ' ', 
                       CASE 
                           WHEN status = 'CONCLUIDO' THEN 'concluído'
                           WHEN status = 'TRANSITO' THEN 'em trânsito'
                           WHEN status = 'CANCELADO' THEN 'cancelado'
                           ELSE 'atualizado'
                       END) as descricao,
                data_publicacao as data
            FROM fretes
            ORDER BY data_publicacao DESC
            LIMIT 2)
            UNION ALL
            (SELECT 
                'documento_enviado' as tipo,
                CONCAT('Documento ', tipo_documento, ' enviado para análise') as descricao,
                data_upload as data
            FROM documentos
            ORDER BY data_upload DESC
            LIMIT 1)
            ORDER BY data DESC
            LIMIT 5
        `);
        
        // 5.7 Alertas
        const [documentosPendentes] = await db.execute(`
            SELECT COUNT(*) as total
            FROM documentos
            WHERE status_verificacao = 'PENDENTE'
        `);
        
        const [blacklistTotal] = await db.execute(`
            SELECT COUNT(*) as total
            FROM blacklist
            WHERE ativo = TRUE
        `);
        
        // 5.8 Métricas
        const [metricas] = await db.execute(`
            SELECT 
                ROUND(COUNT(CASE WHEN status = 'CANCELADO' THEN 1 END) * 100.0 / 
                      NULLIF(COUNT(*), 0), 1) as taxa_cancelamento,
                ROUND(COUNT(CASE WHEN status = 'CONCLUIDO' THEN 1 END) * 100.0 / 
                      NULLIF(COUNT(*), 0), 1) as taxa_entrega,
                ROUND(AVG(DATEDIFF(data_entrega_realizada, data_coleta_prevista)), 1) as tempo_medio_entrega,
                ROUND(COUNT(*) / 30, 1) as fretes_por_dia,
                ROUND(COUNT(CASE WHEN data_entrega_realizada <= data_entrega_prevista THEN 1 END) * 100.0 / 
                      NULLIF(COUNT(CASE WHEN data_entrega_realizada IS NOT NULL THEN 1 END), 0), 1) as sla_cumprido
            FROM fretes
            WHERE data_publicacao >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        `);
        
        return res.json({
            usuarios: usuariosResumo[0] || { total: 0, pendentes: 0, aprovados: 0, bloqueados: 0, reprovados: 0 },
            fretes: fretesResumo[0] || { total: 0, em_transito: 0, concluidos: 0, cancelados: 0, faturamento_total: 0 },
            veiculos: veiculosTotal[0] || { total: 0, ativos: 0 },
            taxa_ocupacao: taxaOcupacao,
            dados_por_mes: dadosPorMes,
            atividades_recentes: atividadesRecentes,
            alertas: {
                documentos_pendentes: documentosPendentes[0]?.total || 0,
                blacklist: blacklistTotal[0]?.total || 0
            },
            metricas: metricas[0] || { 
                taxa_cancelamento: 0, 
                taxa_entrega: 0, 
                tempo_medio_entrega: 0, 
                fretes_por_dia: 0, 
                sla_cumprido: 0 
            }
        });
        
    } catch (error) {
        console.error('Erro ao buscar dashboard do admin:', error);
        return res.status(500).json({ error: error.message || 'Erro interno do servidor' });
    }
};

module.exports = {
    getEmbarcadorDashboard,
    getFrotaDashboard,
    getAutonomoDashboard,
    getVinculadoDashboard,
    getAdminDashboard
};