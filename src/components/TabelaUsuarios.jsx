// src/pages/admin/components/TabelaUsuarios.jsx
import React from 'react';
import StatusBadgeAdmin from './StatusBadgeAdmin';

/**
 * TabelaUsuarios - Tabela para exibir usuários no admin
 * @param {array} usuarios - Lista de usuários
 * @param {function} onVerDetalhes - Função ao clicar em ver detalhes
 * @param {function} onBloquear - Função ao clicar em bloquear
 * @param {function} onDesbloquear - Função ao clicar em desbloquear
 * @param {function} onAprovar - Função ao clicar em aprovar
 * @param {function} onReprovar - Função ao clicar em reprovar
 * @param {function} onAlterarRole - Função ao clicar em alterar role
 * @param {boolean} isLoading - Estado de carregamento
 */
const TabelaUsuarios = ({
    usuarios = [],
    onVerDetalhes,
    onBloquear,
    onDesbloquear,
    onAprovar,
    onReprovar,
    onAlterarRole,
    isLoading = false,
}) => {
    // Formatar CPF/CNPJ
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

    // Formatar data
    const formatarData = (data) => {
        if (!data) return '-';
        return new Date(data).toLocaleDateString('pt-BR');
    };

    // Obter label do tipo de usuário
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

    // Verificar se pode bloquear
    const podeBloquear = (usuario) => {
        return usuario.status !== 'BLOQUEADO' && !usuario.is_admin;
    };

    // Verificar se pode desbloquear
    const podeDesbloquear = (usuario) => {
        return usuario.status === 'BLOQUEADO' && !usuario.is_admin;
    };

    // Verificar se pode aprovar
    const podeAprovar = (usuario) => {
        return usuario.status === 'PENDENTE';
    };

    // Verificar se pode reprovar
    const podeReprovar = (usuario) => {
        return usuario.status === 'PENDENTE';
    };

    if (isLoading) {
        return (
            <div className="table-loading">
                <p>Carregando usuários...</p>
            </div>
        );
    }

    if (usuarios.length === 0) {
        return (
            <div className="table-empty">
                <p>Nenhum usuário encontrado</p>
            </div>
        );
    }

    return (
        <div className="table-responsive">
            <table className="table-admin">
                <thead>
                    <tr>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>CPF/CNPJ</th>
                        <th>Tipo</th>
                        <th>Status</th>
                        <th>Cadastro</th>
                        <th className="table-actions">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {usuarios.map((usuario) => (
                        <tr key={usuario.id}>
                            <td className="table-cell-nome">
                                <div className="user-name-cell">
                                    <span className="user-name">{usuario.nome_razao_social}</span>
                                    {usuario.is_admin && (
                                        <span className="admin-badge">Admin</span>
                                    )}
                                </div>
                            </td>
                            <td>{usuario.email}</td>
                            <td>{formatarCpfCnpj(usuario.cpf_cnpj)}</td>
                            <td>
                                <span className="tipo-badge">
                                    {getTipoLabel(usuario.tipo_usuario)}
                                </span>
                            </td>
                            <td>
                                <StatusBadgeAdmin 
                                    status={usuario.status} 
                                    type="usuario"
                                />
                            </td>
                            <td>{formatarData(usuario.data_cadastro)}</td>
                            <td className="table-actions">
                                <div className="action-buttons">
                                    {/* Ver Detalhes */}
                                    <button
                                        className="btn-action btn-view"
                                        onClick={() => onVerDetalhes(usuario.id)}
                                        title="Ver detalhes"
                                    >
                                        visualizar
                                    </button>

                                    {/* Aprovar */}
                                    {podeAprovar(usuario) && (
                                        <button
                                            className="btn-action btn-approve"
                                            onClick={() => onAprovar(usuario.id)}
                                            title="Aprovar usuário"
                                        >
                                            aprovar
                                        </button>
                                    )}

                                    {/* Reprovar */}
                                    {podeReprovar(usuario) && (
                                        <button
                                            className="btn-action btn-reject"
                                            onClick={() => onReprovar(usuario.id)}
                                            title="Reprovar usuário"
                                        >
                                            remover
                                        </button>
                                    )}

                                    {/* Bloquear */}
                                    {podeBloquear(usuario) && (
                                        <button
                                            className="btn-action btn-block"
                                            onClick={() => onBloquear(usuario.id)}
                                            title="Bloquear usuário"
                                        >
                                            bloquear
                                        </button>
                                    )}

                                    {/* Desbloquear */}
                                    {podeDesbloquear(usuario) && (
                                        <button
                                            className="btn-action btn-unblock"
                                            onClick={() => onDesbloquear(usuario.id)}
                                            title="Desbloquear usuário"
                                        >
                                            desbloquear
                                        </button>
                                    )}

                                    {/* Alterar Role (apenas para não-admin) */}
                                    {!usuario.is_admin && (
                                        <select
                                            className="role-select"
                                            value={usuario.tipo_usuario}
                                            onChange={(e) => onAlterarRole(usuario.id, e.target.value)}
                                            title="Alterar papel do usuário"
                                        >
                                            <option value="EMBARCADOR">Embarcador</option>
                                            <option value="FROTA">Frota</option>
                                            <option value="AUTONOMO">Autônomo</option>
                                            <option value="USUARIO">Usuário</option>
                                        </select>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TabelaUsuarios;