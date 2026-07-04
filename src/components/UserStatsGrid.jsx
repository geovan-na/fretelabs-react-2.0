// components/dashboard/UserStatsGrid.jsx
import StatCard from './StatCard';

const UserStatsGrid = ({ stats, userRole }) => {
    const getStatsForRole = () => {
        switch(userRole) {
            case 'embarcador':
                return [
                    { title: 'Fretes Publicados', value: stats.totalFretes || 0, color: 'primary' },
                    { title: 'Em Andamento', value: stats.emAndamento || 0, color: 'warning' },
                    { title: 'Concluidos', value: stats.concluidos || 0, color: 'success' },
                    { title: 'Gasto Total', value: `R$ ${stats.gastoTotal || 0}`, color: 'info' }
                ];
            case 'frota':
                return [
                    { title: 'Veiculos', value: stats.totalVeiculos || 0, color: 'primary' },
                    { title: 'Motoristas', value: stats.totalMotoristas || 0, color: 'info' },
                    { title: 'Fretes Realizados', value: stats.totalFretes || 0, color: 'success' },
                    { title: 'Faturamento', value: `R$ ${stats.faturamento || 0}`, color: 'warning' }
                ];
            case 'autonomo':
                return [
                    { title: 'Meu Veiculo', value: stats.possuiVeiculo ? 'Cadastrado' : 'Nao cadastrado', color: 'primary' },
                    { title: 'Fretes Realizados', value: stats.totalFretes || 0, color: 'success' },
                    { title: 'Em Andamento', value: stats.emAndamento || 0, color: 'warning' },
                    { title: 'Receita', value: `R$ ${stats.receita || 0}`, color: 'info' }
                ];
            case 'vinculado':
                return [
                    { title: 'Fretes Realizados', value: stats.totalFretes || 0, color: 'success' },
                    { title: 'Em Andamento', value: stats.emAndamento || 0, color: 'warning' },
                    { title: 'Recebido', value: `R$ ${stats.recebido || 0}`, color: 'info' },
                    { title: 'Avaliacao', value: `${stats.avaliacao || 0} estrelas`, color: 'primary' }
                ];
            case 'admin':
                return [
                    { title: 'Usuarios', value: stats.totalUsuarios || 0, color: 'primary' },
                    { title: 'Fretes', value: stats.totalFretes || 0, color: 'info' },
                    { title: 'Veiculos', value: stats.totalVeiculos || 0, color: 'success' },
                    { title: 'Faturamento', value: `R$ ${stats.faturamento || 0}`, color: 'warning' }
                ];
            default:
                return [];
        }
    };

    const statsList = getStatsForRole();

    return (
        <div className="stats-grid">
            {statsList.map((stat, index) => (
                <StatCard key={index} {...stat} />
            ))}
        </div>
    );
};

export default UserStatsGrid;