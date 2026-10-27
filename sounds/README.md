# Sons do Áster

Efeitos sonoros gerados por síntese, sem samples de terceiros: não há direitos autorais de outras pessoas envolvidos.

Estilo minimalista e moderno, na linha do Duolingo: marimba suave, sinos e sopros de ar. Nada de ondas 8-bit, sirenes ou apitos que deslizam. Os erros são graves e abafados, para avisar sem bronca.

- **Ouvir:** abra `index.html` no navegador.
- **Gerar de novo:** `python3 sounds/generate.py` (precisa do `lame`). As receitas de cada som estão no script.
- **Formato:** MP3 mono, 44,1 kHz, 96 kbps. É o único formato que toca em todos os navegadores, inclusive Safari antigo no iPhone. Total: cerca de 360 KB.

## No app

Os sons em uso foram copiados para `public/sounds/` com nomes curtos (`click.mp3`, `tap.mp3`, `toggle-on.mp3`, `toggle-off.mp3`, `correct.mp3`, `wrong.mp3`, `xp.mp3`, `level-up.mp3`) e tocam pelo `src/components/SoundProvider/SoundProvider.tsx`. Para trocar um som, copie outra variante por cima do arquivo em `public/sounds/`.

Como funciona:

1. Os arquivos ficam em `public/sounds/` (o Next serve tudo de `public/`).
2. Tocam pela Web Audio API (`AudioContext` + `decodeAudioData`), não por `new Audio()`:
    - a Web Audio lê o cabeçalho do MP3 e remove o silêncio que o codificador põe no início, então o som sai na hora do toque;
    - no iPhone, `new Audio()` atrasa e interrompe a música de fundo de outros apps.
3. Respeitar a preferência "Efeitos sonoros" (`user_preferences.sounds_enabled`).
4. No iOS, o `AudioContext` só começa a tocar depois do primeiro toque da usuária na tela.

## Pastas

| Pasta | Uso |
|---|---|
| `click/` | botões e links |
| `tap/` | toque em cards, nós da trilha e itens de lista |
| `toggle/` | switches e seletores (liga e desliga) |
| `success/` | salvo, enviado, deu certo |
| `danger/` | erro, aviso e ações destrutivas |
| `zoom/` | aproximar e afastar |
| `ui/` | notificação, modal, enviar, apagar, teclas do terminal |
| `game/` | resposta certa e errada, XP, ofensiva, atividade liberada, vida, presença, certificado, trilha concluída |
