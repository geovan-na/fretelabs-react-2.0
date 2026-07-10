// components/CardVeiculo.jsx
export default function CardVeiculo({ veiculo, onEditar, onDeletar }) {
    const getStatusBadge = (status) => {
        const statusMap = {
            'ATIVO': 'status-ativo',
            'INATIVO': 'status-inativo',
            'MANUTENCAO': 'status-manutencao'
        };
        return statusMap[status] || '';
    };

    const getStatusTexto = (status) => {
        const statusMap = {
            'ATIVO': 'Ativo',
            'INATIVO': 'Inativo',
            'MANUTENCAO': 'Em Manutenção'
        };
        return statusMap[status] || status;
    };

    const getTipoVeiculoTexto = (tipo) => {
        const tipoMap = {
            'VUC': 'VUC',
            'TOCO': 'Toco',
            'TRUCK': 'Truck',
            'BITREM': 'Bitrem',
            'RODOTREM': 'Rodotrem',
            'CARRETA': 'Carreta'
        };
        return tipoMap[tipo] || tipo;
    };

    return (
        <div className="card-veiculo">
            <div className="card-veiculo-header">
                <div className="card-veiculo-placa">
                    <span className="card-veiculo-placa-label">Placa</span>
                    <span className="card-veiculo-placa-value">{veiculo.placa}</span>
                </div>
                <span className={`status-badge ${getStatusBadge(veiculo.status)}`}>
                    {getStatusTexto(veiculo.status)}
                </span>
            </div>

            <div className="card-veiculo-body">
                <div className="card-veiculo-info">
                    <div className="card-veiculo-info-item">
                        <span className="card-veiculo-info-label">Modelo</span>
                        <span className="card-veiculo-info-value">{veiculo.modelo || '-'}</span>
                    </div>
                    <div className="card-veiculo-info-item">
                        <span className="card-veiculo-info-label">Marca</span>
                        <span className="card-veiculo-info-value">{veiculo.marca || '-'}</span>
                    </div>
                    <div className="card-veiculo-info-item">
                        <span className="card-veiculo-info-label">Ano</span>
                        <span className="card-veiculo-info-value">{veiculo.ano_fabricacao || '-'}</span>
                    </div>
                    <div className="card-veiculo-info-item">
                        <span className="card-veiculo-info-label">Tipo</span>
                        <span className="card-veiculo-info-value">{getTipoVeiculoTexto(veiculo.tipo_veiculo)}</span>
                    </div>
                    <div className="card-veiculo-info-item">
                        <span className="card-veiculo-info-label">Capacidade</span>
                        <span className="card-veiculo-info-value">{veiculo.capacidade_kg ? `${veiculo.capacidade_kg} kg` : '-'}</span>
                    </div>
                    <div className="card-veiculo-info-item">
                        <span className="card-veiculo-info-label">Carroceria</span>
                        <span className="card-veiculo-info-value">{veiculo.tipo_carroceria || '-'}</span>
                    </div>
                </div>
            </div>

            <div className="card-veiculo-footer">
                <button 
                    className="btn btn-outline btn-sm"
                    onClick={() => onEditar(veiculo)}
                >
                    Editar
                </button>
                <button 
                    className="btn btn-danger btn-sm"
                    onClick={() => onDeletar(veiculo.id)}
                >
                    Deletar
                </button>
            </div>
        </div>
    );
}