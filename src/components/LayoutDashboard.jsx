// components/LayoutDashboard.jsx
import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import SidebarDashboard from './SidebarDashboard';

function LayoutDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        // Se o usuário acessar a rota raiz do dashboard (/dashboard ou /dashboard/), redireciona para a página específica da role dele
        if (location.pathname === '/dashboard' || location.pathname === '/dashboard/') {
            const role = (user.tipo || '').toLowerCase();
            if (role === 'embarcador') {
                navigate('/dashboard/embarcador', { replace: true });
            } else if (role === 'frota') {
                navigate('/dashboard/frota', { replace: true });
            } else if (role === 'autonomo') {
                navigate('/dashboard/autonomo', { replace: true });
            } else if (role === 'vinculado' || role === 'usuario') {
                navigate('/dashboard/vinculado', { replace: true });
            } else if (role === 'admin') {
                navigate('/dashboard/admin', { replace: true });
            }
        }
    }, [user, navigate, location.pathname]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleMobileSidebar = () => {
        setIsMobileSidebarOpen(!isMobileSidebarOpen);
    };

    if (!user) {
        return <div className="dashboard-loading">Carregando...</div>;
    }

    const userRole = user.tipo || 'usuario';

    return (
        <div className="dashboard-layout-wrapper">
           <SidebarDashboard 
                userRole={userRole} 
                isOpen={isMobileSidebarOpen}
                onClose={() => setIsMobileSidebarOpen(false)}
            />
            
            <div className="dashboard-main-content">
                {isMobile && (
                    <button 
                        className="mobile-sidebar-toggle"
                        onClick={toggleMobileSidebar}
                        aria-label="Abrir menu"
                    >
                        &#9776;
                    </button>
                )}

                <main className="dashboard-body">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default LayoutDashboard;