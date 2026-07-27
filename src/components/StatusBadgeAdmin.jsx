// src/pages/admin/components/StatusBadgeAdmin.jsx
import React from 'react';

/**
 * StatusBadgeAdmin - Exibe badges de status para o admin
 * @param {string} status - Status do usuário/frete/etc
 * @param {string} type - Tipo de badge: 'usuario', 'frete', 'motorista', 'proposta'
 * @param {string} className - Classes adicionais
 */
const StatusBadgeAdmin = ({ status, type = 'usuario', className = '' }) => {
    // Mapeamento de status para usuários
    const usuarioStatusMap = {
        'PENDENTE': { label: 'Pendente', class: 'badge-pendente' },
        'APROVADO': { label: 'Aprovado', class: 'badge-aprovado' },
        'REPROVADO': { label: 'Reprovado', class: 'badge-reprovado' },
        'BLOQUEADO': { label: 'Bloqueado', class: 'badge-bloqueado' },
        'ATIVO': { label: 'Ativo', class: 'badge-ativo' },
        'INATIVO': { label: 'Inativo', class: 'badge-inativo' },
    };

    // Mapeamento de status para fretes
    const freteStatusMap = {
        'AGUARDANDO': { label: 'Aguardando', class: 'badge-aguardando' },
        'NEGOCIACAO': { label: 'Negociação', class: 'badge-negociacao' },
        'ACEITO': { label: 'Aceito', class: 'badge-aceito' },
        'TRANSITO': { label: 'Em Trânsito', class: 'badge-transito' },
        'CONCLUIDO': { label: 'Concluído', class: 'badge-concluido' },
        'CANCELADO': { label: 'Cancelado', class: 'badge-cancelado' },
    };

    // Mapeamento de status para motoristas vinculados
    const motoristaStatusMap = {
        'ATIVO': { label: 'Ativo', class: 'badge-ativo' },
        'FERIAS': { label: 'Férias', class: 'badge-ferias' },
        'LICENCA': { label: 'Licença', class: 'badge-licenca' },
        'DESLIGADO': { label: 'Desligado', class: 'badge-desligado' },
    };

    // Mapeamento de status para propostas
    const propostaStatusMap = {
        'PENDENTE': { label: 'Pendente', class: 'badge-pendente' },
        'ACEITA': { label: 'Aceita', class: 'badge-aceito' },
        'RECUSADA': { label: 'Recusada', class: 'badge-recusado' },
        'MODIFICADA': { label: 'Modificada', class: 'badge-modificada' },
        'CONTRATO_ASSINADO': { label: 'Contrato Assinado', class: 'badge-contrato-assinado' },
        'CANCELADA': { label: 'Cancelada', class: 'badge-cancelado' },
        'EXPIRADA': { label: 'Expirada', class: 'badge-expirada' },
    };

    // Seleciona o mapa correto
    let statusMap;
    switch (type) {
        case 'frete':
            statusMap = freteStatusMap;
            break;
        case 'motorista':
            statusMap = motoristaStatusMap;
            break;
        case 'proposta':
            statusMap = propostaStatusMap;
            break;
        case 'usuario':
        default:
            statusMap = usuarioStatusMap;
            break;
    }

    // Busca o status ou usa o padrão
    const statusInfo = statusMap[status] || { 
        label: status || 'Desconhecido', 
        class: 'badge-default' 
    };

    return (
        <span className={`badge-admin ${statusInfo.class} ${className}`}>
            {statusInfo.label}
        </span>
    );
};

export default StatusBadgeAdmin;