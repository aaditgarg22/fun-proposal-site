const scenes = [...document.querySelectorAll(".scene")];
const sceneByName = Object.fromEntries(scenes.map((scene) => [scene.dataset.scene, scene]));
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const evasiveState = new WeakMap();

function showScene(name) {
  scenes.forEach((scene) => {
    const active = scene.dataset.scene === name;
    scene.hidden = !active;
    scene.classList.toggle("is-active", active);
  });
  window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
}

function getButtonBounds(button, padding = 12) {
  const width = button.offsetWidth;
  const height = button.offsetHeight;
  const maxX = Math.max(padding, window.innerWidth - width - padding);
  const maxY = Math.max(padding, window.innerHeight - height - padding);
  return { width, height, maxX, maxY, padding };
}

function moveButton(button, intensity = 1) {
  const bounds = getButtonBounds(button);
  const current = evasiveState.get(button) || { x: 0, y: 0 };
  const angle = Math.random() * Math.PI * 2;
  const distance = (48 + Math.random() * 92) * intensity;
  const rect = button.getBoundingClientRect();
  const baseX = rect.left + current.x;
  const baseY = rect.top + current.y;
  const targetLeft = Math.min(bounds.maxX, Math.max(bounds.padding, baseX + Math.cos(angle) * distance));
  const targetTop = Math.min(bounds.maxY, Math.max(bounds.padding, baseY + Math.sin(angle) * distance));
  const x = targetLeft - rect.left;
  const y = targetTop - rect.top;

  evasiveState.set(button, { x, y });
  button.style.transform = `translate3d(${x}px, ${y}px, 0)`;
}

function resetButton(button) {
  evasiveState.delete(button);
  button.style.transform = "";
}

function setupEvasion(button, intensity) {
  const evade = (event) => {
    if (event.pointerType === "touch") return;
    moveButton(button, intensity);
  };
  button.addEventListener("pointerenter", evade);
  button.addEventListener("pointermove", (event) => {
    if (event.pointerType === "mouse" && intensity > 1.25) evade(event);
  });
  button.addEventListener("focus", () => {
    if (!prefersReducedMotion) moveButton(button, intensity);
  });
  window.addEventListener("resize", () => resetButton(button));
}

document.querySelectorAll("[data-go]").forEach((button) => {
  button.addEventListener("click", (event) => {
    const destination = button.dataset.go;
    if (destination === "none") {
      event.preventDefault();
      return;
    }
    if (destination && sceneByName[destination]) {
      resetButton(button);
      showScene(destination);
    }
  });
});

setupEvasion(document.querySelector(".evasive-gentle"), .65);
setupEvasion(document.querySelector(".evasive-bold"), 1.05);
setupEvasion(document.querySelector(".evasive-extreme"), 1.8);

function buildHeart() {
  const heart = document.querySelector("#symbol-heart");
  if (!heart) return;
  const symbols = ["♥", "♡", "✧", "✦", "★", "$", "#", "*", "always", "yours", "love"];
  const colors = ["#9e3f56", "#d97787", "#f7b2b5", "#fff8f1", "#6f273d"];
  const total = 118;

  for (let i = 0; i < total; i += 1) {
    const t = (Math.PI * 2 * i) / total;
    const scale = 1 + (i % 5) * 0.04;
    const x = 16 * Math.sin(t) ** 3;
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    const depth = ((i * 37) % 70) - 35;
    const particle = document.createElement("span");
    particle.className = "heart-particle";
    particle.textContent = symbols[i % symbols.length];
    particle.style.setProperty("--x", `${x * scale * 1.05}%`);
    particle.style.setProperty("--y", `${y * scale * 1.05}%`);
    particle.style.setProperty("--z", `${depth}px`);
    particle.style.setProperty("--r", `${((i * 23) % 34) - 17}deg`);
    particle.style.setProperty("--duration", `${2.2 + (i % 8) * 0.22}s`);
    particle.style.setProperty("--delay", `${-((i % 11) * 0.23)}s`);
    particle.style.color = colors[i % colors.length];
    particle.style.fontSize = `${0.62 + (i % 7) * 0.12}rem`;
    particle.style.opacity = `${0.58 + (i % 5) * 0.09}`;
    heart.appendChild(particle);
  }
}

buildHeart();
