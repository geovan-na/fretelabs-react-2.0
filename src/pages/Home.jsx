import { useNavigate } from 'react-router-dom';
import Button from "../components/Button";
import Card from "../components/Card";
import CardFuncionamento from "../components/CardFuncionamento";
import SaibaMais from "../components/SaibaMais";

export default function Home() {
    const navigate = useNavigate();

    const empresasItens = [
        {
            subtitulo: "Compliance & Segurança",
            descricao: "Gestão rigorosa de motoristas e frotas para garantir zero risco em sua operação."
        },
        {
            subtitulo: "Escalabilidade",
            descricao: "Encontre centenas de veículos disponíveis em minutos para qualquer região do país."
        }
    ];

    const motoristasItens = [
        {
            subtitulo: "Fluxo Contínuo",
            descricao: "Acabe com as viagens de retorno vazias. Fretes inteligentes direto no seu celular."
        },
        {
            subtitulo: "Liquidez Imediata",
            descricao: "Sistemas de pagamento rápido para você focar apenas no asfalto e no seu lucro."
        }
    ];

    const irParaCadastro = () => {
        navigate('/cadastro');
    };

    const irParaSolucoes = () => {
        navigate('/solucoes');
    };

    return (
        <>
            <section className="hero">
                <div className="hero-container">
                    <div className="hero-badge">Plataforma de Logística</div>
                    <h1 className="hero-title">
                        Sua plataforma de<br />
                        <span>logística inteligente</span>
                    </h1>
                    <p className="hero-description">
                        A elite do transporte de carga conectada em uma única plataforma de alta performance.
                    </p>
                    <div className="hero-buttons">
                        <Button variant="primary" onClick={irParaCadastro}>
                            CRIAR CONTA GRATUITA
                        </Button>
                        <Button variant="secondary" onClick={irParaSolucoes}>
                            CONHECER SOLUÇÕES
                        </Button>
                    </div>
                </div>
            </section>

            <section className="stats-section">
                <div className="stats-container">
                    <div className="stat-item">
                        <h3>5.000+</h3>
                        <p>Motoristas Cadastrados</p>
                    </div>
                    <div className="stat-item">
                        <h3>10.000+</h3>
                        <p>Fretes Realizados</p>
                    </div>
                    <div className="stat-item">
                        <h3>98%</h3>
                        <p>Satisfação dos Clientes</p>
                    </div>
                </div>
            </section>

            <section className="benefits-section">
                <div className="benefits-container">
                    <h2 className="section-title">Soluções completas para <span>sua operação</span></h2>
                    <p className="section-subtitle">Tecnologia de ponta conectando embarcadores e transportadores</p>
                    
                    <div className="benefits-grid">
                        <Card
                            titulo="Para Empresas"
                            tipo="empresas"
                            itens={empresasItens}
                            linkTexto="Área do Embarcador"
                            linkUrl="/cadastro?tipo=empresa"
                        />

                        <Card
                            titulo="Para Motoristas"
                            tipo="motoristas"
                            itens={motoristasItens}
                            linkTexto="Área do Transportador"
                            linkUrl="/cadastro?tipo=motorista"
                        />
                    </div>
                </div>
            </section>

            <CardFuncionamento />
            <SaibaMais />
        </>
    );
}