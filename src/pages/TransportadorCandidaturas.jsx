// pages/TransportadorCandidaturas.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';

export default function TransportadorCandidaturas() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [candidaturas, setCandidaturas] = useState([]);
    const [motoristas, setMotoristas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processando, setProcessando] = useState(null);
    const [showDesignar, setShowDesignar] = useState(null);

    const token = localStorage.getItem('token');
    const isFrota = user?.tipo === 'FROTA';

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        setLoading(true);
        setError(null);

        try {
            // Buscar candidaturas do transportador
            const response = await api.candidaturas.listarMinhas(token);
            setCandidaturas(response.data || []);

            // Se for frota, buscar motoristas disponíveis
            if (isFrota) {
                const motoristasResponse = await api.candidaturas.listarMotoristasDisponiveis(token);
                setMotoristas(motoristasResponse || []);
            }
        } catch (err) {
            console.error('Erro ao carregar candidaturas:', err);
            setError('Erro ao carregar candidaturas.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelar = async (candidaturaId) => {
        if (!window.confirm('Tem certeza que deseja cancelar esta candidatura?')) return;

        setProcessando(candidaturaId);
        try {
            await api.candidaturas.atualizar(candidaturaId, 'CANCELADO', token);
            await carregarDados();
        } catch (err) {
            console.error('Erro ao cancelar candidatura:', err);
            alert('Erro ao cancelar candidatura. Tente novamente.');
        } finally {
            setProcessando(null);
        }
    };

    const handleDesignarMotorista = async (candidaturaId, motoristaId) => {
        setProcessando(candidaturaId);
        try {
            await api.candidaturas.designarMotorista(candidaturaId, motoristaId, token);
            setShowDesignar(null);
            await carregarDados();
            alert('Motorista designado com sucesso!');
        } catch (err) {
            console.error('Erro ao designar motorista:', err);
            alert('Erro ao designar motorista. Tente novamente.');
        } finally {
            setProcessando(null);
        }
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

    const getStatusBadge = (status) => {
        const statusMap = {
            'PENDENTE': 'status-pendente',
            'ACEITO': 'status-aceito',
            'RECUSADO': 'status-recusado',
            'CANCELADO': 'status-cancelado'
        };
        return statusMap[status] || '';
    };

    const getStatusTexto = (status) => {
        const statusMap = {
            'PENDENTE': 'Pendente',
            'ACEITO': 'Aceito',
            'RECUSADO': 'Recusado',
            'CANCELADO': 'Cancelado'
        };
        return statusMap[status] || status;
    };

    if (loading) {
        return (
            <div className="candidaturas-loading">
                <p>Carregando suas candidaturas...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="candidaturas-error">
                <p>{error}</p>
                <button onClick={carregarDados} className="btn btn-primary">
                    Tentar novamente
                </button>
            </div>
        );
    }

    return (
        <div className="candidaturas-transportador-container">
            <div className="candidaturas-header">
                <h1>Minhas Candidaturas</h1>
                <p>Acompanhe o status das suas candidaturas aos fretes</p>
            </div>

            {candidaturas.length === 0 ? (
                <div className="candidaturas-vazio">
                    <p>Você ainda não se candidatou a nenhum frete.</p>
                    <p className="candidaturas-vazio-sub">
                        Explore os fretes disponíveis e faça sua primeira candidatura!
                    </p>
                    <button 
                        className="btn btn-primary"
                        onClick={() => navigate('/dashboard/fretes-disponiveis')}
                    >
                        Ver fretes disponíveis
                    </button>
                </div>
            ) : (
                <div className="candidaturas-list">
                    {candidaturas.map((candidatura) => (
                        <div key={candidatura.id} className="card-candidatura-transportador">
                            <div className="card-candidatura-header">
                                <div>
                                    <span className="card-candidatura-frete-id">
                                        Frete #{candidatura.frete_id}
                                    </span>
                                    <span className={`status-badge ${getStatusBadge(candidatura.status)}`}>
                                        {getStatusTexto(candidatura.status)}
                                    </span>
                                </div>
                                <span className="card-candidatura-valor">
                                    {formatarMoeda(candidatura.valor_lance)}
                                </span>
                            </div>

                            <div className="card-candidatura-route">
                                <span>📍 {candidatura.origem_cep || 'Origem'}</span>
                                <span className="route-arrow">→</span>
                                <span>📍 {candidatura.destino_cep || 'Destino'}</span>
                            </div>

                            <div className="card-candidatura-info">
                                <div className="card-candidatura-info-item">
                                    <span className="card-candidatura-info-label">Tipo de Carga</span>
                                    <span className="card-candidatura-info-value">{candidatura.tipo_carga || '-'}</span>
                                </div>
                                <div className="card-candidatura-info-item">
                                    <span className="card-candidatura-info-label">Valor Ofertado</span>
                                    <span className="card-candidatura-info-value">{formatarMoeda(candidatura.valor_ofertado)}</span>
                                </div>
                                <div className="card-candidatura-info-item">
                                    <span className="card-candidatura-info-label">Data</span>
                                    <span className="card-candidatura-info-value">{formatarData(candidatura.data_candidatura)}</span>
                                </div>
                            </div>

                            {/* MOTORISTA DESIGNADO (FROTA) */}
                            {isFrota && candidatura.status === 'ACEITO' && (
                                <div className="card-candidatura-motorista">
                                    <span className="card-candidatura-motorista-label">Motorista Designado:</span>
                                    <span className="card-candidatura-motorista-nome">
                                        {candidatura.motorista_designado_nome || 'Nenhum motorista designado'}
                                    </span>

                                    {!candidatura.motorista_designado_nome && motoristas.length > 0 && (
                                        <button 
                                            className="btn btn-primary btn-sm"
                                            onClick={() => setShowDesignar(showDesignar === candidatura.id ? null : candidatura.id)}
                                            disabled={processando === candidatura.id}
                                        >
                                            {showDesignar === candidatura.id ? 'Fechar' : 'Designar Motorista'}
                                        </button>
                                    )}

                                    {showDesignar === candidatura.id && (
                                        <div className="card-candidatura-designar">
                                            <h4>Selecione um motorista:</h4>
                                            <select 
                                                className="form-select"
                                                onChange={(e) => {
                                                    if (e.target.value) {
                                                        handleDesignarMotorista(candidatura.id, parseInt(e.target.value));
                                                    }
                                                }}
                                                disabled={processando === candidatura.id}
                                            >
                                                <option value="">Selecione...</option>
                                                {motoristas.map((motorista) => (
                                                    <option key={motorista.id} value={motorista.id}>
                                                        {motorista.nome} - CNH: {motorista.cnh} {motorista.placa && `- Placa: ${motorista.placa}`}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* BOTÃO CANCELAR (APENAS PENDENTE) */}
                            {candidatura.status === 'PENDENTE' && (
                                <div className="card-candidatura-actions">
                                    <button 
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleCancelar(candidatura.id)}
                                        disabled={processando === candidatura.id}
                                    >
                                        {processando === candidatura.id ? 'Cancelando...' : 'Cancelar Candidatura'}
                                    </button>
                                </div>
                            )}

                            {/* MENSAGEM DE STATUS */}
                            {candidatura.status === 'ACEITO' && (
                                <div className="card-candidatura-status-aceito">
                                    Candidatura aceita! Aguarde o contato do embarcador.
                                </div>
                            )}

                            {candidatura.status === 'RECUSADO' && (
                                <div className="card-candidatura-status-recusado">
                                    Candidatura recusada pelo embarcador.
                                </div>
                            )}

                            {candidatura.status === 'CANCELADO' && (
                                <div className="card-candidatura-status-cancelado">
                                    Candidatura cancelada por você.
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}