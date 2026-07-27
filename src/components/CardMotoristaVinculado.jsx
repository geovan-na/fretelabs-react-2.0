// components/motoristas/CardMotoristaVinculado.jsx
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMotoristas } from '../hooks/useMotoristas';
import ModalDesignarVeiculo from './ModalDesignarVeiculo';
import StatusBadge from './StatusBadge';

export default function CardMotoristaVinculado({ motorista, onUpdate }) {
    const { user } = useAuth();
    const [showDesignarVeiculo, setShowDesignarVeiculo] = useState(false);
    const [loading, setLoading] = useState(false);

    const { designarVeiculo, removerVeiculo, finalizarVinculo } = useMotoristas();

    const handleFinalizarVinculo = async () => {
        if (!window.confirm(`Tem certeza que deseja finalizar o vínculo com ${motorista.nome}?`)) return;

        const motivo = prompt('Informe o motivo da finalização:');
        if (!motivo) return;

        setLoading(true);
        try {
            await finalizarVinculo(motorista.motorista_vinculado_id, motivo);
            alert('Vínculo finalizado com sucesso!');
            onUpdate();
        } catch (err) {
            console.error('Erro ao finalizar vínculo:', err);
            alert(err.response?.data?.error || 'Erro ao finalizar vínculo. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoverVeiculo = async () => {
        if (!window.confirm(`Tem certeza que deseja remover o veículo de ${motorista.nome}?`)) return;

        setLoading(true);
        try {
            await removerVeiculo(motorista.motorista_vinculado_id);
            alert('Veículo removido com sucesso!');
            onUpdate();
        } catch (err) {
            console.error('Erro ao remover veículo:', err);
            alert(err.response?.data?.error || 'Erro ao remover veículo. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const isFrota = user?.tipo?.toLowerCase() === 'frota';
    const isDesligado = motorista.situacao === 'DESLIGADO';

    // Helper para formatar moeda com segurança (converte String em Number)
    const formatarSalario = (valor) => {
        const numero = Number(valor || 0);
        return numero.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    };

    return (
        <>
            <div className="card-motorista">
                <div className="card-motorista-header">
                    <div>
                        <span className="card-motorista-nome">{motorista.nome}</span>
                        <div className="card-motorista-cnh">
                            CNH: {motorista.cnh} - {motorista.cnh_categoria}
                        </div>
                    </div>
                    <StatusBadge status={motorista.situacao} />
                </div>

                <div className="card-motorista-info">
                    <div className="card-motorista-info-item">
                        <span className="card-motorista-info-label">Admissão</span>
                        <span className="card-motorista-info-value">
                            {motorista.data_admissao ? new Date(motorista.data_admissao).toLocaleDateString('pt-BR') : '-'}
                        </span>
                    </div>
                    <div className="card-motorista-info-item">
                        <span className="card-motorista-info-label">Registro</span>
                        <span className="card-motorista-info-value">{motorista.registro_funcionario || '-'}</span>
                    </div>
                    <div className="card-motorista-info-item">
                        <span className="card-motorista-info-label">Contrato</span>
                        <span className="card-motorista-info-value">
                            {motorista.tipo_contrato === 'SALARIO' 
                                ? formatarSalario(motorista.valor_salario)
                                : motorista.tipo_contrato === 'COMISSAO' 
                                ? `${motorista.valor_comissao || 0}%`
                                : motorista.tipo_contrato === 'MISTO'
                                ? `${formatarSalario(motorista.valor_salario)} + ${motorista.valor_comissao || 0}%`
                                : '-'}
                        </span>
                    </div>
                    <div className="card-motorista-info-item">
                        <span className="card-motorista-info-label">Pagamentos Pendentes</span>
                        <span className="card-motorista-info-value" style={{ color: motorista.pagamentos_pendentes > 0 ? '#EF4444' : '#22C55E' }}>
                            {motorista.pagamentos_pendentes || 0}
                        </span>
                    </div>
                </div>

                {!isDesligado && motorista.frete_atual_id ? (
                    <div className="card-motorista-veiculo">
                        Frete #{motorista.frete_atual_id} - {motorista.frete_atual_rota}
                    </div>
                ) : !isDesligado && motorista.veiculo_id ? (
                    <div className="card-motorista-veiculo">
                        {motorista.veiculo_modelo} - {motorista.placa}
                    </div>
                ) : !isDesligado ? (
                    <div className="card-motorista-veiculo-sem">
                        Sem veículo designado
                    </div>
                ) : null}

                {isFrota && !isDesligado && (
                    <div className="card-motorista-actions">
                        <button
                            className="btn btn-outline btn-sm"
                            onClick={() => setShowDesignarVeiculo(true)}
                            disabled={loading}
                        >
                            Designar Veículo
                        </button>
                        {motorista.veiculo_id && (
                            <button
                                className="btn btn-outline btn-sm"
                                onClick={handleRemoverVeiculo}
                                disabled={loading}
                            >
                                Remover Veículo
                            </button>
                        )}
                        {motorista.situacao !== 'DESLIGADO' && (
                            <button
                                className="btn btn-danger btn-sm"
                                onClick={handleFinalizarVinculo}
                                disabled={loading}
                            >
                                Finalizar Vínculo
                            </button>
                        )}
                    </div>
                )}
            </div>

            {showDesignarVeiculo && (
                <ModalDesignarVeiculo
                    motorista={motorista}
                    onClose={() => setShowDesignarVeiculo(false)}
                    onSuccess={() => {
                        setShowDesignarVeiculo(false);
                        onUpdate();
                    }}
                />
            )}
        </>
    );
}