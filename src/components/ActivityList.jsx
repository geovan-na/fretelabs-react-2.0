// src/components/dashboard/ActivityList.jsx
import React from 'react';

export const ActivityList = ({ activities }) => {
    const getTipoLabel = (tipo) => {
        switch (tipo) {
            case 'usuario_cadastrado':
                return 'Novo usuário';
            case 'frete_atualizado':
                return 'Frete';
            case 'documento_enviado':
                return 'Documento';
            default:
                return 'Atividade';
        }
    };

    return (
        <div className="table-container">
            <h4>Atividades Recentes</h4>
            <div className="activity-list">
                {activities && activities.length > 0 ? (
                    activities.map((activity, index) => (
                        <div key={index} className="activity-item">
                            <div className="activity-info">
                                <div className="activity-descricao">
                                    {activity.descricao}
                                </div>
                                <div className="activity-tipo">
                                    {getTipoLabel(activity.tipo)}
                                </div>
                            </div>
                            <div className="activity-data">
                                {new Date(activity.data).toLocaleDateString('pt-BR')}
                                {' '}
                                {new Date(activity.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="table-empty">
                        Nenhuma atividade recente
                    </div>
                )}
            </div>
        </div>
    );
};