// src/components/vinculado/CardFreteVinculado.jsx
import React from 'react';

const CardFreteVinculado = ({ frete, onClick }) => {
    const formatarData = (data) => {
        if (!data) return '-';
        return new Date(data).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatarMoeda = (valor) => {
        if (!valor) return '-';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    };

    const getStatusClasse = (status) => {
        const map = {
            'AGUARDANDO': 'status-aguardando',
            'NEGOCIACAO': 'status-negociacao',
            'ACEITO': 'status-aceito',
            'TRANSITO': 'status-transito',
            'CONCLUIDO': 'status-concluido',
            'CANCELADO': 'status-cancelado'
        };
        return map[status] || 'status-aguardando';
    };

    const getStatusLabel = (status) => {
        const map = {
            'AGUARDANDO': 'Aguardando',
            'NEGOCIACAO': 'Negociação',
            'ACEITO': 'Aceito',
            'TRANSITO': 'Em Trânsito',
            'CONCLUIDO': 'Concluído',
            'CANCELADO': 'Cancelado'
        };
        return map[status] || status;
    };

    return (
        <div className="card-frete" onClick={() => onClick && onClick(frete)}>
            <div className="card-frete-header">
                <div className="card-frete-id">
                    <span className="card-frete-id-label">Frete</span>
                    <span className="card-frete-id-value">{frete.codigo || `FR${String(frete.id).padStart(5, '0')}`}</span>
                </div>
                <span className={`status-badge ${getStatusClasse(frete.status)}`}>
                    {getStatusLabel(frete.status)}
                </span>
            </div>

            <div className="card-frete-route">
                <div className="route-point">
                    <span className="route-point-label">Origem</span>
                    <span className="route-point-value">{frete.origem || frete.origem_endereco || '-'}</span>
                </div>
                <span className="route-arrow">→</span>
                <div className="route-point">
                    <span className="route-point-label">Destino</span>
                    <span className="route-point-value">{frete.destino || frete.destino_endereco || '-'}</span>
                </div>
            </div>

            <div className="card-frete-info">
                <div className="card-frete-info-item">
                    <span className="card-frete-info-label">Data Coleta</span>
                    <span className="card-frete-info-value">{formatarData(frete.data_coleta_prevista)}</span>
                </div>
                <div className="card-frete-info-item">
                    <span className="card-frete-info-label">Tipo de Carga</span>
                    <span className="card-frete-info-value">{frete.tipo_carga || '-'}</span>
                </div>
                <div className="card-frete-info-item">
                    <span className="card-frete-info-label">Valor</span>
                    <span className="card-frete-info-value card-frete-valor">{formatarMoeda(frete.valor_fechado || frete.valor_ofertado)}</span>
                </div>
                <div className="card-frete-info-item">
                    <span className="card-frete-info-label">Embarcador</span>
                    <span className="card-frete-info-value">{frete.embarcador_nome || '-'}</span>
                </div>
            </div>

            <div className="card-frete-footer">
                <span className="card-frete-link">Ver detalhes →</span>
            </div>
        </div>
    );
};

export default CardFreteVinculado;