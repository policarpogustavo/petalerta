// ==========================================================
// Sobre: abas (Problema, Solução, Impacto).
// Clique ou setas do teclado trocam de aba, como pede o padrão de
// acessibilidade: só a aba ativa entra na ordem do Tab.
// ==========================================================

const abas = [...document.querySelectorAll('[role="tab"]')];

function mostrarAba(abaEscolhida) {
    for (const aba of abas) {
        const ativa = aba === abaEscolhida;
        aba.setAttribute("aria-selected", String(ativa));
        aba.tabIndex = ativa ? 0 : -1;
        document.getElementById(aba.getAttribute("aria-controls")).hidden = !ativa;
    }
}

// Setas para os lados (dando a volta no fim da lista), Home e End movem entre as abas
for (const aba of abas) {
    aba.addEventListener("click", () => mostrarAba(aba));

    aba.addEventListener("keydown", (evento) => {
        const atual = abas.indexOf(aba);
        let destino = null;

        if (evento.key === "ArrowRight") destino = (atual + 1) % abas.length;
        if (evento.key === "ArrowLeft") destino = (atual - 1 + abas.length) % abas.length;
        if (evento.key === "Home") destino = 0;
        if (evento.key === "End") destino = abas.length - 1;
        if (destino === null) return;

        evento.preventDefault();
        mostrarAba(abas[destino]);
        abas[destino].focus();
    });
}

mostrarAba(abas.find((aba) => aba.getAttribute("aria-selected") === "true") ?? abas[0]);
