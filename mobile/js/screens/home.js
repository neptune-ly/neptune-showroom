import { $, S, L, t, T, tx, ic, icf, bal, num, cur, toast, esc, dateLbl, dayLbl, timeLbl, paintBal, dp, init, bmark } from '../util.js';
import { reg, go, tab, A } from '../app.js';
import { ACC, TX, CATS, BEN, uname, bankName, accBy, NOTES, GOALS, CARDS, spendByCat, benName } from '../data.js';
import { cardArt, toggleFreeze } from './cards.js';
import { VB, vl } from './vbrands.js';

L([
  ['Available balance', 'Solde disponible', 'الرصيد المتاح'], ['Transfer', 'Virement', 'تحويل'], ['Pay by QR', 'Payer par QR', 'ادفع بـ QR'], ['Vouchers', 'Bons', 'القسائم'], ['Services', 'Services', 'الخدمات'],
  ['Transactions', 'Opérations', 'العمليات'], ['See all', 'Tout voir', 'عرض الكل'], ['Notifications', 'Notifications', 'الإشعارات'], ['Hide balances', 'Masquer les soldes', 'إخفاء الأرصدة'], ['Show balances', 'Afficher les soldes', 'إظهار الأرصدة'],
  ['Accounts', 'Comptes', 'الحسابات'], ['Statements', 'Relevés', 'كشوف الحساب'], ['Account Number', 'Numéro de compte', 'رقم الحساب'], ['IBAN', 'IBAN', 'الآيبان'],
  ['Available Services', 'Services disponibles', 'الخدمات المتاحة'], ['Transaction Statement', 'Relevé des opérations', 'كشف العمليات'], ['Account Details', 'Détails du compte', 'تفاصيل الحساب'], ['Ask someone to pay you', 'Demander à quelqu\'un de vous payer', 'اطلب من أحدهم أن يدفع لك'],
  ['Split a bill', 'Partager l\'addition', 'تقسيم الفاتورة'], ['Copied to clipboard', 'Copié', 'تم النسخ'], ['Statement saved', 'Relevé enregistré', 'تم حفظ الكشف'],
  ['Spent this month', 'Dépensé ce mois-ci', 'المصروف هذا الشهر'], ['Spending this month', 'Dépenses du mois', 'إنفاق هذا الشهر'], ['Savings', 'Épargne', 'المدخرات'], ['Insights', 'Analyses', 'التحليلات'], ['Freeze card', 'Bloquer la carte', 'تجميد البطاقة'], ['Show details', 'Afficher les détails', 'إظهار التفاصيل'],
  ['funded', 'financé', 'ممول'], ['Gift & digital vouchers', 'Bons cadeaux et numériques', 'قسائم الهدايا والرقمية'], ['Top up, stream, play and shop', 'Recharge, streaming, jeux et achats', 'اشحن وشاهد والعب وتسوق'], ['Total balance', 'Solde total', 'الرصيد الإجمالي'], ['Open a savings goal', 'Ouvrir un objectif d\'épargne', 'افتح هدف توفير'], ['Savings goals', 'Objectifs d\'épargne', 'أهداف التوفير'], ['Transactions', 'Opérations', 'العمليات'],
]);

const sum = a => a.reduce((s, x) => s + x, 0);
const isPerson = x => x.cat === 'tr' && BEN.some(b => b.en === x.en);
const catOf = x => CATS[x.cat];
export const txRow = (x) => {
  const c = catOf(x), person = isPerson(x), b = person && BEN.find(b => b.en === x.en);
  const lead = person ? `<span class="av ${b.tone}">${init(benName(b))}</span>` : `<span class="gl" style="--c:${c.c}">${ic(x.cat === 'inc' ? 'arrow-down' : c.ic)}</span>`;
  return `<button class="row act txr" data-go="receipt" data-p='{"id":"${x.id}"}'>${lead}<div class="tx"><b>${esc(T(x.en, x.en, x.ar))}</b><small>${tx(c.n)} · ${timeLbl(x.date)}</small></div><div class="end"><b class="${x.a > 0 ? 'pos' : ''}"><span class="num">${x.a > 0 ? '+' : '−'}${num(Math.abs(x.a))}</span></b><small>${cur('LYD')}</small></div></button>`;
};
export const dayHead = (d, list) => { const tot = sum(list.map(x => x.a)); return `<div class="dayh"><span>${dayLbl(d)}</span><b class="num">${tot > 0 ? '+' : '−'}${num(Math.abs(tot))}</b></div>` };
export const dayGroups = list => [...new Set(list.map(x => x.d))].map(d => { const l = list.filter(x => x.d === d); return `${dayHead(d, l)}<div class="group plain">${l.map(txRow).join('')}</div>` }).join('');

