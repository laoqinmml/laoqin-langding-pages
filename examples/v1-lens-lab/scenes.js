/* SVG illustrations, generated so the markup stays readable.
   Everything is drawn in code: no image assets needed. */
(function () {
  const LENS = "M38,96 C52,52 170,40 300,42 C430,40 548,52 562,96 C574,134 556,178 514,190 C462,204 398,198 362,182 C338,171 322,152 300,152 C278,152 262,171 238,182 C202,198 138,204 86,190 C44,178 26,134 38,96 Z";
  const FRAME = "M24,94 C40,36 168,22 300,24 C432,22 560,36 576,94 L566,102 C552,54 432,42 300,44 C168,42 48,54 34,102 Z";

  // Seeded random so the trees land in the same spot on every load
  function rng(seed) { return () => (seed = (seed * 16807) % 2147483647) / 2147483647; }

  function cyclist(x, y, s, jersey) {
    return `<g transform="translate(${x} ${y}) scale(${s})" stroke="#1B2230" stroke-linecap="round" fill="none">
      <circle cx="-20" cy="0" r="15" stroke-width="3"/><circle cx="20" cy="0" r="15" stroke-width="3"/>
      <path d="M-20,0 L-4,-18 L14,-18 L20,0 M-4,-18 L2,0 L-20,0 M14,-18 L12,-26" stroke-width="3"/>
      <path d="M2,0 L-2,-12 L6,-30" stroke-width="5"/>
      <path d="M6,-30 L-6,-44 L14,-36" stroke="${jersey}" stroke-width="8"/>
      <circle cx="16" cy="-42" r="6" fill="#1B2230" stroke="none"/>
    </g>`;
  }

  /* ---------- hero landscape (1000 x 700) ---------- */
  function landscape() {
    const r = rng(7);
    let trees = "";
    for (let i = 0; i < 26; i++) {
      const left = i < 13;
      const x = left ? 20 + r() * 380 : 700 + r() * 290;
      const y = 505 + r() * 60;
      const h = 34 + r() * 40;
      trees += `<path d="M${x},${y - h} L${x - h * .32},${y} L${x + h * .32},${y} Z" fill="${r() > .5 ? "#2E4B38" : "#365741"}"/>`;
    }
    let glints = "";
    for (let i = 0; i < 34; i++) {
      const x = 30 + r() * 420, y = 474 + r() * 44;
      glints += `<ellipse cx="${x}" cy="${y}" rx="${8 + r() * 22}" ry="${1.2 + r() * 1.6}" fill="#fff" opacity="${.55 + r() * .45}"/>`;
    }
    return `<svg viewBox="0 0 1000 700" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6E9CC8"/><stop offset=".55" stop-color="#C9DDEB"/><stop offset=".72" stop-color="#F2E4C8"/></linearGradient>
        <radialGradient id="haloG"><stop offset="0" stop-color="#FFF7DE" stop-opacity="1"/><stop offset=".25" stop-color="#FFF1CC" stop-opacity=".7"/><stop offset="1" stop-color="#FFF1CC" stop-opacity="0"/></radialGradient>
        <linearGradient id="lakeG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8DBAD3"/><stop offset="1" stop-color="#3D6C8A"/></linearGradient>
        <linearGradient id="roadG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6A707A"/><stop offset="1" stop-color="#3C4049"/></linearGradient>
      </defs>
      <rect width="1000" height="700" fill="url(#skyG)"/>
      <path d="M0,400 L90,300 L160,350 L260,240 L360,330 L440,280 L540,360 L640,250 L760,340 L860,290 L1000,370 L1000,700 L0,700Z" fill="#8FA8C0"/>
      <path d="M260,240 L232,266 L248,262 L260,274 L274,262 L290,268Z M640,250 L612,276 L628,272 L640,284 L652,272 L670,278Z M860,290 L838,310 L852,306 L862,316 L872,306 L884,312Z" fill="#fff" opacity=".9"/>
      <path d="M0,452 C120,402 220,420 320,392 C420,362 520,422 640,402 C760,382 860,422 1000,402 L1000,700 L0,700Z" fill="#5E7C8C"/>
      <path d="M0,462 C160,448 340,456 480,472 C420,500 300,524 0,532Z" fill="url(#lakeG)"/>
      <path d="M0,522 C140,500 260,520 380,540 C520,560 600,500 720,490 C840,480 920,500 1000,490 L1000,700 L0,700Z" fill="#6F8F55"/>
      ${trees}
      <path d="M0,604 C160,574 300,604 430,646 L430,700 L0,700Z M1000,584 C860,574 760,604 690,700 L1000,700Z" fill="#4B6E40"/>
      <path d="M584,488 C562,530 474,580 472,630 C470,662 420,690 352,700 L870,700 C744,682 642,652 640,610 C638,568 610,522 598,488Z" fill="url(#roadG)"/>
      <path d="M591,490 C584,540 556,580 556,626 C556,660 600,690 612,700" stroke="#F1E3B0" stroke-width="4" stroke-dasharray="16 16" fill="none"/>
      ${cyclist(560, 612, 1.05, "#C8475E")}
      <g class="glare">
        <circle cx="770" cy="170" r="260" fill="url(#haloG)"/>
        <g stroke="#FFF6D8" stroke-width="3" opacity=".7" stroke-linecap="round">
          <path d="M770,60 L770,20 M770,280 L770,320 M660,170 L620,170 M880,170 L920,170 M692,92 L664,64 M848,248 L876,276 M848,92 L876,64 M692,248 L664,276"/>
        </g>
        ${glints}
        <path d="M596,500 C590,550 568,592 574,646" stroke="#fff" stroke-opacity=".32" stroke-width="30" stroke-linecap="round" fill="none"/>
      </g>
      <circle cx="770" cy="170" r="44" fill="#FFF9E8"/>
    </svg>`;
  }

  /* ---------- sport scenes inside a goggle lens (600 x 240) ---------- */
  const sportArt = {
    cycling: `
      <rect width="600" height="240" fill="#BFD6E8"/><rect y="120" width="600" height="120" fill="#7E9E62"/>
      <path d="M0,130 L120,80 L200,112 L320,62 L420,108 L520,76 L600,104 L600,140 L0,140Z" fill="#7F98B2"/>
      <path d="M270,240 L296,128 L304,128 L360,240Z" fill="#4A4F58"/>
      <path d="M300,132 L300,240" stroke="#F1E3B0" stroke-width="3" stroke-dasharray="10 9"/>
      ${cyclist(312, 190, .8, "#C8475E")}`,
    running: `
      <rect width="600" height="240" fill="#CFE0EC"/>
      <ellipse cx="300" cy="250" rx="420" ry="150" fill="#C65A3E"/>
      <ellipse cx="300" cy="262" rx="300" ry="96" fill="#4F8A4E"/>
      <g fill="none" stroke="#fff" stroke-width="2"><ellipse cx="300" cy="250" rx="400" ry="140"/><ellipse cx="300" cy="252" rx="370" ry="128"/><ellipse cx="300" cy="254" rx="340" ry="116"/><ellipse cx="300" cy="257" rx="312" ry="104"/></g>
      <rect x="40" y="70" width="520" height="26" fill="#9AA7B4" opacity=".6"/>`,
    ski: `
      <rect width="600" height="240" fill="#4C7FB8"/>
      <path d="M0,110 L110,40 L190,90 L300,20 L410,96 L500,50 L600,100 L600,240 L0,240Z" fill="#E9F1F8"/>
      <path d="M300,20 L260,48 L300,40 L340,52Z M110,40 L84,58 L114,54Z" fill="#fff"/>
      <path d="M0,150 C200,120 380,150 600,130 L600,240 L0,240Z" fill="#F7FAFD"/>
      <g fill="#2E4B5E"><path d="M60,170 l-16,40 h32z M90,160 l-14,36 h28z M520,160 l-16,42 h32z M552,176 l-12,30 h24z"/></g>
      <path d="M240,240 C270,200 330,190 350,150 M262,240 C290,204 346,192 364,152" stroke="#B7CBE0" stroke-width="2" fill="none"/>`,
    outdoor: `
      <rect width="600" height="240" fill="#D7E3EA"/>
      <path d="M0,170 L90,70 L150,120 L250,30 L340,120 L420,60 L520,140 L600,90 L600,240 L0,240Z" fill="#8A7D6E"/>
      <path d="M250,30 L220,64 L250,56 L282,70Z M420,60 L398,86 L424,80 L444,90Z" fill="#fff"/>
      <path d="M0,200 C160,170 300,200 600,180 L600,240 L0,240Z" fill="#6B6152"/>
      <path d="M80,240 C160,214 240,214 300,186 C340,168 380,160 420,130" stroke="#E8D7B8" stroke-width="4" stroke-dasharray="2 8" stroke-linecap="round" fill="none"/>`,
    water: `
      <rect width="600" height="240" fill="#F2D9B0"/><rect y="0" width="600" height="110" fill="#E7C9A0" opacity=".6"/>
      <circle cx="420" cy="80" r="26" fill="#FFF5DC"/>
      <rect y="112" width="600" height="128" fill="#2F7488"/>
      <g stroke="#9ED3DE" stroke-width="2" fill="none" opacity=".8"><path d="M20,150 q20,-6 40,0 t40,0"/><path d="M200,180 q20,-6 40,0 t40,0"/><path d="M80,210 q20,-6 40,0 t40,0"/><path d="M460,200 q20,-6 40,0 t40,0"/></g>
      <g class="glare-mini" fill="#fff"><ellipse cx="420" cy="130" rx="60" ry="3"/><ellipse cx="410" cy="146" rx="40" ry="2"/><ellipse cx="430" cy="160" rx="26" ry="2"/></g>
      <path d="M150,120 l60,0 l-8,10 l-46,0z M178,120 l0,-36 l22,30z" fill="#1B2230"/>`,
    precision: `
      <rect width="600" height="240" fill="#CFE3F0"/>
      <path d="M0,120 C160,100 420,104 600,116 L600,240 L0,240Z" fill="#6FA35A"/>
      <ellipse cx="380" cy="160" rx="150" ry="40" fill="#8CC06F"/>
      <ellipse cx="400" cy="166" rx="6" ry="2.5" fill="#1B2230"/>
      <path d="M400,166 L400,96" stroke="#1B2230" stroke-width="2.5"/><path d="M400,96 L436,106 L400,116Z" fill="#C8475E"/>
      <g fill="#3E6B3A"><circle cx="70" cy="110" r="26"/><circle cx="110" cy="104" r="30"/><circle cx="540" cy="108" r="24"/></g>`
  };

  let uid = 0;
  function lensScene(name) {
    const id = "lc" + (++uid);
    return `<svg viewBox="-10 0 620 240" aria-hidden="true">
      <defs><clipPath id="${id}"><path d="${LENS}"/></clipPath>
        <linearGradient id="${id}r" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
      <g clip-path="url(#${id})">${sportArt[name]}<path d="${LENS}" fill="url(#${id}r)"/></g>
      <path d="${LENS}" fill="none" stroke="#0F1B2D" stroke-width="3"/>
      <path d="${FRAME}" fill="#0F1B2D"/>
      <path d="M24,94 C14,98 6,106 -8,110 M576,94 C586,98 594,106 608,110" stroke="#0F1B2D" stroke-width="9" stroke-linecap="round" fill="none"/>
    </svg>`;
  }

  /* ---------- lens detail preview (shared landscape strip) ---------- */
  function previewStrip(name) {
    return `<svg viewBox="0 0 600 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${sportArt[name]}</svg>`;
  }

  /* ---------- factory (about) ---------- */
  function factory() {
    const c = "#8FB6CF";
    let lenses = "";
    const tints = ["#B9762A", "#C8475E", "#2C6A70", "#DCEAF3", "#6E5BD6", "#4B5563", "#DCEAF3", "#B9762A"];
    tints.forEach((t, i) => {
      lenses += `<ellipse cx="${70 + i * 80}" cy="402" rx="26" ry="9" fill="${t}" opacity=".95"/><ellipse cx="${70 + i * 80}" cy="399" rx="16" ry="4" fill="#fff" opacity=".35"/>`;
    });
    let floor = "";
    for (let i = 0; i <= 12; i++) floor += `<path d="M${345 + (i - 6) * 20},460 L${345 + (i - 6) * 120},570" />`;
    return `<svg viewBox="0 0 690 570" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Illustration of the TaiWoo production line">
      <rect width="690" height="570" fill="#0F1B2D"/>
      <g stroke="${c}" stroke-opacity=".18" fill="none">${floor}<path d="M0,480 H690 M0,510 H690 M0,545 H690"/></g>
      <g stroke="${c}" stroke-width="2" fill="#172741">
        <rect x="40" y="150" width="170" height="220" rx="14"/><rect x="260" y="110" width="170" height="260" rx="14"/><rect x="480" y="170" width="170" height="200" rx="14"/>
      </g>
      <g fill="#0F1B2D" stroke="${c}" stroke-width="1.5"><rect x="62" y="176" width="126" height="70" rx="6"/><rect x="282" y="136" width="126" height="70" rx="6"/><rect x="502" y="196" width="126" height="70" rx="6"/></g>
      <g stroke="${c}" stroke-width="1.5" fill="none" opacity=".9">
        <ellipse cx="125" cy="211" rx="40" ry="20"/><ellipse cx="125" cy="211" rx="26" ry="12"/><ellipse cx="125" cy="211" rx="12" ry="5"/>
        <path d="M296,190 L316,170 L336,182 L356,160 L376,172 L396,150"/>
        <path d="M520,232 C540,206 600,206 612,232 C600,252 540,252 520,232Z" stroke-dasharray="4 4"/>
      </g>
      <path d="M345,206 L345,250 M325,250 L365,250 L355,300 L335,300Z" stroke="${c}" stroke-width="2" fill="#0F1B2D"/>
      <path d="M260,260 C310,240 380,240 430,260" stroke="${c}" stroke-width="2" fill="none"/>
      <g fill="${c}" opacity=".7"><circle cx="300" cy="280" r="2"/><circle cx="390" cy="284" r="2"/><circle cx="320" cy="320" r="2"/><circle cx="372" cy="330" r="2"/><circle cx="345" cy="340" r="2"/></g>
      <rect x="20" y="384" width="650" height="30" rx="15" fill="#172741" stroke="${c}" stroke-width="2"/>
      ${lenses}
      <g font-family="Archivo, sans-serif" font-size="15" font-weight="600" fill="${c}"><text x="125" y="300" text-anchor="middle">Surfacing</text><text x="345" y="100" text-anchor="middle">Vacuum coating</text><text x="565" y="300" text-anchor="middle">Edging</text></g>
    </svg>`;
  }

  /* ---------- Rx lab step icons (300 x 200) ---------- */
  const s = `stroke="#8FB6CF" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
  const labArt = [
    `<rect x="60" y="34" width="180" height="120" rx="8" ${s}/><g ${s} opacity=".9"><ellipse cx="150" cy="94" rx="70" ry="40"/><ellipse cx="150" cy="94" rx="48" ry="26"/><ellipse cx="150" cy="94" rx="24" ry="12"/></g><path d="M150,40 V148 M66,94 H234" stroke="#C8475E" stroke-width="1" stroke-dasharray="3 3"/><path d="M120,170 H180" ${s}/>`,
    `<ellipse cx="150" cy="130" rx="80" ry="22" ${s}/><path d="M70,130 V146 C70,158 230,158 230,146 V130" ${s}/><path d="M150,40 V96" ${s}/><path d="M138,96 H162 L150,112Z" fill="#8FB6CF"/><g stroke="#8FB6CF" stroke-opacity=".5" fill="none"><ellipse cx="150" cy="130" rx="60" ry="15"/><ellipse cx="150" cy="130" rx="40" ry="10"/><ellipse cx="150" cy="130" rx="20" ry="5"/></g>`,
    `<ellipse cx="150" cy="128" rx="78" ry="24" ${s}/><rect x="110" y="60" width="80" height="34" rx="17" ${s}/><path d="M150,40 V60 M150,94 V108" ${s}/><path d="M80,80 C60,100 60,120 72,132 M220,80 C240,100 240,120 228,132" stroke="#C8475E" stroke-width="2" fill="none" stroke-dasharray="4 5"/>`,
    `<g><circle cx="80" cy="70" r="18" fill="#B9762A"/><circle cx="125" cy="70" r="18" fill="#C8475E"/><circle cx="170" cy="70" r="18" fill="#2C6A70"/><circle cx="215" cy="70" r="18" fill="#6E5BD6"/></g><ellipse cx="150" cy="140" rx="70" ry="22" fill="#2C6A70" fill-opacity=".35" ${s}/><path d="M150,92 V114" ${s}/>`,
    `<path d="M70,160 V110 A80,80 0 0 1 230,110 V160 Z" ${s}/><path d="M60,160 H240" ${s}/><g fill="#8FB6CF"><ellipse cx="110" cy="96" rx="12" ry="5"/><ellipse cx="150" cy="80" rx="12" ry="5"/><ellipse cx="190" cy="96" rx="12" ry="5"/></g><g fill="#DCEAF3" opacity=".7"><circle cx="130" cy="130" r="2"/><circle cx="150" cy="140" r="2"/><circle cx="170" cy="126" r="2"/><circle cx="140" cy="116" r="1.5"/><circle cx="162" cy="146" r="1.5"/></g><path d="M150,160 V176 M130,176 H170" ${s}/>`,
    `<path d="M50,100 C60,60 140,52 150,56 C160,52 240,60 250,100 C256,130 230,150 200,148 C180,146 170,128 150,128 C130,128 120,146 100,148 C70,150 44,130 50,100Z" stroke="#8FB6CF" stroke-width="2" fill="none" stroke-dasharray="6 5"/><circle cx="250" cy="100" r="22" ${s}/><circle cx="250" cy="100" r="4" fill="#8FB6CF"/><path d="M228,100 H200" stroke="#C8475E" stroke-width="2"/>`,
    `<path d="M30,88 C46,46 120,36 150,38 C180,36 254,46 270,88 L262,96 C250,58 180,52 150,54 C120,52 50,58 38,96Z" fill="#8FB6CF"/><path d="M42,96 C52,64 120,56 150,58 C180,56 248,64 258,96 C264,124 250,148 222,152 C192,156 172,140 150,140 C128,140 108,156 78,152 C50,148 36,124 42,96Z" fill="#8FB6CF" fill-opacity=".18" ${s}/><circle cx="234" cy="160" r="20" fill="#0F1B2D" ${s}/><path d="M224,160 L231,167 L245,153" ${s}/>`
  ];
  const labData = [
    ["Digital prescription design", "Each Rx is converted into a freeform surface calculated for the frame's wrap and position of wear."],
    ["Sub-micron precision surfacing", "CNC generators cut the calculated surface into the lens blank."],
    ["Fully automated digital polishing", "Polishing follows the same digital file, so optical quality holds across the lens."],
    ["Coating & colour configuration", "Tint, mirror and functional layers are specified for the sport and the brand."],
    ["Precision high-vacuum coating", "Mirror, anti-reflective and protective layers are deposited in a vacuum chamber."],
    ["Freeform custom edging", "Lenses are edged to the exact shape of each frame, including high-wrap shields."],
    ["Contour forming & final verification", "Lenses are fitted to the frame and checked against the prescription before packing."]
  ];

  window.TW = {
    landscape, lensScene, previewStrip, factory,
    labCards() {
      return labData.map((d, i) => `<article class="labcard">
        <svg viewBox="0 0 300 200" aria-hidden="true">${labArt[i]}</svg>
        <span class="k">Step ${i + 1} of 7</span><h3>${d[0]}</h3><p>${d[1]}</p></article>`).join("");
    }
  };
})();
