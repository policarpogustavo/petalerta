// ==========================================================
// Mapa da busca (Mural)
// Mostra onde cada animal foi visto e a área provável por onde
// ele pode ter andado. Tudo é desenhado em SVG, sem bibliotecas:
// latitude e longitude viram posições x/y no desenho.
// Depende de dados.js
// ==========================================================

// ---------- Área desenhada: região central de São Paulo ----------
// 0,18° de longitude ≈ 18,4 km e 0,1246° de latitude ≈ 13,8 km.
// Por isso o desenho tem 1000 × 750 unidades e cada unidade vale ≈ 18,4 m.
const LIMITES = { oeste: -46.735, leste: -46.555, norte: -23.48, sul: -23.6046 };
const LARGURA = 1000;
const ALTURA = 750;
const METROS_POR_UNIDADE = 18.37;

const reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)");

// Converte [latitude, longitude] em {x, y} do desenho (uma regra de três)
function projetar([latitude, longitude]) {
    return {
        x: ((longitude - LIMITES.oeste) / (LIMITES.leste - LIMITES.oeste)) * LARGURA,
        y: ((LIMITES.norte - latitude) / (LIMITES.norte - LIMITES.sul)) * ALTURA,
    };
}

// O caminho inverso: {x, y} do desenho em [latitude, longitude]
function desprojetar({ x, y }) {
    return [
        LIMITES.norte - (y / ALTURA) * (LIMITES.norte - LIMITES.sul),
        LIMITES.oeste + (x / LARGURA) * (LIMITES.leste - LIMITES.oeste),
    ];
}

function distanciaEmMetros(localA, localB) {
    const a = projetar(localA);
    const b = projetar(localB);
    return Math.hypot(a.x - b.x, a.y - b.y) * METROS_POR_UNIDADE;
}

// "450 m" ou "2,2 km"
function formatarDistancia(metros) {
    if (metros < 1000) return `${Math.max(50, Math.round(metros / 50) * 50)} m`;
    const km = (metros / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 });
    return `${km} km`;
}

// "123.4,56.7": coordenadas com uma casa decimal para o SVG
function xy({ x, y }) {
    return `${x.toFixed(1)},${y.toFixed(1)}`;
}

// ---------- Área provável ----------
// Quanto cada espécie costuma se afastar (estimativa simplificada do protótipo):
// começa em "inicial", cresce "porDia" a cada dia sem notícias e para em "maximo".
// "familia" é o raio onde a família de um animal achado provavelmente mora.
const ALCANCE = {
    gato: { inicial: 300, porDia: 100, maximo: 1500, familia: 500 },
    cachorro: { inicial: 600, porDia: 400, maximo: 4000, familia: 1500 },
    ave: { inicial: 800, porDia: 600, maximo: 5000, familia: 2500 },
};

// Local do aviso + avistamentos, do mais antigo para o mais novo
function trajetoDoCaso(caso) {
    const inicio = { data: caso.data, ponto: caso.ponto, local: caso.local };
    const avistamentos = [...caso.avistamentos].sort((a, b) => a.data.localeCompare(b.data));
    return [inicio, ...avistamentos];
}

// Último lugar onde o animal foi visto
function ultimoPonto(caso) {
    const trajeto = trajetoDoCaso(caso);
    return trajeto[trajeto.length - 1];
}

// Raio da área provável, em metros (0 quando não há mais o que procurar)
function raioProvavel(caso) {
    const alcance = ALCANCE[caso.especie];
    if (caso.status === "reencontrado") return 0;
    if (caso.tipo === "achado") return alcance.familia;
    if (caso.tipo === "risco") return alcance.inicial;

    const dias = diasDesde(ultimoPonto(caso).data);
    return Math.min(alcance.inicial + alcance.porDia * dias, alcance.maximo);
}

