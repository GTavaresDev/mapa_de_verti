Sistema de Navegação Primitivo - AED2
Este projeto é uma aplicação web interativa desenvolvida para a disciplina de Algoritmos e Estruturas de Dados II, que implementa o algoritmo de Dijkstra para encontrar o menor caminho entre dois pontos em um grafo.

A aplicação permite a criação e edição dinâmica de um grafo, seleção de pontos de origem e destino, e o cálculo da rota mais curta, exibindo estatísticas detalhadas sobre a execução do algoritmo.

Como Executar o Projeto
A aplicação é um único arquivo HTML que contém todo o código necessário (HTML, CSS e JavaScript). Para executá-la, você precisa apenas de um editor de código (como o VS Code) e um navegador de internet.

Usando a Extensão "Live Server" ou "Show Preview" (Recomendado)
A forma mais fácil de rodar o projeto é utilizando uma extensão de preview ao vivo no seu editor de código.

Salve o Código: Salve o código da aplicação em um arquivo com a extensão .html (por exemplo, index.html).

Instale a Extensão:

No VS Code, vá até a aba de Extensões e procure por "Live Server". Instale-a.

Editores como o Cursor ou outros baseados no VS Code geralmente possuem uma funcionalidade similar de "preview".

Inicie o Preview:

Com Live Server: Clique com o botão direito no arquivo index.html e selecione "Open with Live Server". Isso abrirá o projeto no seu navegador. A página será atualizada automaticamente sempre que você salvar o arquivo.

Com Show Preview: Em muitos editores, você pode abrir a paleta de comandos (Ctrl+Shift+P) e procurar por "Show Preview" ou clicar em um ícone de preview no canto superior direito do editor. Isso abrirá uma aba com a visualização da aplicação diretamente dentro do editor.

Funcionalidades da Aplicação
A interface é dividida em um painel de controle à esquerda e uma área de desenho (canvas) à direita.

Painel de Controle
Modo de Edição
Adicionar Vértice: Modo padrão. Clique em qualquer lugar do canvas para criar um novo vértice (ponto).

Adicionar Aresta: Ative este modo e clique em dois vértices para criar uma aresta (conexão) entre eles. A distância (peso) é calculada automaticamente.

Seleção de Rota
Selecionar Origem: Ative este modo e clique em um vértice para marcá-lo como o ponto de partida (ficará verde).

Selecionar Destino: Ative este modo e clique em um vértice para marcá-lo como o ponto de chegada (ficará vermelho).

Ações
Calcular Menor Caminho: Após selecionar uma origem e um destino, clique neste botão para executar o algoritmo de Dijkstra. A rota mais curta será destacada em amarelo.

Baixar Imagem: Clica neste botão para fazer o download de uma imagem .png do estado atual do grafo no canvas.

Limpar Tudo: Apaga todos os vértices e arestas do canvas e reseta a aplicação.

Caixas de Informação
Status: Mostra instruções sobre o modo atual ou feedback sobre a última ação realizada.

Resultado: Exibe as estatísticas detalhadas após o cálculo da rota, incluindo distância total, nós no caminho, nós explorados e tempo de execução.

Tecnologias Utilizadas
HTML5: Estrutura da página.

CSS3: Estilização e design responsivo.

JavaScript (ES6+): Lógica da aplicação, manipulação do canvas e implementação do algoritmo de Dijkstra.