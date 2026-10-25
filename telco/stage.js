// Telco showroom stage: both apps side by side, linked preferences (language, theme, look), replay onboarding in both.
import * as C from './shared/core.js';
const { t, ic, esc } = C;
C.add({
  'st.title': ['Neptune for Telco', 'نبتون للاتصالات', 'Neptune pour opérateurs'], 'st.sub': ['Two installable apps, both led by Polaris on-device onboarding. Simulated data, invented operators.', 'تطبيقان قابلان للتثبيت يبدآن بتسجيل بولاريس على الجهاز. بيانات محاكاة ومشغّلان مُختلقان.', 'Deux apps installables, toutes deux ouvertes par l’inscription Polaris sur l’appareil. Données simulées, opérateurs fictifs.'],
  'st.mobile': ['Neptune Mobile for Telco', 'نبتون موبايل للاتصالات', 'Neptune Mobile pour opérateurs'], 'st.mobile_d': ['Lumo Pay · SIM/eSIM-linked wallet, bundles, bills, QR, cards, rewards', 'لومو باي · محفظة مرتبطة بالشريحة وباقات وفواتير ورمز QR وبطاقات ومكافآت', 'Lumo Pay · portefeuille lié à la SIM/eSIM, forfaits, factures, QR, cartes, avantages'],
  'st.vega': ['Neptune Vega for Telco', 'نبتون فيغا للاتصالات', 'Neptune Vega pour opérateurs'], 'st.vega_d': ['Sahar Cash · wallet-first money with agents, cash-in/out and savings pots', 'سحر كاش · محفظة أولاً مع وكلاء وإيداع وسحب وحصّالات ادخار', 'Sahar Cash · portefeuille avant tout, agents, dépôt/retrait et cagnottes'],
  'st.alone': ['open alone', 'فتح منفرداً', 'ouvrir seul'], 'st.script': ['A 4-minute walkthrough', 'جولة من 4 دقائق', 'Un parcours de 4 minutes'],
  'st.s1': ['Press Get started in either phone, enter the demo code.', 'اضغط ابدأ في أي هاتف وأدخل الرمز التجريبي.', 'Appuyez sur Commencer dans un téléphone, saisissez le code démo.'],
  'st.s2': ['Polaris: allow the camera, or choose the demo camera. Capture the passport, read the MRZ, do the live selfie moves.', 'بولاريس: اسمح بالكاميرا أو اختر كاميرا العرض. صوّر الجواز واقرأ MRZ ونفّذ حركات السيلفي.', 'Polaris : autorisez la caméra ou choisissez la caméra démo. Photographiez le passeport, lisez la MRZ, faites les gestes du selfie.'],
  'st.s3': ['Watch the face match score, then the SIM or eSIM activation animation.', 'شاهد درجة مطابقة الوجه ثم حركة تفعيل الشريحة أو الشريحة الرقمية.', 'Observez le score de correspondance puis l’animation d’activation SIM ou eSIM.'],
  'st.s4': ['Lumo Pay: send, buy a bundle, pay by QR, freeze the card. Sahar Cash: cash in at an agent, then switch to agent mode to confirm.', 'لومو باي: حوّل واشترِ باقة وادفع بالرمز وجمّد البطاقة. سحر كاش: أودع لدى وكيل ثم بدّل إلى وضع الوكيل للتأكيد.', 'Lumo Pay : envoyez, achetez un forfait, payez par QR, gelez la carte. Sahar Cash : déposez chez un agent puis passez en mode agent pour confirmer.'],
  'st.s5': ['Switch language, theme and look at the top. Everything follows in both phones.', 'بدّل اللغة والمظهر والهوية من الأعلى فيتبع التطبيقان.', 'Changez langue, thème et apparence en haut : les deux téléphones suivent.'],
  'st.honest': ['Polaris identity checks run on this device. They are demo-grade, not a certified biometric or liveness system.', 'تعمل فحوص هوية بولاريس على هذا الجهاز. هي بمستوى العرض وليست نظام قياسات حيوية أو كشف حيوية معتمداً.', 'Les vérifications d’identité Polaris s’exécutent sur cet appareil. Elles sont de niveau démonstration, pas un système biométrique ou de détection de vivacité certifié.'],
  'st.polaris': ['Polaris module alone', 'وحدة بولاريس منفردة', 'Module Polaris seul'], 'st.replay': ['Replay onboarding in both', 'أعد التسجيل في التطبيقين', 'Rejouer l’inscription dans les deux'],
});
const dark = () => C.prefs().theme === 'dark';
function paint() {
  const P = C.prefs();
  document.title = t('st.title') + ' · Showroom';
  document.body.innerHTML = `<header class="st-head"><div class="brand"><img src="${dark() ? C.LOGO.rev : C.LOGO.color}" alt="Neptune"><h1>${t('st.title')}</h1></div><span class="sub">${t('st.sub')}</span><span class="sp" style="flex:1"></span>
    <div class="seg" role="group" aria-label="${t('panel.language')}">${['en', 'ar', 'fr'].map(l => `<button data-lang="${l}" aria-pressed="${P.lang === l}" lang="${l}">${{ en: 'English', ar: 'العربية', fr: 'Français' }[l]}</button>`).join('')}</div>
    <div id="looks"></div>
    <button class="btn tonal sm" data-theme-toggle>${ic(dark() ? 'sun' : 'moon', 'sm')} ${t(dark() ? 'panel.light' : 'panel.dark')}</button>
    <button class="btn sm" data-replay>${ic('refresh', 'sm')} ${t('st.replay')}</button></header>
  <main class="st-body"><section class="st-dev"><div class="cap">${ic('phone', 'sm')}<span>${t('st.mobile')}</span><a href="mobile/" target="_blank" rel="noopener">${t('st.alone')}</a></div><div class="frame"><span class="notch"></span><iframe title="${esc(t('st.mobile'))}" src="mobile/?embed=1" allow="camera"></iframe></div></section>
  <aside class="st-side"><span class="pill">${ic('shield-check', 'sm')} Polaris</span><h2>${t('st.script')}</h2><ol>${[1, 2, 3, 4, 5].map(i => `<li>${t('st.s' + i)}</li>`).join('')}</ol><p class="legal" style="text-align:start">${t('st.honest')}</p><a class="btn text sm" href="../shared/polaris/demo.html" target="_blank" rel="noopener" style="align-self:flex-start;padding:0">${t('st.polaris')}</a></aside>
  <section class="st-dev"><div class="cap">${ic('wallet', 'sm')}<span>${t('st.vega')}</span><a href="vega/" target="_blank" rel="noopener">${t('st.alone')}</a></div><div class="frame"><span class="notch"></span><iframe title="${esc(t('st.vega'))}" src="vega/?embed=1" allow="camera"></iframe></div></section></main>
  <nav class="st-cards" aria-label="apps"><a class="pocket" href="mobile/"><span>${ic('phone', 'xl')}</span><b>${t('st.mobile')}</b><span class="sm">${t('st.mobile_d')}</span></a><a class="pocket f3" href="vega/"><span>${ic('wallet', 'xl')}</span><b>${t('st.vega')}</b><span class="sm">${t('st.vega_d')}</span></a><p class="legal">${t('st.honest')}</p></nav>`;
  if (globalThis.Looks) globalThis.Looks.mount(document.getElementById('looks'), { label: t('panel.look') });
  fit();
}
function fit() { const h = innerHeight - (document.querySelector('.st-head')?.offsetHeight || 64) - 70, w = innerWidth - (innerWidth > 1300 ? 300 + 28 * 3 : 28 * 2) - 48; const z = Math.max(.35, Math.min(1, h / 852, w / (2 * 392 + 28))); document.documentElement.style.setProperty('--z', z.toFixed(3)); }
addEventListener('resize', fit);
document.addEventListener('click', e => {
  const l = e.target.closest('[data-lang]'); if (l) { C.setPrefs({ lang: l.dataset.lang }); return; }
  if (e.target.closest('[data-theme-toggle]')) { C.setPrefs({ theme: dark() ? 'light' : 'dark' }); return; }
  if (e.target.closest('[data-replay]')) { C.broadcast({ t: 'replay' }); }
});
C.applyPrefs(); paint(); C.onPrefs(() => { const k = document.querySelector('.st-head')?.nextElementSibling; paintKeepFrames(); });
// repaint only the chrome so the phones keep their state
function paintKeepFrames() {
  const ifr = [...document.querySelectorAll('iframe')]; const hold = ifr.map(f => f.cloneNode(false)); void hold;
  const head = document.querySelector('.st-head'), P = C.prefs();
  head.querySelector('.brand img').src = dark() ? C.LOGO.rev : C.LOGO.color; head.querySelector('h1').textContent = t('st.title'); head.querySelector('.sub').textContent = t('st.sub');
  head.querySelectorAll('[data-lang]').forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === P.lang));
  const tb = head.querySelector('[data-theme-toggle]'); tb.innerHTML = `${ic(dark() ? 'sun' : 'moon', 'sm')} ${t(dark() ? 'panel.light' : 'panel.dark')}`; head.querySelector('[data-replay]').innerHTML = `${ic('refresh', 'sm')} ${t('st.replay')}`;
  document.querySelectorAll('.st-dev .cap span').forEach((s, i) => { s.textContent = t(i ? 'st.vega' : 'st.mobile'); }); document.querySelectorAll('.st-dev .cap a').forEach(a => { a.textContent = t('st.alone'); });
  const side = document.querySelector('.st-side'); side.querySelector('h2').textContent = t('st.script'); side.querySelectorAll('li').forEach((li, i) => { li.textContent = t('st.s' + (i + 1)); }); side.querySelector('.legal').textContent = t('st.honest'); side.querySelector('.btn').textContent = t('st.polaris');
  document.querySelectorAll('.st-cards b').forEach((b, i) => { b.textContent = t(i ? 'st.vega' : 'st.mobile'); }); document.querySelectorAll('.st-cards .sm').forEach((b, i) => { b.textContent = t(i ? 'st.vega_d' : 'st.mobile_d'); });
}
C.registerSW('./sw.js');
