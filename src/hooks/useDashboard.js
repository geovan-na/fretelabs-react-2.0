// src/hooks/useDashboard.js
import { useState, useEffect } from 'react';
import { api } from '../services/api';

export function useDashboard() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        totalFretes: 0,
        emAndamento: 0,
        aguardando: 0,
        concluidos: 0,
        cancelados: 0,
        faturamento: 0
    });
    const [fretesRecentes, setFretesRecentes] = useState([]);
    const [candidaturasPendentes, setCandidaturasPendentes] = useState(0);

    const token = localStorage.getItem('token');

    const carregarDashboard = async () => {
        setLoading(true);
        setError(null);

        try {
            if (!token) {
                throw new Error('Token nao encontrado');
            }

            // Buscar estatisticas do embarcador
            // Buscar estatisticas do embarcador
            const statsResponse = await api.embarcador.getEstatisticas(token);

            if (statsResponse) {
                setStats({
                    totalFretes: statsResponse.totalFretes || 0,
                    emAndamento: statsResponse.emAndamento || 0,
                    aguardando: statsResponse.aguardando || 0,
                    concluidos: statsResponse.concluidos || 0,
                    cancelados: statsResponse.cancelados || 0,
                    faturamento: statsResponse.faturamento || 0
                });
            }

            // Buscar fretes recentes
            const fretesResponse = await api.fretes.listar(token);
            
            if (fretesResponse && fretesResponse.data) {
                // Pegar apenas os 5 mais recentes
                const recentes = fretesResponse.data.slice(0, 5);
                setFretesRecentes(recentes);
            }

            // Buscar candidaturas pendentes
            // Como ainda nao temos endpoint especifico, vamos contar dos fretes
            if (fretesResponse && fretesResponse.data) {
                const pendentes = fretesResponse.data.filter(
                    f => f.status === 'AGUARDANDO' || f.status === 'NEGOCIACAO'
                );
                setCandidaturasPendentes(pendentes.length);
            }

        } catch (err) {
            console.error('Erro ao carregar dashboard:', err);
            setError(err.message || 'Erro ao carregar dados do dashboard');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        carregarDashboard();
    }, [token]);

    return {
        loading,
        error,
        stats,
        fretesRecentes,
        candidaturasPendentes,
        recarregar: carregarDashboard
    };
}