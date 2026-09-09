// components/ModalAvaliacao.jsx
import React, { useState } from 'react';
import { api } from '../services/api';

/**
 * ModalAvaliacao - Modal para envio de avaliação de frete concluído
 * @param {boolean} isOpen - Controla exibição do modal
 * @param {function} onClose - Função para fechar o modal
 * @param {object} frete - Dados do frete a ser avaliado
 * @param {function} onSuccess - Callback executado após enviar a avaliação
 */
export default function ModalAvaliacao({ isOpen, onClose, frete, onSuccess }) {
    const [notaGeral, setNotaGeral] = useState(5);
    const [notaPontualidade, setNotaPontualidade] = useState(5);
    const [notaComunicacao, setNotaComunicacao] = useState(5);
    const [notaCuidadoCarga, setNotaCuidadoCarga] = useState(5);
    const [comentario, setComentario] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isOpen || !frete) return null;

    const token = localStorage.getItem('token');

    const handleStarClick = (setter, value) => {
        setter(value);
    };

    const renderStars = (currentValue, setter) => {
        return (
            <div style={{ display: 'flex', gap: '4px', cursor: 'pointer', fontSize: '22px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <span
                        key={star}
                        onClick={() => handleStarClick(setter, star)}
                        style={{
                            color: star <= currentValue ? '#F59E0B' : '#475569',
                            transition: 'color 0.2s'
                        }}
                    >
                        ★
                    </span>
                ))}
            </div>
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const payload = {
                frete_id: frete.id,
                nota_geral: notaGeral,
                nota_pontualidade: notaPontualidade,
                nota_comunicacao: notaComunicacao,
                nota_cuidado_carga: notaCuidadoCarga,
                comentario: comentario.trim()
            };

            await api.avaliacoes.criar(payload, token);
            
            if (onSuccess) {
                onSuccess();
            }
            onClose();
        } catch (err) {
            console.error('Erro ao enviar avaliação:', err);
            setError(err.message || 'Erro ao enviar avaliação. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
        }}>
            <div style={{
                backgroundColor: '#1E293B',
                borderRadius: '16px',
                border: '1px solid #334155',
                width: '100%',
                maxWidth: '520px',
                padding: '28px',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                color: '#F8FAFC'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#F8FAFC' }}>
                            ⭐ Avaliar Frete #{frete.id}
                        </h2>
                        <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94A3B8' }}>
                            {frete.origem_cep || 'Origem'} → {frete.destino_cep || 'Destino'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#94A3B8',
                            fontSize: '24px',
                            cursor: 'pointer',
                            padding: '4px'
                        }}
                    >
                        &times;
                    </button>
                </div>

                {error && (
                    <div style={{
                        backgroundColor: '#EF444420',
                        border: '1px solid #EF4444',
                        color: '#FCA5A5',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        marginBottom: '16px'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#0F172A', borderRadius: '8px' }}>
                            <span style={{ fontSize: '14px', fontWeight: '600' }}>Nota Geral</span>
                            {renderStars(notaGeral, setNotaGeral)}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#0F172A', borderRadius: '8px' }}>
                            <span style={{ fontSize: '14px', color: '#CBD5E1' }}>Pontualidade</span>
                            {renderStars(notaPontualidade, setNotaPontualidade)}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#0F172A', borderRadius: '8px' }}>
                            <span style={{ fontSize: '14px', color: '#CBD5E1' }}>Comunicação</span>
                            {renderStars(notaComunicacao, setNotaComunicacao)}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', backgroundColor: '#0F172A', borderRadius: '8px' }}>
                            <span style={{ fontSize: '14px', color: '#CBD5E1' }}>Cuidado com a Carga</span>
                            {renderStars(notaCuidadoCarga, setNotaCuidadoCarga)}
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', color: '#CBD5E1', marginBottom: '6px' }}>
                                Comentário (opcional)
                            </label>
                            <textarea
                                value={comentario}
                                onChange={(e) => setComentario(e.target.value)}
                                placeholder="Conte como foi sua experiência com este frete..."
                                rows={3}
                                style={{
                                    width: '100%',
                                    backgroundColor: '#0F172A',
                                    border: '1px solid #334155',
                                    borderRadius: '8px',
                                    color: '#F8FAFC',
                                    padding: '10px 12px',
                                    fontSize: '14px',
                                    resize: 'vertical',
                                    outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            style={{
                                padding: '10px 18px',
                                backgroundColor: 'transparent',
                                border: '1px solid #475569',
                                borderRadius: '8px',
                                color: '#CBD5E1',
                                fontWeight: '500',
                                cursor: 'pointer'
                            }}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                padding: '10px 22px',
                                backgroundColor: '#F97316',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#FFFFFF',
                                fontWeight: '600',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s'
                            }}
                        >
                            {loading ? 'Enviando...' : 'Enviar Avaliação'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
