// pages/Perfil.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';

export default function Perfil() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [perfil, setPerfil] = useState(null);
    const [editando, setEditando] = useState(false);
    const [salvando, setSalvando] = useState(false);
    const [formData, setFormData] = useState({});

    // Estados para o controle do fluxo de alteração de senha
    const [modalSenhaAberto, setModalSenhaAberto] = useState(false);
    const [alterandoSenha, setAlterandoSenha] = useState(false);
    const [senhaData, setSenhaData] = useState({ senhaAtual: '', novaSenha: '', confirmarNovaSenha: '' });

    const token = localStorage.getItem('token');

    useEffect(() => {
        carregarPerfil();
    }, []);

    const carregarPerfil = async () => {
        setLoading(true);
        setError(null);

        try {
            // USANDO O ENDPOINT UNIFICADO
            const response = await api.perfil.get(token);
            const dados = response.data || response;
            setPerfil(dados);
            setFormData(dados);
        } catch (err) {
            console.error('Erro ao carregar perfil:', err);
            setError('Erro ao carregar perfil.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSenhaChange = (e) => {
        const { name, value } = e.target;
        setSenhaData(prev => ({ ...prev, [name]: value }));
    };

    const handleSalvar = async () => {
        setSalvando(true);
        try {
            // Passa apenas o formData e o token. Sem IDs na rota.
            await api.perfil.atualizar(formData, token);
            alert('Perfil atualizado com sucesso!'); 
            setEditando(false);
            await carregarPerfil();
        } catch (err) {
            console.error('Erro ao salvar perfil:', err);
            alert('Erro ao salvar perfil. Tente novamente.');
        } finally {
            setSalvando(false);
        }
    };

    const handleAlterarSenhaSubmit = async (e) => {
        e.preventDefault();
        
        if (senhaData.novaSenha !== senhaData.confirmarNovaSenha) {
            alert('As senhas novas não coincidem!');
            return;
        }

        setAlterandoSenha(true);
        try {
            const dadosEnvio = {
                senhaAtual: senhaData.senhaAtual,
                novaSenha: senhaData.novaSenha
            };
            await api.perfil.alterarSenha(dadosEnvio, token);
            alert('Senha alterada com sucesso!');
            setModalSenhaAberto(false);
            setSenhaData({ senhaAtual: '', novaSenha: '', confirmarNovaSenha: '' });
        } catch (err) {
            console.error('Erro ao alterar senha:', err);
            alert(err.message || 'Erro ao alterar senha. Verifique sua senha atual.');
        } finally {
            setAlterandoSenha(false);
        }
    };

    const formatarData = (data) => {
        if (!data) return '-';
        return new Date(data).toLocaleDateString('pt-BR');
    };

    const renderDadosEspecificos = () => {
        if (!perfil?.especifico) return null;

        const especifico = perfil.especifico;
        const tipo = perfil.tipo_usuario?.toLowerCase() || '';

        switch (tipo) {
            case 'embarcador':
                return (
                    <div className="perfil-section">
                        <h3>Dados da Empresa</h3>
                        <div className="perfil-field">
                            <span className="perfil-label">Inscrição Estadual</span>
                            <span className="perfil-value">{especifico.inscricao_estadual || '-'}</span>
                        </div>
                        <div className="perfil-field">
                            <span className="perfil-label">Porte da Empresa</span>
                            <span className="perfil-value">{especifico.porte_empresa || '-'}</span>
                        </div>
                    </div>
                );

            case 'frota':
            case 'transportador':
                return (
                    <div className="perfil-section">
                        <h3>Dados da Frota</h3>
                        <div className="perfil-field">
                            <span className="perfil-label">RNTRC</span>
                            <span className="perfil-value">{especifico.rntrc || '-'}</span>
                        </div>
                        <div className="perfil-field">
                            <span className="perfil-label">Inscrição Estadual</span>
                            <span className="perfil-value">{especifico.inscricao_estadual || '-'}</span>
                        </div>
                        <div className="perfil-field">
                            <span className="perfil-label">Área de Atuação</span>
                            <span className="perfil-value">{especifico.area_atuacao || '-'}</span>
                        </div>
                        <div className="perfil-field">
                            <span className="perfil-label">Tipos de Carga</span>
                            <span className="perfil-value">{especifico.tipos_carga || '-'}</span>
                        </div>
                    </div>
                );

            case 'autonomo':
            case 'motorista_autonomo':
                return (
                    <div className="perfil-section">
                        <h3>Dados do Motorista</h3>
                        <div className="perfil-field">
                            <span className="perfil-label">CNH</span>
                            <span className="perfil-value">{especifico.cnh || '-'}</span>
                        </div>
                        <div className="perfil-field">
                            <span className="perfil-label">Categoria CNH</span>
                            <span className="perfil-value">{especifico.cnh_categoria || '-'}</span>
                        </div>
                        <div className="perfil-field">
                            <span className="perfil-label">Validade CNH</span>
                            <span className="perfil-value">{formatarData(especifico.cnh_validade)}</span>
                        </div>
                        {especifico.veiculo_placa && (
                            <div className="perfil-field">
                                <span className="perfil-label">Veículo</span>
                                <span className="perfil-value">{especifico.veiculo_modelo} - {especifico.veiculo_placa}</span>
                            </div>
                        )}
                    </div>
                );

            case 'vinculado':
            case 'motorista_vinculado':
                return (
                    <div className="perfil-section">
                        <h3>Dados do Motorista</h3>
                        <div className="perfil-field">
                            <span className="perfil-label">CNH</span>
                            <span className="perfil-value">{especifico.cnh || '-'}</span>
                        </div>
                        <div className="perfil-field">
                            <span className="perfil-label">Categoria CNH</span>
                            <span className="perfil-value">{especifico.cnh_categoria || '-'}</span>
                        </div>
                        <div className="perfil-field">
                            <span className="perfil-label">Validade CNH</span>
                            <span className="perfil-value">{formatarData(especifico.cnh_validade)}</span>
                        </div>
                        {especifico.frota_vinculada && (
                            <div className="perfil-field">
                                <span className="perfil-label">Frota Vinculada</span>
                                <span className="perfil-value">{especifico.frota_vinculada}</span>
                            </div>
                        )}
                        {especifico.tipo_contrato && (
                            <div className="perfil-field">
                                <span className="perfil-label">Tipo de Contrato</span>
                                <span className="perfil-value">{especifico.tipo_contrato}</span>
                            </div>
                        )}
                        {especifico.valor_salario && (
                            <div className="perfil-field">
                                <span className="perfil-label">Salário</span>
                                <span className="perfil-value">R$ {especifico.valor_salario.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="perfil-field">
                            <span className="perfil-label">Status do Contrato</span>
                            <span className="perfil-value"><StatusBadge status={especifico.contrato_status} /></span>
                        </div>
                    </div>
                );

            case 'admin':
            case 'administrador':
                return (
                    <div className="perfil-section">
                        <h3>Dados de Admin</h3>
                        <div className="perfil-field">
                            <span className="perfil-label">Nível de Acesso</span>
                            <span className="perfil-value">{especifico.nivel_acesso || '-'}</span>
                        </div>
                        <div className="perfil-field">
                            <span className="perfil-label">Cargo</span>
                            <span className="perfil-value">{especifico.cargo || '-'}</span>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    if (loading) {
        return (
            <div className="perfil-loading">
                <p>Carregando perfil...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="perfil-error">
                <p>{error}</p>
                <button onClick={carregarPerfil} className="btn btn-primary">
                    Tentar novamente
                </button>
            </div>
        );
    }

    if (!perfil) {
        return (
            <div className="perfil-container">
                <div className="page-header">
                    <h1>Meu Perfil</h1>
                    <p className="subtitle">Gerencie suas informações pessoais e de contato</p>
                </div>
                <p>Nenhum dado encontrado.</p>
            </div>
        );
    }

    return (
        <div className="perfil-container">
            <div className="page-header">
                <div>
                    <h1>Meu Perfil</h1>
                    <p className="subtitle">
                        Gerencie suas informações pessoais e de contato
                    </p>
                </div>
                <div className="perfil-actions">
                    <Button 
                        variant={editando ? 'secondary' : 'primary'}
                        onClick={() => {
                            if (editando) {
                                setEditando(false);
                                setFormData(perfil);
                            } else {
                                setEditando(true);
                            }
                        }}
                    >
                        {editando ? 'Cancelar' : 'Editar Perfil'}
                    </Button>
                    {editando && (
                        <Button 
                            variant="primary" 
                            onClick={handleSalvar}
                            disabled={salvando}
                        >
                            {salvando ? 'Salvando...' : 'Salvar'}
                        </Button>
                    )}
                </div>
            </div>

            <div className="perfil-card">
                <div className="perfil-avatar">
                    {perfil.nome?.charAt(0) || 'U'}
                </div>

                <div className="perfil-info">
                    {/* DADOS PESSOAIS */}
                    <div className="perfil-section">
                        <h3>Informações Pessoais</h3>
                        <div className="perfil-field">
                            <span className="perfil-label">Nome / Razão Social</span>
                            {editando ? (
                                <input
                                    type="text"
                                    name="nome"
                                    value={formData.nome || ''}
                                    onChange={handleChange}
                                    className="perfil-input"
                                />
                            ) : (
                                <span className="perfil-value">{perfil.nome || '-'}</span>
                            )}
                        </div>
                        <div className="perfil-field">
                            <span className="perfil-label">Email</span>
                            <span className="perfil-value">{perfil.email || '-'}</span>
                        </div>
                        <div className="perfil-field">
                            <span className="perfil-label">CPF/CNPJ</span>
                            <span className="perfil-value">{perfil.cpf_cnpj || '-'}</span>
                        </div>
                        <div className="perfil-field">
                            <span className="perfil-label">Telefone</span>
                            {editando ? (
                                <input
                                    type="text"
                                    name="telefone"
                                    value={formData.telefone || ''}
                                    onChange={handleChange}
                                    className="perfil-input"
                                />
                            ) : (
                                <span className="perfil-value">{perfil.telefone || '-'}</span>
                            )}
                        </div>
                        <div className="perfil-field">
                            <span className="perfil-label">Celular</span>
                            {editando ? (
                                <input
                                    type="text"
                                    name="celular"
                                    value={formData.celular || ''}
                                    onChange={handleChange}
                                    className="perfil-input"
                                />
                            ) : (
                                <span className="perfil-value">{perfil.celular || '-'}</span>
                            )}
                        </div>
                    </div>

                    {/* ENDEREÇO */}
                    {perfil.endereco && (
                        <div className="perfil-section">
                            <h3>Endereço</h3>
                            <div className="perfil-field">
                                <span className="perfil-label">Logradouro</span>
                                <span className="perfil-value">{perfil.endereco.logradouro || '-'}</span>
                            </div>
                            <div className="perfil-field">
                                <span className="perfil-label">Número</span>
                                <span className="perfil-value">{perfil.endereco.numero || '-'}</span>
                            </div>
                            <div className="perfil-field">
                                <span className="perfil-label">Complemento</span>
                                <span className="perfil-value">{perfil.endereco.complemento || '-'}</span>
                            </div>
                            <div className="perfil-field">
                                <span className="perfil-label">Bairro</span>
                                <span className="perfil-value">{perfil.endereco.bairro || '-'}</span>
                            </div>
                            <div className="perfil-field">
                                <span className="perfil-label">Cidade/Estado</span>
                                <span className="perfil-value">
                                    {perfil.endereco.cidade ? `${perfil.endereco.cidade}/${perfil.endereco.estado}` : '-'}
                                </span>
                            </div>
                            <div className="perfil-field">
                                <span className="perfil-label">CEP</span>
                                <span className="perfil-value">{perfil.endereco.cep || '-'}</span>
                            </div>
                        </div>
                    )}

                    {/* DADOS ESPECÍFICOS POR TIPO */}
                    {renderDadosEspecificos()}

                    {/* STATUS */}
                    <div className="perfil-section">
                        <h3>Status da Conta</h3>
                        <div className="perfil-field">
                            <span className="perfil-label">Situação</span>
                            <span className="perfil-value">
                                <StatusBadge status={perfil.status || 'APROVADO'} />
                            </span>
                        </div>
                        <div className="perfil-field">
                            <span className="perfil-label">Data de Cadastro</span>
                            <span className="perfil-value">{formatarData(perfil.data_cadastro)}</span>
                        </div>
                        <div className="perfil-field">
                            <span className="perfil-label">Tipo de Usuário</span>
                            <span className="perfil-value">{perfil.tipo_usuario || '-'}</span>
                        </div>
                    </div>

                    {/* BOTÃO ALTERAR SENHA */}
                    <div className="perfil-section perfil-senha">
                        <button 
                            className="btn btn-outline"
                            onClick={() => setModalSenhaAberto(true)}
                        >
                            Alterar Senha
                        </button>
                    </div>
                </div>
            </div>

            {/* INTERFACE DO MODAL DE ALTERAÇÃO DE SENHA */}
            {modalSenhaAberto && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="modal-content" style={{
                        backgroundColor: '#1e1e1e', padding: '2rem', borderRadius: '8px',
                        width: '100%', maxWidth: '400px', color: '#fff'
                    }}>
                        <h2>Alterar Senha</h2>
                        <form onSubmit={handleAlterarSenhaSubmit}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Senha Atual</label>
                                <input 
                                    type="password" 
                                    name="senhaAtual"
                                    required
                                    value={senhaData.senhaAtual}
                                    onChange={handleSenhaChange}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#2d2d2d', color: '#fff' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Nova Senha</label>
                                <input 
                                    type="password" 
                                    name="novaSenha"
                                    required
                                    value={senhaData.novaSenha}
                                    onChange={handleSenhaChange}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#2d2d2d', color: '#fff' }}
                                />
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem' }}>Confirmar Nova Senha</label>
                                <input 
                                    type="password" 
                                    name="confirmarNovaSenha"
                                    required
                                    value={senhaData.confirmarNovaSenha}
                                    onChange={handleSenhaChange}
                                    style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #333', backgroundColor: '#2d2d2d', color: '#fff' }}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'end', gap: '1rem' }}>
                                <Button type="button" variant="secondary" onClick={() => setModalSenhaAberto(false)}>
                                    Cancelar
                                </Button>
                                <Button type="submit" variant="primary" disabled={alterandoSenha}>
                                    {alterandoSenha ? 'Alterando...' : 'Atualizar Senha'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}