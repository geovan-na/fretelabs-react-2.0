// components/VeiculoCard.jsx
function VeiculoCard({ veiculo }) {
    if (!veiculo) {
        return (
            <div className="veiculo-card">
                <h4>Meu Veículo</h4>
                <p style={{ color: '#6B7280' }}>Nenhum veículo cadastrado</p>
            </div>
        );
    }

    return (
        <div className="veiculo-card">
            <h4>Meu Veículo</h4>
            <div className="veiculo-info">
                <p className="veiculo-modelo">{veiculo.modelo}</p>
                <p className="veiculo-placa">Placa: {veiculo.placa}</p>
                <p className="veiculo-status">Status: {veiculo.status}</p>
                <p className="veiculo-capacidade">Capacidade: {veiculo.capacidade_kg}kg</p>
            </div>
        </div>
    );
}

export default VeiculoCard;