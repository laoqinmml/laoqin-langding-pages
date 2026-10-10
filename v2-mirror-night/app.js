(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const LENS_D = "M38,96 C52,52 170,40 300,42 C430,40 548,52 562,96 C574,134 556,178 514,190 C462,204 398,198 362,182 C338,171 322,152 300,152 C278,152 262,171 238,182 C202,198 138,204 86,190 C44,178 26,134 38,96 Z";
  document.documentElement.style.setProperty("--lens-mask",
    `url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 240' preserveAspectRatio='none'><path d='${LENS_D}'/></svg>`)}")`);

  /* ---------- header ---------- */
  const top = $("#top");
  const hdr = () => top.classList.toggle("is-scrolled", scrollY > 40);
  addEventListener("scroll", hdr, { passive: true }); hdr();
  const menuBtn = $(".menu-btn"), nav = $("#nav");
  menuBtn.addEventListener("click", () => menuBtn.setAttribute("aria-expanded", nav.classList.toggle("is-open")));
  $$("#nav a").forEach(a => a.addEventListener("click", () => { nav.classList.remove("is-open"); menuBtn.setAttribute("aria-expanded", false); }));

  /* ---------- thin-film mirror shader ---------- */
  const COATS = [
    { d: [0.55, 0.65, 0.80], tint: [0.18, 0.36, 1.0], mix: 0.18 },
    { d: [0.00, 0.12, 0.28], tint: [1.0, 0.36, 0.16], mix: 0.28 },
    { d: [0.72, 0.52, 0.92], tint: [0.58, 0.28, 1.0], mix: 0.22 },
    { d: [0.04, 0.10, 0.36], tint: [1.0, 0.74, 0.25], mix: 0.3 },
    { d: [0.38, 0.18, 0.55], tint: [0.12, 0.85, 0.6], mix: 0.26 }
  ];
  const canvas = $("#film"), lensBox = $("#heroLens");
  const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false });
  let draw = () => {};
  const cur = { d: [...COATS[0].d], tint: [...COATS[0].tint], mix: COATS[0].mix };
  let goal = COATS[0];

  if (!gl) {
    document.documentElement.classList.add("no-webgl");
  } else {
    const vs = `attribute vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }`;
    const fs = `precision highp float;
      uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse; uniform vec3 uD; uniform vec3 uTint; uniform float uMix;
      vec2 hash(vec2 p){ p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3))); return -1. + 2.*fract(sin(p)*43758.5453); }
      float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.-2.*f);
        return mix(mix(dot(hash(i),f), dot(hash(i+vec2(1,0)),f-vec2(1,0)),u.x), mix(dot(hash(i+vec2(0,1)),f-vec2(0,1)), dot(hash(i+vec2(1,1)),f-vec2(1,1)),u.x),u.y); }
      float fbm(vec2 p){ float v = 0., a = .5; for(int i = 0; i < 5; i++){ v += a*noise(p); p *= 2.03; a *= .5; } return v; }
      void main(){
        vec2 uv = gl_FragCoord.xy / uRes;
        float asp = uRes.x / uRes.y;
        vec2 p = vec2(uv.x*asp, uv.y);
        vec2 m = vec2(uMouse.x*asp, uMouse.y);
        float t = uTime * .05;
        vec2 q = vec2(fbm(p*.7 + t), fbm(p*.7 - t + 3.1));
        float th = fbm(p*.6 + q*.9 + vec2(t*.5, -t*.3));
        float d = length(p - m);
        th += .18*exp(-d*d*3.);
        vec2 c = (uv - vec2(.5,.55)) * vec2(1., 2.3);
        float dome = clamp(1. - dot(c,c)*1.2, 0., 1.);
        vec3 col = .5 + .5*cos(6.28318*(th*1.15 + uD + dome*.18 + uv.y*.14));
        col = pow(col, vec3(1.25));
        col = mix(vec3(dot(col, vec3(.333))), col, 1.35);
        col = mix(col, uTint, uMix);
        // mirrored environment: bright sky above a curved horizon, darker ground below
        float hz = .44 + .07*sin(uv.x*3.14159) + .04*(m.y - .5);
        float env = smoothstep(hz - .015, hz + .015, uv.y);
        col *= mix(.5, 1.08, env);
        col += env * smoothstep(hz + .2, hz, uv.y) * .1;
        col *= .35 + .75*dome;
        col += exp(-d*d*70.)*.55 + exp(-d*d*4.)*.08;
        gl_FragColor = vec4(col, 1.);
      }`;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const prog = gl.createProgram();
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      document.documentElement.classList.add("no-webgl");
    } else {
      gl.useProgram(prog);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, "p");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      const U = n => gl.getUniformLocation(prog, n);
      const uRes = U("uRes"), uTime = U("uTime"), uMouse = U("uMouse"), uD = U("uD"), uTint = U("uTint"), uMix = U("uMix");

      function size() {
        const dpr = Math.min(devicePixelRatio || 1, 1.5);
        const r = lensBox.getBoundingClientRect();
        canvas.width = Math.round(r.width * dpr * .75);
        canvas.height = Math.round(r.height * dpr * .75);
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
      size();
      addEventListener("resize", () => { size(); draw(performance.now()); });

      const mouse = { x: .5, y: .6, tx: .5, ty: .6 };
      addEventListener("pointermove", e => {
        const r = lensBox.getBoundingClientRect();
        mouse.tx = (e.clientX - r.left) / r.width;
        mouse.ty = 1 - (e.clientY - r.top) / r.height;
      }, { passive: true });

      draw = now => {
        mouse.x += (mouse.tx - mouse.x) * .06; mouse.y += (mouse.ty - mouse.y) * .06;
        for (let i = 0; i < 3; i++) { cur.d[i] += (goal.d[i] - cur.d[i]) * .05; cur.tint[i] += (goal.tint[i] - cur.tint[i]) * .05; }
        cur.mix += (goal.mix - cur.mix) * .05;
        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.uniform1f(uTime, reduce ? 12 : now / 1000);
        gl.uniform2f(uMouse, mouse.x, mouse.y);
        gl.uniform3fv(uD, cur.d); gl.uniform3fv(uTint, cur.tint); gl.uniform1f(uMix, cur.mix);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      };
      let visible = true;
      new IntersectionObserver(([en]) => { visible = en.isIntersecting; }).observe(lensBox);
      const loop = now => { if (visible) draw(now); requestAnimationFrame(loop); };
      requestAnimationFrame(loop);
    }
  }
  $$(".coat button").forEach(b => b.addEventListener("click", () => {
    $$(".coat button").forEach(x => x.setAttribute("aria-pressed", x === b));
    goal = COATS[+b.dataset.coat];
  }));

  /* ---------- parallax product photo ---------- */
  const pImg = $("#parallaxImg");
  function parallax() {
    if (reduce) return;
    const r = pImg.parentElement.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    const k = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
    pImg.style.transform = `scale(1.12) translate3d(0, ${(k * -40).toFixed(1)}px, 0)`;
  }

  /* ---------- lens stack ---------- */
  const LAYERS = [
    { n: "Anti-fog", bg: "linear-gradient(120deg, rgba(234,242,251,.55), rgba(234,242,251,.25))", d: "Inner coating that keeps the lens clear when body heat meets cold or humid air." },
    { n: "Rx base lens (PC or MR)", bg: "linear-gradient(120deg, rgba(170,205,255,.7), rgba(80,120,200,.45))", d: "Your prescription, freeform-surfaced into a PC or MR lens shaped for the frame's wrap." },
    { n: "Tint or photochromic", bg: "linear-gradient(120deg, #D9944A, #7A4A1A)", d: "A fixed tint for stable light, high-contrast filtering, or photochromic that darkens in UV." },
    { n: "Polarized film", bg: "repeating-linear-gradient(90deg, rgba(44,120,128,.95) 0 3px, rgba(18,60,70,.95) 3px 7px)", d: "Blocks reflected glare from water, roads and snow." },
    { n: "Mirror coating", bg: "linear-gradient(100deg, #4D7CFF, #9B5CFF 28%, #FF6FB1 52%, #FFB547 76%, #49E3C1)", d: "Coloured outer finish for team and brand identity, and less light at the eye." },
    { n: "Hard coating", bg: "linear-gradient(120deg, rgba(255,255,255,.5), rgba(255,255,255,.12))", d: "Scratch-resistant outer layer for longer service life. Hydrophobic and easy-clean options." }
  ];
  const rig = $("#stackRig"), scene = $("#stackScene"), stack = $("#stack");
  rig.innerHTML = LAYERS.map((l, i) => `<div class="layer" style="--i:${i};--bg:${l.bg}" data-i="${i}"><i></i></div>`).join("");
  const legend = $("#legend");
  legend.innerHTML = LAYERS.map((l, i) => ({ l, i })).reverse()
    .map(({ l, i }) => `<button aria-pressed="false" data-i="${i}"><span style="background:${l.bg}"></span>${l.n}</button>`).join("");
  function pickLayer(i) {
    const btn = legend.querySelector(`[data-i="${i}"]`);
    const on = btn.getAttribute("aria-pressed") !== "true";
    $$("button", legend).forEach(x => x.setAttribute("aria-pressed", on && x === btn));
    $$(".layer", rig).forEach(x => x.classList.toggle("is-pick", on && x.dataset.i == i));
    scene.classList.toggle("has-pick", on);
    const l = LAYERS[i];
    $("#layerName").textContent = on ? l.n : "Six configurable layers";
    $("#layerDesc").textContent = on ? l.d : "Each Rx sports lens is built up from a base lens plus the coatings and films the sport calls for. Tap a layer to see what it does.";
  }
  legend.addEventListener("click", e => { const b = e.target.closest("button"); if (b) pickLayer(+b.dataset.i); });
  rig.addEventListener("click", e => { const b = e.target.closest(".layer"); if (b) pickLayer(+b.dataset.i); });
  new IntersectionObserver(([en]) => { if (en.isIntersecting) stack.classList.add("is-open"); }, { threshold: .35 }).observe(stack);

  /* ---------- route switch ---------- */
  const sw = $(".route-switch"), rTabs = $$(".route-switch button");
  function pickRoute(t, focus) {
    rTabs.forEach(x => {
      const on = x === t;
      x.setAttribute("aria-selected", on); x.tabIndex = on ? 0 : -1;
      const p = document.getElementById(x.getAttribute("aria-controls"));
      p.hidden = !on;
      if (on) $$(".chain span", p).forEach(s => { s.style.animation = "none"; void s.offsetWidth; s.style.animation = ""; });
    });
    sw.dataset.on = t.id === "tab-odm" ? "odm" : "oem";
    if (focus) t.focus();
  }
  rTabs.forEach((t, i) => {
    t.addEventListener("click", () => pickRoute(t));
    t.addEventListener("keydown", e => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); pickRoute(rTabs[1 - i], true); }
    });
  });

  /* ---------- process course ---------- */
  const STEPS = [
    ["Submit requirements", "Market, sport, quantity, reference style"],
    ["Select solution", "Frame, lens and route proposed"],
    ["Assess prescription", "Rx range against curvature and lens"],
    ["Quotation & sampling", "MOQ, pricing and lead time"],
    ["Sample approval", "You test and sign off"],
    ["Mass production", "Frames and Rx lenses made and inspected"],
    ["Packaging & delivery", "Branded packs and export documents"],
    ["After-sales & reorders", "Support and replenishment"]
  ];
  const path = $("#coursePath"), run = $("#courseRun"), cps = $("#cps"), labels = $("#courseLabels"), course = $("#course");
  // Checkpoints sit exactly on alternating crests and troughs, so labels can go above / below without colliding
  const PTS = STEPS.map((_, i) => [75 + i * 150, i % 2 ? 330 : 90]);
  let d = `M8,200 C40,120 50,90 ${PTS[0][0]},${PTS[0][1]}`;
  for (let i = 1; i < PTS.length; i++) {
    const [x0, y0] = PTS[i - 1], [x1, y1] = PTS[i];
    d += ` C${x0 + 75},${y0} ${x1 - 75},${y1} ${x1},${y1}`;
  }
  d += ` C1160,330 1180,280 1194,240`;
  path.setAttribute("d", d); run.setAttribute("d", d);
  const L = path.getTotalLength();
  run.style.strokeDasharray = L; run.style.strokeDashoffset = L;
  const lenAtX = x => { let lo = 0, hi = L; for (let k = 0; k < 24; k++) { const mid = (lo + hi) / 2; path.getPointAtLength(mid).x < x ? lo = mid : hi = mid; } return lo; };
  const fr = PTS.map(p => lenAtX(p[0]) / L);
  cps.innerHTML = PTS.map(p => `<circle class="cp" cx="${p[0]}" cy="${p[1]}" r="11"/>`).join("");
  labels.innerHTML = STEPS.map((s, i) => {
    const [x, y] = PTS[i];
    return `<div class="${i % 2 ? "" : "up"}" style="left:${x / 12}%;top:${y / 4.2}%"><i>Checkpoint ${i + 1}</i><b>${s[0]}</b><small>${s[1]}</small></div>`;
  }).join("");
  $("#courseList").innerHTML = STEPS.map(s => `<li><div><b>${s[0]}</b><p>${s[1]}</p></div></li>`).join("");
  const cpEls = $$(".cp", cps), lbEls = $$("div", labels);
  function courseScroll() {
    const r = course.getBoundingClientRect();
    if (!r.height) return;
    const p = Math.max(0, Math.min(1, (innerHeight * .85 - r.top) / (r.height + innerHeight * .35)));
    run.style.strokeDashoffset = L * (1 - p);
    fr.forEach((f, i) => { const on = p >= f; cpEls[i].classList.toggle("is-on", on); lbEls[i].classList.toggle("is-on", on); });
  }

  addEventListener("scroll", () => { parallax(); courseScroll(); }, { passive: true });
  parallax(); courseScroll();

  /* ---------- count-up ---------- */
  $$("[data-count]").forEach(el => {
    const end = +el.dataset.count;
    new IntersectionObserver(([en], ob) => {
      if (!en.isIntersecting) return; ob.disconnect();
      if (reduce) { el.textContent = end + "M+"; return; }
      const t0 = performance.now();
      const step = now => { const k = Math.min(1, (now - t0) / 1300), e = 1 - Math.pow(1 - k, 3);
        el.textContent = (end * e).toFixed(k < 1 ? 1 : 0) + "M+"; if (k < 1) requestAnimationFrame(step); };
      requestAnimationFrame(step);
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
    f.classList.toggle("is-bad", !ok); f.querySelector(".err").textContent = ok ? "" : msg; return ok;
  }
  form.addEventListener("submit", e => {
    e.preventDefault();
    const a = check($("#f-name"), "Enter your name so we know who to reply to.");
    const b = check($("#f-email"), "Enter an email address like name@company.com.");
    const c = check(sportSel, "Choose the sport these goggles are for.");
    if (!(a && b && c)) { form.querySelector(".is-bad input, .is-bad select").focus(); return; }
    // TODO: connect to your CRM / form endpoint here.
    form.innerHTML = `<div class="done" role="status"><h3 class="film-text">Brief sent.</h3><p>A TaiWoo project contact will reply with a first direction for your ${sportSel.value.toLowerCase()} goggles.</p></div>`;
  });
})();
