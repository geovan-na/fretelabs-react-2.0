const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const usuarioRoutes = require('./routes/usuarioRoutes');
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

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
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

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'Servidor FreteLabs funcionando' });
});

app.use((req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});
app.use((err, req, res, next) => {
    console.error('ERRO DETALHADO:', err); // Tirar o .message faz mostrar o rastro completo
    res.status(500).json({ error: 'Erro interno do servidor' });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});