// pages/RecuperarSenha.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import { api } from '../services/api';

function RecuperarSenha() {
    const navigate = useNavigate();

    // Etapas do fluxo: 1: 'email', 2: 'codigo', 3: 'redefinir', 4: 'sucesso'
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [codigo, setCodigo] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    
    const [codigoGerado, setCodigoGerado] = useState(''); // Para facilitar em ambiente de testes
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Etapa 1: Enviar solicitação de código
    const handleSolicitarCodigo = async (e) => {
        e.preventDefault();
        setError('');
        if (!email) {
            setError('Por favor, informe seu e-mail.');
            return;
        }

        setIsLoading(true);
        try {
            const res = await api.auth.forgotPassword(email);
            setSuccessMessage('Código de verificação gerado e enviado com sucesso!');
            if (res.codigo) {
                setCodigoGerado(res.codigo);
            }
            setStep(2);
        } catch (err) {
            setError(err.message || 'Erro ao solicitar código de recuperação. Verifique o e-mail informado.');
        } finally {
            setIsLoading(false);
        }
    };

    // Etapa 2: Validar o código de 6 dígitos
    const handleValidarCodigo = async (e) => {
        e.preventDefault();
        setError('');
        if (!codigo || codigo.length < 6) {
            setError('Digite o código de 6 dígitos enviado.');
            return;
        }

        setIsLoading(true);
        try {
            await api.auth.verifyCode(email, codigo);
            setSuccessMessage('Código validado com sucesso! Digite sua nova senha.');
            setStep(3);
        } catch (err) {
            setError(err.message || 'Código inválido ou expirado. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    // Etapa 3: Redefinir a nova senha
    const handleRedefinirSenha = async (e) => {
        e.preventDefault();
        setError('');

        if (!novaSenha || novaSenha.length < 6) {
            setError('A nova senha deve ter no mínimo 6 caracteres.');
            return;
        }

        if (novaSenha !== confirmarSenha) {
            setError('As senhas não coincidem. Digite novamente.');
            return;
        }

        setIsLoading(true);
        try {
            await api.auth.resetPassword(email, codigo, novaSenha);
            setStep(4);
        } catch (err) {
            setError(err.message || 'Erro ao redefinir senha. Tente novamente.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <div className="login-icon">FL</div>
                    <h1 className="login-title">Recuperação de Senha</h1>
                    <p className="login-subtitle">
                        {step === 1 && 'Informe seu e-mail para receber o código de redefinição.'}
                        {step === 2 && 'Digite o código de 6 dígitos enviado para o seu e-mail.'}
                        {step === 3 && 'Cadastre a sua nova senha de acesso.'}
                        {step === 4 && 'Sua senha foi redefinida com sucesso!'}
                    </p>
                </div>

                {error && (
                    <div className="error-message geral" style={{ marginBottom: '16px' }}>
                        {error}
                    </div>
                )}

                {successMessage && step !== 4 && (
                    <div style={{
                        backgroundColor: '#10B98115',
                        border: '1px solid #10B981',
                        color: '#10B981',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        fontSize: '14px',
                        marginBottom: '16px',
                        textAlign: 'center'
                    }}>
                        {successMessage}
                        {codigoGerado && (
                            <div style={{ marginTop: '8px', fontWeight: 'bold', fontSize: '15px' }}>
                                Código de teste: <span style={{ letterSpacing: '2px', color: '#F97316' }}>{codigoGerado}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* ETAPA 1: Solicitar código */}
                {step === 1 && (
                    <form onSubmit={handleSolicitarCodigo} className="login-form">
                        <Input
                            label="E-mail cadastrado"
                            name="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="seu@email.com"
                            required
                        />

                        <Button type="submit" variant="primary" disabled={isLoading}>
                            {isLoading ? 'Enviando código...' : 'Enviar Código de Verificação'}
                        </Button>

                        <div className="register-prompt" style={{ marginTop: '20px' }}>
                            Lembrou sua senha? <Link to="/login">Voltar para o Login</Link>
                        </div>
                    </form>
                )}

                {/* ETAPA 2: Digitar código de 6 dígitos */}
                {step === 2 && (
                    <form onSubmit={handleValidarCodigo} className="login-form">
                        <Input
                            label="Código de Verificação (6 dígitos)"
                            name="codigo"
                            type="text"
                            maxLength={6}
                            value={codigo}
                            onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ''))}
                            placeholder="Ex: 849201"
                            required
                        />

                        <Button type="submit" variant="primary" disabled={isLoading}>
                            {isLoading ? 'Validando...' : 'Validar Código'}
                        </Button>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '16px', fontSize: '14px' }}>
                            <button
                                type="button"
                                style={{ background: 'none', border: 'none', color: '#F97316', cursor: 'pointer', textDecoration: 'underline' }}
                                onClick={handleSolicitarCodigo}
                                disabled={isLoading}
                            >
                                Reenviar código
                            </button>
                            <button
                                type="button"
                                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', textDecoration: 'underline' }}
                                onClick={() => setStep(1)}
                            >
                                Alterar e-mail
                            </button>
                        </div>
                    </form>
                )}

                {/* ETAPA 3: Redefinir nova senha */}
                {step === 3 && (
                    <form onSubmit={handleRedefinirSenha} className="login-form">
                        <Input
                            label="Nova Senha"
                            name="novaSenha"
                            type="password"
                            value={novaSenha}
                            onChange={(e) => setNovaSenha(e.target.value)}
                            placeholder="Mínimo 6 caracteres"
                            required
                        />

                        <Input
                            label="Confirmar Nova Senha"
                            name="confirmarSenha"
                            type="password"
                            value={confirmarSenha}
                            onChange={(e) => setConfirmarSenha(e.target.value)}
                            placeholder="Repita a nova senha"
                            required
                        />

                        <Button type="submit" variant="primary" disabled={isLoading}>
                            {isLoading ? 'Redefinindo...' : 'Salvar Nova Senha'}
                        </Button>
                    </form>
                )}

                {/* ETAPA 4: Sucesso */}
                {step === 4 && (
                    <div style={{ textAlign: 'center', padding: '10px 0' }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            backgroundColor: '#10B98120',
                            color: '#10B981',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '32px',
                            margin: '0 auto 16px'
                        }}>
                            ✓
                        </div>
                        <h3 style={{ color: '#F8FAFC', marginBottom: '8px' }}>Senha Alterada!</h3>
                        <p style={{ color: '#94A3B8', fontSize: '14px', marginBottom: '24px' }}>
                            Sua nova senha foi gravada com sucesso no sistema. Você já pode acessar sua conta.
                        </p>

                        <Button
                            type="button"
                            variant="primary"
                            onClick={() => navigate('/login')}
                        >
                            Ir para o Login
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default RecuperarSenha;
