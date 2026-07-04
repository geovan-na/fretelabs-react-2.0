// components/SidebarDashboard.jsx
import { NavLink } from 'react-router-dom';

function SidebarDashboard({ userRole }) {
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
                { label: 'Documentos', path: '/dashboard/autonomo/documentos' },
                { label: 'Perfil', path: '/dashboard/autonomo/perfil' }
            ],
            vinculado: [
                { label: 'Dashboard', path: '/dashboard/vinculado' },
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
                { label: 'Documentos', path: '/dashboard/admin/documentos' },
                { label: 'Blacklist', path: '/dashboard/admin/blacklist' },
                { label: 'Relatórios', path: '/dashboard/admin/relatorios' },
                { label: 'Configurações', path: '/dashboard/admin/configuracoes' }
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
        <div className="sidebar-container">
            <div className="sidebar-logo">FRETELABS</div>
            <nav className="sidebar-nav">
                {menuLinks.map((link) => {
                    // Verifica se é o link do Dashboard (primeiro item)
                    const isDashboard = link.label === 'Dashboard';
                    
                    return (
                        <NavLink
                            key={link.path}
                            to={link.path}
                            end={isDashboard}  // ← SÓ O DASHBOARD TEM "end"
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
                        <p className="user-name">Usuário</p>
                        <p className="user-role">{userRole}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SidebarDashboard;