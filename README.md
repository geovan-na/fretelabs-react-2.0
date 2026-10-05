# FreteLabs

**InstituiÃ§Ã£o de Ensino:** SENAC  
**Curso:** TÃ©cnico em Desenvolvimento de Sistemas  
**Disciplina:** Projeto Integrador  
**Orientador:** ProfÂº Hudson Neves  

---

## 1. DescriÃ§Ã£o do Projeto

O **FreteLabs** Ã© uma Plataforma Inteligente de GestÃ£o e ContrataÃ§Ã£o de Fretes RodoviÃ¡rios. O sistema atua como um ecossistema centralizado que conecta embarcadores (empresas ou pessoas fÃ­sicas que precisam enviar cargas) a transportadores (frotas, autÃ´nomos ou vinculados), garantindo padronizaÃ§Ã£o, seguranÃ§a e rastreabilidade do inÃ­cio ao fim do processo logÃ­stico.

---

## 2. Objetivos

### Objetivo Geral
Prover uma plataforma digital segura e eficiente para a gestÃ£o do ciclo de vida de fretes rodoviÃ¡rios, eliminando a dependÃªncia de intermediÃ¡rios informais e centralizando a comunicaÃ§Ã£o, contrataÃ§Ã£o e avaliaÃ§Ã£o mÃºtua.

### Problema que o sistema resolve
* A contrataÃ§Ã£o de fretes rodoviÃ¡rios ainda depende amplamente de grupos informais de WhatsApp e intermediÃ¡rios sem garantia contratual.
* InexistÃªncia de padronizaÃ§Ã£o para comparar propostas de transportadores, tipos de carga e veÃ­culos em tempo real.
* AusÃªncia de histÃ³rico transparente e centralizado de reputaÃ§Ã£o e avaliaÃ§Ãµes mÃºtuas entre embarcadores e motoristas.
* InseguranÃ§a operacional e falta de rastreabilidade na gestÃ£o de veÃ­culos, status de entrega e conformidade de documentos.

---

## 3. PÃºblico-Alvo

O sistema possui foco em dois segmentos principais:

* **Embarcador:** IndÃºstrias, comÃ©rcios, distribuidoras e pessoas fÃ­sicas que precisam escoar cargas com rapidez, seguranÃ§a e custo competitivo.
* **Transportador:** Empresas de frota, motoristas autÃ´nomos e motoristas vinculados que buscam cargas qualificadas e gestÃ£o profissional de veÃ­culos.

---

## 4. Funcionalidades

O sistema conta com fluxos completos do anÃºncio da carga Ã  entrega final, oferecendo as seguintes funcionalidades:

* Cadastro multi-perfil (5 perfis de usuÃ¡rio).
* PublicaÃ§Ã£o de fretes com cÃ¡lculo integrado.
* Busca com filtros dinÃ¢micos (100% opcionais e combinÃ¡veis por rotas, cargas e valores).
* Envio, recebimento e gestÃ£o de candidaturas a fretes.
* GestÃ£o de frota e veÃ­culos.
* Painel exclusivo do motorista vinculado.
* AvaliaÃ§Ã£o mÃºtua (1 a 5 estrelas) ao concluir o frete, gerando reputaÃ§Ã£o na rede.
* Rastreamento e atualizaÃ§Ã£o de status de entrega.
* RelatÃ³rios e auditoria.
* AprovaÃ§Ã£o e blacklist de usuÃ¡rios (MÃ³dulo Admin).

---

## 5. Tecnologias Utilizadas

| Camada | Tecnologia |
| :--- | :--- |
| **Frontend** | React 18, Vite |
| **Backend** | Node.js, Express |
| **Banco de Dados**| MySQL (Aiven Cloud SSL) |
| **SeguranÃ§a** | JWT (JSON Web Token), Bcrypt |
| **Hospedagem (Deploy)** | Vercel (Frontend), Render (Backend) |
| **Testes** | Jest, Playwright (39+ testes de integraÃ§Ã£o e E2E) |

---

