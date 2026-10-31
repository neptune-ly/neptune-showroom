// Vouchers shop shared by both telco apps: category chips, SVG brand tiles (fictional brands), amount picker, PIN confirm, ticket with code + copy.
// Routes (under the app's `vouchers` screen): '' = shop, b/<brand> = detail, mine = my vouchers, t/<id> = ticket.
import * as C from './core.js';
const { t, ic, esc, money, moneyT, go, toast, haptic, confetti, ago } = C;

const BRANDS = [
  { id: 'own', cat: 'mobile', amts: [500, 1000, 2000, 5000, 10000] },
  { id: 'nova', cat: 'mobile', c: ['#0C4A6E', '#0EA5E9'], amts: [500, 1000, 2000] },
  { id: 'strm', cat: 'stream', c: ['#0B5E55', '#19B79F'], amts: [1500, 3000, 6000] },
  { id: 'pxl', cat: 'gaming', c: ['#7C2D12', '#F97316'], amts: [1000, 2500, 5000, 10000] },
  { id: 'mrkt', cat: 'shop', c: ['#9F1239', '#FB7185'], amts: [2000, 5000, 10000] },
  { id: 'zyt', cat: 'food', c: ['#3F6212', '#84CC16'], amts: [1500, 3000, 5000] },
  { id: 'wasl', cat: 'rides', c: ['#1E293B', '#64748B'], amts: [1000, 2000, 5000] },
  { id: 'ilmo', cat: 'learn', c: ['#92400E', '#F59E0B'], amts: [2500, 5000, 10000] },
  { id: 'giftly', cat: 'shop', c: ['#831843', '#F472B6'], amts: [2000, 5000, 10000, 20000] },
];
const CATS = ['all', 'mobile', 'stream', 'gaming', 'shop', 'food', 'rides', 'learn'];
const GLYPH = {
  nova: '<g fill="#fff"><rect x="28" y="56" width="10" height="16" rx="3"/><rect x="43" y="46" width="10" height="26" rx="3"/><rect x="58" y="36" width="10" height="36" rx="3"/><rect x="73" y="26" width="10" height="46" rx="3" opacity=".55"/></g>',
  strm: '<circle cx="50" cy="50" r="27" fill="none" stroke="#fff" stroke-width="5" opacity=".5"/><path d="M42 36 66 50 42 64Z" fill="#fff" stroke="#fff" stroke-width="8" stroke-linejoin="round"/>',
  pxl: '<g fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><rect x="24" y="36" width="52" height="30" rx="15"/><path d="M38 44v14M31 51h14"/></g><circle cx="60" cy="47" r="3.5" fill="#fff"/><circle cx="67" cy="55" r="3.5" fill="#fff"/>',
  mrkt: '<g fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><path d="M30 40H70L66 70H34Z"/><path d="M40 40V34a10 10 0 0 1 20 0V40"/></g>',
  zyt: '<path d="M30 68C26 42 46 26 72 28C74 54 58 72 30 68Z" fill="#fff"/><path d="M36 62 58 40" stroke="currentColor" stroke-width="4" stroke-linecap="round" opacity=".35"/>',
  wasl: '<path d="M50 76C37 62 31 53 31 44a19 19 0 0 1 38 0c0 9-6 18-19 32Z" fill="none" stroke="#fff" stroke-width="6" stroke-linejoin="round"/><circle cx="50" cy="44" r="6.5" fill="#fff"/>',
  ilmo: '<g fill="none" stroke="#fff" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"><path d="M24 36Q38 30 50 38Q62 30 76 36V68Q62 62 50 70Q38 62 24 68Z"/><path d="M50 38V70"/></g>',
  giftly: '<g fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"><rect x="28" y="46" width="44" height="26" rx="5"/><rect x="24" y="37" width="52" height="11" rx="4"/><path d="M50 37v35M50 37c-4-10-14-10-14-4s9 4 14 4Zm0 0c4-10 14-10 14-4s-9 4-14 4Z"/></g>',
};
export const brand = id => BRANDS.find(b => b.id === id);

