// ==========================================================
// Validação dos formulários (Contato, Anunciar e pistas do Mural).
// Cada campo obrigatório tem o atributo "required" e a mensagem de
// erro em "data-erro". O erro aparece no elemento com id "<campo>-erro"
// (para rádios, "<name>-erro").
// ==========================================================

const MENSAGEM_PADRAO = "Preencha este campo";
const MENSAGEM_EMAIL = "Digite um e-mail válido, como nome@exemplo.com";

// Rádios com o mesmo name formam um grupo e são validados juntos
function grupoDoCampo(campo) {
    return campo.type === "radio" ? [...campo.form.querySelectorAll(`[name="${campo.name}"]`)] : [campo];
}

function elementoDoErro(campo) {
    const id = campo.type === "radio" ? campo.name : campo.id;
    return document.querySelector(`#${id}-erro`);
}

function mostrarErro(campo, mensagem) {
    for (const item of grupoDoCampo(campo)) item.setAttribute("aria-invalid", "true");
    elementoDoErro(campo).textContent = mensagem;
    return false;
}

function limparErro(campo) {
    for (const item of grupoDoCampo(campo)) item.removeAttribute("aria-invalid");
    elementoDoErro(campo).textContent = "";
    return true;
}

// Formato texto@texto.texto, sem espaços
function emailValido(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Confere um campo e mostra ou limpa o erro. Retorna true se estiver certo.
function validarCampo(campo) {
    const vazio = campo.type === "radio"
        ? !grupoDoCampo(campo).some((radio) => radio.checked)
        : campo.value.trim() === "";

    if (campo.required && vazio) return mostrarErro(campo, campo.dataset.erro || MENSAGEM_PADRAO);
    if (campo.type === "email" && !vazio && !emailValido(campo.value.trim())) return mostrarErro(campo, MENSAGEM_EMAIL);
    return limparErro(campo);
}

// Valida todos os campos obrigatórios de uma vez (para mostrar todos os erros)
// e leva o foco ao primeiro campo com problema
function validarFormulario(formulario) {
    const campos = [...formulario.querySelectorAll("[required]")];
    const unicos = campos.filter((campo, indice) =>
        campo.type !== "radio" || campos.findIndex((outro) => outro.name === campo.name) === indice);
    const comErro = unicos.filter((campo) => !validarCampo(campo));

    if (comErro.length > 0) comErro[0].focus();
    return comErro.length === 0;
}

// Feedback enquanto a pessoa preenche:
// - ao sair de um campo preenchido, confere o formato (ex.: e-mail);
// - ao escolher uma opção, confere na hora;
// - enquanto corrige um campo com erro, o erro some assim que estiver certo.
function validarAoEditar(formulario) {
    formulario.addEventListener("focusout", (evento) => {
        const campo = evento.target;
        if (campo.required && campo.type !== "radio" && campo.value.trim() !== "") validarCampo(campo);
    });

    formulario.addEventListener("change", (evento) => {
        if (evento.target.required) validarCampo(evento.target);
    });

    formulario.addEventListener("input", (evento) => {
        if (evento.target.getAttribute("aria-invalid") === "true") validarCampo(evento.target);
    });
}