## 6. Arquitetura da SoluÃ§Ã£o

O projeto utiliza uma arquitetura baseada em **Cliente-Servidor**. O Frontend atua como uma SPA (Single Page Application) moderna construÃ­da com React, comunicando-se exclusivamente via protocolo HTTPS/REST em formato JSON com a API RESTful hospedada no servidor Backend (Node.js). O banco de dados relacional Ã© externalizado em nuvem (Aiven) garantindo alta disponibilidade e seguranÃ§a com SSL.

---

## 7. Modelagem do Banco de Dados

* **Tipo:** Relacional (MySQL)
* **Estrutura:** 28 tabelas interligadas gerenciando 5 perfis distintos de usuÃ¡rios, fretes, veÃ­culos e avaliaÃ§Ãµes.
* **SeguranÃ§a:** ClÃ¡usulas estruturadas com Prepared Statements para evitar InjeÃ§Ã£o de SQL.
* **Integridade:** Uso de chaves estrangeiras rigorosas (Integridade Referencial).

---

## 8. PrÃ©-requisitos

Para executar o projeto localmente, vocÃª precisarÃ¡ ter instalado em sua mÃ¡quina:

* Node.js (versÃ£o 18.x ou superior recomendada)
* Gerenciador de pacotes NPM ou Yarn
* Git para clonagem do repositÃ³rio
* Uma instÃ¢ncia local do MySQL ou credenciais ativas para o banco de dados em nuvem (Aiven)

---

## 9. InstalaÃ§Ã£o

Siga os passos abaixo para preparar o ambiente de desenvolvimento:

1. **Clone o repositÃ³rio:**
   ```bash
   git clone https://github.com/geovan-na/fretelabs-react-2.0.git
   cd fretelabs-react-2.0
   ```

2. **ConfiguraÃ§Ã£o do Backend:**
   ```bash
   cd backend
   npm install
   ```
   Crie um arquivo `.env` na raiz da pasta `backend` com as seguintes variÃ¡veis:
   ```env
   PORT=3000
   DB_HOST=seu_host_aiven_ou_local
   DB_USER=seu_usuario
   DB_PASSWORD=sua_senha
   DB_NAME=frete_labs_db
   DB_PORT=25060
   JWT_SECRET=sua_chave_secreta_jwt
   ```

3. **ConfiguraÃ§Ã£o do Frontend:**
   Volte para a raiz do projeto (pasta `fretelabs-react-2.0`) e instale as dependÃªncias:
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

Com as dependÃªncias instaladas e as variÃ¡veis de ambiente configuradas, inicie os servidores:

**Para iniciar a API (Backend):**
A partir da pasta do backend (`fretelabs-react-2.0/backend`):
```bash
npm run dev
```
*(O servidor iniciarÃ¡, por padrÃ£o, na porta 3000).*

**Para iniciar a Interface (Frontend):**
A partir da raiz do projeto (`fretelabs-react-2.0`):
```bash
npm run dev
```
*(O Vite iniciarÃ¡ a aplicaÃ§Ã£o, disponÃ­vel geralmente em `http://localhost:5173`).*

---

## 11. Estrutura do Projeto

A organizaÃ§Ã£o de diretÃ³rios reflete a estrutura exata do repositÃ³rio, com o frontend na raiz e o backend em uma pasta separada:

