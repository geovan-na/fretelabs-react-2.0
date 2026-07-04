// hooks/useFretes.js
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { api } from '../services/api';

export const useFretes = () => {
    const { user } = useAuth();
    const [fretes, setFretes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchFretes = useCallback(async () => {
        if (!user) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const token = localStorage.getItem('token');
            const data = await api.fretes.listar(token);
            setFretes(data.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchFretes();
    }, [fetchFretes]);

    const criarFrete = async (dadosFrete) => {
        try {
            const token = localStorage.getItem('token');
            const novoFrete = await api.fretes.criar(dadosFrete, token);
            await fetchFretes();
            return novoFrete;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    return { fretes, loading, error, criarFrete, refetch: fetchFretes };
};