(function () {
  // Mobile nav toggle
  const navBtn = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".primary-nav");
  if (navBtn && nav) {
    navBtn.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      navBtn.setAttribute("aria-expanded", String(open));
    });
  }

  // Lightbox
  const items = Array.from(document.querySelectorAll("[data-lightbox]"));
  if (!items.length) return;

  const groups = {};
  for (const el of items) {
    const g = el.dataset.lightbox;
    (groups[g] = groups[g] || []).push(el);
  }

  const overlay = document.createElement("div");
  overlay.className = "lightbox-overlay";
  overlay.innerHTML = `
    <button class="lightbox-close" aria-label="Close">&times;</button>
    <button class="lightbox-prev" aria-label="Previous">&lsaquo;</button>
    <img alt="" />
    <button class="lightbox-next" aria-label="Next">&rsaquo;</button>
    <div class="lightbox-caption"></div>
  `;
  document.body.appendChild(overlay);

  const img = overlay.querySelector("img");
  const captionEl = overlay.querySelector(".lightbox-caption");
  let currentGroup = [];
  let currentIndex = 0;

  function show(idx) {
    currentIndex = (idx + currentGroup.length) % currentGroup.length;
    const el = currentGroup[currentIndex];
    img.src = el.href;
    const cap = el.dataset.caption || "";
    captionEl.textContent = cap;
    captionEl.style.display = cap ? "" : "none";
  }
  function open(group, idx) {
    currentGroup = groups[group];
    show(idx);
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function close() {
    overlay.classList.remove("open");
    img.src = "";
    document.body.style.overflow = "";
  }

  for (const [group, list] of Object.entries(groups)) {
    list.forEach((el, idx) => {
      el.addEventListener("click", (e) => {
        e.preventDefault();
        open(group, idx);
      });
    });
  }

  overlay.querySelector(".lightbox-close").addEventListener("click", close);
  overlay.querySelector(".lightbox-prev").addEventListener("click", () => show(currentIndex - 1));
  overlay.querySelector(".lightbox-next").addEventListener("click", () => show(currentIndex + 1));
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  });
  document.addEventListener("keydown", (e) => {
    if (!overlay.classList.contains("open")) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") show(currentIndex - 1);
    else if (e.key === "ArrowRight") show(currentIndex + 1);
  });
})();
