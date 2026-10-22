-- =====================================================================
-- Seed de teste: itens "complete o código" nas remotas da Dandelion e uma
-- presencial (com materiais) pendurada no primeiro nó. Só roda se a
-- edição ainda não tiver itens.
-- =====================================================================

do $$
declare
  v_edition uuid;
  v_mentor  uuid;
  v_first   uuid;
  v_event   uuid;
  v_item    uuid;
  r         record;
begin
  select id, created_by into v_edition, v_mentor from public.editions where access_code = 'MD2026';
  if v_edition is null or exists (
    select 1 from public.activity_items i
      join public.activities a on a.id = i.activity_id
     where a.edition_id = v_edition
  ) then
    return;
  end if;

  for r in
    select a.id as activity_id, v.pos, v.content::jsonb as content, v.solution::jsonb as solution, v.explanation
      from public.activities a
      join (values
        (1, 1,
         '{"instruction":"Complete o código:","code":"if (idade >= 18) {\n  [[0]]\n}","options":[{"id":"a","text":"adulto = false;"},{"id":"b","text":"adulto = true;"},{"id":"c","text":"idade--;"}]}',
         '{"blanks":["b"]}',
         'Se a idade é 18 ou mais, a pessoa é adulta: adulto recebe true.'),
        (1, 2,
         '{"instruction":"Complete o código para mostrar uma mensagem:","code":"[[0]](\"Olá, mundo!\");","options":[{"id":"a","text":"console.log"},{"id":"b","text":"print.console"},{"id":"c","text":"alert.log"}]}',
         '{"blanks":["a"]}',
         'console.log mostra uma mensagem no console.'),
        (2, 1,
         '{"instruction":"Complete a repetição de 1 a 5:","code":"for (let i = 1; i [[0]] 5; i[[1]]) {\n  console.log(i);\n}","options":[{"id":"a","text":"<="},{"id":"b","text":">="},{"id":"c","text":"++"},{"id":"d","text":"--"}]}',
         '{"blanks":["a","c"]}',
         'i começa em 1, repete enquanto i <= 5 e aumenta de 1 em 1 com ++.'),
        (3, 1,
         '{"instruction":"Complete a condição: as duas precisam ser verdadeiras.","code":"if (temIngresso [[0]] maiorDeIdade) {\n  entrar();\n}","options":[{"id":"a","text":"||"},{"id":"b","text":"&&"},{"id":"c","text":"!"}]}',
         '{"blanks":["b"]}',
         '&& (E) só é verdadeiro quando os dois lados são verdadeiros.')
      ) as v(activity_pos, pos, content, solution, explanation)
        on v.activity_pos = a.position
     where a.edition_id = v_edition and a.kind = 'remota'
  loop
    insert into public.activity_items (activity_id, position, type, content)
    values (r.activity_id, r.pos, 'complete_codigo', r.content)
    returning id into v_item;

    insert into public.activity_item_solutions (item_id, solution, explanation)
    values (v_item, r.solution, r.explanation);
  end loop;

  select id into v_first from public.activities
   where edition_id = v_edition and kind = 'remota' order by position limit 1;
  if v_first is null then
    return;
  end if;

  insert into public.activities (edition_id, kind, parent_id, title, description, starts_at, ends_at, location, points, created_by)
  values (
    v_edition, 'presencial', v_first, 'Oficina de boas-vindas',
    'Primeiro encontro da turma: apresentações e um tour pelo Áster.',
    date_trunc('day', now()) + interval '1 day 14 hours',
    date_trunc('day', now()) + interval '1 day 16 hours',
    'UTFPR-CP, laboratório P-101', 20, v_mentor
  )
  returning id into v_event;

  insert into public.activity_materials (activity_id, position, kind, title, url, body)
  values
    (v_event, 1, 'link', 'Site do Meninas Digitais', 'https://meninas.sbc.org.br/', null),
    (v_event, 2, 'texto', 'Resumo do encontro', null,
     'Hoje conhecemos a turma, combinamos os horários e exploramos a trilha juntas.');
end;
$$;
