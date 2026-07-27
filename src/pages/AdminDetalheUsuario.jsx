// src/pages/admin/AdminDetalheUsuario.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import StatusBadgeAdmin from '../components/StatusBadgeAdmin';
import ModalConfirmacao from '../components/ModalConfirmacao';

const AdminDetalheUsuario = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    
    const [usuario, setUsuario] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [modal, setModal] = useState({
        isOpen: false,
        type: 'danger',
        title: '',
        message: '',
        detail: '',
        confirmText: 'Confirmar',
        onConfirm: null,
        isLoading: false
    });

    useEffect(() => {
        carregarUsuario();
    }, [id]);

    const carregarUsuario = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.admin.buscarUsuario(id, token);
            if (response.success) {
                setUsuario(response.data);
            } else {
                setError(response.message || 'Erro ao carregar usuário');
            }
        } catch (err) {
            setError(err.message || 'Erro ao carregar usuário');
        } finally {
            setLoading(false);
        }
    };

    const formatarCpfCnpj = (valor) => {
        if (!valor) return '-';
        const numeros = valor.replace(/\D/g, '');
        if (numeros.length === 11) {
            return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        }
        if (numeros.length === 14) {
            return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
        }
        return valor;
    };

    const formatarData = (data) => {
        if (!data) return '-';
        return new Date(data).toLocaleDateString('pt-BR');
    };

    const formatarDataHora = (data) => {
        if (!data) return '-';
        return new Date(data).toLocaleString('pt-BR');
    };

    const getTipoLabel = (tipo) => {
        const tipos = {
            'ADMIN': 'Administrador',
            'EMBARCADOR': 'Embarcador',
            'FROTA': 'Frota',
            'AUTONOMO': 'Autônomo',
            'VINCULADO': 'Vinculado',
            'USUARIO': 'Usuário'
        };
        return tipos[tipo] || tipo;
    };

    const getStatusLabel = (status) => {
        const statusMap = {
            'PENDENTE': 'Pendente',
            'APROVADO': 'Aprovado',
            'REPROVADO': 'Reprovado',
            'BLOQUEADO': 'Bloqueado'
        };
        return statusMap[status] || status;
    };

