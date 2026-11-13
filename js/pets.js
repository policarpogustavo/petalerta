// ==========================================================
// Pets perdidos (mural): filtros, cards, mapa da busca, painel
// "Por onde procurar" e o modal para enviar uma pista.
// Depende de dados.js, cruzamento.js, cards.js, mapa.js e validacao.js
// ==========================================================

const formFiltros = document.querySelector("#filtros");
const filtroBairro = document.querySelector("#filtro-bairro");
const botaoLimpar = document.querySelector("#limpar-filtros");
const contador = document.querySelector("#contador");
const listaCards = document.querySelector("#lista-cards");
const mensagemVazio = document.querySelector("#mensagem-vazio");
const painel = document.querySelector("#painel");
const painelInicial = painel.innerHTML; // instruções mostradas quando nenhum caso está escolhido

const modal = document.querySelector("#modal-pista");
const modalTitulo = document.querySelector("#modal-titulo");
const modalAnimal = document.querySelector("#modal-animal");
const avisoPontoMarcado = document.querySelector("#pista-marcada");
const formPista = document.querySelector("#form-pista");
const campoQuando = document.querySelector("#pista-quando");
const sucessoPista = document.querySelector("#pista-sucesso");
const textoSucesso = document.querySelector("#pista-sucesso-texto");

let casoEscolhido = null; // caso aberto no painel
let casoDaPista = null; // caso do modal
let pontoMarcado = null; // [latitude, longitude] marcado no mapa, se houver

const mapa = new MapaDeBusca(document.querySelector("#mapa"), {
    aoEscolherCaso: (id) => escolherCaso(buscarCaso(id)),
    aoMarcarPonto: (local) => abrirModal(casoEscolhido, local),
});

function buscarCaso(id) {
    return ocorrencias.find((caso) => caso.id === id);
}

// "Pipoca" ou "o animal", para usar no meio de uma frase
function nomeNaFrase(caso) {
    return caso.nome || "o animal";
}

function textoDaPista(caso) {
    return caso.tipo === "achado" ? "Conheço este animal" : "Vi este animal";
}

// ---------- Filtros ----------

// Preenche o select de bairros a partir dos dados, sem repetir
function preencherBairros() {
    const bairros = [...new Set(ocorrencias.map((caso) => caso.bairro))].sort();
    for (const bairro of bairros) filtroBairro.add(new Option(bairro, bairro));
}

// Tira acentos e maiúsculas: "Tatuapé" e "tatuape" ficam iguais
function normalizar(texto) {
    return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
}

// Devolve só os casos que passam em todos os filtros escolhidos
function filtrarOcorrencias() {
    const filtro = Object.fromEntries(new FormData(formFiltros));
    const busca = normalizar(filtro.busca);

    return ocorrencias.filter((caso) => {
        const texto = normalizar(
            `${caso.nome} ${descreverAnimal(caso)} ${ROTULOS.porte[caso.porte]} ${caso.descricao} ${caso.bairro} ${caso.ponto}`
        );
        return (
            (!filtro.situacao || situacaoDoCaso(caso) === filtro.situacao) &&
            (!filtro.especie || caso.especie === filtro.especie) &&
            (!filtro.porte || caso.porte === filtro.porte) &&
            (!filtro.bairro || caso.bairro === filtro.bairro) &&
            (!busca || texto.includes(busca))
        );
    });
}

// Atualiza a lista e o mapa sempre que um filtro muda
function atualizarMural() {
    const casos = filtrarOcorrencias();
    renderizarCards(casos);
    mapa.mostrarCasos(casos);

    if (casoEscolhido && !casos.includes(casoEscolhido)) {
        escolherCaso(null);
    } else if (!casoEscolhido) {
        mapa.enquadrarCasos();
    }
}

