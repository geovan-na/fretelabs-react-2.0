// src/pages/PropostasVinculado.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import CardPropostaEnviada from '../components/CardPropostaEnviada';
import CardPropostaRecebida from '../components/CardPropostaRecebida';
import ModalEnviarProposta from '../components/ModalEnviarProposta';

const PropostasVinculado = () => {
    const [activeTab, setActiveTab] = useState('enviadas');
    const [propostasEnviadas, setPropostasEnviadas] = useState([]);
    const [propostasRecebidas, setPropostasRecebidas] = useState([]);
    const [frotasDisponiveis, setFrotasDisponiveis] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [selectedFrota, setSelectedFrota] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const token = localStorage.getItem('token');
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const getUserData = async () => {
            try {
                const data = await api.auth.getMe(token);
                setUserData(data);
            } catch (err) {
                console.error('Erro ao buscar dados do usuário:', err);
            }
        };
        getUserData();
    }, []);

    useEffect(() => {
        carregarDados();
    }, [activeTab]);

const carregarDados = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
        if (activeTab === 'enviadas') {
            const data = await api.propostas.listarEnviadas(token);
            const lista = Array.isArray(data) ? data : (data?.data || data?.propostas || []);
            setPropostasEnviadas(lista);
        } else if (activeTab === 'recebidas') {
            const data = await api.propostas.listarRecebidas(token);
            const lista = Array.isArray(data) ? data : (data?.data || data?.propostas || []);
            setPropostasRecebidas(lista);
        } else if (activeTab === 'buscar') {
            const data = await api.motoristaVinculado.listarFrotasDisponiveis(token, searchTerm);
            
            // Garante que pegamos o array, independente da estrutura da resposta
            const lista = Array.isArray(data) 
                ? data 
                : (data?.data || data?.frotas || []);
                
            setFrotasDisponiveis(lista);
        }
    } catch (err) {
        setError(err.message || 'Erro ao carregar dados');
        console.error('Erro ao carregar dados:', err);
    } finally {
        setLoading(false);
    }
};

    const handleBuscarFrotas = () => {
        carregarDados();
    };

    const handleEnviarProposta = async (dados) => {
        setLoading(true);
        try {
            await api.propostas.enviar(dados, token);
            setSuccess('Proposta enviada com sucesso!');
            setShowModal(false);
            carregarDados();
        } catch (err) {
            setError(err.message || 'Erro ao enviar proposta');
        } finally {
            setLoading(false);
        }
    };

    const prepararFrotaParaModal = (frota) => {
        return {
            id: frota.id,
            pessoa_id: frota.pessoa_id,
            nome_razao_social: frota.nome_razao_social,
            cpf_cnpj: frota.cpf_cnpj,
            email: frota.email,
            telefone: frota.telefone,
            avaliacao_media: frota.avaliacao_media,
            total_avaliacoes: frota.total_avaliacoes,
            area_atuacao: frota.area_atuacao,
            tipos_carga: frota.tipos_carga,
            total_veiculos: frota.total_veiculos,
            motoristas_ativos: frota.motoristas_ativos,
            fretes_ativos: frota.fretes_ativos,
            proposta_pendente: frota.proposta_pendente,
            proposta_id: frota.proposta_id,
            proposta_status: frota.proposta_status
        };
    };

    return (
        <div className="propostas-container">
            <div className="page-header">
                <div>
                    <h1>Propostas</h1>
                    <p className="subtitle">Gerencie suas propostas com frotas</p>
                </div>
            </div>

            {/* Mensagens */}
            {error && (
                <div className="propostas-mensagem erro">
                    <p>{error}</p>
                </div>
            )}
            {success && (
                <div className="propostas-mensagem sucesso">
                    <p>{success}</p>
                </div>
            )}

            {/* Tabs */}
            <div className="propostas-guias">
                <button 
                    className={`propostas-guia-btn ${activeTab === 'enviadas' ? 'active' : ''}`}
                    onClick={() => setActiveTab('enviadas')}
                >
                    Minhas Propostas
                </button>
                <button 
                    className={`propostas-guia-btn ${activeTab === 'recebidas' ? 'active' : ''}`}
                    onClick={() => setActiveTab('recebidas')}
                >
                    Propostas Recebidas
                </button>
                <button 
                    className={`propostas-guia-btn ${activeTab === 'buscar' ? 'active' : ''}`}
                    onClick={() => setActiveTab('buscar')}
                >
                    Buscar Frotas
                </button>
            </div>

            {/* Conteúdo */}
            {loading ? (
                <div className="propostas-loading">
                    <p>Carregando...</p>
                </div>
            ) : (
                <>
                    {/* Aba 1: Propostas Enviadas */}
                    {activeTab === 'enviadas' && (
                        <div className="propostas-grid">
                            {propostasEnviadas.length === 0 ? (
                                <div className="propostas-vazio">
                                    <p>Você ainda não enviou nenhuma proposta</p>
                                    <p className="propostas-vazio-sub">Clique em "Buscar Frotas" para encontrar frotas</p>
                                </div>
                            ) : (
                                propostasEnviadas.map((proposta) => (
                                    <CardPropostaEnviada
                                        key={proposta.id}
                                        proposta={proposta}
                                        onUpdate={carregarDados}
                                    />
                                ))
                            )}
                        </div>
                    )}

                    {/* Aba 2: Propostas Recebidas */}
                    {activeTab === 'recebidas' && (
                        <div className="propostas-grid">
                            {propostasRecebidas.length === 0 ? (
                                <div className="propostas-vazio">
                                    <p>Nenhuma proposta recebida</p>
                                    <p className="propostas-vazio-sub">Aguardando propostas de frotas</p>
                                </div>
                            ) : (
                                propostasRecebidas.map((proposta) => (
                                    <CardPropostaRecebida
                                        key={proposta.id}
                                        proposta={proposta}
                                        onUpdate={carregarDados}
                                    />
                                ))
                            )}
                        </div>
                    )}

                    {/* Aba 3: Buscar Frotas */}
                    {activeTab === 'buscar' && (
                        <div>
                            <div className="buscar-frotas-header">
                                <div className="buscar-frotas-input">
                                    <input
                                        type="text"
                                        placeholder="Buscar frotas por nome, CNPJ ou área de atuação..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleBuscarFrotas()}
                                    />
                                    <button className="btn btn-primary" onClick={handleBuscarFrotas}>
                                        Buscar
                                    </button>
                                </div>
                            </div>

                            <div className="propostas-grid">
                                {frotasDisponiveis.length === 0 ? (
                                    <div className="propostas-vazio">
                                        <p>Nenhuma frota encontrada</p>
                                        <p className="propostas-vazio-sub">Tente buscar por outro termo</p>
                                    </div>
                                ) : (
                                    frotasDisponiveis.map((frota) => (
                                        <div key={frota.id} className="card-proposta">
                                            <div className="card-proposta-header">
                                                <div>
                                                    <span className="card-proposta-nome">{frota.nome_razao_social}</span>
                                                    <div className="card-proposta-data">
                                                        {frota.cpf_cnpj} • {frota.total_veiculos || 0} veículos
                                                    </div>
                                                </div>
                                                <div className="frota-avaliacao">
                                                    <span className="stars">★ {frota.avaliacao_media || 0}</span>
                                                    <span className="total">({frota.total_avaliacoes || 0})</span>
                                                </div>
                                            </div>

                                            <div className="card-proposta-info">
                                                <div className="card-proposta-info-item">
                                                    <span className="card-proposta-info-label">Área de Atuação</span>
                                                    <span className="card-proposta-info-value">{frota.area_atuacao || '-'}</span>
                                                </div>
                                                <div className="card-proposta-info-item">
                                                    <span className="card-proposta-info-label">Tipos de Carga</span>
                                                    <span className="card-proposta-info-value">{frota.tipos_carga || '-'}</span>
                                                </div>
                                                <div className="card-proposta-info-item">
                                                    <span className="card-proposta-info-label">Motoristas Ativos</span>
                                                    <span className="card-proposta-info-value">{frota.motoristas_ativos || 0}</span>
                                                </div>
                                                <div className="card-proposta-info-item">
                                                    <span className="card-proposta-info-label">Fretes Ativos</span>
                                                    <span className="card-proposta-info-value">{frota.fretes_ativos || 0}</span>
                                                </div>
                                            </div>

                                            {frota.proposta_pendente && (
                                                <div className="proposta-aviso">
                                                    <p>⚠️ Você já tem uma proposta {frota.proposta_status?.toLowerCase()} para esta frota</p>
                                                </div>
                                            )}

                                            <div className="card-proposta-actions">
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    disabled={frota.proposta_pendente}
                                                    onClick={() => {
                                                        const frotaFormatada = prepararFrotaParaModal(frota);
                                                        setSelectedFrota(frotaFormatada);
                                                        setShowModal(true);
                                                    }}
                                                >
                                                    {frota.proposta_pendente ? 'Proposta Enviada' : 'Enviar Proposta'}
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Modal de Enviar Proposta */}
            {showModal && selectedFrota && (
                <ModalEnviarProposta
                    motorista={selectedFrota}
                    onClose={() => {
                        setShowModal(false);
                        setSelectedFrota(null);
                    }}
                    onSuccess={() => {
                        setShowModal(false);
                        setSelectedFrota(null);
                        carregarDados();
                    }}
                />
            )}
        </div>
    );
};

export default PropostasVinculado;