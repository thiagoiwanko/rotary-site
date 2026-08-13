# Site — Rotary Club Porto União – União da Vitória

Site estático (HTML/CSS/JS puro), sem dependências de servidor. Cores oficiais do Rotary Brand Center (Royal Blue, Gold, Azure).

## Como alimentar o site (sem mexer em código)

Todo o conteúdo dinâmico vem de 3 arquivos JSON em `assets/data/`. Edite-os com qualquer editor de texto (ou até o Bloco de Notas) e salve — o site atualiza sozinho ao recarregar a página.

### 1. `site-data.json` — dados gerais do clube
Nome, distrito, tema do ano, texto "sobre", estatísticas, e-mail, redes sociais (Instagram/Facebook), diretoria.
- Para o Instagram aparecer no topo do site e no rodapé, preencha `redesSociais.instagram` com a URL completa (ex: `https://instagram.com/seuclube`).
- Para a diretoria, troque `"nome": "A definir"` pelos nomes reais.

### 2. `news.json` — notícias
Cada notícia tem um campo `"fonte"`, que decide em qual aba aparece:
- `"ri"` → aba Rotary International
- `"distrito"` → aba Distrito 4740
- `"clube"` → aba Nosso Clube

Para adicionar uma notícia, copie um bloco `{ ... }` existente, cole antes ou depois, e edite `titulo`, `resumo`, `data` (formato `AAAA-MM-DD`), `url` (link para a notícia completa) e, se tiver, `imagem` (caminho de uma foto).

As notícias já vêm com alguns itens reais, coletados do site atual do clube (rotaryportouniaodavitoria.org.br) e do Rotary International, para o site não começar vazio. Vá substituindo por notícias novas conforme publicar.

### 3. `instagram.json` — carrossel do Instagram
Preencha `"handle"` com o nome de usuário (sem @). Para cada post, coloque a foto em `assets/img/instagram/` e referencie o nome do arquivo em `"imagem"`, mais a `"legenda"` e o `"url"` do post real.

> Importante: uma integração automática que puxa os posts direto do Instagram exige um token de aplicativo Meta (Graph API) — isso envolve credenciais que você mesmo precisa gerar e guardar com segurança nas configurações do Meta for Developers. Por segurança, não mexo em senhas/tokens por você. O carrossel manual acima já entrega o efeito visual completo; se depois quiser automatizar, um desenvolvedor pode plugar a API no lugar do JSON.

## Fotos do clube

Troque a logo em `assets/img/logo.png` se receber uma versão atualizada. Para fotos de reuniões/eventos, crie os arquivos de imagem e referencie-os nos campos `"imagem"` de `news.json` (ex: `assets/img/noticias/foto.jpg`).

## Como publicar (hospedar)

Este é um site 100% estático — funciona em qualquer hospedagem simples:
- **Netlify / Vercel**: arraste a pasta inteira para o painel (gratuito).
- **GitHub Pages**: suba os arquivos num repositório e ative o Pages.
- **Hospedagem cPanel tradicional**: envie a pasta via FTP para `public_html`.

⚠️ Não abra `index.html` direto clicando duas vezes no arquivo (protocolo `file://`) — os JSON não carregam assim por restrição do navegador. Sempre acesse através de um servidor (a própria hospedagem já resolve isso; para testar no seu computador, veja abaixo).

### Testar no seu computador antes de publicar
Com Python instalado, abra o terminal dentro da pasta do site e rode:
```
python -m http.server 8000
```
Depois acesse `http://localhost:8000` no navegador.

## Formulário de contato

O formulário da seção "Contato" hoje abre o app de e-mail do visitante (mailto). Para receber as mensagens direto numa caixa de entrada sem precisar de um servidor próprio, é possível plugar um serviço gratuito como o Formspree (formspree.io) — troca-se a ação do formulário por uma URL fornecida por eles.

## Estrutura de arquivos

```
index.html
assets/
  css/style.css       → todo o visual do site
  js/main.js           → lógica: lê os JSON e monta a página
  data/
    site-data.json      → dados gerais do clube
    news.json            → notícias (RI / Distrito / Clube)
    instagram.json       → carrossel do Instagram
  img/
    logo.png              → logo horizontal completa
    wheel-icon.png         → só a roda dentada (usada como elemento decorativo)
    favicon.png             → ícone da aba do navegador
    instagram/               → fotos do carrossel do Instagram
```
