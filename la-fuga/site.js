/* La Fuga demo v4: gedeelde scripts; elk blok draait alleen als het element op de pagina staat */
var rustig = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

/* hero-video: reduced-motion = stilstaande poster */
(function(){
  var v = document.getElementById("vitrine-video");
  if (!v) return;
  if (rustig) { v.removeAttribute("autoplay"); v.pause(); return; }
  var p = v.play && v.play(); if (p && p.catch) p.catch(function(){});
})();

/* zwevende knoppen zodra de hero uit beeld is */
(function(){
  var z = document.getElementById("zweef"), hero = document.querySelector(".hero, .pagina-kop");
  if (!z || !hero) return;
  if (!("IntersectionObserver" in window)) { z.classList.add("aan"); return; }
  new IntersectionObserver(function(e){
    var aan = !e[0].isIntersecting;
    z.classList.toggle("aan", aan);
    document.body.classList.toggle("zweef-aan", aan);
  }, {threshold:0}).observe(hero);
})();

/* zachte reveal (alleen verschuiven, inhoud blijft altijd zichtbaar) */
(function(){
  var els = document.querySelectorAll(".rv");
  if (rustig || !("IntersectionObserver" in window)) { els.forEach(function(e){ e.classList.add("in"); }); return; }
  var io = new IntersectionObserver(function(ents){
    ents.forEach(function(en){ if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, {rootMargin:"0px 0px -8% 0px"});
  els.forEach(function(e, i){ e.style.transitionDelay = (i % 4) * 90 + "ms"; io.observe(e); });
})();

/* carrousel: pijltjes op desktop */
(function(){
  var r = document.getElementById("rail"), t = document.getElementById("rail-terug"), v = document.getElementById("rail-verder");
  if (!r || !t || !v) return;
  function stap(){ var k = r.querySelector(".product"); return k ? k.getBoundingClientRect().width + 16 : 300; }
  function stand(){ t.disabled = r.scrollLeft < 4; v.disabled = r.scrollLeft + r.clientWidth > r.scrollWidth - 4; }
  t.addEventListener("click", function(){ r.scrollBy({left:-stap() * 2, behavior: rustig ? "auto" : "smooth"}); });
  v.addEventListener("click", function(){ r.scrollBy({left: stap() * 2, behavior: rustig ? "auto" : "smooth"}); });
  r.addEventListener("scroll", stand, {passive:true}); window.addEventListener("resize", stand); stand();
})();

/* parallax op één foto (de tafel) */
(function(){
  var img = document.getElementById("parallax");
  if (!img || rustig) return;
  var fig = img.parentNode, bezig = false;
  function zet(){
    bezig = false;
    var b = fig.getBoundingClientRect(), h = window.innerHeight;
    if (b.bottom < 0 || b.top > h) return;
    var f = (b.top + b.height / 2 - h / 2) / (h + b.height);
    img.style.transform = "translate3d(0," + (f * -12).toFixed(2) + "%,0)";
  }
  window.addEventListener("scroll", function(){ if (!bezig) { bezig = true; requestAnimationFrame(zet); } }, {passive:true});
  zet();
})();

/* "Wat wordt het vandaag?": moment -> 3 dingen van de kaart of uit de vitrine */
(function(){
  var F = function(src, pos, alt){ return {src:src, pos:pos, alt:alt}; };
  var keuze = {
    thee: [
      {n:"Red velvet cheesecake", w:"Uit de vitrine", f:F("img/v3-cheesecake-redvelvet.webp","50% 74%","Red velvet cheesecake in punten")},
      {n:"Pistache cheesecake", w:"Uit de vitrine", f:F("img/v3-cheesecake-pistache.webp","50% 66%","Pistache cheesecake in punten")},
      {n:"Lotus mini cheesecake", w:"Uit de vitrine", f:F("img/v3-lotus-minis.webp","50% 50%","Lotus mini cheesecakes")}
    ],
    matcha: [
      {n:"Strawberry Matcha", w:"Van onze kaartmuur", f:F("img/v3-menu-muur-kaart.webp","50% 100%","Onze kaartmuur in goudletters, onderaan de kop Matcha"), muur:1},
      {n:"Macarons", w:"Uit de vitrine", f:F("img/v3-macarons.webp","50% 55%","Rijen macarons in alle kleuren")},
      {n:"Mini cakes", w:"Uit de vitrine", f:F("img/v3-mini-cakes.webp","50% 50%","Mini cakes met room en pistache")}
    ],
    brunch: [
      {n:"Santorini Sunset", w:"Smoothie: strawberry, banana & jus d'orange", f:F("img/v3-menu-muur-kaart.webp","50% 78%","Onze kaartmuur in goudletters met de smoothies, waaronder Santorini Sunset"), muur:1},
      {n:"Cheesecake met karamel en chocolade", w:"Uit de vitrine, om te delen", f:F("img/v3-cheesecake-karamel.webp","50% 72%","Cheesecake met karamel en stukjes chocoladereep")},
      {n:"Desserts in een glas", w:"Uit de vitrine", f:F("img/v3-dessertbekers.webp","50% 64%","Desserts in kleine bekers")}
    ],
    laat: [
      {n:"Brownies", w:"Uit de vitrine", f:F("img/v3-brownies.webp","50% 58%","Brownie met stukjes chocoladereep")},
      {n:"Cookies", w:"Red velvet en wit, uit de vitrine", f:F("img/v3-cookies.webp","50% 64%","Red velvet- en witte cookies")},
      {n:"Lotus mini cheesecake", w:"Uit de vitrine", f:F("img/v3-lotus-minis.webp","50% 50%","Lotus mini cheesecakes")}
    ]
  };
  var doel = document.getElementById("voorstel"), knoppen = document.querySelectorAll(".moment");
  if (!doel) return;
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function teken(m){
    doel.innerHTML = keuze[m].map(function(x){
      var beeld = '<div class="ft' + (x.muur ? ' muurtje' : '') + '"><img src="' + x.f.src + '" alt="' + esc(x.f.alt) + '" width="' + (x.muur ? 826 : 900) + '" height="' + (x.muur ? 1564 : 1600) + '" style="object-position:' + x.f.pos + '" loading="lazy" decoding="async"></div>';
      return '<article class="tip">' + beeld + '<div><h3>' + esc(x.n) + '</h3><p>' + esc(x.w) + '</p></div></article>';
    }).join("");
  }
  function kies(knop){
    knoppen.forEach(function(k){ k.setAttribute("aria-pressed", k === knop ? "true" : "false"); });
    if (rustig) { teken(knop.dataset.m); return; }
    doel.addEventListener("transitionend", function klaar(){
      doel.removeEventListener("transitionend", klaar);
      teken(knop.dataset.m); doel.classList.remove("wissel");
    });
    doel.classList.add("wissel");
  }
  knoppen.forEach(function(k){ k.addEventListener("click", function(){ kies(k); }); });
  teken("thee");
})();

/* kaart met tabs (pijltjestoetsen werken ook) */
(function(){
  var tabs = [].slice.call(document.querySelectorAll(".tab"));
  function open(t, focus){
    tabs.forEach(function(x){
      var aan = x === t;
      x.setAttribute("aria-selected", aan ? "true" : "false");
      x.tabIndex = aan ? 0 : -1;
      document.getElementById(x.getAttribute("aria-controls")).hidden = !aan;
    });
    if (focus) t.focus();
    t.scrollIntoView({block:"nearest", inline:"nearest", behavior: rustig ? "auto" : "smooth"});
  }
  tabs.forEach(function(t, i){
    t.addEventListener("click", function(){ open(t); });
    t.addEventListener("keydown", function(e){
      if (e.key === "ArrowRight") open(tabs[(i + 1) % tabs.length], true);
      if (e.key === "ArrowLeft") open(tabs[(i - 1 + tabs.length) % tabs.length], true);
    });
  });
})();

/* kaart laden met één klik (playbooks/snippets/kaart-klik.html) */
document.querySelectorAll(".mm-kaart").forEach(function(k){
  var b = k.querySelector(".mk-knop"); if (!b) return;
  b.addEventListener("click", function(){
    var f = document.createElement("iframe");
    f.src = k.getAttribute("data-src"); f.title = k.getAttribute("data-titel") || "Kaart";
    f.loading = "lazy"; f.referrerPolicy = "no-referrer-when-downgrade"; f.allowFullscreen = true;
    k.innerHTML = ""; k.appendChild(f);
  });
});

/* pitch-paneel: alleen met ?pitch */
(function(){
  var p = document.getElementById("pitch"), knop = document.getElementById("pitch-knop");
  if (!p || !knop) return;
  if (!/[?&]pitch\b/.test(location.search) || window.self !== window.top) return;
  knop.hidden = false;
  function open(){ p.classList.add("open"); document.body.style.overflow = "hidden"; }
  function dicht(){ p.classList.remove("open"); document.body.style.overflow = ""; }
  knop.addEventListener("click", open);
  document.getElementById("pp-sluit").addEventListener("click", dicht);
  p.addEventListener("click", function(e){ if (e.target === p) dicht(); });
  document.addEventListener("keydown", function(e){ if (e.key === "Escape") dicht(); });
  var euro = function(n){ return "€ " + Math.round(n).toLocaleString("nl-NL"); };
  var g = document.getElementById("r-gasten"), b = document.getElementById("r-besteding");
  function reken(){
    var gasten = +g.value, best = +b.value;
    document.getElementById("o-gasten").textContent = gasten;
    document.getElementById("o-besteding").textContent = euro(best);
    document.getElementById("u-week").textContent = euro(gasten * best);
    document.getElementById("u-jaar").textContent = euro(gasten * best * 52);
    document.getElementById("u-gasten").textContent = Math.ceil(595 / best) + " gasten";
  }
  g.addEventListener("input", reken); b.addEventListener("input", reken); reken();
})();

/* laadscherm: tik of klik slaat over (de tijd zelf regelt CSS, dus het blokkeert nooit) */
(function(){
  var i = document.getElementById("intro"), h = document.documentElement;
  if (!i || !h.classList.contains("intro")) return;
  function weg(){ h.classList.add("intro-weg"); }
  i.addEventListener("click", weg);
  i.addEventListener("animationend", function(e){ if (e.animationName === "introweg") weg(); });
})();

/* menu (mobiel) */
(function(){
  var m = document.getElementById("menu"), open = document.getElementById("menu-open");
  if (!m || !open) return;
  var sluit = m.querySelector(".sluit");
  function aan(){ m.hidden = false; m.classList.add("open"); document.body.style.overflow = "hidden"; open.setAttribute("aria-expanded", "true"); sluit.focus(); }
  function uit(){ m.hidden = true; m.classList.remove("open"); document.body.style.overflow = ""; open.setAttribute("aria-expanded", "false"); open.focus(); }
  open.addEventListener("click", aan);
  sluit.addEventListener("click", uit);
  m.querySelectorAll("a").forEach(function(a){ a.addEventListener("click", function(){ m.hidden = true; document.body.style.overflow = ""; }); });
  document.addEventListener("keydown", function(e){ if (e.key === "Escape" && !m.hidden) uit(); });
})();

/* zwevende cheesecakes: zweven (CSS) + meebewegen met muis, vinger en scroll, elk op een eigen diepte */
(function(){
  var hero = document.querySelector(".hero"), koeken = [].slice.call(document.querySelectorAll(".koek"));
  if (!hero || !koeken.length || rustig) return;
  var doelX = 0, doelY = 0, x = 0, y = 0, zicht = true, loopt = false;
  function richt(cx, cy){
    var b = hero.getBoundingClientRect();
    doelX = (cx - b.left) / b.width - .5;
    doelY = (cy - b.top) / b.height - .5;
    start();
  }
  window.addEventListener("pointermove", function(e){ if (e.pointerType === "mouse") richt(e.clientX, e.clientY); }, {passive:true});
  hero.addEventListener("touchstart", function(e){ var t = e.touches[0]; richt(t.clientX, t.clientY); }, {passive:true});
  hero.addEventListener("touchmove", function(e){ var t = e.touches[0]; richt(t.clientX, t.clientY); }, {passive:true});
  hero.addEventListener("touchend", function(){ doelX = 0; doelY = 0; start(); }, {passive:true});
  window.addEventListener("scroll", start, {passive:true});
  if ("IntersectionObserver" in window) new IntersectionObserver(function(e){ zicht = e[0].isIntersecting; if (zicht) start(); }).observe(hero);
  var vorigeY = -1;
  function start(){ if (!loopt && zicht) { loopt = true; requestAnimationFrame(stap); } }
  function stap(){
    x += (doelX - x) * .08; y += (doelY - y) * .08;
    var mob = window.innerWidth < 960, sy = mob ? 0 : Math.min(window.scrollY, hero.offsetHeight), f = mob ? .3 : 1;
    koeken.forEach(function(k){
      var d = +k.getAttribute("data-diepte") || 1;
      k.style.transform = "translate3d(" + (x * 46 * d * f).toFixed(1) + "px," + (y * 36 * d * f - sy * .18 * d).toFixed(1) + "px,0)";
    });
    var beweegt = Math.abs(doelX - x) > .002 || Math.abs(doelY - y) > .002 || sy !== vorigeY;
    vorigeY = sy;
    if (beweegt) requestAnimationFrame(stap); else loopt = false;
  }
  start();
})();

/* cheesecakepagina: rustige fade + 22px omhoog + schaal .98 -> 1, eenmalig */
(function(){
  var els = [].slice.call(document.querySelectorAll(".fade"));
  if (!els.length) return;
  /* geautomatiseerde browsers (QA-screenshots, scrollen niet) zien alles meteen; bezoekers krijgen de fade */
  if (rustig || navigator.webdriver || !("IntersectionObserver" in window)) { els.forEach(function(e){ e.classList.add("in"); }); return; }
  var io = new IntersectionObserver(function(ents){
    ents.forEach(function(en){ if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, {rootMargin:"0px 0px -12% 0px"});
  els.forEach(function(e){ io.observe(e); });
  window.addEventListener("beforeprint", function(){ els.forEach(function(e){ e.classList.add("in"); }); });
})();

/* Cake match: swipe rechts = lekker, links = niets voor mij */
(function(){
  var sec = document.getElementById("match");
  if (!sec) return;
  var taarten = [
    {n:"Red velvet cheesecake", w:"Romig wit, met red velvet-kruim", f:"img/cut-cheesecake-redvelvet.webp", b:1200, h:1000},
    {n:"Lotus mini cheesecake", w:"Met een Lotus-koekje", f:"img/cut-mini-lotus.webp", b:670, h:812},
    {n:"Cheesecake met karamel en chocolade", w:"Karamel, met stukjes chocoladereep", f:"img/cut-cheesecake-karamel.webp", b:1200, h:984},
    {n:"Pistache cheesecake", w:"Pistache, op een bodem van kruim", f:"img/cut-cheesecake-pistache.webp", b:1189, h:853},
    {n:"Cheesecake met room en limoen", w:"Toefjes room en schijfjes limoen", f:"img/cut-cheesecake-citroen.webp", b:1200, h:727}
  ];
  var stapel = sec.querySelector(".stapel"), spel = sec.querySelector(".spel"), uit = sec.querySelector(".uitslag"),
      teller = sec.querySelector(".teller"), lekker = [], beurt = 0;
  function esc(s){ return String(s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function bouw(){
    stapel.innerHTML = ""; lekker = []; beurt = 0;
    taarten.slice().reverse().forEach(function(t){
      var k = document.createElement("article");
      k.className = "mkaart";
      k.innerHTML = '<span class="st ja" aria-hidden="true">Lekker</span><span class="st nee" aria-hidden="true">Niets voor mij</span>' +
        '<img src="' + t.f + '" alt="" width="' + t.b + '" height="' + t.h + '" draggable="false"><h3>' + esc(t.n) + '</h3><p>' + esc(t.w) + '</p>';
      k._t = t; stapel.appendChild(k);
    });
    schik(); spel.hidden = false; uit.hidden = true; uit.innerHTML = "";
  }
  function kaarten(){ return [].slice.call(stapel.querySelectorAll(".mkaart:not(.weg)")).reverse(); }
  function schik(){
    kaarten().forEach(function(k, i){
      k.style.zIndex = 10 - i;
      k.style.transform = i ? "translateY(" + Math.min(i, 2) * 12 + "px) scale(" + (1 - Math.min(i, 2) * .045) + ")" : "";
      k.style.opacity = i > 2 ? 0 : 1;
      k.setAttribute("aria-hidden", i ? "true" : "false");
    });
    teller.textContent = Math.min(beurt + 1, taarten.length) + " / " + taarten.length;
    sleepbaar(kaarten()[0]);
  }
  function kies(ja){
    var k = kaarten()[0]; if (!k) return;
    if (ja) lekker.push(k._t);
    k.classList.add("weg");
    k.style.transform = "translate(" + (ja ? 130 : -130) + "vw,-4vh) rotate(" + (ja ? 28 : -28) + "deg)";
    k.style.opacity = 0;
    beurt++;
    if (beurt >= taarten.length) {
      if (rustig) toon(); else k.addEventListener("transitionend", toon, {once:true});
    } else schik();
  }
  function toon(){
    if (!uit.hidden) return;
    spel.hidden = true; uit.hidden = false;
    if (!lekker.length) {
      uit.innerHTML = '<p class="label">Geen match deze keer</p><h3>Kom kijken in de vitrine</h3>' +
        '<div class="knoppen"><a class="knop vol" href="tel:+31102035909">Bel om te reserveren</a><button type="button" class="knop lijn opnieuw">Opnieuw</button></div>';
    } else {
      var m = lekker[Math.floor(Math.random() * lekker.length)];
      uit.innerHTML = '<img class="groot' + (m.h > m.b ? ' staand' : '') + '" src="' + m.f + '" alt="' + esc(m.n) + '" width="' + m.b + '" height="' + m.h + '">' +
        '<p class="label">Jouw match' + (lekker.length > 1 ? ' (je vond er ' + lekker.length + ' lekker)' : '') + '</p><h3>' + esc(m.n) + '</h3>' +
        '<p class="hint">Kom hem proeven: bel om te reserveren.</p>' +
        '<div class="knoppen"><a class="knop vol" href="tel:+31102035909">Bel om te reserveren</a><button type="button" class="knop lijn opnieuw">Opnieuw</button></div>';
    }
    uit.querySelector(".opnieuw").addEventListener("click", bouw);
    var r = sec.getBoundingClientRect();
    if (r.top < 0) window.scrollBy({top: uit.getBoundingClientRect().top - 24, behavior: rustig ? "auto" : "smooth"});
  }
  function sleepbaar(k){
    if (!k || k._sleep) return; k._sleep = true;
    var sx = 0, sy = 0, dx = 0, actief = false, ja = k.querySelector(".ja"), nee = k.querySelector(".nee");
    k.addEventListener("pointerdown", function(e){ actief = true; sx = e.clientX; sy = e.clientY; dx = 0; k.classList.add("sleep"); try { k.setPointerCapture(e.pointerId); } catch (x) {} });
    k.addEventListener("pointermove", function(e){
      if (!actief) return;
      dx = e.clientX - sx;
      k.style.transform = "translate(" + dx + "px," + ((e.clientY - sy) * .15) + "px) rotate(" + (dx / 16) + "deg)";
      ja.style.opacity = Math.max(0, Math.min(1, dx / 90)); nee.style.opacity = Math.max(0, Math.min(1, -dx / 90));
    });
    function los(){
      if (!actief) return; actief = false; k.classList.remove("sleep");
      ja.style.opacity = 0; nee.style.opacity = 0;
      if (Math.abs(dx) > 90) kies(dx > 0); else k.style.transform = "";
    }
    k.addEventListener("pointerup", los); k.addEventListener("pointercancel", los);
  }
  sec.querySelector(".nee-knop").addEventListener("click", function(){ kies(false); });
  sec.querySelector(".ja-knop").addEventListener("click", function(){ kies(true); });
  sec.addEventListener("keydown", function(e){
    if (e.target.closest && e.target.closest("input,textarea")) return;
    if (e.key === "ArrowLeft") kies(false);
    if (e.key === "ArrowRight") kies(true);
  });
  bouw();
})();

/* formulieren in de demo: niets versturen, wel netjes melden */
document.querySelectorAll("form[data-demo]").forEach(function(f){
  f.addEventListener("submit", function(e){
    e.preventDefault();
    if (!f.checkValidity()) { f.reportValidity(); return; }
    var b = document.getElementById(f.getAttribute("data-demo"));
    f.hidden = true; b.hidden = false; b.setAttribute("tabindex", "-1"); b.focus();
  });
});
