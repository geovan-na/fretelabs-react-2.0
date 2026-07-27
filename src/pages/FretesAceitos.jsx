import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';

export default function FretesAceitos() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [fretes, setFretes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtro, setFiltro] = useState('ACEITO');
    const [motoristas, setMotoristas] = useState([]);
    const [showDesignar, setShowDesignar] = useState(null);
    const [processando, setProcessando] = useState(null);

    const token = localStorage.getItem('token');
    const isFrota = user?.tipo?.toLowerCase() === 'frota';
    const isAutonomo = user?.tipo?.toLowerCase() === 'autonomo';

    useEffect(() => {
        carregarFretes();
        if (isFrota) {
            carregarMotoristas();
        }
    }, [filtro]);

    const carregarFretes = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.fretes.listarAceitos(token, `?status=${filtro}`);
            setFretes(response.data || response || []);
        } catch (err) {
            console.error('Erro ao carregar fretes:', err);
            setError('Erro ao carregar a lista de fretes.');
        } finally {
            setLoading(false);
        }
    };

    const carregarMotoristas = async () => {
        try {
            const response = await api.motoristas.listarVinculados(token);
            const lista = Array.isArray(response) 
                ? response 
                : (response.data || []);
            
            setMotoristas(lista);
        } catch (err) {
            console.error('Erro ao carregar motoristas:', err);
        }
    };

    const handleDesignarMotorista = async (freteId, motoristaId) => {
        if (!motoristaId) {
            alert('Por favor, selecione um motorista válido.');
            return;
        }

        setProcessando(freteId);
        try {
            // 1. Busca as candidaturas associadas a este frete
            const responseCandidaturas = await api.candidaturas.listarPorFrete(freteId, token);
            const listaCandidaturas = Array.isArray(responseCandidaturas) 
                ? responseCandidaturas 
                : (responseCandidaturas.data || []);

            // 2. Encontra a candidatura com status ACEITO
            const candidaturaAceita = listaCandidaturas.find(c => c.status === 'ACEITO');

            if (!candidaturaAceita) {
                alert('Não foi encontrada uma candidatura aceita para este frete.');
                return;
            }

            // 3. Executa a designação no backend
            // Passamos o ID garantindo que é numérico
            await api.candidaturas.designarMotorista(
                candidaturaAceita.id, 
                Number(motoristaId), 
                token
            );

            setShowDesignar(null);
            await carregarFretes();
            alert('Motorista designado com sucesso!');
        } catch (err) {
            console.error('Erro ao designar motorista:', err);
            alert(err.message || 'Erro ao designar motorista. Tente novamente.');
        } finally {
            setProcessando(null);
        }
    };

    const handleAtualizarStatus = async (freteId, novoStatus) => {
        setProcessando(freteId);
        try {
            await api.fretes.atualizar(freteId, { status: novoStatus }, token);
            await carregarFretes();
            alert(`Frete atualizado para ${novoStatus}`);
        } catch (err) {
            console.error('Erro ao atualizar status:', err);
            alert('Erro ao atualizar status. Tente novamente.');
        } finally {
            setProcessando(null);
        }
    };

    const formatarMoeda = (valor) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor || 0);
    };

    const formatarData = (data) => {
        if (!data) return '-';
        return new Date(data).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'ACEITO': 'status-aceito',
            'TRANSITO': 'status-transito',
            'CONCLUIDO': 'status-concluido',
            'CANCELADO': 'status-cancelado'
        };
        return statusMap[status] || '';
    };

    const getStatusTexto = (status) => {
        const statusMap = {
            'ACEITO': 'Aceito',
            'TRANSITO': 'Em Trânsito',
            'CONCLUIDO': 'Concluído',
            'CANCELADO': 'Cancelado'
        };
        return statusMap[status] || status;
    };

    const extrairCidadeEstado = (endereco) => {
        if (!endereco) return '-';
        const partes = endereco.split('-');
        if (partes.length >= 2) {
            const ultimaParte = partes[partes.length - 1].trim();
            const ufMatch = ultimaParte.match(/\b([A-Z]{2})\b/);
            if (ufMatch) {
                const cidade = partes[partes.length - 2].trim();
                return `${cidade} - ${ufMatch[0]}`;
            }
            return ultimaParte;
        }
        return endereco.length > 30 ? endereco.substring(0, 30) + '...' : endereco;
    };

    const podeDesignar = (frete) => {
        return isFrota && 
               frete.status === 'ACEITO' && 
               !frete.motorista_vinculado_id;
    };

    const podeAtualizarStatus = (frete) => {
        if (isAutonomo) return true;
        if (isFrota && frete.motorista_vinculado_id) return true;
        return false;
    };

    if (loading) {
        return (
            <div className="fretes-aceitos-loading">
                <p>Carregando fretes...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="fretes-aceitos-error">
                <p>{error}</p>
                <button onClick={carregarFretes} className="btn btn-primary">
                    Tentar novamente
                </button>
            </div>
        );
    }

    return (
        <div className="fretes-aceitos-container">
            <div className="page-header">
                <h1>Fretes Aceitos</h1>
                <p className="subtitle">
                    Gerencie os fretes que foram aceitos pelo embarcador
                </p>
            </div>

            <div className="fretes-aceitos-filtros">
                <button 
                    className={`filtro-btn ${filtro === 'ACEITO' ? 'active' : ''}`}
                    onClick={() => setFiltro('ACEITO')}
                >
                    Aceitos
                </button>
                <button 
                    className={`filtro-btn ${filtro === 'TRANSITO' ? 'active' : ''}`}
                    onClick={() => setFiltro('TRANSITO')}
                >
                    Em Trânsito
                </button>
                <button 
                    className={`filtro-btn ${filtro === 'CONCLUIDO' ? 'active' : ''}`}
                    onClick={() => setFiltro('CONCLUIDO')}
                >
                    Concluídos
                </button>
            </div>

            {fretes.length === 0 ? (
                <div className="fretes-aceitos-vazio">
                    <p>Nenhum frete encontrado.</p>
                    <p className="fretes-aceitos-vazio-sub">
                        {filtro === 'ACEITO' 
                            ? 'Quando um embarcador aceitar sua candidatura, o frete aparecerá aqui.'
                            : `Nenhum frete com status "${filtro}".`}
                    </p>
                </div>
            ) : (
                <div className="fretes-aceitos-grid">
                    {fretes.map((frete) => {
                        const origem = extrairCidadeEstado(frete.origem_endereco || frete.origem_cep);
                        const destino = extrairCidadeEstado(frete.destino_endereco || frete.destino_cep);

                        return (
                            <div key={frete.id} className="card-frete-aceito">
                                <div className="card-frete-header">
                                    <div className="card-frete-id">
                                        <span className="card-frete-id-label">Frete</span>
                                        <span className="card-frete-id-value">#{frete.id}</span>
                                    </div>
                                    <span className={`status-badge ${getStatusBadge(frete.status)}`}>
                                        {getStatusTexto(frete.status)}
                                    </span>
                                </div>

                                <div className="card-frete-body">
                                    <div className="card-frete-route">
                                        <div className="route-point">
                                            <span className="route-point-label">Origem</span>
                                            <span className="route-point-value">{origem}</span>
                                        </div>
                                        <div className="route-arrow">→</div>
                                        <div className="route-point">
                                            <span className="route-point-label">Destino</span>
                                            <span className="route-point-value">{destino}</span>
                                        </div>
                                    </div>

                                    <div className="card-frete-info">
                                        <div className="card-frete-info-item">
                                            <span className="card-frete-info-label">Tipo</span>
                                            <span className="card-frete-info-value">{frete.tipo_carga || '-'}</span>
                                        </div>
                                        <div className="card-frete-info-item">
                                            <span className="card-frete-info-label">Peso</span>
                                            <span className="card-frete-info-value">{frete.peso_kg ? `${frete.peso_kg} kg` : '-'}</span>
                                        </div>
                                        <div className="card-frete-info-item">
                                            <span className="card-frete-info-label">Valor</span>
                                            <span className="card-frete-info-value card-frete-valor">{formatarMoeda(frete.valor_ofertado)}</span>
                                        </div>
                                        <div className="card-frete-info-item">
                                            <span className="card-frete-info-label">Coleta</span>
                                            <span className="card-frete-info-value">{formatarData(frete.data_coleta_prevista)}</span>
                                        </div>
                                    </div>

                                    {/* Designar Motorista (FROTA) */}
                                    {podeDesignar(frete) && (
                                        <div className="card-frete-motorista">
                                            <button 
                                                className="btn btn-primary btn-sm"
                                                onClick={() => setShowDesignar(showDesignar === frete.id ? null : frete.id)}
                                                disabled={processando === frete.id}
                                            >
                                                {showDesignar === frete.id ? 'Cancelar' : 'Designar Motorista'}
                                            </button>

                                            {showDesignar === frete.id && (
                                                <div className="motorista-selector">
                                                    <select 
                                                        className="form-select"
                                                        defaultValue=""
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (val) {
                                                                handleDesignarMotorista(frete.id, val);
                                                            }
                                                        }}
                                                        disabled={processando === frete.id}
                                                    >
                                                        <option value="" disabled>Selecione um motorista...</option>
                                                        {motoristas.map((m) => {
                                                            // Identifica o ID correto do motorista (pode vir m.id, m.motorista_id ou m.motorista_vinculado_id)
                                                            const mId = m.id || m.motorista_id || m.motorista_vinculado_id;
                                                            const nome = m.nome || m.usuario_nome || `Motorista #${mId}`;
                                                            return (
                                                                <option key={mId} value={mId}>
                                                                    {nome} {m.cnh ? `- CNH: ${m.cnh}` : ''}
                                                                </option>
                                                            );
                                                        })}
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Mostrar Motorista Designado */}
                                    {frete.motorista_vinculado_id && (
                                        <div className="card-frete-motorista-designado">
                                            <span className="motorista-designado-label">Motorista Designado:</span>
                                            <span className="motorista-designado-nome">
                                                {frete.motorista_nome || 'Motorista designado'}
                                            </span>
                                        </div>
                                    )}

                                    {/* Botões de Ação */}
                                    <div className="card-frete-actions">
                                        <button 
                                            className="btn btn-outline btn-sm"
                                            onClick={() => navigate(`/dashboard/fretes/${frete.id}`)}
                                        >
                                            Ver Detalhes
                                        </button>

                                        {podeAtualizarStatus(frete) && frete.status === 'ACEITO' && (
                                            <button 
                                                className="btn btn-primary btn-sm"
                                                onClick={() => handleAtualizarStatus(frete.id, 'TRANSITO')}
                                                disabled={processando === frete.id}
                                            >
                                                {processando === frete.id ? 'Processando...' : 'Iniciar Viagem'}
                                            </button>
                                        )}

                                        {podeAtualizarStatus(frete) && frete.status === 'TRANSITO' && (
                                            <button 
                                                className="btn btn-success btn-sm"
                                                onClick={() => handleAtualizarStatus(frete.id, 'CONCLUIDO')}
                                                disabled={processando === frete.id}
                                            >
                                                {processando === frete.id ? 'Processando...' : 'Concluir Entrega'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}