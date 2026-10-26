@AGENTS.md

# Projeto Áster

Web app mobile first de aprendizado gamificado para o projeto de extensão Meninas Digitais UTFPR-CP. Público: meninas com diferentes níveis de familiaridade com tecnologia, então a interface prioriza acessibilidade, linguagem simples e clareza. Mantido por um único desenvolvedor: prefira soluções simples e diretas, sem abstrações ou padrões desnecessários.

## Stack

- Next.js 16 (App Router, `proxy.ts` no lugar de middleware), React 19 com React Compiler, TypeScript
- SCSS modules para estilos. Não usar Tailwind nem estilos inline (exceção: valores dinâmicos, como posições e larguras calculadas)
- Supabase para auth, banco (PostgreSQL), RLS e lógica de dados. Não existe backend separado; não sugerir um
- Ícones: `lucide-react`

## Estrutura

- `src/app/(mentee)/`: área da mentorada (`/trail`, `/trail/[activityId]` (minigame ou encontro presencial), `/checkin/[code]` (destino do QR Code), `/terminal`, `/profile`, `/settings/*`)
- `src/app/team/`: área da mentora (`/team/dashboard`, `/team/mentees`, `/team/create` (criador: `[activityId]`, `[activityId]/checkin` com o QR, `novo` para presencial), `/team/profile`, `/team/settings`)
- Configurações das duas áreas: páginas finas que usam os componentes de `src/components/Settings/` (`SettingsPage`, `SettingsMenu`, `PreferencesForm`, `PreferenceSwitches` etc.). Links em `settings/links.ts` de cada área. Exportação de dados: `(mentee)/settings/export/route.ts`
- Cada área tem layout, `PanelShell`, navbar e verificação de papel próprios. Componentes de formulário são compartilhados
- `src/app/error.tsx` e `global-error.tsx`: telas de erro com "Tentar de novo". Neste Next a prop é `retry`, não `reset`. O `error.tsx` fica na raiz porque `getMenteeData`/`getTeamData` rodam nos layouts, e um `error.tsx` não captura erro do layout do próprio segmento
- `USERS.md`: contas de teste (senha e edição de teste); consultar antes de logar para testar
- `src/components/<Nome>/<Nome>.tsx` + `<Nome>.module.scss`
- `src/components/minigames/`: `types.ts` (tipos e registro dos modelos de item), `ActivityPlayer` (fluxo Checar/Continuar/resultado) e uma pasta por modelo com `Player` e `Editor` (hoje só `CompleteCode`). Modelo novo = pasta nova + entrada em `itemTypes` + valor no check de `activity_items.type`
- `src/utils/`: `menteeData.ts` (`getMenteeData`, `buildTrail`), `teamData.ts` (`getTeamData`), `preferences.ts` (`getPreferences`), `appearance.ts` (tema e animações: cookies + script inline do `layout.tsx`), `dashboardData.ts`, `creatorData.ts`, `mockData.ts`, `mockMode.ts`, `dates.ts`, `getInitials.ts`
- `src/utils/supabase/`: `client.ts`, `server.ts`, `middleware.ts`, `getSupabase.ts`
- `src/types/database.ts`: tipos gerados pelo Supabase. Não editar à mão

## Convenções

- Imports pelo alias `#/` (aponta para `src`)
- Cores: só `src/app/styles/tokens/semantics.css` referencia primitivas (`primitives.css`). Componentes usam apenas as variáveis semânticas (`--color-<escopo>-<propriedade>[-<variante>][-<estado>]`)
- Tema escuro: bloco `:root[data-theme='dark']` em `semantics.css`, que redefine as mesmas variáveis. Cor nova precisa do valor claro e do escuro
- Variáveis de layout (como `--bar-height`) ficam em `globals.css`, não em `semantics.css`
- `<main>` usa as classes globais: `.main-fullscreen` (login, register, not-found), `.main-tabs` (header + navbar), `.main-subpage` (só header)
- Reutilizar antes de criar: `Button` (variantes `brand`, `danger`, `neutral`, `outline`; só ícone, texto ou ambos; `fullWidth`), `SubmitButton`, `SaveButton`, `Input` (com `help`), `FormTitle`, `FormError`, `PressableBase`, `Modal`/`ConfirmDialog`, `Skeleton`, `Avatar`, `DataList`, `Tooltip`
- Todo valor que pode vir nulo ou vazio na tela precisa de fallback em texto (ex.: "Sem trilha", "Nenhuma", mensagem de lista vazia). Nunca deixar elemento vazio
- Títulos de modal e textos visíveis usam o primeiro nome com artigo ("Adotar a Helena?"). `aria-label`, `title` e tooltips usam o nome completo
- Texto só para leitor de tela: classe global `.sr-only`
- Se um estilo ou variável novo for necessário, avisar antes de criar
- Textos da interface em português do Brasil, tratando a usuária no feminino

## Dados

- O app usa somente dados reais do banco. Dados mock só no modo demonstração (`NEXT_PUBLIC_USE_MOCK=true` ou variáveis do Supabase ausentes)
- Dados mock seguem os tipos de `src/types/database.ts`
- No cliente, usar `getSupabase()` (retorna `null` no modo demonstração)
- Nunca expor a service role key no frontend
- Listagem de mentoradas (nome, foto, trilha, mentora, XP, ofensiva) é aberta a todas as mentoras. Presenças, reflexões, certificados e andamento são só da mentora responsável, garantido por RLS (`is_mentor_of`); consultas desses dados devem filtrar por `enrollments.mentor_id = auth.uid()`
- Atividades têm `kind`: `remota` (minigame; caminho principal da trilha, ordenado por `position`) ou `presencial` (evento com data; fica ao lado de uma remota via `parent_id` e não bloqueia a trilha). Presença só entra pela RPC `check_in` (QR Code); a mentorada nunca lê `activity_item_solutions`: a correção é a RPC `check_answer`
- XP não é guardado: é a soma da view `xp_entries` (presenças nas presenciais + melhor tentativa de cada remota). Existe o XP da trilha (edição da matrícula ativa) e o total (todas as trilhas); deixar claro qual está na tela. A mentora lê o XP de todas pela RPC `list_mentee_xp`, não por `attendance`

## Banco (Supabase)

- Toda mudança de schema é uma migration nova em `supabase/migrations/` (`YYYYMMDDHHMMSS_nome.sql`). Nunca editar migration já aplicada
- Autorização via RLS. RPCs `security definer` com `set search_path = ''` e `grant execute` explícito
- Leituras de dados detalhados da mentorada usam `is_mentor_of(mentee_id)`, não `get_my_role() = 'mentor'` (que libera para qualquer mentora). Só use o papel quando o dado for de listagem
- Matrículas (`enrollments`) não têm policy de update: só mudam por RPC (`join_edition`, `adopt_mentee`, `release_mentee`, `choose_mentor`). Nova mudança de matrícula = nova RPC
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