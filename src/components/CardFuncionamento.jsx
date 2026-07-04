// components/ComoFunciona.jsx
 export default function ComoFunciona() {
    const passos = [
        {
            numero: "01",
            titulo: "Empresas publicam cargas",
            descricao: "Embarcadores cadastram suas cargas e fretes em nossa plataforma com todas as informações necessárias.",
            
        },
        {
            numero: "02",
            titulo: "Motoristas encontram fretes",
            descricao: "Transportadores buscam fretes compatíveis com seus veículos e perfil de atuação.",
           
        },
        {
            numero: "03",
            titulo: "Negociação direta",
            descricao: "Embarcadores e transportadores negociam diretamente, sem intermediários, com total transparência.",
            
        }
    ];

    return (
        <section className="como-funciona">
            <div className="como-funciona-container">
                <h2 className="como-funciona-title">
                    Como a <span>FreteLabs</span> funciona?
                </h2>
                <p className="como-funciona-subtitle">
                    Facilitamos a oferta e busca por cargas e fretes em todo o Brasil, 
                    atendendo frotistas e caminhoneiros autônomos.
                </p>

                <div className="passos-grid">
                    {passos.map((passo, index) => (
                        <div key={index} className="passo-card">
                            <div className="passo-numero">{passo.numero}</div>
                            <div className="passo-icone">{passo.icone}</div>
                            <h3 className="passo-titulo">{passo.titulo}</h3>
                            <p className="passo-descricao">{passo.descricao}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
