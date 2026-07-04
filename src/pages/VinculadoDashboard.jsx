import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';  // ← CORRIGIDO
import StatsGrid from '../components/StatsGrid';
import ProximosFretes from '../components/ProximosFretes';
import RecentActivities from '../components/RecentActivities';
import { api } from '../services/api';

function VinculadoDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({});
    const [proximosFretes, setProximosFretes] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                
                const [statsRes, fretesRes, activitiesRes] = await Promise.all([
                    api.request('/dashboard/vinculado/stats', 'GET', null, token),
                    api.request('/dashboard/proximos-fretes', 'GET', null, token),
                    api.request('/dashboard/atividades', 'GET', null, token)
                ]);
                
                setStats(statsRes.stats);
                setProximosFretes(fretesRes.fretes);
                setActivities(activitiesRes.atividades);
            } catch (error) {
                console.error('Erro ao carregar dashboard:', error);
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, []);

    if (loading) {
        return <div className="dashboard-loading">Carregando...</div>;
    }

    return (
        <div className="dashboard-vinculado">
            <div className="dashboard-welcome">
                <h1>Olá, {user?.nome || 'Bem-vindo'}!</h1>
                <p>Acompanhe seus fretes e entregas realizadas</p>
            </div>

            <StatsGrid stats={stats} role="vinculado" />
            
            <div className="dashboard-grid-2col">
                <ProximosFretes fretes={proximosFretes} />
                <RecentActivities activities={activities} title="Histórico de Entregas" />
            </div>
        </div>
    );
}

export default VinculadoDashboard;