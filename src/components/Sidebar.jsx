// components/dashboard/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import { getSidebarLinks } from '../../utils/roles';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = ({ isMobileOpen, onCloseMobile }) => {
    const { userRole } = useAuth();
    const links = getSidebarLinks(userRole);

    const handleLinkClick = () => {
        if (onCloseMobile) {
            onCloseMobile();
        }
    };

    return (
        <aside className={`sidebar ${isMobileOpen ? 'sidebar-mobile-open' : ''}`}>
            <div className="sidebar-logo">
                <h2>FRETELABS</h2>
            </div>
            
            <nav className="sidebar-nav">
                {links.map((link, index) => (
                    <NavLink
                        key={index}
                        to={link.path}
                        className={({ isActive }) => 
                            `sidebar-link ${isActive ? 'active' : ''}`
                        }
                        onClick={handleLinkClick}
                    >
                        <span className="sidebar-label">{link.label}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};

export default Sidebar;