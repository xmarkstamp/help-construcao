/* =========================
   Help Construção • main.js (v6)
   ========================= */
(() => {
  'use strict';

  /* ===== Config ===== */
  const PHONE = '5538998182986'; // número oficial Help Construção
  const WA_BASE = `https://wa.me/${PHONE}?text=`;

  /* ===== Utils ===== */
  const $ = (sel,root=document) => root.querySelector(sel);
  const $$ = (sel,root=document) => Array.from(root.querySelectorAll(sel));
  const goWA = (text) => {
    const url = WA_BASE + encodeURIComponent(text);
    try { window.open(url, '_blank', 'noopener'); }
    catch { location.href = url; }
  };
  const throttle = (fn, wait=100) => {
    let t=0, lastArgs=null;
    return function(...args){
      const now = Date.now();
      if (now - t >= wait){ t = now; fn.apply(this,args); }
      else { lastArgs = args; clearTimeout(throttle._id);
             throttle._id = setTimeout(()=>{ t = Date.now(); fn.apply(this,lastArgs); }, wait-(now-t)); }
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

  /* ===== Lightbox simples para galeria ===== */
  function setupLightbox(){
    const imgs = $$('.gallery .shot img');
    if (!imgs.length) return;
    const wrap = document.createElement('div');
    wrap.className = 'img-modal';
    wrap.style.cssText = `
      position:fixed;inset:0;display:none;align-items:center;justify-content:center;
      background:rgba(0,0,0,.85);padding:20px;z-index:1000;
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

    const IO = new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        const link = map.get(entry.target);
        if (!link) return;
        if (entry.isIntersecting){
          links.forEach(l=>l.classList.remove('active'));
          link.classList.add('active');
        }
      });
    }, { rootMargin: `-${headerH()+20}px 0px -60% 0px`, threshold: 0.2 });

    map.forEach((_, sec)=> IO.observe(sec));
  }

  /* ===== Menu mobile (opcional) =====
     Se você adicionar um botão .hamb no header, o script abaixo já funciona.
  */
  function setupHamburger(){
    const hamb = $('.hamb');
    const menuWrap = $('.menu-wrap');
    if (!hamb || !menuWrap) return;
    hamb.addEventListener('click', ()=>{
      const open = menuWrap.classList.toggle('open');
      hamb.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    // fecha ao clicar no link
    $$('.menu a', menuWrap).forEach(a=>{
      a.addEventListener('click', ()=>{ menuWrap.classList.remove('open'); hamb.setAttribute('aria-expanded','false'); });
    });
  }

  /* ===== Inicialização ===== */
  document.addEventListener('DOMContentLoaded', () => {
    // 1) Ripple em cards, imagens e depoimentos
    $$('.card, .shot, .t-card').forEach(attachRipple);

    // 2) Cards -> WhatsApp (clique no card inteiro)
    const cardsWrap = $('.cards');
    if (cardsWrap){
      cardsWrap.addEventListener('click', (e) => {
        const card = e.target.closest('.card');
        if (!card || !cardsWrap.contains(card)) return;
        // se clicou em um link/botão interno, não intercepta
        if (e.target.closest('a,button')) return;

        const service =
          card.getAttribute('data-service') ||
          card.querySelector('h3')?.textContent?.trim() ||
          'Serviço';

        const msg = `Olá, gostaria de fazer um orçamento de *${service}*.`;
        goWA(msg);
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
        goWA(msg);
      });
    });

    // 3) Form “Orçamento em Minutos” -> WhatsApp
    const form = $('#formOrcamento');
    if (form){
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(form);
        const nome = (fd.get('nome')||'').trim();
        const tel  = (fd.get('telefone')||'').trim();
        const serv = (fd.get('servico')||'Serviço').trim();
        const local= (fd.get('local')||'').trim();
        const msg  = (fd.get('mensagem')||'').trim();

        const text = `Olá, gostaria de fazer um orçamento de *${serv}*.`+
                     `\n\nNome: ${nome || '(nome)'}\nTelefone: ${tel || '(telefone)'}\nLocal: ${local || '(bairro/cidade)'}\nNecessidade: ${msg || '(descreva)'}\n`;
        goWA(text);
      });
    }

    // 4) Rolagem suave com offset do header
    $$('.menu a[href^="#"], a[href^="#servicos"], a[href^="#galeria"], a[href^="#sobre"], a[href^="#depoimentos"], a[href^="#orcamento"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (!id || id === '#') return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        scrollToId(id);
      });
    });

    // 5) Destaque automático do menu conforme a seção
    setupActiveMenu();

    // 6) Lightbox para galeria
    setupLightbox();

    // 7) Menu mobile (se existir .hamb)
    setupHamburger();

    // 8) Header sombra ao rolar (opcional, sem CSS extra)
    const header = $('.header');
    if (header){
      const onScroll = throttle(()=>{
        header.classList.toggle('is-scrolled', window.scrollY > 6);
      }, 100);
      onScroll();
      document.addEventListener('scroll', onScroll, { passive: true });
    }
  });
})();
