"use strict";

let paisSelecionado = null;
const body = document.getElementById('body');

// Criamos os elementos mas não adicionamos ao body ainda
const containerInfo = document.createElement('div');
containerInfo.id = "infoPais";
containerInfo.style.display = "none"; // Escondemos inicialmente

// Criando as divs para exibir informações do país
const nomeDiv = document.createElement('div');
const capitalDiv = document.createElement('div');
const populacaoDiv = document.createElement('div');
const continenteDiv = document.createElement('div');
const bandeiraDiv = document.createElement('div');
const bandeira = document.createElement('img');

bandeira.style.width = "100px";

containerInfo.appendChild(nomeDiv);
containerInfo.appendChild(capitalDiv);
containerInfo.appendChild(populacaoDiv);
containerInfo.appendChild(continenteDiv);
containerInfo.appendChild(bandeiraDiv);
bandeiraDiv.appendChild(bandeira);
body.appendChild(containerInfo);

const mapeamentoPaises = {
    "United States of America": "United States",
    "Russia": "Russian Federation",
    "South Korea": "Korea, Republic of",
    "North Korea": "Korea, Democratic People's Republic of",
    "Vietnam": "Viet Nam",
    "Czech Republic": "Czechia",
    "Turkey": "Türkiye",
    "Iran": "Iran, Islamic Republic of",
    "Syria": "Syrian Arab Republic",
    "Brunei": "Brunei Darussalam",
    "Laos": "Lao People's Democratic Republic"
};

function normalizarNomePais(nome) {
    return mapeamentoPaises[nome] || nome;
}

let zoomLevel = 1;
const svg = document.querySelector("svg");

const zoomInButton = document.createElement("button");
zoomInButton.style.position = "fixed";
zoomInButton.style.bottom = "10px";
zoomInButton.style.right = "60px";
zoomInButton.style.padding = "10px";
zoomInButton.style.backgroundColor = "transparent";
zoomInButton.style.border = "none";
zoomInButton.style.cursor = "pointer";
const plusIcon = document.createElement("img");
plusIcon.src = "./img/plus.png";
plusIcon.alt = "Zoom In";
plusIcon.style.width = "30px";
zoomInButton.appendChild(plusIcon);
body.appendChild(zoomInButton);

const zoomOutButton = document.createElement("button");
zoomOutButton.style.position = "fixed";
zoomOutButton.style.bottom = "10px";
zoomOutButton.style.right = "10px";
zoomOutButton.style.padding = "10px";
zoomOutButton.style.backgroundColor = "transparent";
zoomOutButton.style.border = "none";
zoomOutButton.style.cursor = "pointer";
const minusIcon = document.createElement("img");
minusIcon.src = "./img/minus.png";
minusIcon.alt = "Zoom Out";
minusIcon.style.width = "30px";
zoomOutButton.appendChild(minusIcon);
body.appendChild(zoomOutButton);

zoomInButton.addEventListener("click", () => {
    if (zoomLevel < 10) {
        zoomLevel += 0.1;
        svg.style.transform = `scale(${zoomLevel}) translate(${translateX}px, ${translateY}px)`;
    }
});

zoomOutButton.addEventListener("click", () => {
    if (zoomLevel > 1) {
        zoomLevel -= 0.1;
        svg.style.transform = `scale(${zoomLevel}) translate(${translateX}px, ${translateY}px)`;
    }
});

let isDragging = false;
let startX, startY, translateX = 0, translateY = 0;

function startDrag(e) {
    if (e.button === 0 || e.button === 2) {
        isDragging = true;
        startX = e.clientX - translateX;
        startY = e.clientY - translateY;
        svg.style.cursor = "grabbing";
    }
}

function startTouchDrag(e) {
    isDragging = true;
    startX = e.touches[0].clientX - translateX;
    startY = e.touches[0].clientY - translateY;
    svg.style.cursor = "grabbing";
}

// Função para parar o drag e armazenar a posição final
function stopDrag() {
    isDragging = false;
    svg.style.cursor = "grab";
}

// Função otimizada para movimentação, mas apenas no final
function moveDrag(e) {
    if (isDragging) {
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        translateX = clientX - startX;
        translateY = clientY - startY;

        // Apenas aplica a transformação no final do movimento
        requestAnimationFrame(() => {
            svg.style.transform = `scale(${zoomLevel}) translate(${translateX}px, ${translateY}px)`;
        });
    }
}

// Adiciona os eventos de mouse e touch
svg.addEventListener("mousedown", startDrag);
svg.addEventListener("touchstart", startTouchDrag);

window.addEventListener("mouseup", stopDrag);
window.addEventListener("touchend", stopDrag);

window.addEventListener("mousemove", moveDrag);
window.addEventListener("touchmove", moveDrag);

document.querySelectorAll("svg path").forEach(pais => {
    pais.addEventListener("click", function () {
        if (paisSelecionado) {
            paisSelecionado.setAttribute("fill", "#ececec");
        }
        this.setAttribute("fill", "red");
        paisSelecionado = this;

        let nomePais = this.getAttribute("name") || this.getAttribute("id") || this.getAttribute("class");
        nomePais = normalizarNomePais(nomePais);

        containerInfo.style.display = "block";
        nomeDiv.textContent = `Carregando dados de ${nomePais}...`;
        capitalDiv.textContent = "";
        populacaoDiv.textContent = "";
        continenteDiv.textContent = "";
        bandeira.src = "";

        fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(nomePais)}`)
            .then(response => response.json())
            .then(data => {
                if (!Array.isArray(data) || data.length === 0) {
                    nomeDiv.textContent = "País não encontrado!";
                    return;
                }
                let paisInfo = data.find(p => p.name.common.toLowerCase() === nomePais.toLowerCase()) || data[0];
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