function install(h) {
  const { S, store, page, pinSheet, tag, hero, tab = 'vouchers' } = h;
  const bname = b => b.id === 'own' ? t('vch.own', { op: C.loc(h.op.short) }) : t('vch.b.' + b.id);
  const colors = b => b.id === 'own' ? h.own : b.c;
  /** brand tile: gradient + tide rings + glyph; scales with its box (CSS sets size). */
  /* the gradient and rings fill the box; the glyph keeps its proportions, so wide tiles do not blow it up */
  const tile = (b, cls = '') => {
    const [c1, c2] = colors(b);
    const g = b.id === 'own' ? `<g transform="translate(26 26) scale(.75)">${h.mark64()}</g>` : `<g style="color:${c1}">${GLYPH[b.id]}</g>`;
    return `<span class="btile ${cls}" style="background:linear-gradient(135deg,${c1},${c2})"><svg viewBox="0 0 100 100" preserveAspectRatio="xMaxYMin slice" aria-hidden="true"><g fill="none" stroke="#fff" stroke-opacity=".14" stroke-width="1.2"><circle cx="94" cy="6" r="22"/><circle cx="94" cy="6" r="38"/><circle cx="94" cy="6" r="54"/><circle cx="94" cy="6" r="70"/></g></svg><svg viewBox="0 0 100 100" aria-hidden="true">${g}</svg></span>`;
  };
  const mine = () => (S().vouchers || []).filter(v => v && typeof v.id === 'string' && brand(v.b) && typeof v.code === 'string' && Number.isFinite(v.amt) && Number.isFinite(v.ts));
  const who = g => esc(C.DICT[g.n] ? t(g.n) : '');
  const code = () => { const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; return [0, 1, 2].map(() => Array.from({ length: 4 }, () => A[Math.floor(Math.random() * A.length)]).join('')).join('-'); };
  let UI = { cat: 'all', amt: null, gift: null };

  function screen(a, ctx) {
    if (a[0] === 'b' && brand(a[1])) return detail(brand(a[1]), ctx);
    if (a[0] === 'mine') return myList(ctx);
    if (a[0] === 't') return ticket(a[1], ctx);
    return shop(ctx);
  }

  function shop(ctx) {
    const list = BRANDS.filter(b => UI.cat === 'all' || b.cat === UI.cat), n = mine().length, feat = BRANDS.filter(b => ['strm', 'pxl', 'giftly'].includes(b.id));
    page(`<div class="hero compact">${hero()}<div class="rings"></div>
        <div class="hrow" style="margin-top:6px"><h1 class="disp" style="font-size:32px;letter-spacing:-.02em;flex:1">${t('vch.h')}</h1><a class="gchip" href="#/vouchers/mine" style="min-height:48px">${ic('gift', 'sm')} ${t('vch.mine')}${n ? ` <b class="num">${n}</b>` : ''}</a></div>
        <p style="margin-top:6px;opacity:.9;max-width:300px">${t('vch.sub')}</p>
        <div class="gchip" style="margin-top:14px">${ic('wallet', 'sm')} ${t('vch.bal')} <b>${moneyT(S().bal)}</b></div></div>
      <div class="sheetbody" style="padding-bottom:12px">
        <div class="chips" role="group" aria-label="${t('vch.cats')}" style="padding-top:18px">${CATS.map(c => `<button class="chip" data-cat="${c}" aria-pressed="${UI.cat === c}">${t('vch.c.' + c)}</button>`).join('')}</div>
        ${UI.cat === 'all' ? `<div class="sec-h" style="padding:20px 18px 10px">${t('vch.feat')}</div><div class="hscroll">${feat.map(b => `<a href="#/vouchers/b/${b.id}" class="vfeat" aria-label="${esc(bname(b))}">${tile(b)}<span class="vf-t"><b>${esc(bname(b))}</b><small>${t('vch.from', { a: moneyT(b.amts[0], true) })}</small></span></a>`).join('')}</div>` : ''}
        <div class="sec-h" style="padding:${UI.cat === 'all' ? 10 : 20}px 18px 10px">${t('vch.all')}</div>
        <div class="vgrid">${list.map(b => `<a href="#/vouchers/b/${b.id}" class="vcard2">${tile(b)}<span><b>${esc(bname(b))}</b><small>${t('vch.c.' + b.cat)} · ${t('vch.from', { a: moneyT(b.amts[0], true) })}</small></span></a>`).join('')}</div>
      </div>`, { tab, ctx });
    C.$$('[data-cat]').forEach(b => b.addEventListener('click', () => { UI.cat = b.dataset.cat; shop({ back: false }); }));
  }

  function detail(b, ctx) {
    const amts = b.amts; if (!UI.amt || !amts.includes(UI.amt) || UI.b !== b.id) { UI.amt = amts[1] ?? amts[0]; UI.b = b.id; }
    const [c1, c2] = colors(b);
    page(`<div class="hero compact vdet" style="background:linear-gradient(160deg,${c1},${c2});--hero-glow:radial-gradient(90% 60% at 10% 110%,rgba(255,255,255,.28),transparent 60%)">
        <div class="rings"></div><div class="hrow"><button class="iconbtn glass" data-back aria-label="${t('c.back')}">${ic('arrow-left', 'flip')}</button><span class="sp"></span><span class="gchip">${t('vch.c.' + b.cat)}</span></div>
        <div style="display:flex;align-items:center;gap:16px;margin-top:14px">${tile(b, 'sq')}<div><h1 class="disp" style="font-size:30px;line-height:1.05;letter-spacing:-.02em">${esc(bname(b))}</h1><p style="opacity:.9;margin-top:4px">${t('vch.inst')}</p></div></div></div>
      <div class="sheetbody"><div class="sec" style="gap:16px;padding-top:20px">
        <div class="sec-h">${t('vch.pick')}</div>
        <div class="amts" role="radiogroup" aria-label="${t('vch.pick')}">${amts.map(v => `<button class="chip" role="radio" aria-checked="${v === UI.amt}" data-a="${v}"><span class="num">${v / 100}</span><small style="font:600 11px var(--font);opacity:.75">${C.cur()}</small></button>`).join('')}</div>
        <div class="list"><div class="item"><div class="s">${t('vch.val')}</div><div class="end" id="vv">${money(UI.amt, { short: true })}</div></div><div class="item"><div class="s">${t('p.fee')}</div><div class="end">${t('p.none')}</div></div><div class="item"><div class="t">${t('p.total')}</div><div class="end" style="font-size:18px" id="vt">${money(UI.amt, { short: true })}</div></div></div>
        <div id="vlow" class="pocket" style="background:var(--err-c);color:var(--err);display:none;gap:10px;align-items:center">${ic('warning')}<b>${t('p.low')}</b></div>
        <div class="list"><div class="item"><span class="lead f3">${ic('gift')}</span><div style="flex:1;min-width:0"><div class="t">${t('vch.gift')}</div><div class="s">${t('vch.gift_s')}</div></div><button class="switch" id="gsw" role="switch" aria-checked="false" aria-label="${t('vch.gift')}"></button></div>
          <div id="gbox" class="gbox" hidden><div class="eyebrow muted">${t('vch.gift_to')}</div><div class="gcs" role="radiogroup" aria-label="${t('vch.gift_to')}">${h.contacts.map((c, i) => `<button class="gc" role="radio" aria-checked="${i === 0}" data-gc="${c.id}"><span class="av f${(c.id % 3) + 1}">${esc(t(c.n)[0])}</span><span>${esc(t(c.n).split(' ')[0])}</span></button>`).join('')}</div>
            <div class="field"><label for="gmsg">${t('vch.gift_msg')}</label><input id="gmsg" class="input" dir="auto" maxlength="80" autocomplete="off" placeholder="${t('vch.gift_ph')}"></div></div></div>
        <div class="card flat"><div class="eyebrow muted" style="margin-bottom:8px">${t('vch.how')}</div><ol style="margin:0;padding-inline-start:20px;display:grid;gap:6px" class="sm"><li>${t('vch.s1')}</li><li>${t('vch.s2', { b: esc(bname(b)) })}</li><li>${t('vch.s3')}</li></ol></div>
        <button class="btn block" id="vbuy">${ic('lock')} <span id="vbl"></span></button></div></div>`, { ctx });
    const upd = () => { const low = UI.amt > S().bal; C.$('#vv').innerHTML = C.$('#vt').innerHTML = money(UI.amt, { short: true }); C.$('#vbl').textContent = t('vch.buy', { a: moneyT(UI.amt, true) }); C.$('#vlow').style.display = low ? 'flex' : 'none'; C.$('#vbuy').disabled = low; C.$$('[data-a]').forEach(x => { x.setAttribute('aria-checked', +x.dataset.a === UI.amt); }); };
    C.$$('[data-a]').forEach(x => x.addEventListener('click', () => { UI.amt = +x.dataset.a; haptic(8); upd(); }));
    upd();
    let gc = h.contacts[0].id;
    C.$('#gsw').addEventListener('click', e => { const on = e.currentTarget.getAttribute('aria-checked') !== 'true'; e.currentTarget.setAttribute('aria-checked', on); C.$('#gbox').hidden = !on; haptic(8); });
    C.$$('[data-gc]').forEach(x => x.addEventListener('click', () => { gc = +x.dataset.gc; C.$$('[data-gc]').forEach(y => y.setAttribute('aria-checked', y === x)); haptic(8); }));
    C.$('#vbuy').addEventListener('click', () => pinSheet(() => {
      const on = C.$('#gsw').getAttribute('aria-checked') === 'true', c = h.contacts.find(x => x.id === gc);
      const v = { id: C.uid(), b: b.id, amt: UI.amt, code: code(), ts: Date.now(), exp: Date.now() + 365 * 864e5, gift: on ? { n: c.n, num: c.num, msg: C.$('#gmsg').value.trim().slice(0, 80) } : null };
      store.set(s => { s.bal -= v.amt; (s.vouchers = s.vouchers || []).unshift(v); s.tx.unshift({ id: C.uid(), k: 'voucher', n: 'vch.b.' + (b.id === 'own' ? 'own' : b.id), amt: -v.amt, ts: v.ts }); if (s.points != null) s.points += Math.max(1, Math.floor(v.amt / 500)); });
      haptic([20, 30, 50]); C.reset('home', 'vouchers', 'vouchers/t/' + v.id);
    }));
  }

  function ticket(id, ctx) {
    const v = mine().find(x => x.id === id); if (!v) return C.replace('vouchers');
    const b = brand(v.b);
    page(`<div class="hero compact" style="padding-bottom:70px">${hero()}<div class="rings"></div><div class="hrow" style="margin-top:6px;justify-content:center;flex-direction:column;gap:10px;text-align:center"><span class="okmark anim-pop" style="width:76px;height:76px;box-shadow:0 0 0 9px rgba(255,255,255,.18),0 14px 30px -10px rgba(0,0,0,.5)">${ic('success-check', 'lg')}</span><h1 class="disp" style="font-size:28px;letter-spacing:-.02em">${t(v.gift ? 'vch.gift_done' : 'vch.done')}</h1>${v.gift ? `<p style="opacity:.9">${t('vch.gift_sent', { name: who(v.gift) })}</p>` : ''}</div></div>
      <div class="sheetbody" style="background:transparent;margin-top:-52px"><div class="sec" style="gap:16px">
        <div class="ticket anim-pop">
          <div class="ticket-top">${tile(b, 'sq big')}<div><div style="font:800 19px var(--display)">${esc(bname(b))}</div><div class="big-num" style="font-size:38px;margin-top:4px">${money(v.amt, { short: true })}</div></div></div>
          <div class="ticket-cut"></div>
          <div class="ticket-bot"><div class="eyebrow muted">${t('vch.code')}</div><div class="code" id="vcode">${esc(v.code)}</div>
            <button class="btn tonal sm" data-copy="${esc(v.code)}">${ic('copy', 'sm')} ${t('vch.copy')}</button>
            <p class="tiny muted">${t('vch.valid', { d: C.fdate(v.exp, { long: true }) })}</p></div></div>
        ${v.gift && typeof v.gift.msg === 'string' && v.gift.msg ? `<div class="card flat gmsg">${ic('sms', 'sm')}<p dir="auto">“${esc(v.gift.msg)}”</p></div>` : ''}
        <button class="btn block" data-back="vouchers">${t('p.done')}</button>
        <a class="btn text" href="#/vouchers/mine" style="align-self:center">${t('vch.mine')}</a></div></div>`, { ctx });
    C.$('[data-copy]').addEventListener('click', e => C.copyText(e.currentTarget.dataset.copy, t('c.copied')));
    confetti(C.appEl(), 40, .6);
  }

  function myList(ctx) {
    const list = mine();
    page(`<div class="topbar"><button class="iconbtn" data-back="vouchers" aria-label="${t('c.back')}">${ic('arrow-left', 'flip')}</button><h2>${t('vch.mine')}</h2></div>
      <div class="sec">${list.length ? `<div class="list">${list.map(v => { const b = brand(v.b); return `<a class="item" href="#/vouchers/t/${esc(v.id)}" style="min-height:76px">${tile(b, 'sq sm')}<div style="min-width:0"><div class="t">${esc(bname(b))}</div><div class="s">${v.gift ? t('vch.gifted', { name: who(v.gift) }) : `${ago(v.ts)} · <span class="num">${esc(v.code.slice(0, 4))}-••••-••••</span>`}</div></div><div class="end">${money(v.amt, { short: true })}</div></a>`; }).join('')}</div>`
        : `<div class="pocket" style="text-align:center;padding:36px 20px"><span class="gly" style="margin:0 auto 12px;width:64px;height:64px">${ic('gift', 'lg')}</span><b>${t('vch.none')}</b><p class="muted sm" style="margin-top:4px">${t('vch.none_s')}</p><a class="btn sm" href="#/vouchers" style="margin-top:16px">${t('vch.shop')}</a></div>`}</div>`, { ctx });
  }
  return { screen };
}
export { install };

