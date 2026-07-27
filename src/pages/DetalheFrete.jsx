// pages/DetalheFretes.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';

export default function DetalheFretes() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [frete, setFrete] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [cancelando, setCancelando] = useState(false);
    const [showCandidatura, setShowCandidatura] = useState(false);
    const [candidaturaData, setCandidaturaData] = useState({
        valor_lance: '',
        mensagem: ''
    });
    const [enviandoCandidatura, setEnviandoCandidatura] = useState(false);
    const [jaCandidatou, setJaCandidatou] = useState(false);

    const token = localStorage.getItem('token');

    // 🔥 CORREÇÃO: O tipo do usuário vem em minúsculo
    const userTipo = user?.tipo?.toLowerCase() || '';
    
    // 🔥 Um usuário é "transportador" se for frota ou autonomo
    const isFrota = userTipo === 'frota';
    const isAutonomo = userTipo === 'autonomo';
    const isEmbarcador = userTipo === 'embarcador';
    const isTransportador = isFrota || isAutonomo;  // ← ISSO ESTÁ CERTO

    console.log('===== DEBUG =====');
    console.log('userTipo:', userTipo);
    console.log('isFrota:', isFrota);
    console.log('isAutonomo:', isAutonomo);
    console.log('isTransportador:', isTransportador);
    console.log('===============');

    const isCandidatarRoute = location.pathname.endsWith('/candidatar');

    useEffect(() => {
        carregarDetalhes();
        if (isTransportador) {
            verificarCandidatura();
        }
        if (isCandidatarRoute) {
            setShowCandidatura(true);
        }
    }, [id]);

    const carregarDetalhes = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.fretes.buscar(id, token);
            setFrete(response.data);
        } catch (err) {
            console.error('Erro ao carregar detalhes:', err);
            setError('Erro ao carregar detalhes do frete.');
        } finally {
            setLoading(false);
        }
    };

    const verificarCandidatura = async () => {
        try {
            const response = await api.candidaturas.listarMinhas(token);
            const jaCandidatou = response.data.some(c => c.frete_id === parseInt(id));
            setJaCandidatou(jaCandidatou);
        } catch (err) {
            console.error('Erro ao verificar candidatura:', err);
        }
    };

    const handleCancelar = async () => {
        setCancelando(true);
        try {
            await api.fretes.cancelar(id, 'Cancelado pelo embarcador', token);
            setShowConfirm(false);
            navigate('/dashboard/embarcador/fretes');
        } catch (error) {
            console.error('Erro ao cancelar frete:', error);
            alert('Erro ao cancelar frete. Tente novamente.');
            setCancelando(false);
        }
    };

    const handleEnviarCandidatura = async () => {
        if (!candidaturaData.valor_lance || parseFloat(candidaturaData.valor_lance) <= 0) {
            alert('Informe um valor de lance válido.');
            return;
        }

        setEnviandoCandidatura(true);
        try {
            await api.candidaturas.criar({
                frete_id: parseInt(id),
                valor_lance: parseFloat(candidaturaData.valor_lance),
                mensagem: candidaturaData.mensagem || ''
            }, token);
            
            alert('Candidatura enviada com sucesso!');
            setShowCandidatura(false);
            setJaCandidatou(true);
            
            navigate(`/dashboard/${userTipo}/candidaturas`);
        } catch (error) {
            console.error('Erro ao enviar candidatura:', error);
            alert(error.message || 'Erro ao enviar candidatura. Tente novamente.');
        } finally {
            setEnviandoCandidatura(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'AGUARDANDO': 'status-aguardando',
            'NEGOCIACAO': 'status-negociacao',
            'ACEITO': 'status-aceito',
            'TRANSITO': 'status-transito',
            'CONCLUIDO': 'status-concluido',
            'CANCELADO': 'status-cancelado'
        };
        return statusMap[status] || '';
    };

    const getStatusTexto = (status) => {
        const statusMap = {
            'AGUARDANDO': 'Aguardando',
            'NEGOCIACAO': 'Negociação',
            'ACEITO': 'Aceito',
            'TRANSITO': 'Em Trânsito',
            'CONCLUIDO': 'Concluído',
            'CANCELADO': 'Cancelado'
        };
        return statusMap[status] || status;
    };

    const formatarMoeda = (valor) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor || 0);
    };

    const formatarData = (data) => {
        if (!data) return '-';
        return new Date(data).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // 🔥 PODE CANDIDATAR SE FOR FROTA OU AUTONOMO E O FRETE ESTIVER DISPONÍVEL
    const podeCandidatar = (isFrota || isAutonomo) && 
        frete && 
        ['AGUARDANDO', 'NEGOCIACAO'].includes(frete.status) && 
        !jaCandidatou;

    console.log('podeCandidatar:', podeCandidatar);

    if (loading) {
        return (
            <div className="detalhe-frete-loading">
                <p>Carregando detalhes do frete...</p>
            </div>
        );
    }

    if (error || !frete) {
        return (
            <div className="detalhe-frete-error">
                <p>{error || 'Frete não encontrado'}</p>
                <button 
                    onClick={() => navigate(-1)} 
                    className="btn btn-primary"
                >
                    Voltar
                </button>
            </div>
        );
    }

    return (
        <div className="detalhe-frete-container">
            {/* CABEÇALHO */}
            <div className="detalhe-frete-header">
                <button 
                    className="detalhe-frete-voltar"
                    onClick={() => navigate(-1)}
                >
                    ← Voltar
                </button>
                <div className="detalhe-frete-titulo">
                    <h1>Frete #{frete.id}</h1>
                    <span className={`status-badge ${getStatusBadge(frete.status)}`}>
                        {getStatusTexto(frete.status)}
                    </span>
                </div>
            </div>

            {/* INFORMAÇÕES DO FRETE */}
            <div className="detalhe-frete-grid">
                {/* ORIGEM */}
                <div className="detalhe-frete-section">
                    <h3>Origem</h3>
                    <div className="detalhe-frete-field">
                        <span className="detalhe-frete-label">CEP</span>
                        <span className="detalhe-frete-value">{frete.origem_cep || '-'}</span>
                    </div>
                    <div className="detalhe-frete-field">
                        <span className="detalhe-frete-label">Endereço</span>
                        <span className="detalhe-frete-value">{frete.origem_endereco || '-'}</span>
                    </div>
                </div>

                {/* DESTINO */}
                <div className="detalhe-frete-section">
                    <h3>Destino</h3>
                    <div className="detalhe-frete-field">
                        <span className="detalhe-frete-label">CEP</span>
                        <span className="detalhe-frete-value">{frete.destino_cep || '-'}</span>
                    </div>
                    <div className="detalhe-frete-field">
                        <span className="detalhe-frete-label">Endereço</span>
                        <span className="detalhe-frete-value">{frete.destino_endereco || '-'}</span>
                    </div>
                </div>

                {/* CARGA */}
                <div className="detalhe-frete-section">
                    <h3>Carga</h3>
                    <div className="detalhe-frete-field">
                        <span className="detalhe-frete-label">Tipo</span>
                        <span className="detalhe-frete-value">{frete.tipo_carga || '-'}</span>
                    </div>
                    <div className="detalhe-frete-field">
                        <span className="detalhe-frete-label">Descrição</span>
                        <span className="detalhe-frete-value">{frete.descricao_carga || '-'}</span>
                    </div>
                    <div className="detalhe-frete-field">
                        <span className="detalhe-frete-label">Peso</span>
                        <span className="detalhe-frete-value">{frete.peso_kg ? `${frete.peso_kg} kg` : '-'}</span>
                    </div>
                    <div className="detalhe-frete-field">
                        <span className="detalhe-frete-label">Volume</span>
                        <span className="detalhe-frete-value">{frete.volume_m3 ? `${frete.volume_m3} m³` : '-'}</span>
                    </div>
                    <div className="detalhe-frete-field">
                        <span className="detalhe-frete-label">Pallets</span>
                        <span className="detalhe-frete-value">{frete.pallets || '-'}</span>
                    </div>
                </div>

                {/* VALORES */}
                <div className="detalhe-frete-section">
                    <h3>Valores</h3>
                    <div className="detalhe-frete-field">
                        <span className="detalhe-frete-label">Valor Ofertado</span>
                        <span className="detalhe-frete-value detalhe-frete-destaque">{formatarMoeda(frete.valor_ofertado)}</span>
                    </div>
                    <div className="detalhe-frete-field">
                        <span className="detalhe-frete-label">Valor Fechado</span>
                        <span className="detalhe-frete-value">{formatarMoeda(frete.valor_fechado)}</span>
                    </div>
                </div>

                {/* DATAS */}
                <div className="detalhe-frete-section">
                    <h3>Datas</h3>
                    <div className="detalhe-frete-field">
                        <span className="detalhe-frete-label">Publicação</span>
                        <span className="detalhe-frete-value">{formatarData(frete.data_publicacao)}</span>
                    </div>
                    <div className="detalhe-frete-field">
                        <span className="detalhe-frete-label">Coleta Prevista</span>
                        <span className="detalhe-frete-value">{formatarData(frete.data_coleta_prevista)}</span>
                    </div>
                    <div className="detalhe-frete-field">
                        <span className="detalhe-frete-label">Entrega Prevista</span>
                        <span className="detalhe-frete-value">{formatarData(frete.data_entrega_prevista)}</span>
                    </div>
                    <div className="detalhe-frete-field">
                        <span className="detalhe-frete-label">Limite Candidatura</span>
                        <span className="detalhe-frete-value">{formatarData(frete.data_limite_candidatura) || '-'}</span>
                    </div>
                </div>

                {/* INFORMAÇÕES ADICIONAIS */}
                <div className="detalhe-frete-section">
                    <h3>Informações Adicionais</h3>
                    <div className="detalhe-frete-field">
                        <span className="detalhe-frete-label">Prioridade</span>
                        <span className="detalhe-frete-value">{frete.prioridade || 'NORMAL'}</span>
                    </div>
                    <div className="detalhe-frete-field">
                        <span className="detalhe-frete-label">Responsável Descarga</span>
                        <span className="detalhe-frete-value">{frete.responsavel_descarga || '-'}</span>
                    </div>
                    <div className="detalhe-frete-field">
                        <span className="detalhe-frete-label">Instruções Descarga</span>
                        <span className="detalhe-frete-value">{frete.instrucoes_descarga || '-'}</span>
                    </div>
                    {frete.motivo_cancelamento && (
                        <div className="detalhe-frete-field">
                            <span className="detalhe-frete-label">Motivo Cancelamento</span>
                            <span className="detalhe-frete-value detalhe-frete-cancelado">{frete.motivo_cancelamento}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* 🔥 BOTÃO DE CANDIDATAR - SÓ APARECE PARA FROTA E AUTONOMO */}
            {podeCandidatar && (
                <div className="detalhe-frete-actions">
                    <button 
                        className="btn btn-success"
                        onClick={() => setShowCandidatura(true)}
                    >
                        Candidatar-se a este frete
                    </button>
                </div>
            )}

            {/* BOTÃO DE CANCELAR (EMBARCADOR) */}
            {isEmbarcador && ['AGUARDANDO', 'NEGOCIACAO'].includes(frete.status) && (
                <div className="detalhe-frete-actions">
                    <button 
                        className="btn btn-danger"
                        onClick={() => setShowConfirm(true)}
                    >
                        Cancelar Frete
                    </button>
                </div>
            )}

            {/* MODAL DE CANDIDATURA */}
            {showCandidatura && (
                <div className="modal-overlay" onClick={() => setShowCandidatura(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Candidatar-se ao Frete #{frete.id}</h3>
                        <p>Informe o valor do seu lance e uma mensagem para o embarcador.</p>
                        
                        <div className="form-group">
                            <label>Valor do Lance <span>*</span></label>
                            <input
                                type="number"
                                step="0.01"
                                value={candidaturaData.valor_lance}
                                onChange={(e) => setCandidaturaData(prev => ({
                                    ...prev,
                                    valor_lance: e.target.value
                                }))}
                                placeholder="2500.00"
                                className="form-input"
                            />
                        </div>

                        <div className="form-group">
                            <label>Mensagem (opcional)</label>
                            <textarea
                                value={candidaturaData.mensagem}
                                onChange={(e) => setCandidaturaData(prev => ({
                                    ...prev,
                                    mensagem: e.target.value
                                }))}
                                placeholder="Descreva sua disponibilidade e capacidade..."
                                className="form-textarea"
                                rows={3}
                            />
                        </div>

                        <div className="modal-buttons">
                            <button 
                                className="modal-btn modal-btn-secondary"
                                onClick={() => setShowCandidatura(false)}
                                disabled={enviandoCandidatura}
                            >
                                Cancelar
                            </button>
                            <button 
                                className="modal-btn modal-btn-primary"
                                onClick={handleEnviarCandidatura}
                                disabled={enviandoCandidatura}
                            >
                                {enviandoCandidatura ? 'Enviando...' : 'Enviar Candidatura'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE CONFIRMAÇÃO DE CANCELAMENTO */}
            {showConfirm && (
                <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Cancelar Frete</h3>
                        <p>Tem certeza que deseja cancelar o frete <strong>#{frete.id}</strong>?</p>
                        <p className="modal-aviso">Esta ação não pode ser desfeita.</p>
                        <div className="modal-buttons">
                            <button 
                                className="modal-btn modal-btn-secondary"
                                onClick={() => setShowConfirm(false)}
                                disabled={cancelando}
                            >
                                Voltar
                            </button>
                            <button 
                                className="modal-btn modal-btn-danger"
                                onClick={handleCancelar}
                                disabled={cancelando}
                            >
                                {cancelando ? 'Cancelando...' : 'Sim, cancelar frete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}