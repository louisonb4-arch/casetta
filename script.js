// A Casetta — interactions

// mode QA : neutralise le 100svh du hero pour les captures pleine page
if (new URLSearchParams(location.search).has('qa')) {
  document.querySelector('.hero').style.minHeight = 'auto';
}

// ---------- menu mobile ----------
const burger = document.getElementById('burger');
const mobmenu = document.getElementById('mobmenu');

function toggleMenu(force) {
  const open = force !== undefined ? force : !mobmenu.classList.contains('open');
  mobmenu.classList.toggle('open', open);
  burger.classList.toggle('open', open);
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  mobmenu.setAttribute('aria-hidden', String(!open));
  document.body.style.overflow = open ? 'hidden' : '';
}

burger.addEventListener('click', () => toggleMenu());
mobmenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => toggleMenu(false)));
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && mobmenu.classList.contains('open')) toggleMenu(false);
});

// ---------- topbar : se cache en descendant, revient en montant ----------
const topbar = document.getElementById('topbar');
let lastY = window.scrollY;
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  topbar.classList.toggle('hide', y > lastY && y > 160 && !mobmenu.classList.contains('open'));
  lastY = y;
}, { passive: true });

// ---------- reveals ----------
const io = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('on');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -5% 0px' });

let revealsStarted = false;
function startReveals() {
  if (revealsStarted) return;
  revealsStarted = true;
  document.querySelectorAll('.reveal, .reveal-clip').forEach(el => {
    // déjà dans le viewport (sous le voile) : on révèle directement,
    // sinon l'IO prend le relais au scroll
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.95 && r.bottom > 0) el.classList.add('on');
    else io.observe(el);
  });
}

// ---------- animation d'ouverture ----------
// jouée une fois par session ; l'enseigne s'allume, puis le voile se lève
const veil = document.getElementById('introVeil');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let introVue = false;
try { introVue = !!sessionStorage.getItem('casetta-intro'); } catch (e) { /* stockage indispo */ }
const skipIntro = !veil || reduceMotion || introVue ||
  new URLSearchParams(location.search).has('qa');

function endIntro() {
  if (veil) veil.classList.add('done');
  document.body.classList.remove('intro-lock');
  startReveals();
  // laisse finir les transitions décalées du hero avant de retirer les délais
  setTimeout(() => document.body.classList.remove('intro-cascade'), 1500);
}

if (skipIntro) {
  document.body.classList.remove('intro-cascade');
  endIntro();
} else {
  try { sessionStorage.setItem('casetta-intro', '1'); } catch (e) { /* stockage indispo */ }
  document.body.classList.add('intro-lock', 'intro-cascade');
  veil.classList.add('play');
  setTimeout(() => {
    veil.classList.add('lift');
    document.body.classList.remove('intro-lock');
    startReveals(); // le hero entre en cascade sous le voile qui se lève
    veil.addEventListener('animationend', e => {
      if (e.animationName === 'intro-lift') endIntro();
    });
    setTimeout(endIntro, 1400); // filet de sécurité
  }, 2100);
}
