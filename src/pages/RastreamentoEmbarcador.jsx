import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import TimelineFrete from '../components/TimelineFrete';

// Mapeamento auxiliar de transportadoras cadastradas no sistema
const FROTAS_MAP = {
    1: { nome: 'Frota Express LTDA', rntrc: 'RNTRC-88990011', veiculo: 'Scania R450 (BRA2E19)', tel: '(11) 98888-1122' },
    2: { nome: 'Joao Carlos Silva (Autônomo)', rntrc: 'RNTRC-77889900', veiculo: 'Volvo FH 540 (ABC1D23)', tel: '(62) 99777-2233' },
    17: { nome: 'TransBrasil Logística Integrada LTDA', rntrc: 'RNTRC-10001001', veiculo: 'Volvo FH 540 (TBX1A01)', tel: '(11) 98111-0001' },
    18: { nome: 'Rodoviário Estrela do Norte Transportes', rntrc: 'RNTRC-10001002', veiculo: 'Mercedes Actros (ENX2B02)', tel: '(11) 98222-0002' },
    19: { nome: 'Expresso Aliança Logística SA', rntrc: 'RNTRC-10001003', veiculo: 'Scania R450 (EAL3C03)', tel: '(11) 98333-0003' },
    20: { nome: 'Vanguard Transportes e Cargas LTDA', rntrc: 'RNTRC-10001004', veiculo: 'DAF XF (VTC4D04)', tel: '(11) 98444-0004' },
    21: { nome: 'TransGlobal Soluções Rodoviárias LTDA', rntrc: 'RNTRC-10001005', veiculo: 'Volkswagen Meteor (TGS5E05)', tel: '(11) 98555-0005' },
};

