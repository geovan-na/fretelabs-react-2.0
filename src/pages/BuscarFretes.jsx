// pages/BuscarFretes.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import CardFreteDisponivel from '../components/CardFreteDisponivel';
import Button from '../components/Button';

export default function BuscarFretes() {
    
    const navigate = useNavigate();
    const [fretes, setFretes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtros, setFiltros] = useState({
        origem: '',
        destino: '',
        tipo_carga: '',
        peso_min: '',
        peso_max: '',
        valor_min: '',
        valor_max: '',
        data_coleta: ''
    });
    const [pagina, setPagina] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [totalFretes, setTotalFretes] = useState(0);
    const [mostrarFiltros, setMostrarFiltros] = useState(false);

    const token = localStorage.getItem('token');

    useEffect(() => {
        carregarFretes();
    }, [pagina]);

    const carregarFretes = async (filtrosAtuais = filtros) => {
        setLoading(true);
        setError(null);

        try {
            const queryParams = new URLSearchParams();
            if (filtrosAtuais.origem) queryParams.append('origem', filtrosAtuais.origem);
            if (filtrosAtuais.destino) queryParams.append('destino', filtrosAtuais.destino);
            if (filtrosAtuais.tipo_carga) queryParams.append('tipo_carga', filtrosAtuais.tipo_carga);
            if (filtrosAtuais.peso_min) queryParams.append('peso_min', filtrosAtuais.peso_min);
            if (filtrosAtuais.peso_max) queryParams.append('peso_max', filtrosAtuais.peso_max);
            if (filtrosAtuais.valor_min) queryParams.append('valor_min', filtrosAtuais.valor_min);
            if (filtrosAtuais.valor_max) queryParams.append('valor_max', filtrosAtuais.valor_max);
            if (filtrosAtuais.data_coleta) queryParams.append('data_coleta', filtrosAtuais.data_coleta);

            const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
            const response = await api.fretes.listarDisponiveis(token, queryString);
            
            let dados = response.data || [];
            
            // Filtro client-side resiliente para garantir funcionamento imediato em qualquer cenário
            if (filtrosAtuais.origem) {
                const o = filtrosAtuais.origem.toLowerCase();
                dados = dados.filter(f => (f.origem_endereco || '').toLowerCase().includes(o) || (f.origem_cep || '').includes(o));
            }
            if (filtrosAtuais.destino) {
                const d = filtrosAtuais.destino.toLowerCase();
                dados = dados.filter(f => (f.destino_endereco || '').toLowerCase().includes(d) || (f.destino_cep || '').includes(d));
            }
            if (filtrosAtuais.tipo_carga) {
                dados = dados.filter(f => f.tipo_carga === filtrosAtuais.tipo_carga);
            }
            if (filtrosAtuais.peso_min) {
                dados = dados.filter(f => parseFloat(f.peso_kg || 0) >= parseFloat(filtrosAtuais.peso_min));
            }
            if (filtrosAtuais.peso_max) {
                dados = dados.filter(f => parseFloat(f.peso_kg || 0) <= parseFloat(filtrosAtuais.peso_max));
            }
            if (filtrosAtuais.valor_min) {
                dados = dados.filter(f => parseFloat(f.valor_ofertado || 0) >= parseFloat(filtrosAtuais.valor_min));
            }
            if (filtrosAtuais.valor_max) {
                dados = dados.filter(f => parseFloat(f.valor_ofertado || 0) <= parseFloat(filtrosAtuais.valor_max));
            }
            
            setFretes(dados);
            setTotalPaginas(1);
            setTotalFretes(dados.length);

        } catch (err) {
            console.error("DEBUG: Erro capturado na API:", err);
            setError('Erro ao carregar fretes disponíveis.');
        } finally {
            setLoading(false);
        }
    };

    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros(prev => ({ ...prev, [name]: value }));
    };

    const aplicarFiltros = (e) => {
        e.preventDefault();
        setPagina(1);
        carregarFretes(filtros);
    };

    const limparFiltros = () => {
        const filtrosLimpos = {
            origem: '',
            destino: '',
            tipo_carga: '',
            peso_min: '',
            peso_max: '',
            valor_min: '',
            valor_max: '',
            data_coleta: ''
        };
        setFiltros(filtrosLimpos);
        setPagina(1);
        carregarFretes(filtrosLimpos);
    };

    const tiposCarga = [
        'ALIMENTOS',
        'BEBIDAS',
        'ELETRONICOS',
        'MEDICAMENTOS',
        'PRODUTOS_QUIMICOS',
        'MATERIAIS_CONSTRUCAO',
        'MOVEIS',
        'PECAS_AUTOMOTIVAS',
        'OUTROS'
    ];

    if (loading) {
        return (
            <div className="buscar-fretes-loading">
                <p>Carregando fretes disponíveis...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="buscar-fretes-error">
                <p>{error}</p>
                <button onClick={carregarFretes} className="btn btn-primary">
                    Tentar novamente
                </button>
            </div>
        );
    }

    return (
        <div className="buscar-fretes-container">
            <div className="page-header">
                <h1>Buscar Fretes</h1>
                <p className="subtitle">
                    Encontre fretes disponíveis para transportar
                </p>
            </div>

            <button 
                className="btn-filtros-toggle"
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
            >
                {mostrarFiltros ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            </button>

            {mostrarFiltros && (
                <form onSubmit={aplicarFiltros} className="filtros-form">
                    <div className="filtros-row">
                        <div className="form-group">
                            <label>Origem</label>
                            <input
                                type="text"
                                name="origem"
                                value={filtros.origem}
                                onChange={handleFiltroChange}
                                placeholder="Cidade ou UF"
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label>Destino</label>
                            <input
                                type="text"
                                name="destino"
                                value={filtros.destino}
                                onChange={handleFiltroChange}
                                placeholder="Cidade ou UF"
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div className="filtros-row">
                        <div className="form-group">
                            <label>Tipo de Carga</label>
                            <select
                                name="tipo_carga"
                                value={filtros.tipo_carga}
                                onChange={handleFiltroChange}
                                className="form-select"
                            >
                                <option value="">Todos</option>
                                {tiposCarga.map((tipo) => (
                                    <option key={tipo} value={tipo}>{tipo}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Data de Coleta (a partir de)</label>
                            <input
                                type="date"
                                name="data_coleta"
                                value={filtros.data_coleta}
                                onChange={handleFiltroChange}
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div className="filtros-row">
                        <div className="form-group">
                            <label>Peso Mínimo (kg)</label>
                            <input
                                type="number"
                                name="peso_min"
                                value={filtros.peso_min}
                                onChange={handleFiltroChange}
                                placeholder="0"
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label>Peso Máximo (kg)</label>
                            <input
                                type="number"
                                name="peso_max"
                                value={filtros.peso_max}
                                onChange={handleFiltroChange}
                                placeholder="100000"
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div className="filtros-row">
                        <div className="form-group">
                            <label>Valor Mínimo (R$)</label>
                            <input
                                type="number"
                                name="valor_min"
                                value={filtros.valor_min}
                                onChange={handleFiltroChange}
                                placeholder="0"
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label>Valor Máximo (R$)</label>
                            <input
                                type="number"
                                name="valor_max"
                                value={filtros.valor_max}
                                onChange={handleFiltroChange}
                                placeholder="100000"
                                className="form-input"
                            />
                        </div>
                    </div>

                    <div className="filtros-actions">
                        <Button type="submit" variant="primary">
                            Aplicar Filtros
                        </Button>
                        <Button type="button" variant="secondary" onClick={limparFiltros}>
                            Limpar Filtros
                        </Button>
                    </div>
                </form>
            )}

            <div className="buscar-fretes-total">
                {totalFretes} frete(s) encontrado(s)
            </div>

            {fretes.length === 0 ? (
                <div className="buscar-fretes-vazio">
                    <p>Nenhum frete disponível.</p>
                    <p className="buscar-fretes-vazio-sub">
                        Tente ajustar seus filtros ou volte mais tarde.
                    </p>
                </div>
            ) : (
                <div className="buscar-fretes-grid">
                    {fretes.map((frete) => (
                        <CardFreteDisponivel key={frete.id} frete={frete} />
                    ))}
                </div>
            )}

            {totalPaginas > 1 && (
                <div className="paginacao">
                    <button 
                        className="paginacao-btn"
                        onClick={() => setPagina(p => Math.max(1, p - 1))}
                        disabled={pagina === 1}
                    >
                        Anterior
                    </button>
                    <span className="paginacao-info">
                        Página {pagina} de {totalPaginas}
                    </span>
                    <button 
                        className="paginacao-btn"
                        onClick={() => setPagina(p => Math.min(totalPaginas, p + 1))}
                        disabled={pagina === totalPaginas}
                    >
                        Próxima
                    </button>
                </div>
            )}
        </div>
    );
}