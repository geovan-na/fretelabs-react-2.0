# FreteLabs

**Instituição de Ensino:** SENAC  
**Curso:** Técnico em Desenvolvimento de Sistemas  
**Disciplina:** Projeto Integrador 
**Orientador:** Profº Hudson Neves  

---

## 1. Descrição do Projeto

O **FreteLabs** é uma Plataforma Inteligente de Gestão e Contratação de Fretes Rodoviários. O sistema atua como um ecossistema centralizado que conecta embarcadores (empresas ou pessoas físicas que precisam enviar cargas) a transportadores (frotas, autônomos ou vinculados), garantindo padronização, segurança e rastreabilidade do início ao fim do processo logístico.

---

## 2. Objetivos

### Objetivo Geral
Prover uma plataforma digital segura e eficiente para a gestão do ciclo de vida de fretes rodoviários, eliminando a dependência de intermediários informais e centralizando a comunicação, contratação e avaliação mútua.

### Problema que o sistema resolve
* A contratação de fretes rodoviários ainda depende amplamente de grupos informais de WhatsApp e intermediários sem garantia contratual.
* Inexistência de padronização para comparar propostas de transportadores, tipos de carga e veículos em tempo real.
* Ausência de histórico transparente e centralizado de reputação e avaliações mútuas entre embarcadores e motoristas.
* Insegurança operacional e falta de rastreabilidade na gestão de veículos, status de entrega e conformidade de documentos.

---

## 3. Público-Alvo

O sistema possui foco em dois segmentos principais:

* **Embarcador:** Indústrias, comércios, distribuidoras e pessoas físicas que precisam escoar cargas com rapidez, segurança e custo competitivo.
* **Transportador:** Empresas de frota, motoristas autônomos e motoristas vinculados que buscam cargas qualificadas e gestão profissional de veículos.

---

## 4. Funcionalidades

O sistema conta com fluxos completos do anúncio da carga à entrega final, oferecendo as seguintes funcionalidades:

* Cadastro multi-perfil (5 perfis de usuário).
* Publicação de fretes com cálculo integrado.
* Busca com filtros dinâmicos (100% opcionais e combináveis por rotas, cargas e valores).
* Envio, recebimento e gestão de candidaturas a fretes.
* Gestão de frota e veículos.
* Painel exclusivo do motorista vinculado.
* Avaliação mútua (1 a 5 estrelas) ao concluir o frete, gerando reputação na rede.
* Rastreamento e atualização de status de entrega.
* Relatórios e auditoria.
* Aprovação e blacklist de usuários (Módulo Admin).

---

## 5. Tecnologias Utilizadas

| Camada | Tecnologia |
| :--- | :--- |
| **Frontend** | React 18, Vite |
| **Backend** | Node.js, Express |
| **Banco de Dados**| MySQL (Aiven Cloud SSL) |
| **Segurança** | JWT (JSON Web Token), Bcrypt |
| **Hospedagem (Deploy)** | Vercel (Frontend), Render (Backend) |
| **Testes** | Jest, Playwright (39+ testes de integração e E2E) |

---

## 6. Arquitetura da Solução

O projeto utiliza uma arquitetura baseada em **Cliente-Servidor**. O Frontend atua como uma SPA (Single Page Application) moderna construída com React, comunicando-se exclusivamente via protocolo HTTPS/REST em formato JSON com a API RESTful hospedada no servidor Backend (Node.js). O banco de dados relacional é externalizado em nuvem (Aiven) garantindo alta disponibilidade e segurança com SSL.

---

## 7. Modelagem do Banco de Dados

* **Tipo:** Relacional (MySQL)
* **Estrutura:** 28 tabelas interligadas gerenciando 5 perfis distintos de usuários, fretes, veículos e avaliações.
* **Segurança:** Cláusulas estruturadas com Prepared Statements para evitar Injeção de SQL.
* **Integridade:** Uso de chaves estrangeiras rigorosas (Integridade Referencial).

---

## 8. Pré-requisitos

Para executar o projeto localmente, você precisará ter instalado em sua máquina:

* Node.js (versão 18.x ou superior recomendada)
* Gerenciador de pacotes NPM ou Yarn
* Git para clonagem do repositório
* Uma instância local do MySQL ou credenciais ativas para o banco de dados em nuvem (Aiven)

---

## 9. Instalação

Siga os passos abaixo para preparar o ambiente de desenvolvimento:

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/geovan-na/fretelabs-react-2.0.git
   cd fretelabs-react-2.0
   ```

2. **Configuração do Backend:**
   ```bash
   cd backend
   npm install
   ```
   Crie um arquivo `.env` na raiz da pasta `backend` com as seguintes variáveis:
   ```env
   PORT=3000
   DB_HOST=seu_host_aiven_ou_local
   DB_USER=seu_usuario
   DB_PASSWORD=sua_senha
   DB_NAME=frete_labs_db
   DB_PORT=25060
   JWT_SECRET=sua_chave_secreta_jwt
   ```

3. **Configuração do Frontend:**
   Volte para a raiz do projeto (pasta `fretelabs-react-2.0`) e instale as dependências:
   ```bash
   cd ..
   npm install
   ```
   Crie um arquivo `.env` na raiz do projeto frontend:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

---

## 10. Como Executar

Com as dependências instaladas e as variáveis de ambiente configuradas, inicie os servidores:

**Para iniciar a API (Backend):**
A partir da pasta do backend (`fretelabs-react-2.0/backend`):
```bash
npm run dev
```
*(O servidor iniciará, por padrão, na porta 3000).*

**Para iniciar a Interface (Frontend):**
A partir da raiz do projeto (`fretelabs-react-2.0`):
```bash
npm run dev
```
*(O Vite iniciará a aplicação, disponível geralmente em `http://localhost:5173`).*

