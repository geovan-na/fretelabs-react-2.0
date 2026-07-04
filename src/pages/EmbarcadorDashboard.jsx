// pages/EmbarcadorDashboard.jsx
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useDashboard } from '../hooks/useDashboard';
import Button from '../components/Button';

export default function EmbarcadorDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { loading, error, stats, fretesRecentes, candidaturasPendentes } = useDashboard();
    
    const nomeUsuario = user?.nome?.split(' ')[0] || 'Usuario';

    // Formatar moeda
    const formatarMoeda = (valor) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor || 0);
    };

    // Formatar data
    const formatarData = (data) => {
        if (!data) return '-';
        return new Date(data).toLocaleDateString('pt-BR');
    };

    // Status badge
    const getStatusBadge = (status) => {
        const statusMap = {
            'AGUARDANDO': 'status-aguardando',
            'NEGOCIACAO': 'status-aguardando',
            'ACEITO': 'status-transito',
            'TRANSITO': 'status-transito',
            'CONCLUIDO': 'status-concluido',
            'CANCELADO': 'status-cancelado'
        };
        return statusMap[status] || '';
    };

    const getStatusTexto = (status) => {
        const statusMap = {
            'AGUARDANDO': 'Aguardando',
            'NEGOCIACAO': 'Negociacao',
            'ACEITO': 'Aceito',
            'TRANSITO': 'Em Transito',
            'CONCLUIDO': 'Concluido',
            'CANCELADO': 'Cancelado'
        };
        return statusMap[status] || status;
    };

    if (loading) {
        return (
            <div className="dashboard-loading">
                <p>Carregando dados do dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-error">
                <p>Erro ao carregar dados: {error}</p>
                <Button variant="primary" onClick={() => window.location.reload()}>
                    Tentar novamente
                </Button>
            </div>
        );
    }

    return (
        <div className="embarcador-dashboard">
            {/* HEADER */}
            <header className="dashboard-header">
                <div className="dashboard-header-left">
                    <div className="dashboard-welcome">
                        <h1>Bom dia, {nomeUsuario}</h1>
                        <p>Gerencie seus fretes e acompanhe suas cargas</p>
                    </div>
                </div>
                
                <div className="dashboard-header-right">
                    <button className="header-notification">
                        <svg 
                            width="24" 
                            height="24" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                        >
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                        </svg>
                        <span className="notification-badge">3</span>
                    </button>
                </div>
            </header>

            {/* STATS CARDS */}
            <div className="dashboard-stats">
                <div className="stat-card">
                    <div className="stat-card-content">
                        <p className="stat-label">Total de Fretes</p>
                        <p className="stat-value">{stats.totalFretes}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-content">
                        <p className="stat-label">Em Andamento</p>
                        <p className="stat-value">{stats.emAndamento}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-content">
                        <p className="stat-label">Aguardando</p>
                        <p className="stat-value">{stats.aguardando}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-content">
                        <p className="stat-label">Concluidos</p>
                        <p className="stat-value">{stats.concluidos}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-content">
                        <p className="stat-label">Cancelados</p>
                        <p className="stat-value">{stats.cancelados}</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-content">
                        <p className="stat-label">Faturamento</p>
                        <p className="stat-value">{formatarMoeda(stats.faturamento)}</p>
                    </div>
                </div>
            </div>

            {/* ROW: GRAFICO + CANDIDATURAS */}
            <div className="dashboard-row">
                <div className="chart-container">
                    <h4>Fretes por Mes</h4>
                    <div className="chart-placeholder">
                        Grafico de fretes (em desenvolvimento)
                    </div>
                </div>
                <div className="candidaturas-container">
                    <h4>Candidaturas Pendentes</h4>
                    <p className="candidaturas-number">{candidaturasPendentes}</p>
                </div>
            </div>

            {/* TABELA DE ATIVIDADES RECENTES */}
            <div className="table-container">
                <h4>Atividades Recentes</h4>
                {fretesRecentes.length === 0 ? (
                    <p className="sem-dados">Nenhum frete cadastrado ainda.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>ID do Frete</th>
                                <th>Origem</th>
                                <th>Destino</th>
                                <th>Data</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {fretesRecentes.map((frete) => (
                                <tr key={frete.id}>
                                    <td>#{frete.id}</td>
                                    <td>{frete.origem_cep || 'Nao informado'}</td>
                                    <td>{frete.destino_cep || 'Nao informado'}</td>
                                    <td>{formatarData(frete.data_publicacao)}</td>
                                    <td>
                                        <span className={`status-badge ${getStatusBadge(frete.status)}`}>
                                            {getStatusTexto(frete.status)}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}