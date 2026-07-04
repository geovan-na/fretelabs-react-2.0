// components/FavoriteMotoristas.jsx
function FavoriteMotoristas({ motoristas }) {
    if (!motoristas || motoristas.length === 0) {
        return (
            <div className="favorite-motoristas">
                <h4>Motoristas Favoritos</h4>
                <p style={{ color: '#6B7280' }}>Nenhum motorista favorito</p>
            </div>
        );
    }

    return (
        <div className="favorite-motoristas">
            <h4>Motoristas Favoritos</h4>
            {motoristas.map((motorista, index) => (
                <div key={index} className="motorista-item">
                    <span className="motorista-nome">{motorista.nome}</span>
                    <span className="motorista-avaliacao">★ {motorista.avaliacao}</span>
                    <span className="motorista-fretes">{motorista.totalFretes} viagens</span>
                </div>
            ))}
        </div>
    );
}

export default FavoriteMotoristas;