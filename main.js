"use strict";

let paisSelecionado = null;
const body = document.getElementById('body');

// Criamos os elementos uma vez para evitar múltiplas criações
const containerInfo = document.createElement('div');
containerInfo.id = "infoPais";

// Criando as divs para exibir informações do país
const nomeDiv = document.createElement('div');
const capitalDiv = document.createElement('div');
const populacaoDiv = document.createElement('div');
const continenteDiv = document.createElement('div');
const bandeiraDiv = document.createElement('div');
const bandeira = document.createElement('img'); // Imagem da bandeira

bandeira.style.width = "100px"; // Tamanho fixo da bandeira

// Adicionamos os elementos ao container
containerInfo.appendChild(nomeDiv);
containerInfo.appendChild(capitalDiv);
containerInfo.appendChild(populacaoDiv);
containerInfo.appendChild(continenteDiv);
containerInfo.appendChild(bandeiraDiv);
bandeiraDiv.appendChild(bandeira);

// Adicionando o container ao body
body.appendChild(containerInfo);

// Função para zoom in e zoom out
let zoomLevel = 1; // Tamanho inicial do zoom (1x)
const svg = document.querySelector("svg");

// Criando o botão de Zoom In com o ícone de mais (plus.png)
const zoomInButton = document.createElement("button");
zoomInButton.style.position = "fixed";
zoomInButton.style.bottom = "10px";
zoomInButton.style.right = "60px";
zoomInButton.style.padding = "10px";
zoomInButton.style.backgroundColor = "transparent";
zoomInButton.style.border = "none";
zoomInButton.style.cursor = "pointer";

const plusIcon = document.createElement("img");
plusIcon.src = "./img/plus.png"; // Caminho para o ícone de mais
plusIcon.alt = "Zoom In";
plusIcon.style.width = "30px"; // Tamanho do ícone
zoomInButton.appendChild(plusIcon);
body.appendChild(zoomInButton);

// Criando o botão de Zoom Out com o ícone de menos (minus.png)
const zoomOutButton = document.createElement("button");
zoomOutButton.style.position = "fixed";
zoomOutButton.style.bottom = "10px";
zoomOutButton.style.right = "10px";
zoomOutButton.style.padding = "10px";
zoomOutButton.style.backgroundColor = "transparent";
zoomOutButton.style.border = "none";
zoomOutButton.style.cursor = "pointer";

const minusIcon = document.createElement("img");
minusIcon.src = "./img/minus.png"; // Caminho para o ícone de menos
minusIcon.alt = "Zoom Out";
minusIcon.style.width = "30px"; // Tamanho do ícone
zoomOutButton.appendChild(minusIcon);
body.appendChild(zoomOutButton);

// Lógica de zoom
zoomInButton.addEventListener("click", () => {
    // Limita o zoom máximo a 10x
    if (zoomLevel < 10) {
        zoomLevel += 0.1;
        svg.style.transform = `scale(${zoomLevel})`;
        adjustSvgPosition();
    }
});

zoomOutButton.addEventListener("click", () => {
    // Limita o zoom mínimo a 1x
    if (zoomLevel > 1) {
        zoomLevel -= 0.1;
        svg.style.transform = `scale(${zoomLevel})`;
        adjustSvgPosition();
    }
});

// Função para ajustar a posição do SVG quando o zoom é alterado
function adjustSvgPosition() {
    const scale = zoomLevel;
    svg.style.transformOrigin = "50% 50%"; // Ajusta o ponto de origem do zoom para o centro
    // Remove qualquer barra de rolagem quando o zoom estiver em 1x
    if (zoomLevel === 1) {
        svg.style.transform = "scale(1)";
        document.body.style.overflow = "hidden"; // Remove barras de rolagem
    } else {
        document.body.style.overflow = "auto"; // Adiciona barras de rolagem quando zoom não for 1x
    }
}

// Função para permitir que o usuário mova o mapa com o botão esquerdo do mouse
let isDragging = false;
let startX, startY;

svg.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.clientX - svg.getBoundingClientRect().left; // Ajuste para pegar a posição correta no canvas
    startY = e.clientY - svg.getBoundingClientRect().top;
    svg.style.cursor = "grabbing";
});

window.addEventListener("mouseup", () => {
    isDragging = false;
    svg.style.cursor = "grab";
});

window.addEventListener("mousemove", (e) => {
    if (isDragging) {
        const x = e.clientX - startX;
        const y = e.clientY - startY;
        svg.style.transform = `scale(${zoomLevel}) translate(${x}px, ${y}px)`;
    }
});

// Função de scroll para mover o mapa
window.addEventListener("wheel", (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.1 : -0.1; // Define a direção do zoom com scroll

    zoomLevel += delta;
    if (zoomLevel < 1) zoomLevel = 1; // Limita o zoom mínimo a 1x
    if (zoomLevel > 10) zoomLevel = 10; // Limita o zoom máximo a 10x

    svg.style.transform = `scale(${zoomLevel})`;
    adjustSvgPosition();
});

document.querySelectorAll("svg path").forEach(pais => {
    pais.addEventListener("click", function () {
        if (paisSelecionado) {
            paisSelecionado.setAttribute("fill", "#ececec"); // Volta ao normal
        }
        this.setAttribute("fill", "red"); // Muda a cor do país clicado
        paisSelecionado = this;

        let nomePais = this.getAttribute("name") || this.getAttribute("id") || this.getAttribute("class");

        // Exibimos que os dados estão sendo carregados
        nomeDiv.textContent = `Carregando dados de ${nomePais}...`;
        capitalDiv.textContent = "";
        populacaoDiv.textContent = "";
        continenteDiv.textContent = "";
        bandeira.src = "";

        // Buscar dados do país na API
        fetch(`https://restcountries.com/v3.1/name/${nomePais}`)
            .then(response => response.json())
            .then(data => {
                if (!Array.isArray(data) || data.length === 0) {
                    nomeDiv.textContent = "País não encontrado!";
                    return;
                }

                // Filtramos para pegar o país correto (evitar territórios menores)
                let paisInfo = data.find(p => p.cca2 === nomePais || p.cca3 === nomePais || p.name.common.toLowerCase() === nomePais.toLowerCase()) || data[0];

                nomeDiv.textContent = `País: ${paisInfo.name.common}`;
                capitalDiv.textContent = `Capital: ${paisInfo.capital ? paisInfo.capital[0] : "Não informado"}`;
                populacaoDiv.textContent = `População: ${paisInfo.population.toLocaleString()}`;
                continenteDiv.textContent = `Continente: ${paisInfo.continents[0]}`;
                bandeira.src = paisInfo.flags.svg;
                bandeira.alt = `Bandeira de ${paisInfo.name.common}`;
            })
            .catch(error => {
                nomeDiv.textContent = "Erro ao buscar os dados!";
                console.error(error);
            });
    });
});
