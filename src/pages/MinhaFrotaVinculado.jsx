// src/pages/vinculado/MinhaFrotaVinculado.jsx
import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

const MinhaFrotaVinculado = () => {
    const [dados, setDados] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [finalizando, setFinalizando] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [motivo, setMotivo] = useState('');

    const token = localStorage.getItem('token');

    const carregarDados = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.motoristaVinculado.getMinhaFrota(token);
            setDados(data);
        } catch (err) {
            // Verificar se é erro de "não encontrado" (404)
            if (err.message?.includes('404') || err.message?.includes('não encontrado')) {
                setDados(null);
                setError(null); // Não mostrar erro, apenas dados vazios
            } else {
                setError(err.message || 'Erro ao carregar dados da frota');
            }
            console.error('Erro ao carregar dados:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        carregarDados();
    }, []);

    const handleFinalizarVinculo = async () => {
        if (!motivo.trim()) {
            alert('Por favor, informe o motivo para finalizar o vínculo');
            return;
        }

        if (!window.confirm('Tem certeza que deseja finalizar o vínculo com esta frota? Esta ação não pode ser desfeita.')) {
            return;
        }

        setFinalizando(true);
        setError(null);
        setSuccess(null);

        try {
            await api.motoristaVinculado.finalizarVinculo(motivo, token);
            setSuccess('Vínculo finalizado com sucesso!');
            setShowModal(false);
            setMotivo('');
            // Recarregar dados
            setTimeout(() => {
                carregarDados();
            }, 1000);
        } catch (err) {
            setError(err.message || 'Erro ao finalizar vínculo');
            console.error('Erro ao finalizar vínculo:', err);
        } finally {
            setFinalizando(false);
        }
    };

    const formatarData = (data) => {
        if (!data) return '-';
        return new Date(data).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatarMoeda = (valor) => {
        if (!valor) return '-';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    };

    const getStatusLabel = (status) => {
        const map = {
            'ATIVO': 'Ativo',
            'EM_EXPERIENCIA': 'Em Experiência',
            'RENOVADO': 'Renovado',
            'ENCERRADO': 'Encerrado',
            'RESCINDIDO': 'Rescindido',
            'SUSPENSO': 'Suspenso'
        };
        return map[status] || status;
    };

    // Verificar se o motorista está vinculado a uma frota
    const estaVinculado = dados?.frota && dados?.motorista?.situacao !== 'DESLIGADO';

    if (loading) {
        return (
            <div className="motoristas-container">
                <div className="page-header">
                    <h1>Minha Frota</h1>
                    <p className="subtitle">Carregando informações...</p>
                </div>
                <div className="propostas-loading">
                    <p>Carregando...</p>
                </div>
            </div>
        );
    }

    // Se não estiver vinculado a nenhuma frota
    if (!estaVinculado || !dados?.frota) {
        return (
            <div className="motoristas-container">
                <div className="page-header">
                    <div>
                        <h1>Minha Frota</h1>
                        <p className="subtitle">Informações da frota vinculada</p>
                    </div>
                </div>

                <div className="propostas-vazio" style={{ marginTop: '2rem' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}></div>
                    <p style={{ fontSize: '1.2rem', fontWeight: 600, color: '#1F2937' }}>
                        Você não está vinculado a nenhuma frota
                    </p>
                    <p className="propostas-vazio-sub">
                        {dados?.motorista?.situacao === 'DESLIGADO' 
                            ? 'Seu vínculo com a frota foi finalizado.'
                            : 'Aguarde uma proposta de frota ou busque por frotas disponíveis.'}
                    </p>
                    {dados?.motorista?.situacao === 'DESLIGADO' && dados?.motorista?.data_demissao && (
                        <p className="propostas-vazio-sub" style={{ marginTop: '0.5rem', color: '#6B7280' }}>
                            Desligado em: {formatarData(dados.motorista.data_demissao)}
                        </p>
                    )}
                </div>
            </div>
        );
    }

    const { motorista, frota, veiculo, contrato, tem_frete_em_andamento } = dados;

    return (
        <div className="motoristas-container">
            <div className="page-header">
                <div>
                    <h1>Minha Frota</h1>
                    <p className="subtitle">Informações da frota à qual você está vinculado</p>
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

            {/* Status do Vínculo */}
            <div className="perfil-card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem', color: '#1F2937' }}>Status do Vínculo</h3>
                <div className="perfil-field">
                    <span className="perfil-label">Situação</span>
                    <span className={`perfil-value ${motorista?.situacao === 'ATIVO' ? 'status-ativo' : 'status-desligado'}`}>
                        {motorista?.situacao === 'ATIVO' ? ' Ativo' : ' Desligado'}
                    </span>
                </div>
                <div className="perfil-field">
                    <span className="perfil-label">Data de Admissão</span>
                    <span className="perfil-value">{formatarData(motorista?.data_admissao)}</span>
                </div>
                {motorista?.situacao === 'DESLIGADO' && (
                    <div className="perfil-field">
                        <span className="perfil-label">Data de Desligamento</span>
                        <span className="perfil-value">{formatarData(motorista?.data_demissao)}</span>
                    </div>
                )}
            </div>

            {/* Informações da Frota */}
            <div className="perfil-card" style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ marginBottom: '1rem', color: '#1F2937' }}>Dados da Frota</h3>
                
                <div className="perfil-field">
                    <span className="perfil-label">Nome / Razão Social</span>
                    <span className="perfil-value">{frota?.nome_razao_social || '-'}</span>
                </div>
                {frota?.nome_fantasia && (
                    <div className="perfil-field">
                        <span className="perfil-label">Nome Fantasia</span>
                        <span className="perfil-value">{frota.nome_fantasia}</span>
                    </div>
                )}
                <div className="perfil-field">
                    <span className="perfil-label">CNPJ</span>
                    <span className="perfil-value">{frota?.cpf_cnpj || '-'}</span>
                </div>
                <div className="perfil-field">
                    <span className="perfil-label">Email</span>
                    <span className="perfil-value">{frota?.email || '-'}</span>
                </div>
                <div className="perfil-field">
                    <span className="perfil-label">Telefone</span>
                    <span className="perfil-value">{frota?.telefone || frota?.celular || '-'}</span>
                </div>
                <div className="perfil-field">
                    <span className="perfil-label">Avaliação Média</span>
                    <span className="perfil-value" style={{ color: '#FF8200' }}>
                        {frota?.avaliacao_media ? `★ ${Number(frota.avaliacao_media).toFixed(1)}` : '-'}
                        {frota?.total_avaliacoes > 0 && ` (${frota.total_avaliacoes} avaliações)`}
                    </span>
                </div>
                {frota?.area_atuacao && (
                    <div className="perfil-field">
                        <span className="perfil-label">Área de Atuação</span>
                        <span className="perfil-value">{frota.area_atuacao}</span>
                    </div>
                )}
                {frota?.tipos_carga && (
                    <div className="perfil-field">
                        <span className="perfil-label">Tipos de Carga</span>
                        <span className="perfil-value">{frota.tipos_carga}</span>
                    </div>
                )}
                <div className="perfil-field">
                    <span className="perfil-label">Veículos Ativos</span>
                    <span className="perfil-value">{frota?.total_veiculos_ativos || 0}</span>
                </div>
                <div className="perfil-field">
                    <span className="perfil-label">Motoristas Ativos</span>
                    <span className="perfil-value">{frota?.total_motoristas_ativos || 0}</span>
                </div>
                <div className="perfil-field">
                    <span className="perfil-label">Fretes em Andamento</span>
                    <span className="perfil-value">{frota?.fretes_ativos || 0}</span>
                </div>
                {frota?.registro_nacional_transportador && (
                    <div className="perfil-field">
                        <span className="perfil-label">RNTRC</span>
                        <span className="perfil-value">{frota.registro_nacional_transportador}</span>
                    </div>
                )}
            </div>

            {/* Veículo Designado */}
            {veiculo && (
                <div className="perfil-card" style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem', color: '#1F2937' }}>Veículo Designado</h3>
                    <div className="perfil-field">
                        <span className="perfil-label">Placa</span>
                        <span className="perfil-value">{veiculo.placa || '-'}</span>
                    </div>
                    <div className="perfil-field">
                        <span className="perfil-label">Modelo</span>
                        <span className="perfil-value">{veiculo.marca || ''} {veiculo.modelo || ''}</span>
                    </div>
                    {veiculo.ano_fabricacao && (
                        <div className="perfil-field">
                            <span className="perfil-label">Ano</span>
                            <span className="perfil-value">{veiculo.ano_fabricacao}/{veiculo.ano_modelo || ''}</span>
                        </div>
                    )}
                    {veiculo.capacidade_kg && (
                        <div className="perfil-field">
                            <span className="perfil-label">Capacidade</span>
                            <span className="perfil-value">{veiculo.capacidade_kg} kg</span>
                        </div>
                    )}
                    {veiculo.tipo_veiculo && (
                        <div className="perfil-field">
                            <span className="perfil-label">Tipo</span>
                            <span className="perfil-value">{veiculo.tipo_veiculo}</span>
                        </div>
                    )}
                    <div className="perfil-field">
                        <span className="perfil-label">Status do Veículo</span>
                        <span className="perfil-value">
                            {veiculo.veiculo_status === 'ATIVO' ? ' Ativo' : 
                             veiculo.veiculo_status === 'MANUTENCAO' ? '🔧 Em Manutenção' : ' Inativo'}
                        </span>
                    </div>
                </div>
            )}

            {/* Contrato */}
            {contrato && (
                <div className="perfil-card" style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem', color: '#1F2937' }}>Contrato</h3>
                    <div className="perfil-field">
                        <span className="perfil-label">Tipo de Contrato</span>
                        <span className="perfil-value">{contrato.tipo_contrato || '-'}</span>
                    </div>
                    {contrato.valor_salario && (
                        <div className="perfil-field">
                            <span className="perfil-label">Salário</span>
                            <span className="perfil-value">{formatarMoeda(contrato.valor_salario)}</span>
                        </div>
                    )}
                    {contrato.valor_comissao && (
                        <div className="perfil-field">
                            <span className="perfil-label">Comissão</span>
                            <span className="perfil-value">{contrato.valor_comissao}%</span>
                        </div>
                    )}
                    <div className="perfil-field">
                        <span className="perfil-label">Status do Contrato</span>
                        <span className="perfil-value">{getStatusLabel(contrato.contrato_status)}</span>
                    </div>
                    <div className="perfil-field">
                        <span className="perfil-label">Data de Início</span>
                        <span className="perfil-value">{formatarData(contrato.data_inicio)}</span>
                    </div>
                    {contrato.periodo_experiencia && (
                        <div className="perfil-field">
                            <span className="perfil-label">Período de Experiência</span>
                            <span className="perfil-value">{contrato.periodo_experiencia} dias</span>
                        </div>
                    )}
                </div>
            )}

            {/* Botão Finalizar Vínculo */}
            {motorista?.situacao === 'ATIVO' && (
                <div className="perfil-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div>
                            <h3 style={{ margin: '0 0 0.5rem 0', color: '#1F2937' }}>Finalizar Vínculo</h3>
                            <p style={{ margin: 0, color: '#6B7280', fontSize: '0.9rem' }}>
                                {tem_frete_em_andamento 
                                    ? ' Você possui fretes em andamento. Finalize-os antes de encerrar o vínculo.'
                                    : 'Clique no botão para finalizar seu vínculo com esta frota.'}
                            </p>
                        </div>
                        <button
                            className="btn btn-danger"
                            onClick={() => setShowModal(true)}
                            disabled={tem_frete_em_andamento || finalizando}
                        >
                            {finalizando ? 'Processando...' : 'Finalizar Vínculo'}
                        </button>
                    </div>
                </div>
            )}
            
            {motorista?.situacao === 'DESLIGADO' && (
                <div className="perfil-card">
                    <div style={{ textAlign: 'center', padding: '1rem' }}>
                        <p style={{ color: '#6B7280', fontSize: '1rem' }}>
                             Vínculo finalizado em {formatarData(motorista?.data_demissao)}
                        </p>
                    </div>
                </div>
            )}

            {/* Modal de Confirmação */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3>Finalizar Vínculo</h3>
                        <p style={{ color: '#6B7280', marginBottom: '1rem' }}>
                            Tem certeza que deseja finalizar seu vínculo com <strong>{frota?.nome_razao_social}</strong>?
                            Esta ação não pode ser desfeita.
                        </p>
                        <div className="form-group">
                            <label>Motivo da finalização</label>
                            <textarea
                                className="form-textarea"
                                rows="3"
                                placeholder="Descreva o motivo para finalizar o vínculo..."
                                value={motivo}
                                onChange={(e) => setMotivo(e.target.value)}
                            />
                        </div>
                        <div className="modal-buttons">
                            <button
                                type="button"
                                className="modal-btn modal-btn-secondary"
                                onClick={() => {
                                    setShowModal(false);
                                    setMotivo('');
                                }}
                                disabled={finalizando}
                            >
                                Cancelar
                            </button>
                            <button
                                type="button"
                                className="modal-btn modal-btn-danger"
                                onClick={handleFinalizarVinculo}
                                disabled={finalizando || !motivo.trim()}
                            >
                                {finalizando ? 'Finalizando...' : 'Sim, Finalizar Vínculo'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MinhaFrotaVinculado;