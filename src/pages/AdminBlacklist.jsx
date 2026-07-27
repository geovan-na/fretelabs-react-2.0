// src/pages/admin/AdminBlacklist.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import StatusBadgeAdmin from '../components/StatusBadgeAdmin';
import ModalConfirmacao from '../components/ModalConfirmacao';

const AdminBlacklist = () => {
    const { token } = useAuth();
    
    const [blacklist, setBlacklist] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        pessoa_id: '',
        tipo: 'MOTORISTA',
        motivo: '',
        data_expiracao: ''
    });
    const [usuariosDisponiveis, setUsuariosDisponiveis] = useState([]);
    const [buscandoUsuarios, setBuscandoUsuarios] = useState(false);
    
    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        confirmText: 'Confirmar',
        onConfirm: null,
        isLoading: false
    });

    const carregarBlacklist = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await api.admin.listarBlacklist(token);
            if (response.success) {
                setBlacklist(response.data);
            } else {
                setError(response.message || 'Erro ao carregar blacklist');
            }
        } catch (err) {
            setError(err.message || 'Erro ao carregar blacklist');
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        carregarBlacklist();
    }, [carregarBlacklist]);

    const buscarUsuarios = async (search) => {
        if (search.length < 3) {
            setUsuariosDisponiveis([]);
            return;
        }
        try {
            setBuscandoUsuarios(true);
            const response = await api.admin.listarUsuarios(token, `?search=${search}&limit=10`);
            if (response.success) {
                setUsuariosDisponiveis(response.data);
            }
        } catch (err) {
            console.error('Erro ao buscar usuários:', err);
        } finally {
            setBuscandoUsuarios(false);
        }
    };

    const handleAddBlacklist = async (e) => {
        e.preventDefault();
        if (!formData.pessoa_id || !formData.motivo) {
            setError('Selecione um usuário e informe o motivo');
            return;
        }

        try {
            const dados = {
                pessoa_id: formData.pessoa_id,
                tipo: formData.tipo,
                motivo: formData.motivo,
                data_expiracao: formData.data_expiracao || null
            };

            const response = await api.admin.adicionarBlacklist(dados, token);
            if (response.success) {
                setShowForm(false);
                setFormData({ pessoa_id: '', tipo: 'MOTORISTA', motivo: '', data_expiracao: '' });
                setUsuariosDisponiveis([]);
                carregarBlacklist();
            } else {
                setError(response.message || 'Erro ao adicionar à blacklist');
            }
        } catch (err) {
            setError(err.message || 'Erro ao adicionar à blacklist');
        }
    };

    const handleRemoverBlacklist = (id, nome) => {
        setModal({
            isOpen: true,
            title: 'Remover da Blacklist',
            message: `Tem certeza que deseja remover "${nome}" da blacklist?`,
            confirmText: 'Remover',
            onConfirm: () => confirmarRemocao(id),
            isLoading: false
        });
    };

    const confirmarRemocao = async (id) => {
        try {
            setModal(prev => ({ ...prev, isLoading: true }));
            const response = await api.admin.removerBlacklist(id, token);
            if (response.success) {
                setModal(prev => ({ ...prev, isOpen: false }));
                carregarBlacklist();
            } else {
                setModal(prev => ({ 
                    ...prev, 
                    isLoading: false,
                    message: response.message || 'Erro ao remover da blacklist'
                }));
            }
        } catch (err) {
            setModal(prev => ({ 
                ...prev, 
                isLoading: false,
                message: err.message || 'Erro ao remover da blacklist'
            }));
        }
    };

    const fecharModal = () => {
        setModal(prev => ({ ...prev, isOpen: false }));
    };

    const formatarData = (data) => {
        if (!data) return '-';
        return new Date(data).toLocaleDateString('pt-BR');
    };

    const getTipoLabel = (tipo) => {
        return tipo === 'EMPRESA' ? 'Empresa' : 'Motorista';
    };

    if (loading) {
        return (
            <div className="admin-blacklist-loading">
                <p>Carregando blacklist...</p>
            </div>
        );
    }

    return (
        <div className="admin-blacklist-container">
            <div className="page-header">
                <div>
                    <h1>Blacklist</h1>
                    <p className="subtitle">Usuários bloqueados permanentemente</p>
                </div>
                <div className="page-header-info">
                    <span className="total-badge">
                        Total: {blacklist.length} bloqueados
                    </span>
                    <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                        {showForm ? 'Cancelar' : '+ Adicionar'}
                    </button>
                </div>
            </div>

            {error && (
                <div className="mensagem erro">
                    {error}
                </div>
            )}

            {/* Formulário de Adição */}
            {showForm && (
                <form className="blacklist-form" onSubmit={handleAddBlacklist}>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Usuário <span>*</span></label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Buscar por nome ou email..."
                                onChange={(e) => buscarUsuarios(e.target.value)}
                            />
                            {buscandoUsuarios && <span className="buscando-text">Buscando...</span>}
                            {usuariosDisponiveis.length > 0 && (
                                <div className="usuarios-sugestoes">
                                    {usuariosDisponiveis.map((user) => (
                                        <div
                                            key={user.id}
                                            className="sugestao-item"
                                            onClick={() => {
                                                setFormData({
                                                    ...formData,
                                                    pessoa_id: user.id
                                                });
                                                setUsuariosDisponiveis([]);
                                            }}
                                        >
                                            <span className="sugestao-nome">{user.nome_razao_social}</span>
                                            <span className="sugestao-email">{user.email}</span>
                                            <span className="sugestao-status">
                                                <StatusBadgeAdmin status={user.status} type="usuario" />
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {formData.pessoa_id && (
                                <div className="usuario-selecionado">
                                    ✅ Usuário selecionado: {usuariosDisponiveis.find(u => u.id === parseInt(formData.pessoa_id))?.nome_razao_social || 'ID: ' + formData.pessoa_id}
                                </div>
                            )}
                        </div>

                        <div className="form-group">
                            <label>Tipo <span>*</span></label>
                            <select
                                className="form-select"
                                value={formData.tipo}
                                onChange={(e) => setFormData({...formData, tipo: e.target.value})}
                            >
                                <option value="MOTORISTA">Motorista</option>
                                <option value="EMPRESA">Empresa</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Motivo <span>*</span></label>
                            <textarea
                                className="form-textarea"
                                rows="3"
                                placeholder="Descreva o motivo do bloqueio..."
                                value={formData.motivo}
                                onChange={(e) => setFormData({...formData, motivo: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label>Data de Expiração</label>
                            <input
                                type="date"
                                className="form-input"
                                value={formData.data_expiracao}
                                onChange={(e) => setFormData({...formData, data_expiracao: e.target.value})}
                            />
                            <small className="helper-text">Deixe em branco para bloqueio permanente</small>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="submit" className="btn btn-danger">
                            Adicionar à Blacklist
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                            Cancelar
                        </button>
                    </div>
                </form>
            )}

            {/* Tabela */}
            <div className="table-responsive">
                <table className="table-admin">
                    <thead>
                        <tr>
                            <th>Usuário</th>
                            <th>Email</th>
                            <th>Tipo</th>
                            <th>Motivo</th>
                            <th>Inclusão</th>
                            <th>Expiração</th>
                            <th className="table-actions">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {blacklist.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="table-empty">
                                    Nenhum usuário na blacklist
                                </td>
                            </tr>
                        ) : (
                            blacklist.map((item) => (
                                <tr key={item.id}>
                                    <td className="table-cell-nome">
                                        <div className="user-name-cell">
                                            <span className="user-name">{item.pessoa_nome || '-'}</span>
                                        </div>
                                    </td>
                                    <td>{item.pessoa_email || '-'}</td>
                                    <td>
                                        <span className="tipo-badge">
                                            {getTipoLabel(item.tipo)}
                                        </span>
                                    </td>
                                    <td className="motivo-cell">{item.motivo}</td>
                                    <td>{formatarData(item.data_inclusao)}</td>
                                    <td>{formatarData(item.data_expiracao)}</td>
                                    <td className="table-actions">
                                        <button
                                            className="btn-action btn-unblock"
                                            onClick={() => handleRemoverBlacklist(item.id, item.pessoa_nome)}
                                            title="Remover da blacklist"
                                        >
                                            🔓
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <ModalConfirmacao
                isOpen={modal.isOpen}
                onClose={fecharModal}
                onConfirm={modal.onConfirm}
                title={modal.title}
                message={modal.message}
                confirmText={modal.confirmText}
                cancelText="Cancelar"
                type="info"
                isLoading={modal.isLoading}
            />
        </div>
    );
};

export default AdminBlacklist;