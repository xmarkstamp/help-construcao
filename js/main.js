// JS opcional — adicione scripts aqui.
/* ===== Clique com Ripple nos balões =====
   Aplica em cards, imagens (shot) e depoimentos */
function attachRipple(el){
  el.style.position = el.style.position || 'relative';
  el.addEventListener('click', (e)=>{
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${e.clientX - rect.left - size/2}px`;
    ripple.style.top  = `${e.clientY - rect.top  - size/2}px`;
    el.appendChild(ripple);
    setTimeout(()=> ripple.remove(), 650);
  });
}

document.querySelectorAll('.card, .shot, .t-card').forEach(attachRipple);

/* ===== Cards -> WhatsApp (mantém seu comportamento se já existe) ===== */
function goWA(service, extra=''){
  const phone = '5538998182986';
  const msg = `Olá, gostaria de fazer um orçamento de *${service}* ${extra}`.trim();
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
}
document.querySelectorAll('.card').forEach(card=>{
  const service = card.getAttribute('data-service') || card.querySelector('h3')?.textContent || 'Serviço';
  card.addEventListener('click', (e)=>{
    // Se clicou num link/botão já existente, deixa o default:
    if (e.target.closest('a,button')) return;
    goWA(service);
  });
  const btn = card.querySelector('.card-cta');
  if(btn){ btn.addEventListener('click', ev=>{ ev.preventDefault(); ev.stopPropagation(); goWA(service); }); }
});

/* ===== Formulário “Orçamento em Minutos” -> WhatsApp ===== */
const form = document.getElementById('formOrcamento');
if(form){
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const fd = new FormData(form);
    const nome = fd.get('nome')||'';
    const tel  = fd.get('telefone')||'';
    const serv = fd.get('servico')||'Serviço';
    const local= fd.get('local')||'';
    const msg  = fd.get('mensagem')||'';
    const text = `Olá, gostaria de fazer um orçamento de *${serv}*.`+
                 `\n\nNome: ${nome}\nTelefone: ${tel}\nLocal: ${local}\nNecessidade: ${msg}`;
    const url  = `https://wa.me/5538998182986?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  });
   // Ripple: não altera layout, só efeito visual no clique
function attachRipple(el){
  const style = getComputedStyle(el);
  if (style.position === 'static') el.style.position = 'relative';
  el.addEventListener('click', (e)=>{
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
    ripple.style.top  = (e.clientY - rect.top  - size/2) + 'px';
    el.appendChild(ripple);
    setTimeout(()=> ripple.remove(), 650);
  });
}
document.querySelectorAll('.card, .shot, .t-card').forEach(attachRipple);

}