// ---------- Cards ----------
function rodapeDoCard(caso) {
    const verNoMapa = `<button class="botao botao--secundario botao--pequeno" type="button" data-acao="mapa" data-id="${caso.id}">Ver no mapa</button>`;
    if (caso.status === "reencontrado") return verNoMapa;
    return `${verNoMapa}<button class="botao botao--pequeno" type="button" data-acao="pista" data-id="${caso.id}">${textoDaPista(caso)}</button>`;
}

function renderizarCards(casos) {
    listaCards.replaceChildren(...casos.map((caso) => criarCard(caso, rodapeDoCard(caso))));
    contador.textContent = casos.length === 1 ? "1 aviso" : `${casos.length} avisos`;
    mensagemVazio.hidden = casos.length > 0;
    destacarCard();
}

// Realça o card do caso aberto no painel
function destacarCard() {
    for (const card of listaCards.querySelectorAll(".ocorrencia")) {
        card.classList.toggle("ocorrencia--ativa", Number(card.dataset.id) === casoEscolhido?.id);
    }
}

// ---------- Painel "Por onde procurar" ----------
function escolherCaso(caso, { rolar = false } = {}) {
    casoEscolhido = caso;
    const combinacoes = caso?.status === "aberto" ? buscarCombinacoes(caso) : [];

    mapa.selecionar(caso, combinacoes.map((combinacao) => combinacao.caso));
    painel.innerHTML = caso ? htmlDoPainel(caso, combinacoes) : painelInicial;
    destacarCard();

    if (caso) mapa.anunciar(`${tituloDoCaso(caso)} aparece no mapa. Os detalhes estão no painel "Por onde procurar".`);
    if (rolar) {
        document.querySelector("#mapa").scrollIntoView({ behavior: reduzirMovimento.matches ? "auto" : "smooth" });
    }
}

function htmlDoPainel(caso, combinacoes) {
    const situacao = situacaoDoCaso(caso);
    return `
    <article class="painel__caso" data-situacao="${situacao}">
      <header class="painel__topo">
        <div class="painel__foto">${ilustrarAnimal(caso)}</div>
        <div class="painel__identificacao">
          <span class="selo">${ROTULOS.situacao[situacao]}</span>
          <h2 class="painel__titulo" id="painel-titulo">${tituloDoCaso(caso)}</h2>
          <p class="painel__subtitulo">${subtituloDoCaso(caso)} · ${caso.bairro}</p>
        </div>
        <button class="botao botao--fantasma botao--icone painel__fechar" type="button" data-acao="fechar" aria-label="Fechar detalhes">×</button>
      </header>
      ${htmlDoResumo(caso)}
      ${htmlDoTrajeto(caso)}
      ${htmlDasDicas(caso)}
      ${htmlDasCombinacoes(caso, combinacoes)}
      ${htmlDasAcoes(caso)}
    </article>`;
}

// Pares "título: texto" que resumem o caso, conforme a situação
function htmlDoResumo(caso) {
    const ultimo = ultimoPonto(caso);
    const raio = formatarDistancia(raioProvavel(caso));
    const quando = `${escaparHTML(ultimo.ponto)}, ${textoDias(ultimo.data)}`;

    const linhas = {
        perdido: [["Visto por último", quando], ["Área provável", `Até ${raio} ao redor desse ponto`]],
        achado: [["Encontrado", quando], ["A família deve morar", `A até ${raio} daqui`]],
        risco: [["Visto", quando], ["Situação", caso.status === "encaminhado" ? "Encaminhado a um parceiro da região" : "Aguardando ajuda"]],
        reencontrado: [["Final feliz", `${tituloDoCaso(caso)} já voltou para casa. Obrigado a todos que ajudaram!`]],
    }[situacaoDoCaso(caso)];

    const itens = linhas.map(([titulo, texto]) => `<div><dt>${titulo}</dt><dd>${texto}</dd></div>`);
    return `<dl class="painel__resumo">${itens.join("")}</dl>`;
}

