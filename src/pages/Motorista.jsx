// src/pages/Motoristas.jsx
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import CardPerguntas from '../components/CardPerguntas';

const beneficiosMotoristas = [
    {
        titulo: 'Mais Oportunidades',
        descricao: 'Acesso a centenas de fretes de todo o Brasil. Nunca mais fique sem carga para transportar.',
        
    },
    {
        titulo: 'Pagamento Garantido',
        descricao: 'Receba em ate 48h apos a entrega. O valor fica retido em garantia ate a confirmacao.',
        
    },
    {
        titulo: 'Seguranca Total',
        descricao: 'Fretes verificados e com seguro de carga incluso. Trabalhe com tranquilidade.',
    },
    {
        titulo: 'Sem Taxas Abusivas',
        descricao: 'Comissao justa e transparente. Nada de taxas escondidas ou surpresas no fim do mes.',
    },
    {
        titulo: 'Sem Viagem Vazia',
        descricao: 'Encontre fretes para qualquer regiao. Nunca mais volte com o caminhao vazio.',
    },
    {
        titulo: 'Suporte 24/7',
        descricao: 'Time especializado sempre disponivel para ajudar com qualquer duvida ou problema.',
    }
];

const faqMotoristas = [
    {
        pergunta: 'Como me cadastro como transportador?',
        resposta: 'Crie sua conta gratuita, informe seus dados pessoais, documentos do veiculo e CNH. Apos a verificacao, voce ja pode comecar a buscar fretes.'
    },
    {
        pergunta: 'Como encontro fretes para transportar?',
        resposta: 'Voce recebe notificacoes de fretes disponiveis na sua regiao. Filtre por tipo de carga, distancia e valor. Envie seus lances e negocie diretamente com os embarcadores.'
    },
    {
        pergunta: 'Quando recebo pelo frete?',
        resposta: 'O pagamento e liberado em ate 48h apos a confirmacao da entrega pelo embarcador. Voce pode acompanhar o status do pagamento no seu painel financeiro.'
    },
    {
        pergunta: 'Preciso ter um veiculo proprio?',
        resposta: 'Nao necessariamente. Voce pode se cadastrar como motorista vinculado a uma frota ou como autonomo com veiculo proprio. A plataforma atende todos os perfis.'
    },
    {
        pergunta: 'Como funciona o sistema de lances?',
        resposta: 'Voce ve o valor ofertado pelo embarcador e pode enviar sua proposta. O embarcador escolhe a melhor oferta considerando preco, reputacao e historico.'
    },
    {
        pergunta: 'O que acontece se a carga for danificada?',
        resposta: 'Todos os fretes incluem seguro de carga. Em caso de avaria, o processo e acionado automaticamente e voce recebe orientacao do nosso time de suporte.'
    }
];

