![Banner Trilha Meninas Digitais](/.github/images/banner.png)

# Trilha Meninas Digitais

Software desenvolvido para o projeto de extensão [Meninas Digitais UTFPR-CP](https://www.instagram.com/meninasdigitaisutfprcp/), para a disciplina de Certificadora de Competência 3.

<!--
Projeto disponível no [Vercel](https://vercel.com/new).
-->

## Sobre

O programa acompanha mentoradas ao longo de um ciclo: elas se matriculam, participam de atividades, refletem sobre a experiência e evoluem até a certificação final, por meio de uma trilha gamificada.

![Ciclo do App](/.github/images/app_cicle.png)

O software agiliza o processo com uma aplicação única, cobrindo toda a jornada da mentorada.

## Instalação

### Pré-requisitos

- Node.js 20+
- Conta no [Supabase](https://supabase.com)

### 1. Clonar e instalar dependências

```bash
git clone https://github.com/mateusmcamargo/trilha-md.git
cd trilha-md
npm install
```

### 2. Configurar o Supabase

> Se quiser rodar no modo demonstração, basta pular para a etapa 4.

Crie um projeto no [dashboard do Supabase](https://supabase.com/dashboard) e vincule ao repositório local:

```bash
npx supabase login
npx supabase link --project-ref <seu-project-ref>
```

Aplique o schema inicial (tabelas, RLS policies e bucket de avatars):

```bash
npx supabase db push
```

### 3. Variáveis de ambiente

#### 3.1 Modo demonstração (sem Supabase)

Se as variáveis acima não estiverem definidas, ou se `NEXT_PUBLIC_USE_MOCK=true`, o app roda em modo demonstração: o login aceita qualquer e-mail e senha e todas as telas usam os dados de exemplo de `src/app/panel/mockData.ts`, incluindo o usuário. Ideal para apresentações e testes sem internet.

#### 3.2 Banco no Supabase

As chaves ficam em **Settings > API** no dashboard do Supabase.

Crie o arquivo `.env.local` na raiz do projeto com o comando abaixo (substitua os valores entre `<>`):

```bash
echo "NEXT_PUBLIC_SUPABASE_URL=https://<seu-projeto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<sua-anon-key>" > .env.local
```

Ou crie o arquivo manualmente com o conteúdo:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<seu-projeto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<sua-anon-key>
```

> Use apenas a chave pública (`anon`). A `service_role` nunca deve ir para o frontend nem para o repositório.

### 4. Rodar o projeto

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## Stack

- **Frontend:** Next.js, React, TypeScript, SCSS Modules, [lucide-react](https://lucide.dev) (ícones);
- **Backend/dados:** Supabase (Auth, PostgreSQL, Row Level Security).

## Estrutura

```
src/
├── app/
│   ├── login/            # login (Supabase Auth)
│   ├── mentor/           # área da tutora
│   ├── panel/
│   │   ├── (tabs)/       # trilha, terminal e perfil (com a Navbar)
│   │   ├── settings/     # configurações (sem a Navbar)
│   │   └── mockData.ts   # dados mockados, a serem trocados pelo Supabase
│   └── styles/           # globals.css e tokens de cor
├── components/           # componentes reutilizáveis, cada um com seu .module.scss
└── utils/                # funções utilitárias
```

## Convenções

- **Imports:** `#/` aponta para `src/` e `@/` para a raiz do projeto;
- **Estilos:** SCSS Modules, mobile-first. As cores vêm das variáveis semânticas (`tokens/semantics.css`), e só ele referencia as cores primitivas;
- **Acessibilidade:** foco visível em todos os elementos interativos, `prefers-reduced-motion` respeitado, `rem` com base em `62.5%` (respeita a fonte do usuário) e a classe global `.sr-only` para texto exclusivo de leitores de tela;
- **Arquivos `.css` e `.css.map`** gerados pelo compilador de SASS do editor não são versionados.

## Modelo de dados

![Modelo de dados](/.github/images/initial_schema.png)

## Equipe

- Mateus de Melo Camargo: Full-Stack Developer
- Gabriel Almeida Oliveira: QA e Product Owner
