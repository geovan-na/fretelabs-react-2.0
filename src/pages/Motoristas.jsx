// pages/Motoristas.jsx
import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useMotoristas } from '../hooks/useMotoristas';
import GuiaMotoristasVinculados from '../components/GuiaMotoristasVinculados';
import GuiaMotoristasDisponiveis from '../components/GuiaMotoristasDisponiveis';
import GuiaPropostasEnviadas from '../components/GuiaPropostasEnviadas';
import GuiaPropostasRecebidas from '../components/GuiaPropostasRecebidas';

export default function Motoristas() {
    const { user } = useAuth();
    const [guiaAtiva, setGuiaAtiva] = useState('vinculados');
    const isFrota = user?.tipo?.toLowerCase() === 'frota';

    const {
        loading,
        error,
        vinculados,
        disponiveis,
        propostasEnviadas,
        propostasRecebidas,
        recarregarTodos
    } = useMotoristas();

    const renderConteudo = () => {
        switch (guiaAtiva) {
            case 'vinculados':
                return <GuiaMotoristasVinculados motoristas={vinculados} onUpdate={recarregarTodos} />;
            case 'disponiveis':
                return <GuiaMotoristasDisponiveis motoristas={disponiveis} onUpdate={recarregarTodos} />;
            case 'propostas-enviadas':
                return <GuiaPropostasEnviadas propostas={propostasEnviadas} onUpdate={recarregarTodos} />;
            case 'propostas-recebidas':
                return <GuiaPropostasRecebidas propostas={propostasRecebidas} onUpdate={recarregarTodos} />;
            default:
                return null;
        }
    };

    if (!isFrota) {
        return (
            <div className="motoristas-container">
                <div className="page-header">
                    <h1>Acesso Restrito</h1>
                    <p className="subtitle">
                        Esta página é exclusiva para frotas.
                    </p>
                </div>
            </div>
        );
    }

    const guias = [
        { id: 'vinculados', label: 'Meus Motoristas' },
        { id: 'disponiveis', label: 'Encontrar Motoristas' },
        { id: 'propostas-enviadas', label: 'Propostas Enviadas' },
        {
            id: 'propostas-recebidas',
            label: 'Propostas Recebidas',
            badge: propostasRecebidas.filter(p => p.status === 'PENDENTE' || p.status === 'MODIFICADA').length
        }
    ];

    return (
        <div className="motoristas-container">
            <div className="page-header">
                <h1>Motoristas</h1>
                <p className="subtitle">
                    Gerencie os motoristas da sua frota e encontre novos talentos
                </p>
            </div>

            <div className="motoristas-guias">
                {guias.map((guia) => (
                    <button
                        key={guia.id}
                        className={`guia-btn ${guiaAtiva === guia.id ? 'active' : ''}`}
                        onClick={() => setGuiaAtiva(guia.id)}
                    >
                        {guia.label}
                        {guia.badge > 0 && (
                            <span className="guia-badge">{guia.badge}</span>
                        )}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="motoristas-loading">
                    <p>Carregando...</p>
                </div>
            ) : error ? (
                <div className="motoristas-error">
                    <p>{error}</p>
                    <button onClick={recarregarTodos} className="btn btn-primary">
                        Tentar novamente
                    </button>
                </div>
            ) : (
                renderConteudo()
            )}
        </div>
    );
}