// ---------- Geografia (posições aproximadas) ----------
const GEOGRAFIA = {
    rios: [
        [[-23.53, -46.77], [-23.525, -46.74], [-23.5185, -46.715], [-23.5135, -46.692], [-23.5135, -46.668], [-23.516, -46.645], [-23.5195, -46.625], [-23.5225, -46.605], [-23.5255, -46.585], [-23.528, -46.565], [-23.53, -46.535]],
        [[-23.63, -46.698], [-23.612, -46.694], [-23.598, -46.6955], [-23.586, -46.6975], [-23.573, -46.701], [-23.563, -46.708], [-23.553, -46.7165], [-23.543, -46.728], [-23.534, -46.742], [-23.5285, -46.756]],
        [[-23.62, -46.588], [-23.6046, -46.5975], [-23.59, -46.604], [-23.576, -46.612], [-23.565, -46.62], [-23.554, -46.627], [-23.544, -46.63], [-23.533, -46.63], [-23.5192, -46.627]],
    ],
    avenidas: [
        [[-23.5556, -46.6624], [-23.5634, -46.6535], [-23.5712, -46.644]],
        [[-23.548, -46.629], [-23.5462, -46.615], [-23.5462, -46.605], [-23.5425, -46.59], [-23.5402, -46.577], [-23.5378, -46.564], [-23.536, -46.545]],
        [[-23.547, -46.637], [-23.561, -46.642], [-23.576, -46.647], [-23.588, -46.652], [-23.6046, -46.656], [-23.62, -46.66]],
        [[-23.556, -46.6655], [-23.5615, -46.6735], [-23.566, -46.681], [-23.57, -46.69], [-23.573, -46.701], [-23.579, -46.712], [-23.588, -46.726], [-23.595, -46.74]],
        [[-23.533, -46.628], [-23.5195, -46.6255], [-23.509, -46.625], [-23.499, -46.6248], [-23.47, -46.6235]],
        [[-23.5712, -46.644], [-23.581, -46.6385], [-23.59, -46.6355], [-23.6046, -46.638], [-23.62, -46.64]],
        [[-23.527, -46.567], [-23.546, -46.572], [-23.56, -46.579], [-23.58, -46.585], [-23.6, -46.59]],
        [[-23.523, -46.702], [-23.526, -46.68], [-23.529, -46.666], [-23.537, -46.65], [-23.543, -46.642]],
    ],
    // raios em metros e giro em graus
    parques: [
        { nome: "Parque Ibirapuera", centro: [-23.5874, -46.6576], raios: [850, 480], giro: -35 },
        { nome: "Parque Villa-Lobos", centro: [-23.5466, -46.723], raios: [420, 300], giro: 15 },
        { nome: "Cidade Universitária", centro: [-23.56, -46.7335], raios: [900, 700], giro: 0 },
        { nome: "Parque da Aclimação", centro: [-23.5718, -46.6317], raios: [230, 170], giro: 0 },
        { nome: "Parque da Juventude", centro: [-23.5072, -46.6175], raios: [330, 220], giro: -20 },
        { nome: "Parque do Piqueri", centro: [-23.5295, -46.5728], raios: [200, 150], giro: 0 },
        { nome: "Parque Ceret", centro: [-23.5536, -46.5651], raios: [280, 200], giro: 10 },
        { nome: "Parque da Independência", centro: [-23.5853, -46.6097], raios: [300, 210], giro: 0 },
        { nome: "Parque da Água Branca", centro: [-23.5274, -46.6676], raios: [190, 130], giro: 0 },
        { nome: "Jardim da Luz", centro: [-23.5339, -46.6339], raios: [170, 140], giro: 0 },
    ],
    rotulos: [
        { nome: "Santana", local: [-23.4995, -46.606], tipo: "bairro" },
        { nome: "Tatuapé", local: [-23.55, -46.58], tipo: "bairro" },
        { nome: "Mooca", local: [-23.568, -46.604], tipo: "bairro" },
        { nome: "Vila Mariana", local: [-23.6, -46.623], tipo: "bairro" },
        { nome: "Pinheiros", local: [-23.553, -46.69], tipo: "bairro" },
        { nome: "Butantã", local: [-23.583, -46.723], tipo: "bairro" },
        { nome: "Centro", local: [-23.548, -46.637], tipo: "lugar" },
        { nome: "Av. Paulista", local: [-23.56, -46.648], tipo: "lugar" },
        { nome: "Barra Funda", local: [-23.528, -46.668], tipo: "lugar" },
        { nome: "Lapa", local: [-23.526, -46.708], tipo: "lugar" },
        { nome: "Ipiranga", local: [-23.59, -46.605], tipo: "lugar" },
        { nome: "Casa Verde", local: [-23.503, -46.662], tipo: "lugar" },
        { nome: "Vila Maria", local: [-23.507, -46.592], tipo: "lugar" },
        { nome: "Rio Tietê", local: [-23.509, -46.69], tipo: "rio" },
        { nome: "Rio Pinheiros", local: [-23.6, -46.685], tipo: "rio" },
    ],
};