C.add({
  'tx.voucher': ['Voucher: {n}', 'قسيمة: {n}', 'Bon : {n}'],
  'vch.h': ['Vouchers', 'القسائم', 'Bons'], 'vch.sub': ['Top up, stream, play and shop. The code arrives instantly.', 'اشحن وشاهد والعب وتسوّق. يصلك الرمز فوراً.', 'Rechargez, regardez, jouez et achetez. Le code arrive aussitôt.'],
  'vch.mine': ['My vouchers', 'قسائمي', 'Mes bons'], 'vch.bal': ['Wallet', 'المحفظة', 'Portefeuille'], 'vch.cats': ['Categories', 'الفئات', 'Catégories'], 'vch.feat': ['Popular now', 'الأكثر طلباً', 'Populaires'], 'vch.all': ['All vouchers', 'كل القسائم', 'Tous les bons'],
  'vch.from': ['from {a}', 'من {a}', 'dès {a}'], 'vch.own': ['{op} credit', 'رصيد {op}', 'Crédit {op}'], 'vch.inst': ['Instant digital code', 'رمز رقمي فوري', 'Code numérique instantané'],
  'vch.pick': ['Choose an amount', 'اختر المبلغ', 'Choisissez un montant'], 'vch.val': ['Voucher value', 'قيمة القسيمة', 'Valeur du bon'], 'vch.buy': ['Buy for {a}', 'اشترِ بـ {a}', 'Acheter pour {a}'],
  'vch.how': ['How to redeem', 'طريقة الاستخدام', 'Comment l’utiliser'], 'vch.s1': ['Buy the voucher and copy the code.', 'اشترِ القسيمة وانسخ الرمز.', 'Achetez le bon et copiez le code.'], 'vch.s2': ['Open {b} and choose “Redeem a code”.', 'افتح {b} واختر «استرداد رمز».', 'Ouvrez {b} et choisissez « Utiliser un code ».'], 'vch.s3': ['Paste the code. The value is added at once.', 'الصق الرمز فتُضاف القيمة فوراً.', 'Collez le code. La valeur est ajoutée aussitôt.'],
  'vch.gift': ['Send as a gift', 'أرسلها كهدية', 'Offrir en cadeau'], 'vch.gift_s': ['The code goes straight to your contact by SMS', 'يصل الرمز إلى جهة الاتصال برسالة نصية', 'Le code est envoyé à votre contact par SMS'], 'vch.gift_to': ['Gift to', 'هدية إلى', 'Offrir à'],
  'vch.gift_msg': ['Message (optional)', 'رسالة (اختياري)', 'Message (facultatif)'], 'vch.gift_ph': ['Happy birthday!', 'عيد ميلاد سعيد!', 'Joyeux anniversaire !'], 'vch.gift_done': ['Gift sent', 'تم إرسال الهدية', 'Cadeau envoyé'],
  'vch.gift_sent': ['{name} gets the code by SMS. A copy stays here.', 'يصل الرمز إلى {name} برسالة نصية، وتبقى نسخة هنا.', '{name} reçoit le code par SMS. Une copie reste ici.'], 'vch.gifted': ['Gift to {name}', 'هدية إلى {name}', 'Offert à {name}'],
  'vch.done': ['Voucher ready', 'القسيمة جاهزة', 'Bon prêt'], 'vch.code': ['Your code', 'رمزك', 'Votre code'], 'vch.copy': ['Copy code', 'انسخ الرمز', 'Copier le code'], 'vch.valid': ['Valid until {d}', 'صالحة حتى {d}', 'Valable jusqu’au {d}'],
  'vch.none': ['No vouchers yet', 'لا قسائم بعد', 'Aucun bon pour l’instant'], 'vch.none_s': ['Vouchers you buy appear here with their codes.', 'تظهر القسائم التي تشتريها هنا مع رموزها.', 'Les bons achetés apparaissent ici avec leurs codes.'], 'vch.shop': ['Browse vouchers', 'تصفّح القسائم', 'Voir les bons'],
  'vch.c.all': ['All', 'الكل', 'Tout'], 'vch.c.mobile': ['Mobile', 'الجوال', 'Mobile'], 'vch.c.stream': ['Streaming', 'البث', 'Streaming'], 'vch.c.gaming': ['Gaming', 'الألعاب', 'Jeux'], 'vch.c.shop': ['Shopping', 'التسوق', 'Shopping'], 'vch.c.food': ['Food', 'الطعام', 'Repas'], 'vch.c.rides': ['Rides', 'التوصيل', 'Trajets'], 'vch.c.learn': ['Learning', 'التعلّم', 'Apprendre'],
  'vch.b.own': ['Operator credit', 'رصيد المشغّل', 'Crédit opérateur'], 'vch.b.nova': ['Nova Mobile', 'نوفا موبايل', 'Nova Mobile'], 'vch.b.strm': ['Streamo', 'ستريمو', 'Streamo'], 'vch.b.pxl': ['Pixelry', 'بكسلري', 'Pixelry'], 'vch.b.mrkt': ['Marketa', 'ماركتا', 'Marketa'], 'vch.b.zyt': ['Zaytoun Eats', 'زيتون إيتس', 'Zaytoun Eats'], 'vch.b.wasl': ['Wasla Rides', 'وصلة', 'Wasla'], 'vch.b.ilmo': ['Ilmo Learning', 'علمو', 'Ilmo'], 'vch.b.giftly': ['Giftly', 'جفتلي', 'Giftly'],
});