export default function Motoristas() {
    const navigate = useNavigate();

    // Função para rolar suavemente até a seção de como funciona
    const scrollToComoFunciona = () => {
        const elemento = document.querySelector('.como-funciona-motorista');
        if (elemento) {
            elemento.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="motoristas-page">
            {/* HERO */}
            <section className="hero-motorista">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <span className="hero-badge">Para Motoristas e Frotas</span>
                    <h1>
                        Encontre fretes, ganhe mais e
                        <span>viaje com seguranca</span>
                    </h1>
                    <p>
                        Conectamos voce aos melhores fretes do Brasil.
                        Trabalhe com liberdade, seguranca e pagamento garantido.
                    </p>
                    <div className="hero-buttons">

                        <button 
                            className="btn-primary" 
                            onClick={() => navigate('/cadastro')}
                        >
                            Criar conta
                        </button>
                    <button 
                        className="btn-secondary" 
                        onClick={scrollToComoFunciona}
                    >
                        Ver como funciona
                    </button>
                    </div>
                    <div className="hero-features">
                        <span>Fretes na sua regiao</span>
                        <span>Pagamento em ate 48h</span>
                        <span>Sem viagem vazia</span>
                        <span>Seguro de carga incluso</span>
                    </div>
                </div>
            </section>

            {/* COMO FUNCIONA - 3 PASSOS */}
            <section className="como-funciona-motorista">
                <div className="container">
                    <h2 className="section-title">Como funciona para transportadores</h2>
                    <p className="section-subtitle">
                        Tres passos simples para comecar a ganhar mais
                    </p>
                    <div className="passos-grid">
                        <div className="passo-card">
                            <span className="passo-numero">01</span>
                            <div className="passo-icone">Cadastro</div>
                            <h3 className="passo-titulo">Cadastre seu veiculo</h3>
                            <p className="passo-descricao">
                                Informe os dados do seu veiculo, capacidade e localizacao.
                                Quanto mais completo seu perfil, mais oportunidades voce recebe.
                            </p>
                        </div>
                        <div className="passo-card">
                            <span className="passo-numero">02</span>
                            <div className="passo-icone">Busca</div>
                            <h3 className="passo-titulo">Encontre fretes</h3>
                            <p className="passo-descricao">
                                Receba notificacoes de fretes disponiveis na sua regiao.
                                Filtre por tipo de carga, distancia e valor.
                            </p>
                        </div>
                        <div className="passo-card">
                            <span className="passo-numero">03</span>
                            <div className="passo-icone">Lances</div>
                            <h3 className="passo-titulo">Facas lances e ganhe</h3>
                            <p className="passo-descricao">
                                Envie suas propostas para os fretes que te interessam.
                                O embarcador escolhe a melhor oferta e voce comeca a transportar.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* BENEFICIOS */}
            <section className="beneficios-motorista">
                <div className="container">
                    <h2 className="section-title">Vantagens para transportadores</h2>
                    <p className="section-subtitle">
                        Por que motoristas de todo o Brasil escolhem a FreteLabs
                    </p>
                    <div className="beneficios-grid">
                        {beneficiosMotoristas.map((beneficio, index) => (
                            <div className="card-beneficio" key={index}>
                                <div className="card-beneficio-icon">{beneficio.icone}</div>
                                <h3 className="card-beneficio-titulo">{beneficio.titulo}</h3>
                                <p className="card-beneficio-descricao">{beneficio.descricao}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* TIPOS DE TRANSPORTADORES */}
            <section className="tipos-transportadores">
                <div className="container">
                    <h2 className="section-title">Quem pode participar</h2>
                    <p className="section-subtitle">
                        A FreteLabs atende todos os perfis de transportadores
                    </p>
                    <div className="tipos-grid">
                        <div className="card-tipo">
                            <div className="card-tipo-icon">Autonomo</div>
                            <h3>Autonomo</h3>
                            <p>Motorista com caminhao proprio que busca fretes para transportar.</p>
                        </div>
                        <div className="card-tipo">
                            <div className="card-tipo-icon">Frota</div>
                            <h3>Frota</h3>
                            <p>Empresa com multiplos veiculos que quer otimizar sua operacao.</p>
                        </div>
                        <div className="card-tipo">
                            <div className="card-tipo-icon">Vinculado</div>
                            <h3>Motorista Vinculado</h3>
                            <p>Motorista contratado por uma frota que tambem pode buscar fretes.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* DEPOIMENTOS */}
            <section className="depoimentos-motorista">
                <div className="container">
                    <h2 className="section-title">O que dizem nossos motoristas</h2>
                    <p className="section-subtitle">
                        Transportadores que ja transformaram sua vida com a FreteLabs
                    </p>
                    <div className="depoimentos-grid">
                        <div className="card-depoimento">
                            <p className="depoimento-texto">
                                "A FreteLabs mudou minha vida. Hoje tenho fretes todos os dias
                                e nunca mais volto vazio. Pagamento rapido e seguro."
                            </p>
                            <div className="depoimento-autor">
                                <strong>Jose Carlos</strong>
                                <span>Motorista Autonomo - SP</span>
                            </div>
                        </div>
                        <div className="card-depoimento">
                            <p className="depoimento-texto">
                                "Minha frota de 5 caminhoes esta sempre rodando. A FreteLabs
                                me ajuda a encontrar fretes para todas as regioes."
                            </p>
                            <div className="depoimento-autor">
                                <strong>Ana Paula</strong>
                                <span>Gestora de Frota - MG</span>
                            </div>
                        </div>
                        <div className="card-depoimento">
                            <p className="depoimento-texto">
                                "O suporte e excelente. Sempre que tenho duvida, eles
                                respondem rapido. Recomendo a todos os motoristas."
                            </p>
                            <div className="depoimento-autor">
                                <strong>Roberto Santos</strong>
                                <span>Motorista Vinculado - RJ</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="faq-section">
                <div className="faq-container">
                    <h2 className="faq-titulo">Perguntas Frequentes - Motoristas</h2>
                    <p className="faq-subtitulo">
                        Tire suas duvidas sobre como encontrar fretes na plataforma
                    </p>
                    <div className="faq-grid">
                        {faqMotoristas.map((item, index) => (
                            <CardPerguntas
                                key={index}
                                pergunta={item.pergunta}
                                resposta={item.resposta}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* CALL TO ACTION */}
            <section className="cta-motorista">
                <div className="cta-content">
                    <h2>Pronto para comecar a transportar?</h2>
                    <p>
                        Junte-se a milhares de transportadores que ja estao lucrando mais
                        com a FreteLabs.
                    </p>
                    <Button 
                        variant="primary" 
                        onClick={() => navigate('/cadastro')}
                    >
                        Criar conta gratuita
                    </Button>
                </div>
            </section>
        </div>
    );
}