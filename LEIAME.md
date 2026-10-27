# Site LPDB — primeira etapa

Site estático (HTML + CSS + JavaScript puro). Sem login, banco de dados, carrinho ou pagamento.
Funciona em qualquer hospedagem estática (Netlify, Vercel, GitHub Pages, Cloudflare Pages, Hostinger etc.).

## Como visualizar
Abra `index.html` no navegador (duplo clique). Para ver como no ar: `python3 -m http.server` na pasta e acesse http://localhost:8000.
As fontes (Archivo e Inter) são carregadas do Google Fonts; é preciso estar online para vê-las.

## Arquivos
- `index.html` — página única: início, catálogo, sobre, novidades, localização, rodapé.
- `produto.html` — página de detalhe (recebe `?id=`). Sem id válido mostra apenas a estrutura de pré-visualização.
- `css/style.css`, `js/app.js` — estilo e lógica.
- `data/config.js` — links oficiais, WhatsApp da loja, endereço e mapa.
- `data/produtos.js` — catálogo (vazio; nenhum produto foi inventado).
- `img/brand` — logos (recorte/conversão apenas, sem alterar o desenho), favicon e imagem de compartilhamento.
- `img/hero` — fotos de destaque da página inicial, convertidas para WebP.
- `img/produtos/` — fotos do catálogo (46 modelos, 818 fotos, em 3 tamanhos WebP cada).
- `tools/processar_fotos.py` — gera os tamanhos e o `data/produtos.js` a partir de uma pasta com um subdiretório por modelo.

## Como cadastrar um produto (próximas etapas)
Em `data/produtos.js`, acrescente um objeto com apenas os campos disponíveis (veja o exemplo no próprio arquivo).
Fotos: `fotos: ["modelo-x/01"]` lê `img/produtos/modelo-x/01-480.webp`, `-960.webp` e `-1600.webp`.
As versões redimensionadas (480/960/1600 px) já foram geradas a partir dos WebP originais e conferidas (todos os arquivos existem).

## WhatsApp da loja
Informe `whatsappLoja.numero` em `data/config.js` (ex.: "5592999999999"). Cada produto passa a abrir a conversa com mensagem
automática contendo nome e código. Enquanto estiver vazio, os botões avisam que o contato estará disponível em breve.
