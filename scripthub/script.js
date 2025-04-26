const proxAPI = "https://scriptblox-api-proxy.vercel.app/api/fetch";
const searchproxAPI = "https://scriptblox-api-proxy.vercel.app/api/search";
const scriptsGrid = document.getElementById("scripts-grid");
const searchInput = document.getElementById("search-input");
const filter = document.getElementById("filter-select");
const search = document.getElementById("search-button");
const prev = document.getElementById("prev-button");
const next = document.getElementById("next-button");
const error_msg = document.getElementById("error-message");
const modal = document.getElementById("script-details-modal");
const modalTitle = document.getElementById("modal-title");
const modalDetails = document.getElementById("modal-details");
const closeModal = document.getElementById("close-modal");
const S_Cache = new Map();

let currentPage = 1;
let isModes = false;
let Querys = "";
let Modes = "";

async function fetchScripts(page = 1) {
    if (S_Cache.has(page)) {
        displayScripts(S_Cache.get(page));
        return;
    }
    try {
        const response = await fetch(`${proxAPI}?page=${page}`);
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        const data = await response.json();
        if (!data.result || !data.result.scripts.length) throw new Error("No scripts found.");

        S_Cache.set(page, data.result.scripts);
        displayScripts(data.result.scripts);
        error_msg.textContent = "";
    } catch (error) {
        displayError(error.message);
    }
}

async function searchScripts(query, mode, page = 1) {
    try {
        const url = new URL(searchproxAPI);
        url.searchParams.append("q", query);
        if (mode) url.searchParams.append("mode", mode);
        url.searchParams.append("page", page);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        const data = await response.json();
        if (!data.result || !data.result.scripts.length) throw new Error("No search results found.");
        displayScripts(data.result.scripts);
        error_msg.textContent = "";
    } catch (error) {
        displayError(error.message);
    }
}

function displayScripts(scripts) {
    scriptsGrid.innerHTML = "";
    scripts.forEach((script) => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <h2><i class="fas fa-file-alt"></i> ${script.title}</h2>
            <p><i class="fas fa-gamepad"></i> Game: ${script.game?.name || "Universal"}</p>
        `;
        card.addEventListener("click", () => displayDetails(script));
        scriptsGrid.appendChild(card);
    });
}

function displayDetails(script) {
    modalTitle.innerHTML = `<i class="fas fa-info-circle"></i> ${script.title}`;
    modalDetails.innerHTML = `<p><i class="fas fa-code"></i> ${script.script || "No script available."}</p>`;
    modal.style.display = "flex";
}

function displayError(message) {
    scriptsGrid.innerHTML = "";
    error_msg.textContent = message;
}

search.addEventListener("click", () => {
    Querys = searchInput.value.trim();
    Modes = filter.value;
    currentPage = 1;
    isModes = !!Querys;
    isModes ? searchScripts(Querys, Modes, currentPage) : fetchScripts(currentPage);
});

prev.addEventListener("click", () => {
    if (currentPage > 1) fetchScripts(--currentPage);
});

next.addEventListener("click", () => fetchScripts(++currentPage));

closeModal.addEventListener("click", () => modal.style.display = "none");

fetchScripts();
