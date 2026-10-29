// components/ModalAvaliacao.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

/**
 * ModalAvaliacao - Modal interativo para envio de avaliações com estrelas e comentário
 * @param {boolean} isOpen - Controla exibição do modal
 * @param {function} onClose - Função para fechar o modal
 * @param {object} frete - Dados do frete a ser avaliado (id, frete_id, origem, destino, etc)
 * @param {function} onSuccess - Callback executado após enviar a avaliação
 */
export default function ModalAvaliacao({ isOpen, onClose, frete, onSuccess }) {
    const [notaGeral, setNotaGeral] = useState(5);
    const [notaPontualidade, setNotaPontualidade] = useState(5);
    const [notaComunicacao, setNotaComunicacao] = useState(5);
    const [notaCuidadoCarga, setNotaCuidadoCarga] = useState(5);
    const [comentario, setComentario] = useState('');
    const [hoverGeral, setHoverGeral] = useState(0);
    const [hoverPontualidade, setHoverPontualidade] = useState(0);
    const [hoverComunicacao, setHoverComunicacao] = useState(0);
    const [hoverCuidadoCarga, setHoverCuidadoCarga] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [sucesso, setSucesso] = useState(false);

    // Reseta o estado quando o modal abre
    useEffect(() => {
        if (isOpen) {
            setNotaGeral(5);
            setNotaPontualidade(5);
            setNotaComunicacao(5);
            setNotaCuidadoCarga(5);
            setHoverGeral(0);
            setHoverPontualidade(0);
            setHoverComunicacao(0);
            setHoverCuidadoCarga(0);
            setComentario('');
            setError('');
            setSucesso(false);
            setLoading(false);
        }
    }, [isOpen, frete]);

    // Fecha ao pressionar ESC
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isOpen && !loading) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, loading, onClose]);

    if (!isOpen || !frete) return null;

    const token = localStorage.getItem('token');
    const freteId = frete.id || frete.frete_id;
    const codigoFormatado = frete.codigo || `FR${String(freteId).padStart(5, '0')}`;
    const rotaFormatada = `${frete.origem_cidade || frete.origem || frete.origem_cep || 'Origem'} → ${frete.destino_cidade || frete.destino || frete.destino_cep || 'Destino'}`;

    const labelsNotas = {
        1: 'Ruim',
        2: 'Regular',
        3: 'Bom',
        4: 'Muito Bom',
        5: 'Excelente'
    };

    const renderEstrelas = (valorAtual, setter, hoverValor, hoverSetter) => {
        const valorExibido = hoverValor || valorAtual;
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div 
                    style={{ display: 'inline-flex', gap: '4px', cursor: 'pointer' }}
                    onMouseLeave={() => hoverSetter(0)}
                >
                    {[1, 2, 3, 4, 5].map((star) => (
                        <span
                            key={star}
                            onClick={() => setter(star)}
                            onMouseEnter={() => hoverSetter(star)}
                            style={{
                                color: star <= valorExibido ? '#F59E0B' : '#475569',
                                fontSize: '26px',
                                lineHeight: '1',
                                transition: 'transform 0.15s, color 0.15s',
                                transform: hoverValor === star ? 'scale(1.2)' : 'scale(1)',
                                userSelect: 'none',
                                padding: '0 2px'
                            }}
                            title={`${star} estrela${star > 1 ? 's' : ''}`}
                        >
                            ★
                        </span>
                    ))}
                </div>
                <span style={{ 
                    fontSize: '12px', 
                    fontWeight: '600', 
                    color: '#F59E0B',
                    minWidth: '70px',
                    textAlign: 'right'
                }}>
                    {valorExibido}/5 ({labelsNotas[valorExibido] || ''})
                </span>
            </div>
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const payload = {
                frete_id: freteId,
                nota_geral: notaGeral,
                nota_pontualidade: notaPontualidade,
                nota_comunicacao: notaComunicacao,
                nota_cuidado_carga: notaCuidadoCarga,
                comentario: comentario.trim()
            };

            await api.avaliacoes.criar(payload, token);
            
            setSucesso(true);
            setTimeout(() => {
                if (onSuccess) {
                    onSuccess();
                }
                onClose();
            }, 1200);
        } catch (err) {
            console.error('Erro ao enviar avaliação:', err);
            setError(err.message || 'Erro ao enviar avaliação. Tente novamente.');
            setLoading(false);
        }
    };

    return (
        <div 
            onClick={onClose}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                backdropFilter: 'blur(5px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 99999,
                padding: '16px',
                animation: 'fadeIn 0.2s ease-out'
            }}
        >
            <div 
                onClick={(e) => e.stopPropagation()}
                style={{
                    backgroundColor: '#1E293B',
                    borderRadius: '16px',
                    border: '1px solid #334155',
                    width: '100%',
                    maxWidth: '520px',
                    maxHeight: '92vh',
                    overflowY: 'auto',
                    padding: '28px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
                    color: '#F8FAFC',
                    position: 'relative'
                }}
            >
                {/* CABEÇALHO */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '1px solid #334155', paddingBottom: '16px' }}>
                    <div>
                        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '700', color: '#F8FAFC', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: '#F59E0B' }}>⭐</span> Avaliar Frete {codigoFormatado}
                        </h2>
                        <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#94A3B8' }}>
                            {rotaFormatada}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        type="button"
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: '#94A3B8',
                            fontSize: '28px',
                            lineHeight: '1',
                            cursor: 'pointer',
                            padding: '0 4px',
                            borderRadius: '4px'
                        }}
                        title="Fechar"
                    >
                        &times;
                    </button>
                </div>

                {/* SUCESSO */}
                {sucesso ? (
                    <div style={{
                        padding: '30px 20px',
                        textAlign: 'center',
                        backgroundColor: '#10B98115',
                        border: '1px solid #10B981',
                        borderRadius: '12px',
                        color: '#10B981',
                        margin: '20px 0'
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>✓</div>
                        <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '700' }}>Avaliação Enviada!</h3>
                        <p style={{ margin: 0, fontSize: '14px', color: '#A7F3D0' }}>
                            Obrigado pelo seu feedback. A reputação do usuário foi atualizada com sucesso.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {/* MENSAGEM DE ERRO */}
                        {error && (
                            <div style={{
                                backgroundColor: '#EF444420',
                                border: '1px solid #EF4444',
                                color: '#FCA5A5',
                                padding: '12px 14px',
                                borderRadius: '8px',
                                fontSize: '14px',
                                marginBottom: '18px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <span>⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '22px' }}>
                            
                            {/* NOTA GERAL */}
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                padding: '12px 14px', 
                                backgroundColor: '#0F172A', 
                                borderRadius: '10px',
                                border: '1px solid #334155'
                            }}>
                                <div>
                                    <div style={{ fontSize: '14px', fontWeight: '700', color: '#F8FAFC' }}>Nota Geral</div>
                                    <div style={{ fontSize: '12px', color: '#94A3B8' }}>Satisfação geral com o frete</div>
                                </div>
                                {renderEstrelas(notaGeral, setNotaGeral, hoverGeral, setHoverGeral)}
                            </div>

                            {/* PONTUALIDADE */}
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                padding: '10px 14px', 
                                backgroundColor: '#0F172A', 
                                borderRadius: '10px',
                                border: '1px solid #1E293B'
                            }}>
                                <span style={{ fontSize: '13px', color: '#CBD5E1', fontWeight: '500' }}>Pontualidade</span>
                                {renderEstrelas(notaPontualidade, setNotaPontualidade, hoverPontualidade, setHoverPontualidade)}
                            </div>

                            {/* COMUNICAÇÃO */}
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                padding: '10px 14px', 
                                backgroundColor: '#0F172A', 
                                borderRadius: '10px',
                                border: '1px solid #1E293B'
                            }}>
                                <span style={{ fontSize: '13px', color: '#CBD5E1', fontWeight: '500' }}>Comunicação</span>
                                {renderEstrelas(notaComunicacao, setNotaComunicacao, hoverComunicacao, setHoverComunicacao)}
                            </div>

                            {/* CUIDADO COM A CARGA */}
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                padding: '10px 14px', 
                                backgroundColor: '#0F172A', 
                                borderRadius: '10px',
                                border: '1px solid #1E293B'
                            }}>
                                <span style={{ fontSize: '13px', color: '#CBD5E1', fontWeight: '500' }}>Cuidado com a Carga</span>
                                {renderEstrelas(notaCuidadoCarga, setNotaCuidadoCarga, hoverCuidadoCarga, setHoverCuidadoCarga)}
                            </div>

                            {/* COMENTÁRIO */}
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#CBD5E1', marginBottom: '8px' }}>
                                    Comentário (opcional)
                                </label>
                                <textarea
                                    value={comentario}
                                    onChange={(e) => setComentario(e.target.value)}
                                    placeholder="Conte como foi sua experiência com este frete (pontualidade, cuidado, comunicação)..."
                                    rows={3}
                                    maxLength={500}
                                    style={{
                                        width: '100%',
                                        boxSizing: 'border-box',
                                        backgroundColor: '#0F172A',
                                        border: '1px solid #334155',
                                        borderRadius: '8px',
                                        color: '#F8FAFC',
                                        padding: '10px 12px',
                                        fontSize: '14px',
                                        resize: 'vertical',
                                        outline: 'none',
                                        fontFamily: 'inherit'
                                    }}
                                />
                                <div style={{ textAlign: 'right', fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                                    {comentario.length}/500 caracteres
                                </div>
                            </div>
                        </div>

                        {/* BOTÕES DE AÇÃO */}
                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '10px', borderTop: '1px solid #334155' }}>
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={loading}
                                style={{
                                    padding: '10px 20px',
                                    backgroundColor: 'transparent',
                                    border: '1px solid #475569',
                                    borderRadius: '8px',
                                    color: '#CBD5E1',
                                    fontWeight: '500',
                                    cursor: loading ? 'not-allowed' : 'pointer'
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    padding: '10px 24px',
                                    backgroundColor: '#F97316',
                                    border: 'none',
                                    borderRadius: '8px',
                                    color: '#FFFFFF',
                                    fontWeight: '600',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    boxShadow: '0 4px 6px -1px rgba(249, 115, 22, 0.3)'
                                }}
                            >
                                {loading ? 'Enviando Avaliação...' : '⭐ Enviar Avaliação'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
