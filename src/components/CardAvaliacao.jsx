// components/CardAvaliacao.jsx
import { useNavigate } from 'react-router-dom';

export default function CardAvaliacao({ avaliacao }) {
    const navigate = useNavigate();

    const formatarData = (data) => {
        if (!data) return '-';
        return new Date(data).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const renderEstrelas = (nota) => {
        const estrelas = [];
        const notaInt = Math.round(nota || 0);
        for (let i = 1; i <= 5; i++) {
            estrelas.push(
                <span key={i} className={`estrela ${i <= notaInt ? 'cheia' : 'vazia'}`}>
                    ★
                </span>
            );
        }
        return estrelas;
    };

    return (
        <div className="card-avaliacao">
            <div className="card-avaliacao-header">
                <div className="card-avaliacao-info">
                    <span className="card-avaliacao-avaliador">
                        {avaliacao.avaliador_nome || 'Usuário'}
                    </span>
                    <span className="card-avaliacao-frete">
                        Frete #{avaliacao.frete_id}
                    </span>
                </div>
                <div className="card-avaliacao-nota">
                    {renderEstrelas(avaliacao.nota_geral)}
                    <span className="card-avaliacao-nota-valor">
                        {avaliacao.nota_geral.toFixed(1)}
                    </span>
                </div>
            </div>

            <div className="card-avaliacao-detalhes">
                <div className="card-avaliacao-detalhe-item">
                    <span className="card-avaliacao-detalhe-label">Pontualidade</span>
                    <div className="card-avaliacao-detalhe-estrelas">
                        {renderEstrelas(avaliacao.nota_pontualidade)}
                    </div>
                </div>
                <div className="card-avaliacao-detalhe-item">
                    <span className="card-avaliacao-detalhe-label">Comunicação</span>
                    <div className="card-avaliacao-detalhe-estrelas">
                        {renderEstrelas(avaliacao.nota_comunicacao)}
                    </div>
                </div>
                <div className="card-avaliacao-detalhe-item">
                    <span className="card-avaliacao-detalhe-label">Cuidado com Carga</span>
                    <div className="card-avaliacao-detalhe-estrelas">
                        {renderEstrelas(avaliacao.nota_cuidado_carga)}
                    </div>
                </div>
            </div>

            {avaliacao.comentario && (
                <div className="card-avaliacao-comentario">
                    <p>"{avaliacao.comentario}"</p>
                </div>
            )}

            <div className="card-avaliacao-footer">
                <span className="card-avaliacao-data">
                    {formatarData(avaliacao.data_avaliacao)}
                </span>
            </div>
        </div>
    );
}