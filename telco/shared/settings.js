// Settings, About and Notifications shared by both apps: same controls, same words. The app supplies its own account rows.
import * as C from './core.js';
const { t, ic, esc, msisdn, toast, heroBar, lockup } = C;

export function install(h) {
  const { page, S, store, avatar, rows, kyc, signout, markBig, aboutKey, notifs } = h;
  const link = (href, f, i, k, sub) => `<a class="item" href="#/${href}"><span class="lead ${f}">${ic(i)}</span><div><div class="t">${t(k)}</div>${sub ? `<div class="s">${sub}</div>` : ''}</div><span class="chev end">${ic('chevron-right', 'flip')}</span></a>`;

  function me(ctx) {
    const s = S(), d = C.prefs(), k = kyc(s);
    page(`<div class="hero compact"><div class="rings"></div><div class="hrow">${lockup(30)}</div>
        <div class="row" style="gap:16px;margin-top:18px"><span class="avatar" style="width:72px;height:72px;font-size:24px">${avatar()}</span><div style="min-width:0"><div class="disp" style="font-size:24px;line-height:1.1">${esc(s.profile.name || s.name)}</div><div class="sm" style="opacity:.9;margin-top:2px"><span class="num" dir="ltr">${msisdn(s.num)}</span></div><span class="badge ${k.ok ? 'ok' : 'warn'}" style="margin-top:8px">${ic('shield-check', 'sm')} ${t(k.key)}</span></div></div></div>
      <div class="sheetbody"><div class="sec stagger" style="padding-top:20px">
        <div class="list">${rows(link)}</div>
        <div class="list">
          <div class="item" style="flex-direction:column;align-items:stretch;gap:10px"><div class="t">${ic('language', 'sm')} ${t('st.lang')}</div><div class="seg full">${['en', 'ar', 'fr'].map(l => `<button data-l="${l}" aria-pressed="${d.lang === l}" lang="${l}">${{ en: 'English', ar: 'العربية', fr: 'Français' }[l]}</button>`).join('')}</div></div>
          <div class="item" style="flex-direction:column;align-items:stretch;gap:10px"><div class="t">${ic('sun', 'sm')} ${t('st.theme')}</div><div class="seg full"><button data-th="light" aria-pressed="${d.theme === 'light'}">${t('panel.light')}</button><button data-th="dark" aria-pressed="${d.theme === 'dark'}">${t('panel.dark')}</button></div></div>
          <div class="item"><span class="lead f2">${ic('eye-off')}</span><div class="t" style="flex:1">${t('st.hide')}</div><button class="switch" id="hsw" role="switch" aria-checked="${!!s.hide}" aria-label="${t('st.hide')}"></button></div>
          <div class="item"><span class="lead f3">${ic('lock')}</span><div class="t" style="flex:1">${t('st.sec')}</div><button class="switch" id="bsw" role="switch" aria-checked="${s.bio}" aria-label="${t('st.sec')}"></button></div>
          <div class="item" style="flex-direction:column;align-items:stretch;gap:8px"><div class="row"><span class="lead f2">${ic('download')}</span><div style="flex:1"><div class="t">${t('st.offline')}</div><div class="s">${t('st.offline_s')}</div></div></div><div class="bar" id="opb" style="height:8px;display:none"><i style="width:0%;animation:none;transition:width .3s"></i></div><button class="btn tonal sm" id="opk">${ic('download', 'sm')} ${t('st.offline')}</button></div>
        </div>
        <div class="list">${link('me/about', '', 'info', 'st.about')}<button class="item" data-act="signout"><span class="lead err">${ic('logout')}</span><div class="t">${t('st.signout')}</div></button></div>
      </div></div>`, { tab: 'me', ctx });
    C.$$('[data-l]').forEach(b => b.addEventListener('click', () => C.setPrefs({ lang: b.dataset.l })));
    C.$$('[data-th]').forEach(b => b.addEventListener('click', () => C.setPrefs({ theme: b.dataset.th })));
    C.$('#hsw').addEventListener('click', e => { store.set(x => { x.hide = !x.hide; }); e.currentTarget.setAttribute('aria-checked', !!S().hide); });
    C.$('#bsw').addEventListener('click', e => { store.set(x => { x.bio = !x.bio; }); e.currentTarget.setAttribute('aria-checked', S().bio); });
    const op = C.$('#opk'); C.offlineReady().then(r => { if (r) { op.innerHTML = `${ic('success-check', 'sm')} ${t('st.offline_ok')}`; op.disabled = true; } });
    op.addEventListener('click', async () => { op.disabled = true; const b = C.$('#opb'); b.style.display = 'block'; await C.downloadOfflinePack(p => { b.firstChild.style.width = Math.round(p * 100) + '%'; }); op.innerHTML = `${ic('success-check', 'sm')} ${t('st.offline_ok')}`; toast(t('st.offline_ok')); });
  }
  C.actions.signout = signout;
  C.actions.doc = b => C.sheet(`<h3>${t(b.dataset.k)}</h3><p class="muted">${t(b.dataset.k + '_b', { op: esc(C.loc(h.op.name)), app: esc(C.loc(h.op.app)) })}</p><button class="btn block" data-close>${t('c.close')}</button>`);

  function about(ctx) {
    page(`${heroBar(t('st.about'), { back: 'me' })}<div class="sec" style="align-items:center;text-align:center;gap:10px;padding-top:6px"><div class="vcard" style="width:96px;height:96px;min-height:0;padding:0;border-radius:30px;display:grid;place-items:center">${markBig(56)}</div><h2 class="disp" style="font-size:26px">${esc(C.loc(h.op.app))}</h2><p class="muted">${t('st.version', { v: '2.4.0' })}</p>
      <div class="list" style="width:100%;text-align:start;margin-top:14px">${['st.terms', 'st.privacy', 'st.support'].map(k => `<button class="item" data-act="doc" data-k="${k}"><div class="t">${t(k)}</div><span class="chev end">${ic('chevron-right', 'flip')}</span></button>`).join('')}</div>
      <p class="legal" style="margin-top:18px">${t(aboutKey)}</p><p class="tiny muted" style="margin-top:6px;font-weight:600">Neptune</p></div>`, { ctx });
  }

  function notifications(ctx) {
    page(`${heroBar(t('n.title'))}<div class="sec"><div class="txg">${notifs.map(([k, i, g], n) => `<div class="tx"><span class="gly ${g}">${ic(i)}</span><div class="t" style="font-weight:600;flex:1">${t(k)}</div><span class="tiny muted">${C.ago(Date.now() - (n + 1) * 36e5)}</span></div>`).join('')}</div></div>`, { ctx });
  }
  return { me, about, notifications, link };
}

