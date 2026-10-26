![Banner do Projeto Áster](/.github/images/banner.png)

Web app mobile first de aprendizado gamificado em parceria com o projeto [Meninas Digitais UTFPR-CP](https://www.instagram.com/meninasdigitaisutfprcp/), para a disciplina de Certificadora da Competência 3.

<!--
Projeto disponível no [Vercel](https://vercel.com/new).
-->

## Sobre

O programa acompanha mentoradas ao longo de um ciclo: elas se matriculam, participam de atividades, questionários e minigames, refletem sobre a experiência e evoluem até a certificação final, por meio de uma trilha gamificada.

![Fluxograma do Ciclo do App](/.github/images/app_cicle.png)

O software agiliza o processo com uma aplicação única com foco em acessibilidade, cobrindo toda a jornada da mentorada e fornecendo ferramentas de acompanhamento individualizado para as mentoras.

## Funcionalidades desenvolvidas

- Login e logout com Supabase Auth, com redirecionamento por perfil (mentorada ou mentora)
- Cadastro em `/register`, com matrícula na trilha pelo código de acesso
- Entrada em uma trilha pelo código de acesso, para quem ainda não tem matrícula
- Painel da mentorada: trilha, terminal, perfil e configurações
- Trilha com o minigame "Complete o código" e encontros presenciais com materiais e data
- Presença nos encontros confirmada pela leitura do QR Code
- Escolha da mentora pela mentorada, no perfil, quando a matrícula ainda não tem mentora
- Configurações da mentorada:
    - edição do perfil, exportação dos dados (JSON) e desativação da conta
    - notificações e privacidade (aparecer na busca, mostrar o XP para amigas)
    - lista das trilhas em que entrou
    - contato com a mentora, o projeto e o desenvolvedor
    - denúncia de abuso, lida por todas as mentoras
    - páginas sobre o projeto, o app e os dados guardados
- Área da mentora em `/team`:
    - lista de mentoradas em `/team/mentees`, com adoção e cancelamento de adoção
    - dashboard com o acompanhamento individual de cada mentorada
    - criador de atividades: minigames, encontros presenciais, materiais e QR Code de presença
    - configurações em `/team/settings`: perfil, preferências, denúncias de abuso, contatos e páginas sobre
- Preferências: sons, animações e tema claro, escuro ou do sistema, aplicados antes da página aparecer
- App instalável no celular (PWA)
- Skeletons de carregamento em todas as telas que buscam dados
- Modo demonstração com dados mockados, com uma chave para visualizar os skeletons
- Banco PostgreSQL com Row Level Security
- Tela de erro com botão "Tentar de novo" e página 404 personalizada.

## Instalação

### Pré-requisitos

- Node.js 20+
- Conta no [Supabase](https://supabase.com) (exceto para o modo de demonstração)

### 1. Clonar e instalar dependências

```bash
git clone https://github.com/mateusmcamargo/trilha-md.git
cd trilha-md
npm install
```

### 2. Configurar o Supabase

> Se quiser rodar no modo demonstração, basta pular para a [Etapa 4](#4-rodar-o-projeto).

Crie um projeto no [dashboard do Supabase](https://supabase.com/dashboard) e vincule ao repositório local:

```bash
npx supabase login
npx supabase link --project-ref <seu-project-ref>
```

Aplique as migrations. Além das tabelas, elas já criam as [contas de teste](#contas-de-acesso-padrão) e a edição `Dandelion` com as atividades da trilha:

```bash
npx supabase db push
```

> Para o login funcionar sem confirmação por e-mail, desative **Confirm email** em
> **Authentication > Sign In / Providers > Email**, no dashboard.

### 3. Variáveis de ambiente

#### 3.1 Modo demonstração (sem Supabase)

Se o `.env.local` não existir, ou se `NEXT_PUBLIC_USE_MOCK=true`, o app roda em modo demonstração:

O login aceita qualquer e-mail e senha e todas as telas usam os dados de exemplo de `src/utils/mockData.ts`, incluindo o usuário. Ideal para apresentações e testes sem internet.

#### 3.2 Banco no Supabase

As chaves ficam em **Settings > API** no dashboard do Supabase.

Crie o arquivo `.env.local` na raiz do projeto com o comando (substitua os valores entre `<>`):

```bash
echo "NEXT_PUBLIC_SUPABASE_URL=https://<seu-projeto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<sua-anon-key>" > .env.local
```

Ou crie o arquivo manualmente com o conteúdo:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<seu-projeto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<sua-anon-key>
```

> **ATENÇÃO:** Use apenas a chave pública `anon`. A `service_role` nunca deve ir para o frontend nem para o repositório.

### 4. Rodar o projeto

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

<!--
## Vídeo de instalação e execução

[link do YouTube]
-->

## Como testar

**Modo demonstração:** faça login com qualquer e-mail e senha.
**Entrar** abre a trilha da mentorada e **Entrar como mentora** abre a área da mentora em `/team`.

**Com Supabase:**

1. Entre com uma das contas padrão abaixo ou crie uma em `/register`, usando o código de acesso da edição de teste.
2. Como mentorada: abra a trilha e navegue pelos nós, depois o perfil e as configurações.
3. Como mentora: o login abre o painel em `/team/dashboard`. Em `/team/mentees`, adote uma mentorada sem mentora e depois cancele a adoção.
4. Como mentorada sem mentora (ex.: Rebeca): no perfil, aba **Mentoras**, use **Escolher mentora**.
5. Faça logout.

### Contas de acesso padrão

Criadas pelo `db push` (migrations `seed_default_users` e `seed_more_users`). A lista completa, com todas as contas, está em [USERS.md](USERS.md).

| Perfil    | Nome           | Usuário     | E-mail                    | Senha  |
|-----------|----------------|-------------|---------------------------|--------|
| Mentora   | Maria da Silva | maria       | maria@meninasdigitais.com | 123456 |
| Mentorada | Anne Franco    | anne07franco| anne@meninasdigitais.com  | 123456 |

Código de acesso da edição de teste (`Dandelion`): `MD2026`

> **ATENÇÃO:** essas contas têm senha conhecida. Use o `db push` apenas em projetos de teste.

## Acesso das mentoras aos dados

| Dado | Qualquer mentora | Só a mentora responsável |
|------|-----------------|-------------------------|
| Nome, usuário, foto, trilha, mentora, XP e ofensiva | Sim | Sim |
| Presenças, reflexões, certificados e andamento | Não | Sim |

- A "mentora responsável" é a que adotou a mentorada (`enrollments.mentor_id`). Isso é garantido por Row Level Security, não só pelas telas.
- O XP de todas as mentoradas vem da função `list_mentee_xp`, que devolve só o total por trilha, sem expor as presenças.
- Matrículas só mudam por funções do banco: entrar na trilha, adotar, cancelar adoção e escolher mentora.

## Estilização

![Paleta de cores](/.github/images/pallette.png)

## Stack

- **Frontend:** Next.js | React | TypeScript | SCSS Modules | Lucide Icons;
- **Backend e dados:** Supabase (Auth, PostgreSQL, Row Level Security).

## Ferramentas e versões

| Ferramenta                   | Versão         | Link                                 |
|------------------------------|----------------|--------------------------------------|
| Node.js                      | 20+            | https://nodejs.org                   |
| Next.js                      | 16.3.5         | https://nextjs.org                   |
| React                        | 19.2.8         | https://react.dev                    |
| TypeScript                   | 5              | https://www.typescriptlang.org       |
| Sass                         | 1.105.1        | https://sass-lang.com                |
| lucide-react                 | 1.47.0         | https://lucide.dev                   |
| Supabase (Auth + PostgreSQL) | plano gratuito | https://supabase.com                 |
| Supabase CLI                 | 2.121.0        | https://supabase.com/docs/guides/cli |

As demais dependências e suas versões estão no `package.json`.

## Equipe

| Membro                   | Cargo                |
|--------------------------|----------------------|
| Mateus de Melo Camargo   | Full-Stack Developer |
| Gabriel Almeida Oliveira | QA e Product Owner   |

## Modelo de dados

![Modelo de dados](/.github/images/schema-v3.png)

## Estrutura

```
public/                   # arquivos públicos de recurso

src/
├── app/
│   ├── (mentee)/         # área da mentorada (route group, não entra na URL)
│   │   ├── trail/        # trilha, ou entrada por código se não houver matrícula
│   │   ├── terminal/     # terminal de código
│   │   ├── profile/      # perfil
│   │   └── settings/     # configurações (sem a Navbar)
│   ├── team/             # área da mentora (/team, /team/dashboard, /team/mentees)
│   ├── login/            # login (Supabase Auth)
│   ├── register/         # cadastro (Supabase Auth)
│   ├── styles/           # globals.css, tokens de cor e semantics.css
│   ├── page.tsx          # redireciona para /trail
│   ├── error.tsx         # tela de erro com "Tentar de novo"
│   ├── global-error.tsx  # o mesmo, para erro no layout raiz
│   └── not-found.tsx     # página 404 (rotas ainda não construídas caem aqui)
├── components/           # componentes reutilizáveis, cada um com seu .module.scss
├── types/
│   └── database.ts       # tipos gerados pelo Supabase (schema v3)
├── utils/
│   ├── supabase/         # client.ts, server.ts, middleware.ts (sessão) e getSupabase.ts
│   ├── menteeData.ts     # dados da área da mentorada
│   ├── teamData.ts       # dados da área da mentora
│   ├── mockData.ts       # dados mockados, usados só no modo demonstração
│   └── mockMode.ts       # liga o modo demonstração
└── proxy.ts              # renova a sessão do Supabase a cada requisição

supabase/
└── migrations/           # schema do banco (rodar em ordem com `supabase db push`)
```

## Convenções

- **Imports:** `#/` aponta para `src/` e `@/` para a raiz do projeto;
- **Estilos:** SCSS Modules, mobile-first. As cores vêm das variáveis semânticas (`tokens/semantics.css`), e só ele referencia as cores primitivas;
- **Acessibilidade:** foco visível em todos os elementos interativos, `prefers-reduced-motion` respeitado, `rem` com base em `62.5%` (respeita a fonte do usuário) e a classe global `.sr-only` para texto exclusivo de leitores de tela;
- **Arquivos `.css` e `.css.map`** gerados pelo compilador de SASS do editor não são versionados.

## Artigos Base

[The Science Behind Duolingo's Home Screen Redesign](https://blog.duolingo.com/new-duolingo-home-screen-design/)\
[The Duolingo Learning Path – What It Is, How It Works](https://duoplanet.com/duolingo-learning-path/)