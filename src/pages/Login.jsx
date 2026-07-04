// pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Input from '../components/Input';
import Button from '../components/Button';
import { api } from '../services/api';

function Login() {
    const [formData, setFormData] = useState({ email: '', senha: '' });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const fillCredentials = (tipo) => {
        const credenciais = {
            empresa: { email: 'embarcador@fretelabs.com', senha: '123456' },
            frota: { email: 'frota@fretelabs.com', senha: '123456' },
            autonomo: { email: 'autonomo@fretelabs.com', senha: '123456' },
            vinculado: { email: 'vinculado2@fretelabs.com', senha: '123456' },
            admin: { email: 'admin@fretelabs.com', senha: '123456' }
        };
        
        if (credenciais[tipo]) {
            setFormData(credenciais[tipo]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.email || !formData.senha) {
            setErrors({ geral: 'Preencha todos os campos' });
            return;
        }
        
        setIsLoading(true);
        
        try {
            const response = await api.auth.login(formData.email, formData.senha);
            
            localStorage.setItem('token', response.token);
            login(response.user);
            
            const tipo = response.user.tipo;
            
            // Redireciona baseado no tipo de usuário
            if (tipo === 'embarcador') {
                navigate('/dashboard/embarcador');
            } else if (tipo === 'frota') {
                navigate('/dashboard/frota');
            } else if (tipo === 'autonomo') {
                navigate('/dashboard/autonomo');
            } else if (tipo === 'vinculado') {
                navigate('/dashboard/vinculado');
            } else if (tipo === 'admin') {
                navigate('/dashboard/admin');
            } else {
                navigate('/dashboard');
            }
            
        } catch (err) {
            setErrors({ geral: err.message || 'E-mail ou senha inválidos' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <div className="login-icon">FL</div>
                    <h1 className="login-title">Bem-vindo de volta</h1>
                    <p className="login-subtitle">Acesse sua conta na FreteLabs</p>
                </div>

                <div className="demo-area">
                    <p className="demo-title">Credenciais de demonstração</p>
                    <div className="demo-buttons">
                        <button 
                            type="button" 
                            className="demo-btn" 
                            onClick={() => fillCredentials('empresa')}
                        >
                            Embarcador
                        </button>
                        <button 
                            type="button" 
                            className="demo-btn" 
                            onClick={() => fillCredentials('frota')}
                        >
                            Frota
                        </button>
                        <button 
                            type="button" 
                            className="demo-btn" 
                            onClick={() => fillCredentials('autonomo')}
                        >
                            Autônomo
                        </button>
                        <button 
                            type="button" 
                            className="demo-btn" 
                            onClick={() => fillCredentials('vinculado')}
                        >
                            Vinculado
                        </button>
                        <button 
                            type="button" 
                            className="demo-btn" 
                            onClick={() => fillCredentials('admin')}
                        >
                            Admin
                        </button>
                    </div>
                </div>

                {errors.geral && (
                    <div className="error-message geral">{errors.geral}</div>
                )}

                <form onSubmit={handleSubmit} className="login-form">
                    <Input
                        label="E-mail"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        error={errors.email}
                        placeholder="seu@email.com"
                        required
                    />

                    <Input
                        label="Senha"
                        name="senha"
                        type="password"
                        value={formData.senha}
                        onChange={handleChange}
                        error={errors.senha}
                        placeholder="Mínimo 6 caracteres"
                        required
                    />

                    <div className="form-options">
                        <label className="remember-me">
                            <input type="checkbox" />
                            <span>Lembrar-me</span>
                        </label>
                        <Link to="/recuperar-senha" className="forgot-password">
                            Esqueceu a senha
                        </Link>
                    </div>

                    <Button type="submit" variant="primary" disabled={isLoading}>
                        {isLoading ? 'Entrando...' : 'Entrar'}
                    </Button>
                </form>

                <div className="divider">
                    <span>ou continue com</span>
                </div>

                <div className="social-login">
                    <button 
                        type="button" 
                        className="social-btn google"
                        onClick={() => alert('Login com Google em breve')}
                    >
                        Google
                    </button>
                    <button 
                        type="button" 
                        className="social-btn facebook"
                        onClick={() => alert('Login com Facebook em breve')}
                    >
                        Facebook
                    </button>
                </div>

                <div className="register-prompt">
                    Ainda não tem uma conta? 
                    <Link to="/cadastro">Criar conta gratuita</Link>
                </div>
            </div>
        </div>
    );
}

export default Login;