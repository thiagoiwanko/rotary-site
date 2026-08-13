/* ===================================================================
   Rotary Club Porto União – União da Vitória
   Site estático data-driven: lê os JSON em assets/data/ e monta a página.
   Para atualizar conteúdo, edite os arquivos JSON — não é preciso mexer aqui.
   Idioma: pt (padrão) / en — ver LANG_KEY / assets/data/i18n.json.
   =================================================================== */

const ICONS = {
  peace: '<path d="M12 3v10M12 13l-5 6M12 13l5 6M7 19h10"/><circle cx="12" cy="8" r="1.2" fill="currentColor" stroke="none"/>',
  health: '<path d="M20.8 8.6c0 5-8.8 10-8.8 10S3.2 13.6 3.2 8.6a4.6 4.6 0 0 1 8.8-2 4.6 4.6 0 0 1 8.8 2z"/><path d="M8 12h2l1.5-3L13 15l1.5-3H16"/>',
  water: '<path d="M12 2s6 7 6 12a6 6 0 0 1-12 0c0-5 6-12 6-12z"/>',
  mother: '<circle cx="9" cy="7" r="2.5"/><path d="M4 20c0-3 2.5-5 5-5s5 2 5 5"/><circle cx="17" cy="9" r="1.8"/><path d="M14 20c0-2.2 1.5-3.8 3-3.8s3 1.6 3 3.8"/>',
  education: '<path d="M2 8l10-4 10 4-10 4-10-4z"/><path d="M6 10.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-5.5"/><path d="M22 8v6"/>',
  growth: '<path d="M4 19h16"/><path d="M4 15l5-5 4 4 7-8"/><path d="M15 6h5v5"/>',
  environment: '<path d="M12 3C7 3 4 7 4 11c0 5 4 9 8 10 4-1 8-5 8-10 0-4-3-8-8-8z"/><path d="M12 21V11"/><path d="M12 11c0-3 2-5 5-5"/>'
};

const LANG_KEY = 'rcpu-lang';
const LANG_META = {
  pt: { flag: '🇧🇷', code: 'PT-BR', htmlLang: 'pt-BR' },
  en: { flag: '🇺🇸', code: 'EN', htmlLang: 'en' }
};

let i18nDict = null;

function getLang() {
  const saved = localStorage.getItem(LANG_KEY);
  return saved === 'en' ? 'en' : 'pt';
}

function setLang(lang) {
  localStorage.setItem(LANG_KEY, lang);
}

function t(key, lang) {
  const dict = (i18nDict && i18nDict[lang]) || {};
  return dict[key] !== undefined ? dict[key] : key;
}

function newsTagLabel(fonte, lang) {
  const map = { ri: 'noticias.tab.ri', distrito: 'noticias.tab.distrito', clube: 'noticias.tab.clube' };
  return map[fonte] ? t(map[fonte], lang) : '';
}

function getField(obj, path) {
  return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : ''), obj);
}

function fmtDate(iso, lang) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  const mesesPt = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
  const mesesEn = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const meses = lang === 'en' ? mesesEn : mesesPt;
  return `${parseInt(d)} ${meses[parseInt(m)-1]} ${y}`;
}

async function loadJSON(path) {
  try {
    const res = await fetch(path, { cache: 'no-store' });
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  } catch (e) {
    console.warn('Não foi possível carregar', path, e);
    return null;
  }
}

// ---------------- i18n: textos estáticos da UI ----------------
function applyI18n(lang) {
  if (!i18nDict) return;
  document.documentElement.lang = (LANG_META[lang] || LANG_META.pt).htmlLang;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.getAttribute('data-i18n'), lang);
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.getAttribute('data-i18n-html'), lang);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.getAttribute('data-i18n-placeholder'), lang);
  });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria'), lang));
  });

  document.querySelectorAll('[data-lang-flag]').forEach(el => {
    el.textContent = (LANG_META[lang] || LANG_META.pt).flag;
  });
  document.querySelectorAll('[data-lang-code]').forEach(el => {
    el.textContent = (LANG_META[lang] || LANG_META.pt).code;
  });
  document.querySelectorAll('[data-lang-btn]').forEach(el => {
    el.setAttribute('aria-label', t('lang.aria', lang));
  });
}

// ---------------- Conteúdo dinâmico (site-data.json + news.json) ----------------
let currentNews = [];
let currentTab = 'clube';

