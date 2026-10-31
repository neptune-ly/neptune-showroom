// Vouchers: digital voucher store (telecom, streaming, gaming, shopping, food), gifting, purchase, my vouchers, ATM cash vouchers.
import { $, $$, S, L, t, T, tx, ic, icf, num, cur, sheet, toast, confetti, haptic, esc, sleep, anim, qrSvg, dateLbl, today, moneyTxt, init, bal } from '../util.js';
import { reg, go, back, backTo, A } from '../app.js';
import { ACC, accBy, BEN, benName, TX } from '../data.js';
import { authorize, confirmPin } from './auth.js';
import { pickAcc } from './money.js';
import { VB, VCATS, vb, vl } from './vbrands.js';

L([
  ['Vouchers', 'Bons', 'القسائم'], ['My vouchers', 'Mes bons', 'قسائمي'], ['Popular', 'Populaire', 'الأكثر شيوعاً'], ['From {a}', 'Dès {a}', 'ابتداءً من {a}'],
  ['Pay with your balance', 'Payez avec votre solde', 'ادفع من رصيدك'], ['Airtime, streaming, games and gift cards. Instant code, no card needed.', 'Crédit, streaming, jeux et cartes cadeaux. Code instantané, sans carte.', 'رصيد اتصالات واشتراكات وألعاب وبطاقات هدايا. رمز فوري دون بطاقة.'],
  ['Choose your amount', 'Choisissez un montant', 'اختر المبلغ'], ['Send as a gift', 'Offrir en cadeau', 'أرسلها كهدية'], ['The code goes straight to your contact', 'Le code est envoyé directement à votre contact', 'يصل الرمز مباشرة إلى جهة الاتصال'], ['Gift to', 'Offrir à', 'هدية إلى'],
  ['Pay from', 'Payer depuis', 'الدفع من'], ['Total', 'Total', 'الإجمالي'], ['Fee', 'Frais', 'الرسوم'], ['Free', 'Gratuit', 'مجاني'], ['Buy for {amt}', 'Acheter pour {amt}', 'اشترِ بـ {amt}'], ['Voucher', 'Bon', 'قسيمة'],
  ['Confirm purchase', 'Confirmer l\'achat', 'تأكيد الشراء'], ['Enter your PIN', 'Saisissez votre code PIN', 'أدخل رقمك السري'], ['Voucher purchased', 'Bon acheté', 'تمت عملية الشراء'], ['Gift sent to {name}', 'Cadeau envoyé à {name}', 'تم إرسال الهدية إلى {name}'],
  ['Voucher code', 'Code du bon', 'رمز القسيمة'], ['Copy code', 'Copier le code', 'نسخ الرمز'], ['Code copied', 'Code copié', 'تم نسخ الرمز'], ['How to redeem', 'Comment l\'utiliser', 'طريقة الاستخدام'], ['Done', 'Terminé', 'تم'],
  ['Open {brand} and go to Redeem or Top up', 'Ouvrez {brand} puis Recharger ou Utiliser un code', 'افتح {brand} ثم اختر الشحن أو استخدام رمز'], ['Enter the code above', 'Saisissez le code ci-dessus', 'أدخل الرمز أعلاه'], ['Your credit is added instantly', 'Votre crédit est ajouté instantanément', 'يُضاف رصيدك فوراً'],
  ['Digital', 'Numériques', 'رقمية'], ['Cash at ATM', 'Cash au DAB', 'نقدية من الصراف'], ['Ready to use', 'Prêt à l\'emploi', 'جاهزة للاستخدام'], ['Gift sent', 'Cadeau envoyé', 'تم إرسال الهدية'], ['No vouchers yet', 'Aucun bon pour l\'instant', 'لا توجد قسائم بعد'], ['Buy your first voucher from the store.', 'Achetez votre premier bon dans la boutique.', 'اشترِ أول قسيمة من المتجر.'],
  ['Create voucher', 'Créer un bon', 'إنشاء قسيمة'], ['Cash voucher', 'Bon de retrait', 'قسيمة سحب نقدي'], ['Withdraw at any ATM without your card', 'Retirez à tout DAB sans carte', 'اسحب من أي صراف بدون بطاقة'], ['Expires in {h}h', 'Expire dans {h} h', 'تنتهي خلال {h} س'], ['Redeemed', 'Utilisé', 'مستخدمة'],
  ['Enter this code at the ATM', 'Saisissez ce code au DAB', 'أدخل هذا الرمز في الصراف'], ['Voucher created', 'Bon créé', 'تم إنشاء القسيمة'], ['Valid for 24 hours', 'Valable 24 heures', 'صالحة لمدة 24 ساعة'], ['Amount to withdraw', 'Montant à retirer', 'المبلغ المراد سحبه'],
  ['Search vouchers', 'Rechercher un bon', 'ابحث في القسائم'], ['Hey, this one is for you.', 'Coucou, celui-ci est pour toi.', 'هذه الهدية لك.'], ['Message', 'Message', 'الرسالة'],
]);

const catIc = { telecom: 'phone', stream: 'tv', game: 'star', shop: 'shopping-bag', food: 'bag2' };
const bn = b => tx(b.n);
const money0 = a => `<span class="num">${num(a, 0)}</span> ${cur('LYD')}`;
const redeem = b => [t('Open {brand} and go to Redeem or Top up', { brand: bn(b) }), t('Enter the code above'), t('Your credit is added instantly')];
// seeded code, readable groups
let seq = 0; const mkCode = id => { let h = 2166136261 + seq++ * 7919; for (const ch of id) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) } const A_ = '23456789ABCDEFGHJKMNPQRSTUVWXYZ'; let o = ''; for (let i = 0; i < 12; i++) { h = Math.imul(h ^ (h >>> 15), 2246822507); o += A_[(h >>> 0) % A_.length]; if (i % 4 === 3 && i < 11) o += '-' } return o };
S.myv = S.myv || [{ id: 'zephyr', a: 50, code: 'ZP7K-93QM-4XA2', d: 1, gift: null }, { id: 'streamly', a: 60, code: 'ST4R-M8LY-2NC9', d: 5, gift: null }, { id: 'savora', a: 40, code: 'SV5D-R7TK-6HE3', d: 9, gift: 'Salma Farouk' }];

/* ---------- store ---------- */
const tile = b => `<button class="vtile" data-go="voucher" data-p='{"id":"${b.id}"}'><div class="top">${vl(b, 54)}${b.hot ? `<span class="tag">${t('Popular')}</span>` : ''}</div><div><b>${bn(b)}</b><small>${tx(b.kind)}</small><small style="margin-top:6px;color:var(--look-ink);font-weight:700">${t('From {a}', { a: money0(b.d[0]) })}</small></div></button>`;
reg('vouchers', () => ({
  title: t('Vouchers'), right: `<button class="ibtn" data-go="myvouchers" aria-label="${t('My vouchers')}">${ic('receipt')}</button>`,
  body: `<div class="vban rings-bg rv"><div class="vl-stack">${['zephyr', 'streamly', 'pixelplay', 'bazaar', 'savora'].map(i => vl(vb(i), 44)).join('')}</div><div><b>${t('Pay with your balance')}</b><p>${t('Airtime, streaming, games and gift cards. Instant code, no card needed.')}</p></div></div>
    <div class="chips rv" id="vc" style="margin-top:18px;padding-bottom:14px;--d:1">${VCATS.map((c, i) => `<button class="chip" data-c="${c[0]}" aria-pressed="${i === 0}">${i ? ic(catIc[c[0]], 's') : ''}${tx(c[1])}</button>`).join('')}</div>
    <div class="vgrid rv" id="vg" style="--d:2">${VB.map(tile).join('')}</div>`,
  mount(el) {
    $$('#vc .chip', el).forEach(c => c.onclick = () => { $$('#vc .chip', el).forEach(x => x.setAttribute('aria-pressed', x === c)); const k = c.dataset.c; const g = $('#vg', el); g.innerHTML = VB.filter(b => k === 'all' || b.cat === k).map(tile).join(''); anim(g, [{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'none' }], { duration: 420 }); haptic(5) });
  }
}));

