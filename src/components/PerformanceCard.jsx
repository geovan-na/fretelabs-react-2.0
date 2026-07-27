// src/components/dashboard/PerformanceCard.jsx
import React from 'react';

export const PerformanceCard = ({ data }) => {
    if (!data) return null;

    return (
        <div className="performance-card">
            <h4>Desempenho Geral</h4>
            <div className="performance-grid">
                <div>
                    <p className="performance-item-label">Entregas</p>
                    <p className="performance-item-value">{data.total_entregas || 0}</p>
                </div>
                <div>
                    <p className="performance-item-label">Taxa de Entrega</p>
                    <p className="performance-item-value green">{data.taxa_entrega || 0}%</p>
                </div>
                <div>
                    <p className="performance-item-label">Avaliação</p>
                    <p className="performance-item-value orange">{data.avaliacao_media || 0} ★</p>
                </div>
                <div>
                    <p className="performance-item-label">Dias Trabalhados</p>
                    <p className="performance-item-value">{data.dias_trabalhados || 0}</p>
                </div>
            </div>
        </div>
    );
};