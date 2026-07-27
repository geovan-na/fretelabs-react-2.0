// src/pages/dashboards/EmbarcadorDashboard.jsx
import React from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { StatsCard } from '../components/StatsCard';
import { BarChart } from '../components/BarChart';
import { TableCard } from '../components/TableCard';
import { ActivityList } from '../components/ActivityList';
import {
    BoxIcon, ClockIcon, HandshakeIcon, TruckIcon,
    CheckIcon, MoneyIcon, StarIcon
} from '../components/Icons';

const EmbarcadorDashboard = () => {
    const { data, loading, error } = useDashboard('embarcador');

    if (loading) {
        return (
            <div className="dashboard-loading">
                <p>Carregando dashboard...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-loading" style={{ color: '#EF4444' }}>
                <p>Erro: {error}</p>
            </div>
        );
    }

    const { resumo, fretes_por_mes, candidaturas_pendentes, atividades_recentes, motoristas_favoritos } = data || {};

    const activityColumns = [
        { key: 'codigo', label: 'ID do Frete' },
        { key: 'origem', label: 'Origem' },
        { key: 'destino', label: 'Destino' },
        { 
            key: 'data', 
            label: 'Data',
            render: (row) => new Date(row.data).toLocaleDateString('pt-BR')
        },
        { 
            key: 'status', 
            label: 'Status',
            render: (row) => (
                <span className={`status-badge status-${row.status.toLowerCase()}`}>
                    {row.status}
                </span>
            )
        }
    ];

    const motoristaColumns = [
        { key: 'nome', label: 'Motorista' },
        { key: 'total_viagens', label: 'Viagens' },
        { 
            key: 'avaliacao_media', 
            label: 'Avaliação',
            render: (row) => `${row.avaliacao_media || 0} ★`
        }
    ];

    return (
        <div className="dashboard-content">
            <div className="dashboard-header">
                <div className="dashboard-header-left">
                    <div className="dashboard-welcome">
                        <h1>Dashboard do Embarcador</h1>
                        <p>Gerencie seus fretes e acompanhe o desempenho</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-stats">
                <StatsCard icon={<BoxIcon />} label="Total de Fretes" value={resumo?.total || 0} />
                <StatsCard icon={<ClockIcon />} label="Aguardando" value={resumo?.aguardando || 0} color="#F59E0B" />
                <StatsCard icon={<HandshakeIcon />} label="Em Negociação" value={resumo?.negociacao || 0} color="#3B82F6" />
                <StatsCard icon={<TruckIcon />} label="Em Trânsito" value={resumo?.transito || 0} color="#8B5CF6" />
                <StatsCard icon={<CheckIcon />} label="Concluídos" value={resumo?.concluido || 0} color="#22C55E" />
                <StatsCard 
                    icon={<MoneyIcon />} 
                    label="Gasto Total" 
                    value={`R$ ${(resumo?.gasto_total || 0).toLocaleString('pt-BR')}`} 
                    color="#EC4899" 
                />
            </div>

            <div className="dashboard-row">
                <div className="chart-container">
                    <h4>Fretes por Mês</h4>
                    <BarChart data={fretes_por_mes || []} title="" xLabel="Mês" yLabel="Quantidade" />
                </div>
                <div className="candidaturas-container">
                    <h4>Candidaturas Pendentes</h4>
                    <p className="candidaturas-number">{candidaturas_pendentes?.length || 0}</p>
                    <p style={{ color: '#6B7280', fontSize: '0.8rem' }}>
                        {candidaturas_pendentes?.length > 0 ? 'Aguardando sua análise' : 'Nenhuma pendente'}
                    </p>
                    {candidaturas_pendentes?.length > 0 && (
                        <div className="candidaturas-lista">
                            {candidaturas_pendentes.slice(0, 3).map((cand, idx) => (
                                <div key={idx} className="candidaturas-item">
                                    <span className="candidaturas-item-nome">{cand.transportador_nome}</span>
                                    <span className="candidaturas-item-valor">
                                        R$ {cand.valor_lance?.toLocaleString('pt-BR')}
                                    </span>
                                </div>
                            ))}
                            <div className="candidaturas-ver-todas">
                                <a href="/candidaturas">Ver todas →</a>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="dashboard-row">
                <TableCard 
                    title="Atividades Recentes"
                    columns={activityColumns}
                    data={atividades_recentes || []}
                    onRowClick={(row) => window.location.href = `/frete/${row.id}`}
                />
                <TableCard 
                    title="Motoristas Favoritos"
                    columns={motoristaColumns}
                    data={motoristas_favoritos || []}
                />
            </div>
        </div>
    );
};

export default EmbarcadorDashboard;