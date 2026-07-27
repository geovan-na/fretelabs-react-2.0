// src/pages/dashboards/AdminDashboard.jsx
import React from 'react';
import { useDashboard } from '../hooks/useDashboard';
import { StatsCard } from '../components/StatsCard';
import { BarChart } from '../components/BarChart';
import { ActivityList } from '../components/ActivityList';
import {
    UsersIcon, ClockIcon, CheckIcon, CancelIcon,
    BoxIcon, TruckIcon, MoneyIcon, VehicleIcon, ChartIcon
} from '../components/Icons';

const AdminDashboard = () => {
    const { data, loading, error } = useDashboard('admin');

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
        usuarios, 
        fretes, 
        veiculos, 
        taxa_ocupacao, 
        dados_por_mes, 
        atividades_recentes, 
        alertas,
        metricas 
    } = data || {};

    return (
        <div className="dashboard-content">
            <div className="dashboard-header">
                <div className="dashboard-header-left">
                    <div className="dashboard-welcome">
                        <h1>Painel Administrativo</h1>
                        <p>Visão geral da plataforma FreteLabs</p>
                    </div>
                </div>
            </div>

            <div className="dashboard-stats">
                <StatsCard icon={<UsersIcon />} label="Total de Usuários" value={usuarios?.total || 0} />
                <StatsCard 
                    icon={<ClockIcon />} 
                    label="Pendentes" 
                    value={usuarios?.pendentes || 0} 
                    color="#F59E0B" 
                />
                <StatsCard 
                    icon={<CheckIcon />} 
                    label="Aprovados" 
                    value={usuarios?.aprovados || 0} 
                    color="#22C55E" 
                />
                <StatsCard 
                    icon={<CancelIcon />} 
                    label="Bloqueados" 
                    value={usuarios?.bloqueados || 0} 
                    color="#EF4444" 
                />
                <StatsCard 
                    icon={<BoxIcon />} 
                    label="Total de Fretes" 
                    value={fretes?.total || 0} 
                />
                <StatsCard 
                    icon={<TruckIcon />} 
                    label="Em Trânsito" 
                    value={fretes?.em_transito || 0} 
                    color="#3B82F6" 
                />
                <StatsCard 
                    icon={<CheckIcon />} 
                    label="Concluídos" 
                    value={fretes?.concluidos || 0} 
                    color="#22C55E" 
                />
                <StatsCard 
                    icon={<CancelIcon />} 
                    label="Cancelados" 
                    value={fretes?.cancelados || 0} 
                    color="#EF4444" 
                />
                <StatsCard 
                    icon={<MoneyIcon />} 
                    label="Faturamento Total" 
                    value={`R$ ${(fretes?.faturamento_total || 0).toLocaleString('pt-BR')}`} 
                    color="#22C55E" 
                    trend={12}
                />
                <StatsCard 
                    icon={<VehicleIcon />} 
                    label="Total de Veículos" 
                    value={veiculos?.total || 0} 
                />
                <StatsCard 
                    icon={<ChartIcon />} 
                    label="Taxa de Ocupação" 
                    value={`${taxa_ocupacao || 0}%`} 
                    color="#8B5CF6" 
                />
            </div>

            <div className="dashboard-row dashboard-row-full">
                <div className="chart-container">
                    <h4>Usuários e Fretes por Mês</h4>
                    <BarChart 
                        data={dados_por_mes?.map(item => ({
                            mes: item.mes,
                            mes_label: item.mes,
                            total: item.usuarios + item.fretes
                        })) || []} 
                        title="" 
                        xLabel="Mês" 
                        yLabel="Total" 
                    />
                </div>
            </div>

            <div className="dashboard-row">
                <ActivityList activities={atividades_recentes || []} />
                <div className="table-container">
                    <h4>Alertas do Sistema</h4>
                    <div className="alert-list">
                        {alertas?.documentos_pendentes > 0 && (
                            <div className="alert-item seguro">
                                <div className="alert-titulo">
                                    {alertas.documentos_pendentes} usuários com documentos pendentes
                                </div>
                                <div className="alert-descricao">
                                    Documentos aguardando verificação
                                </div>
                            </div>
                        )}
                        {alertas?.blacklist > 0 && (
                            <div className="alert-item manutencao">
                                <div className="alert-titulo">
                                    {alertas.blacklist} usuários na blacklist
                                </div>
                                <div className="alert-descricao">
                                    Usuários bloqueados na plataforma
                                </div>
                            </div>
                        )}
                        {metricas?.taxa_cancelamento > 0 && (
                            <div className="alert-item manutencao">
                                <div className="alert-titulo">
                                    Taxa de cancelamento: {metricas.taxa_cancelamento}%
                                </div>
                            </div>
                        )}
                        {metricas?.taxa_entrega > 0 && (
                            <div className="alert-item seguro">
                                <div className="alert-titulo">
                                    Taxa de entrega: {metricas.taxa_entrega}%
                                </div>
                            </div>
                        )}
                        {metricas?.tempo_medio_entrega > 0 && (
                            <div className="alert-item seguro">
                                <div className="alert-titulo">
                                    Tempo médio de entrega: {metricas.tempo_medio_entrega} dias
                                </div>
                            </div>
                        )}
                        {metricas?.sla_cumprido > 0 && (
                            <div className="alert-item seguro">
                                <div className="alert-titulo">
                                    SLA cumprido: {metricas.sla_cumprido}%
                                </div>
                            </div>
                        )}
                        {!alertas?.documentos_pendentes && !alertas?.blacklist && !metricas?.taxa_cancelamento && (
                            <div className="alert-empty">
                                Nenhum alerta no momento
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;