// src/pages/admin/components/FiltroUsuarios.jsx
import React, { useState } from 'react';

/**
 * FiltroUsuarios - Filtros para a lista de usuários
 * @param {function} onFilter - Função chamada ao aplicar filtros
 * @param {object} initialFilters - Filtros iniciais
 */
const FiltroUsuarios = ({ onFilter, initialFilters = {} }) => {
    const [filtros, setFiltros] = useState({
        status: initialFilters.status || '',
        tipo: initialFilters.tipo || '',
        search: initialFilters.search || '',
    });

    const [isOpen, setIsOpen] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFiltros((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Monta os parâmetros da URL
        const params = new URLSearchParams();
        if (filtros.status) params.append('status', filtros.status);
        if (filtros.tipo) params.append('tipo', filtros.tipo);
        if (filtros.search) params.append('search', filtros.search);
        
        onFilter(params.toString());
    };

    const handleClear = () => {
        const filtrosLimpos = {
            status: '',
            tipo: '',
            search: '',
        };
        setFiltros(filtrosLimpos);
        onFilter('');
    };

    const toggleFilters = () => {
        setIsOpen(!isOpen);
    };

    // Contar filtros ativos
    const filtrosAtivos = Object.values(filtros).filter(v => v !== '').length;

    return (
        <div className="filtro-usuarios">
            <button 
                className="btn-filtros-toggle"
                onClick={toggleFilters}
            >
             Filtros {filtrosAtivos > 0 && `(${filtrosAtivos})`}
            </button>

            {isOpen && (
                <form className="filtros-form" onSubmit={handleSubmit}>
                    <div className="filtros-row">
                        {/* Busca por nome/email/CPF */}
                        <div className="form-group">
                            <label>Buscar</label>
                            <input
                                type="text"
                                name="search"
                                className="form-input"
                                placeholder="Nome, email ou CPF/CNPJ"
                                value={filtros.search}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Filtro por Status */}
                        <div className="form-group">
                            <label>Status</label>
                            <select
                                name="status"
                                className="form-select"
                                value={filtros.status}
                                onChange={handleChange}
                            >
                                <option value="">Todos</option>
                                <option value="PENDENTE">Pendente</option>
                                <option value="APROVADO">Aprovado</option>
                                <option value="REPROVADO">Reprovado</option>
                                <option value="BLOQUEADO">Bloqueado</option>
                            </select>
                        </div>

                        {/* Filtro por Tipo */}
                        <div className="form-group">
                            <label>Tipo de Usuário</label>
                            <select
                                name="tipo"
                                className="form-select"
                                value={filtros.tipo}
                                onChange={handleChange}
                            >
                                <option value="">Todos</option>
                                <option value="ADMIN">Administrador</option>
                                <option value="EMBARCADOR">Embarcador</option>
                                <option value="FROTA">Frota</option>
                                <option value="AUTONOMO">Autônomo</option>
                                <option value="VINCULADO">Vinculado</option>
                            </select>
                        </div>
                    </div>

                    <div className="filtros-actions">
                        <button type="submit" className="btn btn-primary">
                            Aplicar Filtros
                        </button>
                        <button 
                            type="button" 
                            className="btn btn-secondary"
                            onClick={handleClear}
                        >
                            Limpar Filtros
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default FiltroUsuarios;