// Caminho SVG suave que passa perto dos pontos (curvas entre os pontos médios)
function caminhoSuave(locais) {
    const pontos = locais.map(projetar);
    let caminho = `M${xy(pontos[0])}`;

    for (let i = 1; i < pontos.length - 1; i++) {
        const meio = { x: (pontos[i].x + pontos[i + 1].x) / 2, y: (pontos[i].y + pontos[i + 1].y) / 2 };
        caminho += ` Q${xy(pontos[i])} ${xy(meio)}`;
    }
    return `${caminho} L${xy(pontos[pontos.length - 1])}`;
}

// ---------- Componente do mapa ----------
class MapaDeBusca {
    // raiz: o elemento .mapa
    // aoEscolherCaso(id) e aoMarcarPonto(local): funções que o Mural passa para o mapa
    constructor(raiz, { aoEscolherCaso, aoMarcarPonto }) {
        this.raiz = raiz;
        this.moldura = raiz.querySelector(".mapa__moldura");
        this.svg = raiz.querySelector(".mapa__desenho");
        this.camadaBase = raiz.querySelector(".mapa__base");
        this.camadaBusca = raiz.querySelector(".mapa__busca");
        this.camadaMarcadores = raiz.querySelector(".mapa__marcadores");
        this.dica = raiz.querySelector(".mapa__dica");
        this.textoDica = raiz.querySelector(".mapa__dica-texto");
        this.escalaBarra = raiz.querySelector(".mapa__escala-barra");
        this.escalaTexto = raiz.querySelector(".mapa__escala-texto");
        this.mensagem = raiz.querySelector(".mapa__status");
        this.aoEscolherCaso = aoEscolherCaso;
        this.aoMarcarPonto = aoMarcarPonto;

        // A vista é o pedaço do desenho que aparece: centro (x, y) e largura visível
        this.vista = { x: LARGURA / 2, y: ALTURA / 2, largura: LARGURA };
        this.marcadores = [];
        this.casos = [];
        this.casoAtivo = null;
        this.ligados = [];
        this.marcando = false;
        this.arraste = null;
        this.arrastou = false;

        this.desenharBase();
        this.ligarEventos();
        new ResizeObserver(() => this.aplicarVista()).observe(this.moldura);
    }

    // ---------- Desenho base: terra, quadras, parques, rios e avenidas ----------
    desenharBase() {
        const parques = GEOGRAFIA.parques.map(({ centro, raios, giro }) => {
            const meio = projetar(centro);
            const [rx, ry] = raios.map((metros) => (metros / METROS_POR_UNIDADE).toFixed(1));
            return `<ellipse class="mapa__parque" cx="${meio.x.toFixed(1)}" cy="${meio.y.toFixed(1)}" rx="${rx}" ry="${ry}" transform="rotate(${giro} ${xy(meio)})"/>`;
        });
        const rios = GEOGRAFIA.rios.map(caminhoSuave);
        const avenidas = GEOGRAFIA.avenidas.map(caminhoSuave);
        const linhas = (caminhos, classe) => caminhos.map((d) => `<path class="${classe}" d="${d}"/>`).join("");

        // A terra passa das bordas do desenho para nunca aparecer um buraco ao mover o mapa
        this.camadaBase.innerHTML = `
      <rect class="mapa__terra" x="-1000" y="-1000" width="3000" height="2750"/>
      <rect x="-1000" y="-1000" width="3000" height="2750" fill="url(#mapa-quadras)"/>
      ${parques.join("")}
      ${linhas(rios, "mapa__rio-borda")}
      ${linhas(rios, "mapa__rio-margem")}
      ${linhas(rios, "mapa__rio")}
      ${linhas(avenidas, "mapa__avenida-borda")}
      ${linhas(avenidas, "mapa__avenida")}`;

        const nomes = [
            ...GEOGRAFIA.rotulos,
            ...GEOGRAFIA.parques.map((parque) => ({ nome: parque.nome, local: parque.centro, tipo: "parque" })),
        ];
        for (const { nome, local, tipo } of nomes) {
            const rotulo = document.createElement("span");
            rotulo.className = `mapa__rotulo mapa__rotulo--${tipo}`;
            rotulo.setAttribute("aria-hidden", "true");
            rotulo.textContent = nome;
            this.adicionarMarcador(rotulo, local, "base");
        }
    }

