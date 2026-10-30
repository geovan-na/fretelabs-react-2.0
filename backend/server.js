const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
const perfilRoutes = require('./routes/perfilRoutes');
const freteRoutes = require('./routes/freteRoutes');
const veiculoRoutes = require('./routes/veiculoRoutes');
const enderecoRoutes = require('./routes/enderecoRoutes');
const documentoRoutes = require('./routes/documentoRoutes');
const candidaturaRoutes = require('./routes/candidaturaRoutes');
const notificacaoRoutes = require('./routes/notificacaoRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const embarcadorRoutes = require('./routes/embarcadorRoutes');
const transportadorRoutes = require('./routes/transportadorRoutes');
const motoristaVinculadoRoutes = require('./routes/motoristaVinculadoRoutes');
const ocorrenciaRoutes = require('./routes/ocorrenciaRoutes');
const avaliacaoRoutes = require('./routes/avaliacaoRoutes');
const financeiroRoutes = require('./routes/financeiroRoutes');
const dadosBancariosRoutes = require('./routes/dadosBancariosRoutes');
const propostaRoutes = require('./routes/propostaRoutes');
const contratoRoutes = require('./routes/contratoRoutes');
const motoristaRoutes = require('./routes/motoristaRoutes');
const pagamentoRoutes = require('./routes/pagamentoRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/perfil', perfilRoutes);
app.use('/api/fretes', freteRoutes);
app.use('/api/veiculos', veiculoRoutes);
app.use('/api/enderecos', enderecoRoutes);
app.use('/api/documentos', documentoRoutes);
app.use('/api/candidaturas', candidaturaRoutes);
app.use('/api/notificacoes', notificacaoRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/embarcador', embarcadorRoutes);
app.use('/api/transportador', transportadorRoutes);
app.use('/api/motorista-vinculado', motoristaVinculadoRoutes);
app.use('/api/ocorrencias', ocorrenciaRoutes);
app.use('/api/avaliacoes', avaliacaoRoutes);
app.use('/api/financeiro', financeiroRoutes);
app.use('/api/dados-bancarios', dadosBancariosRoutes);
app.use('/api/propostas', propostaRoutes);
app.use('/api/contratos', contratoRoutes);
app.use('/api/motoristas', motoristaRoutes);
app.use('/api/pagamentos', pagamentoRoutes);

app.post('/api/setup-vinculado-workflow', async (req, res) => {
    try {
        const db = require('./config/database');
        
        // 1. Vincular o veículo Scania R450 (id 6) ao Pedro Santos (motorista_vinculado_id = 1)
        await db.query("UPDATE veiculos SET motorista_vinculado_id = 1, status = 'ATIVO' WHERE id = 6");

        // 2. Garantir que a frota tenha um segundo caminhão ativo
        const [veics] = await db.query('SELECT id, placa FROM veiculos WHERE transportador_id = 1');
        if (veics.length < 2) {
            await db.query(`
                INSERT INTO veiculos (transportador_id, placa, renavam, modelo, marca, ano_fabricacao, ano_modelo, capacidade_kg, capacidade_m3, tipo_carroceria, tipo_veiculo, eixos, possui_rastreador, possui_seguro, status)
                VALUES (1, 'FDX8A42', '98765432100', 'Atego 2430', 'Mercedes-Benz', 2023, 2024, 14000.00, 65.00, 'Sider', 'TRUCK', 3, 1, 1, 'ATIVO')
            `);
        }

        // 3. Embarcador aceita as candidaturas da Frota 1
        // 3.1 Frete 12 (Peças Automotivas, RJ -> SP, R$ 25.000,00)
        await db.query("UPDATE candidaturas SET status = 'ACEITO', data_resposta = NOW() WHERE id = 11");
        await db.query(`
            UPDATE fretes 
            SET status = 'ACEITO', transportador_id = 1, valor_fechado = 25000.00, 
                veiculo_id = 6, motorista_vinculado_id = 1,
                data_coleta_prevista = '2026-11-03 08:00:00', data_entrega_prevista = '2026-11-05 18:00:00'
            WHERE id = 12
        `);

        // 3.2 Frete 2 (Eletrônicos, Brasília DF -> Rio de Janeiro RJ, R$ 90.000,00)
        await db.query("UPDATE candidaturas SET status = 'ACEITO', data_resposta = NOW() WHERE id = 12");
        await db.query(`
            UPDATE fretes 
            SET status = 'ACEITO', transportador_id = 1, valor_fechado = 90000.00, 
                veiculo_id = 6, motorista_vinculado_id = 1,
                data_coleta_prevista = '2026-11-08 07:00:00', data_entrega_prevista = '2026-11-12 19:00:00'
            WHERE id = 2
        `);

        // 4. Frete 1 colocado EM TRANSPORTE (TRANSITO) pelo motorista vinculado
        await db.query("UPDATE candidaturas SET status = 'ACEITO', data_resposta = NOW() WHERE id = 1");
        await db.query(`
            UPDATE fretes 
            SET status = 'TRANSITO', transportador_id = 1, valor_fechado = 9200.00,
                veiculo_id = 6, motorista_vinculado_id = 1,
                codigo_rastreamento = 'FLB-TR-2026-001',
                data_coleta_prevista = '2026-10-29 08:00:00', data_coleta_realizada = '2026-10-29 09:15:00',
                data_entrega_prevista = '2026-11-01 17:00:00'
            WHERE id = 1
        `);
        // Histórico de status
        await db.query("DELETE FROM historico_status_frete WHERE frete_id = 1");
        await db.query(`
            INSERT INTO historico_status_frete (frete_id, status_anterior, status_novo, usuario_id, observacao, data_mudanca)
            VALUES 
            (1, 'AGUARDANDO', 'ACEITO', 2, 'Candidatura da Frota aceita pelo embarcador.', '2026-10-28 14:00:00'),
            (1, 'ACEITO', 'TRANSITO', 5, 'Carga coletada no CD Goiânia. Em rota rodoviária sentido Curitiba com rastreamento ativo.', NOW())
        `);

        // 5. Frete 10: Concluído e histórico
        await db.query(`
            UPDATE fretes 
            SET status = 'CONCLUIDO', transportador_id = 1, veiculo_id = 6, motorista_vinculado_id = 1,
                valor_fechado = 3500.00,
                origem_cep = '01001-000', origem_endereco = 'São Paulo - SP, Centro',
                destino_cep = '20040-002', destino_endereco = 'Rio de Janeiro - RJ, Centro',
                data_coleta_prevista = '2026-10-18 08:00:00', data_coleta_realizada = '2026-10-18 09:00:00',
                data_entrega_prevista = '2026-10-20 18:00:00', data_entrega_realizada = '2026-10-20 16:30:00'
            WHERE id = 10
        `);
        await db.query("DELETE FROM historico_status_frete WHERE frete_id = 10");
        await db.query(`
            INSERT INTO historico_status_frete (frete_id, status_anterior, status_novo, usuario_id, observacao, data_mudanca)
            VALUES 
            (10, 'TRANSITO', 'CONCLUIDO', 5, 'Entrega finalizada no destino. Canhoto assinado e aprovado.', '2026-10-20 16:30:00')
        `);

        // 6. Pagamento do motorista vinculado
        const [pags] = await db.query('SELECT id FROM pagamentos_motoristas WHERE motorista_vinculado_id = 1');
        if (pags.length === 0) {
            await db.query(`
                INSERT INTO pagamentos_motoristas (motorista_vinculado_id, frete_id, tipo, valor_bruto, valor_descontos, valor_liquido, mes_referencia, status, data_vencimento, data_pagamento, data_competencia, criado_em, atualizado_em)
                VALUES (1, 10, 'COMISSAO', 3500.00, 0, 3500.00, '2026-10', 'PAGO', '2026-10-25', '2026-10-22 10:00:00', '2026-10-01', NOW(), NOW())
            `);
        }

        // 7. Avaliação 5 estrelas para Pedro Santos
        const [avals] = await db.query('SELECT id FROM avaliacoes WHERE avaliado_id = 5');
        if (avals.length === 0) {
            await db.query(`
                INSERT INTO avaliacoes (frete_id, avaliador_id, avaliado_id, tipo_avaliacao, nota_geral, nota_pontualidade, nota_comunicacao, nota_cuidado_carga, comentario, data_avaliacao)
                VALUES (10, 2, 5, 'EMPRESA_TRANSPORTADOR', 5, 5, 5, 5, 'Excelente motorista! Pontual, comunicação transparente e carga entregue em perfeito estado.', NOW())
            `);
        }

        return res.json({ success: true, message: 'Workflow do vinculado3 e frota configurado com sucesso!' });
    } catch (err) {
        console.error('Erro no setup-vinculado-workflow:', err);
        return res.status(500).json({ success: false, error: err.message });
    }
});


app.get('/', (req, res) => {
    res.json({ status: 'OK', message: 'API FreteLabs Backend no ar' });
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Servidor FreteLabs funcionando' });
});

app.get('/api/version', (req, res) => {
    res.json({ version: '2.0.3-build-ad54085', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});
app.use((err, req, res, next) => {
    console.error('ERRO DETALHADO:', err);
    res.status(500).json({ error: err.message || 'Erro interno do servidor' });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});