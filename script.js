// As coordenadas começam em zero. H = horizontal, V = vertical.
const palavras = [
    { "numero": 1, "resposta": "REGISTRADORES", "linha": 0, "coluna": 0, "direcao": "H", "pista": "Pequenas áreas internas do processador que guardam temporariamente operandos e resultados imediatos." },
    { "numero": 2, "resposta": "DUALCORE", "linha": 0, "coluna": 8, "direcao": "V", "pista": "Processador com dois núcleos de execução, como uma dupla em campo." },
    { "numero": 3, "resposta": "DATABUS", "linha": 1, "coluna": 13, "direcao": "V", "pista": "Conjunto de linhas que transporta informações entre processador, memória e periféricos." },
    { "numero": 4, "resposta": "CACHE", "linha": 2, "coluna": 7, "direcao": "H", "pista": "Área rápida próxima ao processador que guarda informações usadas frequentemente." },
    { "numero": 5, "resposta": "UC", "linha": 3, "coluna": 3, "direcao": "H", "pista": "Como árbitro, coordena a execução das instruções dentro do processador." },
    { "numero": 6, "resposta": "CPU", "linha": 3, "coluna": 4, "direcao": "V", "pista": "Principal componente que executa instruções e processa dados no computador." },
    { "numero": 7, "resposta": "FLASH", "linha": 4, "coluna": 11, "direcao": "H", "pista": "Tecnologia não volátil usada em pendrives, apagada eletricamente em blocos." },
    { "numero": 8, "resposta": "QUADCORE", "linha": 5, "coluna": 3, "direcao": "H", "pista": "Processador com quatro núcleos de execução, como uma linha defensiva de quatro jogadores." },
    { "numero": 9, "resposta": "EEPROM", "linha": 6, "coluna": 15, "direcao": "V", "pista": "Tipo de armazenamento não volátil que permite apagar e regravar bytes eletricamente." },
    { "numero": 10, "resposta": "ROM", "linha": 7, "coluna": 0, "direcao": "H", "pista": "Armazenamento não volátil projetado apenas para leitura durante o funcionamento normal." },
    { "numero": 10, "resposta": "RAM", "linha": 7, "coluna": 0, "direcao": "V", "pista": "Espaço de trabalho temporário dos aplicativos, que perde dados ao desligar." },
    { "numero": 11, "resposta": "ADDRESSBUS", "linha": 7, "coluna": 4, "direcao": "H", "pista": "Conjunto de linhas que indica onde uma informação deve ser lida ou gravada." },
    { "numero": 12, "resposta": "ULA", "linha": 7, "coluna": 12, "direcao": "V", "pista": "Setor do processador responsável por operações matemáticas e comparações lógicas." },
    { "numero": 13, "resposta": "MICROCONTROLADOR", "linha": 9, "coluna": 0, "direcao": "H", "pista": "Pequeno chip que reúne processamento, armazenamento interno e interfaces para comandar dispositivos." },
    { "numero": 14, "resposta": "DMA", "linha": 9, "coluna": 13, "direcao": "V", "pista": "Como um passe direto, transfere dados entre periféricos e memória sem intervenção contínua do processador." },
    { "numero": 15, "resposta": "MEMORIADEMASSA", "linha": 11, "coluna": 0, "direcao": "H", "pista": "Armazenamento de longo prazo para arquivos, como vídeos das partidas, usando HD ou SSD." }
];

const tabuleiro = document.getElementById('tabuleiro');
const mensagem = document.getElementById('mensagem');
const casas = {};
const botoesPistas = [];
const estados = [];
let palavraAtiva = -1;
let conferido = false;

// Devolve as coordenadas de cada letra de uma palavra.
function coordenadas(palavra) {
    const lista = [];
    for (let i = 0; i < palavra.resposta.length; i++) {
        const linha = palavra.linha + (palavra.direcao === 'V' ? i : 0);
        const coluna = palavra.coluna + (palavra.direcao === 'H' ? i : 0);
        lista.push(linha + '-' + coluna);
    }
    return lista;
}

// Registra as casas; uma interseção pertence a duas palavras.
for (let i = 0; i < palavras.length; i++) {
    const palavra = palavras[i];
    coordenadas(palavra).forEach((chave, posicao) => {
        if (!casas[chave]) casas[chave] = { indices: [], numero: 0 };
        casas[chave].indices.push(i);
        if (posicao === 0) casas[chave].numero = palavra.numero;
    });
}

// Renderiza o campo, deixando o gramado visível onde não há letras.
for (let linha = 0; linha < 12; linha++) {
    for (let coluna = 0; coluna < 16; coluna++) {
        const chave = linha + '-' + coluna;
        const div = document.createElement('div');
        div.className = 'casa';
        const casa = casas[chave];
        if (casa) {
            const input = document.createElement('input');
            input.type = 'text';
            input.maxLength = 1;
            input.autocomplete = 'off';
            input.spellcheck = false;
            input.setAttribute('aria-label', 'Linha ' + (linha + 1) + ', coluna ' + (coluna + 1));
            div.appendChild(input);
            casa.input = input;
            casa.div = div;
            if (casa.numero) {
                const numero = document.createElement('span');
                numero.className = 'numero';
                numero.textContent = casa.numero;
                div.appendChild(numero);
            }
            input.addEventListener('focus', () => {
                if (!casa.indices.includes(palavraAtiva)) selecionarPalavra(casa.indices[0]);
                input.select();
            });
            input.addEventListener('input', () => {
                input.value = input.value.normalize('NFD').replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 1);
                if (conferido) limparConferencia();
                if (input.value) moverNaPalavra(chave, 1);
            });
            input.addEventListener('keydown', evento => navegar(evento, chave));
        } else {
            div.setAttribute('aria-hidden', 'true');
        }
        tabuleiro.appendChild(div);
    }
}