C.add({
  'st.lang': ['Language', 'اللغة', 'Langue'], 'st.theme': ['Appearance', 'المظهر', 'Apparence'], 'st.hide': ['Hide balances', 'إخفاء الأرصدة', 'Masquer les soldes'], 'st.sec': ['PIN and biometrics', 'رمز PIN والبصمة', 'PIN et biométrie'],
  'st.offline': ['Offline pack', 'حزمة دون اتصال', 'Pack hors connexion'], 'st.offline_ok': ['Saved for offline use', 'محفوظة للاستخدام دون اتصال', 'Enregistré hors connexion'], 'st.offline_s': ['Save the identity check for use without a connection', 'احفظ فحص الهوية للاستخدام دون اتصال', 'Enregistrer la vérification d’identité pour l’utiliser hors connexion'],
  'st.about': ['About', 'حول التطبيق', 'À propos'], 'st.signout': ['Sign out', 'تسجيل الخروج', 'Se déconnecter'], 'st.version': ['Version {v}', 'الإصدار {v}', 'Version {v}'], 'st.terms': ['Terms of use', 'شروط الاستخدام', 'Conditions d’utilisation'], 'st.privacy': ['Privacy notice', 'إشعار الخصوصية', 'Avis de confidentialité'], 'st.support': ['Help and support', 'المساعدة والدعم', 'Aide et assistance'],
  'st.terms_b': ['{app} is an electronic wallet run by {op}. Your balance is held for you and can be cashed out at any time. Payments you approve with your PIN or face are final once confirmed.', '{app} محفظة إلكترونية يشغّلها {op}. رصيدك محفوظ لك ويمكنك سحبه في أي وقت. المدفوعات التي تعتمدها برمزك أو بوجهك نهائية بعد تأكيدها.', '{app} est un portefeuille électronique géré par {op}. Votre solde vous appartient et peut être retiré à tout moment. Les paiements validés par PIN ou visage sont définitifs une fois confirmés.'],
  'st.privacy_b': ['Passport and selfie photos are checked on this phone. We keep your name, number and transactions to run the wallet and meet the law, and never sell them.', 'تُفحص صور الجواز والسيلفي على هذا الهاتف. نحتفظ باسمك ورقمك ومعاملاتك لتشغيل المحفظة والالتزام بالقانون، ولا نبيعها أبداً.', 'Les photos du passeport et du selfie sont vérifiées sur ce téléphone. Nous conservons votre nom, numéro et opérations pour faire fonctionner le portefeuille et respecter la loi, sans jamais les vendre.'],
  'st.support_b': ['Call 111 free from your {op} line, any time, or visit any agent with your passport.', 'اتصل مجاناً بالرقم 111 من خط {op} في أي وقت، أو زر أي وكيل ومعك جواز سفرك.', 'Appelez gratuitement le 111 depuis votre ligne {op}, à toute heure, ou rendez-vous chez un agent avec votre passeport.'],
  'n.title': ['Notifications', 'الإشعارات', 'Notifications'],
});
