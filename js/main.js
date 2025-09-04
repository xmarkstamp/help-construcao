/* =========================
   Help Construção • main.js
   ========================= */
(() => {
  'use strict';

  /* ===== Config ===== */
  const PHONE = '5538998182986'; // número oficial Help Construção
  const WA_BASE = `https://wa.me/${PHONE}?text=`;

  /* ===== Util ===== */
  const goWA = (text) => window.open(WA_BASE + encodeURIComponent(text), '_blank');

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

  /* ===== Inicialização ===== */
  document.addEventListener('DOMContentLoaded', () => {
    // 1) Ripple em cards, imagens e depoimentos
    document.querySelectorAll('.card, .shot, .t-card').forEach(attachRipple);

    // 2) Cards -> WhatsApp
    const cardsWrap = document.querySelector('.cards');
    if (cardsWrap){
      cardsWrap.addEventListener('click', (e) => {
        const card = e.target.closest('.card');
        if (!card || !cardsWrap.contains(card)) return;

        // Se clicou num botão/link interno, não intercepta
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
    document.querySelectorAll('.card .card-cta').forEach((btn) => {
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
    const form = document.getElementById('formOrcamento');
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
                     `\n\nNome: ${nome}\nTelefone: ${tel}\nLocal: ${local}\nNecessidade: ${msg}`;
        goWA(text);
      });
    }

    // 4) Rolagem suave para âncoras do menu
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (!id || id === '#') return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  });
})();
