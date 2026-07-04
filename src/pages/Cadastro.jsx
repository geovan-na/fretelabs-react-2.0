// src/pages/Cadastro.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Form from '../components/Form';

function Cadastro() {
    const [tipo, setTipo] = useState('embarcador');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleCadastro = async (dados) => {
        setIsLoading(true);
        
        try {
            const dadosCompletos = {
                ...dados,
                tipo_usuario: tipo,
            };
            
            const response = await api.auth.register(dadosCompletos);
            
            // 1. Salva o token e os dados do usuário já criados no backend
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            
            // 🌟 2. Redirecionamento Inteligente com base no tipo que ele escolheu
            if (tipo === 'embarcador') {
                navigate('/dashboard/embarcador');
            } else if (tipo === 'frota') {
                navigate('/dashboard/frota');
            } else if (tipo === 'autonomo') {
                navigate('/dashboard/autonomo');
            } else if (tipo === 'vinculado') {
                navigate('/dashboard/vinculado');
            } else {
                navigate('/dashboard');
            }
            
        } catch (err) {
            // Tratando caso o erro venha estruturado do Axios ou seja string direta
            const mensagemErro = err.response?.data?.error || err.message || 'Erro ao realizar cadastro';
            alert(mensagemErro);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="cadastro-page">
            <div className="cadastro-card">
                <div className="cadastro-grid">
                    <div className="cadastro-info">
                        <div className="cadastro-info-badge">JUNTE-SE À ELITE</div>
                        <h2 className="cadastro-info-title">Faça parte da revolução da logística brasileira</h2>
                        <p className="cadastro-info-subtitle">Conectamos as melhores cargas aos melhores transportadores do país.</p>
                        <ul className="cadastro-info-list">
                            <li>Mais de 5.000 transportadores cadastrados</li>
                            <li>Empresas de todos os portes conectadas 24/7</li>
                            <li>Pagamento garantido em até 48h</li>
                            <li>Seguro de carga incluso</li>
                            <li>Suporte dedicado 24 horas</li>
                            <li>+10.000 fretes realizados com 98% de satisfação</li>
                        </ul>
                        <div className="cadastro-info-testimonial">
                            <p>"A FreteLabs revolucionou nossa operação. Reduzimos em 40% o tempo de espera por fretes e aumentamos nossa receita em 60% no primeiro mês."</p>
                            <span>— Carlos Silva, Motorista Autônomo</span>
                        </div>
                    </div>

                    <div className="cadastro-form">
                        <div className="cadastro-form-header">
                            <h3>Criar conta gratuita</h3>
                            <p>Preencha os dados para começar</p>
                        </div>

                        <div className="user-type">
                            <div className={`user-type-option ${tipo === 'embarcador' ? 'selected' : ''}`} onClick={() => setTipo('embarcador')}>
                                <span>EMBARCADOR</span><small>Empresa que CONTRATA fretes</small>
                            </div>
                            <div className={`user-type-option ${tipo === 'frota' ? 'selected' : ''}`} onClick={() => setTipo('frota')}>
                                <span>FROTA</span><small>Empresa com caminhões próprios</small>
                            </div>
                            <div className={`user-type-option ${tipo === 'autonomo' ? 'selected' : ''}`} onClick={() => setTipo('autonomo')}>
                                <span>AUTÔNOMO</span><small>Motorista com caminhão próprio</small>
                            </div>
                            <div className={`user-type-option ${tipo === 'vinculado' ? 'selected' : ''}`} onClick={() => setTipo('vinculado')}>
                                <span>MOTORISTA VINCULADO</span><small>Motorista contratado por frota</small>
                            </div>
                        </div>

                        <Form tipo={tipo} onSubmit={handleCadastro} isLoading={isLoading} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Cadastro;