    // ---------- Marcadores: elementos HTML presos a um ponto do mapa ----------
    adicionarMarcador(elemento, local, grupo) {
        const marcador = { elemento, grupo, ...projetar(local) };
        this.marcadores.push(marcador);
        this.camadaMarcadores.append(elemento);
        this.posicionar(marcador, this.caixaVisivel());
    }

    removerMarcadores(grupo) {
        for (const marcador of this.marcadores) {
            if (marcador.grupo === grupo) marcador.elemento.remove();
        }
        this.marcadores = this.marcadores.filter((marcador) => marcador.grupo !== grupo);
    }

    // Converte a posição no desenho em porcentagem da moldura
    posicionar(marcador, caixa) {
        const esquerda = ((marcador.x - caixa.x) / caixa.largura) * 100;
        const topo = ((marcador.y - caixa.y) / caixa.altura) * 100;
        marcador.elemento.style.left = `${esquerda}%`;
        marcador.elemento.style.top = `${topo}%`;

        const foraDaVista = esquerda < -5 || esquerda > 105 || topo < -5 || topo > 105;
        marcador.elemento.classList.toggle("fora-da-vista", foraDaVista);
    }

    // ---------- Vista e zoom ----------
    proporcao() {
        return this.moldura.clientWidth / this.moldura.clientHeight || 4 / 3;
    }

    // Retângulo visível do desenho: a altura acompanha o formato da moldura
    caixaVisivel() {
        const altura = this.vista.largura / this.proporcao();
        return {
            x: this.vista.x - this.vista.largura / 2,
            y: this.vista.y - altura / 2,
            largura: this.vista.largura,
            altura,
        };
    }

    aplicarVista() {
        const caixa = this.caixaVisivel();
        this.svg.setAttribute("viewBox", `${caixa.x} ${caixa.y} ${caixa.largura} ${caixa.altura}`);
        for (const marcador of this.marcadores) this.posicionar(marcador, caixa);
        this.raiz.classList.toggle("mapa--perto", caixa.largura < 420);
        this.atualizarEscala(caixa);
    }

    // Mantém o centro dentro do desenho e o zoom entre o mínimo e o máximo
    limitar({ x, y, largura }) {
        return {
            x: Math.min(Math.max(x, 0), LARGURA),
            y: Math.min(Math.max(y, 0), ALTURA),
            largura: Math.min(Math.max(largura, 90), 1300),
        };
    }

    // Leva a vista até o destino com uma animação suave
    irPara(destino) {
        const fim = this.limitar(destino);
        cancelAnimationFrame(this.animacao);

        if (reduzirMovimento.matches) {
            this.vista = fim;
            this.aplicarVista();
            return;
        }

        const inicio = { ...this.vista };
        const duracao = 650;
        const comeco = performance.now();

        const passo = (agora) => {
            const t = Math.min((agora - comeco) / duracao, 1);
            const suave = t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2; // acelera e depois freia
            this.vista = {
                x: inicio.x + (fim.x - inicio.x) * suave,
                y: inicio.y + (fim.y - inicio.y) * suave,
                // o zoom muda em proporção, para a velocidade parecer constante
                largura: inicio.largura * (fim.largura / inicio.largura) ** suave,
            };
            this.aplicarVista();
            if (t < 1) this.animacao = requestAnimationFrame(passo);
        };
        this.animacao = requestAnimationFrame(passo);
    }

    // Enquadra uma lista de pontos {x, y}, com uma folga em volta
    enquadrar(pontos, folga) {
        if (pontos.length === 0) {
            this.irPara({ x: LARGURA / 2, y: ALTURA / 2, largura: LARGURA });
            return;
        }
        const xs = pontos.map((ponto) => ponto.x);
        const ys = pontos.map((ponto) => ponto.y);
        const esquerda = Math.min(...xs) - folga;
        const direita = Math.max(...xs) + folga;
        const topo = Math.min(...ys) - folga;
        const base = Math.max(...ys) + folga;

        this.irPara({
            x: (esquerda + direita) / 2,
            y: (topo + base) / 2,
            largura: Math.max(direita - esquerda, (base - topo) * this.proporcao()),
        });
    }

