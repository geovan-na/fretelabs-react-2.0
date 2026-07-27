import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import TimelineFrete from '../components/TimelineFrete';

const RastreamentoVinculado = () => {
    const [fretes, setFretes] = useState([]);
    const [selectedFrete, setSelectedFrete] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = localStorage.getItem('token');

    const carregarFretes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.motoristaVinculado.listarFretesEmAndamento(token);
            
            // Extrai o array com segurança caso o backend retorne [ ... ] ou { fretes: [ ... ] } ou { data: [ ... ] }
            const listaFretes = Array.isArray(response) 
                ? response 
                : (response?.fretes || response?.data || []);

            setFretes(listaFretes);

            if (listaFretes.length > 0) {
                setSelectedFrete(listaFretes[0]);
            } else {
                setSelectedFrete(null);
            }
        } catch (err) {
            setError(err.message || 'Erro ao carregar fretes');
            console.error('Erro ao carregar fretes:', err);
            setFretes([]);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        carregarFretes();
    }, [carregarFretes]);

    const handleSelectFrete = (freteId) => {
        if (!Array.isArray(fretes)) return;
        const frete = fretes.find((f) => String(f.id) === String(freteId));
        setSelectedFrete(frete || null);
    };

    const getStatusLabel = (status) => {
        const map = {
            'ACEITO': 'Aceito',
            'TRANSITO': 'Em Trânsito',
            'CONCLUIDO': 'Concluído',
            'CANCELADO': 'Cancelado'
        };
        return map[status] || status;
    };

    return (
        <div className="motoristas-container">
            <div className="page-header">
                <div>
                    <h1>Rastreamento</h1>
                    <p className="subtitle">Acompanhe seus fretes em andamento</p>
                </div>
            </div>

            {error && (
                <div className="propostas-mensagem erro">
                    <p>{error}</p>
                </div>
            )}

            {loading ? (
                <div className="propostas-loading">
                    <p>Carregando fretes...</p>
                </div>
            ) : (!Array.isArray(fretes) || fretes.length === 0) ? (
                <div className="propostas-vazio">
                    <p>Nenhum frete em andamento</p>
                    <p className="propostas-vazio-sub">Você não possui fretes com status "Aceito" ou "Em Trânsito"</p>
                </div>
            ) : (
                <>
                    <div className="rastreamento-selector">
                        <label htmlFor="frete-select">Selecione o frete:</label>
                        <select
                            id="frete-select"
                            className="form-select"
                            value={selectedFrete?.id || ''}
                            onChange={(e) => handleSelectFrete(e.target.value)}
                        >
                            {fretes.map((frete) => (
                                <option key={frete.id} value={frete.id}>
                                    {frete.codigo || `FR${String(frete.id).padStart(5, '0')}`} - 
                                    {frete.origem} → {frete.destino} ({getStatusLabel(frete.status)})
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedFrete && (
                        <div className="rastreamento-timeline">
                            <TimelineFrete frete={selectedFrete} />
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default RastreamentoVinculado;