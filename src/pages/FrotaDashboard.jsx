import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';  // ← CORRIGIDO
import StatsGrid from '../components/StatsGrid';
import Chart from '../components/Chart';
import RecentActivities from '../components/RecentActivities';
import AlertList from '../components/AlertList';
import { api } from '../services/api';

function FrotaDashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({});
    const [chartData, setChartData] = useState([]);
    const [activities, setActivities] = useState([]);
    const [alertas, setAlertas] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                
                const [statsRes, chartRes, activitiesRes, alertasRes] = await Promise.all([
                    api.request('/dashboard/frota/stats', 'GET', null, token),
                    api.request('/dashboard/frota/charts', 'GET', null, token),
                    api.request('/dashboard/atividades', 'GET', null, token),
                    api.request('/dashboard/alertas', 'GET', null, token)
                ]);
                
                setStats(statsRes.stats);
                setChartData(chartRes.data);
                setActivities(activitiesRes.atividades);
                setAlertas(alertasRes.alertas);
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
        <div className="dashboard-frota">
            <div className="dashboard-welcome">
                <h1>Olá, {user?.nome || 'Bem-vindo'}!</h1>
                <p>Gerencie sua frota e encontre os melhores fretes</p>
            </div>

            <StatsGrid stats={stats} role="frota" />
            
            <div className="dashboard-charts">
                <Chart 
                    data={chartData} 
                    type="bar" 
                    title="Fretes e Faturamento por Mês" 
                    height={300}
                />
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-grid-item">
                    <RecentActivities activities={activities} />
                </div>
                <div className="dashboard-grid-item">
                    <AlertList alerts={alertas} title="Alertas" />
                </div>
            </div>
        </div>
    );
}

export default FrotaDashboard;