---

## 11. Estrutura do Projeto

A organização de diretórios reflete a estrutura exata do repositório, com o frontend na raiz e o backend em uma pasta separada:

```text
fretelabs-react-2.0/
|-- backend/              # API e Servidor Node.js
|   |-- config/           # Configurações do banco de dados (Conexão MySQL)
|   |-- controllers/      # Lógica de negócio e processamento de requisições
|   |-- middleware/       # Interceptadores (Autenticação JWT, tratamento de erros)
|   |-- models/           # Modelos e interação com o banco de dados
|   |-- routes/           # Definição dos endpoints da API REST
|   |-- uploads/          # Diretório para armazenamento de arquivos/imagens
|   |-- utils/            # Funções utilitárias do servidor
|-- public/               # Arquivos estáticos e HTML base do React
|-- src/                  # Código-fonte principal do Frontend (React)
|   |-- assets/           # Imagens, ícones e recursos visuais
|   |-- components/       # Componentes React reutilizáveis (Botões, Modais, Cards)
|   |-- contexts/         # Context API para gerenciamento de estado (ex: AuthContext)
|   |-- hooks/            # Custom Hooks (useAuth, useFretes, etc.)
|   |-- pages/            # Telas completas da aplicação (Login, Dashboard, Buscar)
|   |-- services/         # Configuração do Axios e comunicação com a API
|   |-- styles/           # Estilos e CSS global
|   |-- utils/            # Funções de suporte e constantes do frontend
```

---

## 12. Exemplos de Uso

**Fluxo principal de uso (Demo):**
1. O Embarcador acessa o sistema e publica um frete informando origem, destino e tipo de carga.
2. O Transportador utiliza a tela de buscas com filtros para encontrar cargas compatíveis e se candidata.
3. O Embarcador avalia o histórico dos candidatos no painel, aprova a proposta e formaliza a contratação.
4. O Transportador realiza a rota e atualiza o status na plataforma para "Entregue".
5. Ambas as partes se avaliam de 1 a 5 estrelas ao final do ciclo.

---

## 13. API

A API foi construída em padrão RESTful, retornando respostas em formato JSON. Abaixo estão os principais endpoints do sistema:

| Método | Endpoint | Descrição | Autenticação |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Realiza o login do usuário e retorna o Token JWT. | Não |
| `POST` | `/api/usuarios/registro` | Cadastra um novo usuário no sistema (5 perfis). | Não |
| `GET` | `/api/fretes` | Lista fretes com construção dinâmica de cláusulas WHERE. | Sim |
| `POST` | `/api/fretes` | Publica um novo frete (Apenas Embarcadores). | Sim |
| `POST` | `/api/candidaturas` | Registra o interesse de um transportador em um frete. | Sim |
| `PUT` | `/api/fretes/:id/status`| Atualiza o status logístico do frete. | Sim |
| `POST` | `/api/avaliacoes` | Registra a nota mútua após a conclusão do frete. | Sim |

---

## 14. Capturas de Tela

* [Inserir captura de tela da tela inicial/Dashboard aqui]
* [Inserir captura de tela da busca de fretes e filtros aqui]
* [Inserir captura de tela do painel do motorista aqui]

---

## 15. Equipe do Projeto

* **Geovanna Rezende dos Santos** - Desenvolvedora Full Stack

---

## 16. Melhorias Futuras

As seguintes features foram mapeadas para o roadmap futuro do sistema:

* **Pagamento integrado (Escrow / PIX):** Transações com custódia e liberação automática pós-confirmação digital.
* **Rastreamento GPS em tempo real:** Telemetria contínua com mapa interativo da carga.
* **Aplicativo Mobile Nativo:** Versão mobile (iOS/Android) com leitura de comprovantes por foto e assinatura digital.
* **Matching Inteligente via IA:** Recomendação preditiva de cargas baseada em rotas de retorno e cubagem ociosa de veículos.

---

## 17. Licença

**Todos os Direitos Reservados (All Rights Reserved)**

Este é um projeto proprietário. Nenhuma licença de uso, cópia, modificação ou distribuição é concedida a terceiros. O código e a plataforma são de propriedade exclusiva da autora e são disponibilizados publicamente apenas para fins de avaliação acadêmica e demonstração de portfólio. Nenhuma parte deste projeto pode ser reproduzida ou utilizada para fins comerciais sem autorização prévia e expressa.