const qa = (cls, ico, label, go_, p) => `<button class="qa ${cls}" data-go="${go_}" data-p='${JSON.stringify(p || {})}'><i class="qi">${ic(ico)}</i><span>${t(label)}</span></button>`;
const accPill = a => `${tx(a.name)} · <span class="num">•• ${a.no}</span> ${ic('chevron-down', 's')}`;

reg('home', () => {
  const a = accBy(S.homeAcc || 'cur'); const unread = NOTES.filter(n => n.unread).length;
  const sp = spendByCat(), spTot = sum(sp.map(s => s.v)), top = sp.slice(0, 4), g = GOALS[0], deb = CARDS[0], vir = CARDS[2];
  const body = `<div class="home">
    <div class="hero rings-bg"><div class="bar"><div class="brand">${bmark()}<b>${esc(bankName())}</b></div>
      <button class="hbtn" data-go="notifications" aria-label="${t('Notifications')}">${ic('bell', 'l')}${unread ? `<i class="dot"><span class="num">${unread}</span></i>` : ''}</button><button class="hav" data-go="settings" aria-label="${t('Settings')}">${init(uname())}</button></div>
      <button class="acc glass" data-act="homeacc">${accPill(a)}</button>
      <div class="lbl eyebrow">${t('Available balance')} · ${cur(a.cur)}</div>
      <div class="row2"><div class="amt" id="hb">${bal(a.bal, '', dp(a.cur))}</div><button class="eye" data-act="hide" aria-label="${S.hide ? t('Show balances') : t('Hide balances')}">${ic(S.hide ? 'eye-off' : 'eye')}</button></div>
      <div class="chips2"><button class="gc glass" data-go="insights">${ic('trending-down')}<span><small>${t('Spent this month')}</small><b>${bal(spTot, '', 0)} <em>${cur('LYD')}</em></b></span></button><button class="gc glass" data-tabgo="accounts">${ic('savings')}<span><small>${t('Savings')}</small><b>${bal(accBy('sav').bal, '', 0)} <em>${cur('LYD')}</em></b></span></button></div></div>
    <div class="body"><div class="qa-grid rv">${qa('q1', 'transfer', 'Transfer', 'xfer')}${qa('q2', 'qr-code', 'Pay by QR', 'qrpay', { scheme: 'lypay' })}${qa('q3', 'gift', 'Vouchers', 'vouchers')}${qa('q4', 'menu', 'Services', 'services')}</div>
      <div class="sh rv" style="--d:1"><h2>${t('Cards')}</h2><a class="link" data-tabgo="cards" role="button">${t('See all')}</a></div>
      <div class="cards-row rv" style="--d:2">
        <div class="ci"><div data-go="card" data-p='{"id":"${deb.id}"}'>${cardArt(deb)}</div><div class="cstrip"><span>${ic('snow', 's')}${t('Freeze card')}</span><button class="switch" role="switch" data-act="homefreeze" data-id="${deb.id}" aria-checked="${!!S.frozen[deb.id]}" aria-label="${t('Freeze card')}"></button></div></div>
        <div class="ci"><div data-go="card" data-p='{"id":"${vir.id}"}'>${cardArt(vir)}</div><button class="cstrip" data-go="card" data-p='{"id":"${vir.id}"}'><span>${ic('eye', 's')}${t('Show details')}</span>${icf('chevron-right', 's')}</button></div>
        <div class="ci"><button class="gcard" data-go="goals"><div class="gt"><span class="tile r">${ic(g.ic)}</span><div><b>${tx(g.n)}</b><small>${Math.round(g.s / g.t * 100)}% ${t('funded')}</small></div></div><div class="gp"><span class="num">${num(g.s, 0)}</span> <small>/ <span class="num">${num(g.t, 0)}</span> ${cur('LYD')}</small><div class="gbar"><i style="--w:${g.s / g.t * 100}%"></i></div></div></button><button class="cstrip" data-go="goals"><span>${ic('goal', 's')}${t('Savings goals')}</span>${icf('chevron-right', 's')}</button></div>
        <div class="ci"><button class="vpromo rings-bg" data-go="vouchers"><div class="vl-stack">${['zephyr', 'streamly', 'pixelplay', 'savora'].map(i => vl(VB.find(b => b.id === i), 38)).join('')}</div><div><b>${t('Gift & digital vouchers')}</b><small>${t('Top up, stream, play and shop')}</small></div><i class="go">${icf('arrow-right')}</i></button><button class="cstrip" data-go="vouchers"><span>${ic('gift', 's')}${t('Vouchers')}</span>${icf('chevron-right', 's')}</button></div>
      </div>
      <div class="sh rv" style="--d:3"><h2>${t('Insights')}</h2><a class="link" data-go="insights" role="button">${t('See all')}</a></div>
      <button class="insight rv" style="--d:3;width:calc(100% - 32px);display:block;text-align:start" data-go="insights"><div class="it"><div><small>${t('Spending this month')}</small><div class="num">${bal(spTot, 'LYD', 0)}</div></div><span class="badge ok">${ic('trending-down', 's')} 12%</span></div>
        <div class="stackbar">${top.map((c, i) => `<i style="--f:${c.v};--c:${c.c};--i:${i}"></i>`).join('')}</div><div class="legend">${top.map(c => `<span style="--c:${c.c}">${tx(CATS[c.k].n)}</span>`).join('')}</div></button>
      <div class="sh rv" style="--d:4"><h2>${t('Transactions')}</h2><a class="link" data-go="history" role="button">${t('See all')}</a></div>
      <div class="rv" style="--d:5">${dayGroups(TX.slice(0, 7))}</div></div></div>`;
  const skel = `<div class="home"><div class="hero"><div class="bar"><span class="skel" style="width:150px;height:30px;background:rgba(255,255,255,.2)"></span></div><div class="skel" style="margin-top:34px;width:230px;height:60px;background:rgba(255,255,255,.18)"></div></div><div class="body"><div class="qa-grid">${'<span class="skel" style="height:84px;border-radius:21px"></span>'.repeat(4)}</div><div style="margin-top:30px">${'<div class="skel-row"><div><span class="skel"></span><span class="skel"></span></div></div>'.repeat(4)}</div></div></div>`;
  return { nav: 'home', bar: false, sbHero: true, body, skel };
});
A.hide = (el) => { S.hide = !S.hide; S.set('hide', S.hide ? '1' : '0'); document.querySelectorAll('.bal').forEach(b => paintBal(b)); el.innerHTML = ic(S.hide ? 'eye-off' : 'eye'); el.setAttribute('aria-label', S.hide ? t('Show balances') : t('Hide balances')) };
A.homefreeze = b => toggleFreeze(b.dataset.id, document.querySelector('.screen:last-of-type'));
A.homeacc = async () => { const m = await import('./money.js'); m.pickAcc(S.homeAcc || 'cur', id => { S.homeAcc = id; const b = accBy(id); const sc = document.querySelector('.screen:last-of-type'); const h = sc && sc.querySelector('#hb .bal'); if (!h) return; sc.querySelector('.acc').innerHTML = accPill(b); sc.querySelector('.lbl').textContent = `${t('Available balance')} · ${cur(b.cur)}`; h.dataset.count = b.bal; h.dataset.d = dp(b.cur); paintBal(h) }) };

