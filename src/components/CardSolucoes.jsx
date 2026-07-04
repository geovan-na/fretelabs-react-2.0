export default function CardSolucoes({ titulo, descricao, features }) {
    return (
        <div className="card-solucao">
            <div className="card-solucao-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M16 21V5C16 3.89543 15.1046 3 14 3H10C8.89543 3 8 3.89543 8 5V21" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M12 7h.01M12 11h.01M12 15h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
            </div>
            <h3 className="card-solucao-titulo">{titulo}</h3>
            <p className="card-solucao-descricao">{descricao}</p>
            <ul className="card-solucao-features">
                {features.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
        </div>
    );
}


  