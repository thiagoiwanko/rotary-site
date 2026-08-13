/* ===================================================================
   Rotary Club Porto União – União da Vitória
   Site estático data-driven: lê os JSON em assets/data/ e monta a página.
   Para atualizar conteúdo, edite os arquivos JSON — não é preciso mexer aqui.
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

const NEWS_TAG_LABEL = { ri: 'Rotary International', distrito: 'Distrito 4740', clube: 'Nosso Clube' };

function getField(obj, path) {
  return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : ''), obj);
}

function fmtDate(iso) {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  const meses = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
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

function socialIcon(name) {
  const icons = {
    instagram: '<rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/>',
    facebook: '<path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H8v3h3v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1z"/>'
  };
  return icons[name] || '';
}

async function init() {
  document.getElementById('year').textContent = new Date().getFullYear();

  const [siteData, news] = await Promise.all([
    loadJSON('assets/data/site-data.json'),
    loadJSON('assets/data/news.json')
  ]);

  if (siteData) {
    document.querySelectorAll('[data-field]').forEach(el => {
      const val = getField(siteData, el.getAttribute('data-field'));
      if (val) el.textContent = val;
    });

    // Estatísticas do hero
    const statsWrap = document.querySelector('[data-stats]');
    if (statsWrap && siteData.estatisticas) {
      statsWrap.innerHTML = siteData.estatisticas.map(s => `
        <div class="stat">
          <div class="stat-num">${s.numero}</div>
          <div class="stat-label">${s.rotulo}</div>
        </div>`).join('');
    }

    // Áreas de foco — carrossel giratório contínuo (lista duplicada p/ loop sem emenda)
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

    // Diretoria
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

    // Redes sociais (topbar + card de contato)
    const rs = siteData.redesSociais || {};
    const socialLinks = [
      rs.instagram ? { name: 'instagram', url: rs.instagram } : null,
      rs.facebook ? { name: 'facebook', url: rs.facebook } : null
    ].filter(Boolean);

    const topbarSocial = document.querySelector('[data-social-topbar]');
    const cardSocial = document.querySelector('[data-social-card]');
    const socialHTML = socialLinks.map(s => `<a href="${s.url}" target="_blank" rel="noopener" aria-label="${s.name}"><svg viewBox="0 0 24 24" stroke-width="1.8">${socialIcon(s.name)}</svg></a>`).join('');
    if (topbarSocial) topbarSocial.innerHTML = socialHTML || '';
    if (cardSocial) cardSocial.innerHTML = socialHTML || '';

    // Rodapé — ícones das áreas de foco
    const footerFocus = document.querySelector('[data-footer-focus]');
    if (footerFocus && siteData.areasDeFoco) {
      footerFocus.innerHTML = siteData.areasDeFoco.map(a => `
        <span title="${a.titulo}"><svg viewBox="0 0 24 24" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[a.icone] || ''}</svg></span>`).join('');
    }

    // WhatsApp — botão flutuante + link no card de contato
    const wa = (siteData.contato || {}).whatsapp;
    if (wa) {
      const waMsg = encodeURIComponent(`Olá! Gostaria de falar com o ${getField(siteData, 'clube.nome')}.`);
      document.querySelectorAll('[data-whatsapp-link]').forEach(el => {
        el.href = `https://wa.me/${wa}?text=${waMsg}`;
      });
    }

    // Nossa História — primeira diretoria e sócios-fundadores
    const boardWrap = document.querySelector('[data-primeira-diretoria]');
    if (boardWrap && siteData.primeiraDiretoria) {
      boardWrap.innerHTML = siteData.primeiraDiretoria.map(m => `
        <li><span class="role">${m.cargo}</span><span class="name">${m.nome}</span></li>`).join('');
    }
    const foundersWrap = document.querySelector('[data-fundadores]');
    if (foundersWrap && siteData.fundadores) {
      foundersWrap.textContent = siteData.fundadores.join(' · ');
    }

    // Instagram — link "seguir" + widget do Behold (behold.so)
    const handleEl = document.querySelector('[data-insta-handle]');
    const handleText = document.querySelector('[data-insta-handle-text]');
    const igUrl = (siteData.redesSociais || {}).instagram;
    if (handleEl && handleText) {
      if (igUrl) {
        handleEl.href = igUrl;
        const at = igUrl.replace(/\/+$/, '').split('/').pop();
        handleText.textContent = '@' + at;
      } else {
        handleText.textContent = 'Siga o clube no Instagram';
        handleEl.href = '#';
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

  // ---------------- Notícias ----------------
  const newsGrid = document.querySelector('[data-news-grid]');
  let currentTab = 'clube';

  function renderNews() {
    if (!newsGrid) return;
    const items = (news || [])
      .filter(n => n.fonte === currentTab)
      .sort((a, b) => (a.data < b.data ? 1 : -1));

    if (!items.length) {
      newsGrid.innerHTML = `<p class="news-empty">Nenhuma notícia cadastrada em ${NEWS_TAG_LABEL[currentTab]} ainda. Edite assets/data/news.json para adicionar.</p>`;
      return;
    }

    newsGrid.innerHTML = items.map(n => `
      <article class="news-card">
        <div class="news-thumb">
          <span class="news-tag">${NEWS_TAG_LABEL[n.fonte] || ''}</span>
          ${n.imagem ? `<img src="${n.imagem}" alt="" style="width:100%;height:100%;object-fit:cover;">` :
          `<svg viewBox="0 0 24 24" stroke="white" stroke-width="1.6" fill="none"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 15l5-5 4 4 5-6 4 5"/><circle cx="8" cy="9" r="1.3" fill="white" stroke="none"/></svg>`}
        </div>
        <div class="news-body">
          <div class="news-date">${fmtDate(n.data)}</div>
          <h4>${n.titulo}</h4>
          <p>${n.resumo || ''}</p>
          <a class="news-link" href="${n.url || '#'}" target="_blank" rel="noopener">Ler mais
            <svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
          </a>
        </div>
      </article>`).join('');
  }

  document.querySelectorAll('.news-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.news-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentTab = tab.getAttribute('data-tab');
      renderNews();
    });
  });
  renderNews();

  // Reobserve reveal elements added dynamically
  observeReveals();
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
document.getElementById('contactForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const f = e.target;
  const nome = f.nome.value, email = f.email.value, msg = f.mensagem.value;
  const to = document.querySelector('[data-field="contato.email"]')?.textContent.trim() || '';
  const subject = encodeURIComponent(`Contato pelo site — ${nome}`);
  const body = encodeURIComponent(`${msg}\n\n— ${nome} (${email})`);
  window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
});

document.addEventListener('DOMContentLoaded', () => {
  observeReveals();
  init();
});