/* accounts tab */
const totalLyd = () => ACC.reduce((s, a) => s + (a.cur === 'LYD' ? a.bal : a.bal * 4.88), 0);
reg('accounts', () => ({
  nav: 'accounts', bar: false, skel: `<div style="padding-top:60px">${'<div class="skel-row"><div><span class="skel"></span><span class="skel"></span></div></div>'.repeat(5)}</div>`,
  body: `<div class="big-title">${t('Accounts')}</div>
    <div class="tot-hero rings-bg rv"><small class="eyebrow">${t('Total balance')}</small><div class="amt">${bal(totalLyd(), '', 3)}<span class="cur">${cur('LYD')}</span></div><div class="mini"><span>${ic('wallet', 's')} ${ACC.length} ${t('Accounts')}</span></div></div>
    <div class="group rv" style="--d:1;margin-top:14px">${ACC.map(a => `<button class="row acc-row" data-go="account" data-p='{"id":"${a.id}"}'><span class="tile ${a.tone}">${ic(a.ic)}</span><div class="tx"><b>${tx(a.name)}</b><small class="num">•••• ${a.no}</small></div><div class="end"><b>${bal(a.bal, '', dp(a.cur))}</b><small>${cur(a.cur)}</small></div></button>`).join('')}</div>
    <section class="sec rv" style="--d:2"><h3>${t('Available Services')}</h3><div class="group">
      <button class="row" data-go="statements"><span class="tile f1">${ic('statement')}</span><div class="tx"><b>${t('Statements')}</b></div>${icf('chevron-right', 'muted')}</button>
      <button class="row" data-go="history"><span class="tile f2">${ic('receipt')}</span><div class="tx"><b>${t('Transactions')}</b></div>${icf('chevron-right', 'muted')}</button>
      <button class="row" data-go="goals"><span class="tile f3">${ic('goal')}</span><div class="tx"><b>${t('Savings goals')}</b></div>${icf('chevron-right', 'muted')}</button></div></section>`
}));

