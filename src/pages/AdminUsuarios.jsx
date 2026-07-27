// src/pages/admin/AdminUsuarios.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import FiltroUsuarios from '../components/FiltroUsuarios';
import TabelaUsuarios from '../components/TabelaUsuarios';
import ModalConfirmacao from '../components/ModalConfirmacao';

const AdminUsuarios = () => {
    const navigate = useNavigate();
    const { token } = useAuth();
    
    // Estados
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0
    });
    const [params, setParams] = useState('');
    
    // Estados do Modal
    const [modal, setModal] = useState({
        isOpen: false,
        type: 'danger',
        title: '',
        message: '',
        detail: '',
        confirmText: 'Confirmar',
        onConfirm: null,
        usuarioId: null,
        isLoading: false
    });

    // Buscar usuários
    const carregarUsuarios = useCallback(async (filtros = '') => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await api.admin.listarUsuarios(token, filtros);
            
            // Verifica se 'data' existe
            if (response.data) {
                setUsuarios(response.data);
                // Ajusta a captura do total
                setPagination(prev => ({ ...prev, total: response.total || 0 }));
            } else {
                setError(response.message || 'Erro ao carregar usuários');
            }
        } catch (err) {
            setError(err.message || 'Erro ao carregar usuários');
        } finally {
            setLoading(false);
        }
    }, [token]);

    // Carregar ao montar
    useEffect(() => {
        carregarUsuarios(params);
    }, [carregarUsuarios, params]);

    // Aplicar filtros
    const handleFilter = (filtros) => {
        setParams(filtros);
    };

    // Paginação
    const handlePageChange = (novaPagina) => {
        const newParams = new URLSearchParams(params);
        newParams.set('page', novaPagina);
        setParams(newParams.toString());
    };

    // Navegar para detalhes
    const handleVerDetalhes = (id) => {
        navigate(`/dashboard/admin/usuarios/${id}`);
    };

    // Abrir modal de confirmação
    const abrirModal = (type, title, message, detail, confirmText, onConfirm, usuarioId) => {
        setModal({
            isOpen: true,
            type,
            title,
            message,
            detail,
            confirmText,
            onConfirm: () => handleConfirmAction(onConfirm, usuarioId),
            usuarioId,
            isLoading: false
        });
    };

    // Confirmar ação
    const handleConfirmAction = async (acao, usuarioId) => {
        try {
            setModal(prev => ({ ...prev, isLoading: true }));
            
            let response;
            switch (acao) {
                case 'bloquear':
                    response = await api.admin.bloquearUsuario(usuarioId, 'Bloqueado pelo administrador', token);
                    break;
                case 'desbloquear':
                    response = await api.admin.desbloquearUsuario(usuarioId, token);
                    break;
                case 'aprovar':
                    response = await api.admin.aprovarUsuario(usuarioId, token);
                    break;
                case 'reprovar':
                    response = await api.admin.reprovarUsuario(usuarioId, 'Reprovado pelo administrador', token);
                    break;
                default:
                    return;
            }

            if (response.success) {
                setModal(prev => ({ ...prev, isOpen: false }));
                // Recarregar lista
                carregarUsuarios(params);
            } else {
                setModal(prev => ({ 
                    ...prev, 
                    isLoading: false,
                    message: response.message || 'Erro ao executar ação'
                }));
            }
        } catch (err) {
            setModal(prev => ({ 
                ...prev, 
                isLoading: false,
                message: err.message || 'Erro ao executar ação'
            }));
        }
    };

    // Ações dos usuários
    const handleBloquear = (id) => {
        const usuario = usuarios.find(u => u.id === id);
        abrirModal(
            'danger',
            'Bloquear Usuário',
            `Tem certeza que deseja bloquear o usuário "${usuario?.nome_razao_social}"?`,
            'O usuário será bloqueado e não poderá mais acessar a plataforma.',
            'Bloquear',
            'bloquear',
            id
        );
    };

    const handleDesbloquear = (id) => {
        const usuario = usuarios.find(u => u.id === id);
        abrirModal(
            'info',
            'Desbloquear Usuário',
            `Tem certeza que deseja desbloquear o usuário "${usuario?.nome_razao_social}"?`,
            'O usuário poderá acessar a plataforma novamente.',
            'Desbloquear',
            'desbloquear',
            id
        );
    };

    const handleAprovar = (id) => {
        const usuario = usuarios.find(u => u.id === id);
        abrirModal(
            'success',
            'Aprovar Usuário',
            `Tem certeza que deseja aprovar o usuário "${usuario?.nome_razao_social}"?`,
            'O usuário poderá acessar a plataforma.',
            'Aprovar',
            'aprovar',
            id
        );
    };

    const handleReprovar = (id) => {
        const usuario = usuarios.find(u => u.id === id);
        abrirModal(
            'danger',
            'Reprovar Usuário',
            `Tem certeza que deseja reprovar o usuário "${usuario?.nome_razao_social}"?`,
            'O usuário não poderá acessar a plataforma.',
            'Reprovar',
            'reprovar',
            id
        );
    };

    const handleAlterarRole = async (id, role) => {
        try {
            const response = await api.admin.alterarRole(id, role, token);
            if (response.success) {
                carregarUsuarios(params);
            } else {
                setError(response.message || 'Erro ao alterar papel');
            }
        } catch (err) {
            setError(err.message || 'Erro ao alterar papel');
        }
    };

    // Fechar modal
    const fecharModal = () => {
        setModal(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <div className="admin-usuarios-container">
            <div className="page-header">
                <div>
                    <h1>Gestão de Usuários</h1>
                    <p className="subtitle">Gerencie todos os usuários da plataforma</p>
                </div>
                <div className="page-header-info">
                    <span className="total-badge">
                        Total: {pagination.total} usuários
                    </span>
                </div>
            </div>

            {error && (
                <div className="mensagem erro">
                    {error}
                </div>
            )}

            <FiltroUsuarios onFilter={handleFilter} />

            <TabelaUsuarios
                usuarios={usuarios}
                onVerDetalhes={handleVerDetalhes}
                onBloquear={handleBloquear}
                onDesbloquear={handleDesbloquear}
                onAprovar={handleAprovar}
                onReprovar={handleReprovar}
                onAlterarRole={handleAlterarRole}
                isLoading={loading}
            />

            {pagination.totalPages > 1 && (
                <div className="paginacao">
                    <button
                        className="paginacao-btn"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                    >
                        Anterior
                    </button>
                    <span className="paginacao-info">
                        Página {pagination.page} de {pagination.totalPages}
                    </span>
                    <button
                        className="paginacao-btn"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages}
                    >
                        Próxima
                    </button>
                </div>
            )}

            <ModalConfirmacao
                isOpen={modal.isOpen}
                onClose={fecharModal}
                onConfirm={modal.onConfirm}
                title={modal.title}
                message={modal.message}
                detail={modal.detail}
                confirmText={modal.confirmText}
                cancelText="Cancelar"
                type={modal.type}
                isLoading={modal.isLoading}
            />
        </div>
    );
};

export default AdminUsuarios;