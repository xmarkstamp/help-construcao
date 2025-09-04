/* =========================
   Help Construção • main.js (v7)
   ========================= */
(() => {
  'use strict';

  /* ===== Config ===== */
  const PHONE = '5538998182986'; // número oficial Help Construção
  const WA_BASE = `https://wa.me/${PHONE}?text=`;

  /* ===== Utils ===== */
  const $  = (sel,root=document) => root.querySelector(sel);
  const $$ = (sel,root=document) => Array.from(root.querySelectorAll(sel));
  const openWA = (text) => {
    const url = WA_BASE + encodeURIComponent(text);
    try { window.open(url, '_blank', 'noopener'); }
    catch { location.href = url; }
  };
  const throttle = (fn, wait=120) => {
    let t = 0, timer = null, lastArgs;
    return (...args) => {
      const now = Date.now();
      lastArgs = args;
      const run = () => { t = Date.now(); fn(...lastArgs); };
      if (now - t >= wait) run();
      else { clearTimeout(timer); timer = setTimeout(run, wait - (now - t)); }
    };
  };

  /* ===== Ripple (efeito clique) ===== */
  function attachRipple(el){
    const cs = getComputedStyle(el);
    if (cs.position === 'static') el.style.position = 'relative';
    el.addEventListener('click', (e) => {
      const rect = el.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const r = document.createElement('span');
      r.className = 'ripple';
      r.style.width = r.style.height = `${size}px`;
      r.style.left = `${e.clientX - rect.left - size/2}px`;
      r.style.top  = `${e.clientY - rect.top - size/2}px`;
      el.appendChild(r);
      setTimeout(() => r.remove(), 650);
    });
  }

  /* ===== Smooth scroll com offset do header ===== */
  function scrollToId(id){
    const target = document.querySelector(id);
    if (!target) return;
    const header = $('.header');
    const headerH = header ? header.getBoundingClientRect().height : 0;
    const top = target.getBoundingClientRect().top + window.pageYOffset - headerH - 8;
    window.scrollTo({ top, behavior: 'smooth' });
  }

  /* ===== Menu ativo conforme seção visível ===== */
  function setupActiveMenu(){
    const links = $$('.menu a[href^="#"]');
    if (!links.length) return;

    const map = new Map();
    links.forEach(a => {
      const id = a.getAttribute('href');
      const sec = $(id);
      if (sec) map.set(sec, a);
    });

    const header = $('.header');
    const headerH = () => header ? header.getBoundingClientRect().height : 0;

    const io = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        const link = map.get(entry.target);
        if (!link) return;
        if (entry.isIntersecting){
          links.forEach(l=>l.classList.remove('active'));
          link.classList.add('active');
        }
      });
    }, { rootMargin: `-${headerH()+20}px 0px -55% 0px`, threshold: 0.2 });

    map.forEach((_, sec)=> io.observe(sec));
  }

  /* ===== Lightbox simples (galeria) ===== */
  function setupLightbox(){
    const imgs = $$('.gallery .shot img');
    if (!imgs.length) return;

    const wrap = document.createElement('div');
    wrap.className = 'img-modal';
    wrap.style.cssText = `
      position:fixed;inset:0;display:none;align-items:center;justify-content:center;
      background:rgba(0,0,0,.86);padding:20px;z-index:1000;
    `;
    const pic = document.createElement('img');
    pic.alt = 'Imagem ampliada';
    pic.style.cssText = 'max-width:95vw;max-height:90vh;border-radius:12px;box-shadow:0 18px 50px rgba(0,0,0,.4)';
    wrap.appendChild(pic);
    document.body.appendChild(wrap);

    const close = () => { wrap.style.display = 'none'; pic.removeAttribute('src'); };
    wrap.addEventListener('click', close);
    document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') close(); });

    imgs.forEach(img => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => {
        pic.src = img.currentSrc || img.src;
        wrap.style.display = 'flex';
      });
    });
  }

  /* ===== Menu hambúrguer (mobile) ===== */
  function setupHamburger(){
    const hamb = $('.hamb');
    const menuWrap = $('.menu-wrap');
    if (!hamb || !menuWrap) return;

    hamb.addEventListener('click', ()=>{
      const open = menuWrap.classList.toggle('open');
      hamb.classList.toggle('open', open);
      hamb.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    // fecha ao clicar em um link do menu
    $$('.menu a', menuWrap).forEach(a=>{
      a.addEventListener('click', ()=>{
        menuWrap.classList.remove('open');
        hamb.classList.remove('open');
        hamb.setAttribute('aria-expanded','false');
      });
    });
  }

  /* ===== Inicialização ===== */
  document.addEventListener('DOMContentLoaded', () => {
    // 1) Ripple em cards, imagens e depoimentos
    $$('.card, .shot, .t-card').forEach(attachRipple);

    // 2) Cards → WhatsApp (clique no card inteiro)
    const cardsWrap = $('.cards');
    if (cardsWrap){
      cardsWrap.addEventListener('click', (e) => {
        const card = e.target.closest('.card');
        if (!card || !cardsWrap.contains(card)) return;
        if (e.target.closest('a,button')) return; // não intercepta botões internos

        const service =
          card.getAttribute('data-service') ||
          card.querySelector('h3')?.textContent?.trim() ||
          'Serviço';

        const msg = `Olá, gostaria de fazer um orçamento de *${service}*.`;
        openWA(msg);
      });
    }

    // 2b) Botão CTA dentro de cada card
    $$('.card .card-cta').forEach((btn) => {
      btn.addEventListener('click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        const card = btn.closest('.card');
        const service =
          card?.getAttribute('data-service') ||
          card?.querySelector('h3')?.textContent?.trim() ||
          'Serviço';
        const msg = `Olá, gostaria de fazer um orçamento de *${service}*.`;
        openWA(msg);
      });
    });

    // 3) Form “Orçamento em Minutos” → WhatsApp
    const form = $('#formOrcamento');
    if (form){
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const fd   = new FormData(form);
        const nome = (fd.get('nome')||'').trim();
        const tel  = (fd.get('telefone')||'').trim();
        const serv = (fd.get('servico')||'Serviço').trim();
        const local= (fd.get('local')||'').trim();
        const msg  = (fd.get('mensagem')||'').trim();

        const text =
`Olá, gostaria de fazer um orçamento de *${serv}*.

Nome: ${nome || '(nome)'}
Telefone: ${tel || '(telefone)'}
Local: ${local || '(bairro/cidade)'}
Necessidade: ${msg || '(descreva)'}
`;
        openWA(text);
      });
    }

    // 4) Rolagem suave com offset do header
    $$('.menu a[href^="#"], a[href^="#servicos"], a[href^="#galeria"], a[href^="#sobre"], a[href^="#depoimentos"], a[href^="#orcamento"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        const target = id && document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        scrollToId(id);
      });
    });

    // 5) Destaque automático do menu conforme a seção
    setupActiveMenu();

    // 6) Lightbox na galeria
    setupLightbox();

    // 7) Menu mobile (hambúrguer)
    setupHamburger();

    // 8) Efeito no header ao rolar (opcional, combina com CSS)
    const header = $('.header');
    if (header){
      const onScroll = throttle(()=>{
        header.classList.toggle('is-scrolled', window.scrollY > 6);
      }, 120);
      onScroll();
      document.addEventListener('scroll', onScroll, { passive: true });
    }
  });
})();
