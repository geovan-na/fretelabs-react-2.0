// components/motoristas/CardPropostaRecebida.jsx
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMotoristas } from '../hooks/useMotoristas';
import ModalContraProposta from './ModalContraProposta';

export default function CardPropostaRecebida({ proposta, onUpdate }) {
    const [loading, setLoading] = useState(false);
    const [showContraProposta, setShowContraProposta] = useState(false);
    const { user } = useAuth();
    const { aceitarProposta, recusarProposta } = useMotoristas();

    const getStatusClasse = (status) => {
        const statusMap = {
            'PENDENTE': 'pendente',
            'ACEITA': 'aceita',
            'RECUSADA': 'recusada',
            'MODIFICADA': 'modificada',
            'EM_NEGOCIACAO': 'modificada',
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
            'EM_NEGOCIACAO': 'Em Negociação',
            'CONTRATO_ASSINADO': 'Contrato Assinado',
            'CANCELADA': 'Cancelada',
            'EXPIRADA': 'Expirada'
        };
        return statusMap[status] || status;
    };

    const formatarMoeda = (valor) => {
        if (valor === null || valor === undefined || valor === '') return '-';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(Number(valor));
    };

    const formatarValorProposta = () => {
        if (proposta.tipo_contrato === 'SALARIO') {
            return formatarMoeda(proposta.valor_salario);
        }
        if (proposta.tipo_contrato === 'COMISSAO') {
            return proposta.valor_comissao ? `${proposta.valor_comissao}%` : '-';
        }
        if (proposta.tipo_contrato === 'MISTO') {
            const partes = [];
            if (proposta.valor_salario) partes.push(formatarMoeda(proposta.valor_salario));
            if (proposta.valor_comissao) partes.push(`${proposta.valor_comissao}%`);
            return partes.length > 0 ? partes.join(' + ') : 'Misto';
        }
        return '-';
    };

    const formatarData = (data) => {
        if (!data) return '-';
        return new Date(data).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const handleAceitar = async () => {
        if (!window.confirm('Tem certeza que deseja aceitar esta proposta?')) return;

        setLoading(true);
        try {
            await aceitarProposta(proposta.id);
            alert('Proposta aceita com sucesso!');
            onUpdate();
        } catch (err) {
            console.error('Erro ao aceitar proposta:', err);
            alert(err.response?.data?.error || err.message || 'Erro ao aceitar proposta. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleRecusar = async () => {
        const motivo = prompt('Informe o motivo da recusa (opcional):');
        if (motivo === null) return;

        setLoading(true);
        try {
            await recusarProposta(proposta.id, motivo || 'Recusada pelo destinatário');
            alert('Proposta recusada com sucesso!');
            onUpdate();
        } catch (err) {
            console.error('Erro ao recusar proposta:', err);
            alert(err.response?.data?.error || err.message || 'Erro ao recusar proposta. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const isFrota = user?.tipo?.toLowerCase() === 'frota';
    const nomeContraparte = proposta.tipo === 'FROTA_PARA_MOTORISTA'
        ? (proposta.frota_nome || proposta.motorista_nome || 'Frota')
        : (proposta.motorista_nome || proposta.frota_nome || 'Motorista');

    const statusAtivo = ['PENDENTE', 'MODIFICADA', 'EM_NEGOCIACAO'].includes(proposta.status);
    const meuTurno = proposta.aguardando_resposta_de
        ? (proposta.aguardando_resposta_de === 'FROTA' ? isFrota : !isFrota)
        : proposta.status === 'PENDENTE';
    const podeAcao = statusAtivo && meuTurno;

    return (
        <>
            <div className="card-proposta">
                <div className="card-proposta-header">
                    <div>
                        <span className="card-motorista-nome">{nomeContraparte}</span>
                        <div className="card-motorista-cnh">
                            Recebida em {formatarData(proposta.data_envio || proposta.criado_em)}
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
                        <span className="card-motorista-info-label">Valor Solicitado</span>
                        <span className="card-motorista-info-value">
                            {formatarValorProposta()}
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

                {statusAtivo && !meuTurno && (
                    <div className="card-proposta-mensagem">
                        <p>Contraproposta enviada. Aguardando resposta da outra parte.</p>
                    </div>
                )}

                {podeAcao && (
                    <div className="card-proposta-actions">
                        <button
                            className="btn btn-success btn-sm"
                            onClick={handleAceitar}
                            disabled={loading}
                        >
                            {loading ? 'Processando...' : 'Aceitar'}
                        </button>
                        <button
                            className="btn btn-danger btn-sm"
                            onClick={handleRecusar}
                            disabled={loading}
                        >
                            Recusar
                        </button>
                        <button
                            className="btn btn-outline btn-sm"
                            onClick={() => setShowContraProposta(true)}
                            disabled={loading}
                        >
                            Enviar Contraproposta
                        </button>
                    </div>
                )}
            </div>

            {showContraProposta && (
                <ModalContraProposta
                    proposta={proposta}
                    onClose={() => setShowContraProposta(false)}
                    onSuccess={() => {
                        setShowContraProposta(false);
                        onUpdate();
                    }}
                />
            )}
        </>
    );
}
