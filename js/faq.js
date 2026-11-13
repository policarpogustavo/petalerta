// ==========================================================
// FAQ: acordeão que abre uma resposta por vez.
// Um link como faq.html#pergunta-mapa já chega com a pergunta aberta.
// ==========================================================

const perguntas = document.querySelectorAll(".acordeao__botao");

function definirPergunta(botao, aberta) {
    botao.setAttribute("aria-expanded", String(aberta));
    document.getElementById(botao.getAttribute("aria-controls")).hidden = !aberta;
}

function alternarPergunta(botaoClicado) {
    const estavaAberta = botaoClicado.getAttribute("aria-expanded") === "true";
    for (const botao of perguntas) definirPergunta(botao, false);
    definirPergunta(botaoClicado, !estavaAberta);
}

for (const botao of perguntas) {
    botao.addEventListener("click", () => alternarPergunta(botao));
}

const perguntaDoEndereco = document.getElementById(location.hash.slice(1));
if (perguntaDoEndereco?.matches(".acordeao__botao")) alternarPergunta(perguntaDoEndereco);
