const loginView = document.querySelector("#loginView");
const dashboard = document.querySelector("#dashboard");
const loginForm = document.querySelector("#loginForm");
const playerIdInput = document.querySelector("#playerId");
const loginError = document.querySelector("#loginError");
const welcomeName = document.querySelector("#welcomeName");
const logoutButton = document.querySelector("#logoutButton");
const homeScreen = document.querySelector("#homeScreen");
const signalsScreen = document.querySelector("#signalsScreen");
const signalTitle = document.querySelector("#signalTitle");
const aviatorPanel = document.querySelector("#aviatorPanel");
const minesPanel = document.querySelector("#minesPanel");
const aviatorButton = document.querySelector("#aviatorButton");
const minesButton = document.querySelector("#minesButton");
const multiplierValue = document.querySelector("#multiplierValue");
const aviatorStatus = document.querySelector("#aviatorStatus");
const minesBoard = document.querySelector("#minesBoard");
const minesStatus = document.querySelector("#minesStatus");

const state = {
  currentGame: "aviator",
};

function secureRandom() {
  if (window.crypto?.getRandomValues) {
    const values = new Uint32Array(1);
    window.crypto.getRandomValues(values);
    return values[0] / 4294967296;
  }
  return Math.random();
}

function setLoggedIn(playerId) {
  sessionStorage.setItem("topsignal-player", playerId);
  welcomeName.textContent = `ID ${playerId}`;
  loginView.classList.add("hidden");
  dashboard.classList.remove("hidden");
  showHome();
}

function setLoggedOut() {
  sessionStorage.removeItem("topsignal-player");
  dashboard.classList.add("hidden");
  loginView.classList.remove("hidden");
  playerIdInput.value = "";
  loginError.textContent = "";
  window.setTimeout(() => playerIdInput.focus(), 80);
}

function updateNavigation(active) {
  document.querySelectorAll("[data-nav]").forEach((button) => {
    button.classList.toggle("active", button.dataset.nav === active);
  });
}

function showHome() {
  homeScreen.classList.add("active");
  signalsScreen.classList.remove("active");
  updateNavigation("home");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openGame(game) {
  state.currentGame = game;
  homeScreen.classList.remove("active");
  signalsScreen.classList.add("active");
  aviatorPanel.classList.toggle("hidden", game !== "aviator");
  minesPanel.classList.toggle("hidden", game !== "mines");
  signalTitle.textContent = game === "aviator" ? "Aviator" : "Mines";
  updateNavigation(game);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function generateMultiplier() {
  const value = (100 + Math.floor(secureRandom() * 101)) / 100;
  return `X${value.toFixed(2)}`;
}

function setLoading(button, loading) {
  button.disabled = loading;
  button.classList.toggle("loading", loading);
  button.setAttribute("aria-busy", String(loading));
}

function runAviatorSignal() {
  setLoading(aviatorButton, true);
  aviatorPanel.classList.add("is-loading");
  aviatorStatus.textContent = "Generando…";
  multiplierValue.textContent = "—";

  window.setTimeout(() => {
    const result = generateMultiplier();
    multiplierValue.textContent = result;
    multiplierValue.classList.remove("result-pop");
    void multiplierValue.offsetWidth;
    multiplierValue.classList.add("result-pop");
    aviatorStatus.textContent = "Señal aleatoria";
    aviatorPanel.classList.remove("is-loading");
    setLoading(aviatorButton, false);
  }, 700);
}

function buildMinesBoard() {
  minesBoard.replaceChildren();
  for (let index = 0; index < 25; index += 1) {
    const cell = document.createElement("div");
    cell.className = "mine-cell";
    cell.dataset.cell = String(index + 1);
    cell.setAttribute("aria-label", `Casilla ${index + 1}`);
    minesBoard.appendChild(cell);
  }
}

function chooseUniqueCells(amount) {
  const available = Array.from({ length: 25 }, (_, index) => index);
  const selected = [];

  while (selected.length < amount) {
    const pick = Math.floor(secureRandom() * available.length);
    selected.push(available.splice(pick, 1)[0]);
  }

  return selected;
}

function runMinesSignal() {
  setLoading(minesButton, true);
  minesStatus.textContent = "Analizando el tablero…";
  document.querySelectorAll(".mine-cell").forEach((cell) => cell.classList.remove("safe"));

  window.setTimeout(() => {
    const safeCount = secureRandom() < 0.5 ? 1 : 2;
    const selected = chooseUniqueCells(safeCount);
    const cells = [...document.querySelectorAll(".mine-cell")];

    selected.forEach((cellIndex, order) => {
      window.setTimeout(() => cells[cellIndex].classList.add("safe"), order * 100);
    });

    minesStatus.textContent = `${safeCount} casillas sugeridas`;
    setLoading(minesButton, false);
  }, 650);
}

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const playerId = playerIdInput.value.trim();

  if (!playerId) {
    loginError.textContent = "Introduce un ID para continuar.";
    playerIdInput.focus();
    return;
  }

  loginError.textContent = "";
  setLoggedIn(playerId);
});

playerIdInput.addEventListener("input", () => {
  loginError.textContent = "";
});

logoutButton.addEventListener("click", setLoggedOut);
document.querySelector("#backButton").addEventListener("click", showHome);
aviatorButton.addEventListener("click", runAviatorSignal);
minesButton.addEventListener("click", runMinesSignal);

document.querySelectorAll("[data-open-game]").forEach((button) => {
  button.addEventListener("click", () => openGame(button.dataset.openGame));
});

document.querySelectorAll("[data-nav]").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.dataset.nav === "home") showHome();
    else openGame(button.dataset.nav);
  });
});

buildMinesBoard();

const savedPlayer = sessionStorage.getItem("topsignal-player");
if (savedPlayer) setLoggedIn(savedPlayer);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
}
