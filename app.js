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

const chickenPanel = document.querySelector("#chickenPanel");
const chickenButton = document.querySelector("#chickenButton");
const chickenValue = document.querySelector("#chickenValue");
const chickenStatus = document.querySelector("#chickenStatus");
const roadChicken = document.querySelector("#roadChicken");
const gemMarkup = "<svg viewBox=\"0 0 64 64\" aria-hidden=\"true\"><path d=\"m7 23 13-14h24l13 14-25 33Z\" fill=\"#ffd36b\"/><path d=\"m7 23 25 33-12-33 12-14 12 14-12 33 25-33Z\" fill=\"#d99a1f\"/><path d=\"M7 23h50M20 9l-1 14h26L44 9\" fill=\"none\" stroke=\"#fff3cf\" stroke-width=\"2\"/></svg>";
const ALLOWED_PLAYER_ID = "1873000020";
const LIMITED_PLAYER_ID = "1373000020";
const KNOWN_PLAYER_IDS = [ALLOWED_PLAYER_ID, LIMITED_PLAYER_ID];
const PLAYER_ID_LENGTH = 10;
const LOCK_MARKUP = "<svg viewBox=\"0 0 24 24\" aria-hidden=\"true\"><rect x=\"4.5\" y=\"10.5\" width=\"15\" height=\"10\" rx=\"2.5\"/><path d=\"M8 10.5V7a4 4 0 0 1 8 0v3.5\"/></svg>";

const state = {
  currentGame: "aviator",
  gamesLocked: false,
};

function secureRandom() {
  if (window.crypto?.getRandomValues) {
    const values = new Uint32Array(1);
    window.crypto.getRandomValues(values);
    return values[0] / 4294967296;
  }
  return Math.random();
}

function buildLockedCards() {
  document.querySelectorAll("[data-open-game]").forEach((card) => {
    if (card.parentElement?.classList.contains("flip-face")) return;

    const flip = document.createElement("div");
    flip.className = "flip-card";
    const inner = document.createElement("div");
    inner.className = "flip-inner";
    const front = document.createElement("div");
    front.className = "flip-face";
    const back = document.createElement("button");
    back.type = "button";
    back.className = "game-card flip-face flip-back";
    back.innerHTML = `<span class="lock-icon" aria-hidden="true">${LOCK_MARKUP}</span><span class="lock-text">Contacta a tu gerente</span>`;
    flip.addEventListener(
      "click",
      (event) => {
        if (!flip.classList.contains("flipped")) return;
        event.stopPropagation();
        event.preventDefault();
        flip.classList.remove("flipped");
      },
      true
    );

    card.replaceWith(flip);
    front.appendChild(card);
    inner.append(front, back);
    flip.appendChild(inner);
  });
}

function flipLockedCard(game) {
  document.querySelectorAll(".flip-card").forEach((flip) => {
    const isTarget = flip.querySelector("[data-open-game]")?.dataset.openGame === game;
    flip.classList.toggle("flipped", isTarget);
  });
}

function resetLockedCards() {
  document.querySelectorAll(".flip-card.flipped").forEach((flip) => flip.classList.remove("flipped"));
}

function showLoginError(message, blocked) {
  loginError.textContent = message;
  loginError.classList.toggle("is-blocked", Boolean(blocked));
}

function clearLoginError() {
  loginError.textContent = "";
  loginError.classList.remove("is-blocked");
}

function setLoggedIn(playerId) {
  sessionStorage.setItem("topsignal-player", playerId);
  state.gamesLocked = playerId === LIMITED_PLAYER_ID;
  document.body.classList.toggle("games-locked", state.gamesLocked);
  resetLockedCards();
  welcomeName.textContent = `ID ${playerId}`;
  loginView.classList.add("hidden");
  dashboard.classList.remove("hidden");
  showHome();
}

function setLoggedOut() {
  sessionStorage.removeItem("topsignal-player");
  state.gamesLocked = false;
  document.body.classList.remove("games-locked");
  resetLockedCards();
  dashboard.classList.add("hidden");
  loginView.classList.remove("hidden");
  playerIdInput.value = "";
  clearLoginError();
  window.setTimeout(() => playerIdInput.focus(), 80);
}

function updateNavigation(active) {
  document.querySelectorAll("[data-nav]").forEach((button) => {
    button.classList.toggle("active", button.dataset.nav === active);
  });
}

