// components/StatsGrid.jsx
import StatCard from './StatCard';

function StatsGrid({ stats, role }) {
    const getStatsConfig = () => {
        const configs = {
            embarcador: [
                { title: 'Fretes Publicados', value: stats.totalFretes || 0, color: '#FF8200' },
                { title: 'Em Andamento', value: stats.emAndamento || 0, color: '#00D2D3' },
                { title: 'Concluídos', value: stats.concluidos || 0, color: '#F59E0B' },
                { title: 'Gasto Total', value: stats.gastoTotal || 'R$ 0', color: '#3B82F6' }
            ],
            frota: [
                { title: 'Veículos', value: stats.totalVeiculos || 0, color: '#FF8200' },
                { title: 'Motoristas', value: stats.totalMotoristas || 0, color: '#3B82F6' },
                { title: 'Fretes', value: stats.totalFretes || 0, color: '#00D2D3' },
                { title: 'Faturamento', value: stats.faturamento || 'R$ 0', color: '#F59E0B' }
            ],
            autonomo: [
                { title: 'Fretes Concluídos', value: stats.fretesConcluidos || 0, color: '#00D2D3' },
                { title: 'Em Trânsito', value: stats.emTransito || 0, color: '#FF8200' },
                { title: 'Receita Total', value: stats.receitaTotal || 'R$ 0', color: '#3B82F6' },
                { title: 'Taxa de Aceite', value: stats.taxaAceite || '0%', color: '#F59E0B' }
            ],
            vinculado: [
                { title: 'Fretes Concluídos', value: stats.fretesConcluidos || 0, color: '#00D2D3' },
                { title: 'Em Trânsito', value: stats.emTransito || 0, color: '#FF8200' },
                { title: 'Total Recebido', value: stats.totalRecebido || 'R$ 0', color: '#3B82F6' },
                { title: 'Avaliação Média', value: stats.avaliacaoMedia || '0.0', color: '#F59E0B' }
            ],
            admin: [
                { title: 'Total de Usuários', value: stats.totalUsuarios || 0, color: '#FF8200' },
                { title: 'Fretes', value: stats.totalFretes || 0, color: '#00D2D3' },
                { title: 'Veículos', value: stats.totalVeiculos || 0, color: '#3B82F6' },
                { title: 'Faturamento', value: stats.faturamento || 'R$ 0', color: '#F59E0B' }
            ]
        };
        return configs[role] || configs.embarcador;
    };

    const config = getStatsConfig();

    return (
        <div className="stats-grid">
            {config.map((stat, index) => (
                <StatCard
                    key={index}
                    title={stat.title}
                    value={stat.value}
                    color={stat.color}
                />
            ))}
        </div>
    );
}

export default StatsGrid;