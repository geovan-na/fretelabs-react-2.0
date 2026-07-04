// components/SidebarMobile.jsx
import { NavLink } from 'react-router-dom';

function SidebarMobile({ isOpen, onClose, role }) {
    const getLinks = () => {
        // Mesma função do SidebarDashboard.jsx
        const links = {
            embarcador: [
                { label: 'Dashboard', icon: 'dashboard', path: '/dashboard/embarcador' },
                { label: 'Publicar Frete', icon: 'add', path: '/dashboard/embarcador/publicar-frete' },
                { label: 'Meus Fretes', icon: 'freights', path: '/dashboard/embarcador/fretes' },
                { label: 'Candidaturas', icon: 'candidates', path: '/dashboard/embarcador/candidaturas' },
                { label: 'Financeiro', icon: 'finance', path: '/dashboard/embarcador/financeiro' },
                { label: 'Avaliacoes', icon: 'reviews', path: '/dashboard/embarcador/avaliacoes' },
                { label: 'Perfil', icon: 'profile', path: '/dashboard/embarcador/perfil' }
            ],
            frota: [
                { label: 'Dashboard', icon: 'dashboard', path: '/dashboard/frota' },
                { label: 'Veiculos', icon: 'truck', path: '/dashboard/frota/veiculos' },
                { label: 'Motoristas', icon: 'drivers', path: '/dashboard/frota/motoristas' },
                { label: 'Buscar Fretes', icon: 'search', path: '/dashboard/frota/buscar-fretes' },
                { label: 'Candidaturas', icon: 'candidates', path: '/dashboard/frota/candidaturas' },
                { label: 'Fretes Aceitos', icon: 'accepted', path: '/dashboard/frota/fretes-aceitos' },
                { label: 'Financeiro', icon: 'finance', path: '/dashboard/frota/financeiro' },
                { label: 'Avaliacoes', icon: 'reviews', path: '/dashboard/frota/avaliacoes' }
            ],
            autonomo: [
                { label: 'Dashboard', icon: 'dashboard', path: '/dashboard/autonomo' },
                { label: 'Meu Veiculo', icon: 'vehicle', path: '/dashboard/autonomo/veiculo' },
                { label: 'Buscar Fretes', icon: 'search', path: '/dashboard/autonomo/buscar-fretes' },
                { label: 'Candidaturas', icon: 'candidates', path: '/dashboard/autonomo/candidaturas' },
                { label: 'Fretes Aceitos', icon: 'accepted', path: '/dashboard/autonomo/fretes-aceitos' },
                { label: 'Financeiro', icon: 'finance', path: '/dashboard/autonomo/financeiro' },
                { label: 'Avaliacoes', icon: 'reviews', path: '/dashboard/autonomo/avaliacoes' },
                { label: 'Documentos', icon: 'documents', path: '/dashboard/autonomo/documentos' },
                { label: 'Perfil', icon: 'profile', path: '/dashboard/autonomo/perfil' }
            ],
            vinculado: [
                { label: 'Dashboard', icon: 'dashboard', path: '/dashboard/vinculado' },
                { label: 'Meus Fretes', icon: 'freights', path: '/dashboard/vinculado/fretes' },
                { label: 'Atualizar Status', icon: 'update', path: '/dashboard/vinculado/status' },
                { label: 'Rastreamento', icon: 'tracking', path: '/dashboard/vinculado/rastreamento' },
                { label: 'Entregas Realizadas', icon: 'delivered', path: '/dashboard/vinculado/entregas' },
                { label: 'Financeiro', icon: 'finance', path: '/dashboard/vinculado/financeiro' },
                { label: 'Minha Frota', icon: 'fleet', path: '/dashboard/vinculado/frota' },
                { label: 'Perfil', icon: 'profile', path: '/dashboard/vinculado/perfil' }
            ],
            admin: [
                { label: 'Dashboard', icon: 'dashboard', path: '/dashboard/admin' },
                { label: 'Gestao de Usuarios', icon: 'users', path: '/dashboard/admin/usuarios' },
                { label: 'Gestao de Fretes', icon: 'freights', path: '/dashboard/admin/fretes' },
                { label: 'Documentos', icon: 'documents', path: '/dashboard/admin/documentos' },
                { label: 'Blacklist', icon: 'blocked', path: '/dashboard/admin/blacklist' },
                { label: 'Relatorios', icon: 'reports', path: '/dashboard/admin/relatorios' },
                { label: 'Configuracoes', icon: 'settings', path: '/dashboard/admin/configuracoes' }
            ]
        };
        return links[role] || links.embarcador;
    };

    const renderIcon = (iconName) => {
        // Mesma função de ícones do SidebarDashboard.jsx
        const icons = {
            dashboard: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="14" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="14" width="7" height="7" rx="1" />
                    <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
            ),
            add: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="16" />
                    <line x1="8" y1="12" x2="16" y2="12" />
                </svg>
            ),
            freights: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="4" width="22" height="16" rx="2" />
                    <path d="M8 4V8" />
                    <path d="M16 4V8" />
                    <circle cx="6" cy="18" r="2" />
                    <circle cx="18" cy="18" r="2" />
                </svg>
            ),
            candidates: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            ),
            finance: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v8" />
                    <path d="M8 12h8" />
                </svg>
            ),
            reviews: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            ),
            profile: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                </svg>
            ),
            truck: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="3" width="15" height="13" />
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                    <circle cx="5.5" cy="18" r="2.5" />
                    <circle cx="18.5" cy="18" r="2.5" />
                </svg>
            ),
            drivers: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            ),
            search: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
            ),
            accepted: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
            ),
            vehicle: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                </svg>
            ),
            documents: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                </svg>
            ),
            update: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="23 4 23 10 17 10" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                </svg>
            ),
            tracking: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                </svg>
            ),
            delivered: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
            ),
            fleet: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="1" y="3" width="15" height="13" />
                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                    <circle cx="5.5" cy="18" r="2.5" />
                    <circle cx="18.5" cy="18" r="2.5" />
                </svg>
            ),
            users: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
            ),
            blocked: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                </svg>
            ),
            reports: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="20" x2="18" y2="10" />
                    <line x1="12" y1="20" x2="12" y2="4" />
                    <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
            ),
            settings: (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
            )
        };
        return icons[iconName] || icons.dashboard;
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="sidebar-mobile-overlay" onClick={onClose}></div>
            <aside className="sidebar-mobile">
                <div className="sidebar-mobile-header">
                    <h2 className="sidebar-mobile-logo">FRETELABS</h2>
                    <button className="sidebar-mobile-close" onClick={onClose}>✕</button>
                </div>
                <nav className="sidebar-mobile-nav">
                    {getLinks().map((link) => (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            className={({ isActive }) =>
                                `sidebar-mobile-link ${isActive ? 'active' : ''}`
                            }
                            onClick={onClose}
                        >
                            <span className="sidebar-mobile-icon">{renderIcon(link.icon)}</span>
                            <span className="sidebar-mobile-label">{link.label}</span>
                        </NavLink>
                    ))}
                </nav>
                <div className="sidebar-mobile-footer">
                    <button className="sidebar-mobile-logout">Sair</button>
                </div>
            </aside>
        </>
    );
}

export default SidebarMobile;