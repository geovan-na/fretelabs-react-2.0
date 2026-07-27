// src/components/dashboard/VeiculoInfoCard.jsx
import React from 'react';
import { TruckIcon } from './Icons';

export const VeiculoInfoCard = ({ veiculo, cnh }) => {
    if (!veiculo) return null;

    return (
        <div className="veiculo-info-card">
            <div className="veiculo-info-icon">
                <TruckIcon />
            </div>
            <div className="veiculo-info-detalhes">
                <h3>{veiculo.marca} {veiculo.modelo}</h3>
                <p>Placa: {veiculo.placa}</p>
            </div>
            {cnh && (
                <div className="veiculo-info-cnh">
                    <div className="label">CNH: {cnh.cnh_categoria}</div>
                    <div className="value">
                        Válida até {new Date(cnh.cnh_validade).toLocaleDateString('pt-BR')}
                    </div>
                </div>
            )}
        </div>
    );
};