// "Sumiu" (ou "Visto") para o local do aviso, "Avistamento 1", "Avistamento 2"... para as pistas
function rotuloDaParada(caso, indice) {
    if (indice > 0) return `Avistamento ${indice}`;
    return caso.tipo === "perdido" ? "Sumiu" : "Visto";
}

// Linha do tempo: onde sumiu e cada avistamento (os números são os mesmos do mapa)
function htmlDoTrajeto(caso) {
    if (caso.tipo === "achado" || caso.status === "reencontrado") return "";

    const itens = trajetoDoCaso(caso).map((parada, indice) => `
    <li class="trajeto__item">
      <span class="trajeto__marca" aria-hidden="true">${indice === 0 ? "" : indice}</span>
      <p>
        <strong>${rotuloDaParada(caso, indice)}:</strong>
        ${escaparHTML(parada.ponto)}
        <time datetime="${parada.data}">${dataCurta(parada.data)} · ${textoDias(parada.data)}</time>
      </p>
    </li>`);
    const semAvistamentos = caso.avistamentos.length === 0
        ? `<p class="painel__nota">Ainda não há avistamentos. Viu ${nomeNaFrase(caso)}? Marque no mapa.</p>`
        : "";

    return `
    <section class="painel__secao">
      <h3>Trajeto conhecido</h3>
      <ol class="trajeto">${itens.join("")}</ol>
      ${semAvistamentos}
    </section>`;
}

function htmlDasDicas(caso) {
    if (caso.status === "reencontrado") return "";

    const dicas = caso.tipo === "perdido" ? DICAS[caso.especie] : DICAS[caso.tipo];
    const titulo = { perdido: "Onde procurar", achado: "Como ajudar a achar a família", risco: "Como ajudar" }[caso.tipo];
    return `
    <section class="painel__secao">
      <h3>${titulo}</h3>
      <ul class="lista-check">${dicas.map((dica) => `<li>${dica}</li>`).join("")}</ul>
    </section>`;
}

function htmlDasCombinacoes(caso, combinacoes) {
    if (combinacoes.length === 0) return "";

    const origem = ultimoPonto(caso).local;
    const itens = combinacoes.map(({ caso: outro, pontos }) => `
    <li>
      <button class="combinacao" type="button" data-acao="ver" data-id="${outro.id}">
        <span class="combinacao__foto">${ilustrarAnimal(outro)}</span>
        <span class="combinacao__texto">
          <strong>${tituloDoCaso(outro)}, ${ROTULOS.situacao[situacaoDoCaso(outro)].toLowerCase()}</strong>
          <small>${outro.bairro} · a ${formatarDistancia(distanciaEmMetros(origem, outro.local))} daqui</small>
        </span>
        <span class="combinacao__pontos">${pontos}%</span>
      </button>
    </li>`);

    return `
    <section class="painel__secao">
      <h3>${caso.tipo === "perdido" ? "Pode ser ele?" : "Quem pode estar procurando"}</h3>
      <ul class="combinacoes">${itens.join("")}</ul>
      <p class="painel__nota">Semelhança calculada por espécie, porte, cor, bairro e data.</p>
    </section>`;
}

function htmlDasAcoes(caso) {
    if (caso.status === "reencontrado") return "";

    const pista = `<button class="botao" type="button" data-acao="pista">${textoDaPista(caso)}</button>`;
    const marcar = caso.tipo === "achado"
        ? ""
        : `<button class="botao botao--secundario" type="button" data-acao="marcar">Marcar no mapa onde vi</button>`;
    return `<div class="painel__acoes">${pista}${marcar}</div>`;
}

// ---------- Modal de pistas ----------
function abrirModal(caso, local = null) {
    casoDaPista = caso;
    pontoMarcado = local;

    modalTitulo.textContent = textoDaPista(caso);
    modalAnimal.textContent = `${tituloDoCaso(caso)} · ${subtituloDoCaso(caso)} · ${caso.bairro}`;
    avisoPontoMarcado.hidden = local === null;

    formPista.reset();
    formPista.querySelectorAll("[required]").forEach(limparErro);
    campoQuando.value = dataISO(new Date());
    formPista.hidden = false;
    sucessoPista.hidden = true;
    modal.showModal();
}

