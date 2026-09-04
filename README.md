# 2026.3.1 - POS - Frondend web e Backend api restfull

## Informações gerais

- **Público alvo**: alunos da disciplina de **Programação orientada a serviços** do curso de [Infoweb](https://diatinf.ifrn.edu.br/cursos/tecnico-em-informatica-para-internet/) na [DIATINF](https://diatinf.ifrn.edu.br/) no [CNAT-IFRN](https://portal.ifrn.edu.br/campus/natalcentral/)
- **Professor**: [L A Minora](https://github.com/leonardo-minora/)
- **Objetivo**:
  1. Atividade avaliativa para construção de aplicativo com frontend web e backend api restfull

[A descrição da atividade](atividade.md)

---
## Relato da atividade
Nome do aluno e seu link do linkedin e github

### Componentes e tecnologias

#### Backend (`/api`)
- **Node.js** & **TypeScript** (Ambiente de execução e tipagem estática)
- **Express.js** (Framework minimalista para API RESTful)
- **Prisma ORM** (Modelagem de dados e abstração relacional)
- **SQLite** (Banco de dados relacional para desenvolvimento rápido no Codespaces)
- **Bcryptjs** (Criptografia e hashing seguro de senhas)
- **JSON Web Token (jsonwebtoken)** (Autenticação baseada em tokens)
- **Zod** (Validação e tipagem de esquemas de dados)
- **TSX** (Execução e recarregamento automático TypeScript em desenvolvimento)

#### Frontend (`/web`)
- **React 18** & **TypeScript** (Biblioteca de interface reativa e tipada)
- **Vite** (Ferramenta de build rápida e servidor de desenvolvimento)
- **Tailwind CSS** (Framework de estilização com abordagem *Mobile First*)
- **Paleta Oficial DIATINF** configurada no Tailwind:
  - Primária: `#CE701B`
  - Laranja médio: `#F1881D`
  - Amarelo: `#FDC616`
  - Creme: `#F9EBC2`
  - Azul acinzentado: `#A4BCCC`
  - Azul petróleo escuro: `#0C3453`
- **Lucide React** (Pacote de ícones vetoriais modernos)
- **React Router DOM** (Roteamento e navegação client-side)

### Agente de IA

#### Etapa 1: Estrutura do Monorepo e Modelagem do Banco de Dados
- **Prompt Utilizado**:
  > *"Você é um desenvolvedor TypeScript especialista em aplicações Web Fullstack (Node.js e React). Sua função é me auxiliar no desenvolvimento do projeto "DIATINF X" no GitHub Codespaces. [...] Confirme que entendeu estas diretrizes para iniciarmos a primeira etapa: a estrutura das pastas `/api` e `/web` e a modelagem do banco de dados em `/api`."*

- **Explicação Técnica da Implementação**:
  - Inicialização da estrutura monorepo dividida em `/api` (backend RESTful) e `/web` (frontend SPA).
  - Modelagem do banco de dados relacional com **Prisma ORM** em `api/prisma/schema.prisma`:
    - `User`: perfil público, autenticação por usuário e senha com hash.
    - `Post`: publicações restritas exclusivamente a texto (`content: String`), vinculadas a um autor.
    - `Comment`: suporte a respostas encadeadas através de auto-relacionamento (`parentId` referenciando outro `Comment`).
    - `Rating`: avaliações de posts com restrição de 1 a 3 estrelas e restrição única `@@unique([postId, userId])` para impedir avaliações duplicadas pelo mesmo usuário.
  - Geração automática do cliente Prisma e sincronização do banco local SQLite (`dev.db`).
  - Configuração do frontend com Vite, React, TypeScript e Tailwind CSS com as cores oficiais da DIATINF customizadas e layout base *Mobile First*.

- **Escolhas e Ajustes de Código**:
  - **Prisma com SQLite**: Escolhido para viabilizar execução instantânea sem necessidade de provisionamento de serviços externos no Codespaces, com portabilidade direta para PostgreSQL.
  - **Mobile First**: Configuração de container responsivo (`max-w-md`) com navegação inferior fixa para proporcionar experiência idêntica a apps nativos em smartphones.
  - **TypeScript Rigoroso**: Configuração de `tsconfig.json` ajustada para conformidade com regras estritas (`strict: true`, `noUnusedLocals: true`).
  - **Gitignore central**: Adição de `.gitignore` na raiz do monorepo para manter o repositório limpo, ignorando `node_modules`, builds e o banco de dados local.

#### Etapa 2: Autenticação JWT e Perfis de Usuário
- **Prompt Utilizado**:
  > *"Okay, prossiga com o planjemento da etapa 2"*

- **Explicação Técnica da Implementação**:
  - **Tipagem Extensiva**: Criação de `src/@types/express.d.ts` estendendo a interface `Request` do Express com a propriedade `userId`.
  - **Middleware `ensureAuthenticated`**: Implementado para interceptar rotas privadas, extraindo e validando o token Bearer no cabeçalho `Authorization` com a biblioteca `jsonwebtoken`.
  - **`AuthController`**:
    - `POST /auth/register`: Validação de esquema rigorosa com Zod (usuário sem caracteres especiais, tamanho mínimo de senha), verificação de duplicidade no banco, hashing seguro da senha com `bcryptjs` (salt 10) e geração de token JWT.
    - `POST /auth/login`: Comparação de hash com `bcryptjs.compare` e emissão de token JWT válido por 7 dias.
  - **`UserController`**:
    - `GET /users/me`: Recuperação dos dados do usuário autenticado e seus contadores de publicações e comentários (`_count`).
    - `PATCH /users/me`: Atualização de nome, biografia e link de avatar.
    - `GET /users/profile/:username`: Endpoint público (**Regra de Negócio 5**) para consulta de informações públicas de qualquer perfil sem exigência de autenticação.
  - **Tratamento Global de Erros**: Configuração de middleware em `server.ts` capturando erros de validação Zod e padronizando respostas em formato JSON com código HTTP apropriado (400, 401, 404, 409).
  - **Bateria de Testes Automatizados**: Criação do script `api/test-auth.ts` cobrindo 8 cenários (16 asserções) testando fluxo de registro, duplicidade, login, rotas privadas, bloqueio sem token e consulta pública de perfil.

- **Escolhas e Ajustes de Código**:
  - **Privacidade e Segurança**: As senhas nunca são devolvidas nos payloads das respostas (utilização da cláusula `select` do Prisma e exclusão explícita no DTO).
  - **Lowercase automático**: Nomes de usuários são convertidos para minúsculas via transform do Zod para evitar problemas de sensibilidade a maiúsculas/minúsculas no login e rotas de perfil.
  - **Roteamento Flexível**: Montagem das rotas tanto na raiz quanto com prefixo `/api` para compatibilidade com diferentes convenções de proxy e consumo pelo frontend.

#### Etapa 3: Posts textuais, Avaliações (1 a 3 estrelas) e Comentários Encadeados
- **Prompt Utilizado**:
  > *"otimo, prossiga"*

- **Explicação Técnica da Implementação**:
  - **Regra 1 (Posts somente texto)**: Implementação em `src/controllers/PostController.ts` com validação de texto estrita no Zod (tamanho entre 1 e 500 caracteres, sem aceitar upload ou links de arquivos).
  - **Regra 2 (Feed de outros usuários, Minhas publicações e Pesquisa)**:
    - `GET /posts/feed`: Filtra publicações excluindo o autor logado (`authorId != req.userId`), ordenadas de forma cronológica decrescente.
    - `GET /posts/my`: Traz apenas as publicações do próprio usuário logado.
    - `GET /posts/search?q=termo`: Busca rápida por correspondência de texto no conteúdo.
    - `GET /posts/user/:username`: Lista todas as publicações de determinado perfil público.
  - **Regra 3 (Comentários encadeados)**:
    - Criação de `src/controllers/CommentController.ts` com suporte ao campo `parentId`.
    - Endpoint `GET /posts/:id/comments` processa os registros em memória montando uma estrutura recursiva em árvore com arrays de `replies: []`.
    - Validação de integridade: garante que respostas encadeadas pertençam obrigatoriamente à mesma publicação original.
  - **Regra 4 (Avaliação de 1 a 3 estrelas)**:
    - Implementação em `src/controllers/RatingController.ts` com validação Zod para números inteiros entre 1 e 3.
    - Operação de *upsert* atômica no banco SQLite respeitando `@@unique([postId, userId])` para atualizar notas existentes sem inflar a contagem de avaliações.
    - Cálculo dinâmico da média de estrelas (`averageRating`) e totalizador (`ratingsCount`).
  - **Middleware Opcional e Tratamento de Erros**:
    - Criação de `src/middlewares/optionalAuth.ts` para capturar o usuário atual em rotas públicas sem bloqueio para anônimos.
    - Criação de `src/lib/asyncHandler.ts` para tratamento consistente de erros assíncronos no Express 4 direcionados ao interceptador Zod.
  - **Bateria de Testes Automatizados**:
    - Criação do script `api/test-posts.ts` com 29 asserções cobrindo regras de texto, rejeição de notas fora de 1-3, média ponderada, árvore de comentários em múltiplos níveis e isolamento do feed.

- **Escolhas e Ajustes de Código**:
  - **Estruturação de Árvore no Backend**: O agrupamento de comentários encadeados é processado diretamente pelo backend via algoritmo com mapa `Map<string, CommentNode>`, aliviando o cliente mobile de processar árvores complexas.
  - **Async Handler**: Adotado o padrão de *higher-order function* `asyncHandler` para desacoplar `try/catch` dos controladores e delegar exceções automaticamente ao middleware centralizado de erros.
  - **Estatísticas Agregadas**: A função utilitária `formatPost` centraliza o cálculo de média de avaliações e formatação de dados do autor para manter consistência em todos os endpoints de feed, busca e detalhe.

#### Etapa 4: Frontend - Cliente HTTP, Autenticação e Telas de Login/Cadastro Mobile First
- **Prompt Utilizado**:
  > *"sim"* (após proposta da Etapa 4)

- **Explicação Técnica da Implementação**:
  - **Cliente HTTP (`web/src/services/api.ts`)**: Módulo unificado para consumo da API baseado em `fetch`, com tratamento de erros personalizado via classe `ApiError`, captura de mensagens de validação Zod do backend e injeção automática de tokens `Bearer` a partir do `localStorage`.
  - **Gerenciamento de Estado Global (`web/src/contexts/AuthContext.tsx`)**: Contexto React com persistência das chaves `@diatinf-x:token` e `@diatinf-x:user`. Restauração silenciosa e automática da sessão na montagem do app via `GET /users/me`, com métodos de `login`, `register`, `logout` e `updateUser`.
  - **Layout Reutilizável Mobile First (`web/src/components/Layout.tsx`)**:
    - Container delimitado com largura móvel (`max-w-md`) e bordas suaves.
    - Cabeçalho superior temático com o emblema **DIATINF X**, indicador visual de usuário autenticado e botão de encerramento de sessão.
    - Barra inferior fixa (*Bottom Navigation Bar*) garantindo navegação instantânea com atalhos para Início, Pesquisa, Nova Publicação (botão em relevo), Minhas Publicações e Perfil, em estrita aderência à **Regra de Negócio 2**.
  - **Telas de Autenticação (`web/src/pages`)**:
    - `Login.tsx`: Formulário limpo com campos de nome de usuário e senha, validação em tempo real, estados de carregamento e link alternativo para cadastro.
    - `Register.tsx`: Formulário completo com nome, usuário (`@username`), senha, biografia e link opcional de foto de avatar, conectado diretamente à rota `POST /auth/register`.
  - **Roteamento SPA (`web/src/App.tsx`)**: Configuração do `react-router-dom` integrando o `AuthProvider`, `Layout` e as rotas `/login`, `/register`, `/`, além dos marcadores das próximas funcionalidades.

- **Escolhas e Ajustes de Código**:
  - **Tipagem do Ambiente Vite**: Criação de `src/vite-env.d.ts` com `<reference types="vite/client" />` para assegurar acesso fortemente tipado a variáveis de ambiente (`import.meta.env`).
  - **Design System Temático**: Aplicação estrita da paleta oficial da DIATINF (`#CE701B`, `#F1881D`, `#FDC616`, `#F9EBC2`, `#A4BCCC`, `#0C3453`) nos componentes, inputs, botões, gradientes e estados ativos de navegação.

#### Etapa 5: Frontend - Feed Principal, Criação de Publicações e Avaliações por Estrelas
- **Prompt Utilizado**:
  > *"sim"* (após proposta da Etapa 5)

- **Explicação Técnica da Implementação**:
  - **Componente Interativo `StarRating` (`web/src/components/StarRating.tsx`)**:
    - Renderização de 3 estrelas para avaliação de postagens conforme a **Regra 4**.
    - Interação de clique imediato, efeito hover para pré-visualização da nota e envio assíncrono para `POST /posts/:id/rate`.
    - Exibição da média com uma casa decimal, contagem total de votos e destaque da nota do usuário conectado (`Sua nota: X★`).
  - **Componente `PostCard` (`web/src/components/PostCard.tsx`)**:
    - Card responsivo exibindo avatar, nome, `@username`, tempo relativo decorrido e conteúdo estritamente textual (**Regra 1**).
    - Botão de exclusão com confirmação condicional (exibido apenas se o usuário conectado for o autor do post).
    - Integração direta com `StarRating` e contador de comentários.
  - **Página de Feed Principal (`web/src/pages/Feed.tsx`)**:
    - Consumo de `GET /posts/feed`, apresentando publicações de outros membros da comunidade (**Regra 2**).
    - Skeletons de carregamento (*loading states*), botão de recarregamento manual com animação de giro e *empty state* com orientações sobre as regras da tela inicial.
  - **Página de Nova Publicação (`web/src/pages/NewPost.tsx`)**:
    - Interface focada em escrita textual (**Regra 1**) sem permissão de anexos ou imagens.
    - Contador regressivo dinâmico de caracteres (limite de 500) com aviso visual colorido quando próximo do fim.
    - Conexão direta com a rota `POST /posts`.

- **Escolhas e Ajustes de Código**:
  - **Experiência Otimista**: No componente de avaliação, as estrelas e notas são atualizadas localmente de imediato com a resposta do backend sem necessidade de recarregar a lista inteira de posts.
  - **Prevenção de Voto Anônimo**: Tentativas de avaliação por usuários não autenticados acionam redirecionamento amigável para a tela de login.

#### Etapa 6: Frontend - Comentários Encadeados, Minhas Publicações, Pesquisa e Perfis Públicos
- **Prompt Utilizado**:
  > *"sim"* (após proposta da Etapa 6)

- **Explicação Técnica da Implementação**:
  - **Comentários Encadeados Recursivos (`web/src/components/CommentItem.tsx`)**:
    - Renderização recursiva e aninhada de comentários e réplicas com linha-guia visual na paleta DIATINF (**Regra 3**).
    - Ação inline de resposta disparando `POST /posts/:id/comments` com `parentId` vinculado.
    - Exclusão permitida exclusivamente ao autor do comentário.
  - **Página Detalhada de Publicação (`web/src/pages/PostDetail.tsx`)**:
    - Visualização da publicação completa e lista em árvore hierárquica dos comentários.
    - Formulário para comentários de nível raiz integrado.
  - **Minhas Publicações (`web/src/pages/MyPosts.tsx`)**:
    - Consumo do endpoint `GET /posts/my` trazendo apenas posts do usuário logado (**Regra 2**).
    - Painel com contadores de posts, total de comentários e avaliações recebidas.
    - Gerenciamento e exclusão de posts pelo autor.
  - **Pesquisa de Publicações (`web/src/pages/Search.tsx`)**:
    - Busca textual em tempo real consumindo `GET /posts/search?q=termo` (**Regra 2**).
    - Limpeza rápida de pesquisa e tratamento de estados vazios.
  - **Perfis Sempre Públicos (`web/src/pages/Profile.tsx`)**:
    - Consumo de `GET /users/profile/:username` e `GET /posts/user/:username` (**Regra 5**).
    - Apresentação pública de biografia, foto/avatar, data de ingresso e contadores de atividade, com acesso irrestrito para qualquer visitante.
  - **Roteamento Consolidado (`web/src/App.tsx`)**:
    - Mapeamento de todas as rotas da aplicação (`/`, `/login`, `/register`, `/new-post`, `/post/:id`, `/my-posts`, `/search`, `/profile/:username`).

- **Escolhas e Ajustes de Código**:
  - **Recursividade em Componente Funcional**: O componente `CommentItem` renderiza a si mesmo para cada item presente no array `replies`, garantindo suporte a múltiplos níveis de profundidade de encadeamento sem duplicação de lógica.
  - **Links Universais de Perfil**: Em qualquer lugar onde o nome ou avatar do autor aparece (feed, comentários, detalhes), o clique encaminha para o perfil público do respectivo usuário.

#### Resumo Consolidado da Atuação da IA no Desenvolvimento do Projeto
A atuação da inteligência artificial no projeto **DIATINF X** deu-se no modelo **AI Pair Programmer / Especialista Fullstack (Node.js e React com TypeScript)**, conduzindo o desenvolvimento do monorepo de ponta a ponta com base em uma metodologia sistemática e rigorosa:

1. **Metodologia Incremental e Planejamento Prévio**:
   - O projeto não foi gerado em um bloco monolítico de código. Cada etapa foi precedida pela criação e aprovação de planos técnicos detalhados (`implementation_plan.md`), prevenindo alucinações, perda de contexto e quebra de regras de negócio.
   - O desenvolvimento foi estruturado em 7 etapas iterativas: (1) Estrutura Monorepo e Modelagem, (2) Autenticação JWT e Perfis, (3) Regras de Negócio do Backend (Posts textuais, Avaliações de 1 a 3 estrelas e Comentários encadeados), (4) Frontend Base e Telas de Login/Cadastro, (5) Feed e Criação de Posts, (6) Comentários Encadeados e Navegação, e (7) Finalização e Documentação.

2. **Modelagem de Domínio e Arquitetura no Backend (`/api`)**:
   - A IA projetou um modelo relacional elegante em Prisma ORM com SQLite (fácil execução no GitHub Codespaces e portabilidade direta para PostgreSQL).
   - As 5 regras de negócio foram estritamente codificadas e validadas:
     - **Regra 1 (Posts somente texto)**: Validação Zod estrita para conteúdo textual (1 a 500 caracteres), rejeitando mídias ou formatos inválidos.
     - **Regra 2 (Feed de outros usuários e Navegação)**: Endpoints dedicados para o feed da tela inicial (`/posts/feed` filtrando publicações de outros autores), Minhas publicações (`/posts/my`) e Pesquisa (`/posts/search`).
     - **Regra 3 (Comentários encadeados)**: Modelo auto-relacional recursivo em `Comment` (`parentId`) e algoritmo no backend para estruturação da árvore hierárquica em memória.
     - **Regra 4 (Avaliação de 1 a 3 estrelas)**: Sistema de avaliação com validação estrita (1, 2 ou 3), cálculo dinâmico de médias e operação atômica de *upsert* impedindo duplicidade através de chave única composta `@@unique([postId, userId])`.
     - **Regra 5 (Perfis públicos)**: Endpoint público irrestrito para perfis de usuário (`GET /users/profile/:username`).
   - Padrões de segurança robustos: senhas com hash seguro `bcryptjs` (salt 10), tokens `JWT` com expiração de 7 dias, middleware `ensureAuthenticated` e wrapper assíncrono `asyncHandler` para captura limpa de erros.

3. **Engenharia de Frontend e Design System Mobile First (`/web`)**:
   - Construção completa em React 18, TypeScript e Vite com container restrito a viewport mobile (`max-w-md`) e barra inferior de navegação ergonômica.
   - Aplicação consistente e fiel da **Paleta Oficial de Cores da DIATINF** (`#CE701B`, `#F1881D`, `#FDC616`, `#F9EBC2`, `#A4BCCC`, `#0C3453`) configurada como tema central no Tailwind CSS.
   - Estado de autenticação global e reativo (`AuthContext`) com persistência em `localStorage` e restauração automática da sessão.
   - Componentes modulares avançados: `StarRating` com avaliação interativa imediata de 1 a 3 estrelas e `CommentItem` recursivo para renderização de árvores de comentários em profundidade arbitrária.

4. **Garantia de Qualidade e Bateria de Testes**:
   - Para assegurar que nenhuma alteração causasse regressões, a IA desenvolveu e executou duas suítes de testes automatizados (`test-auth.ts` e `test-posts.ts`), totalizando **45 asserções automatizadas**, todas validadas com 100% de aprovação.
   - Compilação estrita com TypeScript (`tsc`) no backend e no frontend com zero erros ou advertências.

---

### Execução do projeto

O projeto está estruturado como um monorepo contendo a pasta `/api` (backend RESTful) e a pasta `/web` (frontend React). Para executá-lo no GitHub Codespaces ou em ambiente local, siga os passos abaixo:

#### Pré-requisitos
- Node.js versão 18 ou superior instalada (verifique com `node -v`).
- Gerenciador de pacotes `npm` (verifique com `npm -v`).

---

#### 1. Executando o Backend (`/api`)

Abra um terminal e acesse a pasta da API:
```bash
cd api
```

Instale as dependências:
```bash
npm install
```

Configure as variáveis de ambiente (já criado por padrão, caso necessário copie o `.env.example`):
```bash
cp .env.example .env
```

Sincronize o banco de dados relacional SQLite com o Prisma ORM:
```bash
npx prisma db push
```

Inicie o servidor em modo de desenvolvimento (com recarregamento automático via `tsx`):
```bash
npm run dev
```
> O backend estará em execução em `http://localhost:3333` (com healthcheck disponível em `http://localhost:3333/health`).

---

#### 2. Executando o Frontend (`/web`)

Abra um **segundo terminal** e acesse a pasta do frontend:
```bash
cd web
```

Instale as dependências:
```bash
npm install
```

Inicie o servidor de desenvolvimento Vite:
```bash
npm run dev
```
> O frontend estará em execução em `http://localhost:5173`. No GitHub Codespaces, uma notificação para "Abrir no Navegador" será exibida automaticamente (ou acesse a aba "Ports" / "Portas" e abra a porta 5173).

---

#### 3. Executando os Testes Automatizados

Com o backend configurado, você pode rodar as baterias de testes automatizados para validar todas as regras de negócio:

```bash
cd api
npm run test:auth    # Valida registro, login, tokens JWT e perfis públicos (16 asserções)
npm run test:posts   # Valida posts texto, notas de 1 a 3 estrelas, feed e comentários encadeados (29 asserções)
```

---

#### Vídeo Demonstrativo do Projeto

*(Espaço reservado para o link do vídeo demonstrativo conforme solicitado na descrição da atividade)*:
- **Link do Vídeo**: `[Adicionar link do vídeo gravado aqui]`

---

