# Trilha MD

Software desenvolvido para o projeto de extensão [Meninas Digitais UTFPR-CP](https://www.instagram.com/meninasdigitaisutfprcp/), para a disciplina de Certificadora de Competência 3.

Projeto disponível no [Vercel](https://vercel.com/new),

## Sobre

O programa acompanha mentoradas ao longo de um ciclo: elas se matriculam, participam de atividades, refletem sobre a experiência e evoluem até a certificação final.

![Ciclo do App](/.github/images/app_cicle.png)

O software agiliza o processo com uma aplicação única, cobrindo toda a jornada da mentorada.

## Instalação

### Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com)

### 1. Clonar e instalar dependências

```bash
git clone https://github.com/mateusmcamargo/trilha-md.git
cd trilha-md
npm install
```

### 2. Configurar o Supabase

Crie um projeto no [dashboard do Supabase](https://supabase.com/dashboard) e vincule ao repositório local:

```bash
supabase login
supabase link --project-ref <seu-project-ref>
```

Aplique o schema inicial (tabelas, RLS policies e bucket de avatars):

```bash
supabase db push
```

### 3. Variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<seu-projeto>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<sua-anon-key>
```

As chaves ficam em **Settings > API** no dashboard do Supabase.

### 4. Rodar o projeto

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) no navegador.

## Stack

- **Frontend:** Next.js, React, TypeScript, SCSS Modules;
- **Backend/dados:** Supabase (Auth, PostgreSQL, Row Level Security).

## Modelo de dados

![Ciclo do App](/.github/images/app_cicle.png)

## Equipe

- Mateus de Melo Camargo: Full-Stack Developer
- Gabriel Almeida Oliveira: QA e Product Owner