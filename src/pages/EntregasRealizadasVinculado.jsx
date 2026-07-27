import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import ResumoEntregas from '../components/ResumoEntregas';

const EntregasRealizadasVinculado = () => {
    const [entregas, setEntregas] = useState([]);
    const [resumo, setResumo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mesSelecionado, setMesSelecionado] = useState('');
    const [anoSelecionado, setAnoSelecionado] = useState('');

    const token = localStorage.getItem('token');

    const meses = [
        { value: '1', label: 'Janeiro' },
        { value: '2', label: 'Fevereiro' },
        { value: '3', label: 'Março' },
        { value: '4', label: 'Abril' },
        { value: '5', label: 'Maio' },
        { value: '6', label: 'Junho' },
        { value: '7', label: 'Julho' },
        { value: '8', label: 'Agosto' },
        { value: '9', label: 'Setembro' },
        { value: '10', label: 'Outubro' },
        { value: '11', label: 'Novembro' },
        { value: '12', label: 'Dezembro' }
    ];

    const anos = [];
    for (let i = 2023; i <= new Date().getFullYear(); i++) {
        anos.push({ value: String(i), label: String(i) });
    }

    const carregarEntregas = useCallback(async (mes, ano) => {
        setLoading(true);
        setError(null);
        try {
            const data = await api.motoristaVinculado.listarEntregasRealizadas(token, mes, ano);
            setResumo(data.resumo || { total_entregas: 0, total_recebido: 0, media_por_entrega: 0, meses_trabalhados: 0 });
            setEntregas(data.entregas || []);
        } catch (err) {
            setError(err.message || 'Erro ao carregar entregas');
            console.error('Erro ao carregar entregas:', err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        carregarEntregas(mesSelecionado, anoSelecionado);
    }, [mesSelecionado, anoSelecionado, carregarEntregas]);

    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        if (name === 'mes') {
            setMesSelecionado(value);
        } else if (name === 'ano') {
            setAnoSelecionado(value);
        }
    };

    const limparFiltros = () => {
        setMesSelecionado('');
        setAnoSelecionado('');
    };

    const formatarData = (data) => {
        if (!data) return '-';
        const partes = data.split('T')[0].split('-');
        if (partes.length === 3) {
            return `${partes[2]}/${partes[1]}/${partes[0]}`;
        }
        return new Date(data).toLocaleDateString('pt-BR');
    };

    const formatarMoeda = (valor) => {
        if (valor === undefined || valor === null) return 'R$ 0,00';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    };

    const getAvaliacaoEstrelas = (nota) => {
        if (!nota) return '☆'.repeat(5);
        const estrelas = Math.round(nota);
        return '★'.repeat(estrelas) + '☆'.repeat(5 - estrelas);
    };

    return (
        <div className="motoristas-container">
            <div className="page-header">
                <div>
                    <h1>Entregas Realizadas</h1>
                    <p className="subtitle">Histórico de todas as suas entregas</p>
                </div>
            </div>

            {error && (
                <div className="propostas-mensagem erro">
                    <p>{error}</p>
                </div>
            )}

            {!loading && resumo && (
                <ResumoEntregas resumo={resumo} />
            )}

            {loading ? (
                <div className="propostas-loading">
                    <p>Carregando entregas...</p>
                </div>
            ) : (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Rota</th>
                                <th>Tipo de Carga</th>
                                <th>Data Entrega</th>
                                <th>Valor</th>
                                <th>Avaliação</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entregas.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="table-empty">
                                        Nenhuma entrega encontrada
                                    </td>
                                </tr>
                            ) : (
                                entregas.map((entrega) => (
                                    <tr key={entrega.id}>
                                        <td>
                                            <strong>{entrega.codigo || `FR${String(entrega.id).padStart(5, '0')}`}</strong>
                                        </td>
                                        <td>
                                            <div style={{ fontSize: '0.8rem' }}>
                                                <div>{entrega.origem || '-'}</div>
                                                <div style={{ color: '#9CA3AF' }}>→</div>
                                                <div>{entrega.destino || '-'}</div>
                                            </div>
                                        </td>
                                        <td>{entrega.tipo_carga || '-'}</td>
                                        <td>{formatarData(entrega.data_entrega)}</td>
                                        <td>
                                            <span className="card-frete-valor">
                                                {formatarMoeda(entrega.valor)}
                                            </span>
                                        </td>
                                        <td>
                                            <span style={{ color: '#FF8200' }}>
                                                {getAvaliacaoEstrelas(entrega.avaliacao_media)}
                                            </span>
                                            <span style={{ fontSize: '0.7rem', color: '#6B7280', marginLeft: '4px' }}>
                                                {entrega.avaliacao_media ? `(${entrega.avaliacao_media.toFixed(1)})` : ''}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default EntregasRealizadasVinculado;