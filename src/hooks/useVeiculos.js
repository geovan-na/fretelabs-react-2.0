// hooks/useVeiculos.js
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { api } from '../services/api';

export const useVeiculos = () => {
    const { user } = useAuth();
    const [veiculos, setVeiculos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchVeiculos = useCallback(async () => {
        if (!user) return;
        
        setLoading(true);
        setError(null);
        
        try {
            const token = localStorage.getItem('token');
            const data = await api.veiculos?.listar(token);
            setVeiculos(data?.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchVeiculos();
    }, [fetchVeiculos]);

    const cadastrarVeiculo = async (dadosVeiculo) => {
        try {
            const token = localStorage.getItem('token');
            const novoVeiculo = await api.veiculos?.criar(dadosVeiculo, token);
            await fetchVeiculos();
            return novoVeiculo;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    return { veiculos, loading, error, cadastrarVeiculo, refetch: fetchVeiculos };
};