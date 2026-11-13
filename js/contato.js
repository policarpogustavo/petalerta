// ==========================================================
// Contato: validação do formulário com mensagem de sucesso.
// As regras de cada campo estão no HTML (required e data-erro).
// Depende de validacao.js
// ==========================================================

const formContato = document.querySelector("#form-contato");
const sucessoContato = document.querySelector("#contato-sucesso");

validarAoEditar(formContato);

// Ao voltar a digitar, a mensagem de sucesso anterior some
formContato.addEventListener("input", () => {
    sucessoContato.hidden = true;
});

formContato.addEventListener("submit", (evento) => {
    evento.preventDefault(); // envio simulado: nada vai para um servidor

    if (!validarFormulario(formContato)) {
        sucessoContato.hidden = true;
        return;
    }
    formContato.reset();
    sucessoContato.hidden = false;
    sucessoContato.focus();
});
