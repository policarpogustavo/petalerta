// ==========================================================
// Página inicial: mostra os animais procurados mais recentes
// e anima a conversa de exemplo do assistente no Telegram.
// Depende de dados.js e cards.js
// ==========================================================

// ---------- Procurados agora ----------
const listaProcurados = document.querySelector("#procurados");

const procurados = ocorrencias
    .filter((caso) => caso.tipo === "perdido" && caso.status === "aberto")
    .sort((a, b) => b.data.localeCompare(a.data))
    .slice(0, 3);

for (const caso of procurados) {
    const verNoMapa = `<a class="botao botao--secundario botao--pequeno" href="pets.html?caso=${caso.id}#mapa">Ver no mapa por onde ele pode estar</a>`;
    listaProcurados.append(criarCard(caso, verNoMapa));
}

// ---------- Conversa de exemplo do Telegram ----------
// As mensagens aparecem uma a uma quando a conversa entra na tela.
// Sem JavaScript, ou para quem pediu menos movimento, ela já aparece inteira.
function animarConversa() {
    const conversa = document.querySelector(".chat__mensagens");
    const menosMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!conversa || menosMovimento || !("IntersectionObserver" in window)) return;

    [...conversa.children].forEach((mensagem, ordem) => mensagem.style.setProperty("--ordem", ordem));
    conversa.classList.add("chat__mensagens--esperando");

    const observador = new IntersectionObserver((entradas) => {
        if (!entradas.some((entrada) => entrada.isIntersecting)) return;
        conversa.classList.replace("chat__mensagens--esperando", "chat__mensagens--animando");
        observador.disconnect();
    }, { threshold: 0.3 });

    observador.observe(conversa);
}

animarConversa();