function agradecimento(caso, marcouNoMapa) {
    const quem = caso.tipo === "achado" ? "a quem encontrou este animal" : `a quem procura ${nomeNaFrase(caso)}`;
    const noMapa = marcouNoMapa ? " Ela já aparece no mapa, e a área de busca foi atualizada." : "";
    return `Sua pista chegou ${quem} pelo PetAlerta, sem mostrar seu telefone.${noMapa} É assim, com cada vizinho ajudando, que os animais voltam para casa.`;
}

formPista.addEventListener("submit", (evento) => {
    evento.preventDefault(); // envio simulado: nada vai para um servidor
    if (!validarFormulario(formPista)) return;

    const pista = Object.fromEntries(new FormData(formPista));
    const marcouNoMapa = pontoMarcado !== null;
    if (marcouNoMapa) {
        casoDaPista.avistamentos.push({ data: pista.quando, ponto: pista.onde, local: pontoMarcado });
    }

    textoSucesso.textContent = agradecimento(casoDaPista, marcouNoMapa);
    formPista.hidden = true;
    sucessoPista.hidden = false;
    sucessoPista.focus();

    // Redesenha o mapa e o painel com o novo avistamento
    if (marcouNoMapa) {
        renderizarCards(filtrarOcorrencias());
        escolherCaso(casoDaPista);
    }
});

// Fecha pelo botão ou clicando fora da caixa (o Esc já fecha sozinho no <dialog>)
modal.addEventListener("click", (evento) => {
    if (evento.target === modal || evento.target.closest("[data-fechar]")) modal.close();
});

// Ao fechar, some o ponto provisório "Você viu aqui"
modal.addEventListener("close", () => {
    mapa.mostrarMarca(null);
    pontoMarcado = null;
});

// ---------- Eventos ----------
formFiltros.addEventListener("input", atualizarMural);
formFiltros.addEventListener("submit", (evento) => evento.preventDefault());

botaoLimpar.addEventListener("click", () => {
    formFiltros.reset();
    atualizarMural();
});

// Um único "ouvinte" na lista cuida dos botões de todos os cards
listaCards.addEventListener("click", (evento) => {
    const botao = evento.target.closest("[data-acao]");
    if (!botao) return;

    const caso = buscarCaso(Number(botao.dataset.id));
    if (botao.dataset.acao === "mapa") escolherCaso(caso, { rolar: true });
    if (botao.dataset.acao === "pista") abrirModal(caso);
});

painel.addEventListener("click", (evento) => {
    const botao = evento.target.closest("[data-acao]");
    if (!botao) return;

    const acao = botao.dataset.acao;
    if (acao === "fechar") escolherCaso(null);
    if (acao === "ver") escolherCaso(buscarCaso(Number(botao.dataset.id)));
    if (acao === "pista") abrirModal(casoEscolhido);
    if (acao === "marcar") mapa.iniciarMarcacao(`Toque no mapa onde você viu ${nomeNaFrase(casoEscolhido)}.`);
});

// ---------- Início ----------

// Filtros e caso vindos do endereço, como pets.html?situacao=perdido ou pets.html?caso=2
function lerEndereco() {
    const parametros = new URLSearchParams(location.search);
    for (const campo of formFiltros.elements) {
        if (campo.name && parametros.has(campo.name)) campo.value = parametros.get(campo.name);
    }
    return buscarCaso(Number(parametros.get("caso")));
}

campoQuando.max = dataISO(new Date());
validarAoEditar(formPista);
preencherBairros();
const casoDoEndereco = lerEndereco();
atualizarMural();
if (casoDoEndereco) escolherCaso(casoDoEndereco);
