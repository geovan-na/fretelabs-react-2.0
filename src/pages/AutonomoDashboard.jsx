// src/pages/dashboards/AutonomoDashboard.jsx
import React from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { StatsCard } from '../components/StatsCard';
import { LineChart } from '../components/LineChart';
import { AlertList } from '../components/AlertList';
import { VeiculoInfoCard } from '../components/VeiculoInfoCard';
import {
    CheckIcon, TruckIcon, FileIcon, MoneyIcon, ChartIcon
} from '../components/Icons';

const AutonomoDashboard = () => {
    const { data, loading, error } = useDashboard('autonomo');

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

    const { resumo, veiculo, cnh, receita_por_mes, proximos_fretes, alertas } = data || {};

    return (
        <div className="dashboard-content">
            <div className="dashboard-header">
                <div className="dashboard-header-left">
                    <div className="dashboard-welcome">
                        <h1>Olá, Motorista</h1>
                        <p>Gerencie seus fretes e acompanhe seu desempenho</p>
                    </div>
                </div>
            </div>

            <VeiculoInfoCard veiculo={veiculo} cnh={cnh} />

            <div className="dashboard-stats">
                <StatsCard icon={<CheckIcon />} label="Fretes Concluídos" value={resumo?.fretes_concluidos || 0} color="#22C55E" />
                <StatsCard icon={<TruckIcon />} label="Em Trânsito" value={resumo?.em_transito || 0} color="#3B82F6" />
                <StatsCard icon={<FileIcon />} label="Candidaturas Pendentes" value={resumo?.candidaturas_pendentes || 0} color="#F59E0B" />
                <StatsCard 
                    icon={<MoneyIcon />} 
                    label="Receita Total" 
                    value={`R$ ${(resumo?.receita_total || 0).toLocaleString('pt-BR')}`} 
                    color="#22C55E" 
                />
                <StatsCard 
                    icon={<ChartIcon />} 
                    label="Taxa de Aceite" 
                    value={`${resumo?.taxa_aceite || 0}%`} 
                    color="#8B5CF6" 
                />
            </div>

            <div className="dashboard-row">
                <div className="chart-container">
                    <h4>Receita por Mês</h4>
                    <LineChart data={receita_por_mes || []} title="" xLabel="Mês" yLabel="Receita (R$)" />
                </div>
                <AlertList alerts={alertas || []} title="Alertas" />
            </div>
        </div>
    );
};

export default AutonomoDashboard;