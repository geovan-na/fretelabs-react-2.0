import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import ResumoEntregas from '../components/ResumoEntregas';
import ModalAvaliacao from '../components/ModalAvaliacao';

const EntregasRealizadasVinculado = () => {
    const [entregas, setEntregas] = useState([]);
    const [resumo, setResumo] = useState({ total_entregas: 0, total_recebido: 0, media_por_entrega: 0, meses_trabalhados: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mesSelecionado, setMesSelecionado] = useState('');
    const [anoSelecionado, setAnoSelecionado] = useState('');
    const [freteAvaliar, setFreteAvaliar] = useState(null);

    const token = localStorage.getItem('token');

    const meses = [
        { value: '1', label: 'Janeiro' },
        { value: '2', label: 'Fevereiro' },
        { value: '3', label: 'Março' },
        { value: '4', label: 'Abril' },
        { value: '5', label: 'Maio' },
        { value: '6', label: 'Junho' },
        { value: '7', label: 'Julho' },
        { value: '8', label: 'Agosto' },
        { value: '9', label: 'Setembro' },
        { value: '10', label: 'Outubro' },
        { value: '11', label: 'Novembro' },
        { value: '12', label: 'Dezembro' }
    ];

    const anos = [];
    const currentYear = new Date().getFullYear();
    for (let i = 2023; i <= currentYear + 1; i++) {
        anos.push({ value: String(i), label: String(i) });
    }

    const carregarEntregas = useCallback(async (mes, ano) => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.motoristaVinculado.listarEntregasRealizadas(token, mes, ano);
            setResumo(data?.resumo || { total_entregas: 0, total_recebido: 0, media_por_entrega: 0, meses_trabalhados: 0 });
            setEntregas(Array.isArray(data?.entregas) ? data.entregas : []);
        } catch (err) {
            setError(err.message || 'Erro ao carregar histórico de entregas');
            console.error('Erro ao carregar entregas:', err);
            setEntregas([]);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        carregarEntregas(mesSelecionado, anoSelecionado);
    }, [mesSelecionado, anoSelecionado, carregarEntregas]);

    const limparFiltros = () => {
        setMesSelecionado('');
        setAnoSelecionado('');
    };

    const formatarData = (data) => {
        if (!data) return '-';
        try {
            return new Date(data).toLocaleDateString('pt-BR');
        } catch (e) {
            return String(data);
        }
    };

    const formatarMoeda = (valor) => {
        const num = Number(valor) || 0;
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(num);
    };

    const getAvaliacaoEstrelas = (nota) => {
        const num = Number(nota) || 0;
        if (num <= 0) return '☆☆☆☆☆';
        const estrelas = Math.min(5, Math.max(0, Math.round(num)));
        return '★'.repeat(estrelas) + '☆'.repeat(5 - estrelas);
    };

    const extrairCidadeEstado = (texto) => {
        if (!texto) return '-';
        const partes = texto.split(' - ');
        return partes.length > 1 ? partes[1] : texto;
    };

    return (
        <div className="dashboard-content">
            <div className="page-header" style={{ marginBottom: '1.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#1F2937', margin: '0 0 0.25rem 0' }}>
                        Entregas Realizadas
                    </h1>
                    <p style={{ color: '#6B7280', fontSize: '0.95rem', margin: 0 }}>
                        Histórico completo de fretes concluídos e avaliações recebidas
                    </p>
                </div>
            </div>

            {error && (
                <div style={{
                    backgroundColor: '#FEE2E2',
                    border: '1px solid #EF4444',
                    color: '#B91C1C',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    marginBottom: '1.5rem',
                    fontSize: '0.9rem'
                }}>
                    <p style={{ margin: 0 }}>{error}</p>
                </div>
            )}

            {/* CARDS DE RESUMO */}
            {resumo && <ResumoEntregas resumo={resumo} />}

            {/* BARRA DE FILTROS */}
            <div style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                padding: '1rem 1.25rem',
                border: '1px solid #E5E7EB',
                marginBottom: '1.5rem',
                display: 'flex',
                flexWrap: 'wrap',
                gap: '1rem',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#374151' }}>Filtrar por período:</span>
                    
                    <select
                        value={mesSelecionado}
                        onChange={(e) => setMesSelecionado(e.target.value)}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid #D1D5DB',
                            backgroundColor: '#F9FAFB',
                            fontSize: '0.9rem',
                            color: '#1F2937',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="">Todos os meses</option>
                        {meses.map((m) => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </select>

                    <select
                        value={anoSelecionado}
                        onChange={(e) => setAnoSelecionado(e.target.value)}
                        style={{
                            padding: '8px 12px',
                            borderRadius: '8px',
                            border: '1px solid #D1D5DB',
                            backgroundColor: '#F9FAFB',
                            fontSize: '0.9rem',
                            color: '#1F2937',
                            cursor: 'pointer'
                        }}
                    >
                        <option value="">Todos os anos</option>
                        {anos.map((a) => (
                            <option key={a.value} value={a.value}>{a.label}</option>
                        ))}
                    </select>

                    {(mesSelecionado || anoSelecionado) && (
                        <button
                            type="button"
                            onClick={limparFiltros}
                            style={{
                                padding: '8px 14px',
                                borderRadius: '8px',
                                border: '1px solid #D1D5DB',
                                backgroundColor: '#FFFFFF',
                                color: '#4B5563',
                                fontSize: '0.85rem',
                                fontWeight: '500',
                                cursor: 'pointer'
                            }}
                        >
                            Limpar Filtros
                        </button>
                    )}
                </div>

                <div style={{ fontSize: '0.85rem', color: '#6B7280' }}>
                    Total: <strong>{entregas.length}</strong> entrega(s) encontrada(s)
                </div>
            </div>

            {/* TABELA DE ENTREGAS */}
            {loading ? (
                <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    padding: '3rem',
                    textAlign: 'center',
                    border: '1px solid #E5E7EB',
                    color: '#6B7280'
                }}>
                    <p style={{ margin: 0, fontSize: '1rem' }}>Carregando histórico de entregas...</p>
                </div>
            ) : (
                <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E5E7EB',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    overflow: 'hidden'
                }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                                    <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Código</th>
                                    <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Rota</th>
                                    <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Tipo de Carga</th>
                                    <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Data Entrega</th>
                                    <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Valor</th>
                                    <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase' }}>Avaliação</th>
                                    <th style={{ padding: '14px 18px', fontSize: '0.8rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', textAlign: 'center' }}>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {entregas.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" style={{ padding: '3rem', textAlign: 'center', color: '#94A3B8' }}>
                                            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📦</div>
                                            <p style={{ margin: 0, fontWeight: '600', color: '#64748B' }}>Nenhuma entrega concluída encontrada</p>
                                            <p style={{ margin: '4px 0 0', fontSize: '0.85rem' }}>As viagens finalizadas aparecerão aqui com os valores e opções de avaliação.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    entregas.map((entrega) => {
                                        const notaMediaNum = Number(entrega.avaliacao_media) || 0;
                                        return (
                                            <tr key={entrega.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                <td style={{ padding: '14px 18px' }}>
                                                    <span style={{ fontWeight: '700', color: '#1E293B', fontSize: '0.9rem' }}>
                                                        {entrega.codigo || `FR${String(entrega.id).padStart(5, '0')}`}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '14px 18px' }}>
                                                    <div style={{ fontSize: '0.85rem', color: '#334155', fontWeight: '500' }}>
                                                        {extrairCidadeEstado(entrega.origem)} <span style={{ color: '#FF8200' }}>→</span> {extrairCidadeEstado(entrega.destino)}
                                                    </div>
                                                    {entrega.embarcador_nome && (
                                                        <div style={{ fontSize: '0.75rem', color: '#94A3B8', marginTop: '2px' }}>
                                                            Embarcador: {entrega.embarcador_nome}
                                                        </div>
                                                    )}
                                                </td>
                                                <td style={{ padding: '14px 18px', fontSize: '0.85rem', color: '#475569' }}>
                                                    {entrega.tipo_carga || '-'}
                                                </td>
                                                <td style={{ padding: '14px 18px', fontSize: '0.85rem', color: '#475569' }}>
                                                    {formatarData(entrega.data_entrega)}
                                                </td>
                                                <td style={{ padding: '14px 18px' }}>
                                                    <span style={{ fontWeight: '700', color: '#10B981', fontSize: '0.9rem' }}>
                                                        {formatarMoeda(entrega.valor)}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '14px 18px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <span style={{ color: '#F59E0B', fontSize: '1rem', letterSpacing: '1px' }}>
                                                            {getAvaliacaoEstrelas(notaMediaNum)}
                                                        </span>
                                                        {notaMediaNum > 0 && (
                                                            <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#64748B' }}>
                                                                ({notaMediaNum.toFixed(1)})
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                                                    <button
                                                        type="button"
                                                        onClick={() => setFreteAvaliar({
                                                            id: entrega.id,
                                                            codigo: entrega.codigo || `FR${String(entrega.id).padStart(5, '0')}`,
                                                            origem: entrega.origem,
                                                            destino: entrega.destino
                                                        })}
                                                        style={{
                                                            backgroundColor: '#FF8200',
                                                            color: '#FFFFFF',
                                                            border: 'none',
                                                            padding: '7px 16px',
                                                            borderRadius: '8px',
                                                            fontSize: '12px',
                                                            fontWeight: '600',
                                                            cursor: 'pointer',
                                                            transition: 'background-color 0.15s ease'
                                                        }}
                                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E67300'}
                                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FF8200'}
                                                    >
                                                        Avaliar
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* MODAL DE AVALIAÇÃO INTERATIVO */}
            <ModalAvaliacao
                isOpen={!!freteAvaliar}
                frete={freteAvaliar}
                onClose={() => setFreteAvaliar(null)}
                onSuccess={() => {
                    setFreteAvaliar(null);
                    carregarEntregas(mesSelecionado, anoSelecionado);
                }}
            />
        </div>
    );
};

export default EntregasRealizadasVinculado;
