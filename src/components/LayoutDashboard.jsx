// components/LayoutDashboard.jsx
import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import SidebarDashboard from './SidebarDashboard';

function LayoutDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
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
        }
    }, [user, navigate]);

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

    if (!user.tipo) {
        console.error('Usuario sem tipo definido:', user);
        navigate('/login');
        return null;
    }

    const userRole = user.tipo;

    return (
        <div className="dashboard-layout-wrapper">
            <SidebarDashboard 
                userRole={userRole} 
                isMobileOpen={isMobileSidebarOpen}
                onCloseMobile={() => setIsMobileSidebarOpen(false)}
            />
            
            <div className="dashboard-main-content">
                {isMobile && (
                    <button 
                        className="mobile-sidebar-toggle"
                        onClick={toggleMobileSidebar}
                    >
                        Menu
                    </button>
                )}

                {isMobileSidebarOpen && (
                    <div 
                        className="mobile-sidebar-overlay"
                        onClick={() => setIsMobileSidebarOpen(false)}
                    />
                )}

                <main className="dashboard-body">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default LayoutDashboard;