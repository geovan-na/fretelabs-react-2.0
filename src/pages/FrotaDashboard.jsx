// src/pages/dashboards/FrotaDashboard.jsx
import React from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { StatsCard } from '../components/StatsCard';
import { DualBarChart } from '../components/DualBarChart';
import { TableCard } from '../components/TableCard';
import { AlertList } from '../components/AlertList';
import {
    VehicleIcon, CheckIcon, WrenchIcon, UsersIcon,
    TruckIcon, MoneyIcon, StarIcon
} from '../components/Icons';

const FrotaDashboard = () => {
    const { data, loading, error } = useDashboard('frota');

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

    const { 
        veiculos, motoristas, fretes_transito, faturamento_total, 
        fretes_faturamento_mes, alertas, desempenho_motoristas, 
        veiculos_mais_utilizados 
    } = data || {};

    const desempenhoColumns = [
        { key: 'nome', label: 'Motorista' },
        { key: 'fretes_realizados', label: 'Fretes Realizados' },
        { 
            key: 'avaliacao', 
            label: 'Avaliação',
            render: (row) => {
                const stars = Math.round(row.avaliacao || 0);
                return '★'.repeat(stars) + '☆'.repeat(5 - stars);
            }
        },
        { 
            key: 'status', 
            label: 'Status',
            render: (row) => (
                <span className={`status-badge badge-${row.status?.toLowerCase()}`}>
                    {row.status}
                </span>
            )
        }
    ];

    const veiculosColumns = [
        { key: 'placa', label: 'Placa' },
        { 
            key: 'modelo', 
            label: 'Veículo / Modelo',
            render: (row) => `${row.marca || ''} ${row.modelo || ''}`.trim() || row.placa
        },
        { key: 'fretes_realizados', label: 'Fretes Realizados' }
    ];

    return (
        <div className="dashboard-content">
            <div className="dashboard-header">
                <div className="dashboard-header-left">
                    <div className="dashboard-welcome">
                        <h1>Painel da Frota</h1>
                        <p>Gerencie sua frota e acompanhe o desempenho</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-stats">
                <StatsCard icon={<VehicleIcon />} label="Total de Veículos" value={veiculos?.total || 0} />
                <StatsCard icon={<CheckIcon />} label="Veículos Ativos" value={veiculos?.ativos || 0} color="#22C55E" />
                <StatsCard icon={<WrenchIcon />} label="Em Manutenção" value={veiculos?.manutencao || 0} color="#F59E0B" />
                <StatsCard icon={<UsersIcon />} label="Motoristas Ativos" value={motoristas?.ativos || 0} color="#3B82F6" />
                <StatsCard icon={<TruckIcon />} label="Fretes em Trânsito" value={fretes_transito || 0} color="#8B5CF6" />
                <StatsCard 
                    icon={<MoneyIcon />} 
                    label="Faturamento Total" 
                    value={`R$ ${(faturamento_total || 0).toLocaleString('pt-BR')}`} 
                    color="#22C55E" 
                    trend={12}
                />
            </div>

            <div className="dashboard-row dashboard-row-full">
                <div className="chart-container">
                    <h4>Fretes e Faturamento por Mês</h4>
                    <DualBarChart data={fretes_faturamento_mes || []} title="" xLabel="Mês" />
                </div>
            </div>

            <div className="dashboard-row">
                <AlertList alerts={alertas || []} title="Alertas" />
                <TableCard 
                    title="Desempenho dos Motoristas"
                    columns={desempenhoColumns}
                    data={desempenho_motoristas || []}
                />
            </div>

            <div className="dashboard-row dashboard-row-full">
                <TableCard 
                    title="Veículos mais Utilizados"
                    columns={veiculosColumns}
                    data={veiculos_mais_utilizados || []}
                />
            </div>
        </div>
    );
};

export default FrotaDashboard;