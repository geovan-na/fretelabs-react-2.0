// src/pages/vinculado/MeusFretesVinculado.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import CardFreteVinculado from '../components/CardFreteVinculado';

const MeusFretesVinculado = () => {
    const navigate = useNavigate();
    const [fretes, setFretes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtroStatus, setFiltroStatus] = useState('TODOS');

    const token = localStorage.getItem('token');

    const carregarFretes = async (status) => {
        setLoading(true);
        setError(null);
        try {
            const params = status && status !== 'TODOS' ? status : '';
            const data = await api.motoristaVinculado.listarFretes(token, params);
            setFretes(data.data || []);
        } catch (err) {
            setError(err.message || 'Erro ao carregar fretes');
            console.error('Erro ao carregar fretes:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        carregarFretes(filtroStatus);
    }, [filtroStatus]);

    const handleFiltroClick = (status) => {
        setFiltroStatus(status);
    };

    const handleFreteClick = (frete) => {
        navigate(`/dashboard/vinculado/fretes/${frete.id}`);
    };

    const statusOptions = [
        { value: 'TODOS', label: 'Todos' },
        { value: 'AGUARDANDO', label: 'Aguardando' },
        { value: 'ACEITO', label: 'Aceitos' },
        { value: 'TRANSITO', label: 'Em Trânsito' },
        { value: 'CONCLUIDO', label: 'Concluídos' },
        { value: 'CANCELADO', label: 'Cancelados' }
    ];

    const getStatusLabel = (status) => {
        const map = {
            'AGUARDANDO': 'Aguardando',
            'NEGOCIACAO': 'Negociação',
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
                    <h1>Meus Fretes</h1>
                    <p className="subtitle">Visualize todos os seus fretes</p>
                </div>
            </div>

            {/* Mensagens */}
            {error && (
                <div className="propostas-mensagem erro">
                    <p>{error}</p>
                </div>
            )}

            {/* Filtros */}
            <div className="meus-fretes-filtros">
                {statusOptions.map((option) => (
                    <button
                        key={option.value}
                        className={`filtro-btn ${filtroStatus === option.value ? 'active' : ''}`}
                        onClick={() => handleFiltroClick(option.value)}
                    >
                        {option.label}
                    </button>
                ))}
            </div>

            {/* Lista de Fretes */}
            {loading ? (
                <div className="propostas-loading">
                    <p>Carregando fretes...</p>
                </div>
            ) : (
                <div className="meus-fretes-grid">
                    {fretes.length === 0 ? (
                        <div className="propostas-vazio">
                            <p>Nenhum frete encontrado</p>
                            <p className="propostas-vazio-sub">
                                {filtroStatus !== 'TODOS' 
                                    ? `Nenhum frete com status "${getStatusLabel(filtroStatus)}"`
                                    : 'Você ainda não possui fretes'}
                            </p>
                        </div>
                    ) : (
                        fretes.map((frete) => (
                            <CardFreteVinculado
                                key={frete.id}
                                frete={frete}
                                onClick={handleFreteClick}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default MeusFretesVinculado;