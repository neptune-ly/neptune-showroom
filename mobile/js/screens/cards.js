import { $, $$, S, L, t, T, tx, ic, icf, bal, num, cur, sheet, toast, confetti, haptic, esc, sleep, anim, runIn, donut, reduced, bmark } from '../util.js';
import { reg, go, back, tab, A, top } from '../app.js';
import { CARDS, accBy, TX, txName, uname, bankName, ACC } from '../data.js';
import { authorize, bioSheet } from './auth.js';
import { txRow } from './home.js';

L([
  ['Manage', 'Gérer', 'إدارة'],
  ['Cards', 'Cartes', 'البطاقات'], ['Everyday debit', 'Débit quotidien', 'بطاقة الخصم اليومية'], ['Freeze card', 'Bloquer la carte', 'تجميد البطاقة'], ['Unfreeze card', 'Débloquer la carte', 'إلغاء التجميد'], ['Frozen', 'Bloquée', 'مجمّدة'], ['Active', 'Active', 'نشطة'],
  ['Limits', 'Plafonds', 'الحدود'], ['Change PIN', 'Changer le code PIN', 'تغيير الرقم السري'], ['Details', 'Détails', 'التفاصيل'], ['Show details', 'Afficher les détails', 'إظهار التفاصيل'], ['Hide details', 'Masquer les détails', 'إخفاء التفاصيل'], ['Card number', 'Numéro de carte', 'رقم البطاقة'], ['Expiry', 'Expiration', 'الانتهاء'], ['CVV', 'CVV', 'رمز الأمان'],
  ['Controls', 'Contrôles', 'عناصر التحكم'], ['Online payments', 'Paiements en ligne', 'الدفع عبر الإنترنت'], ['Contactless', 'Sans contact', 'اللاتلامسي'], ['International use', 'Utilisation à l\'étranger', 'الاستخدام الدولي'], ['3-D Secure approvals', 'Validation 3-D Secure', 'موافقات \u20663-D Secure\u2069'], ['Ask me to approve online payments', 'Me demander de valider les paiements en ligne', 'اطلب موافقتي على المدفوعات عبر الإنترنت'],
  ['Phone wallets', 'Portefeuilles mobiles', 'محافظ الهاتف'], ['Added', 'Ajoutée', 'مضافة'], ['Add to wallet', 'Ajouter au portefeuille', 'إضافة إلى المحفظة'], ['Phone wallet', 'Portefeuille du téléphone', 'محفظة الهاتف'], ['Added to your phone wallet', 'Ajoutée au portefeuille du téléphone', 'أُضيفت إلى محفظة الهاتف'], ['Virtual card', 'Carte virtuelle', 'بطاقة افتراضية'], ['Virtual card created', 'Carte virtuelle créée', 'تم إنشاء البطاقة الافتراضية'], ['New virtual card', 'Nouvelle carte virtuelle', 'بطاقة افتراضية جديدة'], ['Instant, for online shopping', 'Instantanée, pour les achats en ligne', 'فورية، للتسوق عبر الإنترنت'],
  ['Report lost or stolen', 'Signaler perdue ou volée', 'الإبلاغ عن فقدان أو سرقة'], ['Replace card', 'Remplacer la carte', 'استبدال البطاقة'], ['Daily ATM withdrawal', 'Retrait DAB quotidien', 'السحب اليومي من الصراف'], ['Daily shop spending', 'Dépenses magasin / jour', 'الإنفاق اليومي في المتاجر'], ['Daily online spending', 'Dépenses en ligne / jour', 'الإنفاق اليومي عبر الإنترنت'], ['Save limits', 'Enregistrer les plafonds', 'حفظ الحدود'], ['Limits updated', 'Plafonds mis à jour', 'تم تحديث الحدود'],
  ['Enter new PIN', 'Saisissez le nouveau PIN', 'أدخل الرقم السري الجديد'], ['Confirm new PIN', 'Confirmez le nouveau PIN', 'أكّد الرقم السري الجديد'], ['PIN changed', 'PIN modifié', 'تم تغيير الرقم السري'], ['PINs do not match. Try again.', 'Les codes ne correspondent pas. Réessayez.', 'الرقمان غير متطابقين. حاول مجدداً.'], ['Choose 4 digits you can remember. Avoid birthdays.', 'Choisissez 4 chiffres. Évitez les dates de naissance.', 'اختر 4 أرقام تتذكرها وتجنب تواريخ الميلاد.'],
  ['Online payment request', 'Demande de paiement en ligne', 'طلب دفع عبر الإنترنت'], ['Approve this payment?', 'Approuver ce paiement ?', 'الموافقة على هذه الدفعة؟'], ['Deny', 'Refuser', 'رفض'], ['Approve', 'Approuver', 'موافقة'], ['Payment approved', 'Paiement approuvé', 'تمت الموافقة على الدفع'],
  ['Card limit', 'Plafond de la carte', 'حد البطاقة'], ['Used this cycle', 'Utilisé ce cycle', 'المستخدم هذه الدورة'], ['Credit limit', 'Limite de crédit', 'حد الائتمان'], ['Card activity', 'Activité de la carte', 'نشاط البطاقة'], ['Create card', 'Créer la carte', 'إنشاء البطاقة'], ['Card name', 'Nom de la carte', 'اسم البطاقة'], ['Spending cap', 'Plafond de dépenses', 'سقف الإنفاق'], ['Single-use number', 'Numéro à usage unique', 'رقم لمرة واحدة'], ['Hides your real card number from merchants', 'Cache votre vrai numéro aux commerçants', 'يخفي رقم بطاقتك الحقيقي عن التجار'],
  ['Valid thru', 'Valide jusqu\'à', 'صالحة حتى'], ['Card frozen. Purchases are paused.', 'Carte bloquée. Les achats sont suspendus.', 'تم تجميد البطاقة. المشتريات متوقفة.'], ['Card active again', 'Carte de nouveau active', 'البطاقة نشطة من جديد'], ['Tap to pay', 'Payer sans contact', 'الدفع بالتقريب'], ['Details', 'Détails', 'التفاصيل'], ['Card activity', 'Activité de la carte', 'نشاط البطاقة'],
]);

