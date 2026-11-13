// ==========================================================
// Menu do celular (hambúrguer), carregado em todas as páginas.
// O estado fica no aria-expanded do botão: o CSS usa esse mesmo
// atributo para mostrar o menu e transformar as barras em um X.
// ==========================================================

const botaoMenu = document.querySelector(".botao-menu");

function menuAberto() {
    return botaoMenu.getAttribute("aria-expanded") === "true";
}

function definirMenu(aberto) {
    botaoMenu.setAttribute("aria-expanded", String(aberto));
}

botaoMenu.addEventListener("click", () => definirMenu(!menuAberto()));

// Fecha ao escolher um link ou ao clicar fora do cabeçalho
document.addEventListener("click", (evento) => {
    const clicouNoLink = evento.target.closest(".menu__link");
    const clicouFora = !evento.target.closest(".cabecalho");
    if (menuAberto() && (clicouNoLink || clicouFora)) definirMenu(false);
});

// Fecha com Esc e devolve o foco ao botão
document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape" && menuAberto()) {
        definirMenu(false);
        botaoMenu.focus();
    }
});
