// src/pages/dashboards/VinculadoDashboard.jsx
import React from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { StatsCard } from '../components/StatsCard';
import { TableCard } from '../components/TableCard';
import { PerformanceCard } from '../components/PerformanceCard';
import {
    CheckIcon, TruckIcon, MoneyIcon, StarIcon, CalendarIcon
} from '../components/Icons';

const VinculadoDashboard = () => {
    const { data, loading, error } = useDashboard('vinculado');

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

    const { resumo, frota, proximos_fretes, historico_entregas, desempenho } = data || {};

    const proximosFretesColumns = [
        { key: 'codigo', label: 'Código' },
        { key: 'origem', label: 'Origem → Destino' },
        { key: 'data', label: 'Data de Coleta', render: (row) => new Date(row.data).toLocaleDateString('pt-BR') },
        { key: 'tipo_carga', label: 'Tipo de Carga' },
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

    const historicoColumns = [
        { key: 'codigo', label: 'Nº do Frete' },
        { key: 'rota', label: 'Rota' },
        { 
            key: 'data_entrega', 
            label: 'Data da Entrega',
            render: (row) => new Date(row.data_entrega).toLocaleDateString('pt-BR')
        },
        { 
            key: 'status', 
            label: 'Status',
            render: (row) => (
                <span className={`status-badge status-${row.status.toLowerCase()}`}>
                    {row.status}
                </span>
            )
        },
        { 
            key: 'valor', 
            label: 'Valor',
            render: (row) => `R$ ${(row.valor || 0).toLocaleString('pt-BR')}`
        }
    ];

    return (
        <div className="dashboard-content">
            <div className="dashboard-header">
                <div className="dashboard-header-left">
                    <div className="dashboard-welcome">
                        <h1>Dashboard do Motorista Vinculado</h1>
                        <p>{frota?.nome ? `Vinculado à ${frota.nome}` : 'Acompanhe seus fretes'}</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-stats">
                <StatsCard 
                    icon={<CheckIcon />} 
                    label="Fretes Concluídos" 
                    value={resumo?.fretes_concluidos || 0} 
                    color="#22C55E" 
                />
                <StatsCard 
                    icon={<TruckIcon />} 
                    label="Em Trânsito" 
                    value={resumo?.em_transito || 0} 
                    color="#3B82F6" 
                />
                <StatsCard 
                    icon={<MoneyIcon />} 
                    label="Total Recebido" 
                    value={`R$ ${(resumo?.total_recebido || 0).toLocaleString('pt-BR')}`} 
                    color="#22C55E" 
                />
                <StatsCard 
                    icon={<StarIcon />} 
                    label="Avaliação Média" 
                    value={`${resumo?.avaliacao_media || 0} ★`} 
                    color="#FF8200" 
                />
            </div>

            <PerformanceCard data={desempenho} />

            <div className="dashboard-row">
                <TableCard 
                    title="Próximos Fretes"
                    columns={proximosFretesColumns}
                    data={proximos_fretes || []}
                />
            </div>

            <div className="dashboard-row">
                <TableCard 
                    title="Histórico de Entregas"
                    columns={historicoColumns}
                    data={historico_entregas || []}
                />
            </div>
        </div>
    );
};

export default VinculadoDashboard;