function renderSiteData(siteData, lang) {
  if (!siteData) return;

  document.querySelectorAll('[data-field]').forEach(el => {
    const val = getField(siteData, el.getAttribute('data-field'));
    if (val) el.textContent = val;
  });

  const statsWrap = document.querySelector('[data-stats]');
  if (statsWrap && siteData.estatisticas) {
    statsWrap.innerHTML = siteData.estatisticas.map(s => `
      <div class="stat">
        <div class="stat-num">${s.numero}</div>
        <div class="stat-label">${s.rotulo}</div>
      </div>`).join('');
  }

  const focusCarousel = document.querySelector('[data-focus-carousel]');
  if (focusCarousel && siteData.areasDeFoco) {
    const cardHTML = a => `
      <div class="focus-card">
        <div class="focus-icon"><svg viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[a.icone] || ''}</svg></div>
        <h4>${a.titulo}</h4>
      </div>`;
    const once = siteData.areasDeFoco.map(cardHTML).join('');
    focusCarousel.innerHTML = once + once; // duplicado: a animação translada -50% e reinicia sem corte
  }

  const teamGrid = document.querySelector('[data-team-grid]');
  if (teamGrid && siteData.diretoria) {
    teamGrid.innerHTML = siteData.diretoria.map(m => {
      const initials = (m.nome && m.nome !== 'A definir')
        ? m.nome.split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()
        : '?';
      return `
      <div class="team-card stagger-item">
        <div class="team-avatar">${initials}</div>
        <h4>${m.nome}</h4>
        <div class="role">${m.cargo}</div>
      </div>`;
    }).join('');
  }

  const footerFocus = document.querySelector('[data-footer-focus]');
  if (footerFocus && siteData.areasDeFoco) {
    footerFocus.innerHTML = siteData.areasDeFoco.map(a => `
      <span title="${a.titulo}"><svg viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[a.icone] || ''}</svg></span>`).join('');
  }

  const wa = (siteData.contato || {}).whatsapp;
  if (wa) {
    const waMsgTxt = lang === 'en'
      ? `Hello! I'd like to talk to ${getField(siteData, 'clube.nome')}.`
      : `Olá! Gostaria de falar com o ${getField(siteData, 'clube.nome')}.`;
    const waMsg = encodeURIComponent(waMsgTxt);
    document.querySelectorAll('[data-whatsapp-link]').forEach(el => {
      el.href = `https://wa.me/${wa}?text=${waMsg}`;
    });
  }

  const boardWrap = document.querySelector('[data-primeira-diretoria]');
  if (boardWrap && siteData.primeiraDiretoria) {
    boardWrap.innerHTML = siteData.primeiraDiretoria.map(m => `
      <li><span class="role">${m.cargo}</span><span class="name">${m.nome}</span></li>`).join('');
  }
  const foundersWrap = document.querySelector('[data-fundadores]');
  if (foundersWrap && siteData.fundadores) {
    foundersWrap.textContent = siteData.fundadores.join(' · ');
  }

  const igUrl = (siteData.redesSociais || {}).instagram;
  const igAt = igUrl ? '@' + igUrl.replace(/\/+$/, '').split('/').pop() : '';

  const handleEl = document.querySelector('[data-insta-handle]');
  const handleText = document.querySelector('[data-insta-handle-text]');
  if (handleEl && handleText) {
    if (igUrl) {
      handleEl.href = igUrl;
      handleText.textContent = igAt;
    } else {
      handleText.textContent = t('instagram.seguirPadrao', lang);
      handleEl.href = '#';
    }
  }

  const instaItem = document.querySelector('[data-insta-item]');
  const instaLink = document.querySelector('[data-insta-link]');
  const instaLinkText = document.querySelector('[data-insta-link-text]');
  if (instaItem) {
    if (igUrl && instaLink && instaLinkText) {
      instaLink.href = igUrl;
      instaLinkText.textContent = igAt;
      instaItem.style.display = '';
    } else {
      instaItem.style.display = 'none';
    }
  }

  const beholdFeedId = (siteData.redesSociais || {}).beholdFeedId;
  const beholdWidget = document.querySelector('[data-behold-widget]');
  const beholdEmpty = document.querySelector('[data-behold-empty]');
  if (beholdFeedId) {
    beholdWidget?.setAttribute('feed-id', beholdFeedId);
    if (beholdWidget) beholdWidget.style.display = '';
    if (beholdEmpty) beholdEmpty.style.display = 'none';
  } else {
    if (beholdWidget) beholdWidget.style.display = 'none';
    if (beholdEmpty) beholdEmpty.style.display = '';
  }
}

