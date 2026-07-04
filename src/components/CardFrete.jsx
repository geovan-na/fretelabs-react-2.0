// components/CardFrete.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export default function CardFrete({ frete, onFreteAtualizado }) {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const [showMenu, setShowMenu] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

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
            year: 'numeric'
        });
    };

    const extrairCidadeEstado = (endereco) => {
        if (!endereco) return '-';
        const partes = endereco.split('-');
        if (partes.length >= 2) {
            const ultimaParte = partes[partes.length - 1].trim();
            const ufMatch = ultimaParte.match(/\b([A-Z]{2})\b/);
            if (ufMatch) {
                const cidade = partes[partes.length - 2].trim();
                return `${cidade} - ${ufMatch[0]}`;
            }
            return ultimaParte;
        }
        return endereco.length > 30 ? endereco.substring(0, 30) + '...' : endereco;
    };

    const podeCancelar = ['AGUARDANDO', 'NEGOCIACAO'].includes(frete.status);

    const handleCancelar = async () => {
        try {
            await api.fretes.cancelar(frete.id, 'Cancelado pelo embarcador', token);
            setShowConfirm(false);
            setShowMenu(false);
            if (onFreteAtualizado) {
                onFreteAtualizado();
            }
        } catch (error) {
            console.error('Erro ao cancelar frete:', error);
            alert('Erro ao cancelar frete. Tente novamente.');
        }
    };

    const origem = extrairCidadeEstado(frete.origem_endereco || frete.origem_cep);
    const destino = extrairCidadeEstado(frete.destino_endereco || frete.destino_cep);

    return (
        <div className="card-frete">
            {/* CABEÇALHO */}
            <div className="card-frete-header">
                <div className="card-frete-id">
                    <span className="card-frete-id-label">Frete</span>
                    <span className="card-frete-id-value">#{frete.id}</span>
                </div>
                <div className="card-frete-actions">
                    <span className={`status-badge ${getStatusBadge(frete.status)}`}>
                        {getStatusTexto(frete.status)}
                    </span>
                    {podeCancelar && (
                        <div className="card-frete-menu-wrapper">
                            <button 
                                className="card-frete-menu-btn"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowMenu(!showMenu);
                                }}
                            >
                                ⋮
                            </button>
                            {showMenu && (
                                <div className="card-frete-menu-dropdown">
                                    <button 
                                        className="card-frete-menu-item danger"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowMenu(false);
                                            setShowConfirm(true);
                                        }}
                                    >
                                        Cancelar Frete
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* CORPO */}
            <div className="card-frete-body" onClick={() => navigate(`/dashboard/embarcador/fretes/${frete.id}`)}>
                <div className="card-frete-route">
                    <div className="route-point">
                        <span className="route-point-label">Origem</span>
                        <span className="route-point-value">{origem}</span>
                    </div>
                    <div className="route-arrow">→</div>
                    <div className="route-point">
                        <span className="route-point-label">Destino</span>
                        <span className="route-point-value">{destino}</span>
                    </div>
                </div>

                <div className="card-frete-info">
                    <div className="card-frete-info-item">
                        <span className="card-frete-info-label">Tipo</span>
                        <span className="card-frete-info-value">{frete.tipo_carga || '-'}</span>
                    </div>
                    <div className="card-frete-info-item">
                        <span className="card-frete-info-label">Peso</span>
                        <span className="card-frete-info-value">{frete.peso_kg ? `${frete.peso_kg} kg` : '-'}</span>
                    </div>
                    <div className="card-frete-info-item">
                        <span className="card-frete-info-label">Valor</span>
                        <span className="card-frete-info-value card-frete-valor">{formatarMoeda(frete.valor_ofertado)}</span>
                    </div>
                    <div className="card-frete-info-item">
                        <span className="card-frete-info-label">Coleta</span>
                        <span className="card-frete-info-value">{formatarData(frete.data_coleta_prevista)}</span>
                    </div>
                </div>
            </div>

            {/* RODAPÉ */}
            <div className="card-frete-footer">
                <span 
                    className="card-frete-link"
                    onClick={() => navigate(`/dashboard/embarcador/fretes/${frete.id}`)}
                >
                    Ver detalhes →
                </span>
            </div>

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
                            >
                                Voltar
                            </button>
                            <button 
                                className="modal-btn modal-btn-danger"
                                onClick={handleCancelar}
                            >
                                Sim, cancelar frete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}