(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- pictograms (100 x 100, white on the tile colour) ---------- */
  const S = (d, w = 8) => `<path class="p" d="${d}" stroke-width="${w}"/>`;
  const head = (x, y) => `<circle class="f" cx="${x}" cy="${y}" r="8" fill="#fff"/><rect class="f" x="${x + 1}" y="${y - 3}" width="9" height="4" style="fill:var(--c)"/>`;
  const PICTO = {
    cycling: S("M24,70 m-15,0 a15,15 0 1,0 30,0 a15,15 0 1,0 -30,0", 5) + S("M76,70 m-15,0 a15,15 0 1,0 30,0 a15,15 0 1,0 -30,0", 5) +
      S("M24,70 L42,50 L66,50 L76,70 M42,50 L50,70 L24,70", 4) + S("M46,44 L64,30") + S("M64,30 L70,46", 6) + S("M46,44 L54,58 L50,70", 7) + head(71, 21),
    running: S("M58,28 L46,54") + S("M56,32 L70,42 L76,34", 6) + S("M56,32 L40,38 L34,48", 6) + S("M46,54 L64,66 L60,86", 7) + S("M46,54 L36,72 L20,74", 7) + head(62, 16),
    ski: S("M40,30 L52,52") + S("M42,34 L60,44", 6) + S("M60,44 L70,78", 3) + S("M42,34 L28,46", 6) + S("M28,46 L22,74", 3) +
      S("M52,52 L42,66 L56,78", 7) + S("M52,52 L66,62 L72,72", 7) + S("M12,86 L90,66", 5) + head(36, 20),
    outdoor: `<rect class="f" x="25" y="27" width="14" height="24" rx="3" fill="#fff"/>` + S("M44,28 L46,56") + S("M44,32 L60,44", 6) + S("M60,44 L66,88", 3) +
      S("M46,56 L36,86", 7) + S("M46,56 L58,70 L56,88", 7) + head(44, 16),
    water: `<path class="f" d="M6,72 L94,72 L82,88 L18,88 Z" fill="#fff"/>` + S("M38,48 L42,64") + S("M40,52 L58,46", 6) + S("M58,46 L92,12", 3) + S("M92,12 L92,58", 1.5) +
      S("M42,64 L58,64 L60,70", 7) + head(36, 36),
    precision: S("M42,28 L48,54") + S("M44,34 L58,50", 6) + S("M58,50 L72,86", 3) + S("M48,54 L38,86", 7) + S("M48,54 L58,86", 7) +
      `<circle class="f" cx="82" cy="86" r="4" fill="#fff"/>` + head(40, 16)
  };
  const picto = (id, k = 0) => `<svg class="picto" viewBox="0 0 100 100" style="--k:${k}" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${PICTO[id]}</svg>`;

  /* ---------- content ---------- */
  const SPORTS = [
    { id: "cycling", name: "Cycling", form: "Cycling", c: "#1D5FB0", alt: "Road cyclist wearing high-wrap goggles",
      f: ["High-wrap shield, wide field of view", "High-contrast, photochromic and polarized lenses", "Fit checked with helmet, nose pads and temples"],
      rec: ["photo", "contrast", "polar"], cta: "Get a cycling goggle solution" },
    { id: "running", name: "Running", form: "Running", c: "#F07D1A", alt: "Trail runner wearing wraparound sport glasses",
      f: ["Lightweight frame, secure nose pads", "Ventilation and anti-fog", "Photochromic and high-contrast lenses", "Curvature and Rx assessed together"],
      rec: ["photo", "contrast", "fog"], cta: "Get a running goggle solution" },
    { id: "ski", name: "Ski & snow", form: "Skiing", c: "#2F86C6", alt: "Skier wearing mirror ski goggles",
      f: ["Full coverage, helmet-compatible", "High-contrast snow lenses, VLT configured", "Ventilated anti-fog construction", "Rx assessed for the goggle structure"],
      rec: ["contrast", "fog", "mirror"], cta: "Get a ski goggle solution" },
    { id: "outdoor", name: "Outdoor", form: "Outdoor & Mountain", c: "#2E9B57", alt: "Mountaineer wearing wraparound goggles",
      f: ["Wrap blocks wind, dust and debris", "Photochromic and high-contrast lenses", "Anti-fog, hydrophobic, easy-clean", "Secure fit on rough ground"],
      rec: ["photo", "contrast", "fog", "hard"], cta: "Get an outdoor goggle solution" },
    { id: "water", name: "Water & fishing", form: "Water Sports & Fishing", c: "#138A8A", alt: "Angler wearing polarized sport glasses",
      f: ["Polarized against surface glare", "High-wrap sun protection", "Hydrophobic, easy-clean, non-slip", "Lens construction matched to each Rx"],
      rec: ["polar", "mirror", "hard"], cta: "Get a water sports solution" },
    { id: "precision", name: "Ball & precision", form: "Ball/Contact/Precision", c: "#13294B", alt: "Golfer wearing sport sunglasses",
      f: ["Golf, shooting, archery, equestrian, motorsport", "High-contrast and venue-specific tints", "Impact-resistant, non-slip, ventilated", "Tested to applicable standards"],
      rec: ["contrast", "tint", "hard"], cta: "Get a professional sports solution" }
  ];
  const LENSES = [
    { id: "photo", name: "Photochromic", sw: "#B9762A", sports: ["cycling", "running", "outdoor"], best: "Endurance cycling, trail, hiking" },
    { id: "contrast", name: "High-contrast", sw: "#D24B5E", sports: ["cycling", "running", "ski", "outdoor", "precision"], best: "MTB, trail, ski, golf, precision" },
    { id: "polar", name: "Polarized", sw: "#2C6A70", sports: ["cycling", "water"], best: "Road cycling, fishing, water, glare" },
    { id: "tint", name: "Fixed tint", sw: "#5A6B80", sports: ["precision"], best: "Competition in stable daylight" },
    { id: "fog", name: "Anti-fog", sw: "#A6D4F2", sports: ["running", "ski", "outdoor"], best: "High intensity, humidity, skiing" },
    { id: "mirror", name: "Mirror / gradient", sw: "linear-gradient(135deg,#F07D1A,#D24B5E,#1D5FB0)", sports: "all", best: "Brand, club, team and event collections" },
    { id: "hard", name: "Hard coating", sw: "#C5CCD3", sports: "all", best: "Durability-focused products" }
  ];

  /* ---------- hero picto row ---------- */
  $("#pictoRow").innerHTML = SPORTS.map((s, i) => `<a href="#app-${s.id}" style="--c:${s.c}">${picto(s.id, i)}<span>${s.name}</span></a>`).join("");

  /* ---------- system grid ---------- */
  const W = `fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"`;
  const SYS = [
    ["Clarity", "Rx compatibility checked against SPH, CYL, axis, PD, frame size and curvature.", "#1D5FB0", `<circle cx="22" cy="22" r="11" ${W}/><path d="M22,6 V38 M6,22 H38" ${W} stroke-width="1.5"/>`],
    ["Design", "Freeform surfacing keeps the wraparound profile.", "#2E9B57", `<path d="M6,30 C10,12 34,12 38,30" ${W}/><path d="M12,30 H32" ${W}/>`],
    ["Function", "Photochromic, high-contrast, polarized, anti-fog and mirror options.", "#F07D1A", `<rect x="7" y="7" width="12" height="12" fill="#fff"/><rect x="25" y="7" width="12" height="12" fill="#fff" opacity=".6"/><rect x="7" y="25" width="12" height="12" fill="#fff" opacity=".6"/><rect x="25" y="25" width="12" height="12" fill="#fff"/>`],
    ["Stability", "Field of view and fit balanced for movement.", "#138A8A", `<path d="M6,30 H38 M22,30 L14,38 H30 Z" ${W}/><path d="M10,24 L34,18" ${W}/>`],
    ["Product", "A differentiated collection your competitors don't carry.", "#13294B", `<rect x="8" y="16" width="20" height="20" ${W}/><rect x="16" y="8" width="20" height="20" ${W}/>`],
    ["Production", "Sampling first keeps development and delivery risk low.", "#2F86C6", `<path d="M6,36 V20 L16,26 V20 L26,26 V12 H38 V36 Z" ${W}/>`]
  ];
  $("#sys").innerHTML = SYS.map(s => `<div><svg class="ico" viewBox="0 0 44 44" style="background:${s[2]}" aria-hidden="true">${s[3]}</svg><h3>${s[0]}</h3><p>${s[1]}</p></div>`).join("");

  /* ---------- applications ---------- */
  $("#apps").innerHTML = SPORTS.map(s => `<article class="app" id="app-${s.id}" style="--c:${s.c}">
      <div class="app__img"><img src="../assets/sport-${s.id}.jpg" alt="${s.alt}" loading="lazy">${picto(s.id)}</div>
      <div class="app__body"><h3>${s.name}</h3><ul>${s.f.map(x => `<li>${x}</li>`).join("")}</ul>
      <a class="btn" href="#contact" data-sport="${s.form}">${s.cta}</a></div></article>`).join("");

  /* ---------- lens matrix ---------- */
  const matrix = $("#matrix");
  matrix.innerHTML = `<caption class="skip">Lens solutions by sport</caption>
    <thead><tr><th scope="col" style="text-align:left">Lens</th>${SPORTS.map((s, i) => `<th scope="col" data-col="${i}" style="--c:${s.c}">${picto(s.id)}${s.name}</th>`).join("")}<th scope="col">Best for</th></tr></thead>
    <tbody>${LENSES.map(l => `<tr><th scope="row"><i style="--sw:${l.sw}"></i>${l.name}</th>${
      l.sports === "all" ? `<td class="all" colspan="6">Every sport</td>`
        : SPORTS.map((s, i) => `<td data-col="${i}">${l.sports.includes(s.id) ? `<span class="dot" role="img" aria-label="Recommended"></span>` : ""}</td>`).join("")
    }<td>${l.best}</td></tr>`).join("")}</tbody>`;
  function hlCol(i) { $$("[data-col]", matrix).forEach(c => c.classList.toggle("col-hl", i !== null && +c.dataset.col === i)); }
  $$("thead [data-col]", matrix).forEach(th => {
    th.addEventListener("mouseenter", () => hlCol(+th.dataset.col));
    th.addEventListener("mouseleave", () => hlCol(currentSport()));
  });

  /* ---------- serve ---------- */
  const SERVE = [
    ["Sports clubs", ["Logos and club colours", "Member and event products", "Member prescriptions"], "#1D5FB0", `<path d="M26,6 L44,12 V26 C44,38 26,46 26,46 C26,46 8,38 8,26 V12 Z" ${W}/>`],
    ["Cycling teams", ["Kit and sponsor matching", "Training and race configurations", "Rider-by-rider Rx"], "#F07D1A", `<path d="M16,8 L26,12 L36,8 L46,18 L40,24 L36,20 V44 H16 V20 L12,24 L6,18 Z" ${W}/>`],
    ["Eyewear brands", ["Proven styles to brand", "Exclusive structures", "Branded packaging"], "#2E9B57", `<path d="M8,8 H28 L46,26 L28,44 L8,24 Z" ${W}/><circle cx="18" cy="18" r="3" fill="#fff"/>`],
    ["Eyewear retailers", ["Rx and activity-based advice", "Multi-function lenses", "Merchandising-ready ranges"], "#2F86C6", `<path d="M6,18 L10,8 H42 L46,18 Z M8,18 V44 H44 V18 M20,44 V30 H32 V44" ${W}/>`],
    ["Distributors", ["Core, functional and Rx models", "Channel packaging", "Replenishment"], "#138A8A", `<rect x="6" y="24" width="18" height="18" ${W}/><rect x="28" y="24" width="18" height="18" ${W}/><rect x="17" y="6" width="18" height="18" ${W}/>`],
    ["Sports brands & events", ["Limited colourways", "Participant packs", "Sponsorship editions"], "#7D8B9C", `<path d="M10,46 V6 M10,8 H42 L34,17 L42,26 H10" ${W}/>`]
  ];
  $("#serveGrid").innerHTML = SERVE.map(s => `<div><svg viewBox="0 0 52 52" style="background:${s[2]};padding:4px" aria-hidden="true">${s[3]}</svg><h3>${s[0]}</h3><ul>${s[1].map(x => `<li>${x}</li>`).join("")}</ul></div>`).join("");

  /* ---------- lab ---------- */
  const B = `fill="none" stroke="#1D5FB0" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"`;
  const LAB = [
    ["Digital prescription design", "Each Rx becomes a freeform surface calculated for the frame's wrap.", `<rect x="4" y="8" width="38" height="26" ${B}/><ellipse cx="23" cy="21" rx="12" ry="7" ${B}/><path d="M16,42 H30" ${B}/>`],
    ["Sub-micron precision surfacing", "CNC generators cut the calculated surface into the lens blank.", `<ellipse cx="23" cy="34" rx="18" ry="6" ${B}/><path d="M23,4 V22 M17,22 H29 L23,28 Z" ${B}/>`],
    ["Automated digital polishing", "Polishing follows the same digital file across the lens.", `<ellipse cx="23" cy="34" rx="18" ry="6" ${B}/><rect x="13" y="14" width="20" height="10" rx="5" ${B}/><path d="M23,4 V14" ${B}/>`],
    ["Coating & colour configuration", "Tint, mirror and functional layers specified for sport and brand.", `<rect x="4" y="10" width="11" height="11" fill="#F07D1A"/><rect x="18" y="10" width="11" height="11" fill="#1D5FB0"/><rect x="32" y="10" width="11" height="11" fill="#2E9B57"/><path d="M4,32 H42" ${B}/>`],
    ["Precision high-vacuum coating", "Layers deposited inside a vacuum chamber.", `<path d="M6,40 V24 A17,17 0 0 1 40,24 V40 Z M2,40 H44" ${B}/>`],
    ["Freeform custom edging", "Lenses edged to the exact shape of each frame.", `<path d="M4,20 C6,8 40,8 42,20 C44,30 36,36 30,34 C26,33 25,28 23,28 C21,28 20,33 16,34 C10,36 2,30 4,20 Z" ${B} stroke-dasharray="4 4"/>`],
    ["Contour forming & verification", "Fitted to the frame and checked against the prescription.", `<path d="M4,20 C6,8 40,8 42,20 C44,30 36,36 30,34 C26,33 25,28 23,28 C21,28 20,33 16,34 C10,36 2,30 4,20 Z" ${B}/><path d="M30,40 L34,44 L42,36" ${B}/>`]
  ];
  $("#lab").innerHTML = LAB.map((l, i) => `<div><span class="n">${String(i + 1).padStart(2, "0")}</span><svg viewBox="0 0 46 46" aria-hidden="true">${l[2]}</svg><h3>${l[0]}</h3><p>${l[1]}</p></div>`).join("") +
    `<div class="hl"><ul><li>Sub-micron surfacing</li><li>End-to-end digital control</li><li>High-vacuum coating</li><li>Freeform custom edging</li></ul></div>`;

  /* ---------- brief builder ---------- */
  const opt = (type, name, val, label, extra = "", cls = "") =>
    `<div class="opt ${cls}"><input type="${type}" name="${name}" value="${val}" id="${name}-${val}"><label for="${name}-${val}" ${extra}>${label}</label></div>`;
  $("#optSport").innerHTML = SPORTS.map(s => opt("radio", "b-sport", s.id, `${picto(s.id)}${s.name}`, `style="--c:${s.c}"`, "opt--sport")).join("");
  $("#optLens").innerHTML = LENSES.map(l => opt("checkbox", "b-lens", l.id, `${l.name}<span class="rec" hidden>Recommended</span>`)).join("");
  $("#optRoute").innerHTML = [["oem", "OEM, from your catalog"], ["odm", "ODM, exclusive design"], ["unsure", "Not sure yet"]].map(r => opt("radio", "b-route", r[0], r[1])).join("");
  $("#optQty").innerHTML = ["Under 500 pairs", "500 to 2,000", "2,000 to 10,000", "Over 10,000"].map((q, i) => opt("radio", "b-qty", i, q)).join("");
  $("#optRx").innerHTML = ["Mostly plano, some Rx", "Single vision Rx", "Wide or high Rx range", "Not sure yet"].map((q, i) => opt("radio", "b-rx", i, q)).join("");

  const builder = $("#builder");
  let lensTouched = false;
  const currentSport = () => { const i = SPORTS.findIndex(s => s.id === builder.querySelector("[name=b-sport]:checked")?.value); return i < 0 ? null : i; };
  const labelOf = input => input.nextElementSibling.textContent.replace("Recommended", "").trim();
  function setDD(id, text) { const dd = $(id); dd.textContent = text || "Not chosen yet"; dd.classList.toggle("empty", !text); }

  function renderSpec() {
    const si = currentSport(), s = SPORTS[si];
    $("#specCard").style.setProperty("--c", s ? s.c : "#C5CCD3");
    $("#specPicto").innerHTML = s ? PICTO[s.id] : "";
    $("#specPicto").setAttribute("fill", "none"); $("#specPicto").setAttribute("stroke", "#fff");
    $("#specPicto").setAttribute("stroke-linecap", "round"); $("#specPicto").setAttribute("stroke-linejoin", "round");
    $("#specTitle").textContent = s ? `${s.name} Rx goggles` : "Choose a sport";
    setDD("#sLens", $$("[name=b-lens]:checked", builder).map(labelOf).join(", "));
    const pick = n => { const el = builder.querySelector(`[name=${n}]:checked`); return el ? labelOf(el) : ""; };
    setDD("#sRoute", pick("b-route")); setDD("#sQty", pick("b-qty")); setDD("#sRx", pick("b-rx"));
    hlCol(si);
  }
  builder.addEventListener("change", e => {
    if (e.target.name === "b-lens") lensTouched = true;
    if (e.target.name === "b-sport") {
      const s = SPORTS[currentSport()];
      $$("[name=b-lens]", builder).forEach(inp => {
        const rec = s.rec.includes(inp.value);
        inp.nextElementSibling.querySelector(".rec").hidden = !rec;
        if (!lensTouched) inp.checked = rec;
      });
    }
    renderSpec();
  });
  renderSpec();

  const form = $("#form"), sportSel = $("#f-sport"), msg = $("#f-msg");
  builder.addEventListener("submit", e => {
    e.preventDefault();
    const s = SPORTS[currentSport()];
    const lines = ["Project brief"];
    if (s) { lines.push(`Sport: ${s.name}`); sportSel.value = s.form; }
    [["Lenses", "#sLens"], ["Route", "#sRoute"], ["Quantity", "#sQty"], ["Rx", "#sRx"]].forEach(([k, id]) => {
      if (!$(id).classList.contains("empty")) lines.push(`${k}: ${$(id).textContent}`);
    });
    msg.value = lines.join("\n") + "\n\n";
    $("#prefilled").classList.add("is-on");
    $("#contact").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    setTimeout(() => $("#f-name").focus({ preventScroll: true }), 600);
  });

  /* ---------- lanes ---------- */
  new IntersectionObserver(([en], ob) => { if (en.isIntersecting) { $("#lanes").classList.add("is-in"); ob.disconnect(); } }, { threshold: .3 }).observe($("#lanes"));

  /* ---------- header / menu ---------- */
  const menuBtn = $(".menu-btn"), nav = $("#nav");
  menuBtn.addEventListener("click", () => menuBtn.setAttribute("aria-expanded", nav.classList.toggle("is-open")));
  $$("#nav a").forEach(a => a.addEventListener("click", () => { nav.classList.remove("is-open"); menuBtn.setAttribute("aria-expanded", false); }));

  /* ---------- contact form ---------- */
  document.addEventListener("click", e => { const a = e.target.closest("[data-sport]"); if (a) sportSel.value = a.dataset.sport; });
  const drop = $("#drop"), file = $("#f-file"), dropText = $("#dropText");
  ["dragenter", "dragover"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add("is-over"); }));
  ["dragleave", "drop"].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove("is-over"); }));
  drop.addEventListener("drop", e => { if (e.dataTransfer.files.length) { file.files = e.dataTransfer.files; showFile(); } });
  file.addEventListener("change", showFile);
  function showFile() { if (file.files[0]) dropText.innerHTML = `<strong>${file.files[0].name.replace(/</g, "&lt;")}</strong> attached. Click to change.`; }
  function check(input, m) { const f = input.closest(".field"), ok = input.checkValidity(); f.classList.toggle("is-bad", !ok); f.querySelector(".err").textContent = ok ? "" : m; return ok; }
  form.addEventListener("submit", e => {
    e.preventDefault();
    const a = check($("#f-name"), "Enter your name so we know who to reply to.");
    const b = check($("#f-email"), "Enter an email address like name@company.com.");
    const c = check(sportSel, "Choose the sport these goggles are for.");
    if (!(a && b && c)) { form.querySelector(".is-bad input, .is-bad select").focus(); return; }
    // TODO: connect to your CRM / form endpoint here.
    form.innerHTML = `<div class="done" role="status"><svg viewBox="0 0 100 100" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"><path d="M26,52 L44,70 L76,34"/></svg><h3>Brief sent</h3><p>A TaiWoo project contact will reply with a first direction for your ${sportSel.value.toLowerCase()} goggles.</p></div>`;
  });
})();
