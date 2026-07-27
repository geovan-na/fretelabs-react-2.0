// components/dashboard/StatusBadge.jsx
const StatusBadge = ({ status }) => {
    const getStatusConfig = () => {
        const statusLower = status?.toLowerCase() || '';

        // Mapeamento completo de status
        const statusMap = {
            // Status de usuário
            'pendente': { label: 'Pendente', className: 'badge-pending' },
            'aprovado': { label: 'Aprovado', className: 'badge-approved' },
            'reprovado': { label: 'Reprovado', className: 'badge-rejected' },
            'bloqueado': { label: 'Bloqueado', className: 'badge-blocked' },

            // Status de motorista
            'ativo': { label: 'Ativo', className: 'badge-active' },
            'ferias': { label: 'Férias', className: 'badge-ferias' },
            'licenca': { label: 'Licença', className: 'badge-licenca' },
            'desligado': { label: 'Desligado', className: 'badge-desligado' },

            // Status de frete
            'aguardando': { label: 'Aguardando', className: 'badge-waiting' },
            'negociacao': { label: 'Negociação', className: 'badge-negotiation' },
            'aceito': { label: 'Aceito', className: 'badge-accepted' },
            'transito': { label: 'Em Trânsito', className: 'badge-transit' },
            'concluido': { label: 'Concluído', className: 'badge-completed' },
            'cancelado': { label: 'Cancelado', className: 'badge-cancelled' },

            // Status de candidatura
            'recusado': { label: 'Recusado', className: 'badge-recusado' },

            // Status de veículo
            'inativo': { label: 'Inativo', className: 'badge-inativo' },
            'manutencao': { label: 'Em Manutenção', className: 'badge-manutencao' },

            // Status de proposta
            'modificada': { label: 'Modificada', className: 'badge-modificada' },
            'contrato_assinado': { label: 'Contrato Assinado', className: 'badge-contrato-assinado' },
            'expirada': { label: 'Expirada', className: 'badge-expirada' },

            // Status de pagamento
            'processando': { label: 'Processando', className: 'badge-processando' },
            'falhou': { label: 'Falhou', className: 'badge-falhou' },
            'estornado': { label: 'Estornado', className: 'badge-estornado' },

            // Status de contrato
            'em_experiencia': { label: 'Em Experiência', className: 'badge-em-experiencia' },
            'renovado': { label: 'Renovado', className: 'badge-renovado' },
            'encerrado': { label: 'Encerrado', className: 'badge-encerrado' },
            'rescindido': { label: 'Rescindido', className: 'badge-rescindido' },
            'suspenso': { label: 'Suspenso', className: 'badge-suspenso' },

            // Status de proposta (valores antigos convertidos)
            'pending': { label: 'Pendente', className: 'badge-pending' },
            'approved': { label: 'Aprovado', className: 'badge-approved' },
            'rejected': { label: 'Reprovado', className: 'badge-rejected' },
            'blocked': { label: 'Bloqueado', className: 'badge-blocked' },
            'active': { label: 'Ativo', className: 'badge-active' },
            'waiting': { label: 'Aguardando', className: 'badge-waiting' },
            'negotiation': { label: 'Negociação', className: 'badge-negotiation' },
            'accepted': { label: 'Aceito', className: 'badge-accepted' },
            'transit': { label: 'Em Trânsito', className: 'badge-transit' },
            'completed': { label: 'Concluído', className: 'badge-completed' },
            'cancelled': { label: 'Cancelado', className: 'badge-cancelled' },
        };

        const config = statusMap[statusLower] || { label: status || 'Desconhecido', className: 'badge-default' };
        return config;
    };

    const { label, className } = getStatusConfig();

    return (
        <span className={`status-badge ${className}`}>
            {label}
        </span>
    );
};

export default StatusBadge;