// components/ProximosFretes.jsx
function ProximosFretes({ fretes }) {
    if (!fretes || fretes.length === 0) {
        return (
            <div className="proximos-fretes">
                <h4>Próximos Fretes</h4>
                <p style={{ color: '#6B7280' }}>Nenhum frete programado</p>
            </div>
        );
    }

    return (
        <div className="proximos-fretes">
            <h4>Próximos Fretes</h4>
            {fretes.map((frete, index) => (
                <div key={index} className="frete-item">
                    <div className="frete-route">
                        <span className="frete-origem">{frete.origem}</span>
                        <span className="frete-arrow">→</span>
                        <span className="frete-destino">{frete.destino}</span>
                    </div>
                    <div className="frete-details">
                        <span className="frete-data">{frete.data}</span>
                        <span className={`frete-status status-${frete.status}`}>{frete.status}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ProximosFretes;