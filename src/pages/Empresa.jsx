// src/pages/Empresas.jsx
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import CardPerguntas from '../components/CardPerguntas';

const beneficiosEmpresas = [
    {
        titulo: 'Seguranca e Confiabilidade',
        descricao: 'Todos os transportadores passam por verificacao documental e analise de historico. Sua carga esta protegida com seguro incluso.',
    },
    {
        titulo: 'Economia Inteligente',
        descricao: 'Receba multiplos lances de transportadores qualificados e escolha a melhor oferta para seu bolso.',
    },
    {
        titulo: 'Agilidade Total',
        descricao: 'Publique um frete em minutos e receba propostas em ate 24 horas. Sua carga sai mais rapido.',
    },
    {
        titulo: 'Rastreamento em Tempo Real',
        descricao: 'Acompanhe sua carga do inicio ao fim com GPS integrado e notificacoes automaticas.',
    },
    {
        titulo: 'Gestao Completa',
        descricao: 'Historico detalhado de todos os seus fretes, relatorios financeiros e indicadores de performance.',
     
    },
    {
        titulo: 'Suporte Especializado',
        descricao: 'Time de suporte disponivel 24/7 para ajudar com qualquer duvida ou problema.',
        
    }
];

const faqEmpresas = [
    {
        pergunta: 'Como publico um frete na plataforma?',
        resposta: 'E simples! Acesse sua conta, va em "Publicar Frete", preencha as informacoes de origem, destino, tipo de carga e prazo. Em minutos, seu frete estara disponivel para centenas de transportadores.'
    },
    {
        pergunta: 'Como sei que os transportadores sao confiaveis?',
        resposta: 'Todos os transportadores passam por verificacao documental, analise de historico e avaliacao de outros embarcadores. Voce tambem pode ver a reputacao e avaliacoes antes de aceitar uma proposta.'
    },
    {
        pergunta: 'Como funciona o pagamento?',
        resposta: 'O pagamento e feito apenas apos a confirmacao da entrega. O valor fica retido em garantia até que voce confirme que a carga chegou em perfeito estado.'
    },
    {
        pergunta: 'Minha carga esta segurada?',
        resposta: 'Sim! Todos os fretes realizados pela plataforma incluem seguro de carga contra danos, roubo e avarias. Voce pode consultar a apolice a qualquer momento.'
    },
    {
        pergunta: 'Posso rastrear minha carga?',
        resposta: 'Sim! Acompanhe sua carga em tempo real com GPS integrado. Voce recebe notificacoes de coleta, checkpoints e entrega.'
    },
    {
        pergunta: 'Qual o custo para usar a plataforma?',
        resposta: 'A plataforma cobra uma comissao apenas sobre fretes realizados com sucesso. Não ha taxas de cadastro ou mensalidades para embarcadores.'
    }
];