export const cardArt = (c) => {
  const fr = S.frozen[c.id];
  return `<div class="ccard st${c.style}${fr ? ' frozen' : ''}" data-id="${c.id}"><div class="ct"><div class="cb2">${bmark()}<b>${esc(bankName())}</b></div><span class="kind">${tx(c.kind)}</span></div><div class="chiprow"><i class="chip-ic"></i>${ic('contactless')}</div><div class="pan num">•••• •••• •••• ${c.no}</div><div class="cb"><div><small>${esc(uname().toUpperCase())}</small><small class="num">${t('Valid thru')} ${c.exp}</small></div><span class="rings"><i></i><i></i></span></div><div class="ice"><span>${ic('snow', 'xl')}<b>${t('Frozen')}</b></span></div></div>`;
};
const cardAct = (ico, label, act, on) => `<button data-act="${act}" class="${on ? 'on' : ''}"><i>${ic(ico)}</i><span>${label}</span></button>`;
reg('cards', () => {
  const order = S.cardOrder || (S.cardOrder = CARDS.map((_, i) => i));
  const c = CARDS[order[0]], fr = !!S.frozen[c.id];
  return {
    nav: 'cards', bar: false, skel: `<div style="padding-top:70px">${'<div class="skel-row"><div><span class="skel"></span><span class="skel"></span></div></div>'.repeat(4)}</div>`,
    body: `<div class="big-title">${t('Cards')}</div>
  <div class="cstack rv" id="cst">${order.map((i, p) => `<div class="cs" data-p="${p}" data-i="${i}" data-act="cstack">${cardArt(CARDS[i])}</div>`).join('')}</div>
  <div class="cname rv" style="--d:1" id="cnm"><b>${esc(tx(c.name))}</b><small>${tx(c.kind)} · <span class="num">•••• ${c.no}</span></small></div>
  <div class="cacts rv" style="--d:2" id="cac">${cardAct('snow', fr ? t('Unfreeze card') : t('Freeze card'), 'cfr', fr)}${cardAct('eye', t('Details'), 'cdet')}${cardAct('chart-pie', t('Limits'), 'clim')}${cardAct('key', t('Change PIN'), 'cpin')}</div>
  <section class="sec rv" style="--d:3"><h3>${t('Card activity')}</h3><div class="group">${TX.filter(x => x.via === 'card').slice(0, 4).map(txRow).join('')}</div></section>
  <section class="sec rv" style="--d:4"><h3>${t('Phone wallets')}</h3><div class="group">${tokRows()}</div></section>
  <div class="group rv" style="--d:5;margin-top:22px"><button class="row" data-go="vcard"><span class="tile acc">${ic('plus')}</span><div class="tx"><b>${t('New virtual card')}</b><small>${t('Instant, for online shopping')}</small></div>${icf('chevron-right', 'muted')}</button></div>`
  };
});
const front = () => CARDS[(S.cardOrder || [0])[0]];
function stackTo(i) {
  const order = S.cardOrder; while (order[0] !== i) order.push(order.shift());
  $$('#cst .cs').forEach(e => { e.dataset.p = order.indexOf(+e.dataset.i) });
  const c = front(); $('#cnm b').textContent = tx(c.name); $('#cnm small').innerHTML = `${tx(c.kind)} · <span class="num">•••• ${c.no}</span>`; syncFreeze(); haptic(10);
}
function syncFreeze() { const b = $('#cac [data-act=cfr]'); if (!b) return; const fr = !!S.frozen[front().id]; b.classList.toggle('on', fr); $('span', b).textContent = fr ? t('Unfreeze card') : t('Freeze card') }
A.cstack = b => { const i = +b.dataset.i; if (b.dataset.p === '0') go('card', { id: CARDS[i].id }); else stackTo(i) };
A.cfr = () => toggleFreeze(front().id, top());
A.cdet = () => go('card', { id: front().id });
A.clim = () => go('limits', { id: front().id });
A.cpin = () => go('cardpin');
A.homeSync = syncFreeze;
export function toggleFreeze(id, scope) {
  S.frozen[id] = !S.frozen[id]; haptic(S.frozen[id] ? 30 : 12); $$(`.ccard[data-id="${id}"]`).forEach(e => e.classList.toggle('frozen', !!S.frozen[id]));
  const lb = $('#fl', scope); if (lb) lb.textContent = S.frozen[id] ? t('Unfreeze card') : t('Freeze card'); const sw = $('#frz', scope); if (sw) sw.setAttribute('aria-checked', !!S.frozen[id]);
  const st = $('#cstat', scope); if (st) { st.className = 'badge ' + (S.frozen[id] ? 'warn' : 'ok'); st.textContent = S.frozen[id] ? t('Frozen') : t('Active') }
  $$(`.switch[data-act=homefreeze][data-id="${id}"]`).forEach(w => w.setAttribute('aria-checked', !!S.frozen[id])); syncFreeze();
  toast(S.frozen[id] ? t('Card frozen. Purchases are paused.') : t('Card active again'), S.frozen[id] ? 'snow' : 'success-check');
}
const tokRows = () => [['apple', t('Phone wallet')]].map(([k, n]) => `<div class="row"><span class="tile">${ic('phone')}</span><div class="tx"><b>${n}</b><small>${S.tok[k] ? t('Added') + ' · <span class="num">•••• 4821</span>' : t('Add to wallet')}</small></div><button class="switch" role="switch" data-act="tok" data-k="${k}" aria-checked="${!!S.tok[k]}" aria-label="${n}"></button></div>`).join('');
A.tok = async (b) => { const k = b.dataset.k; const on = b.getAttribute('aria-checked') !== 'true'; if (on) { b.classList.add('busy'); await sleep(700); b.classList.remove('busy'); toast(t('Added to your phone wallet'), 'security-shield') } S.tok[k] = on; b.setAttribute('aria-checked', on); const sm = b.parentElement.querySelector('small'); sm.innerHTML = on ? t('Added') + ' · <span class="num">•••• 4821</span>' : t('Add to wallet') };
const sw = (id, label, sub, on, ico) => `<div class="row"><span class="tile f2">${ic(ico)}</span><div class="tx"><b>${label}</b>${sub ? `<small>${sub}</small>` : ''}</div><button class="switch" role="switch" id="${id}" data-act="sw" aria-checked="${on}" aria-label="${label}"></button></div>`;
A.sw = b => { const on = b.getAttribute('aria-checked') !== 'true'; b.setAttribute('aria-checked', on); haptic(10); const id = b.id; if (id === 'frz') { const sc = top(); toggleFreeze(sc.dataset.p ? JSON.parse(sc.dataset.p).id : 'c1', sc); return } const map = { on1: 'online', on2: 'contactless', on3: 'intl', on4: 'threeDS' }; if (map[id]) S[map[id]] = on };

reg('card', ({ id }) => {
  const c = CARDS.find(x => x.id === id) || CARDS[0]; const acc = accBy(c.acc);
  return {
    title: tx(c.name), body: `<div class="cc-hero"><div class="tilt">${cardArt(c)}</div><div class="between" style="margin:14px 20px 0"><span id="cstat" class="badge ${S.frozen[c.id] ? 'warn' : 'ok'}">${S.frozen[c.id] ? t('Frozen') : t('Active')}</span><button class="link" id="rev">${ic('eye', 's')} ${t('Show details')}</button></div>
      <div class="reveal" id="rv" hidden><div><small>${t('Card number')}</small><b class="num">4821 7093 5512 ${c.no}</b></div><div><small>${t('Expiry')}</small><b class="num">${c.exp}</b></div><div><small>${t('CVV')}</small><b class="num">418</b></div></div></div>
    ${c.limit ? `<div class="card" style="margin:16px 16px 0"><div class="between"><small class="muted">${t('Used this cycle')}</small><small class="muted">${t('Credit limit')}</small></div><div class="between"><b class="num disp" style="font-size:22px">${num(c.used, 0)}</b><b class="num">${num(c.limit, 0)} ${cur('LYD')}</b></div><div class="meter"><i style="--p:${c.used / c.limit * 100}%"></i></div></div>` : ''}
    <section class="sec"><h3>${t('Controls')}</h3><div class="group">${sw('frz', t('Freeze card'), '', !!S.frozen[c.id], 'snow')}${sw('on1', t('Online payments'), '', S.online, 'globe')}${sw('on2', t('Contactless'), '', S.contactless, 'contactless')}${sw('on3', t('International use'), '', S.intl, 'location')}${sw('on4', t('3-D Secure approvals'), t('Ask me to approve online payments'), S.threeDS, 'otp')}</div></section>
    <section class="sec"><h3>${t('Manage')}</h3><div class="group"><button class="row" data-go="limits" data-p='{"id":"${c.id}"}'><span class="tile">${ic('chart-pie')}</span><div class="tx"><b>${t('Limits')}</b></div>${icf('chevron-right', 'muted')}</button><button class="row" data-go="cardpin"><span class="tile f2">${ic('key')}</span><div class="tx"><b>${t('Change PIN')}</b></div>${icf('chevron-right', 'muted')}</button><button class="row" data-act="tap"><span class="tile">${ic('tap-to-pay')}</span><div class="tx"><b>${t('Tap to pay')}</b></div>${icf('chevron-right', 'muted')}</button></div></section>
    <section class="sec"><h3>${t('Phone wallets')}</h3><div class="group">${tokRows()}</div></section>
    <div class="actions"><button class="btn tonal" data-act="repl">${ic('refresh')}${t('Replace card')}</button><button class="btn danger" data-act="lost">${ic('warning')}${t('Report lost or stolen')}</button></div>`,
    mount(el) {
      const hero = $('.tilt', el); hero.addEventListener('pointermove', e => { if (reduced()) return; const r = hero.getBoundingClientRect(); const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; hero.style.transform = `perspective(700px) rotateY(${x * 18}deg) rotateX(${-y * 14}deg)` }); hero.addEventListener('pointerleave', () => hero.style.transform = '');
      let t0; $('#rev', el).onclick = async function () { const r = $('#rv', el); if (r.hidden) { await new Promise(res => bioSheet(res, t('Show details'))); r.hidden = false; anim(r, [{ opacity: 0, transform: 'translateY(-8px)' }, { opacity: 1, transform: 'none' }], { duration: 420 }); this.innerHTML = `${ic('eye-off', 's')} ${t('Hide details')}`; t0 = setTimeout(() => { r.hidden = true; this.innerHTML = `${ic('eye', 's')} ${t('Show details')}` }, 12000) } else { r.hidden = true; clearTimeout(t0); this.innerHTML = `${ic('eye', 's')} ${t('Show details')}` } };
    }
  };
});
A.repl = () => toast(T('Replacement ordered', 'Remplacement demandé', 'تم طلب البطاقة البديلة'), 'card');
A.lost = () => sheet(`<div class="auth"><span class="tile bad" style="margin:0 auto">${ic('warning', 'l')}</span><h2>${t('Report lost or stolen')}</h2><p class="sub">${T('We will block the card immediately and issue a new one.', 'Nous bloquons la carte immédiatement et en émettons une nouvelle.', 'سنوقف البطاقة فوراً ونصدر بطاقة جديدة.')}</p><button class="btn danger" data-close="ok">${t('Report lost or stolen')}</button><button class="btn text" data-close="x" style="margin:6px auto 0;display:flex">${t('Cancel')}</button></div>`, { onClose: v => { if (v === 'ok') toast(T('Card blocked', 'Carte bloquée', 'تم إيقاف البطاقة'), 'lock') } });

reg('limits', () => {
  const rows = [['atm', 'Daily ATM withdrawal', 3000, 'atm'], ['pos', 'Daily shop spending', 15000, 'pos-terminal'], ['online', 'Daily online spending', 8000, 'globe']];
  return {
    title: t('Limits'), body: `<div class="form" style="padding-top:12px">${rows.map(r => `<div class="card lim" style="margin-bottom:12px"><div class="between"><span class="row" style="padding:0;min-height:0;width:auto;gap:10px"><span class="tile f2" style="width:36px;height:36px">${ic(r[3], 's')}</span><b>${t(r[1])}</b></span><b class="num disp" id="v_${r[0]}">${num(S.limits[r[0]], 0)}</b></div><input type="range" min="0" max="${r[2]}" step="50" value="${S.limits[r[0]]}" data-k="${r[0]}" style="--p:${S.limits[r[0]] / r[2] * 100}%"><div class="between"><small class="muted">0</small><small class="muted num">${num(r[2], 0)} ${cur('LYD')}</small></div></div>`).join('')}<button class="btn" id="sl">${t('Save limits')}</button></div>`,
    mount(el) { const nv = { ...S.limits }; $$('input[type=range]', el).forEach(r => r.oninput = () => { nv[r.dataset.k] = +r.value; $('#v_' + r.dataset.k, el).textContent = num(+r.value, 0); r.style.setProperty('--p', r.value / r.max * 100 + '%'); haptic(3) }); $('#sl', el).onclick = async () => { const ok = await authorize({ title: t('Limits'), rows: rows.map(r => [t(r[1]), `${num(nv[r[0]], 0)} ${cur('LYD')}`]), cta: t('Save limits') }); if (ok) { Object.assign(S.limits, nv); back(); setTimeout(() => toast(t('Limits updated')), 350) } } }
  };
});
reg('cardpin', () => ({
  title: t('Change PIN'), body: `<div class="pin" style="padding:24px"><h2 class="disp" id="ph" style="text-align:center">${t('Enter new PIN')}</h2><div class="dots" id="pd">${'<i></i>'.repeat(4)}</div><p class="hint" style="text-align:center">${t('Choose 4 digits you can remember. Avoid birthdays.')}</p><div class="keys">${[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, 'x'].map(k => k === '' ? '<span></span>' : k === 'x' ? `<button data-k="del">${icf('arrow-left')}</button>` : `<button data-k="${k}">${k}</button>`).join('')}</div></div>`,
  mount(el) {
    let v = '', first = '', busy = false; const dots = () => $$('#pd i', el).forEach((d, i) => d.classList.toggle('f', i < v.length));
    const restart = () => { first = ''; v = ''; busy = false; $('#ph', el).textContent = t('Enter new PIN'); $('#pd', el).classList.remove('bad'); dots() };
    el.addEventListener('click', e => {
      const b = e.target.closest('[data-k]'); if (!b || busy) return; const k = b.dataset.k; if (k === 'del') v = v.slice(0, -1); else if (v.length < 4) v += k; dots(); if (v.length < 4) return;
      busy = true;
      if (!first) { first = v; v = ''; setTimeout(() => { $('#ph', el).textContent = t('Confirm new PIN'); dots(); busy = false }, 250) }
      else if (v !== first) { haptic(40); $('#pd', el).classList.add('bad'); $('#ph', el).textContent = t('PINs do not match. Try again.'); setTimeout(restart, 1200) }
      else { $('#pd', el).classList.add('ok'); setTimeout(() => { back(); setTimeout(() => toast(t('PIN changed'), 'key'), 350) }, 500) }
    });
  }
}));
reg('vcard', () => ({
  title: t('New virtual card'), body: `<div class="cc-hero" style="padding-top:12px"><div class="tilt">${cardArt({ ...CARDS[2], id: 'vnew', no: '2750' })}</div></div><form class="form" style="margin-top:16px"><label class="field"><span>${t('Card name')}</span><input id="vn" value="${T('Streaming & apps', 'Streaming et applis', 'التطبيقات والبث')}"></label><label class="field"><span>${t('Spending cap')}</span><input class="num" dir="ltr" value="500"></label><div class="card flat row" style="padding:12px 16px"><span class="tile f3">${ic('lock')}</span><div class="tx"><b>${t('Single-use number')}</b><small>${t('Hides your real card number from merchants')}</small></div><button class="switch" type="button" role="switch" data-act="sw" aria-checked="false"></button></div><button class="btn" id="cv" type="button" style="margin-top:16px">${t('Create card')}</button></form>`,
  mount(el) { $('#cv', el).onclick = async () => { const n = $('#vn', el).value.trim() || t('Virtual card'), b = $('#cv', el); b.classList.add('busy'); await sleep(900); b.classList.remove('busy'); CARDS.push({ ...CARDS[2], id: 'v' + CARDS.length, name: [n, n, n], no: '2750', exp: '10/29' }); (S.cardOrder || (S.cardOrder = CARDS.slice(0, -1).map((_, i) => i))).unshift(CARDS.length - 1); back(); setTimeout(() => { toast(t('Virtual card created'), 'card') }, 400) } }
}));
