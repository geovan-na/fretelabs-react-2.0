// src/pages/admin/AdminDetalheFrete.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import StatusBadgeAdmin from '../components/StatusBadgeAdmin';
import ModalConfirmacao from '../components/ModalConfirmacao';

const AdminDetalheFrete = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    
    const [frete, setFrete] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        detail: '',
        confirmText: 'Confirmar',
        onConfirm: null,
        isLoading: false
    });

    useEffect(() => {
        carregarFrete();
    }, [id]);

    const carregarFrete = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.admin.buscarFrete(id, token);
            if (response.success) {
                setFrete(response.data);
            } else {
                setError(response.message || 'Erro ao carregar frete');
            }
        } catch (err) {
            setError(err.message || 'Erro ao carregar frete');
        } finally {
            setLoading(false);
        }
    };

    const formatarData = (data) => {
        if (!data) return '-';
        return new Date(data).toLocaleDateString('pt-BR');
    };

    const formatarDataHora = (data) => {
        if (!data) return '-';
        return new Date(data).toLocaleString('pt-BR');
    };

    const formatarMoeda = (valor) => {
        if (!valor) return 'R$ 0,00';
        return `R$ ${Number(valor).toFixed(2).replace('.', ',')}`;
    };

    const handleVoltar = () => {
        navigate('/admin/fretes');
    };

    const handleCancelarFrete = () => {
        setModal({
            isOpen: true,
            title: 'Cancelar Frete',
            message: `Tem certeza que deseja cancelar o frete #${frete?.id}?`,
            detail: `Origem: ${frete?.origem_endereco || 'N/A'} → Destino: ${frete?.destino_endereco || 'N/A'}`,
            confirmText: 'Cancelar Frete',
            onConfirm: confirmarCancelamento,
            isLoading: false
        });
    };

    const confirmarCancelamento = async () => {
        try {
            setModal(prev => ({ ...prev, isLoading: true }));
            const response = await api.admin.cancelarFrete(id, 'Cancelado pelo administrador', token);
            if (response.success) {
                setModal(prev => ({ ...prev, isOpen: false }));
                carregarFrete();
            } else {
                setModal(prev => ({ 
                    ...prev, 
                    isLoading: false,
                    message: response.message || 'Erro ao cancelar frete'
                }));
            }
        } catch (err) {
            setModal(prev => ({ 
                ...prev, 
                isLoading: false,
                message: err.message || 'Erro ao cancelar frete'
            }));
        }
    };

    const fecharModal = () => {
        setModal(prev => ({ ...prev, isOpen: false }));
    };

    if (loading) {
        return (
            <div className="detalhe-frete-loading">
                <p>Carregando dados do frete...</p>
            </div>
        );
    }

    if (error || !frete) {
        return (
            <div className="detalhe-frete-error">
                <p>{error || 'Frete não encontrado'}</p>
                <button className="btn btn-primary" onClick={handleVoltar}>
                    Voltar para lista
                </button>
            </div>
        );
    }

    return (
        <div className="detalhe-frete-container">
            <div className="detalhe-frete-header">
                <button className="btn-voltar" onClick={handleVoltar}>
                    ← Voltar
                </button>
                <h1>Detalhes do Frete #{frete.id}</h1>
                {frete.codigo_rastreamento && (
                    <span className="codigo-rastreamento">
                        Código: {frete.codigo_rastreamento}
                    </span>
                )}
            </div>

            <div className="detalhe-frete-grid">
                {/* Informações Gerais */}
                <div className="detalhe-frete-section">
                    <h3>Informações Gerais</h3>
                    <div className="detalhe-frete-field">
                        <span className="label">Status</span>
                        <span className="value">
                            <StatusBadgeAdmin status={frete.status} type="frete" />
                        </span>
                    </div>
                    <div className="detalhe-frete-field">
                        <span className="label">Prioridade</span>
                        <span className="value">{frete.prioridade || 'NORMAL'}</span>
                    </div>
                    <div className="detalhe-frete-field">
                        <span className="label">Tipo de Carga</span>
                        <span className="value">{frete.tipo_carga || '-'}</span>
                    </div>
                    <div className="detalhe-frete-field">
                        <span className="label">Peso</span>
                        <span className="value">{frete.peso_kg ? `${frete.peso_kg} kg` : '-'}</span>
                    </div>
                    <div className="detalhe-frete-field">
                        <span className="label">Volume</span>
                        <span className="value">{frete.volume_m3 ? `${frete.volume_m3} m³` : '-'}</span>
                    </div>
                    <div className="detalhe-frete-field">
                        <span className="label">Pallets</span>
                        <span className="value">{frete.pallets || '-'}</span>
                    </div>
                </div>

                {/* Valores */}
                <div className="detalhe-frete-section">
                    <h3>Valores</h3>
                    <div className="detalhe-frete-field">
                        <span className="label">Valor Ofertado</span>
                        <span className="value destaque">{formatarMoeda(frete.valor_ofertado)}</span>
                    </div>
                    <div className="detalhe-frete-field">
                        <span className="label">Valor Fechado</span>
                        <span className="value destaque">{formatarMoeda(frete.valor_fechado)}</span>
                    </div>
                    <div className="detalhe-frete-field">
                        <span className="label">Comissão</span>
                        <span className="value">{formatarMoeda(frete.valor_comissao)}</span>
                    </div>
                    <div className="detalhe-frete-field">
                        <span className="label">Adiantamento</span>
                        <span className="value">{formatarMoeda(frete.valor_adiantamento)}</span>
                    </div>
                </div>

                {/* Rotas */}
                <div className="detalhe-frete-section">
                    <h3>Origem</h3>
                    <div className="detalhe-frete-field">
                        <span className="label">CEP</span>
                        <span className="value">{frete.origem_cep || '-'}</span>
                    </div>
                    <div className="detalhe-frete-field">
                        <span className="label">Endereço</span>
                        <span className="value">{frete.origem_endereco || '-'}</span>
                    </div>
                </div>

                <div className="detalhe-frete-section">
                    <h3>Destino</h3>
                    <div className="detalhe-frete-field">
                        <span className="label">CEP</span>
                        <span className="value">{frete.destino_cep || '-'}</span>
                    </div>
                    <div className="detalhe-frete-field">
                        <span className="label">Endereço</span>
                        <span className="value">{frete.destino_endereco || '-'}</span>
                    </div>
                </div>

                {/* Datas */}
                <div className="detalhe-frete-section">
                    <h3>Datas</h3>
                    <div className="detalhe-frete-field">
                        <span className="label">Publicação</span>
                        <span className="value">{formatarDataHora(frete.data_publicacao)}</span>
                    </div>
                    <div className="detalhe-frete-field">
                        <span className="label">Coleta Prevista</span>
                        <span className="value">{formatarDataHora(frete.data_coleta_prevista)}</span>
                    </div>
                    <div className="detalhe-frete-field">
                        <span className="label">Coleta Realizada</span>
                        <span className="value">{formatarDataHora(frete.data_coleta_realizada)}</span>
                    </div>
                    <div className="detalhe-frete-field">
                        <span className="label">Entrega Prevista</span>
                        <span className="value">{formatarDataHora(frete.data_entrega_prevista)}</span>
                    </div>
                    <div className="detalhe-frete-field">
                        <span className="label">Entrega Realizada</span>
                        <span className="value">{formatarDataHora(frete.data_entrega_realizada)}</span>
                    </div>
                </div>

                {/* Responsáveis */}
                <div className="detalhe-frete-section">
                    <h3>Responsáveis</h3>
                    <div className="detalhe-frete-field">
                        <span className="label">Embarcador</span>
                        <span className="value">
                            {frete.embarcador?.nome_razao_social || '-'}
                            {frete.embarcador?.email && (
                                <small className="email-small">{frete.embarcador.email}</small>
                            )}
                        </span>
                    </div>
                    <div className="detalhe-frete-field">
                        <span className="label">Transportador</span>
                        <span className="value">
                            {frete.transportador?.nome_razao_social || '-'}
                            {frete.transportador?.email && (
                                <small className="email-small">{frete.transportador.email}</small>
                            )}
                        </span>
                    </div>
                    <div className="detalhe-frete-field">
                        <span className="label">Veículo</span>
                        <span className="value">
                            {frete.veiculo?.placa || '-'}
                            {frete.veiculo?.modelo && ` (${frete.veiculo.modelo})`}
                        </span>
                    </div>
                </div>

                {/* Descrição e Instruções */}
                {frete.descricao_carga && (
                    <div className="detalhe-frete-section full-width">
                        <h3>Descrição da Carga</h3>
                        <p className="descricao-texto">{frete.descricao_carga}</p>
                    </div>
                )}

                {frete.instrucoes_descarga && (
                    <div className="detalhe-frete-section full-width">
                        <h3>Instruções de Descarga</h3>
                        <p className="descricao-texto">{frete.instrucoes_descarga}</p>
                    </div>
                )}

                {frete.motivo_cancelamento && (
                    <div className="detalhe-frete-section full-width">
                        <h3>Motivo do Cancelamento</h3>
                        <p className="descricao-texto cancelado">{frete.motivo_cancelamento}</p>
                    </div>
                )}

                {/* Ações */}
                {frete.status !== 'CANCELADO' && frete.status !== 'CONCLUIDO' && (
                    <div className="detalhe-frete-actions full-width">
                        <button className="btn btn-danger" onClick={handleCancelarFrete}>
                            Cancelar Frete
                        </button>
                    </div>
                )}
            </div>

            <ModalConfirmacao
                isOpen={modal.isOpen}
                onClose={fecharModal}
                onConfirm={modal.onConfirm}
                title={modal.title}
                message={modal.message}
                detail={modal.detail}
                confirmText={modal.confirmText}
                cancelText="Cancelar"
                type="danger"
                isLoading={modal.isLoading}
            />
        </div>
    );
};

export default AdminDetalheFrete;