export default function Empresas() {
    const navigate = useNavigate();

    // Função para rolar suavemente até a seção de como funciona
    const scrollToComoFunciona = () => {
        const elemento = document.querySelector('.como-funciona-empresa');
        if (elemento) {
            elemento.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="empresas-page">
            {/* HERO */}
            <section className="hero-empresa">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <span className="hero-badge">Para Empresas</span>
                    <h1>
                        A plataforma que conecta sua empresa aos melhores
                        <span>transportadores do Brasil</span>
                    </h1>
                    <p>
                        Pague menos, entregue mais rapido e tenha controle total
                        da sua operacao logistica com seguranca e confiabilidade.
                    </p>
                    <div className="hero-buttons">
                        <Button 
                            variant="primary" 
                            onClick={() => navigate('/cadastro')}
                        >
                            Criar conta
                        </Button>
                        <Button 
                            variant="secondary" 
                            onClick={scrollToComoFunciona}
                        >
                            Ver como funciona
                        </Button>
                    </div>
                    <div className="hero-features">
                        <span>Fretes publicados em minutos</span>
                        <span>Transportadores verificados</span>
                        <span>Rastreamento em tempo real</span>
                        <span>Pagamento seguro</span>
                    </div>
                </div>
            </section>

            {/* COMO FUNCIONA - 3 PASSOS */}
            <section className="como-funciona-empresa">
                <div className="container">
                    <h2 className="section-title">Como funciona para sua empresa</h2>
                    <p className="section-subtitle">
                        Tres passos simples para transformar sua logistica
                    </p>
                    <div className="passos-grid">
                        <div className="passo-card">
                            <span className="passo-numero">01</span>
                            <div className="passo-icone">Publicar</div>
                            <h3 className="passo-titulo">Publique seu frete</h3>
                            <p className="passo-descricao">
                                Descreva sua carga, informe origem, destino e prazo de entrega.
                                Seu frete estara disponivel para transportadores em minutos.
                            </p>
                        </div>
                        <div className="passo-card">
                            <span className="passo-numero">02</span>
                            <div className="passo-icone">Propostas</div>
                            <h3 className="passo-titulo">Receba propostas</h3>
                            <p className="passo-descricao">
                                Transportadores qualificados e verificados enviam seus lances.
                                Compare precos, reputacao e historico antes de escolher.
                            </p>
                        </div>
                        <div className="passo-card">
                            <span className="passo-numero">03</span>
                            <div className="passo-icone">Acompanhar</div>
                            <h3 className="passo-titulo">Acompanhe e pague</h3>
                            <p className="passo-descricao">
                                Rastreie sua carga em tempo real. Pague apenas apos a
                                confirmacao da entrega com total seguranca.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* BENEFICIOS */}
            <section className="beneficios-empresa">
                <div className="container">
                    <h2 className="section-title">Vantagens para sua empresa</h2>
                    <p className="section-subtitle">
                        Por que empresas de todo o Brasil escolhem a FreteLabs
                    </p>
                    <div className="beneficios-grid">
                        {beneficiosEmpresas.map((beneficio, index) => (
                            <div className="card-beneficio" key={index}>
                                <div className="card-beneficio-icon">{beneficio.icone}</div>
                                <h3 className="card-beneficio-titulo">{beneficio.titulo}</h3>
                                <p className="card-beneficio-descricao">{beneficio.descricao}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* DEPOIMENTOS */}
            <section className="depoimentos-empresa">
                <div className="container">
                    <h2 className="section-title">O que dizem nossos clientes</h2>
                    <p className="section-subtitle">
                        Empresas que ja transformaram sua logistica com a FreteLabs
                    </p>
                    <div className="depoimentos-grid">
                        <div className="card-depoimento">
                            <p className="depoimento-texto">
                                "A FreteLabs revolucionou nossa logistica. Em 6 meses,
                                reduzimos custos de frete em 30% e aumentamos a eficiencia
                                das entregas."
                            </p>
                            <div className="depoimento-autor">
                                <strong>Joao Silva</strong>
                                <span>Diretor de Logistica - LogBrasil</span>
                            </div>
                        </div>
                        <div className="card-depoimento">
                            <p className="depoimento-texto">
                                "Publicar fretes era um pesadelo. Agora fazemos em minutos
                                e temos total visibilidade de toda a operacao."
                            </p>
                            <div className="depoimento-autor">
                                <strong>Maria Santos</strong>
                                <span>Gerente de Suprimentos - TechLog</span>
                            </div>
                        </div>
                        <div className="card-depoimento">
                            <p className="depoimento-texto">
                                "O rastreamento em tempo real mudou nossa relacao com os
                                clientes. Sabemos exatamente onde cada carga esta."
                            </p>
                            <div className="depoimento-autor">
                                <strong>Carlos Oliveira</strong>
                                <span>CEO - FastDelivery</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="faq-section">
                <div className="faq-container">
                    <h2 className="faq-titulo">Perguntas Frequentes - Empresas</h2>
                    <p className="faq-subtitulo">
                        Tire suas duvidas sobre como publicar fretes na plataforma
                    </p>
                    <div className="faq-grid">
                        {faqEmpresas.map((item, index) => (
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
            <section className="cta-empresa">
                <div className="cta-content">
                    <h2>Pronto para publicar seu primeiro frete?</h2>
                    <p>
                        Junte-se a milhares de empresas que ja otimizaram sua logistica
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