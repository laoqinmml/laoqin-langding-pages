(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- header ---------- */
  const top = $("#top");
  const onScrollHeader = () => top.classList.toggle("is-scrolled", scrollY > 8);
  addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();
  const menuBtn = $(".menu-btn"), nav = $("#nav");
  menuBtn.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    menuBtn.setAttribute("aria-expanded", open);
  });
  $$("#nav a").forEach(a => a.addEventListener("click", () => { nav.classList.remove("is-open"); menuBtn.setAttribute("aria-expanded", false); }));

  /* ---------- lens simulator ---------- */
  const sim = $("#sim"), stage = $("#simStage"), lens = $("#simLens");
  const lensD = $("#lensPath").getAttribute("d");
  const mask = `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 240'><path d='${lensD}'/></svg>`)}")`;
  lens.style.webkitMaskImage = mask;
  lens.style.maskImage = mask;

  let W = 0, H = 0, x = 0, y = 0, tx = 0, ty = 0, manual = false, idleTimer, t0 = performance.now();
  function measure() {
    const r = stage.getBoundingClientRect();
    W = r.width; H = r.height;
    stage.style.setProperty("--lw", Math.round(W * (W < 520 ? .7 : .56)) + "px");
    if (!x) {
      x = tx = W * .52; y = ty = H * .58;
      stage.style.setProperty("--x", x + "px");
      stage.style.setProperty("--y", y + "px");
    }
  }
  measure();
  addEventListener("resize", measure);

  function setTarget(e) {
    const r = stage.getBoundingClientRect();
    tx = Math.max(0, Math.min(W, e.clientX - r.left));
    ty = Math.max(0, Math.min(H, e.clientY - r.top));
  }
  function takeOver() {
    manual = true;
    sim.classList.add("is-touched");
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => { manual = false; t0 = performance.now(); }, 5000);
  }
  stage.addEventListener("pointermove", e => { setTarget(e); takeOver(); });
  stage.addEventListener("pointerdown", e => { setTarget(e); takeOver(); });
  stage.addEventListener("keydown", e => {
    const step = 24, k = e.key;
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(k)) return;
    e.preventDefault();
    takeOver();
    if (k === "ArrowLeft") tx -= step; if (k === "ArrowRight") tx += step;
    if (k === "ArrowUp") ty -= step; if (k === "ArrowDown") ty += step;
    tx = Math.max(0, Math.min(W, tx)); ty = Math.max(0, Math.min(H, ty));
  });

  let simVisible = true;
  new IntersectionObserver(([en]) => { simVisible = en.isIntersecting; }).observe(stage);
  function tick(now) {
    if (simVisible) {
      if (!manual && !reduce) {
        const t = (now - t0) / 1000;
        tx = W * (.5 + .3 * Math.sin(t * .45));
        ty = H * (.56 + .14 * Math.sin(t * .9 + 1));
      }
      x += (tx - x) * .16; y += (ty - y) * .16;
      stage.style.setProperty("--x", x.toFixed(1) + "px");
      stage.style.setProperty("--y", y.toFixed(1) + "px");
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  const modeNames = { clear: "Clear Rx lens", photochromic: "Photochromic Rx lens", contrast: "High-contrast Rx lens", polarized: "Polarized Rx lens" };
  $$(".sim__controls .chip").forEach(btn => btn.addEventListener("click", () => {
    $$(".sim__controls .chip").forEach(b => b.setAttribute("aria-pressed", b === btn));
    sim.dataset.mode = btn.dataset.mode;
    $("#simLabel").textContent = modeNames[btn.dataset.mode];
    $(".sim__readout i").style.background = btn.style.getPropertyValue("--tint");
  }));
  const uv = $("#uv");
  const setUV = () => sim.style.setProperty("--uv", uv.value);
  uv.addEventListener("input", setUV); setUV();

  /* ---------- goggle anatomy hotspots ---------- */
  const anatomy = $("#anatomy"), spots = $$(".spot", anatomy);
  $$("#benefits li").forEach(li => {
    const keys = li.dataset.hl.split(" ");
    const on = () => {
      anatomy.classList.add("is-hl");
      spots.forEach(s => s.classList.toggle("is-on", keys.includes(s.dataset.k)));
    };
    const off = () => { anatomy.classList.remove("is-hl"); spots.forEach(s => s.classList.remove("is-on")); };
    li.addEventListener("mouseenter", on); li.addEventListener("focus", on);
    li.addEventListener("mouseleave", off); li.addEventListener("blur", off);
  });

  /* ---------- sport tabs ---------- */
  const tabs = $$(".apps__tab");
  function selectTab(tab, focus) {
    tabs.forEach(t => {
      const on = t === tab;
      t.setAttribute("aria-selected", on);
      t.tabIndex = on ? 0 : -1;
      const p = document.getElementById(t.getAttribute("aria-controls"));
      p.hidden = !on;
      if (on) { p.classList.remove("is-entering"); void p.offsetWidth; p.classList.add("is-entering"); }
    });
    if (focus) tab.focus();
  }
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => selectTab(t));
    t.addEventListener("keydown", e => {
      let n = null;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") n = (i + 1) % tabs.length;
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") n = (i - 1 + tabs.length) % tabs.length;
      if (e.key === "Home") n = 0; if (e.key === "End") n = tabs.length - 1;
      if (n !== null) { e.preventDefault(); selectTab(tabs[n], true); }
    });
  });

  /* ---------- lens discs ---------- */
  const LENSES = [
    { id: "photochromic", name: "Photochromic", g: "radial-gradient(circle at 35% 30%, #F1C98A, #B9762A 55%, #6E4316)", scene: "outdoor",
      f: "brightness(.72) sepia(.35) saturate(1.15) hue-rotate(-6deg)",
      desc: "Darkens in UV light and clears in shade, so one lens covers a ride that runs from dawn to midday.",
      use: "Endurance cycling, trail running, hiking", pair: "Hard coating, anti-fog" },
    { id: "contrast", name: "High-contrast", g: "radial-gradient(circle at 35% 30%, #F6A9B5, #C8475E 55%, #7A1D2F)", scene: "precision",
      f: "contrast(1.3) saturate(1.6) sepia(.12) hue-rotate(-14deg)",
      desc: "Filters selected wavelengths so terrain, balls and targets stand out from the background.",
      use: "MTB, trail, ski, golf, precision sports", pair: "Photochromic, mirror" },
    { id: "polarized", name: "Polarized", g: "radial-gradient(circle at 35% 30%, #9DC7C4, #2C6A70 55%, #12373B)", scene: "water", hideGlare: true,
      f: "brightness(.86) contrast(1.15) saturate(1.3)",
      desc: "Blocks reflected glare from water, wet roads and snow while keeping colours natural.",
      use: "Road cycling, fishing, water sports, glare", pair: "Mirror, hydrophobic coating" },
    { id: "fixed", name: "Fixed tint", g: "radial-gradient(circle at 35% 30%, #A8B0BB, #4B5563 55%, #1F2630)", scene: "running",
      f: "brightness(.64) saturate(.92)",
      desc: "A set colour and darkness, for competition in steady daylight where you want no surprises.",
      use: "Daylight competition in stable light", pair: "Hard coating, mirror" },
    { id: "antifog", name: "Anti-fog", g: "radial-gradient(circle at 35% 30%, #FFFFFF, #CFE3EE 55%, #8FB6CF)", scene: "ski", over: "fog",
      f: "none",
      desc: "An inner coating that keeps the lens clear when your body heat and the air meet.",
      use: "High-intensity training, humidity, skiing", pair: "Ventilated frames, any tint" },
    { id: "mirror", name: "Mirror / gradient", g: "conic-gradient(from 200deg at 40% 40%, #5B8CFF, #A35BFF, #FF6FA8, #FFC36B, #5BE0C8, #5B8CFF)", scene: "ski",
      f: "brightness(.7) saturate(1.1) hue-rotate(8deg)",
      desc: "A coloured outer finish that carries your brand identity and reduces light at the eye.",
      use: "Brand, club, team and event collections", pair: "Polarized, high-contrast" },
    { id: "hard", name: "Hard coating", g: "radial-gradient(circle at 35% 30%, #FFFFFF, #C9D3DC 55%, #9AA7B4)", scene: "cycling", over: "scratch",
      f: "none",
      desc: "A scratch-resistant layer that extends lens life in gritty, everyday use.",
      use: "Durability-focused products", pair: "Every lens on this list" }
  ];
  const PHOTO = { outdoor: "sport-outdoor", precision: "sport-precision", water: "sim-road", running: "sport-running", ski: "sport-ski", cycling: "sim-road" };
  LENSES.find(l => l.id === "polarized").f = "url(#polarize) saturate(1.25) contrast(1.05)";
  const discs = $("#discs"), view = $(".lens-detail__view"), tint = $("#ldvTint");
  discs.innerHTML = LENSES.map((l, i) => `<button class="disc" role="radio" aria-checked="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-i="${i}"><span class="d" style="--g:${l.g}"></span>${l.name}</button>`).join("");
  // Split view: left half is the naked view, right half is through the chosen lens
  const BEFORE = {
    fog: `<div class="ldv-fog"></div>`,
    scratch: `<svg class="ldv-scratch" viewBox="0 0 300 240" preserveAspectRatio="none"><g stroke="#fff" stroke-opacity=".8" stroke-width="1.1"><path d="M10,40 L140,90 M30,160 L220,118 M60,14 L96,226 M170,60 L250,210 M16,206 L230,182 M120,26 L280,72 M200,20 L150,140"/></g></svg>`
  };
  function pickLens(i, focus) {
    const l = LENSES[i];
    $$(".disc", discs).forEach((d, j) => { d.setAttribute("aria-checked", j === i); d.tabIndex = j === i ? 0 : -1; });
    if (focus) $$(".disc", discs)[i].focus();
    const src = `../assets/${PHOTO[l.scene]}.jpg`;
    const afterLabel = l.over === "fog" ? "With anti-fog" : l.over === "scratch" ? "Hard coated" : `Through ${l.name.toLowerCase()}`;
    tint.innerHTML = `<img src="${src}" alt=""><div class="ldv-before">${BEFORE[l.over] || ""}</div>
      <div class="ldv-after"><img src="${src}" alt="" style="filter:${l.f}"></div>
      <span class="ldv-l">${l.over ? "Untreated" : "Naked eye"}</span><span class="ldv-r">${afterLabel}</span>`;
    $("#ldName").textContent = l.name;
    $("#ldDesc").textContent = l.desc;
    $("#ldUse").textContent = l.use;
    $("#ldPair").textContent = l.pair;
  }
  discs.addEventListener("click", e => { const b = e.target.closest(".disc"); if (b) pickLens(+b.dataset.i); });
  discs.addEventListener("keydown", e => {
    const cur = LENSES.findIndex((_, j) => $$(".disc", discs)[j].getAttribute("aria-checked") === "true");
    let n = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") n = (cur + 1) % LENSES.length;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") n = (cur - 1 + LENSES.length) % LENSES.length;
    if (n !== null) { e.preventDefault(); pickLens(n, true); }
  });
  pickLens(0);

  /* ---------- process progress ---------- */
  const steps = $("#steps"), stepItems = $$("#steps li");
  function stepProgress() {
    const r = steps.getBoundingClientRect(), mid = innerHeight * .55;
    const p = Math.max(0, Math.min(1, (mid - r.top) / r.height));
    steps.style.setProperty("--fill", (p * 100).toFixed(1) + "%");
    stepItems.forEach(li => li.classList.toggle("is-on", li.getBoundingClientRect().top < mid));
  }

  /* ---------- Rx lab horizontal scroll ---------- */
  const lab = $("#lab"), track = $("#labTrack"), prog = $("#labProg");
  track.innerHTML = `<figure class="labcard labcard--photo"><img src="../assets/coating.jpg" alt="Lenses on a dome rack inside the high-vacuum coating chamber" loading="lazy"><figcaption>Inside the high-vacuum coating chamber</figcaption></figure>` + TW.labCards();
  // Scroll-linked (moves only while the user scrolls), so it stays on with reduced motion
  const pinMQ = matchMedia("(min-width: 900px)");
  let dist = 0;
  function labMeasure() {
    if (!pinMQ.matches) { lab.style.height = ""; return; }
    dist = Math.max(0, track.scrollWidth - innerWidth + 80);
    lab.style.height = (innerHeight + dist) + "px";
  }
  function labScroll() {
    if (!pinMQ.matches) return;
    const r = lab.getBoundingClientRect();
    const p = Math.max(0, Math.min(1, -r.top / (r.height - innerHeight)));
    track.style.transform = `translate3d(${-p * dist}px,0,0)`;
    prog.style.setProperty("--p", (p * 100).toFixed(1) + "%");
  }
  labMeasure();
  addEventListener("resize", () => { labMeasure(); labScroll(); });
  pinMQ.addEventListener("change", () => { labMeasure(); labScroll(); });

  addEventListener("scroll", () => { stepProgress(); labScroll(); }, { passive: true });
  stepProgress(); labScroll();

  /* ---------- count-up ---------- */
  $$("[data-count]").forEach(el => {
    const end = +el.dataset.count;
    new IntersectionObserver(([en], ob) => {
      if (!en.isIntersecting) return;
      ob.disconnect();
      if (reduce) { el.textContent = end + "M+"; return; }
      const t0 = performance.now();
      const run = now => {
        const k = Math.min(1, (now - t0) / 1200), e = 1 - Math.pow(1 - k, 3);
        el.textContent = (end * e).toFixed(k < 1 ? 1 : 0) + "M+";
        if (k < 1) requestAnimationFrame(run);
      };
      requestAnimationFrame(run);
    }, { threshold: .6 }).observe(el);
  });

  /* ---------- form ---------- */
  const form = $("#form"), sportSel = $("#f-sport");
  $$("[data-sport]").forEach(a => a.addEventListener("click", () => { sportSel.value = a.dataset.sport; }));
  const drop = $("#drop"), file = $("#f-file"), dropText = $("#dropText");
  ["dragenter", "dragover"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add("is-over"); }));
  ["dragleave", "drop"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove("is-over"); }));
  drop.addEventListener("drop", e => { if (e.dataTransfer.files.length) { file.files = e.dataTransfer.files; showFile(); } });
  file.addEventListener("change", showFile);
  function showFile() { if (file.files[0]) dropText.innerHTML = `<strong>${file.files[0].name.replace(/</g, "&lt;")}</strong> attached. Click to change.`; }

  function check(input, msg) {
    const f = input.closest(".field"), ok = input.checkValidity();
    f.classList.toggle("is-bad", !ok);
    f.querySelector(".err").textContent = ok ? "" : msg;
    return ok;
  }
  form.addEventListener("submit", e => {
    e.preventDefault();
    const okName = check($("#f-name"), "Enter your name so we know who to reply to.");
    const okMail = check($("#f-email"), "Enter an email address like name@company.com.");
    const okSport = check(sportSel, "Choose the sport these goggles are for.");
    if (!(okName && okMail && okSport)) { form.querySelector(".is-bad input, .is-bad select").focus(); return; }
    // TODO: connect to your CRM / form endpoint here.
    form.innerHTML = `<div class="form__done" role="status">
      <svg viewBox="0 0 600 240" aria-hidden="true"><use href="#framePath" fill="#0F1B2D"/><use href="#lensPath" fill="#1F45D6"/></svg>
      <h3>Brief sent</h3><p>Thanks. A TaiWoo project contact will reply with a first direction for your ${sportSel.value.toLowerCase()} goggles.</p></div>`;
  });
})();
