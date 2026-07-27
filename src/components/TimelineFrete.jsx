// src/components/vinculado/TimelineFrete.jsx
import React from 'react';

const TimelineFrete = ({ frete }) => {
    if (!frete) return null;

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

    const getStatusIcon = (status) => {
        const map = {
            'ACEITO': '📋',
            'TRANSITO': '🚛',
            'CONCLUIDO': '✅',
            'CANCELADO': '❌'
        };
        return map[status] || '📌';
    };

    const getStatusLabel = (status) => {
        const map = {
            'ACEITO': 'Frete Aceito',
            'TRANSITO': 'Em Trânsito',
            'CONCLUIDO': 'Concluído',
            'CANCELADO': 'Cancelado'
        };
        return map[status] || status;
    };

    // Construir timeline a partir do histórico ou dos dados do frete
    const construirTimeline = () => {
        const timeline = [];

        // Se tiver histórico, usar ele
        if (frete.historico_status && frete.historico_status.length > 0) {
            frete.historico_status.forEach((item) => {
                timeline.push({
                    status: item.status_novo,
                    data: item.data_mudanca,
                    observacao: item.observacao
                });
            });
        } else {
            // Se não tiver histórico, construir a partir dos dados do frete
            if (frete.status === 'ACEITO' || frete.status === 'TRANSITO' || frete.status === 'CONCLUIDO') {
                timeline.push({
                    status: 'ACEITO',
                    data: frete.data_coleta_prevista,
                    observacao: 'Frete aceito'
                });
            }
            if (frete.status === 'TRANSITO' || frete.status === 'CONCLUIDO') {
                timeline.push({
                    status: 'TRANSITO',
                    data: frete.data_coleta_realizada || frete.data_coleta_prevista,
                    observacao: 'Em trânsito'
                });
            }
            if (frete.status === 'CONCLUIDO') {
                timeline.push({
                    status: 'CONCLUIDO',
                    data: frete.data_entrega_realizada,
                    observacao: 'Entrega realizada'
                });
            }
        }

        return timeline;
    };

    const timeline = construirTimeline();

    return (
        <div className="timeline-frete">
            <h4>Linha do Tempo - {frete.codigo || `FR${String(frete.id).padStart(5, '0')}`}</h4>
            
            <div className="timeline-items">
                {timeline.length === 0 ? (
                    <p className="timeline-empty">Nenhum registro de status disponível</p>
                ) : (
                    timeline.map((item, index) => (
                        <div key={index} className={`timeline-item ${index === timeline.length - 1 ? 'current' : 'completed'}`}>
                            <div className="timeline-icon">
                                <span>{getStatusIcon(item.status)}</span>
                            </div>
                            <div className="timeline-content">
                                <div className="timeline-header">
                                    <span className="timeline-status">{getStatusLabel(item.status)}</span>
                                    <span className="timeline-date">{formatarData(item.data)}</span>
                                </div>
                                {item.observacao && (
                                    <p className="timeline-observacao">{item.observacao}</p>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Ocorrências */}
            {frete.ocorrencias && frete.ocorrencias.length > 0 && (
                <div className="timeline-ocorrencias">
                    <h5>Ocorrências</h5>
                    {frete.ocorrencias.map((ocorrencia, index) => (
                        <div key={index} className={`ocorrencia-item ${ocorrencia.resolvida ? 'resolvida' : 'pendente'}`}>
                            <span className="ocorrencia-tipo">{ocorrencia.tipo}</span>
                            <span className="ocorrencia-descricao">{ocorrencia.descricao}</span>
                            <span className="ocorrencia-data">{formatarData(ocorrencia.data_ocorrencia)}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TimelineFrete;