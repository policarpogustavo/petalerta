// ==========================================================
// Cards dos casos (Mural, Anunciar e Início) e ilustrações
// dos animais, pintadas com a cor de cada um.
// Depende de dados.js
// ==========================================================

// Impede que um texto digitado pela pessoa vire HTML na página
function escaparHTML(texto) {
    return String(texto)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
}

// ---------- Ilustrações ----------

// Cores de cada pelagem: pelo, sombra (orelhas, asas), claro (focinho) e traço (bigodes)
const PELAGENS = {
    caramelo: { pelo: "#D9A066", sombra: "#A86B32", claro: "#FBEBD3", traco: "#1F2933" },
    preto: { pelo: "#3B3B42", sombra: "#1E1E23", claro: "#8A8A94", traco: "#E5E7EB" },
    branco: { pelo: "#F7F4EE", sombra: "#D9D1C3", claro: "#FFFFFF", traco: "#1F2933" },
    cinza: { pelo: "#9AA5AD", sombra: "#6E7A83", claro: "#D8DDE0", traco: "#1F2933" },
    laranja: { pelo: "#E8893A", sombra: "#B8611F", claro: "#FBD9B5", traco: "#1F2933" },
    malhado: { pelo: "#F7F4EE", sombra: "#6B4A2E", claro: "#FFFFFF", traco: "#1F2933", manchas: true },
    verde: { pelo: "#6DB35F", sombra: "#3F7D3A", claro: "#A8D99A", traco: "#1F2933" },
};

const FUNDOS = { cachorro: "#F7E3C8", gato: "#DCE9EC", ave: "#E3EFD9" };

// Cada desenho recebe a pelagem e devolve as formas em SVG (área de 400 × 300)
const DESENHOS = {
    cachorro: (cor) => `
    <circle cx="200" cy="330" r="130" fill="${cor.pelo}"/>
    ${cor.manchas ? `<circle cx="150" cy="292" r="36" fill="${cor.sombra}"/>` : ""}
    <ellipse cx="118" cy="140" rx="34" ry="70" fill="${cor.sombra}" transform="rotate(18 118 140)"/>
    <ellipse cx="282" cy="140" rx="34" ry="70" fill="${cor.sombra}" transform="rotate(-18 282 140)"/>
    <circle cx="200" cy="150" r="88" fill="${cor.pelo}"/>
    ${cor.manchas ? `<ellipse cx="236" cy="126" rx="36" ry="30" fill="${cor.sombra}"/>` : ""}
    <ellipse cx="200" cy="185" rx="48" ry="38" fill="${cor.claro}"/>
    <circle cx="168" cy="135" r="10" fill="#1F2933"/>
    <circle cx="232" cy="135" r="10" fill="#1F2933"/>
    <circle cx="171" cy="131" r="3.5" fill="#FFFFFF"/>
    <circle cx="235" cy="131" r="3.5" fill="#FFFFFF"/>
    <ellipse cx="200" cy="170" rx="15" ry="11" fill="#1F2933"/>
    <path d="M200 181v14m0 0c-8 10-20 8-24 0m24 0c8 10 20 8 24 0" fill="none" stroke="#1F2933" stroke-width="4" stroke-linecap="round"/>`,

    gato: (cor) => `
    <circle cx="200" cy="335" r="125" fill="${cor.pelo}"/>
    <path d="M118 150l8-92 66 44zM282 150l-8-92-66 44z" fill="${cor.pelo}"/>
    <path d="M132 128l5-48 36 24zM268 128l-5-48-36 24z" fill="#F3B8A8"/>
    <circle cx="200" cy="160" r="86" fill="${cor.pelo}"/>
    <ellipse cx="200" cy="194" rx="40" ry="26" fill="${cor.claro}"/>
    <ellipse cx="166" cy="148" rx="12" ry="15" fill="#F6D66B"/>
    <ellipse cx="234" cy="148" rx="12" ry="15" fill="#F6D66B"/>
    <ellipse cx="166" cy="148" rx="4" ry="12" fill="#1F2933"/>
    <ellipse cx="234" cy="148" rx="4" ry="12" fill="#1F2933"/>
    <path d="M190 176h20l-10 11z" fill="#F3B8A8"/>
    <path d="M200 187c-6 10-16 9-20 2m20-2c6 10 16 9 20 2M150 180l-46-8m46 18l-44 8m144-18l46-8m-46 18l44 8" fill="none" stroke="${cor.traco}" stroke-width="3" stroke-linecap="round"/>`,

    ave: (cor) => `
    <path d="M60 250h280" stroke="#8A5A2B" stroke-width="10" stroke-linecap="round"/>
    <path d="M150 190l-70 50 80-20z" fill="${cor.sombra}"/>
    <ellipse cx="200" cy="180" rx="68" ry="58" fill="${cor.pelo}"/>
    <path d="M165 175c20 40 70 40 80 5-25 10-55 8-80-5z" fill="${cor.sombra}"/>
    <circle cx="250" cy="120" r="44" fill="${cor.pelo}"/>
    <path d="M240 82c-4-22 6-34 18-40-2 14 2 26 8 36z" fill="#F6D66B"/>
    <circle cx="262" cy="112" r="7" fill="#1F2933"/>
    <circle cx="264" cy="110" r="2.2" fill="#FFFFFF"/>
    <circle cx="244" cy="130" r="9" fill="#F28C52"/>
    <path d="M290 112l32 12-30 12z" fill="#F0B43C"/>
    <path d="M190 236v14m24-16v16" stroke="#8A5A2B" stroke-width="5" stroke-linecap="round"/>`,
};

