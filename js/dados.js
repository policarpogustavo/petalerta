// ==========================================================
// Dados do protótipo: casos fictícios e textos de apoio.
// Os campos seguem o modelo do banco de dados:
//   tipo:   "perdido" | "achado" | "risco"
//   status: "aberto" | "reencontrado" | "encaminhado"
//   local:  [latitude, longitude] de onde o caso foi registrado
//   avistamentos: pistas da vizinhança, com data, ponto e local
// As datas são contadas a partir de hoje, para o protótipo
// sempre mostrar casos recentes.
// ==========================================================

// ---------- Datas ----------

// Data no formato AAAA-MM-DD (o mesmo do <input type="date">)
function dataISO(data) {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, "0");
    const dia = String(data.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
}

function diasAtras(dias) {
    const data = new Date();
    data.setDate(data.getDate() - dias);
    return dataISO(data);
}

// Quantos dias separam duas datas AAAA-MM-DD
function diasEntre(dataA, dataB) {
    const UM_DIA = 24 * 60 * 60 * 1000;
    const diferenca = new Date(`${dataA}T00:00`) - new Date(`${dataB}T00:00`);
    return Math.abs(Math.round(diferenca / UM_DIA));
}

function diasDesde(data) {
    return diasEntre(dataISO(new Date()), data);
}

// "hoje", "ontem" ou "há 5 dias"
function textoDias(data) {
    const dias = diasDesde(data);
    if (dias === 0) return "hoje";
    if (dias === 1) return "ontem";
    return `há ${dias} dias`;
}

// "05/11"
function dataCurta(data) {
    const [, mes, dia] = data.split("-");
    return `${dia}/${mes}`;
}

// ---------- Casos ----------
const ocorrencias = [
    {
        id: 1, tipo: "perdido", status: "aberto", nome: "Pipoca",
        especie: "cachorro", porte: "medio", cor: "caramelo",
        bairro: "Vila Mariana", ponto: "Rua Domingos de Morais", local: [-23.5935, -46.6372],
        data: diasAtras(5),
        descricao: "Usa coleira vermelha e atende pelo nome. Muito dócil.",
        avistamentos: [
            { data: diasAtras(4), ponto: "Praça perto do metrô Ana Rosa", local: [-23.5818, -46.6372] },
        ],
    },
    {
        id: 2, tipo: "achado", status: "aberto", nome: "",
        especie: "cachorro", porte: "medio", cor: "caramelo",
        bairro: "Vila Mariana", ponto: "Perto do metrô Vila Mariana", local: [-23.5893, -46.6349],
        data: diasAtras(3),
        descricao: "Encontrado perto do metrô, com coleira vermelha. Está abrigado em casa.",
        avistamentos: [],
    },
    {
        id: 3, tipo: "perdido", status: "aberto", nome: "Salem",
        especie: "gato", porte: "pequeno", cor: "preto",
        bairro: "Mooca", ponto: "Rua da Mooca", local: [-23.5585, -46.599],
        data: diasAtras(8),
        descricao: "Gato castrado, olhos amarelos, assustado com barulho.",
        avistamentos: [
            { data: diasAtras(6), ponto: "Telhado de uma casa na mesma rua", local: [-23.5594, -46.5971] },
        ],
    },
    {
        id: 4, tipo: "achado", status: "aberto", nome: "",
        especie: "gato", porte: "pequeno", cor: "preto",
        bairro: "Mooca", ponto: "Quintal de uma casa na Mooca", local: [-23.5622, -46.5948],
        data: diasAtras(6),
        descricao: "Apareceu no quintal, manso e bem cuidado.",
        avistamentos: [],
    },
    {
        id: 5, tipo: "risco", status: "encaminhado", nome: "",
        especie: "cachorro", porte: "grande", cor: "preto",
        bairro: "Tatuapé", ponto: "Praça perto do metrô Tatuapé", local: [-23.5425, -46.5752],
        data: diasAtras(4),
        descricao: "Mancando da pata traseira, perto da praça. Precisa de atendimento.",
        avistamentos: [],
    },
    {
        id: 6, tipo: "perdido", status: "aberto", nome: "Floquinho",
        especie: "cachorro", porte: "pequeno", cor: "branco",
        bairro: "Pinheiros", ponto: "Largo da Batata", local: [-23.5672, -46.6935],
        data: diasAtras(2),
        descricao: "Poodle idoso, toma remédio todos os dias.",
        avistamentos: [
            { data: diasAtras(1), ponto: "Perto do metrô Fradique Coutinho", local: [-23.5662, -46.6845] },
        ],
    },
    {
        id: 7, tipo: "achado", status: "aberto", nome: "",
        especie: "ave", porte: "pequeno", cor: "verde",
        bairro: "Butantã", ponto: "Janela de um prédio perto do metrô Butantã", local: [-23.5735, -46.7092],
        data: diasAtras(7),
        descricao: "Calopsita ou periquito pousou na janela. Tem anilha.",
        avistamentos: [],
    },
    {
        id: 8, tipo: "perdido", status: "reencontrado", nome: "Garfield",
        especie: "gato", porte: "medio", cor: "laranja",
        bairro: "Santana", ponto: "Rua Voluntários da Pátria", local: [-23.4985, -46.6265],
        data: diasAtras(13),
        descricao: "Gato laranja de pelo longo, com coleira azul.",
        avistamentos: [],
    },
    {
        id: 9, tipo: "achado", status: "aberto", nome: "",
        especie: "cachorro", porte: "grande", cor: "malhado",
        bairro: "Santana", ponto: "Perto do Parque da Juventude", local: [-23.5072, -46.6192],
        data: diasAtras(9),
        descricao: "Cachorro grande e calmo, sem coleira, parece ter dono.",
        avistamentos: [],
    },
    {
        id: 10, tipo: "risco", status: "aberto", nome: "",
        especie: "gato", porte: "pequeno", cor: "cinza",
        bairro: "Pinheiros", ponto: "Embaixo de um carro na Rua dos Pinheiros", local: [-23.5645, -46.6858],
        data: diasAtras(2),
        descricao: "Filhote sozinho embaixo de um carro, muito magro.",
        avistamentos: [],
    },
    {
        id: 11, tipo: "perdido", status: "aberto", nome: "Kiwi",
        especie: "ave", porte: "pequeno", cor: "cinza",
        bairro: "Butantã", ponto: "Perto do Instituto Butantan", local: [-23.5652, -46.7188],
        data: diasAtras(4),
        descricao: "Calopsita cinza de bochecha laranja, assobia quando chamada.",
        avistamentos: [
            { data: diasAtras(3), ponto: "Árvore alta na Avenida Vital Brasil", local: [-23.5685, -46.7135] },
            { data: diasAtras(2), ponto: "Varanda de um prédio perto do metrô Butantã", local: [-23.5718, -46.7066] },
        ],
    },
    {
        id: 12, tipo: "achado", status: "aberto", nome: "",
        especie: "cachorro", porte: "pequeno", cor: "branco",
        bairro: "Tatuapé", ponto: "Perto do Parque do Piqueri", local: [-23.5292, -46.5745],
        data: diasAtras(1),
        descricao: "Cachorro pequeno de pelo branco, com roupinha azul.",
        avistamentos: [],
    },
];

