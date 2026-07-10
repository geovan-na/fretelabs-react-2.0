// pages/Avaliacoes.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import CardAvaliacao from '../components/CardAvaliacao';

export default function Avaliacoes() {
    const { user } = useAuth();
    const [avaliacoes, setAvaliacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mediaGeral, setMediaGeral] = useState(0);

    const token = localStorage.getItem('token');
    const isEmbarcador = user?.tipo === 'EMBARCADOR';
    const isTransportador = ['FROTA', 'AUTONOMO'].includes(user?.tipo);
    const isVinculado = user?.tipo === 'VINCULADO';

    useEffect(() => {
        carregarAvaliacoes();
    }, []);

    const carregarAvaliacoes = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.avaliacoes.listar(token);
            setAvaliacoes(response.data || []);

            // Calcular média geral
            if (response.data && response.data.length > 0) {
                const soma = response.data.reduce((acc, item) => acc + (item.nota_geral || 0), 0);
                setMediaGeral(soma / response.data.length);
            }
        } catch (err) {
            console.error('Erro ao carregar avaliações:', err);
            setError('Erro ao carregar avaliações.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="avaliacoes-loading">
                <p>Carregando avaliações...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="avaliacoes-error">
                <p>{error}</p>
                <button onClick={carregarAvaliacoes} className="btn btn-primary">
                    Tentar novamente
                </button>
            </div>
        );
    }

    return (
        <div className="avaliacoes-container">
            <div className="page-header">
                <h1>Avaliações</h1>
                <p className="subtitle">
                    {isEmbarcador 
                        ? 'Veja as avaliações que você recebeu dos transportadores'
                        : isVinculado
                        ? 'Veja as avaliações que você recebeu da frota e dos embarcadores'
                        : 'Veja as avaliações que você recebeu dos embarcadores'
                    }
                </p>
            </div>

            {/* MÉDIA GERAL */}
            {avaliacoes.length > 0 && (
                <div className="avaliacoes-media">
                    <span className="avaliacoes-media-label">Média Geral</span>
                    <div className="avaliacoes-media-valor">
                        <span className="avaliacoes-media-nota">{mediaGeral.toFixed(1)}</span>
                        <span className="avaliacoes-media-estrelas">
                            {'★'.repeat(Math.round(mediaGeral))}
                            {'☆'.repeat(5 - Math.round(mediaGeral))}
                        </span>
                    </div>
                    <span className="avaliacoes-media-total">
                        {avaliacoes.length} avaliação(ões)
                    </span>
                </div>
            )}

            {/* LISTA DE AVALIAÇÕES */}
            {avaliacoes.length === 0 ? (
                <div className="avaliacoes-vazio">
                    <p>Nenhuma avaliação recebida ainda.</p>
                    <p className="avaliacoes-vazio-sub">
                        {isEmbarcador 
                            ? 'Quando você concluir fretes, os transportadores poderão avaliar você.'
                            : 'Quando você concluir fretes, os embarcadores poderão avaliar você.'
                        }
                    </p>
                </div>
            ) : (
                <div className="avaliacoes-list">
                    {avaliacoes.map((avaliacao) => (
                        <CardAvaliacao key={avaliacao.id} avaliacao={avaliacao} />
                    ))}
                </div>
            )}
        </div>
    );
}