// pages/DetalheFrete.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function DetalheFrete() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [frete, setFrete] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [cancelando, setCancelando] = useState(false);

    const token = localStorage.getItem('token');

    useEffect(() => {
        carregarDetalhes();
    }, [id]);

    const carregarDetalhes = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.fretes.buscar(id, token);
            setFrete(response.data);
        } catch (err) {
            console.error('Erro ao carregar detalhes:', err);
            setError('Erro ao carregar detalhes do frete.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelar = async () => {
        setCancelando(true);
        try {
            await api.fretes.cancelar(id, 'Cancelado pelo embarcador', token);
            setShowConfirm(false);
            navigate('/dashboard/embarcador/fretes');
        } catch (error) {
            console.error('Erro ao cancelar frete:', error);
            alert('Erro ao cancelar frete. Tente novamente.');
            setCancelando(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'AGUARDANDO': 'status-aguardando',
            'NEGOCIACAO': 'status-negociacao',
            'ACEITO': 'status-aceito',
            'TRANSITO': 'status-transito',
            'CONCLUIDO': 'status-concluido',
            'CANCELADO': 'status-cancelado'
        };
        return statusMap[status] || '';
    };

    const getStatusTexto = (status) => {
        const statusMap = {
            'AGUARDANDO': 'Aguardando',
            'NEGOCIACAO': 'Negociação',
            'ACEITO': 'Aceito',
            'TRANSITO': 'Em Trânsito',
            'CONCLUIDO': 'Concluído',
            'CANCELADO': 'Cancelado'
        };
        return statusMap[status] || status;
    };

    const formatarMoeda = (valor) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor || 0);
    };

    const formatarData = (data) => {
        if (!data) return '-';
        return new Date(data).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const podeCancelar = frete && ['AGUARDANDO', 'NEGOCIACAO'].includes(frete.status);

    if (loading) {
        return (
            <div className="detalhe-frete-loading">
                <p>Carregando detalhes do frete...</p>
            </div>
        );
    }

    if (error || !frete) {
        return (
            <div className="detalhe-frete-error">
                <p>{error || 'Frete não encontrado'}</p>
                <button 
                    onClick={() => navigate('/dashboard/embarcador/fretes')} 
                    className="btn btn-primary"
                >
                    Voltar para Meus Fretes
                </button>
            </div>
        );
    }

    return (
        <div className="detalhe-frete-container">
            {/* CABEÇALHO */}
            <div className="detalhe-frete-header">
                <button 
                    className="detalhe-frete-voltar"
                    onClick={() => navigate('/dashboard/embarcador/fretes')}
                >
                    ← Voltar
                </button>
                <div className="detalhe-frete-titulo">
                    <h1>Frete #{frete.id}</h1>
                    <span className={`status-badge ${getStatusBadge(frete.status)}`}>
                        {getStatusTexto(frete.status)}
                    </span>
                </div>
            </div>

            {/* INFORMAÇÕES DO FRETE */}
            <div className="detalhe-frete-grid">
                {/* ORIGEM */}
                <div className="detalhe-frete-section">
                    <h3>Origem</h3>
                    <div className="detalhe-frete-field">
                        <span className="detalhe-frete-label">CEP</span>
                        <span className="detalhe-frete-value">{frete.origem_cep || '-'}</span>
                    </div>
                    <div className="detalhe-frete-field">
                        <span className="detalhe-frete-label">Endereço</span>
                        <span className="detalhe-frete-value">{frete.origem_endereco || '-'}</span>
                    </div>
                </div>

                {/* DESTINO */}
                <div className="detalhe-frete-section">
                    <h3>Destino</h3>
                    <div className="detalhe-frete-field">
                        <span className="detalhe-frete-label">CEP</span>
                        <span className="detalhe-frete-value">{frete.destino_cep || '-'}</span>
                    </div>
                    <div className="detalhe-frete-field">
                        <span className="detalhe-frete-label">Endereço</span>
                        <span className="detalhe-frete-value">{frete.destino_endereco || '-'}</span>
                    </div>
                </div>

                {/* CARGA */}
                <div className="detalhe-frete-section">
                    <h3>Carga</h3>
                    <div className="detalhe-frete-field">
                        <span className="detalhe-frete-label">Tipo</span>
                        <span className="detalhe-frete-value">{frete.tipo_carga || '-'}</span>
                    </div>
                    <div className="detalhe-frete-field">
                        <span className="detalhe-frete-label">Descrição</span>
                        <span className="detalhe-frete-value">{frete.descricao_carga || '-'}</span>
                    </div>
                    <div className="detalhe-frete-field">
                        <span className="detalhe-frete-label">Peso</span>
                        <span className="detalhe-frete-value">{frete.peso_kg ? `${frete.peso_kg} kg` : '-'}</span>
                    </div>
                    <div className="detalhe-frete-field">
                        <span className="detalhe-frete-label">Volume</span>
                        <span className="detalhe-frete-value">{frete.volume_m3 ? `${frete.volume_m3} m³` : '-'}</span>
                    </div>
                    <div className="detalhe-frete-field">
                        <span className="detalhe-frete-label">Pallets</span>
                        <span className="detalhe-frete-value">{frete.pallets || '-'}</span>
                    </div>
                </div>

                {/* VALORES */}
                <div className="detalhe-frete-section">
                    <h3>Valores</h3>
                    <div className="detalhe-frete-field">
                        <span className="detalhe-frete-label">Valor Ofertado</span>
                        <span className="detalhe-frete-value detalhe-frete-destaque">{formatarMoeda(frete.valor_ofertado)}</span>
                    </div>
                    <div className="detalhe-frete-field">
                        <span className="detalhe-frete-label">Valor Fechado</span>
                        <span className="detalhe-frete-value">{formatarMoeda(frete.valor_fechado)}</span>
                    </div>
                </div>

                {/* DATAS */}
                <div className="detalhe-frete-section">
                    <h3>Datas</h3>
                    <div className="detalhe-frete-field">
                        <span className="detalhe-frete-label">Publicação</span>
                        <span className="detalhe-frete-value">{formatarData(frete.data_publicacao)}</span>
                    </div>
                    <div className="detalhe-frete-field">
                        <span className="detalhe-frete-label">Coleta Prevista</span>
                        <span className="detalhe-frete-value">{formatarData(frete.data_coleta_prevista)}</span>
                    </div>
                    <div className="detalhe-frete-field">
                        <span className="detalhe-frete-label">Entrega Prevista</span>
                        <span className="detalhe-frete-value">{formatarData(frete.data_entrega_prevista)}</span>
                    </div>
                    <div className="detalhe-frete-field">
                        <span className="detalhe-frete-label">Limite Candidatura</span>
                        <span className="detalhe-frete-value">{formatarData(frete.data_limite_candidatura) || '-'}</span>
                    </div>
                </div>

                {/* INFORMAÇÕES ADICIONAIS */}
                <div className="detalhe-frete-section">
                    <h3>Informações Adicionais</h3>
                    <div className="detalhe-frete-field">
                        <span className="detalhe-frete-label">Prioridade</span>
                        <span className="detalhe-frete-value">{frete.prioridade || 'NORMAL'}</span>
                    </div>
                    <div className="detalhe-frete-field">
                        <span className="detalhe-frete-label">Responsável Descarga</span>
                        <span className="detalhe-frete-value">{frete.responsavel_descarga || '-'}</span>
                    </div>
                    <div className="detalhe-frete-field">
                        <span className="detalhe-frete-label">Instruções Descarga</span>
                        <span className="detalhe-frete-value">{frete.instrucoes_descarga || '-'}</span>
                    </div>
                    {frete.motivo_cancelamento && (
                        <div className="detalhe-frete-field">
                            <span className="detalhe-frete-label">Motivo Cancelamento</span>
                            <span className="detalhe-frete-value detalhe-frete-cancelado">{frete.motivo_cancelamento}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* BOTÃO DE CANCELAR */}
            {podeCancelar && (
                <div className="detalhe-frete-actions">
                    <button 
                        className="btn btn-danger"
                        onClick={() => setShowConfirm(true)}
                    >
                        Cancelar Frete
                    </button>
                </div>
            )}

            {/* MODAL DE CONFIRMAÇÃO */}
            {showConfirm && (
                <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Cancelar Frete</h3>
                        <p>Tem certeza que deseja cancelar o frete <strong>#{frete.id}</strong>?</p>
                        <p className="modal-aviso">Esta ação não pode ser desfeita.</p>
                        <div className="modal-buttons">
                            <button 
                                className="modal-btn modal-btn-secondary"
                                onClick={() => setShowConfirm(false)}
                                disabled={cancelando}
                            >
                                Voltar
                            </button>
                            <button 
                                className="modal-btn modal-btn-danger"
                                onClick={handleCancelar}
                                disabled={cancelando}
                            >
                                {cancelando ? 'Cancelando...' : 'Sim, cancelar frete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}