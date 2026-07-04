// components/Header.jsx
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Header() {
    const [menuAberto, setMenuAberto] = useState(false);
    const [isBlack, setIsBlack] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const blackPages = ['/cadastro', '/login'];
        setIsBlack(blackPages.includes(location.pathname));
    }, [location]);

    const toggleMenu = () => {
        setMenuAberto(!menuAberto);
    };

    const fecharMenu = () => {
        setMenuAberto(false);
    };

    return (
        <>
            <header className={isBlack ? 'header-black' : 'header-transparent'}>
                <Link to="/" className="logo">FRETELABS</Link>
                
                <button 
                    className={`menu-toggle ${menuAberto ? 'active' : ''}`} 
                    onClick={toggleMenu}
                    aria-label="Menu"
                >
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <nav className={`desktop-menu ${menuAberto ? 'mobile-open' : ''}`}>
                    <Link to="/solucoes" onClick={fecharMenu}>SOLUÇÕES</Link>
                    <Link to="/empresa" onClick={fecharMenu}>EMPRESAS</Link>
                    <Link to="/motorista" onClick={fecharMenu}>MOTORISTAS</Link>
                    <Link to="/login" className="login-btn" onClick={fecharMenu}>LOGIN</Link>
                </nav>
            </header>

            {menuAberto && (
                <div className="menu-overlay" onClick={fecharMenu}></div>
            )}
        </>
    );
}

export default Header;