// Contact-sheet review interactions.
// Only loaded on /review/* pages (the base layout conditionally injects it).
//
// State model: a single localStorage key "cuts" holds an object
//   { "src/images/gallery/<area>/<cat>/<file>": true, ... }
// Adds a sticky bottom bar with cut count + Export/Clear buttons.

(function () {
  const STORAGE_KEY = "cuts";

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }
  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
  function countCuts(state) {
    return Object.values(state).filter(Boolean).length;
  }

  const items = Array.from(document.querySelectorAll(".review-item"));
  if (!items.length) {
    // We're on /review/ index (no items here) — still render the bar with the count.
    renderBar(loadState());
    return;
  }

  let state = loadState();

  function applyVisualState(el) {
    const cut = !!state[el.dataset.photoPath];
    el.classList.toggle("cut", cut);
    el.setAttribute("aria-pressed", String(cut));
  }

  for (const el of items) {
    applyVisualState(el);
    el.addEventListener("click", () => {
      const path = el.dataset.photoPath;
      if (state[path]) delete state[path];
      else state[path] = true;
      saveState(state);
      applyVisualState(el);
      updateBar();
    });
  }

  // Bottom bar
  const bar = document.createElement("div");
  bar.className = "review-bar";
  bar.innerHTML = `
    <div class="container review-bar-inner">
      <span class="review-bar-count"></span>
      <div class="review-bar-actions">
        <button type="button" class="button button-outline review-bar-clear">Clear all</button>
        <button type="button" class="button review-bar-export">Export cuts.json</button>
      </div>
    </div>
  `;
  document.body.appendChild(bar);
  document.body.style.paddingBottom = "5rem";

  const countEl = bar.querySelector(".review-bar-count");
  const exportBtn = bar.querySelector(".review-bar-export");
  const clearBtn = bar.querySelector(".review-bar-clear");

  function updateBar() {
    const n = countCuts(state);
    countEl.textContent = n === 0 ? "No photos marked for cut" : `${n} photo${n === 1 ? "" : "s"} marked for cut`;
    exportBtn.disabled = n === 0;
    clearBtn.disabled = n === 0;
  }
  function renderBar(s) {
    // Stand-in updateBar for non-item pages
    state = s;
    // No items to update visually; bar will render via the same path
    updateBar();
  }
  updateBar();

  exportBtn.addEventListener("click", () => {
    const paths = Object.entries(state)
      .filter(([, v]) => v)
      .map(([p]) => p);
    if (!paths.length) return;
    const json = JSON.stringify({ generated: new Date().toISOString(), cuts: paths }, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "cuts.json";
    a.click();
    URL.revokeObjectURL(url);
  });

  clearBtn.addEventListener("click", () => {
    if (!confirm("Clear all cut marks across all categories?")) return;
    state = {};
    saveState(state);
    for (const el of items) applyVisualState(el);
    updateBar();
  });
})();
