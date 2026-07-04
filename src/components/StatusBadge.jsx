// components/dashboard/StatusBadge.jsx
const StatusBadge = ({ status }) => {
    const getStatusConfig = () => {
        switch(status?.toLowerCase()) {
            case 'pendente':
            case 'pending':
                return { label: 'Pendente', className: 'badge-pending' };
            case 'aprovado':
            case 'approved':
                return { label: 'Aprovado', className: 'badge-approved' };
            case 'reprovado':
            case 'rejected':
                return { label: 'Reprovado', className: 'badge-rejected' };
            case 'bloqueado':
            case 'blocked':
                return { label: 'Bloqueado', className: 'badge-blocked' };
            case 'ativo':
            case 'active':
                return { label: 'Ativo', className: 'badge-active' };
            case 'aguardando':
            case 'waiting':
                return { label: 'Aguardando', className: 'badge-waiting' };
            case 'negociacao':
            case 'negotiation':
                return { label: 'Negociação', className: 'badge-negotiation' };
            case 'aceito':
            case 'accepted':
                return { label: 'Aceito', className: 'badge-accepted' };
            case 'transito':
            case 'transit':
                return { label: 'Em Trânsito', className: 'badge-transit' };
            case 'concluido':
            case 'completed':
                return { label: 'Concluído', className: 'badge-completed' };
            case 'cancelado':
            case 'cancelled':
                return { label: 'Cancelado', className: 'badge-cancelled' };
            default:
                return { label: status || 'Desconhecido', className: 'badge-default' };
        }
    };

    const { label, className } = getStatusConfig();

    return (
        <span className={`status-badge ${className}`}>
            {label}
        </span>
    );
};

export default StatusBadge;