const copyRow = (label, v) => `<div class="xrow"><div class="tx"><small>${label}</small><b class="num">${v}</b></div><button class="ibtn copy" data-act="copy" aria-label="copy">${ic('copy')}</button></div>`;
const linkRow = (ico, label, sub, go_, p, tone = '') => `<button class="xrow" data-go="${go_}" data-p='${JSON.stringify(p || {})}'><span class="tile ${tone}">${ic(ico)}</span><div class="tx"><b>${label}</b>${sub ? `<small>${sub}</small>` : ''}</div>${icf('chevron-right', 'muted')}</button>`;
reg('account', ({ id }) => {
  const a = accBy(id) || ACC[0];
  return {
    title: tx(a.name), right: `<button class="ibtn" data-act="copy" aria-label="share">${ic('share')}</button>`,
    body: `<div class="solid rings-bg rv"><small class="eyebrow">${t('Available balance')}</small><div class="amt">${bal(a.bal, a.cur)}</div></div>
    <div class="group rv" style="--d:1;margin-top:14px">${copyRow(t('Account Number'), '100200' + a.no)}${a.iban === '—' ? '' : copyRow(t('IBAN'), a.iban.replace(/ /g, ''))}</div>
    <section class="sec rv" style="--d:2"><h3>${t('Available Services')}</h3><div class="group">${linkRow('statement', t('Transaction Statement'), '', 'statements', {}, 'f1')}${linkRow('info', t('Account Details'), '', 'statements', {}, 'f2')}${linkRow('request', t('Ask someone to pay you'), '', 'request', {}, 'f3')}${linkRow('split-bill', t('Split a bill'), '', 'split')}</div></section>
    <div class="thead"><h2>${t('Transactions')}</h2><a role="button" data-go="history">${t('See all')}</a></div><div class="group">${TX.slice(0, 5).map(txRow).join('')}</div>`
  };
});
A.copy = () => toast(T('Copied to clipboard', 'Copié', 'تم النسخ'), 'copy');
reg('statements', () => ({ title: t('Statements'), body: `<div class="group" style="margin-top:8px">${['October 2026', 'September 2026', 'August 2026', 'July 2026'].map((m, i) => `<button class="row" data-act="dl"><span class="tile bad">${ic('pdf')}</span><div class="tx"><b>${T(m, m.replace('October', 'Octobre').replace('September', 'Septembre').replace('August', 'Août').replace('July', 'Juillet'), ['أكتوبر', 'سبتمبر', 'أغسطس', 'يوليو'][i] + ' 2026')}</b><small>PDF · <span class="num">${120 + i * 11}</span> KB</small></div>${ic('download', 'muted')}</button>`).join('')}</div>` }));
A.dl = () => toast(T('Statement saved', 'Relevé enregistré', 'تم حفظ الكشف'), 'download');