function showHome() {
  if (!state.gamesLocked) resetLockedCards();
  homeScreen.classList.add("active");
  signalsScreen.classList.remove("active");
  updateNavigation("home");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openGame(game) {
  if (state.gamesLocked) {
    showHome();
    flipLockedCard(game);
    return;
  }

  state.currentGame = game;
  homeScreen.classList.remove("active");
  signalsScreen.classList.add("active");
  aviatorPanel.classList.toggle("hidden", game !== "aviator");
  minesPanel.classList.toggle("hidden", game !== "mines");
  chickenPanel.classList.toggle("hidden", game !== "chicken");
  signalTitle.textContent = ({ aviator: "Aviator", mines: "Mines", chicken: "Chicken Road" })[game];
  updateNavigation(game);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function generateMultiplier() {
  const value = (100 + Math.floor(secureRandom() * 101)) / 100;
  return `${value.toFixed(2)}×`;
}

const signalButtons = [aviatorButton, minesButton, chickenButton];
const cooldownLabels = signalButtons.map(button => button.querySelector(".button-copy").textContent);
const cooldownStatus = document.querySelector("#cooldownStatus");
let generating = false;
let nextSignalAt = Number(sessionStorage.getItem("gptsignal-next-signal")) || 0;
function syncCooldown() {
  const remaining = Math.max(0, Math.ceil((nextSignalAt - Date.now()) / 1000));
  signalButtons.forEach((button, index) => {
    button.disabled = generating || remaining > 0;
    if (!button.classList.contains("loading")) {
      button.querySelector(".button-copy").textContent = remaining ? `ESPERA ${remaining} s` : cooldownLabels[index];
    }
  });
  cooldownStatus.textContent = remaining ? `Próxima señal en ${remaining} s` : "";
}
window.setInterval(syncCooldown, 250);
syncCooldown();

function setLoading(button, loading) {
  generating = loading;
  button.classList.toggle("loading", loading);
  button.setAttribute("aria-busy", String(loading));
  if (!loading) {
    nextSignalAt = Date.now() + 10000;
    sessionStorage.setItem("gptsignal-next-signal", String(nextSignalAt));
  }
  syncCooldown();
}

function runAviatorSignal() {
  if (aviatorButton.disabled) return;
  setLoading(aviatorButton, true);
  aviatorPanel.classList.add("is-loading");
  aviatorStatus.textContent = "Generando señal…";
  multiplierValue.textContent = "—";

  window.setTimeout(() => {
    const result = generateMultiplier();
    multiplierValue.textContent = result;
    multiplierValue.classList.remove("result-pop");
    void multiplierValue.offsetWidth;
    multiplierValue.classList.add("result-pop");
    aviatorStatus.textContent = "Listo";
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
    cell.textContent = String(index + 1);
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
  if (minesButton.disabled) return;
  setLoading(minesButton, true);
  minesStatus.textContent = "Eligiendo casillas…";
  const cells = [...minesBoard.children];
  cells.forEach((cell, index) => {
    cell.classList.remove("safe");
    cell.textContent = String(index + 1);
    cell.setAttribute("aria-label", `Casilla ${index + 1}`);
  });
  window.setTimeout(() => {
    const selected = chooseUniqueCells(secureRandom() < 0.5 ? 1 : 2).sort((a,b) => a-b);
    selected.forEach(index => {
      cells[index].classList.add("safe");
      cells[index].innerHTML = gemMarkup + `<span class="cell-number">${index + 1}</span>`;
      cells[index].setAttribute("aria-label", `Casilla ${index + 1}: diamante`);
    });
    minesStatus.textContent = `Casillas: ${selected.map(index => index + 1).join(" y ")} · ${selected.length} ${selected.length === 1 ? "diamante" : "diamantes"}`;
    setLoading(minesButton, false);
  }, 650);
}

function runChickenSignal() {
  if (chickenButton.disabled) return;
  setLoading(chickenButton, true);
  chickenValue.textContent = "—";
  chickenStatus.textContent = "Generando ruta…";
  roadChicken.style.left = "0%";
  document.querySelectorAll(".road-step").forEach(step => step.classList.remove("reached"));
  window.setTimeout(() => {
    const steps = 1 + Math.floor(secureRandom() * 5);
    roadChicken.style.left = `${(steps - 1) * 20 + 1}%`;
    document.querySelectorAll(".road-step").forEach((step, index) => step.classList.toggle("reached", index < steps));
    chickenValue.textContent = `${steps} ${steps === 1 ? "paso" : "pasos"}`;
    chickenStatus.textContent = `Ruta: paso ${steps} de 5`;
    setLoading(chickenButton, false);
  }, 700);
}
for (let i = 1; i <= 5; i++) {
  const step = document.createElement("span");
  step.className = "road-step";
  step.textContent = i;
  step.setAttribute("aria-label", `Paso ${i}`);
  document.querySelector("#roadTrack").appendChild(step);
}
chickenButton.addEventListener("click", runChickenSignal);

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const playerId = playerIdInput.value.replace(/\D/g, "").slice(0, PLAYER_ID_LENGTH);
  playerIdInput.value = playerId;

  if (!playerId) {
    showLoginError("Ingresa tu ID de jugador 1xBet para continuar.", false);
    playerIdInput.focus();
    return;
  }

  if (playerId.length < PLAYER_ID_LENGTH) {
    showLoginError(`El ID tiene ${PLAYER_ID_LENGTH} dígitos — ingresaste ${playerId.length}.`, false);
    playerIdInput.focus();
    return;
  }

  if (!KNOWN_PLAYER_IDS.includes(playerId)) {
    showLoginError("Acceso bloqueado", true);
    playerIdInput.focus();
    playerIdInput.select();
    return;
  }

  clearLoginError();
  setLoggedIn(playerId);
});

playerIdInput.addEventListener("input", () => {
  const digits = playerIdInput.value.replace(/\D/g, "").slice(0, PLAYER_ID_LENGTH);
  if (playerIdInput.value !== digits) playerIdInput.value = digits;
  clearLoginError();
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
buildLockedCards();

const savedPlayer = sessionStorage.getItem("topsignal-player");
if (KNOWN_PLAYER_IDS.includes(savedPlayer)) setLoggedIn(savedPlayer);
else sessionStorage.removeItem("topsignal-player");

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
}
