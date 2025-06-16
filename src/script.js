// --- ELEMENTOS DA UI ---
const canvas = document.getElementById('graphCanvas');
const ctx = canvas.getContext('2d');
const canvasContainer = document.querySelector('.canvas-container');
const modoAdicionarVerticeBtn = document.getElementById('modoAdicionarVerticeBtn');
const modoAdicionarArestaBtn = document.getElementById('modoAdicionarArestaBtn');
const modoRemoverVerticeBtn = document.getElementById('modoRemoverVerticeBtn');
const modoRemoverArestaBtn = document.getElementById('modoRemoverArestaBtn');
const modoSelecionarOrigemBtn = document.getElementById('modoSelecionarOrigemBtn');
const modoSelecionarDestinoBtn = document.getElementById('modoSelecionarDestinoBtn');
const gerarGrafoBtn = document.getElementById('gerarGrafoBtn');
const calcularRotaBtn = document.getElementById('calcularRotaBtn');
const baixarImagemBtn = document.getElementById('baixarImagemBtn');
const modoNoturnoBtn = document.getElementById('modoNoturnoBtn');
const limparBtn = document.getElementById('limparBtn');
const statusInfo = document.getElementById('status-info');
const resultadoInfo = document.getElementById('resultado-info');

// --- ESTADO DA APLICAÇÃO ---
let modoAtual = 'adicionar_vertice';
let primeiroVerticeSelecionado = null;
let verticeOrigem = null;
let verticeDestino = null;
let caminhoCalculado = [];
let modoNoturnoAtivo = false;

// --- CLASSE FILA DE PRIORIDADE ---
class PriorityQueue {
    constructor() { this.values = []; }
    enqueue(value, priority) { this.values.push({ value, priority }); this.sort(); }
    dequeue() { return this.values.shift(); }
    sort() { this.values.sort((a, b) => a.priority - b.priority); }
    isEmpty() { return this.values.length === 0; }
}

// --- LÓGICA DO GRAFO (BACKEND) ---
class Grafo {
    constructor() { this.vertices = {}; this.proximo_id = 0; }

    adicionarVertice(x, y) {
        const verticeId = this.proximo_id;
        this.vertices[verticeId] = { id: verticeId, coords: { x, y }, edges: {} };
        this.proximo_id++;
        return this.vertices[verticeId];
    }

    adicionarAresta(u, v) {
        if (!u || !v || u.id === v.id || this.vertices[u.id].edges[v.id]) return;
        const dx = u.coords.x - v.coords.x;
        const dy = u.coords.y - v.coords.y;
        const peso = Math.round(Math.sqrt(dx * dx + dy * dy));
        this.vertices[u.id].edges[v.id] = peso;
        this.vertices[v.id].edges[u.id] = peso; // Não-direcionado
    }
    
    removerVertice(verticeId) {
        delete this.vertices[verticeId];
        for (const id in this.vertices) {
            if (this.vertices[id].edges[verticeId]) {
                delete this.vertices[id].edges[verticeId];
            }
        }
    }

    removerAresta(u, v) {
        if (this.vertices[u.id] && this.vertices[u.id].edges[v.id]) {
            delete this.vertices[u.id].edges[v.id];
        }
        if (this.vertices[v.id] && this.vertices[v.id].edges[u.id]) {
            delete this.vertices[v.id].edges[u.id];
        }
    }
    
    getVerticeEm(x, y) {
        for (const id in this.vertices) {
            const v = this.vertices[id];
            const dx = x - v.coords.x, dy = y - v.coords.y;
            if (Math.sqrt(dx * dx + dy * dy) < VERTEX_RADIUS) return v;
        }
        return null;
    }

    limpar() {
        this.vertices = {}; this.proximo_id = 0;
    }
    
