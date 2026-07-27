# 📋 Documentação do Projeto FreteLabs

## 📌 Índice
1. [Visão Geral](#visão-geral)
2. [Objetivos do Projeto](#objetivos-do-projeto)
3. [Arquitetura do Sistema](#arquitetura-do-sistema)
4. [Tipos de Usuários](#tipos-de-usuários)
5. [Funcionalidades por Tipo de Usuário](#funcionalidades-por-tipo-de-usuário)
6. [Funcionalidades Gerais](#funcionalidades-gerais)
7. [Fluxos Principais](#fluxos-principais)
8. [Entidades do Sistema](#entidades-do-sistema)
9. [Tecnologias Utilizadas](#tecnologias-utilizadas)
10. [Estrutura do Projeto](#estrutura-do-projeto)

---

## 1. Visão Geral

**FreteLabs** é uma plataforma digital completa de **logística inteligente** que conecta **embarcadores** (empresas que precisam transportar cargas) com **transportadores** (frotas, motoristas autônomos e motoristas vinculados). A plataforma funciona como um **marketplace de fretes**, onde embarcadores publicam suas necessidades de transporte e transportadores se candidatam para realizá-los.

O sistema oferece gestão completa de:
- Publicação e busca de fretes
- Candidaturas e propostas
- Contratos de trabalho (para motoristas vinculados)
- Pagamentos e finanças
- Avaliações e reputação
- Rastreamento e ocorrências
- Veículos e motoristas
- Documentação e endereços

---

## 2. Objetivos do Projeto

### Objetivo Principal
Criar um ecossistema logístico digital que otimize a conexão entre quem precisa transportar cargas (embarcadores) e quem pode realizá-lo (transportadores), reduzindo custos operacionais, aumentando a eficiência e proporcionando segurança e transparência nas operações.

### Objetivos Específicos
1. **Conectar oferta e demanda** de fretes de forma eficiente
2. **Digitalizar** todo o processo logístico, do agendamento ao pagamento
3. **Reduzir viagens de retorno vazias** para motoristas autônomos
4. **Oferecer compliance e segurança** para embarcadores
5. **Facilitar a gestão de frotas** para empresas transportadoras
6. **Proporcionar liquidez imediata** com sistema de pagamentos rápido
7. **Criar um sistema de reputação** baseado em avaliações
8. **Permitir a gestão de contratos** entre frotas e motoristas vinculados

---

## 3. Arquitetura do Sistema

### Frontend (React + Vite)
- **React 18** com **React Router DOM v6** para navegação
- **Vite** como bundler para desenvolvimento rápido
- Context API para gerenciamento de estado (autenticação)
- CSS Global para estilização

### Backend (Node.js + Express)
- **Express 5** como framework HTTP
- **MySQL2** para conexão com banco de dados MySQL
- **JWT** (JSON Web Token) para autenticação
- **Bcryptjs** para criptografia de senhas
- **Multer** para upload de arquivos
- **Dotenv** para variáveis de ambiente

### Banco de Dados
- **MySQL** rodando na porta 3307
- Estrutura de tabelas relacionais com `pessoas`, `embarcadores`, `transportadores`, `motoristas_vinculados`, `fretes`, `veiculos`, `candidaturas`, `contratos`, `propostas`, `avaliacoes`, `pagamentos`, etc.

### API
- URL base: `http://localhost:3000/api`
- Rotas protegidas por token JWT
- Middleware de autenticação, upload e validação

---

## 4. Tipos de Usuários

O sistema possui **5 tipos de usuários** definidos em `src/utils/roles.js`:

| Papel (Role)        | Descrição                                                                 |
|---------------------|---------------------------------------------------------------------------|
| **Embarcador**      | Empresa ou pessoa que precisa transportar cargas. Publica fretes.         |
| **Frota**           | Empresa transportadora que possui veículos e/ou motoristas contratados.   |
| **Autonomo**        | Motorista autônomo com veículo próprio que busca fretes.                  |
| **Vinculado**       | Motorista contratado por uma frota, com vínculo empregatício/contrato.    |
| **Admin**           | Administrador do sistema com acesso total à plataforma.                   |

### Hierarquia de Permissões
```
Admin (5) > Embarcador (4) > Frota (3) > Autonomo (2) > Vinculado (1)
```

---

## 5. Funcionalidades por Tipo de Usuário

### 👤 Embarcador
*Usuário que precisa transportar cargas (indústrias, comércios, etc.)*

#### 📌 **O que pode fazer:**

| Funcionalidade              | Descrição                                                                 |
|-----------------------------|---------------------------------------------------------------------------|
| **Publicar Fretes**         | Criar fretes informando origem, destino, tipo de carga, peso, valor, prazos |
| **Gerenciar Fretes**        | Listar, editar, cancelar e acompanhar status dos fretes publicados        |
| **Visualizar Candidaturas** | Ver quem se candidatou aos seus fretes com valores e mensagens            |
| **Aceitar/Recusar**         | Aceitar ou recusar candidaturas de transportadores                        |
| **Painel Financeiro**       | Acompanhar gastos, transações e extrato financeiro                        |
| **Avaliar Transportadores** | Avaliar transportadores após conclusão do frete                           |
| **Perfil e Configurações**  | Gerenciar dados cadastrais, endereços e documentos                        |
| **Dashboard**               | Visão geral com estatísticas, fretes recentes e candidaturas pendentes    |

#### 📊 **Dashboard do Embarcador:**
- Total de fretes, em andamento, aguardando, concluídos, cancelados
- Faturamento total (gastos com fretes)
- Gráfico de fretes por mês
- Candidaturas pendentes
- Atividades recentes

---

### 🚛 Frota
*Empresa transportadora que possui veículos e motoristas*

#### 📌 **O que pode fazer:**

| Funcionalidade                   | Descrição                                                                 |
|----------------------------------|---------------------------------------------------------------------------|
| **Buscar Fretes Disponíveis**    | Encontrar fretes publicados por embarcadores com filtros                  |
| **Candidatar-se a Fretes**       | Enviar candidatura com valor do lance para fretes disponíveis             |
| **Gerenciar Veículos**           | Cadastrar, editar e gerenciar veículos da frota                           |
| **Gerenciar Motoristas**         | Listar motoristas vinculados, disponíveis, contratar, desligar            |
| **Enviar Propostas**             | Enviar proposta de contrato para motoristas disponíveis                   |
| **Receber Propostas**            | Receber propostas de motoristas que desejam se vincular                   |
| **Designar Veículos**            | Atribuir veículos aos motoristas vinculados                               |
| **Criar Contratos**              | Formalizar contratos de trabalho com motoristas vinculados                |
| **Gerenciar Pagamentos**         | Criar, listar, pagar e cancelar pagamentos dos motoristas                 |
| **Painel Financeiro**            | Acompanhar receitas, saldo, transações e solicitar saques                 |
| **Avaliar Embarcadores**         | Avaliar embarcadores após conclusão do frete                              |
| **Listar Fretes Aceitos**        | Visualizar fretes em andamento, concluídos e aceitos                      |
| **Perfil e Configurações**       | Gerenciar dados cadastrais, documentos e configurações                    |

#### 📊 **Dashboard da Frota:**
- Total de veículos, veículos ativos, em manutenção
- Total de motoristas e motoristas ativos
- Fretes aceitos, em trânsito, concluídos
- Faturamento total
- Gráfico de fretes e faturamento por mês
- Alertas (veículos em manutenção, seguros vencendo)

---

### 👨‍🔧 Autônomo (Motorista Autônomo)
*Motorista com veículo próprio que busca fretes*

#### 📌 **O que pode fazer:**

| Funcionalidade                    | Descrição                                                                 |
|-----------------------------------|---------------------------------------------------------------------------|
| **Buscar Fretes Disponíveis**     | Encontrar fretes publicados por embarcadores com filtros                  |
| **Candidatar-se a Fretes**        | Enviar candidatura com valor do lance                                     |
| **Gerenciar Veículo**             | Cadastrar e gerenciar seu veículo                                         |
| **Listar Fretes Aceitos**         | Visualizar fretes aceitos, em andamento e concluídos                      |
| **Painel Financeiro**             | Acompanhar receitas, saldo, transações e solicitar saques                 |
| **Avaliar Embarcadores**          | Avaliar embarcadores após conclusão do frete                              |
| **Perfil e Configurações**        | Gerenciar dados cadastrais, CNH, documentos e configurações               |

#### 📊 **Dashboard do Autônomo:**
- Informações do veículo (placa, modelo, status)
- Fretes totais, aceitos, em trânsito, concluídos
- Receita total
- Candidaturas pendentes
- Taxa de aceite
- Gráfico de receita por mês

---

### 🔗 Vinculado (Motorista Vinculado a Frota)
*Motorista contratado por uma empresa de transporte (frota)*

#### 📌 **O que pode fazer:**

| Funcionalidade                    | Descrição                                                                 |
|-----------------------------------|---------------------------------------------------------------------------|
| **Visualizar Fretes**             | Ver fretes designados pela frota para ele realizar                        |
| **Atualizar Status do Frete**     | Alterar status do frete (Aceito → Em Trânsito → Concluído)                |
| **Registrar Ocorrências**         | Reportar problemas durante o transporte                                   |
| **Painel Financeiro**             | Visualizar pagamentos recebidos e pendentes                               |
| **Avaliar Embarcadores**          | Avaliar embarcadores após conclusão                                       |
| **Visualizar Contrato**           | Ver detalhes do contrato com a frota                                      |
| **Perfil e Configurações**        | Gerenciar dados pessoais e preferências                                   |

#### 📊 **Dashboard do Vinculado:**
- Total de fretes, aceitos, em andamento, concluídos
- Total recebido
- Status do vínculo (ativo/desligado)
- Data de admissão
- Avaliação média
- Próximos fretes
- Histórico de entregas

---

### 🛡️ Admin (Administrador)
*Administrador do sistema com acesso completo*

#### 📌 **O que pode fazer:**

| Funcionalidade                   | Descrição                                                                 |
|----------------------------------|---------------------------------------------------------------------------|
| **Gestão de Usuários**           | Listar, editar, bloquear/desbloquear usuários de todos os tipos           |
| **Gestão de Fretes**             | Visualizar e gerenciar todos os fretes da plataforma                      |
| **Gestão de Veículos**           | Visualizar todos os veículos cadastrados                                  |
| **Gestão de Motoristas**         | Visualizar motoristas vinculados e disponíveis                           |
| **Aprovação de Documentos**      | Verificar e aprovar documentos de usuários                                |
| **Blacklist**                    | Gerenciar lista de usuários bloqueados                                    |
| **Relatórios**                   | Acessar relatórios gerenciais                                             |
| **Dashboard Global**             | Visão geral da plataforma com métricas gerais                             |

#### 📊 **Dashboard do Admin:**
- Total de usuários, pendentes, aprovados, bloqueados
- Total de fretes, em trânsito, concluídos, cancelados
- Faturamento global
- Total de veículos, veículos ativos
- Taxa de ocupação
- Gráfico de usuários e fretes por mês
- Alertas (documentos pendentes, blacklist, taxa de cancelamento)

---

## 6. Funcionalidades Gerais (Comuns a Todos)

### 🔐 Autenticação e Cadastro
- Cadastro com dados pessoais e tipo de usuário
- Login com email e senha
- Recuperação de senha
- Suporte a CPF e CNPJ (pessoa física e jurídica)

### 📄 Gestão de Documentos
- Upload de documentos (CNH, documentos do veículo, etc.)
- Listagem de documentos por pessoa
- Status de verificação documental

### 📍 Endereços
- Cadastro de múltiplos endereços
- Endereço principal
- Tipos de endereço (cobrança, entrega, etc.)

### 🔔 Notificações
- Listagem de notificações
- Marcar como lida
- Marcar todas como lidas
- Tipos: informação, alerta, sucesso

### ⭐ Avaliações
- Sistema de avaliação com notas (geral, pontualidade, comunicação, cuidado com carga)
- Avaliação mútua (embarcador ↔ transportador)
- Cálculo de média de avaliações
- Histórico de avaliações recebidas e enviadas

### ⚠️ Ocorrências
- Registro de ocorrências durante o frete
- Tipos e gravidades
- Resolução de ocorrências
- Georreferenciamento (latitude/longitude)

### 💰 Financeiro
- Resumo financeiro (total, transações, média)
- Transações por período (mês, trimestre, ano)
- Extrato completo
- Saldo disponível e a receber
- Solicitação de saque
- Dados bancários

---

## 7. Fluxos Principais

### Fluxo 1: Embarcador Publica Frete → Transportador se Candidata

```
Embarcador                       Plataforma                    Transportador
    |                                |                              |
    |-- Publica Frete ------------->|                              |
    |   (origem, destino, carga,    |                              |
    |    valor, prazos)             |                              |
    |                                |                              |
    |                                |-- Frete fica disponível --->|
    |                                |                              |
    |                                |<--- Se candidata -----------|
    |                                |    (valor do lance,         |
    |                                |     mensagem)               |
    |                                |                              |
    |<-- Vê candidaturas -----------|                              |
    |                                |                              |
    |-- Aceita candidatura -------->|                              |
    |                                |                              |
    |                                |-- Frete marcado como ACEITO |
    |                                |                              |
```

### Fluxo 2: Frota Contrata Motorista Vinculado

```
Frota                             Plataforma                 Motorista Vinculado
  |                                    |                            |
  |-- Busca motoristas disponíveis --> |                            |
  |                                    |                            |
  |-- Envia proposta de contrato ----> |                            |
  |   (salário, comissão, benefícios)  |                            |
  |                                    |-- Proposta enviada ------>|
  |                                    |                            |
  |                                    |<--- Aceita/Contraprop. ---|
  |<-- Recebe contraproposta ---------|                            |
  |                                    |                            |
  |-- Aceita contraproposta --------->|                            |
  |                                    |                            |
  |-- Cria contrato ----------------->|                            |
  |                                    |                            |
  |-- Assina contrato --------------->|                            |
  |                                    |<-- Assina contrato -------|
  |                                    |                            |
  |-- Designa veículo para motorista->|                            |
  |                                    |                            |
  |-- Cria pagamentos --------------->|                            |
  |                                    |-- Gera pagamento ------>|
```

### Fluxo 3: Ciclo de Vida do Frete

```
AGUARDANDO → NEGOCIACAO → ACEITO → TRANSITO → CONCLUIDO
    ↓            ↓                                    ↑
    └──── CANCELADO ←─────────────────────────────────┘
```

---

## 8. Entidades do Sistema (Modelos de Dados)

### Principais Tabelas

| Tabela                   | Descrição                                       |
|--------------------------|-------------------------------------------------|
| `pessoas`                | Cadastro base de todos os usuários              |
| `embarcadores`           | Perfis de embarcadores (empresas que contratam) |
| `transportadores`        | Perfis de transportadores (frota/autônomo)      |
| `motoristas_vinculados`  | Motoristas contratados por frotas               |
| `fretes`                 | Cargas a serem transportadas                    |
| `veiculos`               | Veículos cadastrados pelos transportadores      |
| `candidaturas`           | Candidaturas de transportadores para fretes     |
| `propostas`              | Propostas de contrato entre frota e motorista   |
| `contratos`              | Contratos formais entre frota e motorista       |
| `pagamentos_motoristas`  | Pagamentos de frotas para motoristas vinculados |
| `avaliacoes`             | Avaliações entre usuários                       |
| `ocorrencias`            | Ocorrências durante o transporte                |
| `notificacoes`           | Notificações do sistema                         |
| `documentos`             | Upload de documentos                            |
| `enderecos`              | Endereços dos usuários                          |
| `dados_bancarios`        | Dados bancários para pagamentos                 |
| `transacoes_financeiras` | Transações financeiras e saques                 |

### Status dos Fretes (Enum)
- `AGUARDANDO` - Frete publicado, aguardando candidaturas
- `NEGOCIACAO` - Em negociação com transportadores
- `ACEITO` - Candidatura aceita, transportador designado
- `TRANSITO` - Carga em trânsito (coleta realizada)
- `CONCLUIDO` - Entrega realizada com sucesso
- `CANCELADO` - Frete cancelado

### Status das Candidaturas
- `PENDENTE` - Candidatura enviada, aguardando resposta
- `ACEITO` - Candidatura aceita pelo embarcador
- `RECUSADO` - Candidatura recusada
- `CANCELADO` - Candidatura cancelada pelo transportador

### Status dos Contratos
- `EM_EXPERIENCIA` - Período de experiência
- `ATIVO` - Contrato ativo
- `RENOVADO` - Contrato renovado
- `ENCERRADO` - Contrato encerrado

### Status das Propostas
- `PENDENTE` - Proposta enviada
- `MODIFICADA` - Contraproposta recebida
- `ACEITA` - Proposta aceita
- `RECUSADA` - Proposta recusada
- `CANCELADA` - Proposta cancelada pelo remetente
- `CONTRATO_ASSINADO` - Contrato gerado a partir da proposta

---

## 9. Tecnologias Utilizadas

### Frontend
| Tecnologia          | Versão   | Finalidade                       |
|---------------------|----------|----------------------------------|
| React               | ^18.3.1  | Framework UI                     |
| React Router DOM    | ^6.26.0  | Roteamento SPA                   |
| Vite                | ^5.4.0   | Bundler e dev server             |
| CSS3                | -        | Estilização                      |

### Backend
| Tecnologia          | Versão   | Finalidade                       |
|---------------------|----------|----------------------------------|
| Node.js             | -        | Runtime JavaScript               |
| Express             | ^5.2.1   | Framework HTTP                   |
| MySQL2              | ^3.22.5  | Driver de banco de dados         |
| JWT                 | ^9.0.3   | Autenticação via token           |
| Bcryptjs            | ^3.0.3   | Criptografia de senhas           |
| Multer              | ^2.1.1   | Upload de arquivos               |
| Nodemon             | ^3.1.14  | Hot reload em desenvolvimento    |

### Banco de Dados
| Tecnologia          | Especificação                     |
|---------------------|-----------------------------------|
| MySQL               | 8.0+ (porta 3307)                 |
| Pool de Conexões    | mysql2/promise                    |

---

## 10. Estrutura do Projeto

```
fretelabs-react/
├── index.html                  # Entry point HTML
├── package.json                # Dependências do frontend
├── vite.config.js              # Configuração do Vite
├── eslint.config.js            # Configuração do ESLint
│
├── backend/
│   ├── server.js               # Servidor Express
│   ├── package.json            # Dependências do backend
│   ├── config/
│   │   ├── database.js         # Conexão MySQL
│   │   └── multer.js           # Config upload de arquivos
│   ├── controllers/            # Lógica de negócio (18 controllers)
│   ├── models/                 # Modelos de dados (5 models)
│   ├── routes/                 # Rotas da API (20 arquivos de rotas)
│   ├── middleware/             # Middleware (auth, upload, validação)
│   ├── utils/                  # Utilitários (CPF, token, formatters)
│   └── uploads/                # Pasta de uploads
│
├── src/
│   ├── main.jsx                # Entry point React
│   ├── App.jsx                 # Rotas e estrutura principal
│   ├── App.css                 # Estilos globais
│   ├── index.css               # Estilos base
│   ├── assets/                 # Imagens e ícones
│   │
│   ├── components/             # 35+ componentes React
│   │   ├── Header.jsx          # Cabeçalho do site
│   │   ├── Footer.jsx          # Rodapé do site
│   │   ├── Sidebar.jsx         # Sidebar do dashboard
│   │   ├── LayoutDashboard.jsx # Layout do dashboard (com sidebar)
│   │   ├── Card*.jsx           # Cards reutilizáveis
│   │   ├── Form*.jsx           # Formulários
│   │   ├── Modal*.jsx          # Modais
│   │   ├── Chart.jsx           # Gráficos
│   │   ├── DataTable.jsx       # Tabelas de dados
│   │   ├── StatsGrid.jsx       # Grid de estatísticas
│   │   ├── Guia*.jsx           # Componentes de guias/abas
│   │   └── ...                 # Demais componentes
│   │
│   ├── pages/                  # 25+ páginas
│   │   ├── Home.jsx            # Landing page
│   │   ├── Login.jsx           # Login
│   │   ├── Cadastro.jsx        # Cadastro
│   │   ├── Solucoes.jsx        # Página de soluções
│   │   ├── Empresa.jsx         # Institucional empresa
│   │   ├── Motorista.jsx       # Institucional motorista
│   │   ├── EmbarcadorDashboard.jsx  # Dashboard embarcador
│   │   ├── FrotaDashboard.jsx       # Dashboard frota
│   │   ├── AutonomoDashboard.jsx    # Dashboard autônomo
│   │   ├── VinculadoDashboard.jsx   # Dashboard vinculado
│   │   ├── AdminDashboard.jsx       # Dashboard admin
│   │   ├── PublicarFrete.jsx   # Publicar novo frete
│   │   ├── MeusFretes.jsx      # Listar meus fretes
│   │   ├── BuscarFretes.jsx    # Buscar fretes disponíveis
│   │   ├── DetalheFrete.jsx    # Detalhes do frete
│   │   ├── FretesAceitos.jsx   # Fretes aceitos
│   │   ├── Financeiro.jsx      # Painel financeiro
│   │   ├── Avaliacoes.jsx      # Avaliações
│   │   ├── Veiculos.jsx        # Gerenciar veículos
│   │   ├── Motoristas.jsx      # Gerenciar motoristas
│   │   ├── Perfil.jsx          # Perfil do usuário
│   │   ├── Configuracoes.jsx   # Configurações
│   │   └── ...                 # Demais páginas
│   │
│   ├── hooks/                  # Hooks personalizados
│   │   ├── useAuth.js          # Hook de autenticação
│   │   ├── useDashboard.js     # Hook do dashboard
│   │   ├── useFretes.js        # Hook de fretes
│   │   ├── useVeiculos.js      # Hook de veículos
│   │   ├── useMotoristas.js    # Hook de motoristas
│   │   └── useForm.js          # Hook de formulários
│   │
│   ├── contexts/
│   │   └── AuthContext.jsx     # Contexto de autenticação
│   │
│   ├── services/
│   │   └── api.js              # Serviço de API (todos os endpoints)
│   │
│   ├── utils/
│   │   └── roles.js            # Definições de papéis e permissões
│   │
│   └── styles/
│       └── Global.css          # Estilos globais
│
├── public/
│   ├── favicon.svg             # Favicon
│   └── icons.svg               # Ícones SVG
│
└── README.md                   # README inicial
```

---

## Considerações Finais

O **FreteLabs** é uma plataforma logística completa e robusta que cobre todo o ciclo de vida do transporte de cargas, desde a publicação do frete até o pagamento e avaliação. Com **5 tipos de usuários** bem definidos, cada um com suas funcionalidades específicas, a plataforma atende tanto grandes empresas embarcadoras quanto pequenos motoristas autônomos e frotas.

A aplicação foi construída com **React** no frontend e **Node.js/Express** no backend, seguindo uma arquitetura RESTful com banco de dados **MySQL**. O sistema possui controle de autenticação via JWT, hierarquia de permissões, e uma ampla gama de funcionalidades que cobrem desde a gestão operacional até o financeiro e administrativo da plataforma.

---

*Documentação gerada em: Abril de 2025*
*Versão do Projeto: 1.0.0*

