// components/SidebarDashboard.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';

/**
 * SidebarDashboard - Menu lateral do painel
 * @param {string} userRole - Papel do usuário (admin, embarcador, etc)
 * @param {boolean} isOpen - Estado que define se o menu mobile está aberto
 * @param {function} onClose - Função para fechar o menu mobile
 */
function SidebarDashboard({ userRole, isOpen, onClose }) {
    if (!userRole) {
        console.error('SidebarDashboard sem userRole');
        return null;
    }

    const getLinks = () => {
        const links = {
            embarcador: [
                { label: 'Dashboard', path: '/dashboard/embarcador' },
                { label: 'Publicar Frete', path: '/dashboard/embarcador/publicar-frete' },
                { label: 'Meus Fretes', path: '/dashboard/embarcador/fretes' },
                { label: 'Candidaturas', path: '/dashboard/embarcador/candidaturas' },
                { label: 'Financeiro', path: '/dashboard/embarcador/financeiro' },
                { label: 'Avaliações', path: '/dashboard/embarcador/avaliacoes' },
                { label: 'Perfil', path: '/dashboard/embarcador/perfil' }
            ],
            frota: [
                { label: 'Dashboard', path: '/dashboard/frota' },
                { label: 'Veículos', path: '/dashboard/frota/veiculos' },
                { label: 'Motoristas', path: '/dashboard/frota/motoristas' },
                { label: 'Buscar Fretes', path: '/dashboard/frota/buscar-fretes' },
                { label: 'Candidaturas', path: '/dashboard/frota/candidaturas' },
                { label: 'Fretes Aceitos', path: '/dashboard/frota/fretes-aceitos' },
                { label: 'Financeiro', path: '/dashboard/frota/financeiro' },
                { label: 'Avaliações', path: '/dashboard/frota/avaliacoes' }
            ],
            autonomo: [
                { label: 'Dashboard', path: '/dashboard/autonomo' },
                { label: 'Meu Veículo', path: '/dashboard/autonomo/veiculo' },
                { label: 'Buscar Fretes', path: '/dashboard/autonomo/buscar-fretes' },
                { label: 'Candidaturas', path: '/dashboard/autonomo/candidaturas' },
                { label: 'Fretes Aceitos', path: '/dashboard/autonomo/fretes-aceitos' },
                { label: 'Financeiro', path: '/dashboard/autonomo/financeiro' },
                { label: 'Avaliações', path: '/dashboard/autonomo/avaliacoes' },
                { label: 'Perfil', path: '/dashboard/autonomo/perfil' }
            ],
            vinculado: [
                { label: 'Dashboard', path: '/dashboard/vinculado' },
                { label: 'Propostas', path: '/dashboard/vinculado/propostas' },
                { label: 'Meus Fretes', path: '/dashboard/vinculado/fretes' },
                { label: 'Atualizar Status', path: '/dashboard/vinculado/status' },
                { label: 'Rastreamento', path: '/dashboard/vinculado/rastreamento' },
                { label: 'Entregas Realizadas', path: '/dashboard/vinculado/entregas' },
                { label: 'Financeiro', path: '/dashboard/vinculado/financeiro' },
                { label: 'Minha Frota', path: '/dashboard/vinculado/frota' },
                { label: 'Perfil', path: '/dashboard/vinculado/perfil' }
            ],
            admin: [
                { label: 'Dashboard', path: '/dashboard/admin' },
                { label: 'Gestão de Usuários', path: '/dashboard/admin/usuarios' },
                { label: 'Gestão de Fretes', path: '/dashboard/admin/fretes' },
                { label: 'Blacklist', path: '/dashboard/admin/blacklist' },
            ]
        };
        return links[userRole] || null;
    };

    const menuLinks = getLinks();

    if (!menuLinks) {
        console.error('Role não encontrada:', userRole);
        return null;
    }

    return (
        <>
            {/* Overlay para fechar o menu ao clicar fora no modo mobile */}
            {isOpen && (
                <div 
                    className="sidebar-overlay" 
                    onClick={onClose}
                    aria-label="Fechar menu lateral"
                ></div>
            )}

            {/* Container principal com classe condicional 'open' */}
            <div className={`sidebar-container ${isOpen ? 'open' : ''}`}>
                
                {/* Botão de fechar visível apenas no mobile */}
                <button 
                    className="close-sidebar-btn" 
                    onClick={onClose}
                    aria-label="Fechar menu"
                >
                    &times;
                </button>

                <div className="sidebar-logo">FRETELABS</div>
                
                <nav className="sidebar-nav">
                    {menuLinks.map((link) => {
                        const isDashboard = link.label === 'Dashboard';
                        
                        return (
                            <NavLink
                                key={link.path}
                                to={link.path}
                                end={isDashboard}
                                onClick={onClose} // Fecha o menu automaticamente ao selecionar uma página
                                className={({ isActive }) => 
                                    `nav-link ${isActive ? 'active' : ''}`
                                }
                            >
                                <span className="nav-label">{link.label}</span>
                            </NavLink>
                        );
                    })}
                </nav>
                
                <div className="sidebar-footer">
                    <div className="user-profile-info">
                        <div className="user-text">
                            <p className="user-name">Geovanna</p>
                            <p className="user-role">{userRole}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default SidebarDashboard;