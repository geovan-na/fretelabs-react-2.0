// components/CardFreteDisponivel.jsx
import { useNavigate } from 'react-router-dom';

export default function CardFreteDisponivel({ frete }) {
    const navigate = useNavigate();

    const formatarMoeda = (valor) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor || 0);
    };

    const formatarData = (data) => {
        if (!data) return '-';
        return new Date(data).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const extrairCidadeEstado = (endereco) => {
        if (!endereco) return '-';
        const partes = endereco.split('-');
        if (partes.length >= 2) {
            const ultimaParte = partes[partes.length - 1].trim();
            const ufMatch = ultimaParte.match(/\b([A-Z]{2})\b/);
            if (ufMatch) {
                const cidade = partes[partes.length - 2].trim();
                return `${cidade} - ${ufMatch[0]}`;
            }
            return ultimaParte;
        }
        return endereco.length > 30 ? endereco.substring(0, 30) + '...' : endereco;
    };

    const origem = extrairCidadeEstado(frete.origem_endereco || frete.origem_cep);
    const destino = extrairCidadeEstado(frete.destino_endereco || frete.destino_cep);

    return (
        <div className="card-frete-disponivel">
            {/* CABEÇALHO */}
            <div className="card-frete-header">
                <div className="card-frete-id">
                    <span className="card-frete-id-label">Frete</span>
                    <span className="card-frete-id-value">#{frete.id}</span>
                </div>
                <span className="card-frete-embarcador">
                    {frete.embarcador_nome || 'Embarcador'}
                </span>
            </div>

            {/* ROTA */}
            <div 
                className="card-frete-route"
                onClick={() => navigate(`/dashboard/fretes/${frete.id}`)}
            >
                <div className="route-point">
                    <span className="route-point-label">Origem</span>
                    <span className="route-point-value">{origem}</span>
                </div>
                <div className="route-arrow">→</div>
                <div className="route-point">
                    <span className="route-point-label">Destino</span>
                    <span className="route-point-value">{destino}</span>
                </div>
            </div>

            {/* INFORMAÇÕES */}
            <div className="card-frete-info">
                <div className="card-frete-info-item">
                    <span className="card-frete-info-label">Tipo</span>
                    <span className="card-frete-info-value">{frete.tipo_carga || '-'}</span>
                </div>
                <div className="card-frete-info-item">
                    <span className="card-frete-info-label">Peso</span>
                    <span className="card-frete-info-value">{frete.peso_kg ? `${frete.peso_kg} kg` : '-'}</span>
                </div>
                <div className="card-frete-info-item">
                    <span className="card-frete-info-label">Valor</span>
                    <span className="card-frete-info-value card-frete-valor">{formatarMoeda(frete.valor_ofertado)}</span>
                </div>
                <div className="card-frete-info-item">
                    <span className="card-frete-info-label">Coleta</span>
                    <span className="card-frete-info-value">{formatarData(frete.data_coleta_prevista)}</span>
                </div>
            </div>

            {/* BOTÕES */}
            <div className="card-frete-footer">
                <button 
                    className="btn btn-primary"
                    onClick={() => navigate(`/dashboard/fretes/${frete.id}/candidatar`)}
                >
                    Candidatar-se
                </button>
                <button 
                    className="btn btn-outline"
                    onClick={() => navigate(`/dashboard/fretes/${frete.id}`)}
                >
                    Ver Detalhes
                </button>
            </div>
        </div>
    );
}