    dijkstra(origemId, destinoId) {
        const fila = new PriorityQueue();
        const distancias = {};
        const predecessores = {};
        let caminho = [];
        let nosExplorados = 0;

        for (const verticeId in this.vertices) {
            distancias[verticeId] = Infinity;
            predecessores[verticeId] = null;
        }

        if (this.vertices[origemId] === undefined) {
            return { distancia: Infinity, caminho: [], nosExplorados: 0};
        }

        distancias[origemId] = 0;
        fila.enqueue(origemId, 0);

        while (!fila.isEmpty()) {
            let verticeAtualId = fila.dequeue().value;
            nosExplorados++;
            
            if (verticeAtualId == destinoId) {
                let atual = destinoId;
                while(atual !== null){
                    caminho.unshift(atual);
                    atual = predecessores[atual];
                }
                break;
            }

            if (this.vertices[verticeAtualId] && distancias[verticeAtualId] !== Infinity) {
                for (const vizinhoId in this.vertices[verticeAtualId].edges) {
                    let distanciaCandidata = distancias[verticeAtualId] + this.vertices[verticeAtualId].edges[vizinhoId];
                    if (distanciaCandidata < distancias[vizinhoId]) {
                        distancias[vizinhoId] = distanciaCandidata;
                        predecessores[vizinhoId] = verticeAtualId;
                        fila.enqueue(vizinhoId, distanciaCandidata);
                    }
                }
            }
        }
        
        return {
            distancia: distancias[destinoId],
            caminho: caminho,
            nosExplorados: nosExplorados
        };
    }
}

const grafo = new Grafo();
const VERTEX_RADIUS = 12;
const FONT_STYLE = "bold 11px Arial";

function desenharGrafoCompleto() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const caminhoSet = new Set(caminhoCalculado.map((v, i) => {
        if (i < caminhoCalculado.length - 1) return `${v}-${caminhoCalculado[i+1]}`;
    }));

    for (const id in grafo.vertices) {
        const vertice = grafo.vertices[id];
        for (const vizinhoId in vertice.edges) {
            const arestaNormal = `${id}-${vizinhoId}`;
            const arestaInvertida = `${vizinhoId}-${id}`;
            if (vizinhoId > id) {
                 desenharAresta(vertice, grafo.vertices[vizinhoId], caminhoSet.has(arestaNormal) || caminhoSet.has(arestaInvertida));
            }
        }
    }

    for (const id in grafo.vertices) {
        desenharVertice(grafo.vertices[id]);
    }
}

function desenharVertice(vertice) {
    const { x, y } = vertice.coords;
    ctx.beginPath();
    ctx.arc(x, y, VERTEX_RADIUS, 0, 2 * Math.PI);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue(
        (verticeOrigem && vertice.id === verticeOrigem.id) ? '--cor-vertice-origem' :
        (verticeDestino && vertice.id === verticeDestino.id) ? '--cor-vertice-destino' :
        '--cor-vertice'
    );
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();
    
    ctx.font = FONT_STYLE;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(vertice.id, x, y);
}

function desenharAresta(u, v, fazParteDoCaminho) {
    const peso = u.edges[v.id];
    ctx.beginPath();
    ctx.moveTo(u.coords.x, u.coords.y);
    ctx.lineTo(v.coords.x, v.coords.y);
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue(
        fazParteDoCaminho ? '--cor-aresta-caminho' : '--cor-aresta'
    );
    ctx.lineWidth = fazParteDoCaminho ? 5 : 3;
    ctx.stroke();
    const midX = (u.coords.x + v.coords.x) / 2, midY = (u.coords.y + v.coords.y) / 2;
    const text = peso.toString();
    const textWidth = ctx.measureText(text).width;
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--cor-aresta-fundo-texto');
    ctx.fillRect(midX - textWidth / 2 - 4, midY - 12, textWidth + 8, 16);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--cor-aresta-texto');
    ctx.font = "bold 12px Arial";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, midX, midY - 3);
}

