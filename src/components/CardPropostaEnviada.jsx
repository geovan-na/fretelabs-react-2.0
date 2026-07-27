// components/motoristas/CardPropostaEnviada.jsx
import { useState } from 'react';
import { useMotoristas } from '../hooks/useMotoristas';

export default function CardPropostaEnviada({ proposta, onUpdate }) {
    const [loading, setLoading] = useState(false);
    const { cancelarProposta, aceitarProposta, recusarProposta } = useMotoristas();

    const getStatusClasse = (status) => {
        const statusMap = {
            'PENDENTE': 'pendente',
            'ACEITA': 'aceita',
            'RECUSADA': 'recusada',
            'MODIFICADA': 'modificada',
            'CONTRATO_ASSINADO': 'contrato_assinado',
            'CANCELADA': 'recusada',
            'EXPIRADA': 'recusada'
        };
        return statusMap[status] || 'pendente';
    };

    const getStatusTexto = (status) => {
        const statusMap = {
            'PENDENTE': 'Pendente',
            'ACEITA': 'Aceita',
            'RECUSADA': 'Recusada',
            'MODIFICADA': 'Modificada',
            'CONTRATO_ASSINADO': 'Contrato Assinado',
            'CANCELADA': 'Cancelada',
            'EXPIRADA': 'Expirada'
        };
        return statusMap[status] || status;
    };

    const formatarMoeda = (valor) => {
        if (!valor) return '-';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    };

    const formatarData = (data) => {
        if (!data) return '-';
        return new Date(data).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const handleCancelar = async () => {
        if (!window.confirm('Tem certeza que deseja cancelar esta proposta?')) return;

        setLoading(true);
        try {
            await cancelarProposta(proposta.id);
            alert('Proposta cancelada com sucesso!');
            onUpdate();
        } catch (err) {
            console.error('Erro ao cancelar proposta:', err);
            alert(err.response?.data?.error || 'Erro ao cancelar proposta. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleAceitar = async () => {
        if (!window.confirm('Deseja aceitar esta contraproposta?')) return;

        setLoading(true);
        try {
            await aceitarProposta(proposta.id);
            alert('Contraproposta aceita com sucesso!');
            onUpdate();
        } catch (err) {
            console.error('Erro ao aceitar contraproposta:', err);
            alert(err.response?.data?.error || 'Erro ao aceitar proposta. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleRecusar = async () => {
        if (!window.confirm('Deseja recusar esta contraproposta?')) return;

        setLoading(true);
        try {
            await recusarProposta(proposta.id);
            alert('Contraproposta recusada.');
            onUpdate();
        } catch (err) {
            console.error('Erro ao recusar contraproposta:', err);
            alert(err.response?.data?.error || 'Erro ao recusar proposta. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card-proposta">
            <div className="card-proposta-header">
                <div>
                    <span className="card-motorista-nome">{proposta.motorista_nome || proposta.frota_nome}</span>
                    <div className="card-motorista-cnh">
                        Enviada em {formatarData(proposta.data_envio || proposta.criado_em)}
                    </div>
                </div>
                <span className={`card-proposta-status ${getStatusClasse(proposta.status)}`}>
                    {getStatusTexto(proposta.status)}
                </span>
            </div>

            <div className="card-proposta-valores">
                <div className="card-motorista-info-item">
                    <span className="card-motorista-info-label">Tipo de Contrato</span>
                    <span className="card-motorista-info-value">{proposta.tipo_contrato}</span>
                </div>
                <div className="card-motorista-info-item">
                    <span className="card-motorista-info-label">Valor</span>
                    <span className="card-motorista-info-value">
                        {proposta.tipo_contrato === 'SALARIO' ? formatarMoeda(proposta.valor_salario) :
                         proposta.tipo_contrato === 'COMISSAO' ? `${proposta.valor_comissao}%` : 'Misto'}
                    </span>
                </div>
                <div className="card-motorista-info-item">
                    <span className="card-motorista-info-label">Disponibilidade</span>
                    <span className="card-motorista-info-value">{proposta.disponibilidade || '-'}</span>
                </div>
                <div className="card-motorista-info-item">
                    <span className="card-motorista-info-label">Validade</span>
                    <span className="card-motorista-info-value">{formatarData(proposta.data_validade)}</span>
                </div>
            </div>

            {proposta.mensagem && (
                <div className="card-proposta-mensagem">
                    <p>"{proposta.mensagem}"</p>
                </div>
            )}

            <div className="card-proposta-actions">
                {/* Se a proposta foi modificada pela frota, exibe Aceitar e Recusar */}
                {proposta.status === 'MODIFICADA' && (
                    <>
                        <button
                            className="btn btn-success btn-sm"
                            onClick={handleAceitar}
                            disabled={loading}
                        >
                            {loading ? 'Aceitando...' : 'Aceitar Contraproposta'}
                        </button>
                        <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={handleRecusar}
                            disabled={loading}
                        >
                            Recusar
                        </button>
                    </>
                )}

                {/* Se a proposta estiver pendente, permite cancelar */}
                {proposta.status === 'PENDENTE' && (
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={handleCancelar}
                        disabled={loading}
                    >
                        {loading ? 'Cancelando...' : 'Cancelar Proposta'}
                    </button>
                )}
            </div>
        </div>
    );
}