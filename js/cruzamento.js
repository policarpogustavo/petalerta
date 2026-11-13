// ==========================================================
// Cruzamento de casos: compara um anúncio com os casos abertos
// e soma pontos para cada característica igual.
// É a mesma regra usada nas versões em Python e Java.
// Usado pelo Anunciar e pelo painel do mapa no Mural.
// Depende de dados.js
// ==========================================================

const PONTOS = { bairro: 40, porte: 20, cor: 20, data: 20 };
const PONTOS_MINIMOS = 60;
const DIAS_DE_TOLERANCIA = 7;
const MAXIMO_DE_COMBINACOES = 3;

function calcularCompatibilidade(anuncio, caso) {
    // Espécie diferente descarta a comparação
    if (anuncio.especie !== caso.especie) return 0;

    let pontos = 0;
    if (anuncio.bairro === caso.bairro) pontos += PONTOS.bairro;
    if (anuncio.porte === caso.porte) pontos += PONTOS.porte;
    if (anuncio.cor === caso.cor) pontos += PONTOS.cor;
    if (diasEntre(anuncio.data, caso.data) <= DIAS_DE_TOLERANCIA) pontos += PONTOS.data;
    return pontos;
}

// Quem perdeu procura entre achados e animais em risco; os outros procuram entre perdidos
function tiposOpostos(tipo) {
    return tipo === "perdido" ? ["achado", "risco"] : ["perdido"];
}

// Casos abertos com 60 pontos ou mais, do mais parecido para o menos parecido
function buscarCombinacoes(anuncio) {
    const opostos = tiposOpostos(anuncio.tipo);

    return ocorrencias
        .filter((caso) => caso.status === "aberto" && opostos.includes(caso.tipo))
        .map((caso) => ({ caso, pontos: calcularCompatibilidade(anuncio, caso) }))
        .filter((combinacao) => combinacao.pontos >= PONTOS_MINIMOS)
        .sort((a, b) => b.pontos - a.pontos)
        .slice(0, MAXIMO_DE_COMBINACOES);
}
