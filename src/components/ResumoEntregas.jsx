// src/components/vinculado/ResumoEntregas.jsx
import React from 'react';

const ResumoEntregas = ({ resumo }) => {
    if (!resumo) {
        return (
            <div className="dashboard-loading">
                <p>Carregando resumo...</p>
            </div>
        );
    }

    const formatarMoeda = (valor) => {
        if (!valor) return 'R$ 0,00';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    };

    return (
        <div className="dashboard-stats">
            <div className="stat-card">
                <div className="stat-card-header">
                    <div className="stat-card-icon" style={{ backgroundColor: '#22C55E15' }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                    <div className="stat-card-content">
                        <p className="stat-label">Total de Entregas</p>
                        <h3 className="stat-value">{resumo.total_entregas || 0}</h3>
                    </div>
                </div>
            </div>

            <div className="stat-card">
                <div className="stat-card-header">
                    <div className="stat-card-icon" style={{ backgroundColor: '#3B82F615' }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                        </svg>
                    </div>
                    <div className="stat-card-content">
                        <p className="stat-label">Média por Entrega</p>
                        <h3 className="stat-value">{formatarMoeda(resumo.media_por_entrega)}</h3>
                    </div>
                </div>
            </div>

            <div className="stat-card">
                <div className="stat-card-header">
                    <div className="stat-card-icon" style={{ backgroundColor: '#FF820015' }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF8200" strokeWidth="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                    </div>
                    <div className="stat-card-content">
                        <p className="stat-label">Total Recebido</p>
                        <h3 className="stat-value">{formatarMoeda(resumo.total_recebido)}</h3>
                    </div>
                </div>
            </div>

            <div className="stat-card">
                <div className="stat-card-header">
                    <div className="stat-card-icon" style={{ backgroundColor: '#8B5CF615' }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                    </div>
                    <div className="stat-card-content">
                        <p className="stat-label">Meses Trabalhados</p>
                        <h3 className="stat-value">{resumo.meses_trabalhados || 0}</h3>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResumoEntregas;