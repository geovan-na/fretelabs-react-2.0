import CardSolucoes from '../components/CardSolucoes';
import CardPerguntas from '../components/CardPerguntas';
import SaibaMais from '../components/SaibaMais';

export default function Solucoes() {
    const solucoes = [
        {
            titulo: "Marketplace de Fretes",
            descricao: "Conectamos cargas aos melhores motoristas disponíveis em tempo real.",
            features: [
                "Busca inteligente por região",
                "Comparação de preços",
                "Match automático",
                "Negociação direta"
            ]
        },
        {
            titulo: "Rastreamento em Tempo Real",
            descricao: "Acompanhe suas cargas do início ao fim com atualizações em tempo real.",
            features: [
                "GPS integrado",
                "Alertas de atraso",
                "Histórico de rotas",
                "Checkpoints automáticos"
            ]
        },
        {
            titulo: "Gestão de Documentos",
            descricao: "Centralize e gerencie todos os documentos da sua operação em um só lugar.",
            features: [
                "Armazenamento em nuvem",
                "Validação automática",
                "Alertas de vencimento",
                "Compartilhamento seguro"
            ]
        },
        {
            titulo: "Compliance e Seguros",
            descricao: "Segurança total para sua operação com verificação rigorosa e seguros inclusos.",
            features: [
                "Verificação de motoristas",
                "Seguro de carga incluso",
                "Análise de risco",
                "Certificação digital"
            ]
        },
        {
            titulo: "Pagamentos e Antecipação",
            descricao: "Receba seus pagamentos de forma rápida e segura, com opção de antecipação.",
            features: [
                "Pagamento em até 48h",
                "Antecipação de recebíveis",
                "Extrato detalhado",
                "Múltiplas formas de saque"
            ]
        },
        {
            titulo: "Relatórios e Analytics",
            descricao: "Acompanhe métricas e gere relatórios detalhados da sua operação.",
            features: [
                "Dashboard personalizado",
                "Relatórios em PDF/Excel",
                "KPIs em tempo real",
                "Análise de performance"
            ]
        }
    ];

    const perguntasFrequentes = [
        {
            pergunta: "Como funciona o marketplace de fretes?",
            resposta: "Nossa plataforma conecta embarcadores que precisam transportar cargas com transportadores que possuem veículos disponíveis. Você publica o frete, recebe propostas e escolhe a melhor opção."
        },
        {
            pergunta: "Qual a segurança do pagamento?",
            resposta: "Todo pagamento é garantido pela plataforma. O valor fica retido em conta garantida até a confirmação da entrega, e então é liberado para o transportador em até 48h."
        },
        {
            pergunta: "Como é feita a verificação dos motoristas?",
            resposta: "Realizamos verificação completa de documentos (CNH, CPF, CNPJ), antecedentes e análise de perfil para garantir a segurança da operação."
        },
        {
            pergunta: "O seguro de carga está incluso?",
            resposta: "Sim! Todos os fretes realizados pela plataforma incluem seguro de carga automático, cobrindo roubo, avaria e acidentes durante o transporte."
        },
        {
            pergunta: "Posso antecipar meus pagamentos?",
            resposta: "Sim! Oferecemos antecipação de recebíveis com taxas competitivas. Você recebe o valor do frete em até 24h após a confirmação da entrega."
        },
        {
            pergunta: "Como funciona o suporte?",
            resposta: "Oferecemos suporte dedicado 24 horas por dia, 7 dias por semana, para emergências e dúvidas operacionais."
        }
    ];

    return (
        <>
            <section className="solucoes-hero">
                <div className="solucoes-hero-container">
                    <div className="solucoes-hero-badge">Nossas Soluções</div>
                    <h1 className="solucoes-hero-title">
                        Soluções completas para <span>sua operação logística</span>
                    </h1>
                    <p className="solucoes-hero-description">
                        Tecnologia de ponta conectando embarcadores e motoristas em uma plataforma única, segura e eficiente.
                    </p>
                </div>
            </section>

            <section className="solucoes-section">
                <div className="solucoes-container">
                    <div className="solucoes-header">
                        <h2 className="solucoes-titulo">Nossos Serviços</h2>
                        <p className="solucoes-subtitulo">
                            Soluções logísticas completas para todos os perfis de negócio
                        </p>
                    </div>

                    <div className="solucoes-grid">
                        {solucoes.map((solucao, index) => (
                            <CardSolucoes
                                key={index}
                                titulo={solucao.titulo}
                                descricao={solucao.descricao}
                                features={solucao.features}
                            />
                        ))}
                    </div>
                </div>
            </section>

            <section className="faq-section">
                <div className="faq-container">
                    <div className="faq-header">
                        <h2 className="faq-titulo">Perguntas Frequentes</h2>
                        <p className="faq-subtitulo">
                            Tire suas dúvidas sobre nossa plataforma e serviços
                        </p>
                    </div>

                    <div className="faq-grid">
                        {perguntasFrequentes.map((item, index) => (
                            <CardPerguntas
                                key={index}
                                pergunta={item.pergunta}
                                resposta={item.resposta}
                            />
                        ))}
                    </div>
                </div>
            </section>

            <SaibaMais />
        </>
    );
}