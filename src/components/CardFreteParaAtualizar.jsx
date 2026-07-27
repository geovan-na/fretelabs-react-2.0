// src/components/vinculado/CardFreteParaAtualizar.jsx
import React, { useState } from 'react';

const CardFreteParaAtualizar = ({ frete, onAtualizar, loading }) => {
    const [observacao, setObservacao] = useState('');
    const [showObservacao, setShowObservacao] = useState(false);

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
            'ACEITO': 'status-aceito',
            'TRANSITO': 'status-transito'
        };
        return map[status] || 'status-aguardando';
    };

    const getStatusLabel = (status) => {
        const map = {
            'ACEITO': 'Aceito',
            'TRANSITO': 'Em Trânsito'
        };
        return map[status] || status;
    };

    const getProximoStatus = (status) => {
        const map = {
            'ACEITO': { label: 'Iniciar Transporte', next: 'TRANSITO' },
            'TRANSITO': { label: 'Concluir Entrega', next: 'CONCLUIDO' }
        };
        return map[status] || null;
    };

    const proximo = getProximoStatus(frete.status);

    const handleAtualizar = () => {
        if (!proximo) return;
        if (showObservacao && !observacao.trim()) {
            alert('Por favor, informe uma observação');
            return;
        }
        onAtualizar(frete.id, proximo.next, observacao);
    };

    return (
        <div className="card-frete">
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
                    <span className="card-frete-info-value card-frete-valor">{formatarMoeda(frete.valor || frete.valor_fechado)}</span>
                </div>
                <div className="card-frete-info-item">
                    <span className="card-frete-info-label">Embarcador</span>
                    <span className="card-frete-info-value">{frete.embarcador_nome || '-'}</span>
                </div>
            </div>

            {/* Observação */}
            <div className="card-frete-observacao">
                <button 
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowObservacao(!showObservacao)}
                    type="button"
                >
                    {showObservacao ? 'Ocultar Observação' : 'Adicionar Observação'}
                </button>
                {showObservacao && (
                    <textarea
                        className="form-textarea"
                        placeholder="Descreva a situação (ex: saiu para coleta, entregue com sucesso, etc.)"
                        value={observacao}
                        onChange={(e) => setObservacao(e.target.value)}
                        rows={2}
                        style={{ marginTop: '0.5rem' }}
                    />
                )}
            </div>

            {/* Ações */}
            {proximo && (
                <div className="card-frete-actions">
                    <button
                        className="btn btn-primary"
                        onClick={handleAtualizar}
                        disabled={loading}
                    >
                        {loading ? 'Processando...' : proximo.label}
                    </button>
                </div>
            )}
        </div>
    );
};

export default CardFreteParaAtualizar;