// Cria as pistas e seus botões.
palavras.forEach((palavra, indice) => {
    const botao = document.createElement('button');
    botao.type = 'button';
    botao.className = 'pista';
    botao.innerHTML = '<span class="pista-numero">' + palavra.numero + '</span>' +
        '<span class="pista-texto">' + palavra.pista + '<span class="pista-tamanho">' +
        palavra.resposta.length + ' letras <span class="pista-status"></span></span></span>';
    botao.addEventListener('click', () => {
        selecionarPalavra(indice);
        casas[coordenadas(palavra)[0]].input.focus();
    });
    document.getElementById(palavra.direcao === 'H' ? 'horizontais' : 'verticais').appendChild(botao);
    botoesPistas.push(botao);
});

function selecionarPalavra(indice) {
    palavraAtiva = indice;
    for (const chave in casas) casas[chave].div.classList.remove('selecionada');
    botoesPistas.forEach(botao => botao.classList.remove('ativa'));
    if (indice < 0) return;
    const palavra = palavras[indice];
    coordenadas(palavra).forEach(chave => casas[chave].div.classList.add('selecionada'));
    if (botoesPistas[indice]) botoesPistas[indice].classList.add('ativa');
    document.getElementById('pista-ativa').textContent = palavra.numero + (palavra.direcao === 'H' ? ' Horizontal — ' : ' Vertical — ') + palavra.pista;
}

function moverNaPalavra(chave, direcao) {
    if (palavraAtiva < 0) return;
    const lista = coordenadas(palavras[palavraAtiva]);
    const proxima = lista[lista.indexOf(chave) + direcao];
    if (proxima) casas[proxima].input.focus();
}

function navegar(evento, chave) {
    const setas = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0] };
    if (setas[evento.key]) {
        evento.preventDefault();
        const [linha, coluna] = chave.split('-').map(Number);
        const [dl, dc] = setas[evento.key];
        const direcao = dl === 0 ? 'H' : 'V';
        const indice = casas[chave].indices.find(i => palavras[i].direcao === direcao);
        if (indice !== undefined) selecionarPalavra(indice);
        const alvo = casas[(linha + dl) + '-' + (coluna + dc)];
        if (alvo) alvo.input.focus();
    } else if (evento.key === 'Backspace' && !casas[chave].input.value) {
        evento.preventDefault();
        moverNaPalavra(chave, -1);
    }
}

function atualizarPlacar(total) {
    document.getElementById('acertos').textContent = String(total).padStart(2, '0');
    document.getElementById('contador').textContent = total + ' de ' + palavras.length + ' palavras';
    document.getElementById('barra-progresso').style.width = (total / palavras.length * 100) + '%';
    document.querySelector('.progresso').setAttribute('aria-valuenow', total);
}

function limparConferencia() {
    conferido = false;
    estados.length = 0;
    for (const chave in casas) casas[chave].div.classList.remove('certa', 'errada', 'pendente');
    botoesPistas.forEach(botao => {
        botao.classList.remove('certa', 'errada', 'pendente');
        botao.querySelector('.pista-status').textContent = '';
    });
    atualizarPlacar(0);
    mensagem.textContent = 'Respostas alteradas. Confira novamente para atualizar o placar.';
}

function conferir() {
    let total = 0;
    let erradas = 0;
    let pendentes = 0;
    palavras.forEach((palavra, indice) => {
        const letras = coordenadas(palavra).map(chave => casas[chave].input.value);
        let estado;
        if (letras.join('') === palavra.resposta) { estado = 'certa'; total++; }
        else if (letras.includes('')) { estado = 'pendente'; pendentes++; }
        else { estado = 'errada'; erradas++; }
        estados[indice] = estado;
        const botao = botoesPistas[indice];
        botao.classList.remove('certa', 'errada', 'pendente');
        botao.classList.add(estado);
        botao.querySelector('.pista-status').textContent = ' • ' + ({ certa: 'Certa', errada: 'Errada', pendente: 'Incompleta' })[estado];
    });
    // Nos cruzamentos, uma palavra certa tem prioridade na cor da casa.
    // O estado individual de cada palavra sempre aparece ao lado da pista.
    for (const chave in casas) {
        const casa = casas[chave];
        const resultados = casa.indices.map(i => estados[i]);
        casa.div.classList.remove('certa', 'errada', 'pendente');
        casa.div.classList.add(resultados.includes('certa') ? 'certa' : resultados.includes('errada') ? 'errada' : 'pendente');
    }
    conferido = true;
    atualizarPlacar(total);
    mensagem.textContent = total === palavras.length ? 'Golaço! Você acertou todas as palavras. Partida vencida!' :
        total + ' certas, ' + erradas + ' erradas e ' + pendentes + ' incompletas. Continue jogando!';
}

function reiniciar() {
    for (const chave in casas) casas[chave].input.value = '';
    limparConferencia();
    selecionarPalavra(-1);
    document.getElementById('pista-ativa').textContent = 'Clique em uma pista ou casa para começar.';
    mensagem.textContent = 'Nova partida! O placar voltou a zero.';
}

document.getElementById('conferir').addEventListener('click', conferir);
document.getElementById('reiniciar').addEventListener('click', reiniciar);
