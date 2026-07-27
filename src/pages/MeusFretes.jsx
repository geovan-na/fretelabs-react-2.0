import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import CardFrete from '../components/CardFrete';

export default function MeusFretes() {
    const { user } = useAuth();
    const [fretes, setFretes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtro, setFiltro] = useState('TODOS');

    const token = localStorage.getItem('token');

    useEffect(() => {
        carregarFretes();
    }, [filtro]);

    const carregarFretes = async () => {
        setLoading(true);
        setError(null);

        try {
            // Chamando a rota específica mapeada na api
            const response = await api.fretes.listarMeusFretes(token, `?status=${filtro}`);
            console.log(`Fretes do embarcador carregados para o status ${filtro}:`, response.data);
            
            // Tratando o envelopamento { data: rows } do backend de forma segura
            if (response.data && Array.isArray(response.data.data)) {
                setFretes(response.data.data);
            } else if (response.data && Array.isArray(response.data)) {
                setFretes(response.data);
            } else {
                setFretes([]);
            }
        } catch (err) {
            console.error('Erro ao carregar fretes:', err);
            setError('Erro ao carregar a lista de fretes.');
        } finally {
            setLoading(false);
        }
    };

    const filtrarFretes = (status) => {
        setFiltro(status);
    };

    // Como o backend já faz o filtro por status direto no banco,
    // usamos o array 'fretes' diretamente sem precisar filtrar na memória do Javascript
    const fretesFiltrados = fretes;

    const statusOptions = [
        { value: 'TODOS', label: 'Todos' },
        { value: 'AGUARDANDO', label: 'Aguardando' },
        { value: 'NEGOCIACAO', label: 'Negociação' },
        { value: 'ACEITO', label: 'Aceito' },
        { value: 'TRANSITO', label: 'Em Trânsito' },
        { value: 'CONCLUIDO', label: 'Concluído' },
        { value: 'CANCELADO', label: 'Cancelado' }
    ];

    if (loading) {
        return (
            <div className="meus-fretes-loading">
                <p>Carregando seus fretes...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="meus-fretes-error">
                <p>{error}</p>
                <button onClick={carregarFretes} className="btn btn-primary">
                    Tentar novamente
                </button>
            </div>
        );
    }

    return (
        <div className="meus-fretes-container">
            <div className="page-header">
                <h1>Meus Fretes</h1>
                <p className="subtitle">
                    Gerencie todos os seus fretes publicados
                </p>
            </div>

            <div className="meus-fretes-filtros">
                {statusOptions.map((status) => (
                    <button
                        key={status.value}
                        className={`filtro-btn ${filtro === status.value ? 'active' : ''}`}
                        onClick={() => filtrarFretes(status.value)}
                    >
                        {status.label}
                    </button>
                ))}
            </div>

            <div className="meus-fretes-total">
                {fretesFiltrados.length} frete(s) encontrado(s)
            </div>

            {fretesFiltrados.length === 0 ? (
                <div className="meus-fretes-vazio">
                    <p>Nenhum frete encontrado.</p>
                    <p className="meus-fretes-vazio-sub">
                        {filtro === 'TODOS' 
                            ? 'Você ainda não publicou nenhum frete.'
                            : `Nenhum frete com status "${filtro}".`}
                    </p>
                </div>
            ) : (
                <div className="meus-fretes-grid">
                    {fretesFiltrados.map((frete) => (
                        <CardFrete key={frete.id} frete={frete} />
                    ))}
                </div>
            )}
        </div>
    );
}