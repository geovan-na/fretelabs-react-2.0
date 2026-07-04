// pages/Financeiro.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import DadosBancariosForm from '../components/DadosBancariosForm';

export default function Financeiro() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [resumo, setResumo] = useState(null);
    const [transacoes, setTransacoes] = useState([]);
    const [dadosBancarios, setDadosBancarios] = useState(null);
    const [showFormBancario, setShowFormBancario] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [filtroPeriodo, setFiltroPeriodo] = useState('MES');

    const token = localStorage.getItem('token');
    const isEmbarcador = user?.tipo === 'EMBARCADOR';
    const isTransportador = ['FROTA', 'AUTONOMO', 'VINCULADO'].includes(user?.tipo);

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        setLoading(true);
        setError(null);

        try {
            // Buscar resumo financeiro
            const resumoData = await api.financeiro.getResumo(token);
            setResumo(resumoData);

            // Buscar transações
            const transacoesData = await api.financeiro.getTransacoes(token, filtroPeriodo);
            setTransacoes(transacoesData.data || []);

            // Buscar dados bancários principais
            const bancariosData = await api.dadosBancarios.buscarPrincipal(token);
            setDadosBancarios(bancariosData.data || null);
        } catch (err) {
            console.error('Erro ao carregar dados financeiros:', err);
            setError('Erro ao carregar dados financeiros.');
        } finally {
            setLoading(false);
        }
    };

    const handleSalvarDadosBancarios = async (dados) => {
        setSalvando(true);
        try {
            if (dadosBancarios) {
                await api.dadosBancarios.atualizar(dadosBancarios.id, dados, token);
            } else {
                await api.dadosBancarios.criar(dados, token);
            }
            await carregarDados();
            setShowFormBancario(false);
        } catch (err) {
            console.error('Erro ao salvar dados bancários:', err);
            alert('Erro ao salvar dados bancários. Tente novamente.');
        } finally {
            setSalvando(false);
        }
    };

    const handleFiltroPeriodo = (periodo) => {
        setFiltroPeriodo(periodo);
        carregarDados();
    };

    const formatarMoeda = (valor) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor || 0);
    };

    const formatarData = (data) => {
        if (!data) return '-';
        return new Date(data).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="financeiro-loading">
                <p>Carregando dados financeiros...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="financeiro-error">
                <p>{error}</p>
                <button onClick={carregarDados} className="btn btn-primary">
                    Tentar novamente
                </button>
            </div>
        );
    }

    return (
        <div className="financeiro-container">
            <div className="page-header">
                <h1>Financeiro</h1>
                <p className="subtitle">
                    {isEmbarcador 
                        ? 'Acompanhe seus gastos e pagamentos realizados'
                        : 'Acompanhe seus ganhos e recebimentos'
                    }
                </p>
            </div>

            {/* RESUMO */}
            <div className="financeiro-resumo">
                <div className="financeiro-card">
                    <span className="financeiro-card-label">
                        {isEmbarcador ? 'Total Gasto' : 'Total Recebido'}
                    </span>
                    <span className="financeiro-card-valor">
                        {formatarMoeda(resumo?.total || 0)}
                    </span>
                </div>
                <div className="financeiro-card">
                    <span className="financeiro-card-label">Transações</span>
                    <span className="financeiro-card-valor">{resumo?.totalTransacoes || 0}</span>
                </div>
                <div className="financeiro-card">
                    <span className="financeiro-card-label">Média</span>
                    <span className="financeiro-card-valor">
                        {formatarMoeda(resumo?.media || 0)}
                    </span>
                </div>
            </div>

            {/* SALDO (APENAS TRANSPORTADORES) */}
            {isTransportador && resumo && (
                <div className="financeiro-saldo">
                    <div className="financeiro-saldo-item">
                        <span className="financeiro-saldo-label">Disponível para Saque</span>
                        <span className="financeiro-saldo-valor">
                            {formatarMoeda(resumo?.total || 0)}
                        </span>
                    </div>
                    <div className="financeiro-saldo-item">
                        <span className="financeiro-saldo-label">A Receber</span>
                        <span className="financeiro-saldo-valor financeiro-saldo-a-receber">
                            {formatarMoeda(resumo?.aReceber || 0)}
                        </span>
                    </div>
                </div>
            )}

            {/* DADOS BANCÁRIOS */}
            <div className="financeiro-dados-bancarios">
                <div className="financeiro-section-header">
                    <h3>Dados Bancários</h3>
                    <button 
                        className="btn btn-outline"
                        onClick={() => setShowFormBancario(!showFormBancario)}
                    >
                        {showFormBancario ? 'Cancelar' : dadosBancarios ? 'Editar' : 'Cadastrar'}
                    </button>
                </div>

                {showFormBancario ? (
                    <DadosBancariosForm
                        dadosIniciais={dadosBancarios}
                        onSubmit={handleSalvarDadosBancarios}
                        isLoading={salvando}
                        onCancel={() => setShowFormBancario(false)}
                    />
                ) : dadosBancarios ? (
                    <div className="dados-bancarios-info">
                        <div className="dados-bancarios-field">
                            <span className="dados-bancarios-label">Banco</span>
                            <span className="dados-bancarios-value">{dadosBancarios.banco}</span>
                        </div>
                        <div className="dados-bancarios-field">
                            <span className="dados-bancarios-label">Agência</span>
                            <span className="dados-bancarios-value">{dadosBancarios.agencia}</span>
                        </div>
                        <div className="dados-bancarios-field">
                            <span className="dados-bancarios-label">Conta</span>
                            <span className="dados-bancarios-value">
                                {dadosBancarios.conta}-{dadosBancarios.digito || '0'}
                            </span>
                        </div>
                        <div className="dados-bancarios-field">
                            <span className="dados-bancarios-label">Tipo</span>
                            <span className="dados-bancarios-value">{dadosBancarios.tipo_conta}</span>
                        </div>
                        <div className="dados-bancarios-field">
                            <span className="dados-bancarios-label">Titular</span>
                            <span className="dados-bancarios-value">{dadosBancarios.titular}</span>
                        </div>
                        {dadosBancarios.pix_chave && (
                            <div className="dados-bancarios-field">
                                <span className="dados-bancarios-label">PIX</span>
                                <span className="dados-bancarios-value">
                                    {dadosBancarios.pix_chave} ({dadosBancarios.pix_tipo})
                                </span>
                            </div>
                        )}
                        {dadosBancarios.principal && (
                            <div className="dados-bancarios-field">
                                <span className="dados-bancarios-label">Status</span>
                                <span className="dados-bancarios-value dados-bancarios-principal">Conta Principal</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="dados-bancarios-vazio">
                        Nenhum dado bancário cadastrado. Clique em "Cadastrar" para adicionar.
                    </p>
                )}
            </div>

            {/* TRANSAÇÕES */}
            <div className="financeiro-transacoes">
                <div className="financeiro-section-header">
                    <h3>Extrato de Transações</h3>
                    <div className="financeiro-filtros">
                        <button 
                            className={`filtro-btn ${filtroPeriodo === 'MES' ? 'active' : ''}`}
                            onClick={() => handleFiltroPeriodo('MES')}
                        >
                            Último Mês
                        </button>
                        <button 
                            className={`filtro-btn ${filtroPeriodo === 'TRIMESTRE' ? 'active' : ''}`}
                            onClick={() => handleFiltroPeriodo('TRIMESTRE')}
                        >
                            Últimos 3 Meses
                        </button>
                        <button 
                            className={`filtro-btn ${filtroPeriodo === 'ANO' ? 'active' : ''}`}
                            onClick={() => handleFiltroPeriodo('ANO')}
                        >
                            Último Ano
                        </button>
                    </div>
                </div>

                {transacoes.length === 0 ? (
                    <p className="financeiro-vazio">Nenhuma transação encontrada.</p>
                ) : (
                    <div className="financeiro-lista">
                        <div className="financeiro-lista-header">
                            <span>Descrição</span>
                            <span>Data</span>
                            <span>Valor</span>
                            <span>Status</span>
                        </div>
                        {transacoes.map((transacao) => (
                            <div key={transacao.id} className="financeiro-item">
                                <span className="financeiro-item-descricao">
                                    {transacao.descricao}
                                </span>
                                <span className="financeiro-item-data">
                                    {formatarData(transacao.data)}
                                </span>
                                <span className={`financeiro-item-valor ${
                                    transacao.tipo === 'ENTRADA' ? 'financeiro-credito' : 'financeiro-debito'
                                }`}>
                                    {transacao.tipo === 'ENTRADA' ? '+' : '-'}
                                    {formatarMoeda(transacao.valor)}
                                </span>
                                <span className={`status-badge ${
                                    transacao.status === 'CONCLUIDO' ? 'status-concluido' : 
                                    transacao.status === 'ACEITO' ? 'status-aceito' :
                                    'status-pendente'
                                }`}>
                                    {transacao.status === 'CONCLUIDO' ? 'Concluído' : 
                                     transacao.status === 'ACEITO' ? 'Aceito' : 
                                     transacao.status === 'TRANSITO' ? 'Em Trânsito' :
                                     'Pendente'}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}