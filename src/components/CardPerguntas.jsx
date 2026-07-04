import { useState } from 'react';

export default function CardPerguntas({ pergunta, resposta }) {
    const [aberta, setAberta] = useState(false);

    const togglePergunta = () => {
        setAberta(!aberta);
    };

    return (
        <div className={`card-pergunta ${aberta ? 'aberta' : ''}`}>
            <div className="pergunta-header" onClick={togglePergunta}>
                <h4 className="pergunta-titulo">{pergunta}</h4>
                <span className="pergunta-icone">{aberta ? '−' : '+'}</span>
            </div>
            {aberta && (
                <div className="pergunta-resposta">
                    <p>{resposta}</p>
                </div>
            )}
        </div>
    );
}

