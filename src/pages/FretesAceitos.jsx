// pages/FretesAceitos.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import CardFreteAceito from '../components/CardFreteAceito';

export default function FretesAceitos() {
    const { user } = useAuth();
    const [fretes, setFretes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtro, setFiltro] = useState('ACEITO');

    const token = localStorage.getItem('token');
    const isFrota = user?.tipo === 'FROTA';

    useEffect(() => {
        carregarFretes();
    }, []);

    const carregarFretes = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.fretes.listar(token, `?status=${filtro}`);
            setFretes(response.data || []);
        } catch (err) {
            console.error('Erro ao carregar fretes:', err);
            setError('Erro ao carregar fretes aceitos.');
        } finally {
            setLoading(false);
        }
    };

    const handleFiltroChange = (status) => {
        setFiltro(status);
        carregarFretes();
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

            {/* FILTROS */}
            <div className="fretes-aceitos-filtros">
                <button 
                    className={`filtro-btn ${filtro === 'ACEITO' ? 'active' : ''}`}
                    onClick={() => handleFiltroChange('ACEITO')}
                >
                    Aceitos
                </button>
                <button 
                    className={`filtro-btn ${filtro === 'TRANSITO' ? 'active' : ''}`}
                    onClick={() => handleFiltroChange('TRANSITO')}
                >
                    Em Trânsito
                </button>
                <button 
                    className={`filtro-btn ${filtro === 'CONCLUIDO' ? 'active' : ''}`}
                    onClick={() => handleFiltroChange('CONCLUIDO')}
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
                    {fretes.map((frete) => (
                        <CardFreteAceito 
                            key={frete.id} 
                            frete={frete}
                            isFrota={isFrota}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}