// ---------- Textos que aparecem na tela ----------
const ROTULOS = {
    situacao: { perdido: "Perdido", achado: "Achado", risco: "Em risco", reencontrado: "Reencontrado" },
    especie: { cachorro: "Cachorro", gato: "Gato", ave: "Ave" },
    porte: { pequeno: "pequeno", medio: "médio", grande: "grande" },
};

// Um caso reencontrado aparece como "Reencontrado" no lugar do tipo
function situacaoDoCaso(caso) {
    return caso.status === "reencontrado" ? "reencontrado" : caso.tipo;
}

// "Cachorro caramelo"
function descreverAnimal(caso) {
    return `${ROTULOS.especie[caso.especie]} ${caso.cor}`;
}

// Nome do animal ou, quando ninguém sabe o nome, a descrição dele
function tituloDoCaso(caso) {
    return caso.nome || descreverAnimal(caso);
}

// "Cachorro caramelo, porte médio" (ou só o porte, se o título já descreve o animal)
function subtituloDoCaso(caso) {
    const porte = ROTULOS.porte[caso.porte];
    return caso.nome ? `${descreverAnimal(caso)}, porte ${porte}` : `Porte ${porte}`;
}

// ---------- Dicas mostradas no painel do mapa ----------
const DICAS = {
    gato: [
        "Procure bem perto de casa: gatos assustados costumam se esconder em silêncio.",
        "Olhe embaixo de carros, em garagens, telhados, arbustos e caixas.",
        "Saia à noite com uma lanterna e chame baixinho: os olhos refletem a luz.",
        "Peça aos vizinhos para conferir quintais, garagens e quartinhos.",
    ],
    cachorro: [
        "Refaça o caminho dos passeios e passe pelas praças por perto.",
        "Avise pet shops, clínicas veterinárias e porteiros da região.",
        "Leve um objeto com o seu cheiro e chame pelo nome com calma.",
        "Cachorros assustados podem correr longe: amplie a busca a cada dia.",
    ],
    ave: [
        "Olhe para cima: árvores altas, telhados, fios e varandas.",
        "Deixe a gaiola na janela, com comida e água à vista.",
        "Assobie ou toque o som que a ave conhece.",
        "Avise os vizinhos dos prédios ao redor.",
    ],
    achado: [
        "Espalhe cartazes nesta área: a família provavelmente mora por perto.",
        "Peça a uma clínica veterinária para ver se o animal tem microchip.",
        "Avise pet shops e clínicas da região.",
        "Não divulgue o endereço onde o animal está: o contato passa pelo PetAlerta.",
    ],
    risco: [
        "Se for seguro, ofereça água e mantenha uma distância tranquila.",
        "Não tente segurar um animal ferido ou muito assustado.",
        "Em emergência, procure a clínica veterinária mais próxima.",
    ],
};
