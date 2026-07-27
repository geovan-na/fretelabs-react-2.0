// src/components/dashboard/AlertList.jsx
import React from 'react';

export const AlertList = ({ alerts, title = 'Alertas' }) => {
    return (
        <div className="table-container">
            <h4>{title}</h4>
            <div className="alert-list">
                {alerts && alerts.length > 0 ? (
                    alerts.map((alert, index) => (
                        <div key={index} className={`alert-item ${alert.tipo}`}>
                            <div className="alert-titulo">{alert.titulo}</div>
                            <div className="alert-descricao">{alert.descricao}</div>
                            {alert.data && (
                                <div className="alert-data">
                                    {new Date(alert.data).toLocaleDateString('pt-BR')}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="alert-empty">
                        Nenhum alerta no momento
                    </div>
                )}
            </div>
        </div>
    );
};