    enquadrarCasos() {
        this.enquadrar(this.casos.map((caso) => projetar(caso.local)), 70);
    }

    aproximar(fator) {
        this.irPara({ ...this.vista, largura: this.vista.largura / fator });
    }

    // Régua de distância: escolhe um valor redondo que ocupe pelo menos 60px
    atualizarEscala(caixa) {
        const metrosPorPixel = (caixa.largura * METROS_POR_UNIDADE) / (this.moldura.clientWidth || 1);
        const opcoes = [100, 200, 500, 1000, 2000, 5000];
        const metros = opcoes.find((valor) => valor / metrosPorPixel >= 60) ?? 5000;
        this.escalaBarra.style.width = `${Math.round(metros / metrosPorPixel)}px`;
        this.escalaTexto.textContent = formatarDistancia(metros);
    }

    // ---------- Pinos dos casos ----------
    mostrarCasos(casos) {
        this.casos = casos;
        this.removerMarcadores("pinos");

        for (const caso of casos) {
            const situacao = situacaoDoCaso(caso);
            const pino = document.createElement("button");
            pino.type = "button";
            pino.className = "pino";
            pino.dataset.id = caso.id;
            pino.dataset.situacao = situacao;
            pino.setAttribute("aria-label", `${tituloDoCaso(caso)}: ${ROTULOS.situacao[situacao].toLowerCase()} em ${caso.bairro}`);
            pino.innerHTML = `<span class="pino__nome" aria-hidden="true">${tituloDoCaso(caso)}</span>`;
            this.adicionarMarcador(pino, caso.local, "pinos");
        }
        this.destacarPinos();
    }

    // Marca o pino escolhido (aria-pressed) e os casos que combinam com ele
    destacarPinos() {
        for (const pino of this.camadaMarcadores.querySelectorAll(".pino")) {
            const id = Number(pino.dataset.id);
            pino.setAttribute("aria-pressed", String(id === this.casoAtivo?.id));
            pino.classList.toggle("pino--ligado", this.ligados.some((caso) => caso.id === id));
        }
    }

    // ---------- Caso escolhido: área provável, trajeto e ligações ----------
    selecionar(caso, ligados = []) {
        this.casoAtivo = caso;
        this.ligados = ligados;
        this.destacarPinos();
        this.removerMarcadores("busca");
        this.camadaBusca.innerHTML = "";

        if (!caso) {
            this.enquadrarCasos();
            return;
        }

        const trajeto = trajetoDoCaso(caso);
        const pontos = trajeto.map((parada) => projetar(parada.local));
        const centro = pontos[pontos.length - 1];
        const raio = raioProvavel(caso) / METROS_POR_UNIDADE;

        const area = raio > 0 ? `
      <g class="mapa__area" data-situacao="${situacaoDoCaso(caso)}">
        <circle class="mapa__area-externa" cx="${centro.x}" cy="${centro.y}" r="${raio}"/>
        <circle class="mapa__area-interna" cx="${centro.x}" cy="${centro.y}" r="${raio * 0.45}"/>
      </g>` : "";
        const ligacoes = ligados.map((outro) => {
            const destino = projetar(outro.local);
            return `<line class="mapa__ligacao" x1="${centro.x}" y1="${centro.y}" x2="${destino.x}" y2="${destino.y}"/>`;
        });
        const caminho = pontos.length > 1 ? `<polyline class="mapa__trajeto" points="${pontos.map(xy).join(" ")}" fill="none"/>` : "";
        this.camadaBusca.innerHTML = area + ligacoes.join("") + caminho;

        // Avistamentos numerados na ordem em que aconteceram
        trajeto.slice(1).forEach((avistamento, indice) => {
            const numero = document.createElement("span");
            numero.className = "mapa__avistamento";
            numero.setAttribute("aria-hidden", "true");
            numero.textContent = indice + 1;
            this.adicionarMarcador(numero, avistamento.local, "busca");
        });

        // Enquadra o trajeto e a área inteira, mostrando pelo menos ~1 km em volta do último ponto
        const margem = Math.max(raio, 60);
        this.enquadrar([...pontos, { x: centro.x - margem, y: centro.y - margem }, { x: centro.x + margem, y: centro.y + margem }], 25);
    }

