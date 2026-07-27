// src/pages/admin/AdminRelatorios.jsx
import React from 'react';

const AdminRelatorios = () => {
    return (
        <div className="admin-relatorios-container">
            <div className="page-header">
                <div>
                    <h1>Relatórios</h1>
                    <p className="subtitle">Gerencie relatórios da plataforma</p>
                </div>
            </div>

            <div className="relatorios-grid">
                <div className="relatorio-card">
                    <h3>📊 Relatório de Usuários</h3>
                    <p>Total de usuários, novos cadastros, distribuição por tipo</p>
                    <button className="btn btn-secondary" disabled>
                        Em breve
                    </button>
                </div>

                <div className="relatorio-card">
                    <h3>🚛 Relatório de Fretes</h3>
                    <p>Total de fretes, status, faturamento</p>
                    <button className="btn btn-secondary" disabled>
                        Em breve
                    </button>
                </div>

                <div className="relatorio-card">
                    <h3>💰 Relatório Financeiro</h3>
                    <p>Faturamento, comissões, pagamentos</p>
                    <button className="btn btn-secondary" disabled>
                        Em breve
                    </button>
                </div>

                <div className="relatorio-card">
                    <h3>📈 Relatório de Desempenho</h3>
                    <p>Métricas de desempenho da plataforma</p>
                    <button className="btn btn-secondary" disabled>
                        Em breve
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminRelatorios;