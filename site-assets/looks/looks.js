/* Neptune Showroom looks runtime. No dependencies.
   Looks.list, Looks.get(), Looks.set(id), Looks.mount(el, {label}) -> builds an accessible picker. Emits 'looks:change' on document. */
(function(){
  const LIST = [{"id": "classic", "name": "Meridian Bank", "tag": "Professional", "brand": "#0F2B46", "accent": "#B08A3E", "canvas": "#F6F7F9", "ink": "#0F2B46"}, {"id": "heritage", "name": "Cedar Trust", "tag": "Traditional", "brand": "#1F4D36", "accent": "#C29A3F", "canvas": "#FAF6EC", "ink": "#1B3A2B"}, {"id": "fintech", "name": "Orbit", "tag": "Modern fintech", "brand": "#4B3FE0", "accent": "#00C2A8", "canvas": "#F5F6FF", "ink": "#151B3B"}, {"id": "vibrant", "name": "Neptune Spark", "tag": "Young & vibrant", "brand": "#07315F", "accent": "#EB4E4D", "canvas": "#FAF9F5", "ink": "#07315F"}, {"id": "telco", "name": "Pulse", "tag": "Bold telecom", "brand": "#C8175D", "accent": "#FFB300", "canvas": "#FFF7F9", "ink": "#2A0F1E"}, {"id": "private", "name": "Obsidian Private", "tag": "Private banking", "brand": "#17140E", "accent": "#C7A24A", "canvas": "#F4F1EA", "ink": "#16130D"}];
  const KEY = 'nsr.look';
  const store = { get(){ try { return localStorage.getItem(KEY); } catch(e){ return null; } }, set(v){ try { localStorage.setItem(KEY, v); } catch(e){} } };
  const root = document.documentElement;
  function get(){ return root.dataset.look || LIST[0].id; }
  function set(id, silent){
    if(!LIST.some(l => l.id === id)) id = LIST[0].id;
    root.dataset.look = id; store.set(id);
    // Keep legacy inline overrides from older apps from masking the look.
    ['--brand','--on-brand','--accent','--p','--on-p','--side-bg','--side-ink'].forEach(p => root.style.removeProperty(p));
    if(!silent) document.dispatchEvent(new CustomEvent('looks:change', {detail:{id, look: LIST.find(l=>l.id===id)}}));
  }
  function initial(){ const q = new URLSearchParams(location.search).get('look'); return q || store.get() || LIST[0].id; }
  function mount(el, opts){
    opts = opts || {};
    el.setAttribute('role','radiogroup'); el.setAttribute('aria-label', opts.label || 'Look');
    el.classList.add('looks-picker');
    el.innerHTML = LIST.map(l => `<button type="button" role="radio" class="looks-chip" data-look-id="${l.id}" aria-checked="${l.id===get()}" title="${l.name} — ${l.tag}">
      <span class="looks-dot" style="--a:${l.brand};--b:${l.accent};--c:${l.canvas}"></span><span class="looks-name">${l.name}</span><small>${l.tag}</small></button>`).join('');
    el.addEventListener('click', e => { const b = e.target.closest('[data-look-id]'); if(b) set(b.dataset.lookId); });
    document.addEventListener('looks:change', () => el.querySelectorAll('[data-look-id]').forEach(b => b.setAttribute('aria-checked', b.dataset.lookId===get())));
  }
  set(initial(), true);
  window.Looks = { list: LIST, get, set, mount };
})();
