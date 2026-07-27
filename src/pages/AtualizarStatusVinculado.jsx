// src/pages/vinculado/AtualizarStatusVinculado.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import CardFreteParaAtualizar from '../components/CardFreteParaAtualizar';

const AtualizarStatusVinculado = () => {
    const [fretes, setFretes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const token = localStorage.getItem('token');

    const carregarFretes = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.motoristaVinculado.listarFretesParaAtualizar(token);
            
            // Tratamento defensivo para garantir Array
            const listaFretes = Array.isArray(response) 
                ? response 
                : (response?.data || []);

            setFretes(listaFretes);
        } catch (err) {
            setError(err.message || 'Erro ao carregar fretes');
            console.error('Erro ao carregar fretes:', err);
            setFretes([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        carregarFretes();
    }, []);

    const handleAtualizarStatus = async (freteId, novoStatus, observacao) => {
        setUpdating(true);
        setError(null);
        setSuccess(null);

        try {
            await api.motoristaVinculado.atualizarStatusFrete(
                freteId,
                novoStatus,
                observacao,
                token
            );

            const statusLabels = {
                'TRANSITO': 'Em Trânsito',
                'CONCLUIDO': 'Concluído'
            };

            setSuccess(`Status atualizado para "${statusLabels[novoStatus] || novoStatus}" com sucesso!`);
            
            // Recarregar lista após atualizar
            setTimeout(() => {
                carregarFretes();
            }, 1000);

        } catch (err) {
            setError(err.message || 'Erro ao atualizar status');
            console.error('Erro ao atualizar status:', err);
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="motoristas-container">
            <div className="page-header">
                <div>
                    <h1>Atualizar Status</h1>
                    <p className="subtitle">Atualize o status dos seus fretes em andamento</p>
                </div>
            </div>

            {/* Mensagens */}
            {error && (
                <div className="propostas-mensagem erro">
                    <p>{error}</p>
                </div>
            )}
            {success && (
                <div className="propostas-mensagem sucesso">
                    <p>{success}</p>
                </div>
            )}

            {/* Lista de Fretes */}
            {loading ? (
                <div className="propostas-loading">
                    <p>Carregando fretes...</p>
                </div>
            ) : (
                <div className="meus-fretes-grid">
                    {!Array.isArray(fretes) || fretes.length === 0 ? (
                        <div className="propostas-vazio">
                            <p>Nenhum frete em andamento</p>
                            <p className="propostas-vazio-sub">
                                Você não possui fretes com status "Aceito" ou "Em Trânsito"
                            </p>
                        </div>
                    ) : (
                        fretes.map((frete) => (
                            <CardFreteParaAtualizar
                                key={frete.id}
                                frete={frete}
                                onAtualizar={handleAtualizarStatus}
                                loading={updating}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default AtualizarStatusVinculado;