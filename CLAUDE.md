@AGENTS.md

# Projeto Áster

Web app mobile first de aprendizado gamificado para o projeto de extensão Meninas Digitais UTFPR-CP. Público: meninas com diferentes níveis de familiaridade com tecnologia, então a interface prioriza acessibilidade, linguagem simples e clareza. Mantido por um único desenvolvedor: prefira soluções simples e diretas, sem abstrações ou padrões desnecessários.

## Stack

- Next.js 16 (App Router, `proxy.ts` no lugar de middleware), React 19 com React Compiler, TypeScript
- SCSS modules para estilos. Não usar Tailwind nem estilos inline (exceção: valores dinâmicos, como posições e larguras calculadas)
- Supabase para auth, banco (PostgreSQL), RLS e lógica de dados. Não existe backend separado; não sugerir um
- Ícones: `lucide-react`

## Estrutura

- `src/app/(mentee)/`: área da mentorada (`/trail`, `/terminal`, `/profile`, `/settings/*`)
- `src/app/team/`: área da tutora (`/team/dashboard`, `/team/mentees`, `/team/profile`, `/team/settings`)
- Cada área tem layout, `PanelShell`, navbar e verificação de papel próprios. Componentes de formulário são compartilhados
- `src/components/<Nome>/<Nome>.tsx` + `<Nome>.module.scss`
- `src/utils/`: `menteeData.ts` (`getMenteeData`), `teamData.ts` (`getTeamData`), `mockData.ts`, `mockMode.ts`, `dates.ts`, `getInitials.ts`
- `src/utils/supabase/`: `client.ts`, `server.ts`, `middleware.ts`, `getSupabase.ts`
- `src/types/database.ts`: tipos gerados pelo Supabase. Não editar à mão

## Convenções

- Imports pelo alias `#/` (aponta para `src`)
- Cores: só `src/app/styles/tokens/semantics.css` referencia primitivas (`primitives.css`). Componentes usam apenas as variáveis semânticas (`--color-<escopo>-<propriedade>[-<variante>][-<estado>]`)
- Variáveis de layout (como `--bar-height`) ficam em `globals.css`, não em `semantics.css`
- `<main>` usa as classes globais: `.main-fullscreen` (login, register, not-found), `.main-tabs` (header + navbar), `.main-subpage` (só header)
- Reutilizar antes de criar: `SubmitButton`, `ActionButton` (variantes `neutral`, `danger`, `brand`), `SaveButton`, `Input` (com `help`), `FormTitle`, `FormError`, `PressableBase`, `Modal`/`ConfirmDialog`, `Skeleton`
- Texto só para leitor de tela: classe global `.sr-only`
- Se um estilo ou variável novo for necessário, avisar antes de criar
- Textos da interface em português do Brasil, tratando a usuária no feminino

## Dados

- O app usa somente dados reais do banco. Dados mock só no modo demonstração (`NEXT_PUBLIC_USE_MOCK=true` ou variáveis do Supabase ausentes)
- Dados mock seguem os tipos de `src/types/database.ts`
- No cliente, usar `getSupabase()` (retorna `null` no modo demonstração)
- Nunca expor a service role key no frontend
- Consultas da tutora devem filtrar por `enrollments.mentor_id = auth.uid()`

## Banco (Supabase)

- Toda mudança de schema é uma migration nova em `supabase/migrations/` (`YYYYMMDDHHMMSS_nome.sql`). Nunca editar migration já aplicada
- Autorização via RLS. RPCs `security definer` com `set search_path = ''` e `grant execute` explícito
- Depois de mudar o schema: `npx supabase db push` e regenerar `src/types/database.ts`
- A migration de seed cria contas com senha conhecida: `db push` só em projetos de teste

## Acessibilidade

- Mobile first, contraste adequado, foco visível
- Ícones decorativos com `aria-hidden='true'`; botões só com ícone têm `aria-label`
- Erros de formulário ligados ao campo com `aria-invalid` e `aria-describedby`

## Como editar o código

- Mudanças mínimas: não alterar indentação, estilo de escrita ou código que não faz parte da tarefa
- Não reescrever arquivos inteiros sem necessidade
- Ao depurar: identificar a causa provável e propor a menor mudança que resolve
- Rotas ainda não construídas caem de propósito na página `not-found.tsx`; não criar páginas "Em breve"
- O `height` inline em `(mentee)/terminal/page.tsx` é intencional