function eventoCliqueCanvas(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left, y = event.clientY - rect.top;
    const verticeClicado = grafo.getVerticeEm(x, y);

    switch(modoAtual) {
        case 'adicionar_vertice': if (!verticeClicado) grafo.adicionarVertice(x, y); break;
        case 'adicionar_aresta':
        case 'remover_aresta':
            if (verticeClicado) {
                if (!primeiroVerticeSelecionado) {
                    primeiroVerticeSelecionado = verticeClicado;
                    atualizarStatus(`Vértice ${verticeClicado.id} selecionado. Clique no segundo.`);
                } else {
                    if (modoAtual === 'adicionar_aresta') {
                        grafo.adicionarAresta(primeiroVerticeSelecionado, verticeClicado);
                        atualizarStatus('Aresta adicionada.');
                    } else {
                        grafo.removerAresta(primeiroVerticeSelecionado, verticeClicado);
                        atualizarStatus('Aresta removida.');
                    }
                    primeiroVerticeSelecionado = null;
                }
            }
            break;
        case 'remover_vertice':
            if(verticeClicado){
                if(verticeOrigem && verticeOrigem.id === verticeClicado.id) verticeOrigem = null;
                if(verticeDestino && verticeDestino.id === verticeClicado.id) verticeDestino = null;
                
                grafo.removerVertice(verticeClicado.id);
                atualizarStatus(`Vértice ${verticeClicado.id} e suas arestas foram removidos.`);
            }
            break;
        case 'selecionar_origem':
            if (verticeClicado) {
                if (verticeOrigem && verticeOrigem.id === verticeClicado.id) {
                    verticeOrigem = null;
                    atualizarStatus('Seleção de ORIGEM removida.');
                } else {
                    verticeOrigem = verticeClicado;
                    atualizarStatus(`Vértice ${verticeClicado.id} definido como ORIGEM.`);
                }
            }
            break;
        case 'selecionar_destino':
            if (verticeClicado) {
                 if (verticeDestino && verticeDestino.id === verticeClicado.id) {
                    verticeDestino = null;
                    atualizarStatus('Seleção de DESTINO removida.');
                } else {
                    verticeDestino = verticeClicado;
                    atualizarStatus(`Vértice ${verticeClicado.id} definido como DESTINO.`);
                }
            }
            break;
    }
    desenharGrafoCompleto();
}

function mudarModo(novoModo) {
    modoAtual = novoModo;
    primeiroVerticeSelecionado = null; // Reseta seleção ao mudar de modo
    
    const botoes = document.querySelectorAll('.control-group button');
    botoes.forEach(b => b.classList.remove('active'));
    
    const mapaModoBotao = {
        'adicionar_vertice': modoAdicionarVerticeBtn, 'adicionar_aresta': modoAdicionarArestaBtn,
        'remover_vertice': modoRemoverVerticeBtn, 'remover_aresta': modoRemoverArestaBtn,
        'selecionar_origem': modoSelecionarOrigemBtn, 'selecionar_destino': modoSelecionarDestinoBtn
    };
    if(mapaModoBotao[novoModo]) {
         mapaModoBotao[novoModo].classList.add('active');
    }
    
    const textos = {
        'adicionar_vertice': 'Clique para adicionar um vértice.',
        'adicionar_aresta': 'Clique em 2 vértices para criar uma aresta.',
        'remover_vertice': 'Clique em um vértice para removê-lo.',
        'remover_aresta': 'Clique nos 2 vértices da aresta a ser removida.',
        'selecionar_origem': 'Clique em um vértice para ser a ORIGEM.',
        'selecionar_destino': 'Clique em um vértice para ser o DESTINO.'
    };
    atualizarStatus(textos[novoModo]);
}

function atualizarStatus(mensagem) { statusInfo.innerHTML = mensagem; }