function renderNews(lang) {
  const newsGrid = document.querySelector('[data-news-grid]');
  if (!newsGrid) return;
  const items = (currentNews || [])
    .filter(n => n.fonte === currentTab)
    .sort((a, b) => (a.data < b.data ? 1 : -1));

  if (!items.length) {
    newsGrid.innerHTML = `<p class="news-empty">${t('noticias.empty', lang).replace('{tag}', newsTagLabel(currentTab, lang))}</p>`;
    return;
  }

  newsGrid.innerHTML = items.map(n => `
    <article class="news-card">
      <div class="news-thumb">
        <span class="news-tag">${newsTagLabel(n.fonte, lang)}</span>
        ${n.imagem ? `<img src="${n.imagem}" alt="" style="width:100%;height:100%;object-fit:cover;">` :
        `<svg viewBox="0 0 24 24" stroke="white" stroke-width="1.6" fill="none"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 15l5-5 4 4 5-6 4 5"/><circle cx="8" cy="9" r="1.3" fill="white" stroke="none"/></svg>`}
      </div>
      <div class="news-body">
        <div class="news-date">${fmtDate(n.data, lang)}</div>
        <h4>${n.titulo}</h4>
        <p>${n.resumo || ''}</p>
        <a class="news-link" href="${n.url || '#'}" target="_blank" rel="noopener">${t('noticias.lerMais', lang)}
          <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
        </a>
      </div>
    </article>`).join('');
}

async function loadContent(lang) {
  const siteDataPath = lang === 'en' ? 'assets/data/site-data.en.json' : 'assets/data/site-data.json';
  const newsPath = lang === 'en' ? 'assets/data/news.en.json' : 'assets/data/news.json';

  let [siteData, news] = await Promise.all([loadJSON(siteDataPath), loadJSON(newsPath)]);

  // Fallback pro português caso os arquivos em inglês ainda não existam/tenham sido movidos
  if (!siteData && lang === 'en') siteData = await loadJSON('assets/data/site-data.json');
  if (!news && lang === 'en') news = await loadJSON('assets/data/news.json');

  renderSiteData(siteData, lang);
  currentNews = news || [];
  renderNews(lang);
  observeReveals();
}

async function setLanguage(lang) {
  setLang(lang);
  applyI18n(lang);
  await loadContent(lang);
}

async function init() {
  document.getElementById('year').textContent = new Date().getFullYear();

  i18nDict = await loadJSON('assets/data/i18n.json');

  const lang = getLang();
  applyI18n(lang);
  await loadContent(lang);

  document.querySelectorAll('.news-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.news-tab').forEach(el => el.classList.remove('active'));
      tab.classList.add('active');
      currentTab = tab.getAttribute('data-tab');
      renderNews(getLang());
    });
  });

  document.querySelectorAll('[data-lang-btn]').forEach(btn => {
    btn.addEventListener('click', () => {
      const next = getLang() === 'en' ? 'pt' : 'en';
      setLanguage(next);
    });
  });
}

// ---------------- Header scroll ----------------
const header = document.getElementById('siteHeader');
function onScroll() {
  if (window.scrollY > 40) header.classList.add('scrolled');
  else header.classList.remove('scrolled');
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ---------------- Mobile nav ----------------
const burger = document.getElementById('burgerBtn');
const mobileNav = document.getElementById('mobileNav');
const mobileNavClose = document.getElementById('mobileNavClose');
burger?.addEventListener('click', () => mobileNav.classList.add('open'));
mobileNavClose?.addEventListener('click', () => mobileNav.classList.remove('open'));
mobileNav?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileNav.classList.remove('open')));

// ---------------- Reveal on scroll ----------------
let revealObserver;
function observeReveals() {
  if (!revealObserver) {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
  }
  document.querySelectorAll('.reveal:not(.in), .reveal-stagger:not(.in)').forEach(el => revealObserver.observe(el));
}

// ---------------- Formulário de contato (mailto fallback) ----------------
document.getElementById('contactForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const f = e.target;
  const lang = getLang();
  const statusEl = f.querySelector('[data-form-status]');
  const submitBtn = f.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn ? submitBtn.textContent : '';

  if (statusEl) {
    statusEl.textContent = t('form.enviando', lang);
    statusEl.className = 'form-status pending';
  }
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = t('form.enviando', lang);
  }

  try {
    const res = await fetch(f.action, {
      method: 'POST',
      body: new FormData(f),
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      if (statusEl) {
        statusEl.textContent = t('form.sucesso', lang);
        statusEl.className = 'form-status success';
      }
      f.reset();
    } else {
      throw new Error('Formspree error');
    }
  } catch (err) {
    if (statusEl) {
      statusEl.textContent = t('form.erro', lang);
      statusEl.className = 'form-status error';
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  observeReveals();
  init();
});
