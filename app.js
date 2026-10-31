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
const gemMarkup = "<svg viewBox=\"0 0 64 64\" aria-hidden=\"true\"><path d=\"m7 23 13-14h24l13 14-25 33Z\" fill=\"#38e8bc\"/><path d=\"m7 23 25 33-12-33 12-14 12 14-12 33 25-33Z\" fill=\"#17a68a\"/><path d=\"M7 23h50M20 9l-1 14h26L44 9\" fill=\"none\" stroke=\"#b7ffed\" stroke-width=\"2\"/></svg>";
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
      button.querySelector(".button-copy").textContent = remaining ? `ПОДОЖДИТЕ ${remaining} с` : cooldownLabels[index];
    }
  });
  cooldownStatus.textContent = remaining ? `Следующий сигнал через ${remaining} с` : "";
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
  aviatorStatus.textContent = "Создаём сигнал…";
  multiplierValue.textContent = "—";

  window.setTimeout(() => {
    const result = generateMultiplier();
    multiplierValue.textContent = result;
    multiplierValue.classList.remove("result-pop");
    void multiplierValue.offsetWidth;
    multiplierValue.classList.add("result-pop");
    aviatorStatus.textContent = "Случайный сигнал";
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
    cell.setAttribute("aria-label", `Клетка ${index + 1}`);
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
  minesStatus.textContent = "Выбираем клетки…";
  const cells = [...minesBoard.children];
  cells.forEach((cell, index) => {
    cell.classList.remove("safe");
    cell.textContent = String(index + 1);
    cell.setAttribute("aria-label", `Клетка ${index + 1}`);
  });
  window.setTimeout(() => {
    const selected = chooseUniqueCells(secureRandom() < 0.5 ? 1 : 2).sort((a,b) => a-b);
    selected.forEach(index => {
      cells[index].classList.add("safe");
      cells[index].innerHTML = gemMarkup + `<span class="cell-number">${index + 1}</span>`;
      cells[index].setAttribute("aria-label", `Клетка ${index + 1}: демонстрационный алмаз`);
    });
    minesStatus.textContent = `Клетки: ${selected.map(index => index + 1).join(" и ")} · ${selected.length} ${selected.length === 1 ? "алмаз" : "алмаза"}`;
    setLoading(minesButton, false);
  }, 650);
}

function runChickenSignal() {
  if (chickenButton.disabled) return;
  setLoading(chickenButton, true);
  chickenValue.textContent = "—";
  chickenStatus.textContent = "Создаём маршрут…";
  roadChicken.style.left = "0%";
  document.querySelectorAll(".road-step").forEach(step => step.classList.remove("reached"));
  window.setTimeout(() => {
    const steps = 1 + Math.floor(secureRandom() * 5);
    roadChicken.style.left = `${(steps - 1) * 20 + 1}%`;
    document.querySelectorAll(".road-step").forEach((step, index) => step.classList.toggle("reached", index < steps));
    chickenValue.textContent = `${steps} ${steps === 1 ? "шаг" : steps < 5 ? "шага" : "шагов"}`;
    chickenStatus.textContent = `Случайный маршрут: шаг ${steps} из 5`;
    setLoading(chickenButton, false);
  }, 700);
}
for (let i = 1; i <= 5; i++) {
  const step = document.createElement("span");
  step.className = "road-step";
  step.textContent = i;
  step.setAttribute("aria-label", `Шаг ${i}`);
  document.querySelector("#roadTrack").appendChild(step);
}
chickenButton.addEventListener("click", runChickenSignal);

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const playerId = playerIdInput.value.trim();

  if (!playerId) {
    loginError.textContent = "Введите свой ID игрока 1xBet для продолжения.";
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
