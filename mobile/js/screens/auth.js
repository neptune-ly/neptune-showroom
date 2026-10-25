import { $, $$, S, L, t, T, spark, ic, icf, anim, sheet, toast, confetti, haptic, sleep, esc, logo, num, moneyTxt, reduced, cur } from '../util.js';
import { reg, go, back, tab, A, applyLang, rerender } from '../app.js';
import { bankName, uname, USER, BANKS, RATES } from '../data.js';
import { tx } from '../util.js';

L([
  ['Welcome back', 'Bon retour', 'أهلاً بعودتك'], ['Hello, {name}', 'Bonjour, {name}', 'مرحباً، {name}'], ['Sign in with biometrics', 'Se connecter avec la biométrie', 'الدخول بالبصمة'],
  ['Use passcode', 'Utiliser le code', 'استخدم رمز المرور'], ['Open an account', 'Ouvrir un compte', 'افتح حساباً'], ['Forgot passcode?', 'Code oublié ?', 'نسيت الرمز؟'],
  ['Enter your passcode', 'Saisissez votre code', 'أدخل رمز المرور'], ['Demo: any 6 digits work', 'Démo : 6 chiffres au choix', 'عرض: أي 6 أرقام تعمل'],
  ['Touch the sensor', 'Touchez le capteur', 'المس المستشعر'], ['Verifying…', 'Vérification…', 'جارٍ التحقق…'], ['Verified', 'Vérifié', 'تم التحقق'], ['Cancel', 'Annuler', 'إلغاء'],
  ['Exchange rates', 'Taux de change', 'أسعار الصرف'], ['Branches & ATMs', 'Agences et DAB', 'الفروع والصرافات'], ['Help & support', 'Aide et assistance', 'المساعدة والدعم'], ['Indicative rates for demonstration only', 'Taux indicatifs, démonstration uniquement', 'أسعار إرشادية للعرض فقط'], ['Buy', 'Achat', 'شراء'], ['Sell', 'Vente', 'بيع'], ['Call', 'Appeler', 'اتصال'], ['Chat', 'Discuter', 'محادثة'],
  ['Powered by', 'Propulsé par', 'مدعوم من'], ['Secure sign-in', 'Connexion sécurisée', 'دخول آمن'], ['Back to sign in', 'Retour à la connexion', 'العودة لتسجيل الدخول'],
  ['Open an account in minutes', 'Ouvrez un compte en quelques minutes', 'افتح حساباً في دقائق'], ['Scan your passport', 'Scannez votre passeport', 'امسح جواز سفرك'], ['Take a selfie', 'Prenez un selfie', 'التقط صورة شخصية'],
  ['Confirm your details', 'Confirmez vos informations', 'أكّد بياناتك'], ['Choose your account', 'Choisissez votre compte', 'اختر حسابك'], ['Start', 'Commencer', 'ابدأ'], ['Identity check by the Polaris module', 'Vérification d\'identité par le module Polaris', 'التحقق من الهوية عبر وحدة بولاريس'],
  ['About 4 minutes. Have your passport ready.', 'Environ 4 minutes. Préparez votre passeport.', 'حوالي 4 دقائق. جهّز جواز سفرك.'], ['Account opening', 'Ouverture de compte', 'فتح حساب'],
  ['Liveness and document capture are provided by the Polaris onboarding module in the full showroom.', 'La capture du document et de la vivacité est assurée par le module d\'intégration Polaris dans le showroom complet.', 'يتم التقاط الوثيقة والتحقق الحي عبر وحدة بولاريس في العرض الكامل.'],
  ['Confirm payment', 'Confirmer le paiement', 'تأكيد الدفع'], ['Authorise', 'Autoriser', 'تفويض'], ['One-time code', 'Code à usage unique', 'رمز لمرة واحدة'], ['Code detected from SMS', 'Code détecté par SMS', 'تم اكتشاف الرمز من الرسالة'],
  ['Resend in {s}s', 'Renvoyer dans {s} s', 'إعادة الإرسال خلال {s} ث'], ['Approve with biometrics', 'Approuver par biométrie', 'الموافقة بالبصمة'], ['We sent a 6-digit code to your phone ending 4821', 'Un code à 6 chiffres a été envoyé au téléphone se terminant par 4821', 'تم إرسال رمز من 6 أرقام إلى الهاتف المنتهي بـ 4821'],
  ['App locked', 'Application verrouillée', 'التطبيق مقفل'], ['Unlock', 'Déverrouiller', 'فتح القفل'], ['Hold near the terminal', 'Approchez du terminal', 'قرّب من الجهاز'], ['Ready to pay', 'Prêt à payer', 'جاهز للدفع'],
  ['Payment complete', 'Paiement effectué', 'تم الدفع'], ['Done', 'Terminé', 'تم'], ['Contactless', 'Sans contact', 'اللاتلامسي'], ['Using {card}', 'Avec {card}', 'باستخدام {card}'],
]);

const PIN = 6;
const monogram = () => `<span class="mono">${esc(BANKS[Looks.get()][0][0])}</span>`;

reg('login', () => ({
  bar: false, sbHero: true,
  body: `<div class="login">
    <div class="lg-hero">
      <div class="lg-top"><div class="seg-lang" role="group">${['en', 'fr', 'ar'].map(l => `<button data-act="setlang" data-l="${l}" aria-pressed="${S.lang === l}">${l.toUpperCase()}</button>`).join('')}</div></div>
      <div class="lg-brand rv" style="--d:1">${monogram()}<div><b class="disp">${esc(bankName())}</b><small>${t('Secure sign-in')}</small></div></div>
    </div>
    <div class="lg-card" id="lgc">
      <div class="lg-av rv" style="--d:2"><span class="av brand">L</span><div><small class="muted">${t('Welcome back')}</small><h2 class="disp">${t('Hello, {name}', { name: tx(USER.first) })}</h2></div></div>
      <button class="btn rv" style="--d:3" data-act="bio">${ic('fingerprint')}<span>${t('Sign in with biometrics')}</span></button>
      <button class="btn tonal rv" style="--d:4;margin-top:10px" data-act="pin">${ic('lock')}<span>${t('Use passcode')}</span></button>
      <div class="lg-links rv" style="--d:5"><button class="link" data-go="onboarding">${t('Open an account')}</button><button class="link" data-act="forgot">${t('Forgot passcode?')}</button></div>
    </div>
    <div class="lg-foot"><small>${t('Powered by')}</small>${logo()}<small class="demo">${t('Demonstration — simulated data')}</small></div>
  </div>`,
}));

A.pubfx = () => sheet(`<h2>${t('Exchange rates')}</h2><p class="sub">${t('Indicative rates for demonstration only')}</p><div class="group" style="margin:8px 0 0">${RATES.map(x => `<div class="row"><span class="av f1 num">${x[0]}</span><div class="tx"><b>${x[0]}</b><small>${t('Buy')} <span class="num">${x[1]}</span> · ${t('Sell')} <span class="num">${x[2]}</span></small></div><span>${spark(x[3], x[3][6] >= x[3][0])}</span></div>`).join('')}</div>`);
A.pubbr = () => sheet(`<h2>${t('Branches & ATMs')}</h2><div class="group" style="margin:12px 0 0">${[['Downtown branch', 'فرع وسط المدينة', '0.8'], ['Harbor ATM', 'صراف الميناء', '1.2'], ['Airport road branch', 'فرع طريق المطار', '3.4']].map((b, i) => `<div class="row"><span class="tile ${['', 'f2', 'f3'][i]}">${ic(i === 1 ? 'atm' : 'location')}</span><div class="tx"><b>${T(b[0], b[0], b[1])}</b><small><span class="num">${b[2]}</span> km</small></div></div>`).join('')}</div>`);
A.pubhelp = () => sheet(`<h2>${t('Help & support')}</h2><div class="actions" style="padding-top:12px"><button class="btn tonal" data-close="x">${ic('phone')}${t('Call')} <span class="num">+218 21 555 0100</span></button><button class="btn tonal" data-close="x">${ic('chat')}${t('Chat')}</button></div>`);
A.setlang = el => applyLang(el.dataset.l);
A.forgot = () => toast(T('Reset link sent (demo)', 'Lien envoyé (démo)', 'تم إرسال رابط الاستعادة (عرض)'), 'mail');

export function enter() { S.authed = true; tab('home'); setTimeout(() => confetti && 0, 0) }

export function bioSheet(done, msg) {
  const s = sheet(`<div class="bio"><div class="bio-ring"><svg viewBox="0 0 120 120" width="120" height="120"><circle cx="60" cy="60" r="54" fill="none" stroke="var(--look-field-1)" stroke-width="6"/><circle class="arc" cx="60" cy="60" r="54" fill="none" stroke="var(--look-brand)" stroke-width="6" stroke-linecap="round" stroke-dasharray="340" stroke-dashoffset="340" transform="rotate(-90 60 60)"/></svg><div class="bio-ic">${ic('fingerprint', 'xl')}</div><i class="pulse"></i><i class="pulse p2"></i></div>
    <h2 id="bt">${t('Touch the sensor')}</h2><p class="sub" id="bs">${esc(msg || bankName())}</p><button class="btn text" data-close="x">${t('Cancel')}</button></div>`, {
    onClose: v => { if (v === 'ok') done && done() }, mount(sh, close) {
      const arc = $('.arc', sh); setTimeout(async () => {
        $('#bt', sh).textContent = t('Verifying…'); const a = arc.animate([{ strokeDashoffset: 340 }, { strokeDashoffset: 0 }], { duration: reduced() ? 1 : 900, easing: 'ease-out', fill: 'forwards' }); await a.finished.catch(() => {});
        if (!sh.isConnected) return; sh.classList.add('okd'); $('.bio-ic', sh).innerHTML = ic('success-check', 'xl'); $('#bt', sh).textContent = t('Verified'); haptic(20); await sleep(650); close('ok');
      }, 1300);
    }
  });
}
A.bio = () => bioSheet(enter, T('Sign in to', 'Se connecter à', 'تسجيل الدخول إلى') + ' ' + bankName());

A.pin = () => {
  const c = $('#lgc'); let v = '';
  c.innerHTML = `<div class="pin"><h2 class="disp" style="text-align:center">${t('Enter your passcode')}</h2><div class="dots" aria-hidden="true">${'<i></i>'.repeat(PIN)}</div><small class="muted" style="text-align:center;display:block">${t('Demo: any 6 digits work')}</small>
    <div class="keys">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 'b', 0, 'x'].map(k => k === 'b' ? `<button data-k="fp" aria-label="biometrics">${ic('fingerprint')}</button>` : k === 'x' ? `<button data-k="del" aria-label="delete">${icf('arrow-left')}</button>` : `<button data-k="${k}">${k}</button>`).join('')}</div>
    <button class="btn text" data-act="unpin" style="margin:6px auto 0;display:flex">${t('Back to sign in')}</button></div>`;
  anim(c.firstElementChild, [{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 450 });
  c.onclick = e => {
    const b = e.target.closest('[data-k]'); if (!b) return; const k = b.dataset.k; haptic(6);
    if (k === 'fp') return A.bio(); if (k === 'del') v = v.slice(0, -1); else if (v.length < PIN) v += k;
    $$('.dots i', c).forEach((d, i) => d.classList.toggle('f', i < v.length));
    if (v.length === PIN) { $('.dots', c).classList.add('ok'); setTimeout(enter, 420) }
  };
};
A.unpin = () => tab('login');

/* onboarding: the live Polaris module (single path constant; the build script stages shared/ next to this folder) */
export const POLARIS_URL = '../shared/polaris/polaris.js';
reg('onboarding', () => ({
  title: t('Account opening'), body: `<div class="pl-host" id="plh"></div>`,
  async mount(el) {
    const host = $('#plh', el); let P;
    try { P = await import(/* @vite-ignore */ new URL(POLARIS_URL, document.baseURI).href) } catch (e) { host.innerHTML = `<div class="empty"><b>${t('Identity check by the Polaris module')}</b><small>${t('Liveness and document capture are provided by the Polaris onboarding module in the full showroom.')}</small></div>`; return }
    el.classList.add('pl-full'); const p = P.mount(host, { lang: S.lang, camera: 'auto', continueLabel: T('Continue', 'Continuer', 'متابعة') }); window.polaris = p; el._pl = p;
    p.on('result', e => { window.lastResult = e }); p.on('close', () => { p.destroy(); window.polaris = null; back() });
    p.on('continue', e => { const r = window.lastResult || e || {}; if (r.decision === 'accepted') { p.destroy(); window.polaris = null; go('onb-done', { doc: r.document || {}, mode: r.mode }) } else if (r.decision === 'review') { p.destroy(); window.polaris = null; back(); setTimeout(() => toast(T('Sent for manual review. We will contact you.', 'Envoyé pour vérification manuelle. Nous vous contacterons.', 'تم الإرسال للمراجعة اليدوية وسنتواصل معك.'), 'info'), 400) } else { p.restart() } });
  }
}));
reg('onb-done', ({ doc }) => {
  const f = (doc && (doc.fields || doc)) || {}; const nm = [f.givenNames || f.given || '', f.surname || ''].join(' ').trim();
  return { bar: false, body: `<div class="done"><svg class="ck" viewBox="0 0 120 120"><circle class="c1" cx="60" cy="60" r="52" fill="none" stroke="var(--ok)" stroke-width="7" pathLength="1"/><path class="c2" d="M38 62 54 78 84 44" fill="none" stroke="var(--ok)" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" pathLength="1"/></svg>
    <h1 class="rv" style="--d:3">${t('Account created')}</h1><p class="muted rv" style="--d:4">${t('Identity verified on this device.')}</p>
    <div class="group rv" style="--d:5"><div class="row kvr"><div class="tx"><small>${t('Account holder')}</small><b>${esc(nm || uname())}</b></div></div><div class="row kvr"><div class="tx"><small>${t('Account')}</small><b>${tx(['Current account', 'Compte courant', 'الحساب الجاري'])} · <span class="num">•• 4821</span></b></div></div><div class="row kvr"><div class="tx"><small>${t('Bank')}</small><b>${esc(bankName())}</b></div></div></div>
    <div class="actions"><button class="btn" data-act="enterapp">${t('Continue')}</button></div></div>`, mount(el) { $('.ck', el).classList.add('go') } };
});
A.enterapp = () => enter();
L([['Account created', 'Compte créé', 'تم إنشاء الحساب'], ['Identity verified on this device.', 'Identité vérifiée sur cet appareil.', 'تم التحقق من الهوية على هذا الجهاز.'], ['Account holder', 'Titulaire du compte', 'صاحب الحساب'], ['Account', 'Compte', 'الحساب'], ['Bank', 'Banque', 'المصرف'], ['Continue', 'Continuer', 'متابعة']]);

/* transaction authorisation sheet with OTP — resolves true on confirm */
export function authorize({ title, rows = [], amount, ccy = 'LYD', cta }) {
  return new Promise(res => {
    let ok = false;
    sheet(`<div class="auth"><div class="tile brand r" style="margin:0 auto">${ic('security-shield', 'l')}</div><h2>${title || t('Confirm payment')}</h2>${amount != null ? `<div class="amt disp">${num(amount)} <small>${cur(ccy)}</small></div>` : ''}
      <div class="kv">${rows.map(r => `<div><span>${esc(r[0])}</span><b>${r[1]}</b></div>`).join('')}</div>
      <div class="otp-l">${t('One-time code')}</div><div class="otp" dir="ltr">${'<i></i>'.repeat(6)}</div>
      <p class="sub" id="otpm">${t('We sent a 6-digit code to your phone ending 4821')}</p>
      <button class="btn" id="ok" disabled>${cta || t('Authorise')}</button><button class="btn text" data-act="bioauth" style="margin:6px auto 0;display:flex">${ic('fingerprint', 's')}${t('Approve with biometrics')}</button></div>`, {
      onClose: () => res(ok), mount(sh, close) {
        const boxes = $$('.otp i', sh), code = '482913'; let i = 0;
        const fill = () => { if (!sh.isConnected) return; if (i < 6) { boxes[i].textContent = code[i]; boxes[i].classList.add('f'); haptic(5); i++; setTimeout(fill, reduced() ? 5 : 150) } else { $('#otpm', sh).innerHTML = `<span class="pos">${ic('success-check', 's')} ${t('Code detected from SMS')}</span>`; $('#ok', sh).disabled = false } };
        setTimeout(fill, 900);
        $('#ok', sh).onclick = async () => { const b = $('#ok', sh); b.classList.add('busy'); await sleep(700); ok = true; close('ok') };
        $('[data-act=bioauth]', sh).onclick = () => { if (i < 6) return; $('#ok', sh).click() };
      }
    });
  });
}

/* app lock */
A.lock = () => {
  const host = $('.app'); if ($('.lockov')) return; const o = document.createElement('div'); o.className = 'lockov';
  o.innerHTML = `<div class="lk"><span class="mono lg">${esc(BANKS[Looks.get()][0][0])}</span><h2 class="disp">${t('App locked')}</h2><p>${esc(bankName())}</p><button class="btn accent" data-u style="max-width:260px">${ic('fingerprint')}${t('Unlock')}</button></div>`;
  host.append(o); anim(o, [{ opacity: 0 }, { opacity: 1 }], { duration: 300 });
  $('[data-u]', o).onclick = () => bioSheet(() => anim(o, [{ opacity: 1 }, { opacity: 0 }], { duration: 300 }).finished.then(() => o.remove()), T('Unlock', 'Déverrouiller', 'فتح القفل'));
};

/* contactless tap sheet */
A.tap = () => {
  sheet(`<div class="tap"><h2>${t('Contactless')}</h2><p class="sub" id="tp">${t('Hold near the terminal')}</p>
    <div class="tap-stage"><i class="w w1"></i><i class="w w2"></i><i class="w w3"></i><div class="mini-card">${ic('contactless', 'l')}<b class="num">•••• 4821</b></div></div>
    <small class="muted" style="display:block;text-align:center">${t('Using {card}', { card: T('Everyday debit', 'Débit quotidien', 'بطاقة الخصم اليومية') })}</small><button class="btn text" data-close="x" style="margin:12px auto 0;display:flex">${t('Cancel')}</button></div>`, {
    mount(sh, close) {
      setTimeout(async () => { if (!sh.isConnected) return; sh.classList.add('paid'); $('.tap-stage', sh).innerHTML = `<div class="tile ok r" style="width:96px;height:96px;margin:auto">${ic('success-check', 'xl')}</div>`; $('#tp', sh).innerHTML = `${t('Payment complete')}<br><b class="num">${moneyTxt(24)}</b> · Blue Harbor Café`; haptic(30); await sleep(2200); close() }, 2600);
    }
  });
};
