// Send, request, QR scan / my code, merchant pay.
import { st, t, add, ic, esc, money, moneyT, numT, countUp, qrSvg, confetti, fmtDate, fmtTime } from '../assets/core.js';
import { reg, hdr, scr, row, sectionHead, avatar, nm, go, tab, back, sheet, closeSheet, toast, pin, keypadHtml, bindKeypad, toMinor, amtDisplay, slideHtml, bindSlide, processing, showSuccess, successHtml, refNo, wait, $, $$, rerender } from './kit.js';
import { S, ME, CONTACTS, MERCH, person, merchant, addTxn, whoName } from './data.js';

add({
  s_title: 'Send money§Envoyer de l’argent§إرسال أموال', s_to: 'Name, phone or @handle§Nom, téléphone ou @pseudo§الاسم أو الهاتف أو المعرّف', s_fav: 'Favourites§Favoris§المفضّلة', s_all: 'All contacts§Tous les contacts§كل جهات الاتصال', s_new: 'Send to a new number§Envoyer à un nouveau numéro§إرسال إلى رقم جديد', s_bank: 'To a bank account§Vers un compte bancaire§إلى حساب مصرفي',
  s_m1: 'Wallet§Portefeuille§محفظة', s_m2: 'Bank§Banque§مصرف', s_m3: 'Phone§Téléphone§هاتف', onvega: 'On Vega§Sur Vega§على Vega',
  s_amt: 'How much?§Combien ?§كم المبلغ؟', s_bal: 'Balance {b}§Solde {b}§الرصيد {b}', s_exceed: 'More than your available balance§Dépasse votre solde disponible§يتجاوز رصيدك المتاح', s_review: 'Review§Vérifier§مراجعة', s_note: 'Add a note§Ajouter une note§أضف ملاحظة', n1: 'Dinner§Dîner§عشاء', n2: 'Rent§Loyer§إيجار', n3: 'Gift§Cadeau§هدية', n4: 'Thanks§Merci§شكراً',
  s_rev: 'Review & send§Vérifier et envoyer§راجع وأرسل', s_arrival: 'Arrival§Arrivée§الوصول', s_slide: 'Slide to send§Glissez pour envoyer§اسحب للإرسال', s_lim_after: 'Daily limit left after§Limite restante après§المتبقي من الحد بعد العملية', s_secure: 'Protected by PIN and device check§Protégé par PIN et contrôle d’appareil§محمي برمز PIN وفحص الجهاز', s_oneway: 'One-winner payment: this can only be processed once§Paiement unique : traité une seule fois§عملية فريدة: تُنفَّذ مرة واحدة فقط',
  s_done: 'Sent to {n}§Envoyé à {n}§تم الإرسال إلى {n}', s_done_s: 'Arrives instantly§Arrive instantanément§يصل فوراً',
  r_title: 'Request money§Demander de l’argent§طلب أموال', r_from: 'Request from§Demander à§اطلب من', r_send: 'Send request§Envoyer la demande§إرسال الطلب', r_link: 'Or share a payment link§Ou partagez un lien de paiement§أو شارك رابط دفع', r_done: 'Request sent§Demande envoyée§تم إرسال الطلب', r_done_s: '{n} gets a notification and can pay in one tap§{n} reçoit une notification et paie en un geste§يصل إشعار إلى {n} ويدفع بلمسة', r_pick: 'Choose who should pay you§Choisissez qui doit payer§اختر من سيدفع لك', r_for: 'What’s it for?§C’est pour quoi ?§ما سبب الطلب؟',
  q_title: 'Scan to pay§Scanner pour payer§امسح للدفع', q_hint: 'Point at a merchant or friend’s QR code§Visez un code QR§وجّه الكاميرا نحو رمز QR', q_scan: 'Scan§Scanner§مسح', q_mycode: 'My code§Mon code§رمزي', q_found: 'Found {n}§Trouvé : {n}§تم العثور على {n}', q_enter: 'Enter code§Saisir un code§أدخل الرمز', q_gallery: 'Gallery§Galerie§المعرض', q_torch: 'Torch§Lampe§المصباح',
  rc_title: 'Receive money§Recevoir de l’argent§استلام أموال', rc_scan: 'Anyone with Vega or a partner app can scan this§Toute personne avec Vega ou une app partenaire peut le scanner§يمكن لأي شخص يملك Vega أو تطبيقاً شريكاً مسحه', rc_set: 'Set an amount§Fixer un montant§حدد مبلغاً', rc_copy: 'Copy handle§Copier l’identifiant§نسخ المعرّف', rc_dl: 'Save image§Enregistrer l’image§حفظ الصورة',
  m_pay: 'Pay merchant§Payer le marchand§الدفع للتاجر', m_verified: 'Verified merchant§Marchand vérifié§تاجر موثّق', m_cb: '{p}% cashback§{p} % de remise§استرداد {p}٪', m_slide: 'Slide to pay§Glissez pour payer§اسحب للدفع', m_done: 'Paid {n}§Payé à {n}§تم الدفع إلى {n}', m_cbtxt: 'Cashback earned§Remise gagnée§استرداد مكتسب', m_dyn: 'Amount set by merchant§Montant fixé par le marchand§المبلغ محدد من التاجر', m_tip: 'Add a tip§Ajouter un pourboire§أضف إكرامية', m_pay_from: 'Paying from Main wallet§Paiement depuis le portefeuille principal§الدفع من المحفظة الرئيسية'
});

const PRESETS = ['n1', 'n2', 'n3', 'n4'];

/* ---------- send: pick contact ---------- */
reg('send', {
  render(p, el) {
    const q = (el._q || '').toLowerCase();
    const list = CONTACTS.filter(c => !q || (c.en + c.ar + c.ph).toLowerCase().includes(q));
    const favs = CONTACTS.filter(c => c.fav);
    return scr(`<label class="searchbar rise">${ic('search', 'sm')}<input class="sinp" type="search" placeholder="${t('s_to')}" value="${esc(el._q || '')}" aria-label="${t('search')}"></label>
      <div class="seg rise" role="tablist">${['s_m1', 's_m2', 's_m3'].map((k, i) => `<button role="tab" aria-selected="${i === 0}">${t(k)}</button>`).join('')}</div>
      ${q ? '' : `<section class="stack s8 rise"><div class="muted small b grp">${t('s_fav')}</div><div class="favrow">${favs.map(c => `<button class="fav" data-go="sendamt" data-p='{"c":"${c.id}"}'>${avatar(nm(c), +c.id.slice(1) - 1, 'big')}<span>${nm(c).split(' ')[0]}</span></button>`).join('')}</div></section>`}
      <section class="stack s8 rise"><div class="muted small b grp">${t('s_all')}</div><div class="list" data-sk>${list.map((c, i) => row({ lead: avatar(nm(c), i), title: esc(nm(c)), sub: `<span class="num">${c.ph}</span>`, end: `<span class="badge info">${t('onvega')}</span>`, go: 'sendamt', p: { c: c.id } })).join('')}
        ${row({ icon: 'phone', title: t('s_new'), go: 'sendamt', p: { c: 'new' } })}${row({ icon: 'accounts', title: t('s_bank'), go: 'sendamt', p: { c: 'c5' } })}</div></section>`, { head: hdr(t('s_title')) });
  },
  mount(el) { const i = $('.sinp', el); i?.addEventListener('input', () => { el._q = i.value; const pos = i.selectionStart; rerender(el); const n = $('.sinp', el); n.focus(); n.setSelectionRange(pos, pos); $$('.rise', el).forEach(x => { x.style.animation = 'none'; x.style.opacity = 1; }); }); }
});

/* ---------- send: amount ---------- */
const who = id => id === 'new' ? { en: 'New number', ar: 'رقم جديد', ph: '+000 9• ••• ••••' } : person(id);
const amtBlock = (hint = '') => `<div class="amt"><div class="amt-row"><span class="amt-v disp" data-amt>0</span><span class="amt-c disp">${st.cur}</span></div><div class="amt-hint small" data-hint>${hint}</div></div>`;
reg('sendamt', {
  skel: false,
  render({ c }) {
    const p = who(c);
    return scr(`<div class="rcp rise">${avatar(nm(p), +String(c).slice(1) - 1 || 0, 'big')}<div class="sp"><div class="b">${esc(nm(p))}</div><div class="small muted num">${p.ph}</div></div><span class="badge info">${t('onvega')}</span></div>
      ${amtBlock(t('s_bal', { b: money(S.balance) }))}
      <div class="chips" style="justify-content:center;flex-wrap:wrap;margin:0">${PRESETS.map(k => `<button class="chip" data-note="${k}">${t(k)}</button>`).join('')}</div>
      ${keypadHtml()}`, { head: hdr(t('s_amt')), foot: `<button class="btn block lg" id="rv" disabled>${t('s_review')}</button>`, cls: 'amtbody' });
  },
  mount(el, { c }) {
    let note = '';
    el.addEventListener('click', e => { const n = e.target.closest('[data-note]'); if (n) { note = note === t(n.dataset.note) ? '' : t(n.dataset.note); $$('[data-note]', el).forEach(b => b.setAttribute('aria-pressed', b === n && note !== '')); } });
    const pad = $('.amtpad', el), btn = $('#rv', el);
    let cur = '';
    bindKeypad(pad, s => {
      cur = s; const m = toMinor(s); $('[data-amt]', el).innerHTML = amtDisplay(s);
      const ex = m > S.balance - S.pending; btn.disabled = !m || ex;
      const h = $('[data-hint]', el); h.innerHTML = ex ? `<span style="color:var(--bad)">${t('s_exceed')}</span>` : t('s_bal', { b: money(S.balance) });
    });
    btn.addEventListener('click', () => go('sendrev', { c, amt: toMinor(cur), note }));
    el.dataset.cur = '';
  }
});

/* ---------- send: review ---------- */
reg('sendrev', {
  skel: false,
  render({ c, amt, note }) {
    const p = who(c);
    return scr(`<div class="rev-hero rise"><div class="muted small">${t('amount')}</div><div class="disp rev-amt">${money(amt)}</div></div>
      <div class="list rise"><div class="item kv">${avatar(nm(p), +String(c).slice(1) - 1 || 0)}<span class="sp"><span class="s">${t('to')}</span><span class="t">${esc(nm(p))}</span></span></div>
      <div class="item kv"><span class="muted">${t('from')}</span><span class="b">${t('wallet_main')}</span></div>
      <div class="item kv"><span class="muted">${t('fee')}</span><span class="b pos">${t('free')}</span></div>
      <div class="item kv"><span class="muted">${t('s_arrival')}</span><span class="b">${ic('success-check', 'sm')} ${t('instant')}</span></div>
      ${note ? `<div class="item kv"><span class="muted">${t('td_note')}</span><span class="b">${esc(note)}</span></div>` : ''}
      <div class="item kv"><span class="muted">${t('s_lim_after')}</span><span class="b">${money(2150000 - amt, { dec: 0 })}</span></div></div>
      <div class="note rise">${ic('lock', 'sm')}<span class="small">${t('s_oneway')}</span></div>`,
      { head: hdr(t('s_rev')), foot: slideHtml(t('s_slide'), 'send') + `<p class="tiny muted center">${t('s_secure')}</p>` });
  },
  mount(el, { c, amt, note }) {
    bindSlide(el, () => pin(async () => {
      await processing();
      const ref = refNo(); const p = who(c); const x = addTxn({ type: 'send', who: c === 'new' ? 'c5' : c, amt: -amt, note, ref });
      showSuccess({ title: t('s_done', { n: nm(p).split(' ')[0] }), amountMinor: amt, sub: t('s_done_s'), rows: [[t('to'), esc(nm(p))], [t('fee'), t('free')], [t('ref'), `<span class="mono">${ref}</span>`], [t('date'), `<span class="num">${fmtDate(new Date())} · ${fmtTime(new Date())}</span>`]],
        actions: `<button class="btn block lg" data-home>${t('go_home')}</button><button class="btn tonal block" data-go="txn" data-p='{"id":${x.id}}'>${ic('receipt', 'sm')} ${t('view_receipt')}</button>` });
    }));
  }
});

/* ---------- request ---------- */
reg('request', {
  skel: false,
  render(p, el) {
    const sel = (el._sel ||= ['c2']);
    return scr(`<div class="muted small b grp">${t('r_from')}</div>
      <div class="favrow rise">${CONTACTS.slice(0, 7).map((c, i) => `<button class="fav ${sel.includes(c.id) ? 'on' : ''}" data-sel="${c.id}">${avatar(nm(c), i, 'big')}<span>${nm(c).split(' ')[0]}</span><i class="tick">${ic('success-check', 'sm')}</i></button>`).join('')}</div>
      ${amtBlock(t('r_pick'))}
      <div class="chips" style="justify-content:center;flex-wrap:wrap;margin:0">${PRESETS.map(k => `<button class="chip" data-note="${k}">${t(k)}</button>`).join('')}</div>
      ${keypadHtml()}`, { head: hdr(t('r_title'), { right: `<button class="iconbtn" data-act="link" aria-label="${t('r_link')}">${ic('link')}</button>` }), foot: `<button class="btn block lg" id="rq" disabled>${t('r_send')}</button>`, cls: 'amtbody' });
  },
  mount(el) {
    let cur = '', note = '';
    const upd = () => { $('#rq', el).disabled = !toMinor(cur) || !el._sel.length; };
    el.addEventListener('click', e => {
      const s = e.target.closest('[data-sel]'); if (s) { const id = s.dataset.sel; el._sel = el._sel.includes(id) ? el._sel.filter(x => x !== id) : [...el._sel, id]; s.classList.toggle('on'); upd(); }
      const n = e.target.closest('[data-note]'); if (n) { note = t(n.dataset.note); $$('[data-note]', el).forEach(b => b.setAttribute('aria-pressed', b === n)); }
      if (e.target.closest('[data-act=link]')) linkSheet(toMinor(cur));
    });
    bindKeypad($('.amtpad', el), s => { cur = s; $('[data-amt]', el).innerHTML = amtDisplay(s); upd(); });
    $('#rq', el).addEventListener('click', async () => {
      const m = toMinor(cur), n = el._sel.map(id => nm(person(id)).split(' ')[0]).join(', ');
      await processing(t('proc'), 900);
      showSuccess({ title: t('r_done'), amountMinor: m, sub: t('r_done_s', { n }), rows: [[t('r_from'), esc(n)], [t('ref'), `<span class="mono">${refNo('RQ')}</span>`]], actions: `<button class="btn block lg" data-home>${t('go_home')}</button>` });
    });
  }
});
function linkSheet(m) {
  const ref = 'vega.pay/amira-h' + (m ? '/' + (m / 100) : '');
  sheet(`<h3 class="disp">${t('r_link')}</h3><div class="center qrbox">${qrSvg('link' + m, { size: 168 })}</div><div class="card flat row"><span class="mono sp trunc">${ref}</span><button class="iconbtn" data-copy="${ref}" aria-label="${t('copied')}">${ic('copy')}</button></div><button class="btn block" data-close>${ic('share', 'sm')} ${t('share')}</button>`);
}

/* ---------- my code / receive ---------- */
const myCode = (amt = 0) => `<div class="mycode rise"><div class="mc-top">${avatar(nm(ME), 0, 'big')}<div><div class="b">${esc(nm(ME))}</div><div class="small muted"><span class="ltr">${ME.handle}</span></div></div></div><div class="mc-qr" data-qr>${qrSvg('amira' + amt, { size: 212 })}<span class="mc-scan"></span></div><p class="small muted center">${t('rc_scan')}</p><div class="grid2"><button class="btn tonal sm" data-copy="${ME.handle}">${ic('copy', 'sm')} ${t('rc_copy')}</button><button class="btn tonal sm" data-act="dl">${ic('download', 'sm')} ${t('rc_dl')}</button></div></div>`;
reg('receive', {
  render() { return scr(myCode() + `<button class="btn outline block" data-act="amt">${ic('edit', 'sm')} ${t('rc_set')}</button>`, { head: hdr(t('rc_title'), { right: `<button class="iconbtn" data-act="shr" aria-label="${t('share')}">${ic('share')}</button>` }) }); },
  mount(el) { el.addEventListener('click', e => { const a = e.target.closest('[data-act]')?.dataset.act; if (a === 'dl' || a === 'shr') toast(t('saved_toast'), 'download'); if (a === 'amt') go('request'); }); }
});