/* ---------- product + purchase ---------- */
reg('voucher', ({ id }) => {
  const b = vb(id);
  return {
    title: bn(b), body: `<div class="vdet rv" style="--c1:${b.c[0]};--c2:${b.c[1]}">${vl(b, 64)}<div><b>${bn(b)}</b><small>${tx(b.kind)}</small></div></div>
    <section class="sec rv" style="--d:1"><h3>${t('Choose your amount')}</h3><div class="vamts">${b.d.map((a, i) => `<button class="vamt" data-a="${a}" aria-pressed="${i === Math.min(1, b.d.length - 1)}"><b class="num">${num(a, 0)}</b><small>${cur('LYD')}</small></button>`).join('')}</div></section>
    <div class="group rv" style="--d:2;margin-top:22px"><div class="togrow"><span class="tile f3">${ic('gift')}</span><div class="tx" style="flex:1"><b style="display:block;font-weight:650">${t('Send as a gift')}</b><small class="muted">${t('The code goes straight to your contact')}</small></div><button class="switch" role="switch" id="gs" aria-checked="false" aria-label="${t('Send as a gift')}"></button></div>
      <div id="gb" hidden><div style="padding:0 16px 4px"><small class="muted" style="font-weight:700;font-size:12.5px">${t('Gift to')}</small></div><div class="ben-strip" style="padding:4px 12px 14px">${BEN.slice(0, 5).map((p, i) => `<button class="bs ${i === 1 ? 'on' : ''}" data-b="${p.id}"><span class="av ${p.tone}">${init(benName(p))}</span><small>${esc(benName(p).split(' ')[0])}</small></button>`).join('')}</div></div></div>
    <div class="sumbox rv" style="--d:3;margin-top:14px"><button class="row acc-pick" id="pf"><span class="tile r">${ic('wallet')}</span><div class="tx"><small>${t('Pay from')}</small><b>${tx(ACC[0].name)} <span class="num">•••• ${ACC[0].no}</span></b></div>${ic('chevron-down', 'muted')}</button>
      <div class="kv" style="margin:0;background:none"><div><span>${t('Fee')}</span><b>${t('Free')}</b></div><div class="tot"><span>${t('Total')}</span><b id="tt" class="num"></b></div></div></div>
    <div class="actions rv" style="--d:4"><button class="btn" id="buy"></button></div>`,
    mount(el) {
      let a = b.d[Math.min(1, b.d.length - 1)], from = 'cur', gift = null;
      const upd = () => { const bad = a > accBy(from).bal; $('#tt', el).textContent = `${num(a, 3)} ${cur('LYD')}`; const bt = $('#buy', el); bt.textContent = t('Buy for {amt}', { amt: moneyTxt(a, 'LYD', 0) }); bt.disabled = bad };
      upd();
      $$('.vamt', el).forEach(x => x.onclick = () => { a = +x.dataset.a; $$('.vamt', el).forEach(y => y.setAttribute('aria-pressed', y === x)); haptic(6); upd() });
      $('#gs', el).onclick = e => { const on = e.currentTarget.getAttribute('aria-checked') !== 'true'; e.currentTarget.setAttribute('aria-checked', on); $('#gb', el).hidden = !on; gift = on ? BEN[1] : null; if (on) anim($('#gb', el), [{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], { duration: 380 }); haptic(8) };
      $$('#gb .bs', el).forEach(x => x.onclick = () => { $$('#gb .bs', el).forEach(y => y.classList.toggle('on', y === x)); gift = BEN.find(p => p.id === x.dataset.b) });
      $('#pf', el).onclick = () => pickAcc(from, id => { from = id; $('#pf b', el).innerHTML = `${tx(accBy(id).name)} <span class="num">•••• ${accBy(id).no}</span>`; upd() });
      $('#buy', el).onclick = async () => {
        const rows = [[t('Voucher'), `${bn(b)} · ${num(a, 0)} ${cur('LYD')}`], [t('Pay from'), `${tx(accBy(from).name)}`]]; if (gift) rows.unshift([t('Gift to'), esc(benName(gift))]);
        const ok = await confirmPin({ title: t('Confirm purchase'), amount: a, rows }); if (!ok) return;
        const code = mkCode(b.id), gn = gift ? benName(gift) : null; accBy(from).bal -= a; S.myv.unshift({ id: b.id, a, code, d: 0, gift: gn });
        const k = { telecom: 'bills', stream: 'fun', game: 'fun', shop: 'shop', food: 'food' }[b.cat]; TX.unshift({ id: 'T' + (84300 + S.myv.length), d: 0, h: 10, en: `${b.n[0]} voucher`, ar: `قسيمة ${b.n[2]}`, cat: k, a: -a, via: 'card', note: 'Voucher', date: new Date(today) });
        await sleep(150); go('voucher-done', { id: b.id, a, code, gift: gn });
      };
    }
  };
});

const ticket = (b, v) => `<div class="ticket" style="--n:342px">${vl(b, 60)}<div class="tname">${bn(b)}</div><div class="tval num">${num(Number(v.a), 0)} ${cur('LYD')} · ${tx(b.kind)}</div><div class="code num" id="vcode">${esc(v.code)}</div>
  <button class="btn tonal sm" data-act="copycode" data-c="${esc(v.code)}" style="width:100%">${ic('copy', 's')}${t('Copy code')}</button><hr><div style="text-align:start;font-size:12.5px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--look-muted);margin-bottom:10px">${t('How to redeem')}</div><ol class="steps">${redeem(b).map(s => `<li>${esc(s)}</li>`).join('')}</ol></div>`;
reg('voucher-done', ({ id, a, code, gift }) => {
  const b = vb(id);
  return {
    bar: false, body: `<div class="done" style="padding-top:calc(var(--sat) + 34px)"><div class="ck-w"><svg class="ck" viewBox="0 0 120 120"><circle class="c1" cx="60" cy="60" r="52" fill="none" stroke="var(--ok)" stroke-width="7" pathLength="1"/><path class="c2" d="M38 62 54 78 84 44" fill="none" stroke="var(--ok)" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" pathLength="1"/></svg></div>
      <h1 class="rv" style="--d:3">${t('Voucher purchased')}</h1>${gift ? `<p class="muted rv" style="--d:4;margin-top:6px">${t('Gift sent to {name}', { name: esc(gift) })}</p>` : ''}</div>
      <div class="rv" style="--d:5">${ticket(b, { a, code })}</div>
      <div class="actions rv" style="--d:6"><button class="btn" data-act="vdone">${t('Done')}</button><button class="btn text" data-go="myvouchers" style="margin:auto">${t('My vouchers')}</button></div>`,
    mount(el) { $('.ck', el).classList.add('go'); setTimeout(() => confetti($('.app'), 30), 700) }
  };
});
A.vdone = () => backTo('vouchers');
A.copycode = b => { try { navigator.clipboard && navigator.clipboard.writeText(b.dataset.c) } catch (e) {} toast(t('Code copied'), 'copy') };

/* ---------- my vouchers: purchased + ATM cash ---------- */
const VCH = [{ code: '4829 7731', a: 200, s: 'a', h: 19 }, { code: '9013 4458', a: 50, s: 'r', h: 0 }];
const mrow = v => { const b = vb(v.id), d = new Date(today); d.setDate(d.getDate() - v.d); return `<button class="row" data-act="vopen" data-i="${S.myv.indexOf(v)}">${vl(b, 46)}<div class="tx"><b>${bn(b)}</b><small>${dateLbl(d)} · ${v.gift ? t('Gift sent') : t('Ready to use')}</small></div><div class="end"><b class="num">${num(v.a, 0)}</b><small>${cur('LYD')}</small></div></button>` };
const vrow = v => `<button class="row" data-act="vshow" data-c="${esc(v.code)}" data-a="${Number(v.a)}"><span class="tile ${v.s === 'a' ? 'f3' : 'ok'}">${ic(v.s === 'a' ? 'atm' : 'success-check')}</span><div class="tx"><b class="num">${esc(v.code)}</b><small>${v.s === 'a' ? t('Expires in {h}h', { h: v.h }) : t('Redeemed')}</small></div><div class="end"><b class="num">${num(v.a, 0)}</b><small>${cur('LYD')}</small></div></button>`;
reg('myvouchers', () => ({
  title: t('My vouchers'), right: `<button class="ibtn" data-act="newv" aria-label="${t('Create voucher')}">${ic('plus')}</button>`,
  body: `<div class="form" style="padding-bottom:6px"><div class="seg" id="mvs"><button data-t="d" aria-selected="true">${t('Digital')}</button><button data-t="c" aria-selected="false">${t('Cash at ATM')}</button></div></div><div id="mvb"></div>`,
  mount(el) {
    const host = $('#mvb', el), draw = k => { host.innerHTML = k === 'd' ? (S.myv.length ? `<div class="group">${S.myv.map(mrow).join('')}</div>` : `<div class="empty"><b>${t('No vouchers yet')}</b><small>${t('Buy your first voucher from the store.')}</small></div>`) : `<p class="muted" style="padding:6px 24px 14px">${t('Withdraw at any ATM without your card')}</p><div class="group" id="vl">${VCH.map(vrow).join('')}</div>`; anim(host, [{ opacity: 0 }, { opacity: 1 }], { duration: 280 }) };
    $$('#mvs button', el).forEach(b => b.onclick = () => { $$('#mvs button', el).forEach(x => x.setAttribute('aria-selected', x === b)); draw(b.dataset.t) }); draw('d');
  }
}));
A.vopen = b => { const v = S.myv[+b.dataset.i], x = vb(v.id); sheet(`<div class="auth"><h2>${t('Voucher code')}</h2>${ticket(x, v).replace('class="ticket" style="--n:342px"', 'class="ticket flat"')}</div>`) };
A.vshow = b => sheet(`<div class="auth"><h2>${t('Voucher code')}</h2><div class="vcode num disp">${b.dataset.c}</div><div class="qimg sm">${qrSvg(b.dataset.c, 25, 6)}</div><p class="sub">${t('Enter this code at the ATM')}</p><div class="amt disp">${num(+b.dataset.a, 0)} <small>${cur('LYD')}</small></div><button class="btn tonal" data-close="x">${t('Done')}</button></div>`);
A.newv = () => sheet(`<h2>${t('Create voucher')}</h2><p class="sub">${t('Valid for 24 hours')}</p><div class="amount-in"><input id="va" inputmode="decimal" value="100" aria-label="${t('Amount to withdraw')}"><div class="cur">${cur('LYD')}</div></div><button class="btn" data-close="ok">${t('Create voucher')}</button>`, { onClose: async v => { if (v !== 'ok') return; const ok = await authorize({ title: t('Create voucher'), amount: 100, rows: [[t('Fee'), t('Free')]] }); if (ok) { VCH.unshift({ code: '7' + (100 + VCH.length) + ' 2046', a: 100, s: 'a', h: 24 }); const l = $('#vl'); if (l) l.innerHTML = VCH.map(vrow).join(''); toast(t('Voucher created'), 'gift') } } });
