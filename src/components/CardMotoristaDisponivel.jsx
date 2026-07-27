// components/motoristas/CardMotoristaDisponivel.jsx
import { useAuth } from '../hooks/useAuth';
import StatusBadge from './StatusBadge';

export default function CardMotoristaDisponivel({ motorista, onEnviarProposta }) {
    const { user } = useAuth();
    const isFrota = user?.tipo?.toLowerCase() === 'frota';

    const formatarData = (data) => {
        if (!data) return '-';
        return new Date(data).toLocaleDateString('pt-BR');
    };

    return (
        <div className="card-motorista">
            <div className="card-motorista-header">
                <div>
                    <span className="card-motorista-nome">{motorista.nome}</span>
                    <div className="card-motorista-cnh">
                        CNH: {motorista.cnh} - {motorista.cnh_categoria}
                    </div>
                </div>
                <StatusBadge status="ATIVO" />
            </div>

            <div className="card-motorista-info">
                <div className="card-motorista-info-item">
                    <span className="card-motorista-info-label">CPF</span>
                    <span className="card-motorista-info-value">{motorista.cpf_cnpj || '-'}</span>
                </div>
                <div className="card-motorista-info-item">
                    <span className="card-motorista-info-label">CNH Validade</span>
                    <span className="card-motorista-info-value">{formatarData(motorista.cnh_validade)}</span>
                </div>
                <div className="card-motorista-info-item">
                    <span className="card-motorista-info-label">Avaliação</span>
                    <span className="card-motorista-info-value">
                        {motorista.avaliacao_media ? `${motorista.avaliacao_media} ★` : 'Sem avaliações'}
                    </span>
                </div>
                <div className="card-motorista-info-item">
                    <span className="card-motorista-info-label">Veículo</span>
                    <span className="card-motorista-info-value">
                        {motorista.veiculo_modelo ? `${motorista.veiculo_modelo} - ${motorista.placa}` : 'Sem veículo'}
                    </span>
                </div>
            </div>

            {motorista.celular && (
                <div className="card-motorista-contato">
                    <span className="card-motorista-contato-label">Contato:</span>
                    <span className="card-motorista-contato-value">{motorista.celular}</span>
                    {motorista.email && (
                        <span className="card-motorista-contato-value">| {motorista.email}</span>
                    )}
                </div>
            )}

            {isFrota && (
                <div className="card-motorista-actions">
                    <button
                        className="btn btn-primary btn-sm"
                        onClick={onEnviarProposta}
                    >
                        Enviar Proposta
                    </button>
                </div>
            )}
        </div>
    );
}