export default function Card({ 

    titulo,           
    tipo,             
    itens,            
    linkTexto,       
    linkUrl,          
           
})
 {
    return (
        <div className={`card card-${tipo}`}>
            <h2 className={`card-title card-title-${tipo}`}>
                {titulo}
            </h2>
            
            <div className="card-itens">
                {itens.map((item, index) => (
                    <div key={index} className="card-item">
                        <h3>{item.subtitulo}</h3>
                        <p>{item.descricao}</p>
                    </div>
                ))}
            </div>
            
            <div className="card-footer">
                <a href={linkUrl} className="card-link">
                    {linkTexto} →
                </a>
            </div>
        </div>
    );
}