```text
fretelabs-react-2.0/
|-- backend/              # API e Servidor Node.js
|   |-- config/           # ConfiguraÃ§Ãµes do banco de dados (ConexÃ£o MySQL)
|   |-- controllers/      # LÃ³gica de negÃ³cio e processamento de requisiÃ§Ãµes
|   |-- middleware/       # Interceptadores (AutenticaÃ§Ã£o JWT, tratamento de erros)
|   |-- models/           # Modelos e interaÃ§Ã£o com o banco de dados
|   |-- routes/           # DefiniÃ§Ã£o dos endpoints da API REST
|   |-- uploads/          # DiretÃ³rio para armazenamento de arquivos/imagens
|   |-- utils/            # FunÃ§Ãµes utilitÃ¡rias do servidor
|-- public/               # Arquivos estÃ¡ticos e HTML base do React
|-- src/                  # CÃ³digo-fonte principal do Frontend (React)
|   |-- assets/           # Imagens, Ã­cones e recursos visuais
|   |-- components/       # Componentes React reutilizÃ¡veis (BotÃµes, Modais, Cards)
|   |-- contexts/         # Context API para gerenciamento de estado (ex: AuthContext)
|   |-- hooks/            # Custom Hooks (useAuth, useFretes, etc.)
|   |-- pages/            # Telas completas da aplicaÃ§Ã£o (Login, Dashboard, Buscar)
|   |-- services/         # ConfiguraÃ§Ã£o do Axios e comunicaÃ§Ã£o com a API
|   |-- styles/           # Estilos e CSS global
|   |-- utils/            # FunÃ§Ãµes de suporte e constantes do frontend
```

---

## 12. Exemplos de Uso

**Fluxo principal de uso (Demo):**
1. O Embarcador acessa o sistema e publica um frete informando origem, destino e tipo de carga.
2. O Transportador utiliza a tela de buscas com filtros para encontrar cargas compatÃ­veis e se candidata.
3. O Embarcador avalia o histÃ³rico dos candidatos no painel, aprova a proposta e formaliza a contrataÃ§Ã£o.
4. O Transportador realiza a rota e atualiza o status na plataforma para "Entregue".
5. Ambas as partes se avaliam de 1 a 5 estrelas ao final do ciclo.

---

## 13. API

A API foi construÃ­da em padrÃ£o RESTful, retornando respostas em formato JSON. Abaixo estÃ£o os principais endpoints do sistema:

| MÃ©todo | Endpoint | DescriÃ§Ã£o | AutenticaÃ§Ã£o |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Realiza o login do usuÃ¡rio e retorna o Token JWT. | NÃ£o |
| `POST` | `/api/auth/register` | Cadastra um novo usuÃ¡rio no sistema (5 perfis). | NÃ£o |
| `GET` | `/api/fretes` | Lista fretes com construÃ§Ã£o dinÃ¢mica de clÃ¡usulas WHERE. | Sim |
| `POST` | `/api/fretes` | Publica um novo frete (Apenas Embarcadores). | Sim |
| `POST` | `/api/candidaturas` | Registra o interesse de um transportador em um frete. | Sim |
| `PUT` | `/api/fretes/:id`| Atualiza o status logÃ­stico do frete. | Sim |
| `POST` | `/api/avaliacoes` | Registra a nota mÃºtua apÃ³s a conclusÃ£o do frete. | Sim |

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

* **Pagamento integrado (Escrow / PIX):** TransaÃ§Ãµes com custÃ³dia e liberaÃ§Ã£o automÃ¡tica pÃ³s-confirmaÃ§Ã£o digital.
* **Rastreamento GPS em tempo real:** Telemetria contÃ­nua com mapa interativo da carga.
* **Aplicativo Mobile Nativo:** VersÃ£o mobile (iOS/Android) com leitura de comprovantes por foto e assinatura digital.
* **Matching Inteligente via IA:** RecomendaÃ§Ã£o preditiva de cargas baseada em rotas de retorno e cubagem ociosa de veÃ­culos.

---

## 17. LicenÃ§a

**Todos os Direitos Reservados (All Rights Reserved)**

Este Ã© um projeto proprietÃ¡rio. Nenhuma licenÃ§a de uso, cÃ³pia, modificaÃ§Ã£o ou distribuiÃ§Ã£o Ã© concedida a terceiros. O cÃ³digo e a plataforma sÃ£o de propriedade exclusiva da autora e sÃ£o disponibilizados publicamente apenas para fins de avaliaÃ§Ã£o acadÃªmica e demonstraÃ§Ã£o de portfÃ³lio. Nenhuma parte deste projeto pode ser reproduzida ou utilizada para fins comerciais sem autorizaÃ§Ã£o prÃ©via e expressa.


