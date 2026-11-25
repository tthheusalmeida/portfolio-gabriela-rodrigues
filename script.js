/* ============ CONFIGURAÇÃO — preencha com os dados reais ============ */
const CONFIG = {
  whatsapp: "553185966664", // DDI+DDD+número (+55 31 8596-6664)
  whatsappMsg: "Olá! Conheci seu portfólio e gostaria de conversar.",
  linkedin: "https://www.linkedin.com/in/gabriela-rodrigues-6bb243160/"
};

document.documentElement.classList.add("js");
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];

/* ---- Links de contato ---- */
const links = {
  "[data-whatsapp]": CONFIG.whatsapp && `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(CONFIG.whatsappMsg)}`,
  "[data-linkedin]": CONFIG.linkedin
};
for (const [sel, url] of Object.entries(links)) {
  $$(sel).forEach(a => {
    if (url) { a.href = url; a.target = "_blank"; a.rel = "noopener"; }
    else if (a.closest(".channels")) a.closest("li").remove(); // esconde canal não configurado
  });
}

$("#year").textContent = new Date().getFullYear();

/* ---- Nav: fundo ao rolar, menu mobile, link ativo ---- */
const sections = $$("main section[id]"), navLinks = $$("a", $("#menu"));
const nav = $("#nav"), menu = $("#menu"), toggle = $("#toggle"), fl = $(".float");
const onScroll = () => {
  nav.classList.toggle("is-solid", scrollY > 24);
  fl.classList.toggle("is-on", scrollY > innerHeight * .7);
  const max = document.documentElement.scrollHeight - innerHeight;
  fl.style.setProperty("--page", max > 0 ? Math.min(100, scrollY / max * 100).toFixed(1) : 0);
  let cur = sections[0].id;
  sections.forEach(s => { if (s.getBoundingClientRect().top <= innerHeight * .4) cur = s.id; });
  if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) cur = sections[sections.length - 1].id;
  navLinks.forEach(a => a.classList.toggle("is-active", a.getAttribute("href") === "#" + cur));
  const tl = $("#timeline");
  const r = tl.getBoundingClientRect();
  const p = Math.min(1, Math.max(0, (innerHeight * .55 - r.top) / r.height));
  tl.style.setProperty("--progress", (p * 100).toFixed(1) + "%");
};
addEventListener("scroll", onScroll, { passive: true }); onScroll();

const setMenu = open => {
  menu.classList.toggle("is-open", open);
  nav.classList.toggle("is-open", open);
  toggle.setAttribute("aria-expanded", open);
  toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
};
toggle.addEventListener("click", () => setMenu(!menu.classList.contains("is-open")));
$$("a", menu).forEach(a => a.addEventListener("click", () => setMenu(false)));
addEventListener("keydown", e => e.key === "Escape" && setMenu(false));

/* ---- Revelar ao rolar ---- */
const io = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
}), { threshold: .12, rootMargin: "0px 0px -6% 0px" });
$$(".reveal,.draw,.signature").forEach(el => io.observe(el));

/* ---- Linha do tempo: etapa ativa ---- */
const stepIO = new IntersectionObserver(es => es.forEach(e => {
  if (e.isIntersecting) e.target.classList.add("is-on");
}), { rootMargin: "-40% 0px -40% 0px" });
$$(".tl__item").forEach(el => stepIO.observe(el));

/* ---- Linha da timeline (desktop): contorna o card principal e segue pelo centro ---- */
const tlEl = $("#timeline"), NS = "http://www.w3.org/2000/svg";
let tlGeo = null;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
function buildTl() {
  tlEl.querySelector(".tl__svg")?.remove();
  tlGeo = null;
  const card = $(".tl__item--now", tlEl);
  if (!card || !matchMedia("(min-width:961px)").matches) { tlEl.classList.remove("tl--svg"); return; }
  const T = tlEl.getBoundingClientRect(), C = card.getBoundingClientRect();
  const L = C.left - T.left, R = C.right - T.left, top = C.top - T.top, bot = C.bottom - T.top, cx = T.width / 2, r = 16;
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("class", "tl__svg"); svg.setAttribute("width", T.width); svg.setAttribute("height", T.height);
  svg.setAttribute("aria-hidden", "true");
  const mk = (d, cls) => { const p = document.createElementNS(NS, "path"); p.setAttribute("d", d); p.setAttribute("class", cls); svg.appendChild(p); return p; };
  const dl = `M${cx} ${top}H${L + r}A${r} ${r} 0 0 0 ${L} ${top + r}V${bot - r}A${r} ${r} 0 0 0 ${L + r} ${bot}H${cx}`;
  const dr = `M${cx} ${top}H${R - r}A${r} ${r} 0 0 1 ${R} ${top + r}V${bot - r}A${r} ${r} 0 0 1 ${R - r} ${bot}H${cx}`;
  const dc = `M${cx} ${bot}V${T.height}`;
  mk(dc, "base");
  const pl = mk(dl, "prog"), pr = mk(dr, "prog"), pc = mk(dc, "prog");
  tlEl.appendChild(svg); tlEl.classList.add("tl--svg");
  tlGeo = { top, bot, pl, pr, pc, Lb: pl.getTotalLength(), Lc: pc.getTotalLength() };
  drawTl();
}
function drawTl() {
  if (!tlGeo) return;
  const g = tlGeo, y = innerHeight * .55 - tlEl.getBoundingClientRect().top;
  const b = clamp((y - g.top) / (g.bot - g.top), 0, 1) * g.Lb, c = clamp(y - g.bot, 0, g.Lc);
  g.pl.style.strokeDasharray = g.pr.style.strokeDasharray = `${b} ${g.Lb + 1}`;
  g.pc.style.strokeDasharray = `${c} ${g.Lc + 1}`;
}
addEventListener("scroll", drawTl, { passive: true });
new ResizeObserver(buildTl).observe(tlEl);
addEventListener("load", buildTl);
buildTl();