// Ilustração decorativa (aria-hidden): o texto do card já descreve o animal
function ilustrarAnimal(caso) {
    const pelagem = PELAGENS[caso.cor] ?? PELAGENS.caramelo;
    return `
    <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    <rect width="400" height="300" fill="${FUNDOS[caso.especie]}"/>
    ${DESENHOS[caso.especie](pelagem)}
    </svg>`;
}

// ---------- Card ----------

// "rodape" é o HTML do fim do card: botões no Mural, a compatibilidade no Anunciar
function criarCard(caso, rodape = "") {
    const situacao = situacaoDoCaso(caso);
    const avistamentos = caso.avistamentos.length;
    const textoAvistamentos = avistamentos === 1 ? "1 avistamento" : `${avistamentos} avistamentos`;

    const item = document.createElement("li");
    item.innerHTML = `
    <article class="ocorrencia" data-situacao="${situacao}" data-id="${caso.id}">
    <div class="ocorrencia__foto">${ilustrarAnimal(caso)}</div>
    <div class="ocorrencia__corpo">
        <h3 class="ocorrencia__titulo">${escaparHTML(tituloDoCaso(caso))}</h3>
        <p class="selo ocorrencia__selo">${ROTULOS.situacao[situacao]}</p>
        <p class="ocorrencia__subtitulo">${escaparHTML(subtituloDoCaso(caso))}</p>
        <ul class="ocorrencia__meta">
        <li><img src="assets/icons/local.svg" alt="" width="18" height="18">${escaparHTML(caso.bairro)}</li>
        <li><img src="assets/icons/relogio.svg" alt="" width="18" height="18"><time datetime="${caso.data}">${textoDias(caso.data)}</time></li>
        ${avistamentos > 0 ? `<li><img src="assets/icons/olho.svg" alt="" width="18" height="18">${textoAvistamentos}</li>` : ""}
        </ul>
        <p class="ocorrencia__descricao">${escaparHTML(caso.descricao)}</p>
        ${rodape ? `<div class="ocorrencia__rodape">${rodape}</div>` : ""}
    </div>
    </article>`;
    return item;
}
