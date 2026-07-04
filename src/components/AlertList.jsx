// components/AlertList.jsx
function AlertList({ alerts, title = 'Alertas' }) {
    if (!alerts || alerts.length === 0) {
        return (
            <div className="alert-list">
                <h4>{title}</h4>
                <p style={{ color: '#6B7280' }}>Nenhum alerta no momento</p>
            </div>
        );
    }

    return (
        <div className="alert-list">
            <h4>{title}</h4>
            {alerts.map((alert, index) => (
                <div key={index} className={`alert-item alert-${alert.tipo || 'warning'}`}>
                    <span className="alert-icon">{alert.icone || '⚠️'}</span>
                    <div className="alert-content">
                        <p className="alert-message">{alert.mensagem}</p>
                        {alert.detalhes && <span className="alert-detalhes">{alert.detalhes}</span>}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default AlertList;