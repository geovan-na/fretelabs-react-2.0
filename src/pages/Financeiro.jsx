// pages/Financeiro.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import DadosBancariosForm from '../components/DadosBancariosForm';
import Button from '../components/Button';

export default function Financeiro() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [resumo, setResumo] = useState(null);
    const [transacoes, setTransacoes] = useState([]);
    const [dadosBancariosLista, setDadosBancariosLista] = useState([]);
    const [showFormBancario, setShowFormBancario] = useState(false);
    const [contaEditando, setContaEditando] = useState(null);
    const [valorSaque, setValorSaque] = useState('');
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
            const resumoData = await api.financeiro.getResumo(token);
            console.log('Resumo do backend:', resumoData);
            setResumo(resumoData);

            const transacoesData = await api.financeiro.getTransacoes(token, filtroPeriodo);
            setTransacoes(transacoesData.data || []);

            const listaData = await api.dadosBancarios.listar(token);
            setDadosBancariosLista(listaData.data || []);
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
            if (contaEditando) {
                await api.dadosBancarios.atualizar(contaEditando.id, dados, token);
            } else {
                await api.dadosBancarios.criar(dados, token);
            }
            setShowFormBancario(false);
            setContaEditando(null);
            await carregarDados();
        } catch (err) {
            console.error('Erro ao salvar dados bancários:', err);
            alert('Erro ao salvar dados bancários. Tente novamente.');
        } finally {
            setSalvando(false);
        }
    };

    const handleDeletarConta = async (id) => {
        if (!window.confirm('Tem certeza que deseja deletar esta conta bancária?')) return;

        try {
            await api.dadosBancarios.deletar(id, token);
            await carregarDados();
        } catch (err) {
            console.error('Erro ao deletar conta:', err);
            alert('Erro ao deletar conta. Tente novamente.');
        }
    };

    const handleEditarConta = (conta) => {
        setContaEditando(conta);
        setShowFormBancario(true);
    };

    const handleSolicitarSaque = async () => {
        if (!valorSaque || parseFloat(valorSaque) <= 0) {
            alert('Informe um valor válido para saque.');
            return;
        }

        if (parseFloat(valorSaque) > (resumo?.total || 0)) {
            alert('Saldo insuficiente.');
            return;
        }

        const contaPrincipal = dadosBancariosLista.find(c => c.principal);
        if (!contaPrincipal) {
            alert('Cadastre uma conta bancária principal antes de solicitar um saque.');
            return;
        }

        setSalvando(true);
        try {
            await api.financeiro.solicitarSaque({
                valor: parseFloat(valorSaque),
                dados_bancarios_id: contaPrincipal.id
            }, token);
            setValorSaque('');
            await carregarDados();
            alert('Saque solicitado com sucesso!');
        } catch (err) {
            console.error('Erro ao solicitar saque:', err);
            alert(err.message || 'Erro ao solicitar saque. Tente novamente.');
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

    const contaPrincipal = dadosBancariosLista.find(c => c.principal);

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
                        {isEmbarcador ? 'Total Gasto' : 'Saldo Disponível'}
                    </span>
                    <span className="financeiro-card-valor">
                        {formatarMoeda(isEmbarcador ? resumo?.total : resumo?.total || 0)}
                    </span>
                </div>
                <div className="financeiro-card">
                    <span className="financeiro-card-label">
                        {isEmbarcador ? 'Fretes Pagos' : 'Total Recebido'}
                    </span>
                    <span className="financeiro-card-valor">
                        {resumo?.totalTransacoes || 0}
                    </span>
                </div>
                <div className="financeiro-card">
                    <span className="financeiro-card-label">Média</span>
                    <span className="financeiro-card-valor">
                        {formatarMoeda(resumo?.media || 0)}
                    </span>
                </div>
            </div>

            {/* SOLICITAR SAQUE (APENAS TRANSPORTADOR) */}
            {isTransportador && (
                <div className="financeiro-saque">
                    <div className="financeiro-saque-info">
                        <span className="financeiro-saque-label">Disponível para Saque</span>
                        <span className="financeiro-saque-valor">
                            {formatarMoeda(resumo?.total || 0)}
                        </span>
                        {contaPrincipal && (
                            <span className="financeiro-saque-conta">
                                Conta: {contaPrincipal.banco} - {contaPrincipal.conta}
                            </span>
                        )}
                    </div>
                    <div className="financeiro-saque-actions">
                        <input
                            type="number"
                            step="0.01"
                            value={valorSaque}
                            onChange={(e) => setValorSaque(e.target.value)}
                            placeholder="Valor do saque"
                            className="financeiro-saque-input"
                        />
                        <Button 
                            variant="primary" 
                            onClick={handleSolicitarSaque}
                            disabled={salvando || !valorSaque || parseFloat(valorSaque) <= 0 || !contaPrincipal}
                        >
                            {salvando ? 'Processando...' : 'Solicitar Saque'}
                        </Button>
                    </div>
                </div>
            )}

            {/* DADOS BANCÁRIOS - LISTA DE CONTAS */}
            <div className="financeiro-dados-bancarios">
                <div className="financeiro-section-header">
                    <h3>Dados Bancários</h3>
                    <button 
                        className="btn btn-primary"
                        onClick={() => {
                            setContaEditando(null);
                            setShowFormBancario(!showFormBancario);
                        }}
                    >
                        {showFormBancario ? 'Cancelar' : 'Adicionar Conta'}
                    </button>
                </div>

                {/* FORMULÁRIO */}
                {showFormBancario && (
                    <div className="dados-bancarios-form-wrapper">
                        <DadosBancariosForm
                            dadosIniciais={contaEditando}
                            onSubmit={handleSalvarDadosBancarios}
                            isLoading={salvando}
                            onCancel={() => {
                                setShowFormBancario(false);
                                setContaEditando(null);
                            }}
                        />
                    </div>
                )}

                {/* LISTA DE CONTAS */}
                {dadosBancariosLista.length === 0 ? (
                    <p className="dados-bancarios-vazio">
                        Nenhuma conta bancária cadastrada. Clique em "Adicionar Conta" para cadastrar.
                    </p>
                ) : (
                    <div className="dados-bancarios-lista">
                        {dadosBancariosLista.map((conta) => (
                            <div key={conta.id} className="dados-bancarios-item">
                                <div className="dados-bancarios-item-info">
                                    <div className="dados-bancarios-item-header">
                                        <span className="dados-bancarios-item-banco">
                                            {conta.banco}
                                        </span>
                                        {conta.principal && (
                                            <span className="dados-bancarios-item-principal">Principal</span>
                                        )}
                                    </div>
                                    <div className="dados-bancarios-item-detalhes">
                                        <span>Ag: {conta.agencia}</span>
                                        <span>Conta: {conta.conta}-{conta.digito || '0'}</span>
                                        <span>Titular: {conta.titular}</span>
                                        {conta.pix_chave && (
                                            <span>PIX: {conta.pix_chave}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="dados-bancarios-item-actions">
                                    <button 
                                        className="btn btn-outline btn-sm"
                                        onClick={() => handleEditarConta(conta)}
                                    >
                                        Editar
                                    </button>
                                    <button 
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDeletarConta(conta.id)}
                                    >
                                        Deletar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
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
                                    transacao.status === 'PENDENTE' ? 'status-pendente' :
                                    'status-processando'
                                }`}>
                                    {transacao.status === 'CONCLUIDO' ? 'Concluído' : 
                                     transacao.status === 'PENDENTE' ? 'Pendente' : 
                                     'Processando'}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}