const handleVoltar = () => {
        navigate('/dashboard/admin/usuarios');
    };

    if (loading) {
        return (
            <div className="detalhe-usuario-loading">
                <p>Carregando dados do usuário...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="detalhe-usuario-error">
                <p>{error}</p>
                <button className="btn btn-primary" onClick={handleVoltar}>
                    Voltar para lista
                </button>
            </div>
        );
    }

    if (!usuario) {
        return (
            <div className="detalhe-usuario-error">
                <p>Usuário não encontrado</p>
                <button className="btn btn-primary" onClick={handleVoltar}>
                    Voltar para lista
                </button>
            </div>
        );
    }

    return (
        <div className="detalhe-usuario-container">
            <div className="detalhe-usuario-header">
                <button className="btn-voltar" onClick={handleVoltar}>
                    ← Voltar
                </button>
                <h1>Detalhes do Usuário</h1>
            </div>

            <div className="detalhe-usuario-grid">
                {/* Dados Pessoais */}
                <div className="detalhe-usuario-section">
                    <h3>Dados Pessoais</h3>
                    <div className="detalhe-usuario-field">
                        <span className="label">Nome/Razão Social</span>
                        <span className="value">{usuario.nome_razao_social}</span>
                    </div>
                    {usuario.nome_fantasia && (
                        <div className="detalhe-usuario-field">
                            <span className="label">Nome Fantasia</span>
                            <span className="value">{usuario.nome_fantasia}</span>
                        </div>
                    )}
                    <div className="detalhe-usuario-field">
                        <span className="label">CPF/CNPJ</span>
                        <span className="value">{formatarCpfCnpj(usuario.cpf_cnpj)}</span>
                    </div>
                    <div className="detalhe-usuario-field">
                        <span className="label">Tipo de Pessoa</span>
                        <span className="value">
                            {usuario.tipo_pessoa === 'FISICA' ? 'Física' : 'Jurídica'}
                        </span>
                    </div>
                    <div className="detalhe-usuario-field">
                        <span className="label">Email</span>
                        <span className="value">{usuario.email}</span>
                    </div>
                    <div className="detalhe-usuario-field">
                        <span className="label">Telefone</span>
                        <span className="value">{usuario.telefone || '-'}</span>
                    </div>
                    <div className="detalhe-usuario-field">
                        <span className="label">Celular</span>
                        <span className="value">{usuario.celular || '-'}</span>
                    </div>
                </div>

                {/* Status e Tipo */}
                <div className="detalhe-usuario-section">
                    <h3>Status e Tipo</h3>
                    <div className="detalhe-usuario-field">
                        <span className="label">Tipo de Usuário</span>
                        <span className="value">{getTipoLabel(usuario.tipo_usuario)}</span>
                    </div>
                    <div className="detalhe-usuario-field">
                        <span className="label">Status</span>
                        <span className="value">
                            <StatusBadgeAdmin status={usuario.status} type="usuario" />
                        </span>
                    </div>
                    <div className="detalhe-usuario-field">
                        <span className="label">Data de Cadastro</span>
                        <span className="value">{formatarData(usuario.data_cadastro)}</span>
                    </div>
                    {usuario.is_admin && (
                        <div className="detalhe-usuario-field">
                            <span className="label">Administrador</span>
                            <span className="value">✅ Sim</span>
                        </div>
                    )}
                    {usuario.observacoes && (
                        <div className="detalhe-usuario-field">
                            <span className="label">Observações</span>
                            <span className="value">{usuario.observacoes}</span>
                        </div>
                    )}
                </div>

                {/* Dados do Embarcador */}
                {usuario.embarcador && (
                    <div className="detalhe-usuario-section">
                        <h3>Dados do Embarcador</h3>
                        <div className="detalhe-usuario-field">
                            <span className="label">Inscrição Estadual</span>
                            <span className="value">{usuario.embarcador.inscricao_estadual || '-'}</span>
                        </div>
                        <div className="detalhe-usuario-field">
                            <span className="label">Porte da Empresa</span>
                            <span className="value">{usuario.embarcador.porte_empresa || '-'}</span>
                        </div>
                        <div className="detalhe-usuario-field">
                            <span className="label">Score de Crédito</span>
                            <span className="value">{usuario.embarcador.score_credito || '-'}</span>
                        </div>
                        <div className="detalhe-usuario-field">
                            <span className="label">Limite de Crédito</span>
                            <span className="value">
                                {usuario.embarcador.limite_credito 
                                    ? `R$ ${Number(usuario.embarcador.limite_credito).toFixed(2)}`
                                    : '-'
                                }
                            </span>
                        </div>
                        <div className="detalhe-usuario-field">
                            <span className="label">Dias para Pagamento</span>
                            <span className="value">{usuario.embarcador.dias_pagamento || '-'}</span>
                        </div>
                        <div className="detalhe-usuario-field">
                            <span className="label">Contrato Assinado</span>
                            <span className="value">
                                {usuario.embarcador.contrato_assinado ? '✅ Sim' : '❌ Não'}
                            </span>
                        </div>
                    </div>
                )}

                {/* Dados do Transportador */}
                {usuario.transportador && (
                    <div className="detalhe-usuario-section">
                        <h3>Dados do Transportador</h3>
                        <div className="detalhe-usuario-field">
                            <span className="label">Tipo</span>
                            <span className="value">
                                {usuario.transportador.tipo_transportador === 'FROTA' ? 'Frota' : 'Autônomo'}
                            </span>
                        </div>
                        <div className="detalhe-usuario-field">
                            <span className="label">RNTRC</span>
                            <span className="value">
                                {usuario.transportador.registro_nacional_transportador || '-'}
                            </span>
                        </div>
                        <div className="detalhe-usuario-field">
                            <span className="label">Avaliação Média</span>
                            <span className="value">
                                {usuario.transportador.avaliacao_media 
                                    ? `${Number(usuario.transportador.avaliacao_media).toFixed(1)} ⭐`
                                    : 'Sem avaliações'
                                }
                            </span>
                        </div>
                        <div className="detalhe-usuario-field">
                            <span className="label">Total de Avaliações</span>
                            <span className="value">{usuario.transportador.total_avaliacoes || 0}</span>
                        </div>
                        <div className="detalhe-usuario-field">
                            <span className="label">Quantidade de Veículos</span>
                            <span className="value">{usuario.transportador.quantidade_veiculos || 0}</span>
                        </div>
                        <div className="detalhe-usuario-field">
                            <span className="label">Verificação Documental</span>
                            <span className="value">
                                {usuario.transportador.verificacao_documental ? '✅ Verificado' : '❌ Pendente'}
                            </span>
                        </div>
                    </div>
                )}

                {/* Dados do Motorista Vinculado */}
                {usuario.motorista_vinculado && (
                    <div className="detalhe-usuario-section">
                        <h3>Dados do Motorista Vinculado</h3>
                        <div className="detalhe-usuario-field">
                            <span className="label">CNH</span>
                            <span className="value">{usuario.motorista_vinculado.cnh || '-'}</span>
                        </div>
                        <div className="detalhe-usuario-field">
                            <span className="label">Categoria</span>
                            <span className="value">{usuario.motorista_vinculado.cnh_categoria || '-'}</span>
                        </div>
                        <div className="detalhe-usuario-field">
                            <span className="label">Validade da CNH</span>
                            <span className="value">{formatarData(usuario.motorista_vinculado.cnh_validade)}</span>
                        </div>
                        <div className="detalhe-usuario-field">
                            <span className="label">Status</span>
                            <span className="value">
                                <StatusBadgeAdmin 
                                    status={usuario.motorista_vinculado.status} 
                                    type="motorista"
                                />
                            </span>
                        </div>
                        <div className="detalhe-usuario-field">
                            <span className="label">Data de Admissão</span>
                            <span className="value">{formatarData(usuario.motorista_vinculado.data_admissao)}</span>
                        </div>
                        {usuario.motorista_vinculado.data_demissao && (
                            <div className="detalhe-usuario-field">
                                <span className="label">Data de Demissão</span>
                                <span className="value">{formatarData(usuario.motorista_vinculado.data_demissao)}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Endereços */}
                {usuario.enderecos && usuario.enderecos.length > 0 && (
                    <div className="detalhe-usuario-section full-width">
                        <h3>Endereços</h3>
                        {usuario.enderecos.map((endereco, index) => (
                            <div key={index} className="endereco-item">
                                <div className="endereco-tipo">
                                    {endereco.tipo_endereco} {endereco.principal && '⭐ Principal'}
                                </div>
                                <div className="endereco-completo">
                                    {endereco.logradouro}, {endereco.numero}
                                    {endereco.complemento && ` - ${endereco.complemento}`}
                                    <br />
                                    {endereco.bairro} - {endereco.cidade}/{endereco.estado}
                                    <br />
                                    CEP: {endereco.cep}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Logs */}
                {usuario.logs && usuario.logs.length > 0 && (
                    <div className="detalhe-usuario-section full-width">
                        <h3>Últimas Atividades</h3>
                        <div className="logs-list">
                            {usuario.logs.map((log) => (
                                <div key={log.id} className="log-item">
                                    <div className="log-acao">{log.acao}</div>
                                    <div className="log-detalhe">
                                        Tabela: {log.tabela_afetada} - ID: {log.registro_id}
                                    </div>
                                    <div className="log-data">{formatarDataHora(log.data_hora)}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDetalheUsuario;