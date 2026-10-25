import { $, S, L, t, T, tx, ic, icf, bal, num, cur, toast, esc, dateLbl, paintBal, dp } from '../util.js';
import { reg, go, tab, A } from '../app.js';
import { ACC, TX, uname, USER, bankName, accBy, BANKS, NOTES } from '../data.js';

L([
  ['Good morning', 'Bonjour', 'صباح الخير'], ['Available Balance', 'Solde disponible', 'الرصيد المتاح'], ['Transfer', 'Virement', 'تحويل'], ['QR', 'QR', 'QR'], ['Vouchers', 'Bons', 'القسائم'], ['Services', 'Services', 'الخدمات'],
  ['Transactions', 'Opérations', 'العمليات'], ['All', 'Tout', 'الكل'], ['Notifications', 'Notifications', 'الإشعارات'], ['Hide balances', 'Masquer les soldes', 'إخفاء الأرصدة'], ['Show balances', 'Afficher les soldes', 'إظهار الأرصدة'],
  ['Wallet', 'Portefeuille', 'المحفظة'], ['Statements', 'Relevés', 'كشوف الحساب'], ['Settings', 'Paramètres', 'الإعدادات'], ['Account Number', 'Numéro de compte', 'رقم الحساب'], ['IBAN', 'IBAN', 'الآيبان'],
  ['Available Services', 'Services disponibles', 'الخدمات المتاحة'], ['Transaction Statement', 'Relevé des opérations', 'كشف العمليات'], ['Account Details', 'Détails du compte', 'تفاصيل الحساب'], ['Ask someone to pay you', 'Demander à quelqu\'un de vous payer', 'اطلب من أحدهم أن يدفع لك'],
  ['Split a bill', 'Partager l\'addition', 'تقسيم الفاتورة'], ['Send', 'Envoyer', 'إرسال'], ['Request', 'Demander', 'طلب'], ['Available', 'Disponible', 'المتاح'], ['Copied to clipboard', 'Copié', 'تم النسخ'], ['Statement saved (demo)', 'Relevé enregistré (démo)', 'تم حفظ الكشف (عرض)'],
]);

const tile = (ico, label, go_, p) => `<button class="tl" data-go="${go_}" data-p='${JSON.stringify(p || {})}'>${ic(ico)}<span>${t(label)}</span></button>`;

export const txRow = (x) => `<button class="row txr" data-go="receipt" data-p='{"id":"${x.id}"}'><div class="tx"><b>${esc(txName2(x))}</b><small>${dateLbl(x.date, 1)}</small></div><div class="end"><b class="${x.a > 0 ? 'pos' : ''}"><span class="num">${x.a > 0 ? '+' : '−'}${num(Math.abs(x.a))}</span> ${cur('LYD')}</b></div></button>`;
const txName2 = x => T(x.en, x.en, x.ar);

reg('home', () => {
  const a = accBy(S.homeAcc || 'cur'); const unread = NOTES.filter(n => n.unread).length;
  const body = `<div class="home">
    <div class="htop"><div class="hband"><span class="mono">${esc(BANKS[Looks.get()][0][0])}</span><b>${esc(bankName())}</b></div>
      <div class="hgreet"><div class="gr"><small>${t('Good morning')}</small><b>${esc(uname())}</b></div><button class="ibtn" data-go="notifications" aria-label="${t('Notifications')}">${ic('bell')}${unread ? `<i class="dot"><span class="num">${unread}</span></i>` : ''}</button></div></div>
    <div class="bcard rv"><button class="acc" data-act="homeacc">${tx(a.name)} · <span class="num">•• ${a.no}</span> ${ic('chevron-down', 's')}</button>
      <div><div class="lbl">${t('Available Balance')} · ${cur(a.cur)}</div><div class="row2"><div class="amt disp" id="hb">${bal(a.bal, '', dp(a.cur))}</div><button class="eye" data-act="hide" aria-label="${S.hide ? t('Show balances') : t('Hide balances')}">${ic(S.hide ? 'eye-off' : 'eye')}</button></div></div></div>
    <div class="tiles rv" style="--d:1">${tile('transfer', 'Transfer', 'xfer')}${tile('qr-code', 'QR', 'qrpay', { scheme: 'lypay' })}${tile('gift', 'Vouchers', 'vouchers')}${tile('menu', 'Services', 'services')}</div>
    <div class="thead rv" style="--d:2"><h2>${t('Transactions')}</h2><a role="button" data-go="history">${t('All')}</a></div>
    <div class="group rv" style="--d:3">${TX.slice(0, 5).map(txRow).join('')}</div>
    <small class="demo-tag">${t('Demonstration — simulated data')}</small></div>`;
  const skel = `<div class="home"><div class="hband"><span class="skel" style="width:140px;height:20px;background:rgba(255,255,255,.25)"></span></div><div class="hgreet"><span class="skel" style="width:160px;height:44px"></span></div><div class="skel" style="margin:6px 20px 0;height:152px;border-radius:20px"></div><div class="tiles">${'<span class="skel" style="height:78px;border-radius:16px"></span>'.repeat(4)}</div><div style="margin-top:34px">${'<div class="skel-row"><div><span class="skel"></span><span class="skel"></span></div></div>'.repeat(4)}</div></div>`;
  return { nav: 'home', bar: false, sbHero: true, body, skel };
});
A.hide = (el) => { S.hide = !S.hide; S.set('hide', S.hide ? '1' : '0'); document.querySelectorAll('.bal').forEach(b => paintBal(b)); el.innerHTML = ic(S.hide ? 'eye-off' : 'eye'); el.setAttribute('aria-label', S.hide ? t('Show balances') : t('Hide balances')) };
A.homeacc = async () => { const m = await import('./money.js'); m.pickAcc(S.homeAcc || 'cur', id => { S.homeAcc = id; const b = accBy(id); const sc = document.querySelector('.screen:last-of-type'); const h = sc && sc.querySelector('#hb .bal'); if (!h) return; sc.querySelector('.acc').innerHTML = `${tx(b.name)} · <span class="num">•• ${b.no}</span> ${ic('chevron-down', 's')}`; sc.querySelector('.lbl').textContent = `${t('Available Balance')} · ${cur(b.cur)}`; h.dataset.count = b.bal; h.dataset.d = dp(b.cur); paintBal(h) }) };

/* wallet (accounts) tab */
reg('accounts', () => ({
  nav: 'accounts', bar: false, skel: `<div style="padding-top:60px">${'<div class="skel-row"><div><span class="skel"></span><span class="skel"></span></div></div>'.repeat(5)}</div>`,
  body: `<div class="big-title">${t('Wallet')}</div>
    <div class="group rv">${ACC.map(a => `<button class="row acc-row" data-go="account" data-p='{"id":"${a.id}"}'><span class="tile">${ic(a.ic)}</span><div class="tx"><b>${tx(a.name)}</b><small class="num">•••• ${a.no}</small></div><div class="end"><b>${bal(a.bal, '', dp(a.cur))}</b><small>${cur(a.cur)}</small></div></button>`).join('')}</div>
    <section class="sec rv" style="--d:1"><h3>${t('Available Services')}</h3><div class="group">
      <button class="row" data-go="statements"><span class="tile">${ic('statement')}</span><div class="tx"><b>${t('Statements')}</b></div>${icf('chevron-right', 'muted')}</button>
      <button class="row" data-go="history"><span class="tile">${ic('receipt')}</span><div class="tx"><b>${t('Transactions')}</b></div>${icf('chevron-right', 'muted')}</button></div></section>
    <small class="demo-tag">${t('Demonstration — simulated data')}</small>`
}));

const copyRow = (label, v) => `<div class="xrow"><div class="tx"><small>${label}</small><b class="num">${v}</b></div><button class="ibtn copy" data-act="copy" aria-label="copy">${ic('copy')}</button></div>`;
const linkRow = (ico, label, sub, go_, p) => `<button class="xrow" data-go="${go_}" data-p='${JSON.stringify(p || {})}'>${ic(ico, 'muted')}<div class="tx"><b>${label}</b>${sub ? `<small>${sub}</small>` : ''}</div>${icf('chevron-right', 'muted')}</button>`;
reg('account', ({ id }) => {
  const a = accBy(id) || ACC[0];
  return {
    title: tx(a.name), right: `<button class="ibtn" data-act="copy" aria-label="share">${ic('share')}</button>`,
    body: `<div class="solid rv"><small>${t('Available Balance')}</small><div class="amt disp">${bal(a.bal, a.cur)}</div></div>
    <div class="group rv" style="--d:1;margin-top:8px">${copyRow(t('Account Number'), '100200' + a.no)}${a.iban === '—' ? '' : copyRow(t('IBAN'), a.iban.replace(/ /g, ''))}</div>
    <section class="sec rv" style="--d:2"><h3>${t('Available Services')}</h3><div class="group">${linkRow('statement', t('Transaction Statement'), '', 'statements')}${linkRow('info', t('Account Details'), '', 'statements')}${linkRow('request', t('Ask someone to pay you'), '', 'request')}${linkRow('split-bill', t('Split a bill'), '', 'split')}</div></section>
    <div class="thead"><h2>${t('Transactions')}</h2><a role="button" data-go="history">${t('All')}</a></div><div class="group">${TX.slice(0, 5).map(txRow).join('')}</div>`
  };
});
A.copy = () => toast(T('Copied to clipboard', 'Copié', 'تم النسخ'), 'copy');
reg('statements', () => ({ title: t('Statements'), body: `<div class="group" style="margin-top:8px">${['October 2026', 'September 2026', 'August 2026', 'July 2026'].map((m, i) => `<button class="row" data-act="dl"><span class="tile">${ic('pdf')}</span><div class="tx"><b>${T(m, m.replace('October', 'Octobre').replace('September', 'Septembre').replace('August', 'Août').replace('July', 'Juillet'), ['أكتوبر', 'سبتمبر', 'أغسطس', 'يوليو'][i] + ' 2026')}</b><small>PDF · <span class="num">${120 + i * 11}</span> KB</small></div>${ic('download', 'muted')}</button>`).join('')}</div>` }));
A.dl = () => toast(T('Statement saved (demo)', 'Relevé enregistré (démo)', 'تم حفظ الكشف (عرض)'), 'download');
