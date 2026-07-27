// src/pages/admin/AdminConfiguracoes.jsx
import React from 'react';

const AdminConfiguracoes = () => {
    return (
        <div className="admin-configuracoes-container">
            <div className="page-header">
                <div>
                    <h1>Configurações</h1>
                    <p className="subtitle">Configurações gerais da plataforma</p>
                </div>
            </div>

            <div className="configuracoes-grid">
                <div className="configuracao-card">
                    <h3>⚙️ Configurações Gerais</h3>
                    <p>Configurações básicas da plataforma</p>
                    <button className="btn btn-secondary" disabled>
                        Em breve
                    </button>
                </div>

                <div className="configuracao-card">
                    <h3>💳 Configurações de Pagamento</h3>
                    <p>Gateway de pagamento, taxas, comissões</p>
                    <button className="btn btn-secondary" disabled>
                        Em breve
                    </button>
                </div>

                <div className="configuracao-card">
                    <h3>📧 Configurações de Email</h3>
                    <p>Templates de email, notificações</p>
                    <button className="btn btn-secondary" disabled>
                        Em breve
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminConfiguracoes;