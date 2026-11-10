# Noir Motors

Site Noir Motors, com hero NM-01 e seção de coleção baseados nas referências visuais fornecidas. A abertura exibe a marca centralizada e uma porcentagem vinculada ao preparo das imagens do hero e fontes; depois revela o hero em sequência. O projeto será construído seção por seção.

## Executar

Com Node.js instalado, execute `npm run dev` e abra http://localhost:3000. Não é necessário instalar dependências.

`npm run check` verifica a sintaxe do servidor local e do script de abertura.

Os arquivos `index.html`, `styles.css`, `script.js` e `assets/` podem ser hospedados em qualquer servidor estático. As fontes Bodoni Moda e Manrope são carregadas pelo Google Fonts, com alternativas locais. A animação respeita a preferência por movimento reduzido e inclui um limite de espera; sem JavaScript, o hero é exibido diretamente.

O menu Models leva à coleção com Porsche 911 Carrera e Mercedes-AMG GT. Os botões dos cards abrem os detalhes visuais, e Explore all vehicles abre a visão completa dos dois modelos. As imagens da coleção são carregadas sob demanda e não bloqueiam a abertura. A seção adapta os cards para uma coluna no celular.

Nos cards, `collection-studio-empty.png` é o cenário fixo e `collection-cars-cutout.png` contém os carros com transparência, incluindo reflexos. Ao chegar à seção, os carros entram pelas laterais uma vez. Título, cenário e cards permanecem parados. Com movimento reduzido ou sem JavaScript, os carros aparecem diretamente na posição final.

Os demais itens do menu e o botão de test drive permanecem apenas visuais até a implementação das próximas etapas.

As logos SVG fornecidas ficam em `assets/noir-motors-logo.svg` e `assets/noir-motors-symbol.svg`. O header e o preloader usam uma variante da logo completa com o viewBox ajustado às margens do desenho, preservando os paths originais. O hero também usa cenário e carro separados (`hero-studio-empty.png` e `hero-car-cutout.png`), com a entrada do carro sincronizada ao encerramento do preloader.

Os quatro takes enviados ficam em `assets/nm01-take-*.png`. O quadro menor alterna as imagens a cada 5,5 segundos; o hero alterna as vistas lateral e frontal com a composição original a cada 11 segundos. A sequência inicia após a abertura, possui pausa manual, pausa fora da tela/aba e não inicia automaticamente com movimento reduzido. As imagens de takes posteriores não bloqueiam o preloader.

## Capítulos editoriais

Após a coleção, o fundo escuro termina em cantos arredondados sobre um capítulo marfim com cards de experiência. A seção de performance apresenta um cupê conceito perolado com três pontos interativos para explorar recortes e textos de design. O capítulo da marca combina um retrato feminino editorial e a visão da direção Noir Motors. Os links Design, Performance e The Brand no header levam a essas seções.

As três imagens novas (`noir-blue-editorial.png`, `noir-pearl-profile.png`, `noir-direction-portrait.png`) são geradas para o projeto. O retrato representa uma personagem editorial fictícia, sem nome ou biografia real; os carros dessas imagens são conceitos, sem especificações comerciais atribuídas. As novas imagens carregam sob demanda e não bloqueiam o preloader.

O destaque perolado usa `pearl-studio-empty.png` e `pearl-car-cutout.png`: cenário fixo, entrada lateral do carro e liberação dos pontos após a chegada. Sua moldura tem cantos arredondados sobre o fundo marfim. A foto da direção revela a imagem do centro para as bordas superior e inferior; o gatilho observa a moldura para que a imagem recortada não impeça a detecção de entrada na tela.

## Rolagem

Lenis 1.3.27 é servido localmente por `assets/vendor/lenis/`, com versão fixada no npm e licença MIT preservada. `npm install` sincroniza os arquivos pelo script `scripts/sync-lenis.js`. O site pronto continua executando sem build.

A integração usa RAF automático, âncoras, suavização da roda do mouse e toque nativo. Pausa durante a abertura e enquanto um diálogo estiver aberto, libera a rolagem nativa dentro dos diálogos e respeita a preferência por movimento reduzido. O `scroll-behavior` CSS permanece em `auto` para evitar duas suavizações simultâneas.

## Footer

O rodapé escuro entra sobre o fundo marfim com cantos superiores arredondados. Combina foto editorial, três colunas de links para as seções existentes, ano automático, retorno ao topo via Lenis e a marca NOIR em grande na base. O conteúdo tem entrada ao rolar e se reorganiza no celular. Nenhum contato ou perfil social fictício é usado.