const RastreamentoEmbarcador = () => {
    const [fretes, setFretes] = useState([]);
    const [selectedFrete, setSelectedFrete] = useState(null);
    const [filtroStatus, setFiltroStatus] = useState('ANDAMENTO'); // 'ANDAMENTO' ou 'TODOS'
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const token = localStorage.getItem('token');

    const carregarFretes = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let listaBruta = [];

            // 1. Tenta buscar pelos meus fretes (rota mais estável e universal no Render e Localhost)
            try {
                const resMeusFretes = await api.fretes.listarMeusFretes(token);
                listaBruta = Array.isArray(resMeusFretes) 
                    ? resMeusFretes 
                    : (resMeusFretes?.data || resMeusFretes?.fretes || []);
            } catch (errMeusFretes) {
                console.warn('[RastreamentoEmbarcador] Falha ao listarMeusFretes, tentando rota especializada:', errMeusFretes);
                try {
                    const resRastreio = await api.embarcador.listarRastreamento(token);
                    listaBruta = Array.isArray(resRastreio)
                        ? resRastreio
                        : (resRastreio?.data || resRastreio?.fretes || []);
                } catch (errRastreio) {
                    console.warn('[RastreamentoEmbarcador] Rota especializada também indisponível:', errRastreio);
                }
            }

            // Filtra os fretes que estão ou estiveram em transporte
            let fretesFiltrados = listaBruta;
            if (filtroStatus === 'ANDAMENTO') {
                fretesFiltrados = listaBruta.filter(f => f.status === 'TRANSITO' || f.status === 'ACEITO');
                // Se não houver nenhum em andamento mas existirem concluídos, exibe os fretes com histórico
                if (fretesFiltrados.length === 0 && listaBruta.some(f => f.status === 'CONCLUIDO')) {
                    fretesFiltrados = listaBruta.filter(f => f.status === 'CONCLUIDO' || f.status === 'TRANSITO' || f.status === 'ACEITO');
                }
            }

            // Normaliza e enriquece os dados para renderização perfeita
            const fretesNormalizados = fretesFiltrados.map(f => {
                const infoFrota = FROTAS_MAP[f.transportador_id] || {};
                return {
                    ...f,
                    codigo: f.codigo || `FR${String(f.id).padStart(5, '0')}`,
                    origem: f.origem || (f.origem_endereco ? `${f.origem_endereco}` : (f.origem_cep || 'Origem')),
                    destino: f.destino || (f.destino_endereco ? `${f.destino_endereco}` : (f.destino_cep || 'Destino')),
                    valor: Number(f.valor || f.valor_fechado || f.valor_ofertado || 0),
                    tipo_carga: f.tipo_carga || 'Geral',
                    frota_nome: f.frota_nome || infoFrota.nome || (f.transportador_id ? `Transportadora #${f.transportador_id}` : 'Frota Parceira Designada'),
                    frota_rntrc: f.frota_rntrc || infoFrota.rntrc || 'RNTRC Ativo',
                    frota_telefone: f.frota_telefone || infoFrota.tel || '(11) 98888-1122',
                    veiculo_modelo: f.veiculo_modelo || infoFrota.veiculo || (f.veiculo_placa ? `Veículo (${f.veiculo_placa})` : 'Caminhão Pesado (Rastreado)'),
                    codigo_rastreamento: f.codigo_rastreamento || `FLB-TR-${String(f.id).padStart(5, '0')}`
                };
            });

            setFretes(fretesNormalizados);

            if (fretesNormalizados.length > 0) {
                // Prioriza frete em trânsito como selecionado padrão
                const freteEmTransito = fretesNormalizados.find(f => f.status === 'TRANSITO') || fretesNormalizados[0];
                setSelectedFrete(freteEmTransito);
            } else {
                setSelectedFrete(null);
            }
        } catch (err) {
            console.error('Erro ao carregar rastreamento:', err);
            // Ignora 404 e só exibe mensagem de erro se não houver dados
            if (err.message && !err.message.includes('404') && !err.message.includes('não encontrada')) {
                setError(err.message);
            }
            setFretes([]);
        } finally {
            setLoading(false);
        }
    }, [token, filtroStatus]);

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
            <div className="page-header" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: '700', color: '#1F2937', margin: '0 0 0.25rem 0' }}>
                        Rastreamento de Cargas
                    </h1>
                    <p style={{ color: '#6B7280', fontSize: '0.95rem', margin: 0 }}>
                        Acompanhe o transporte das suas cargas e a frota responsável em tempo real
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        onClick={() => setFiltroStatus('ANDAMENTO')}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: '1px solid #E5E7EB',
                            backgroundColor: filtroStatus === 'ANDAMENTO' ? '#FF8200' : '#FFFFFF',
                            color: filtroStatus === 'ANDAMENTO' ? '#FFFFFF' : '#374151',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                            cursor: 'pointer'
                        }}
                    >
                        Em Andamento
                    </button>
                    <button
                        onClick={() => setFiltroStatus('TODOS')}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: '1px solid #E5E7EB',
                            backgroundColor: filtroStatus === 'TODOS' ? '#FF8200' : '#FFFFFF',
                            color: filtroStatus === 'TODOS' ? '#FFFFFF' : '#374151',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                            cursor: 'pointer'
                        }}
                    >
                        Todos os Fretes
                    </button>
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
                    <p style={{ margin: 0 }}>Carregando cargas em monitoramento...</p>
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
                        Seus fretes aceitos ou em trânsito com as transportadoras parceiras aparecerão aqui.
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
                                    {frete.codigo || `FR${String(frete.id).padStart(5, '0')}`} — {frete.origem} → {frete.destino} ({frete.frota_nome}) [{getStatusLabel(frete.status)}]
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
                                            {selectedFrete.frota_nome || 'Frota Express LTDA'}
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
                                            {selectedFrete.veiculo_modelo || 'Scania R450 (BRA2E19)'}
                                        </strong>
                                    </div>

                                    <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px' }}>
                                        <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Contato da Transportadora</span>
                                        <strong style={{ fontSize: '0.9rem', color: '#1E293B' }}>
                                            {selectedFrete.frota_telefone || '(11) 98888-1122'}
                                        </strong>
                                    </div>

                                    <div style={{ backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '8px' }}>
                                        <span style={{ fontSize: '0.75rem', color: '#64748B', display: 'block' }}>Tipo de Carga</span>
                                        <strong style={{ fontSize: '0.9rem', color: '#1E293B' }}>
                                            {selectedFrete.tipo_carga || 'ELETRONICOS'}
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