/* ---------- scanner ---------- */
reg('scan', {
  skel: false,
  render(p, el) {
    const tabv = p.tab || 'scan';
    return `<div class="scanner ${tabv === 'code' ? 'mode-code' : ''}"><div class="cam" aria-hidden="true"><svg viewBox="0 0 390 846" preserveAspectRatio="xMidYMid slice"><defs><filter id="bl"><feGaussianBlur stdDeviation="14"/></filter></defs><rect width="390" height="846" fill="#10161d"/><g filter="url(#bl)"><rect x="-20" y="520" width="440" height="220" fill="#3a2b20"/><rect x="40" y="380" width="120" height="170" rx="20" fill="#7a5a3d"/><circle cx="300" cy="300" r="90" fill="#2c4a5e"/><rect x="220" y="470" width="160" height="90" rx="14" fill="#c9b79c"/><circle cx="90" cy="250" r="60" fill="#e9c46a" opacity=".6"/></g></svg></div>
      <div class="sc-top"><button class="iconbtn glass" data-back aria-label="${t('close')}">${ic('close')}</button><span class="b sc-t">${t('q_title')}</span><button class="iconbtn glass" data-act="torch" aria-label="${t('q_torch')}" aria-pressed="false">${ic('sun')}</button></div>
      <div class="vf-wrap"><div class="vf" data-vf><i class="c1"></i><i class="c2"></i><i class="c3"></i><i class="c4"></i><span class="beam"></span><div class="vf-qr">${qrSvg('zaytun', { size: 120, fg: '#fff' })}</div></div><p class="vf-hint" data-hint>${t('q_hint')}</p></div>
      <div class="codepane">${myCode()}</div>
      <div class="sc-bot"><div class="seg glassseg"><button aria-selected="${tabv !== 'code'}" data-tb="scan">${t('q_scan')}</button><button aria-selected="${tabv === 'code'}" data-tb="code">${t('q_mycode')}</button></div>
      <div class="row" style="justify-content:space-between"><button class="btn sm glassbtn" data-go="merchants">${ic("edit", "sm")} ${t("q_enter")}</button><button class="btn sm glassbtn" data-act="gal">${ic('camera', 'sm')} ${t('q_gallery')}</button></div></div></div>`;
  },
  mount(el, p) {
    const sc = $('.scanner', el); let found = false;
    const detect = async () => {
      if (found || !el.isConnected || sc.classList.contains('mode-code')) return; found = true;
      const vf = $('[data-vf]', el); vf.classList.add('hit'); $('[data-hint]', el).textContent = t('q_found', { n: nm(merchant('m1')) });
      await wait(900); if (el.isConnected && el.dataset.name === 'scan') go('merchantpay', { m: 'm1', amt: 1850 });
    };
    el.addEventListener('click', e => {
      const tb = e.target.closest('[data-tb]'); if (tb) { sc.classList.toggle('mode-code', tb.dataset.tb === 'code'); $$('[data-tb]', el).forEach(b => b.setAttribute('aria-selected', b === tb)); if (tb.dataset.tb === 'scan') { found = false; setTimeout(detect, 1800); } }
      if (e.target.closest('[data-vf]')) detect();
      const a = e.target.closest('[data-act]')?.dataset.act; if (a === 'torch') { const b = e.target.closest('[data-act]'); const on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', on); sc.classList.toggle('torch', on); }
      if (a === 'gal') detect(); if (a === 'dl') toast(t('saved_toast'), 'download');
    });
    if (!p.noauto) setTimeout(detect, 2600);
  }
});

/* ---------- merchant pay ---------- */
reg('merchantpay', {
  skel: false,
  render({ m, amt }) {
    const mm = merchant(m), dyn = amt != null, cb = Math.round((amt || 0) * mm.cb / 100);
    return scr(`<div class="mcard rise"><span class="lead big brand">${esc(nm(mm).split(' ').map(w => w[0]).join('').slice(0, 2))}</span><div class="sp"><div class="disp" style="font-size:20px">${esc(nm(mm))}</div><div class="small muted">${t('cat_' + mm.cat)}</div></div><span class="badge ok">${ic('security-shield', 'sm')} ${t('m_verified')}</span></div>
      <div class="rev-hero rise"><div class="muted small">${dyn ? t('m_dyn') : t('amount')}</div><div class="disp rev-amt">${money(amt || 0)}</div><span class="badge accent">${ic('star', 'sm')} ${t('m_cb', { p: mm.cb })}</span></div>
      <div class="list rise"><div class="item kv"><span class="muted">${t('amount')}</span><span class="b">${money(amt || 0)}</span></div><div class="item kv"><span class="muted">${t('fee')}</span><span class="b pos">${t('free')}</span></div><div class="item kv"><span class="muted">${t('m_cbtxt')}</span><span class="b pos">${money(cb, { sign: true })}</span></div><div class="item kv"><span class="muted b">${t('total')}</span><span class="b">${money(amt || 0)}</span></div></div>
      <p class="small muted center">${t('m_pay_from')}</p>`, { head: hdr(t('m_pay')), foot: slideHtml(t('m_slide'), 'qr-code') + `<p class="tiny muted center">${t('s_secure')}</p>` });
  },
  mount(el, { m, amt }) {
    const mm = merchant(m);
    bindSlide(el, () => pin(async () => {
      await processing();
      const ref = refNo(), cb = Math.round((amt || 0) * mm.cb / 100);
      const x = addTxn({ type: 'pay', who: m, amt: -amt, cat: mm.cat, ref });
      S.rewards.cashback += cb; S.balance += cb;
      const e = showSuccess({ title: t('m_done', { n: nm(mm) }), amountMinor: amt, sub: '', rows: [[t('to'), esc(nm(mm))], [t('m_cbtxt'), `<span class="pos">${money(cb, { sign: true })}</span>`], [t('ref'), `<span class="mono">${ref}</span>`]],
        actions: `<button class="btn block lg" data-home>${t('go_home')}</button><button class="btn tonal block" data-go="txn" data-p='{"id":${x.id}}'>${ic('receipt', 'sm')} ${t('view_receipt')}</button>` });
    }));
  }
});
