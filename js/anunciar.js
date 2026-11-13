// ==========================================================
// Anunciar: formulário que muda conforme "Perdi" ou "Achei"
// e busca de casos parecidos (cruzamento).
// Depende de dados.js, cruzamento.js, cards.js e validacao.js
// ==========================================================

const formAnuncio = document.querySelector("#form-anuncio");
const campoData = document.querySelector("#anuncio-data");
const rotuloData = document.querySelector("#rotulo-data");
const camposCondicionais = document.querySelectorAll("[data-mostrar-se]");
const resultado = document.querySelector("#resultado");
const resultadoIcone = document.querySelector("#resultado-icone");
const resultadoTitulo = document.querySelector("#resultado-titulo");
const resultadoTexto = document.querySelector("#resultado-texto");
const resultadoCards = document.querySelector("#resultado-cards");

// ---------- Formulário que se adapta ----------

// "perdido", "achado" ou "" (nada escolhido ainda)
function tipoEscolhido() {
    return formAnuncio.elements.tipo.value;
}

// Mostra só os elementos do tipo escolhido (atributo data-mostrar-se no HTML)
function adaptarFormulario() {
    const tipo = tipoEscolhido();
    for (const elemento of camposCondicionais) {
        elemento.hidden = elemento.dataset.mostrarSe !== tipo;
    }
    rotuloData.textContent = tipo === "achado" ? "Quando você encontrou?" : "Quando ele sumiu?";
}

// ---------- Resultado ----------
function textosDoResultado(anuncio, total) {
    if (anuncio.tipo === "achado") {
        return {
            titulo: "Obrigado, vizinho do bem!",
            texto: total > 0
                ? "Seu aviso já pode mudar o dia de alguém: estas pessoas procuram um animal parecido e vão receber uma mensagem pelo PetAlerta, sem ver o seu telefone."
                : `Ninguém registrou um animal assim ainda, mas a vizinhança de ${anuncio.bairro} já foi avisada. Quando a família aparecer, o PetAlerta avisa você na hora. Enquanto isso, mantenha o animal seguro e com água. (Simulação do alerta.)`,
        };
    }
    if (total > 0) {
        return {
            titulo: "Encontramos possíveis combinações",
            texto: "Estes casos abertos são parecidos com o seu. O contato é feito pelo PetAlerta, sem mostrar seu telefone.",
        };
    }
    return {
        titulo: "Anúncio registrado",
        texto: `Ainda não há combinação. Avisamos a vizinhança de ${anuncio.bairro} e você será avisado se alguém registrar um animal parecido. (Simulação do alerta.)`,
    };
}

function rodapeDoResultado(caso, pontos) {
    return `
    <p class="compatibilidade">
      <span>Possível combinação: ${pontos}% compatível</span>
      <span class="compatibilidade__barra" aria-hidden="true"><span style="--valor: ${pontos}%"></span></span>
    </p>
    <a class="botao botao--secundario botao--pequeno" href="pets.html?caso=${caso.id}#mapa">Ver no mapa</a>`;
}

function mostrarResultado(anuncio) {
    const combinacoes = buscarCombinacoes(anuncio);
    const { titulo, texto } = textosDoResultado(anuncio, combinacoes.length);
    const achou = anuncio.tipo === "achado";

    // Quem achou um animal recebe o agradecimento em tom caloroso
    resultadoIcone.classList.toggle("icone-bolha--acao", achou);
    resultadoIcone.querySelector("img").src = achou ? "assets/icons/achei.svg" : "assets/icons/perdi.svg";
    resultadoTexto.classList.toggle("mensagem--sucesso", achou);
    resultadoTitulo.textContent = titulo;
    resultadoTexto.textContent = texto;
    resultadoCards.replaceChildren(
        ...combinacoes.map(({ caso, pontos }) => criarCard(caso, rodapeDoResultado(caso, pontos)))
    );
    resultado.hidden = false;
    resultado.focus();
}

// ---------- Envio ----------
formAnuncio.addEventListener("submit", (evento) => {
    evento.preventDefault(); // envio simulado: nada vai para um servidor

    if (!validarFormulario(formAnuncio)) {
        resultado.hidden = true;
        return;
    }
    mostrarResultado(Object.fromEntries(new FormData(formAnuncio)));
});

formAnuncio.addEventListener("change", (evento) => {
    if (evento.target.name === "tipo") adaptarFormulario();
});

validarAoEditar(formAnuncio);

// ---------- Início ----------
campoData.max = dataISO(new Date());

// Quem veio da página inicial (anunciar.html?tipo=achado) já chega com a opção marcada
const tipoDoEndereco = new URLSearchParams(location.search).get("tipo");
if (tipoDoEndereco === "perdido" || tipoDoEndereco === "achado") {
    formAnuncio.elements.tipo.value = tipoDoEndereco;
}
adaptarFormulario();