function calcularRota() {
    if (!verticeOrigem || !verticeDestino) {
        atualizarStatus("ERRO: Selecione um vértice de ORIGEM e um de DESTINO.");
        return;
    }
    const t0 = performance.now();
    const resultado = grafo.dijkstra(verticeOrigem.id, verticeDestino.id);
    const t1 = performance.now();
    const tempo = (t1-t0).toFixed(2);
    if (resultado.distancia === Infinity || !resultado.caminho.length) {
        resultadoInfo.innerHTML = "Não foi possível encontrar um caminho.";
        caminhoCalculado = [];
    } else {
        resultadoInfo.innerHTML = `
            <strong>Distância (Custo):</strong> ${resultado.distancia}<br>
            <strong>Nós no caminho:</strong> ${resultado.caminho.length}<br>
            <strong>Nós explorados:</strong> ${resultado.nosExplorados}<br>
            <strong>Tempo:</strong> ${tempo} ms
            <hr style="border-color: #4a6a8a; border-style: solid; margin: 5px 0;">
            <strong>Caminho:</strong> ${resultado.caminho.join(' → ')}
        `;
        caminhoCalculado = resultado.caminho;
    }
    desenharGrafoCompleto();
}

function baixarImagemGrafo() {
    const link = document.createElement('a');
    link.download = 'grafo_navegacao.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    atualizarStatus('Download da imagem iniciado!');
}

function limparTudo(resetarModo = true) {
    grafo.limpar();
    verticeOrigem = null;
    verticeDestino = null;
    primeiroVerticeSelecionado = null;
    caminhoCalculado = [];
    resultadoInfo.innerHTML = "Nenhum cálculo realizado.";
    desenharGrafoCompleto();
    if(resetarModo) mudarModo('adicionar_vertice');
}

function gerarGrafoAleatorio() {
    limparTudo(false); 
    const numVertices = Math.floor(Math.random() * 21) + 20;
    atualizarStatus(`${numVertices} vértices gerados aleatoriamente.`);

    for (let i = 0; i < numVertices; i++) {
        const padding = VERTEX_RADIUS * 2;
        const x = Math.random() * (canvas.width - padding) + padding / 2;
        const y = Math.random() * (canvas.height - padding) + padding / 2;
        grafo.adicionarVertice(x, y);
    }

    for (let i = 0; i < numVertices; i++) {
        const numArestasParaAdicionar = Math.floor(Math.random() * 2) + 1;
        for (let j = 0; j < numArestasParaAdicionar; j++) {
            const vizinhoId = Math.floor(Math.random() * numVertices);
            if (i !== vizinhoId) {
                grafo.adicionarAresta(grafo.vertices[i], grafo.vertices[vizinhoId]);
            }
        }
    }
    desenharGrafoCompleto();
}

function inicializar() {
    function resize() {
        canvas.width = canvasContainer.clientWidth - 40;
        canvas.height = canvasContainer.clientHeight - 40;
        desenharGrafoCompleto();
    }

    window.addEventListener('resize', resize);
    canvas.addEventListener('click', eventoCliqueCanvas);
    
    modoAdicionarVerticeBtn.addEventListener('click', () => mudarModo('adicionar_vertice'));
    modoAdicionarArestaBtn.addEventListener('click', () => mudarModo('adicionar_aresta'));
    modoRemoverVerticeBtn.addEventListener('click', () => mudarModo('remover_vertice'));
    modoRemoverArestaBtn.addEventListener('click', () => mudarModo('remover_aresta'));
    modoSelecionarOrigemBtn.addEventListener('click', () => mudarModo('selecionar_origem'));
    modoSelecionarDestinoBtn.addEventListener('click', () => mudarModo('selecionar_destino'));
    gerarGrafoBtn.addEventListener('click', gerarGrafoAleatorio);
    calcularRotaBtn.addEventListener('click', calcularRota);
    baixarImagemBtn.addEventListener('click', baixarImagemGrafo);
    limparBtn.addEventListener('click', () => limparTudo(true));
    modoNoturnoBtn.addEventListener('click', alternarModoNoturno);

    resize();
    mudarModo('adicionar_vertice');
}

function alternarModoNoturno() {
    modoNoturnoAtivo = !modoNoturnoAtivo;
    document.body.classList.toggle('dark-mode', modoNoturnoAtivo);
    modoNoturnoBtn.textContent = modoNoturnoAtivo ? 'Modo Claro' : 'Modo Noturno';
    desenharGrafoCompleto();
}

// Inicializa a aplicação quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', inicializar); 