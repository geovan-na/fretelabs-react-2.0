// src/hooks/useDashboard.js
import { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

export const useDashboard = (tipo) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchDashboard = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            const token = localStorage.getItem('token');
            
            if (!token) {
                throw new Error('Usuário não autenticado');
            }

            let response;
            switch (tipo) {
                case 'embarcador':
                    response = await api.dashboard.embarcador(token);
                    break;
                case 'frota':
                    response = await api.dashboard.frota(token);
                    break;
                case 'autonomo':
                    response = await api.dashboard.autonomo(token);
                    break;
                case 'vinculado':
                    response = await api.dashboard.vinculado(token);
                    break;
                case 'admin':
                    response = await api.dashboard.admin(token);
                    break;
                default:
                    throw new Error('Tipo de dashboard inválido');
            }
            
            setData(response);
        } catch (err) {
            console.error(`Erro ao carregar dashboard ${tipo}:`, err);
            setError(err.message || 'Erro ao carregar dados');
        } finally {
            setLoading(false);
        }
    }, [tipo]);

    useEffect(() => {
        fetchDashboard();
    }, [fetchDashboard]);

    return { data, loading, error, refetch: fetchDashboard };
};