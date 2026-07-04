// components/StatCard.jsx
function StatCard({ title, value, color = '#FF8200' }) {
    return (
        <div className="stat-card" style={{ borderLeftColor: color }}>
            <p className="stat-card-title">{title}</p>
            <p className="stat-card-value">{value}</p>
        </div>
    );
}

export default StatCard;