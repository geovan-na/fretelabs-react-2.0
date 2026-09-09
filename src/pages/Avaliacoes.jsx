// pages/Avaliacoes.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import CardAvaliacao from '../components/CardAvaliacao';

export default function Avaliacoes() {
    const { user } = useAuth();
    const [tab, setTab] = useState('recebidas'); // 'recebidas' ou 'minhas'
    const [avaliacoes, setAvaliacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mediaGeral, setMediaGeral] = useState(0);

    const token = localStorage.getItem('token');

    useEffect(() => {
        carregarAvaliacoes();
    }, [tab]);

    const carregarAvaliacoes = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = tab === 'recebidas' 
                ? await api.avaliacoes.listarRecebidas(token)
                : await api.avaliacoes.listarMinhas(token);
                
            const lista = response.data || [];
            setAvaliacoes(lista);

            if (lista.length > 0) {
                const soma = lista.reduce((acc, item) => acc + (item.nota_geral || 0), 0);
                setMediaGeral(soma / lista.length);
            } else {
                setMediaGeral(0);
            }
        } catch (err) {
            console.error('Erro ao carregar avaliações:', err);
            setError('Erro ao carregar avaliações.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="avaliacoes-container">
            <div className="page-header">
                <h1>Avaliações</h1>
                <p className="subtitle">
                    Acompanhe a reputação e as avaliações dos fretes concluídos
                </p>
            </div>

            {/* ABA DE NAVEGAÇÃO: RECEBIDAS X MINHAS ENVIADAS */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                <button
                    onClick={() => setTab('recebidas')}
                    style={{
                        padding: '10px 18px',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: tab === 'recebidas' ? '#F97316' : '#334155',
                        backgroundColor: tab === 'recebidas' ? '#F97316' : '#1E293B',
                        color: '#FFFFFF',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    📥 Avaliações Recebidas
                </button>
                <button
                    onClick={() => setTab('minhas')}
                    style={{
                        padding: '10px 18px',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: tab === 'minhas' ? '#F97316' : '#334155',
                        backgroundColor: tab === 'minhas' ? '#F97316' : '#1E293B',
                        color: '#FFFFFF',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    📤 Avaliações Enviadas
                </button>
            </div>

            {loading ? (
                <div className="avaliacoes-loading">
                    <p>Carregando avaliações...</p>
                </div>
            ) : error ? (
                <div className="avaliacoes-error">
                    <p>{error}</p>
                    <button onClick={carregarAvaliacoes} className="btn btn-primary">
                        Tentar novamente
                    </button>
                </div>
            ) : (
                <>
                    {/* MÉDIA GERAL */}
                    {avaliacoes.length > 0 && tab === 'recebidas' && (
                        <div className="avaliacoes-media" style={{ marginBottom: '24px' }}>
                            <span className="avaliacoes-media-label">Sua Média Geral</span>
                            <div className="avaliacoes-media-valor">
                                <span className="avaliacoes-media-nota">{mediaGeral.toFixed(1)}</span>
                                <span className="avaliacoes-media-estrelas">
                                    {'★'.repeat(Math.round(mediaGeral))}
                                    {'☆'.repeat(5 - Math.round(mediaGeral))}
                                </span>
                            </div>
                            <span className="avaliacoes-media-total">
                                Baseado em {avaliacoes.length} avaliação(ões)
                            </span>
                        </div>
                    )}

                    {/* LISTA DE AVALIAÇÕES */}
                    {avaliacoes.length === 0 ? (
                        <div className="avaliacoes-vazio">
                            <p>
                                {tab === 'recebidas' 
                                    ? 'Nenhuma avaliação recebida ainda.' 
                                    : 'Você ainda não enviou avaliações para nenhum frete concluído.'}
                            </p>
                            <p className="avaliacoes-vazio-sub">
                                Quando você concluir fretes, as avaliações ficarão visíveis aqui.
                            </p>
                        </div>
                    ) : (
                        <div className="avaliacoes-list">
                            {avaliacoes.map((avaliacao) => (
                                <CardAvaliacao key={avaliacao.id} avaliacao={avaliacao} />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}