// src/components/dashboard/StatsCard.jsx
import React from 'react';

export const StatsCard = ({ icon, label, value, subtitle, color = '#FF8200', trend }) => {
    return (
        <div className="stat-card">
            <div className="stat-card-header">
                <div className="stat-card-icon" style={{ backgroundColor: `${color}15` }}>
                    {icon}
                </div>
                <div className="stat-card-content">
                    <p className="stat-label">{label}</p>
                    <h3 className="stat-value">{value}</h3>
                    {subtitle && <p className="stat-subtitle">{subtitle}</p>}
                    {trend && (
                        <div className="stat-trend">
                            <span className={trend > 0 ? 'positive' : 'negative'}>
                                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                            </span>
                            <span className="trend-label">vs mês anterior</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};