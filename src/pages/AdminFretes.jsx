// src/pages/admin/AdminFretes.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import StatusBadgeAdmin from '../components/StatusBadgeAdmin';
import ModalConfirmacao from '../components/ModalConfirmacao';

const AdminFretes = () => {
    const navigate = useNavigate();
    const { token } = useAuth();
    
    const [fretes, setFretes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0
    });
    
    const [filtros, setFiltros] = useState({
        status: '',
        search: '',
        data_inicio: '',
        data_fim: ''
    });
    const [isFiltrosOpen, setIsFiltrosOpen] = useState(false);
    
    const [modal, setModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        detail: '',
        confirmText: 'Confirmar',
        onConfirm: null,
        freteId: null,
        isLoading: false
    });
    const carregarFretes = useCallback(async (params = '') => {
            try {
                setLoading(true);
                setError(null);
                const response = await api.admin.listarFretes(token, params);
                
                // Verifica se 'data' existe ao invés de procurar por 'success'
                if (response.data) {
                    setFretes(response.data);
                    // Ajusta a captura do total vindo diretamente da resposta
                    setPagination(prev => ({ ...prev, total: response.total || 0 }));
                } else {
                    setError(response.message || 'Erro ao carregar fretes');
                }
            } catch (err) {
                setError(err.message || 'Erro ao carregar fretes');
            } finally {
                setLoading(false);
            }
    }, [token]);

    useEffect(() => {
        carregarFretes();
    }, [carregarFretes]);

    const handleFilter = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (filtros.status) params.append('status', filtros.status);
        if (filtros.search) params.append('search', filtros.search);
        if (filtros.data_inicio) params.append('data_inicio', filtros.data_inicio);
        if (filtros.data_fim) params.append('data_fim', filtros.data_fim);
        carregarFretes(params.toString());
    };

    const handleClearFilters = () => {
        setFiltros({ status: '', search: '', data_inicio: '', data_fim: '' });
        carregarFretes('');
    };

    const handlePageChange = (novaPagina) => {
        // Implementar paginação
    };

    const handleVerDetalhes = (id) => {
        navigate(`/admin/fretes/${id}`);
    };

    const handleCancelarFrete = (id) => {
        const frete = fretes.find(f => f.id === id);
        setModal({
            isOpen: true,
            title: 'Cancelar Frete',
            message: `Tem certeza que deseja cancelar o frete #${id}?`,
            detail: `Origem: ${frete?.origem_endereco || 'N/A'} → Destino: ${frete?.destino_endereco || 'N/A'}`,
            confirmText: 'Cancelar Frete',
            onConfirm: () => confirmarCancelamento(id),
            freteId: id,
            isLoading: false
        });
    };

    const confirmarCancelamento = async (id) => {
        try {
            setModal(prev => ({ ...prev, isLoading: true }));
            const response = await api.admin.cancelarFrete(id, 'Cancelado pelo administrador', token);
            if (response.success) {
                setModal(prev => ({ ...prev, isOpen: false }));
                carregarFretes();
            } else {
                setModal(prev => ({ 
                    ...prev, 
                    isLoading: false,
                    message: response.message || 'Erro ao cancelar frete'
                }));
            }
        } catch (err) {
            setModal(prev => ({ 
                ...prev, 
                isLoading: false,
                message: err.message || 'Erro ao cancelar frete'
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

    const formatarMoeda = (valor) => {
        if (!valor) return 'R$ 0,00';
        return `R$ ${Number(valor).toFixed(2).replace('.', ',')}`;
    };

    if (loading) {
        return (
            <div className="admin-fretes-loading">
                <p>Carregando fretes...</p>
            </div>
        );
    }

    return (
        <div className="admin-fretes-container">
            <div className="page-header">
                <div>
                    <h1>Gestão de Fretes</h1>
                    <p className="subtitle">Gerencie todos os fretes da plataforma</p>
                </div>
                <div className="page-header-info">
                    <span className="total-badge">
                        Total: {pagination.total} fretes
                    </span>
                </div>
            </div>

            {error && (
                <div className="mensagem erro">
                    {error}
                </div>
            )}

            {/* Filtros */}
            <button 
                className="btn-filtros-toggle"
                onClick={() => setIsFiltrosOpen(!isFiltrosOpen)}
            >
                🔍 Filtros
            </button>

            {isFiltrosOpen && (
                <form className="filtros-form" onSubmit={handleFilter}>
                    <div className="filtros-row">
                        <div className="form-group">
                            <label>Buscar</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Código, origem ou destino"
                                value={filtros.search}
                                onChange={(e) => setFiltros({...filtros, search: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label>Status</label>
                            <select
                                className="form-select"
                                value={filtros.status}
                                onChange={(e) => setFiltros({...filtros, status: e.target.value})}
                            >
                                <option value="">Todos</option>
                                <option value="AGUARDANDO">Aguardando</option>
                                <option value="NEGOCIACAO">Negociação</option>
                                <option value="ACEITO">Aceito</option>
                                <option value="TRANSITO">Em Trânsito</option>
                                <option value="CONCLUIDO">Concluído</option>
                                <option value="CANCELADO">Cancelado</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Data Início</label>
                            <input
                                type="date"
                                className="form-input"
                                value={filtros.data_inicio}
                                onChange={(e) => setFiltros({...filtros, data_inicio: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label>Data Fim</label>
                            <input
                                type="date"
                                className="form-input"
                                value={filtros.data_fim}
                                onChange={(e) => setFiltros({...filtros, data_fim: e.target.value})}
                            />
                        </div>
                    </div>
                    <div className="filtros-actions">
                        <button type="submit" className="btn btn-primary">
                            Aplicar Filtros
                        </button>
                        <button type="button" className="btn btn-secondary" onClick={handleClearFilters}>
                            Limpar Filtros
                        </button>
                    </div>
                </form>
            )}

            {/* Tabela */}
            <div className="table-responsive">
                <table className="table-admin">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Código</th>
                            <th>Origem → Destino</th>
                            <th>Status</th>
                            <th>Valor</th>
                            <th>Data</th>
                            <th className="table-actions">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fretes.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="table-empty">
                                    Nenhum frete encontrado
                                </td>
                            </tr>
                        ) : (
                            fretes.map((frete) => (
                                <tr key={frete.id}>
                                    <td>#{frete.id}</td>
                                    <td>{frete.codigo_rastreamento || '-'}</td>
                                    <td>
                                        <div className="frete-route-cell">
                                            <span className="route-origem">
                                                {frete.origem_endereco?.substring(0, 30) || 'N/A'}
                                            </span>
                                            <span className="route-arrow">→</span>
                                            <span className="route-destino">
                                                {frete.destino_endereco?.substring(0, 30) || 'N/A'}
                                            </span>
                                        </div>
                                    </td>
                                    <td>
                                        <StatusBadgeAdmin status={frete.status} type="frete" />
                                    </td>
                                    <td>{formatarMoeda(frete.valor_fechado || frete.valor_ofertado)}</td>
                                    <td>{formatarData(frete.data_publicacao)}</td>
                                    <td className="table-actions">
                                        <div className="action-buttons">
                                            <button
                                                className="btn-action btn-view"
                                                onClick={() => handleVerDetalhes(frete.id)}
                                                title="Ver detalhes"
                                            >
                                                👁️
                                            </button>
                                            {frete.status !== 'CANCELADO' && frete.status !== 'CONCLUIDO' && (
                                                <button
                                                    className="btn-action btn-block"
                                                    onClick={() => handleCancelarFrete(frete.id)}
                                                    title="Cancelar frete"
                                                >
                                                    ❌
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

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
                type="danger"
                isLoading={modal.isLoading}
            />
        </div>
    );
};

export default AdminFretes;