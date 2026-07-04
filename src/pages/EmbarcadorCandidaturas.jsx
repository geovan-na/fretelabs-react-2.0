// pages/EmbarcadorCandidaturas.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function EmbarcadorCandidaturas() {
    const navigate = useNavigate();
    const [candidaturas, setCandidaturas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [processando, setProcessando] = useState(null);
    const [filtro, setFiltro] = useState('TODOS');

    const token = localStorage.getItem('token');

    useEffect(() => {
        carregarCandidaturas();
    }, []);

    const carregarCandidaturas = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.candidaturas.listarEmbarcador(token);
            setCandidaturas(response.data || []);
        } catch (err) {
            console.error('Erro ao carregar candidaturas:', err);
            setError('Erro ao carregar candidaturas.');
        } finally {
            setLoading(false);
        }
    };

    const handleAceitar = async (candidaturaId) => {
        if (!window.confirm('Tem certeza que deseja aceitar esta candidatura?')) return;

        setProcessando(candidaturaId);
        try {
            await api.candidaturas.atualizar(candidaturaId, 'ACEITO', token);
            await carregarCandidaturas();
            alert('Candidatura aceita com sucesso!');
        } catch (err) {
            console.error('Erro ao aceitar candidatura:', err);
            alert('Erro ao aceitar candidatura. Tente novamente.');
        } finally {
            setProcessando(null);
        }
    };

    const handleRecusar = async (candidaturaId) => {
        if (!window.confirm('Tem certeza que deseja recusar esta candidatura?')) return;

        setProcessando(candidaturaId);
        try {
            await api.candidaturas.atualizar(candidaturaId, 'RECUSADO', token);
            await carregarCandidaturas();
        } catch (err) {
            console.error('Erro ao recusar candidatura:', err);
            alert('Erro ao recusar candidatura. Tente novamente.');
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

    const candidaturasFiltradas = filtro === 'TODOS' 
        ? candidaturas 
        : candidaturas.filter(c => c.status === filtro);

    const statusOptions = [
        { value: 'TODOS', label: 'Todos' },
        { value: 'PENDENTE', label: 'Pendentes' },
        { value: 'ACEITO', label: 'Aceitos' },
        { value: 'RECUSADO', label: 'Recusados' },
        { value: 'CANCELADO', label: 'Cancelados' }
    ];

    if (loading) {
        return (
            <div className="candidaturas-loading">
                <p>Carregando candidaturas...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="candidaturas-error">
                <p>{error}</p>
                <button onClick={carregarCandidaturas} className="btn btn-primary">
                    Tentar novamente
                </button>
            </div>
        );
    }

    return (
        <div className="candidaturas-embarcador-container">
            {/* HEADER PADRONIZADO */}
            <div className="page-header">
                <h1>Candidaturas Recebidas</h1>
                <p className="subtitle">
                    Gerencie todas as candidaturas dos transportadores para seus fretes
                </p>
            </div>

            {/* FILTROS */}
            <div className="candidaturas-filtros">
                {statusOptions.map((status) => (
                    <button
                        key={status.value}
                        className={`filtro-btn ${filtro === status.value ? 'active' : ''}`}
                        onClick={() => setFiltro(status.value)}
                    >
                        {status.label}
                    </button>
                ))}
            </div>

            {candidaturasFiltradas.length === 0 ? (
                <div className="candidaturas-vazio">
                    <p>Nenhuma candidatura encontrada.</p>
                    <p className="candidaturas-vazio-sub">
                        {filtro === 'TODOS' 
                            ? 'Ainda não há candidaturas para seus fretes.'
                            : `Nenhuma candidatura com status "${filtro}".`}
                    </p>
                </div>
            ) : (
                <div className="candidaturas-list">
                    {candidaturasFiltradas.map((candidatura) => (
                        <div key={candidatura.id} className="card-candidatura-embarcador">
                            <div className="card-candidatura-header">
                                <div className="card-candidatura-transportador">
                                    <span className="card-candidatura-nome">{candidatura.transportador_nome}</span>
                                    <span className={`status-badge ${getStatusBadge(candidatura.status)}`}>
                                        {getStatusTexto(candidatura.status)}
                                    </span>
                                </div>
                                <span className="card-candidatura-valor">
                                    {formatarMoeda(candidatura.valor_lance)}
                                </span>
                            </div>

                            <div className="card-candidatura-frete">
                                <span 
                                    className="card-candidatura-frete-link"
                                    onClick={() => navigate(`/dashboard/embarcador/fretes/${candidatura.frete_id}`)}
                                >
                                    Frete #{candidatura.frete_id}
                                </span>
                                <span className="card-candidatura-route">
                                    {candidatura.origem_cep || 'Origem'} → {candidatura.destino_cep || 'Destino'}
                                </span>
                            </div>

                            {candidatura.mensagem && (
                                <div className="card-candidatura-mensagem">
                                    <p>"{candidatura.mensagem}"</p>
                                </div>
                            )}

                            <div className="card-candidatura-info">
                                <div className="card-candidatura-info-item">
                                    <span className="card-candidatura-info-label">Tipo de Carga</span>
                                    <span className="card-candidatura-info-value">{candidatura.tipo_carga || '-'}</span>
                                </div>
                                <div className="card-candidatura-info-item">
                                    <span className="card-candidatura-info-label">Data</span>
                                    <span className="card-candidatura-info-value">{formatarData(candidatura.data_candidatura)}</span>
                                </div>
                            </div>

                            {candidatura.status === 'PENDENTE' && (
                                <div className="card-candidatura-actions">
                                    <button 
                                        className="btn btn-success"
                                        onClick={() => handleAceitar(candidatura.id)}
                                        disabled={processando === candidatura.id}
                                    >
                                        {processando === candidatura.id ? 'Processando...' : 'Aceitar'}
                                    </button>
                                    <button 
                                        className="btn btn-danger"
                                        onClick={() => handleRecusar(candidatura.id)}
                                        disabled={processando === candidatura.id}
                                    >
                                        {processando === candidatura.id ? 'Processando...' : 'Recusar'}
                                    </button>
                                </div>
                            )}

                            {candidatura.status === 'ACEITO' && (
                                <div className="card-candidatura-status-aceito">
                                    Candidatura aceita
                                </div>
                            )}

                            {candidatura.status === 'RECUSADO' && (
                                <div className="card-candidatura-status-recusado">
                                    Candidatura recusada
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}