    // ---------- Marcar onde a pessoa viu o animal ----------
    iniciarMarcacao(texto) {
        this.marcando = true;
        this.raiz.classList.add("mapa--marcando");
        this.textoDica.textContent = texto;
        this.dica.hidden = false;
        this.anunciar(texto);
    }

    terminarMarcacao() {
        this.marcando = false;
        this.raiz.classList.remove("mapa--marcando");
        this.dica.hidden = true;
    }

    // Mostra o ponto marcado (ou apaga, quando recebe null)
    mostrarMarca(local) {
        this.removerMarcadores("marca");
        if (!local) return;

        const marca = document.createElement("span");
        marca.className = "mapa__marca";
        marca.setAttribute("aria-hidden", "true");
        marca.innerHTML = "<span>Você viu aqui</span>";
        this.adicionarMarcador(marca, local, "marca");
    }

    // Converte o clique (em pixels) para [latitude, longitude]
    localDoClique(evento) {
        const retangulo = this.svg.getBoundingClientRect();
        const caixa = this.caixaVisivel();
        return desprojetar({
            x: caixa.x + ((evento.clientX - retangulo.left) / retangulo.width) * caixa.largura,
            y: caixa.y + ((evento.clientY - retangulo.top) / retangulo.height) * caixa.altura,
        });
    }

    // Texto lido por leitores de tela
    anunciar(texto) {
        this.mensagem.textContent = texto;
    }

    // ---------- Eventos ----------
    ligarEventos() {
        // Clique em um pino escolhe o caso
        this.camadaMarcadores.addEventListener("click", (evento) => {
            const pino = evento.target.closest(".pino");
            if (pino) this.aoEscolherCaso(Number(pino.dataset.id));
        });

        // Botões de zoom
        this.raiz.querySelector(".mapa__controles").addEventListener("click", (evento) => {
            const botao = evento.target.closest("[data-zoom]");
            if (!botao) return;
            if (botao.dataset.zoom === "mais") this.aproximar(1.6);
            if (botao.dataset.zoom === "menos") this.aproximar(1 / 1.6);
            if (botao.dataset.zoom === "tudo") this.enquadrarCasos();
        });

        // Cancelar a marcação pelo botão ou com Esc
        this.dica.querySelector("button").addEventListener("click", () => {
            this.terminarMarcacao();
            this.anunciar("Marcação cancelada.");
        });
        document.addEventListener("keydown", (evento) => {
            if (evento.key === "Escape" && this.marcando) this.terminarMarcacao();
        });

        // Durante a marcação, o clique no mapa vira um avistamento
        this.moldura.addEventListener("click", (evento) => {
            if (!this.marcando || this.arrastou || evento.target.closest("button")) return;
            const local = this.localDoClique(evento);
            this.terminarMarcacao();
            this.mostrarMarca(local);
            this.aoMarcarPonto(local);
        });

        // Arrastar com o mouse move o mapa (no celular, o dedo continua rolando a página)
        this.moldura.addEventListener("pointerdown", (evento) => {
            if (evento.pointerType !== "mouse" || evento.button !== 0 || evento.target.closest("button")) return;
            cancelAnimationFrame(this.animacao);
            this.arraste = { x: evento.clientX, y: evento.clientY, vista: { ...this.vista } };
            this.arrastou = false;
        });

        window.addEventListener("pointermove", (evento) => {
            if (!this.arraste) return;
            const dx = evento.clientX - this.arraste.x;
            const dy = evento.clientY - this.arraste.y;
            if (!this.arrastou && Math.hypot(dx, dy) < 5) return;

            this.arrastou = true;
            this.raiz.classList.add("mapa--arrastando");
            const unidadesPorPixel = this.arraste.vista.largura / this.moldura.clientWidth;
            this.vista = this.limitar({
                largura: this.arraste.vista.largura,
                x: this.arraste.vista.x - dx * unidadesPorPixel,
                y: this.arraste.vista.y - dy * unidadesPorPixel,
            });
            this.aplicarVista();
        });

        window.addEventListener("pointerup", () => {
            this.arraste = null;
            this.raiz.classList.remove("mapa--arrastando");
            // O "click" chega logo depois do pointerup; só então o arraste é esquecido
            setTimeout(() => {
                this.arrastou = false;
            });
        });
    }
}
