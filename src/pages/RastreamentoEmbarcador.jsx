import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import TimelineFrete from '../components/TimelineFrete';

const RastreamentoEmbarcador = () => {
    const [fretes, setFretes] = useState([]);
    const [selectedFrete, setSelectedFrete] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = localStorage.getItem('token');

    const carregarFretes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.embarcador.listarRastreamento(token);
            const listaFretes = Array.isArray(response) 
                ? response 
                : (response?.data || response?.fretes || []);

            setFretes(listaFretes);

            if (listaFretes.length > 0) {
                setSelectedFrete(listaFretes[0]);
            } else {
                setSelectedFrete(null);
            }
        } catch (err) {
            setError(err.message || 'Erro ao carregar rastreamento');
            console.error('Erro ao carregar rastreamento:', err);
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
            'AGUARDANDO': 'Aguardando',
            'ACEITO': 'Frete Aceito',
            'TRANSITO': 'Em Trânsito',
            'CONCLUIDO': 'Concluído',
            'CANCELADO': 'Cancelado'
        };
        return map[status] || status;
    };

    const formatarMoeda = (valor) => {
        const num = Number(valor) || 0;
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
    };

    return (
        <div className="dashboard-content">
            <div className="page-header" style={{ marginBottom: '1.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#1F2937', margin: '0 0 0.25rem 0' }}>
                        Rastreamento de Cargas
                    </h1>
                    <p style={{ color: '#6B7280', fontSize: '0.95rem', margin: 0 }}>
                        Acompanhe o transporte das suas cargas e a frota responsável em tempo real
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

            {loading ? (
                <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    padding: '3rem',
                    textAlign: 'center',
                    border: '1px solid #E5E7EB',
                    color: '#6B7280'
                }}>
                    <p style={{ margin: 0 }}>Carregando cargas em transporte...</p>
                </div>
            ) : (!Array.isArray(fretes) || fretes.length === 0) ? (
                <div style={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    padding: '3rem',
                    textAlign: 'center',
                    border: '1px solid #E5E7EB',
                    color: '#64748B'
                }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🚚</div>
                    <p style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1E293B', margin: '0 0 4px 0' }}>
                        Nenhum frete em transporte no momento
                    </p>
                    <p style={{ fontSize: '0.9rem', color: '#64748B', margin: 0 }}>
                        Seus fretes aceitos ou em trânsito com as frotas parceiras aparecerão aqui.
                    </p>
                </div>
            ) : (
                <>
                    {/* SELETOR DE FRETE */}
                    <div style={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '12px',
                        padding: '1.25rem',
                        border: '1px solid #E5E7EB',
                        marginBottom: '1.5rem',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}>
                        <label htmlFor="frete-select" style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '8px', fontSize: '0.9rem' }}>
                            Selecione a carga para rastrear:
                        </label>
                        <select
                            id="frete-select"
                            value={selectedFrete?.id || ''}
                            onChange={(e) => handleSelectFrete(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px 14px',
                                borderRadius: '8px',
                                border: '1px solid #D1D5DB',
                                backgroundColor: '#F9FAFB',
                                fontSize: '0.95rem',
                                color: '#1F2937',
                                cursor: 'pointer'
                            }}
                        >
                            {fretes.map((frete) => (
                                <option key={frete.id} value={frete.id}>
                                    {frete.codigo || `FR${String(frete.id).padStart(5, '0')}`} — {frete.origem} → {frete.destino} ({getStatusLabel(frete.status)})
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedFrete && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* CARD DE DETALHES DA FROTA RESPONSÁVEL */}
                            <div style={{
                                backgroundColor: '#FFFFFF',
                                borderRadius: '12px',
                                border: '1px solid #E5E7EB',
                                padding: '1.5rem',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #F1F5F9', paddingBottom: '1rem', marginBottom: '1rem' }}>
                                    <div>
                                        <span style={{
                                            fontSize: '0.75rem',
                                            fontWeight: '700',
                                            textTransform: 'uppercase',
                                            letterSpacing: '0.5px',
                                            color: '#FF8200',
                                            backgroundColor: '#FFF7ED',
                                            padding: '4px 8px',
                                            borderRadius: '6px'
                                        }}>
                                            Frota Contratada
                                        </span>
                                        <h2 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#1E293B', margin: '8px 0 2px 0' }}>
                                            {selectedFrete.frota_nome || 'Aguardando definição'}
                                        </h2>
                                        {selectedFrete.frota_rntrc && (
                                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>
                                                Registro RNTRC: <strong>{selectedFrete.frota_rntrc}</strong>
                                            </p>
                                        )}
                                    </div>

                                    <div style={{ textAlign: 'right' }}>
                                        <span className={`status-badge status-${(selectedFrete.status || '').toLowerCase()}`}>
                                            {getStatusLabel(selectedFrete.status)}
                                        </span>
                                        <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#10B981', marginTop: '6px' }}>
                                            {formatarMoeda(selectedFrete.valor)}
                                        </div>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                                    <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px' }}>
                                        <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Veículo Designado</span>
                                        <strong style={{ fontSize: '0.9rem', color: '#1E293B' }}>
                                            {selectedFrete.veiculo_modelo ? `${selectedFrete.veiculo_modelo} (${selectedFrete.veiculo_placa})` : 'Pendente de atribuição'}
                                        </strong>
                                    </div>

                                    <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px' }}>
                                        <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Contato da Transportadora</span>
                                        <strong style={{ fontSize: '0.9rem', color: '#1E293B' }}>
                                            {selectedFrete.frota_telefone || selectedFrete.frota_email || 'Não informado'}
                                        </strong>
                                    </div>

                                    <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px' }}>
                                        <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Tipo de Carga</span>
                                        <strong style={{ fontSize: '0.9rem', color: '#1E293B' }}>
                                            {selectedFrete.tipo_carga || 'Geral'}
                                        </strong>
                                    </div>

                                    <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px' }}>
                                        <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Código de Rastreamento</span>
                                        <strong style={{ fontSize: '0.9rem', color: '#2563EB' }}>
                                            {selectedFrete.codigo_rastreamento || selectedFrete.codigo || `FLB-${selectedFrete.id}`}
                                        </strong>
                                    </div>
                                </div>
                            </div>

                            {/* LINHA DO TEMPO */}
                            <div className="rastreamento-timeline">
                                <TimelineFrete frete={selectedFrete} />
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default RastreamentoEmbarcador;
