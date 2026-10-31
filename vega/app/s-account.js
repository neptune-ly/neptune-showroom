// Onboarding, lock, profile, KYC upgrade (Polaris hook), cards, settings, security, support chat, help.
import { tenantName, st, t, add, ic, esc, money, numT, ring, confetti, vegaLockup, vegaMark, neptuneLogo, LS, setLang, setTheme, fmtDate, RM } from '../assets/core.js';
import { qrV as qrSvg, vegaStar } from './brand.js';

import { reg, hdr, scr, row, avatar, nm, go, tab, back, sheet, closeSheet, toast, pin, processing, showSuccess, switchEl, wait, store, $, $$, rerender, refresh, rebuildTabbar } from './kit.js';
import { S, ME, NOTIFS, CARDS } from './data.js';

add({
  me_title: 'Me§Moi§حسابي', me_acct: 'Account§Compte§الحساب', me_prefs: 'Preferences§Préférences§التفضيلات', me_help: 'Help§Aide§المساعدة', me_id: 'Identity & limits§Identité et plafonds§الهوية والحدود', me_sec: 'Security§Sécurité§الأمان', me_set: 'Settings§Paramètres§الإعدادات', me_sup: 'Support chat§Chat d’assistance§محادثة الدعم', me_faq: 'Help centre§Centre d’aide§مركز المساعدة', me_out: 'Sign out§Se déconnecter§تسجيل الخروج', me_pw: 'Powered by Vega by Neptune§Propulsé par Vega by Neptune§بدعم من Vega by Neptune', me_since: 'Member since 2026§Membre depuis 2026§عضو منذ 2026',
  me_stat1: 'Payments§Paiements§مدفوعات', me_stat2: 'Saved§Épargné§المدّخر', me_stat3: 'Cashback§Remises§الاسترداد',
  k_title: 'Verify your identity§Vérifiez votre identité§وثّق هويتك', k_now: 'You are on {t}§Vous êtes au niveau {t}§أنت الآن في المستوى {t}', k_next: 'Upgrade to Verified§Passez à Vérifié§الترقية إلى موثّق', k_gain: 'Daily sending limit goes from {a} to {b}§Plafond d’envoi quotidien : de {a} à {b}§الحد اليومي للإرسال من {a} إلى {b}', k_req: 'What you need§Ce qu’il faut§ما تحتاجه', k_r1: 'Government ID photo§Photo de pièce d’identité§صورة الهوية الرسمية', k_r2: 'Selfie with liveness check§Selfie avec détection de vivacité§صورة شخصية مع فحص الحيوية', k_r3: 'Proof of address§Justificatif de domicile§إثبات العنوان', k_done: 'Done§Fait§تم', k_todo: 'To do§À faire§مطلوب', k_start: 'Start verification§Démarrer la vérification§ابدأ التوثيق', k_time: 'Takes about 3 minutes§Environ 3 minutes§تستغرق نحو 3 دقائق', k_priv: 'Your documents are encrypted and shared only with your provider§Vos documents sont chiffrés et partagés uniquement avec votre prestataire§مستنداتك مشفّرة وتُشارك مع مزوّدك فقط',
  kf_doc: 'Scan your ID§Scannez votre pièce d’identité§امسح هويتك', kf_doc_s: 'Place the card inside the frame§Placez la carte dans le cadre§ضع البطاقة داخل الإطار', kf_doc_ok: 'ID captured§Pièce capturée§تم التقاط الهوية', kf_face: 'Take a selfie§Prenez un selfie§التقط صورة شخصية', kf_face_s: 'Turn your head slowly to the left§Tournez lentement la tête vers la gauche§أدر رأسك ببطء إلى اليسار', kf_face_ok: 'Liveness confirmed§Vivacité confirmée§تم تأكيد الحيوية', kf_rev: 'Reviewing§Vérification§قيد المراجعة', kf_rev_s: 'Checking your documents§Contrôle de vos documents§نتحقق من مستنداتك', kf_c1: 'Document authenticity§Authenticité du document§أصالة المستند', kf_c2: 'Face match§Correspondance du visage§مطابقة الوجه', kf_c3: 'Screening§Filtrage§الفحص النظامي', kf_ok: 'Verified — Tier 2 unlocked§Vérifié — niveau 2 débloqué§تم التوثيق — فُتح المستوى 2', kf_ok_s: 'Your new limits are active now§Vos nouveaux plafonds sont actifs§حدودك الجديدة فعّالة الآن', kf_ph: 'Your documents are encrypted and used only to verify your identity.§Vos documents sont chiffrés et servent uniquement à vérifier votre identité.§مستنداتك مشفّرة وتُستخدم للتحقق من هويتك فقط.', kf_cap: 'Capture§Capturer§التقاط', kf_open: 'Open Polaris onboarding§Ouvrir Polaris§افتح وحدة Polaris',
  c_title: 'Cards§Cartes§البطاقات', c_virtual: 'Virtual§Virtuelle§افتراضية', c_physical: 'Physical§Physique§فعلية', c_freeze: 'Freeze card§Bloquer la carte§تجميد البطاقة', c_frozen: 'Frozen§Bloquée§مجمّدة', c_online: 'Online payments§Paiements en ligne§الدفع عبر الإنترنت', c_tap: 'Contactless§Sans contact§الدفع اللاتلامسي', c_atm: 'ATM withdrawals§Retraits DAB§السحب من الصراف', c_show: 'Show details§Afficher§إظهار التفاصيل', c_hide: 'Hide details§Masquer§إخفاء التفاصيل', c_num: 'Card number§Numéro de carte§رقم البطاقة', c_exp: 'Expiry§Expiration§الانتهاء', c_cvv: 'CVV§CVV§CVV', c_limits: 'Card limits§Plafonds de la carte§حدود البطاقة', c_wallet_s: 'Add to wallet§Ajouter§أضف للمحفظة', c_wallet: 'Add to phone wallet§Ajouter au portefeuille du téléphone§أضف إلى محفظة الهاتف', c_new: 'New card§Nouvelle carte§بطاقة جديدة', c_new_t: 'New virtual card§Nouvelle carte virtuelle§بطاقة افتراضية جديدة', c_order: 'Order physical§Commander§اطلب بطاقة فعلية', c_ship: 'On its way — arriving Thursday§En route — livraison jeudi§في الطريق — تصل الخميس', c_s1: 'Ordered§Commandée§تم الطلب', c_s2: 'Printed§Imprimée§تمت الطباعة', c_s3: 'Out for delivery§En livraison§قيد التوصيل', c_s4: 'Delivered§Livrée§تم التسليم', c_reveal_t: 'Hides in {s}s§Masqué dans {s} s§تُخفى خلال {s} ث', c_single: 'Single-use card§Carte à usage unique§بطاقة لمرة واحدة', c_sub: 'Subscription card§Carte abonnement§بطاقة اشتراكات', c_created: 'Virtual card created§Carte virtuelle créée§تم إنشاء البطاقة الافتراضية', c_holder: 'AMIRA HADDAD§AMIRA HADDAD§AMIRA HADDAD',
  set_title: 'Settings§Paramètres§الإعدادات', set_lang: 'Language§Langue§اللغة', set_theme: 'Appearance§Apparence§المظهر', set_look: 'Look§Style§المظهر', set_motion: 'Reduce motion§Réduire les animations§تقليل الحركة', set_notif: 'Notifications§Notifications§الإشعارات', set_n1: 'Payments & receipts§Paiements et reçus§المدفوعات والإيصالات', set_n2: 'Offers & rewards§Offres et récompenses§العروض والمكافآت', set_n3: 'Security alerts§Alertes de sécurité§تنبيهات الأمان', set_about: 'About§À propos§حول', set_ver: 'Vega by Neptune · v3.2§Vega by Neptune · v3.2§فيغا من نبتون · v3.2', set_replay: 'Replay onboarding§Revoir l’accueil§إعادة عرض الترحيب', set_dir: 'Text direction follows language§La direction suit la langue§اتجاه النص يتبع اللغة',
  sec_title: 'Security§Sécurité§الأمان', sec_pin: 'Change PIN§Changer le PIN§تغيير رمز PIN', sec_bio: 'Face ID & fingerprint§Face ID et empreinte§بصمة الوجه والإصبع', sec_2fa: 'Two-step verification§Vérification en deux étapes§التحقق بخطوتين', sec_dev: 'Trusted devices§Appareils de confiance§الأجهزة الموثوقة', sec_this: 'This phone§Ce téléphone§هذا الهاتف', sec_other: 'Last used 2 days ago§Utilisé il y a 2 jours§آخر استخدام قبل يومين', sec_rev: 'Remove§Retirer§إزالة', sec_lock: 'Lock app now§Verrouiller l’app§اقفل التطبيق الآن', sec_act: 'Recent sign-ins§Connexions récentes§عمليات الدخول الأخيرة', sec_score: 'Security strength§Niveau de sécurité§قوة الأمان', sec_strong: 'Strong§Fort§قوي', sec_removed: 'Device removed§Appareil retiré§تمت إزالة الجهاز',
  ch_title: 'Support§Assistance§الدعم', ch_online: 'Online · replies in a minute§En ligne · répond en une minute§متصلة · ترد خلال دقيقة', ch_hi: 'Hi {n}, I’m Sara from {b} support. How can I help today?§Bonjour {n}, je suis Sara du support {b}. Comment puis-je aider ?§مرحباً {n}، أنا سارة من دعم {b}. كيف أساعدك اليوم؟', ch_in: 'Type a message§Écrire un message§اكتب رسالة', ch_q1: 'Where is my money?§Où est mon argent ?§أين أموالي؟', ch_q2: 'Dispute a payment§Contester un paiement§الاعتراض على عملية', ch_q3: 'Raise my limits§Augmenter mes plafonds§رفع حدودي', ch_q4: 'Talk to a person§Parler à un conseiller§التحدث مع موظف',
  ch_a1: 'I found your pending transfer to Omar Tahir (25.00). It is waiting on the receiving bank and usually settles within 10 minutes. You will get a notification.§J’ai trouvé votre virement en attente vers Omar Tahir (25,00). Il attend la banque réceptrice, généralement réglé en 10 minutes.§وجدت تحويلك المعلّق إلى عمر طاهر (25.00). ينتظر مصرف المستلم وعادةً يُسوّى خلال 10 دقائق وسيصلك إشعار.', ch_a2: 'I can open a dispute for you. Pick the payment and we will freeze the funds with the merchant while we review.§Je peux ouvrir un litige. Choisissez le paiement, nous bloquerons les fonds chez le marchand pendant l’examen.§يمكنني فتح اعتراض. اختر العملية وسنحجز المبلغ لدى التاجر أثناء المراجعة.', ch_a3: 'You are on Tier 1. Verifying your ID and a selfie raises your daily limit to 25,000.§Vous êtes au niveau 1. Vérifier votre identité et un selfie porte le plafond à 25 000.§أنت في المستوى 1. توثيق الهوية وصورة شخصية يرفعان حدك اليومي إلى 25,000.', ch_a4: 'Connecting you with a specialist… average wait is under 2 minutes.§Mise en relation avec un conseiller… attente moyenne < 2 minutes.§جارٍ تحويلك إلى مختص… متوسط الانتظار أقل من دقيقتين.', ch_a0: 'Thanks — I’ve noted that. Is there anything else I can check?§Merci, c’est noté. Autre chose à vérifier ?§شكراً، سجّلت ذلك. هل هناك شيء آخر أتحقق منه؟', ch_open_rc: 'Open transfer§Ouvrir le virement§افتح التحويل', ch_open_kyc: 'Start verification§Vérifier§ابدأ التوثيق',
  hp_title: 'Help centre§Centre d’aide§مركز المساعدة', hp_q1: 'How do I cash in at an agent?§Comment déposer chez un agent ?§كيف أودع نقداً لدى وكيل؟', hp_a1: 'Open Cash in, choose a nearby agent, enter the amount and show the one-time code. Your balance updates the moment the agent confirms.§Ouvrez Dépôt, choisissez un agent, saisissez le montant et montrez le code. Le solde est mis à jour dès confirmation.§افتح إيداع نقدي واختر وكيلاً قريباً وأدخل المبلغ واعرض الرمز. يتحدّث رصيدك فور تأكيد الوكيل.', hp_q2: 'Why was my payment declined?§Pourquoi mon paiement est refusé ?§لماذا رُفضت عمليتي؟', hp_a2: 'Most often the daily limit for your tier was reached or the balance was too low. Check Limits & tier.§Le plus souvent, plafond du jour atteint ou solde insuffisant. Consultez Plafonds et niveau.§غالباً بسبب بلوغ الحد اليومي لمستواك أو نقص الرصيد. راجع الحدود والمستوى.', hp_q3: 'Can I use Vega without a bank account?§Puis-je utiliser Vega sans compte bancaire ?§هل أستطيع استخدام Vega دون حساب مصرفي؟', hp_a3: 'Yes. Vega is a standalone wallet. Fund it at an agent, by transfer or from a linked card.§Oui, c’est un portefeuille autonome : alimentez-le chez un agent, par virement ou carte liée.§نعم، Vega محفظة مستقلة. موّلها عند وكيل أو بتحويل أو ببطاقة مرتبطة.', hp_q4: 'How do I freeze a lost card?§Comment bloquer une carte perdue ?§كيف أجمّد بطاقة مفقودة؟', hp_a4: 'Cards → select the card → Freeze. It takes effect instantly and you can unfreeze any time.§Cartes → choisissez la carte → Bloquer. Effet immédiat, réversible.§البطاقات ← اختر البطاقة ← تجميد. يسري فوراً ويمكنك إلغاؤه في أي وقت.', hp_contact: 'Contact us§Nous contacter§تواصل معنا', hp_call: 'Call§Appeler§اتصال', hp_mail: 'Email§E-mail§بريد',
  w1t: 'Send money like a message§Envoyez de l’argent comme un message§أرسل المال كأنه رسالة', w1s: 'Instant, free between wallets, any time of day.§Instantané, gratuit entre portefeuilles, à toute heure.§فوري ومجاني بين المحافظ في أي وقت.', w2t: 'Pay anywhere with one scan§Payez partout d’un scan§ادفع في أي مكان بمسحة واحدة', w2s: 'Shops, cafés, taxis — and earn cashback.§Commerces, cafés, taxis — avec remise.§متاجر ومقاهٍ وسيارات أجرة — مع استرداد نقدي.', w3t: 'Cash in and out, nearby§Dépôt et retrait à proximité§إيداع وسحب بالقرب منك', w3s: 'A network of verified agents on every street.§Un réseau d’agents vérifiés dans chaque rue.§شبكة وكلاء موثّقين في كل شارع.', w_start: 'Get started§Commencer§ابدأ الآن', w_skip: 'Skip§Passer§تخطّي', w_have: 'I already have a wallet§J’ai déjà un portefeuille§لدي محفظة بالفعل',
  su_title: 'Your phone number§Votre numéro§رقم هاتفك', su_s: 'We will text you a 6-digit code§Nous vous enverrons un code à 6 chiffres§سنرسل لك رمزاً من 6 أرقام', su_cc: 'Country§Pays§الدولة', su_ly: 'Libya (+218)§Libye (+218)§ليبيا (+218)', su_terms: 'I agree to the Terms and Privacy Policy§J’accepte les conditions et la politique de confidentialité§أوافق على الشروط وسياسة الخصوصية', otp_title: 'Enter the code§Saisissez le code§أدخل الرمز', otp_s: 'Sent to {p}§Envoyé au {p}§أُرسل إلى {p}', otp_resend: 'Resend in {s}s§Renvoyer dans {s} s§إعادة الإرسال خلال {s} ث', otp_ok: 'Verified§Vérifié§تم التحقق',
  lk_title: 'Welcome back, {n}§Bon retour, {n}§أهلاً بعودتك، {n}', lk_s: 'Enter your PIN to unlock§Saisissez votre PIN§أدخل رمز PIN لفتح التطبيق', lk_forgot: 'Forgot PIN?§PIN oublié ?§نسيت الرمز؟'
});

/* ---------- onboarding ---------- */
const SLIDES = [
  { k: 'w1', art: `<g><rect x="70" y="40" width="100" height="170" rx="22" fill="var(--look-brand)"/><rect x="78" y="52" width="84" height="146" rx="14" fill="var(--surface)"/><circle cx="120" cy="92" r="22" fill="var(--look-accent)"/><rect x="92" y="126" width="56" height="9" rx="4.5" fill="var(--cont-hi)"/><rect x="100" y="142" width="40" height="9" rx="4.5" fill="var(--cont-hi)"/><rect x="88" y="164" width="64" height="22" rx="11" fill="var(--look-brand)"/></g><g class="fl1"><rect x="150" y="70" width="80" height="34" rx="17" fill="var(--look-field-2)"/><path d="M168 87h22m-8-8 8 8-8 8" stroke="var(--look-ink)" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g><circle class="fl2" cx="48" cy="96" r="20" fill="var(--look-field-3)"/>` },
  { k: 'w2', art: `<g><rect x="60" y="56" width="120" height="120" rx="26" fill="var(--look-field-1)"/><g fill="var(--look-ink)"><rect x="82" y="78" width="30" height="30" rx="6"/><rect x="128" y="78" width="30" height="30" rx="6"/><rect x="82" y="124" width="30" height="30" rx="6"/><rect x="128" y="130" width="12" height="12" rx="3"/><rect x="146" y="124" width="12" height="12" rx="3"/><rect x="146" y="142" width="12" height="12" rx="3"/></g><rect x="52" y="112" width="136" height="5" rx="2.5" fill="var(--look-accent)" class="scan"/></g><circle class="fl2" cx="198" cy="64" r="22" fill="var(--look-accent)"/><path class="fl1" d="M26 150l12-12 12 12-12 12z" fill="var(--look-field-2)"/>` },
  { k: 'w3', art: `<g><rect x="30" y="64" width="180" height="120" rx="22" fill="var(--look-field-2)"/><path d="M30 130c30-18 50 10 90 0s60-20 90-6v60H30z" fill="var(--look-field-1)"/><g class="pinb"><path d="M120 54c-16-18-22-26-22-36a22 22 0 0 1 44 0c0 10-6 18-22 36z" transform="translate(0 44)" fill="var(--look-brand)"/><circle cx="120" cy="62" r="9" fill="var(--surface)"/></g><circle cx="64" cy="100" r="9" fill="var(--look-accent)"/><circle cx="184" cy="92" r="9" fill="var(--look-accent)"/></g>` }
];
reg('welcome', {
  skel: false,
  render(p, el) {
    const i = el._i || 0, s = SLIDES[i], last = i === SLIDES.length - 1;
    return `<div class="welc"><div class="w-top">${vegaLockup()}<button class="btn text sm" data-act="skip">${t('w_skip')}</button></div>
      <div class="w-art" key="${i}"><svg viewBox="0 0 240 230" aria-hidden="true">${s.art}</svg></div>
      <div class="w-txt"><h1 class="disp">${t(s.k + 't')}</h1><p class="muted">${t(s.k + 's')}</p></div>
      <div class="w-dots">${SLIDES.map((_, k) => `<i class="${k === i ? 'on' : ''}"></i>`).join('')}</div>
      <div class="stack s8" style="width:100%"><button class="btn block lg" data-act="next">${last ? t('w_start') : t('next')}</button><button class="btn text block" data-act="have">${t('w_have')}</button></div></div>`;
  },
  mount(el) {
    el.addEventListener('click', e => {
      const a = e.target.closest('[data-act]')?.dataset.act; if (!a) return;
      if (a === 'next') { if ((el._i || 0) < SLIDES.length - 1) { el._i = (el._i || 0) + 1; rerender(el); } else go('signup'); }
      if (a === 'skip' || a === 'have') go('lock');
    });
  }
});
reg('signup', {
  skel: false,
  render() {
    return scr(`<div class="field rise"><label>${t('su_cc')}</label><div class="inp row"><span class="lead f1" style="width:32px;height:32px;border-radius:8px">LY</span><span class="sp b">${t('su_ly')}</span>${ic('chevron-down', 'sm')}</div></div>
      <div class="field rise"><label for="ph">${t('su_title')}</label><input id="ph" class="inp num" inputmode="tel" value="91 555 0142" style="font-size:20px;font-weight:700;letter-spacing:.04em"></div>
      <label class="card flat row rise" style="cursor:pointer"><button class="switch" role="switch" aria-checked="true" data-own="1" id="tc"></button><span class="small sp">${t('su_terms')}</span></label>`, { head: hdr(t('su_title'), { sub: t('su_s') }), foot: `<button class="btn block lg" id="sg">${t('next')}</button>` });
  },
  mount(el) { $('#tc', el).addEventListener('click', e => e.target.setAttribute('aria-checked', e.target.getAttribute('aria-checked') !== 'true')); $('#sg', el).addEventListener('click', () => go('otp')); }
});
reg('otp', {
  skel: false,
  render() {
    return scr(`<div class="otp rise" dir="ltr">${[0, 1, 2, 3, 4, 5].map(i => `<b data-o="${i}"></b>`).join('')}</div><p class="center small muted" data-rs>${t('otp_resend', { s: '<span class="num">28</span>' })}</p><div class="center rise"><span class="badge ok hide" data-ok>${ic('success-check', 'sm')} ${t('otp_ok')}</span></div>`, { head: hdr(t('otp_title'), { sub: t('otp_s', { p: '<span class="num">+218 91 555 0142</span>' }) }), foot: `<button class="btn block lg" id="ot" disabled>${t('next')}</button>` });
  },
  mount(el) {
    const boxes = $$('[data-o]', el), code = '482915'; let i = 0;
    const iv = setInterval(() => { if (!el.isConnected) return clearInterval(iv); if (i < 6) { boxes[i].textContent = code[i]; boxes[i].classList.add('on'); i++; } else { clearInterval(iv); $('[data-ok]', el).classList.remove('hide'); $('#ot', el).disabled = false; } }, RM() ? 10 : 260);
    $('#ot', el).addEventListener('click', () => go('polaris', { flow: 'onboard' }));
  }
});
reg('lock', {
  skel: false,
  render({ setup }) {
    return `<div class="lockscr"><div class="lk-top">${vegaStar('lk-star', false)}<h2 class="disp">${setup ? t('pin_set') : t('lk_title', { n: nm(ME.first) })}</h2><p class="muted small">${setup ? t('pin_sub') : t('lk_s')}</p></div>
      <div class="dots lkd">${[0, 1, 2, 3].map(i => `<i></i>`).join('')}</div>
      <div class="pad lkpad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<button data-k="${n}">${n}</button>`).join('')}<button data-bio aria-label="${t('pin_bio')}">${ic('face-id')}</button><button data-k="0">0</button><button data-k="del" aria-label="Delete">${ic('chevron-left', 'sm flip')}</button></div>
      <button class="btn text" data-forgot>${t('lk_forgot')}</button></div>`;
  },
  mount(el) {
    let v = ''; const dots = () => $$('.lkd i', el).forEach((d, k) => d.classList.toggle('on', k < v.length));
    const fin = async () => { $('.lkd', el).classList.add('okp'); await wait(450); tab('home'); };
    el.addEventListener('click', e => { const k = e.target.closest('[data-k]'), b = e.target.closest('[data-bio]'); if (k) { const x = k.dataset.k; if (x === 'del') v = v.slice(0, -1); else if (v.length < 4) v += x; dots(); if (v.length === 4) fin(); } if (b) { v = '1234'; dots(); fin(); } });
  }
});
add({ pin_set: 'Create your PIN§Créez votre PIN§أنشئ رمز PIN' });

/* ---------- profile ---------- */
reg('me', {
  tab: true,
  render() {
    const tl = tenantName();
    return `${hdr(t('me_title'), { back: false, right: `<button class="iconbtn" data-go="settings" aria-label="${t('set_title')}">${ic('settings')}</button>` })}<div class="body">
      <section class="prof rise" data-sk>${avatar(nm(ME), 0, 'big xl2')}<div class="sp"><div class="disp" style="font-size:22px">${esc(nm(ME))}</div><div class="small muted"><span class="ltr">${ME.handle}</span> · <span class="num">${ME.phone}</span></div><div class="row" style="gap:6px;margin-top:6px"><span class="badge info">${t('tier1')}</span></div></div></section>
      <div class="grid3 rise" data-sk>${[['me_stat1', '86', 'f1'], ['me_stat2', money(S.pockets.reduce((a, p) => a + p.saved, 0), { dec: 0, nocur: true }), 'f2'], ['me_stat3', money(S.rewards.cashback, { dec: 0, nocur: true }), 'f3']].map(([k, v, f]) => `<div class="stat ${f}"><b class="disp num">${v}</b><span class="tiny">${t(k)}</span></div>`).join('')}</div>
      <section class="stack s8 rise"><div class="muted small b grp">${t('me_acct')}</div><div class="list">${row({ icon: 'id-card', title: t('me_id'), sub: t('tier1'), go: 'limits' })}${row({ icon: 'card', title: t('sv_cards'), go: 'cards' })}${row({ icon: 'statement', title: t('sv_stm'), go: 'statements' })}${row({ icon: 'star', title: t('sv_rw'), go: 'rewards' })}${row({ icon: 'users', title: t('sv_rf'), go: 'referrals' })}</div></section>
      <section class="stack s8 rise"><div class="muted small b grp">${t('me_prefs')}</div><div class="list">${row({ icon: 'security-shield', title: t('me_sec'), go: 'security' })}${row({ icon: 'settings', title: t('me_set'), go: 'settings' })}${row({ icon: 'bell', title: t('notifs'), go: 'notifs' })}</div></section>
      <section class="stack s8 rise"><div class="muted small b grp">${t('me_help')}</div><div class="list">${row({ icon: 'chat', title: t('me_sup'), go: 'support' })}${row({ icon: 'info', title: t('me_faq'), go: 'help' })}${row({ icon: 'logout', title: t('me_out'), go: 'lock' })}</div></section>
      <div class="pw center"><div class="small muted">${esc(tl)} · ${t('me_pw')}</div><div style="margin-top:6px">${neptuneLogo()}</div></div></div>`;
  }
});

/* ---------- KYC upgrade + onboarding: live Neptune Polaris module, one constant path (staged builds copy shared/ next to app/) ---------- */
export const POLARIS_JS = '../../shared/polaris/polaris.js';
// The module ships showroom wording; customer-facing copy is set here ([en, ar, fr], the module's order). Same text as Neptune Mobile.
const PL_TEXT = {
  'po.honest': ['', '', ''],
  'po.intro.sub': ['Three quick steps, about two minutes.', 'ثلاث خطوات سريعة في نحو دقيقتين.', 'Trois étapes rapides, environ deux minutes.'],
  'po.intro.privacy': ['Your photos are used only to verify your identity.', 'تُستخدم صورك للتحقق من هويتك فقط.', 'Vos photos servent uniquement à vérifier votre identité.'],
  'po.intro.models': ['Getting the camera ready…', 'جارٍ تجهيز الكاميرا…', 'Préparation de la caméra…'],
  'po.intro.models_ready': ['Ready when you are', 'جاهز عندما تكون جاهزاً', 'Prêt quand vous l’êtes'],
  'po.perm.body': ['We use the camera to read your passport and to check that it is really you.', 'نستخدم الكاميرا لقراءة جوازك والتأكد من أنك أنت.', 'Nous utilisons la caméra pour lire votre passeport et vérifier que c’est bien vous.'],
  'po.demo_badge': ['Sample images', 'صور نموذجية', 'Images d’exemple'],
  'po.opt.demo': ['Use sample images', 'استخدم صوراً نموذجية', 'Utiliser des images d’exemple'],
  'po.perm.noneBody': ['This device has no camera we can use. You can use sample images or upload photos.', 'لا توجد كاميرا قابلة للاستخدام على هذا الجهاز. يمكنك استخدام صور نموذجية أو رفع صور.', 'Cet appareil n’a pas de caméra utilisable. Vous pouvez utiliser des images d’exemple ou importer des photos.'],
  'po.opt.demo_note': ['Prepared photos of a sample passport and face.', 'صور جاهزة لجواز وصورة شخصية نموذجيين.', 'Photos préparées d’un passeport et d’un visage d’exemple.'],
  'po.m.est': ['Estimated score', 'درجة تقديرية', 'Score estimé'],
  'po.m.est_note': ['Sample images are compared by an estimate, not a full face check.', 'تُقارَن الصور النموذجية بتقدير، لا بفحص كامل للوجه.', 'Les images d’exemple sont comparées par une estimation, pas par un contrôle complet du visage.'],
  'po.m.geo_note': ['A full face check was not possible on this device, so this score is an estimate.', 'تعذّر إجراء فحص كامل للوجه على هذا الجهاز، لذا هذه الدرجة تقديرية.', 'Un contrôle complet du visage n’a pas été possible sur cet appareil : ce score est une estimation.']
};
add({ po_fail: 'Identity module unavailable — using the placeholder§Module d’identité indisponible — version simplifiée§وحدة الهوية غير متاحة — نسخة مبسطة', po_ok: 'Identity verified — Tier 2 unlocked§Identité vérifiée — niveau 2 débloqué§تم التحقق — فُتح المستوى 2', po_review: 'Sent to manual review§Envoyé en revue manuelle§أُرسل للمراجعة اليدوية', po_retake: 'Please try again§Veuillez réessayer§يرجى المحاولة مجدداً' });
reg('polaris', {
  skel: false,
  render() { return `<div class="polhost" id="polhost"></div>`; },
  async mount(el, p) {
    const host = $('#polhost', el); let pol;
    try { const m = await import(POLARIS_JS); const cam = new URLSearchParams(location.search).get('camera') || 'auto';
      try { Object.assign((await import(new URL('strings.js', new URL(POLARIS_JS, import.meta.url)).href)).DICT, PL_TEXT); } catch (e) {}
      pol = m.mount(host, { lang: st.lang, camera: cam, allowDemo: true, allowUpload: true }); el._pol = pol; window.polaris = pol; }
    catch (e) { console.warn('[polaris] unavailable', e); toast(t('po_fail'), 'warning'); back(); go('kycflow'); return; }
    let last = null;
    pol.on('result', e => { last = e; window.lastResult = e; });
    pol.on('close', () => { pol.destroy(); back(); });
    pol.on('continue', async e => {
      const d = (last || e || {}).decision; pol.destroy();
      if (d === 'accepted') { S.kyc.tier = 2; if (p.flow === 'onboard') { tab('home'); } else { back(); } toast(t('po_ok'), 'success-check'); }
      else { back(); toast(t(d === 'review' ? 'po_review' : 'po_retake'), 'info'); }
    });
  }
});

reg('kyc', {
  render() {
    const R = [['k_r1', 1], ['k_r2', 0], ['k_r3', 0]];
    return scr(`<section class="kychero rise"><div class="kh-art"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="46" fill="var(--look-accent)" opacity=".9"/><rect x="30" y="40" width="60" height="42" rx="8" fill="var(--surface)"/><circle cx="50" cy="58" r="8" fill="var(--look-brand)"/><rect x="64" y="52" width="18" height="5" rx="2.5" fill="var(--cont-hi)"/><rect x="64" y="62" width="14" height="5" rx="2.5" fill="var(--cont-hi)"/><path d="M42 74c2-6 14-6 16 0" fill="var(--look-brand)"/></svg></div><div class="small" style="opacity:.8">${t('k_now', { t: t('l_t1') })}</div><h2 class="disp" style="font-size:26px;line-height:1.15">${t('k_next')}</h2><p class="small" style="opacity:.85">${t('k_gain', { a: money(500000, { dec: 0, nocur: true }), b: money(2500000, { dec: 0, nocur: true }) })}</p></section>
      <section class="stack s8 rise"><div class="muted small b grp">${t('k_req')}</div><div class="list">${R.map(([k, d], i) => `<div class="item"><span class="lead f${i + 1}">${ic(['id-card', 'face-id', 'location'][i])}</span><span class="sp"><span class="t">${t(k)}</span></span><span class="badge ${d ? 'ok' : ''}">${d ? ic('success-check', 'sm') + ' ' + t('k_done') : t('k_todo')}</span></div>`).join('')}</div></section>
      <div class="note rise">${ic('lock', 'sm')}<span class="small">${t('k_priv')}</span></div>`, { head: hdr(t('k_title')), foot: `<button class="btn block lg" id="ks">${ic('id-card', 'sm')} ${t('k_start')}</button><p class="tiny muted center">${t('k_time')}</p>` });
  },
  mount(el) { $('#ks', el).addEventListener('click', () => go('polaris', { flow: 'kyc' })); }
});
reg('kycflow', {
  skel: false,
  render(p, el) {
    const s = el._s || 0;
    const body = s === 0 ? `<div class="capt"><div class="idframe"><i class="c1"></i><i class="c2"></i><i class="c3"></i><i class="c4"></i><div class="idcard"><span class="ph"></span><b></b><b></b><b></b></div><span class="beam"></span></div><h2 class="disp">${t('kf_doc')}</h2><p class="muted small">${t('kf_doc_s')}</p></div>`
      : s === 1 ? `<div class="capt"><div class="faceframe">${ring(el._p || 0, { size: 230, thick: 8, color: 'var(--look-accent)', inner: `<svg viewBox="0 0 100 100" width="150"><circle cx="50" cy="40" r="20" fill="var(--look-field-3)"/><path d="M14 98c4-30 28-38 36-38s32 8 36 38z" fill="var(--look-field-1)"/></svg>` })}</div><h2 class="disp">${t('kf_face')}</h2><p class="muted small" data-prompt>${t('kf_face_s')}</p></div>`
      : s === 2 ? `<div class="capt"><div class="spin" style="width:92px;height:92px"><svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="24" fill="none" stroke="var(--look-brand)" stroke-width="5" stroke-linecap="round" stroke-dasharray="40 120"/></svg></div><h2 class="disp">${t('kf_rev')}</h2><div class="list" style="width:100%">${['kf_c1', 'kf_c2', 'kf_c3'].map((k, i) => `<div class="item"><span class="sp t">${t(k)}</span><span class="chkm" style="--d:${i * 700}ms">${ic('success-check')}</span></div>`).join('')}</div></div>`
      : `<div class="capt"><div class="succ-art"><svg viewBox="0 0 120 120" style="width:120px"><circle class="ring" cx="60" cy="60" r="52"/><path class="chk draw" pathLength="1" d="M36 62 54 80 86 42"/></svg></div><h2 class="disp">${t('kf_ok')}</h2><p class="muted">${t('kf_ok_s')}</p><div class="tiers" style="width:100%;grid-template-columns:1fr 1fr"><div class="tr past"><i>${ic('success-check', 'sm')}</i><b>${t('l_t1')}</b></div><div class="tr on"><i>2</i><b>${t('l_t2')}</b></div></div></div>`;
    return scr(`<div class="kfsteps">${[0, 1, 2].map(i => `<i class="${i <= s ? 'on' : ''}"></i>`).join('')}</div>${body}<p class="tiny muted center">${t('kf_ph')}</p>`, { head: hdr(t('k_title')), foot: s === 0 ? `<button class="btn block lg" data-act="cap">${ic('camera', 'sm')} ${t('kf_cap')}</button>` : s === 1 ? `<button class="btn block lg" data-act="cap" disabled>${t('kf_cap')}</button>` : s === 3 ? `<button class="btn block lg" data-home>${t('go_home')}</button>` : '' });
  },
  mount(el) {
    const s = el._s || 0;
    const step = n => { el._s = n; rerender(el); };
    if (s === 0) { el.addEventListener('click', e => { if (e.target.closest('[data-act=cap]')) { $('.idframe', el).classList.add('hit'); toast(t('kf_doc_ok')); setTimeout(() => step(1), 900); } }); }
    if (s === 1) { let p = 0; const prompts = [t('kf_face_s'), st.lang === 'ar' ? 'الآن إلى اليمين' : st.lang === 'fr' ? 'Maintenant à droite' : 'Now to the right', st.lang === 'ar' ? 'ابتسم قليلاً' : st.lang === 'fr' ? 'Souriez' : 'Smile a little']; const iv = setInterval(() => { if (!el.isConnected || el._s !== 1) return clearInterval(iv); p += 8; const r = $('.faceframe .dseg', el); if (r) { const C = 2 * Math.PI * 111; r.style.animation = 'none'; r.style.strokeDashoffset = C * (1 - p / 100); } $('[data-prompt]', el).textContent = prompts[Math.min(2, (p / 34) | 0)]; if (p >= 100) { clearInterval(iv); toast(t('kf_face_ok')); setTimeout(() => step(2), 700); } }, RM() ? 10 : 160); }
    if (s === 2) setTimeout(() => { if (el.isConnected) { S.kyc.tier = 2; confetti(el); step(3); } }, RM() ? 50 : 2600);
  }
});

/* ---------- cards ---------- */
const face = (c, frozen) => `<div class="cardface ${c.kind} ${frozen ? 'frz' : ''}"><i class="cf-a"></i><i class="cf-b"></i><div class="cf-top"><span class="cf-brand">${vegaMark('currentColor')}<b>${esc(tenantName())}</b></span><span class="cf-kind">${t('c_' + c.kind)}</span></div><div class="cf-chip"></div>${ic('contactless', 'cf-nfc')}<div class="cf-num mono">•••• •••• •••• ${c.last4}</div><div class="cf-bot"><span class="cf-h">${t('c_holder')}</span><span class="mono">${c.exp}</span></div>${frozen ? `<div class="cf-frost">${ic('lock', 'lg')}<b>${t('c_frozen')}</b></div>` : ''}</div>`;
reg('cards', {
  render(p, el) {
    const idx = el._k ?? 0, c = S.cards[idx], rv = el._rv;
    return scr(`<div class="cardcar rise" data-sk>${S.cards.map((k, i) => `<button class="cc ${i === idx ? 'on' : ''}" data-k="${i}">${face(k, k.frozen)}</button>`).join('')}</div>
      <div class="cdots">${S.cards.map((_, i) => `<i class="${i === idx ? 'on' : ''}"></i>`).join('')}</div>
      ${c.kind === 'physical' && c.status === 'shipping' ? `<section class="card rise"><div class="b" style="margin-bottom:6px">${t('c_ship')}</div><div class="tl">${[['c_s1', 1], ['c_s2', 1], ['c_s3', 1], ['c_s4', 0]].map(([k, on]) => `<div class="tl-s ${on ? 'on' : ''}"><i></i><span>${t(k)}</span></div>`).join('')}</div></section>` : `
      <div class="grid2 rise"><button class="btn tonal" data-act="show">${ic(rv ? 'eye-off' : 'eye', 'sm')} ${t(rv ? 'c_hide' : 'c_show')}</button><button class="btn tonal" data-act="wallet">${ic('phone', 'sm')} ${t('c_wallet_s')}</button></div>
      ${rv ? `<div class="card revcard rise"><div class="kvr"><span class="muted">${t('c_num')}</span><b class="mono">4291 7730 5518 ${c.last4}</b></div><div class="kvr"><span class="muted">${t('c_exp')}</span><b class="mono">${c.exp}</b></div><div class="kvr"><span class="muted">${t('c_cvv')}</span><b class="mono">731</b></div><div class="progress"><i style="--v:100%;transition:width 15s linear" data-cd></i></div><div class="tiny muted center" data-cdt>${t('c_reveal_t', { s: 15 })}</div></div>` : ''}
      <div class="list rise"><div class="item"><span class="lead f1">${ic('lock')}</span><span class="sp t">${t('c_freeze')}</span>${switchEl('frz', !!c.frozen)}</div><div class="item"><span class="lead f2">${ic('globe')}</span><span class="sp t">${t('c_online')}</span>${switchEl('onl', true)}</div><div class="item"><span class="lead f3">${ic('contactless')}</span><span class="sp t">${t('c_tap')}</span>${switchEl('tap', c.kind === 'physical')}</div><div class="item"><span class="lead f1">${ic('atm')}</span><span class="sp t">${t('c_atm')}</span>${switchEl('atm', false)}</div>${row({ icon: 'security-shield', title: t('c_limits'), go: 'limits' })}</div>`}
      <div class="grid2 rise"><button class="btn outline" data-act="newv">${ic('plus', 'sm')} ${t('c_new')}</button>${S.cards.every(k => k.kind !== 'physical') ? `<button class="btn outline" data-act="ord">${ic('card', 'sm')} ${t('c_order')}</button>` : `<button class="btn outline" data-go="limits">${ic('security-shield', 'sm')} ${t('c_limits')}</button>`}</div>`, { head: hdr(t('c_title')) });
  },
  mount(el) {
    el.addEventListener('click', async e => {
      const k = e.target.closest('[data-k]'); if (k) { el._k = +k.dataset.k; el._rv = false; rerender(el); $$('.rise', el).forEach(x => { x.style.animation = 'none'; x.style.opacity = 1; }); return; }
      const sw = e.target.closest('.switch[data-sw=frz]'); if (sw) { await wait(60); S.cards[el._k ?? 0].frozen = sw.getAttribute('aria-checked') === 'true' ? 1 : 0; const cf = $$('.cardface', el)[el._k ?? 0]; cf?.classList.toggle('frz', !!S.cards[el._k ?? 0].frozen); rerender(el); instant(el); toast(t(S.cards[el._k ?? 0].frozen ? 'c_frozen' : 'saved_toast'), 'lock'); return; }
      const a = e.target.closest('[data-act]')?.dataset.act;
      if (a === 'show') { if (el._rv) { el._rv = false; rerender(el); instant(el); } else pin(() => { el._rv = true; rerender(el); instant(el); setTimeout(() => { const b = $('[data-cd]', el); if (b) b.style.setProperty('--v', '0%'); }, 40); let s = 15; const iv = setInterval(() => { if (!el.isConnected || !el._rv) return clearInterval(iv); s--; const d = $('[data-cdt]', el); if (d) d.textContent = t('c_reveal_t', { s }); if (s <= 0) { clearInterval(iv); el._rv = false; rerender(el); instant(el); } }, 1000); }); }
      if (a === 'wallet') toast(t('c_wallet'), 'phone');
      if (a === 'newv') { const sh = sheet(`<h3 class="disp">${t('c_new_t')}</h3><button class="opt" role="radio" aria-checked="true" data-x>${t('c_single')}${ic('success-check', 'sm')}</button><button class="opt" role="radio" aria-checked="false" data-x>${t('c_sub')}${ic('success-check', 'sm')}</button><button class="btn block lg" id="mkc">${t('confirm')}</button>`); sh.addEventListener('click', ev => { const x = ev.target.closest('[data-x]'); if (x) $$('[data-x]', sh).forEach(b => b.setAttribute('aria-checked', b === x)); }); $('#mkc', sh).addEventListener('click', async () => { closeSheet(); await wait(350); S.cards.unshift({ id: 'k' + (S.cards.length + 1), kind: 'virtual', last4: '6204', exp: '10/29', frozen: 0 }); el._k = 0; rerender(el); instant(el); toast(t('c_created'), 'card'); confetti(el, { n: 60 }); }); }
      if (a === 'ord') { await processing(t('proc'), 900); S.cards.push({ id: 'k9', kind: 'physical', last4: '8830', exp: '03/30', frozen: 0, status: 'shipping' }); el._k = S.cards.length - 1; rerender(el); instant(el); toast(t('c_ship')); }
    });
  }
});
const instant = el => $$('.rise', el).forEach(x => { x.style.animation = 'none'; x.style.opacity = 1; });

/* ---------- settings / security ---------- */
reg('settings', {
  render() {
    return scr(`<section class="stack s8 rise"><div class="muted small b grp">${t('set_lang')}</div><div class="seg" id="sl">${[['en', 'English'], ['fr', 'Français'], ['ar', 'العربية']].map(([k, n]) => `<button aria-pressed="${st.lang === k}" data-l="${k}">${n}</button>`).join('')}</div><p class="tiny muted">${t('set_dir')}</p></section>
      <section class="stack s8 rise"><div class="muted small b grp">${t('set_theme')}</div><div class="seg">${['light', 'dark'].map(k => `<button aria-pressed="${st.theme === k}" data-th="${k}">${ic(k === 'light' ? 'sun' : 'moon', 'sm')} ${t(k)}</button>`).join('')}</div></section>
      <section class="stack s8 rise"><div class="list"><div class="item"><span class="sp t">${t('set_motion')}</span>${switchEl('mo', !store.motion)}</div></div></section>
      <section class="stack s8 rise"><div class="muted small b grp">${t('set_notif')}</div><div class="list">${['set_n1', 'set_n2', 'set_n3'].map((k, i) => `<div class="item"><span class="sp t">${t(k)}</span>${switchEl('n' + i, i !== 1)}</div>`).join('')}</div></section>
      <section class="stack s8 rise"><div class="list">${row({ icon: 'info', title: t('set_about'), sub: t('set_ver') })}</div></section>`, { head: hdr(t('set_title')) });
  },
  mount(el) {
    el.addEventListener('click', e => { const l = e.target.closest('[data-l]'), th = e.target.closest('[data-th]'); if (l) setLang(l.dataset.l); if (th) setTheme(th.dataset.th); const m = e.target.closest('[data-sw=mo]'); if (m) { setTimeout(() => { store.motion = m.getAttribute('aria-checked') !== 'true'; document.documentElement.dataset.motion = store.motion ? '' : 'off'; }, 20); } });
  }
});
reg('security', {
  render() {
    return scr(`<section class="card rise row">${ring(86, { size: 76, thick: 9, color: 'var(--ok)' })}<div class="sp"><div class="small muted">${t('sec_score')}</div><div class="disp" style="font-size:24px">${t('sec_strong')}</div></div></section>
      <div class="list rise">${row({ icon: 'key', title: t('sec_pin'), go: 'lock', p: { setup: 1 } })}<div class="item"><span class="lead f2">${ic('face-id')}</span><span class="sp t">${t('sec_bio')}</span>${switchEl('bio', true)}</div><div class="item"><span class="lead f3">${ic('otp')}</span><span class="sp t">${t('sec_2fa')}</span>${switchEl('2fa', true)}</div></div>
      <section class="stack s8 rise"><div class="muted small b grp">${t('sec_dev')}</div><div class="list"><div class="item"><span class="lead f1">${ic('phone')}</span><span class="sp"><span class="t">${t('sec_this')}</span><span class="s" style="display:block">${ME.phone}</span></span><span class="badge ok">${ic('success-check', 'sm')}</span></div><div class="item" data-dev><span class="lead f2">${ic('phone')}</span><span class="sp"><span class="t">Pixel 8</span><span class="s" style="display:block">${t('sec_other')}</span></span><button class="btn text sm" data-act="rm">${t('sec_rev')}</button></div></div></section>
      <section class="stack s8 rise"><div class="muted small b grp">${t('sec_act')}</div><div class="list">${[[0, 'Tripoli'], [3, 'Tripoli'], [9, 'Tripoli']].map(([d, c], i) => `<div class="item kv"><span class="lead f${i + 1}">${ic('lock')}</span><span class="sp"><span class="t">${t('sec_this')}</span><span class="s" style="display:block"><span class="num">${fmtDate(new Date(Date.now() - d * 864e5))}</span> · ${c}</span></span><span class="badge ok">OK</span></div>`).join('')}</div></section>`, { head: hdr(t('sec_title')), foot: `<button class="btn outline block" data-go="lock">${ic('lock', 'sm')} ${t('sec_lock')}</button>` });
  },
  mount(el) { el.addEventListener('click', e => { if (e.target.closest('[data-act=rm]')) { $('[data-dev]', el).remove(); toast(t('sec_removed'), 'security-shield'); } }); }
});

/* ---------- support chat ---------- */
reg('support', {
  skel: false,
  render() {
    const tl = tenantName();
    return `${hdr(t('ch_title'), { right: `<button class="iconbtn" data-go="help" aria-label="${t('me_faq')}">${ic('info')}</button>` })}<div class="agentbar"><span class="lead round brand">S</span><div><b>Sara</b><div class="tiny muted"><i class="onl"></i> ${t('ch_online')}</div></div></div><div class="body chat" data-chat></div>
      <footer class="chatfoot"><div class="qr" data-qr>${['ch_q1', 'ch_q2', 'ch_q3', 'ch_q4'].map((k, i) => `<button class="chip" data-q="${i + 1}">${t(k)}</button>`).join('')}</div><form class="cin" data-form><input class="inp" placeholder="${t('ch_in')}" aria-label="${t('ch_in')}"><button class="iconbtn send" aria-label="Send">${ic('send')}</button></form></footer>`;
  },
  mount(el) {
    const chat = $('[data-chat]', el), tl = tenantName();
    const msg = (txt, me, extra = '') => { const m = document.createElement('div'); m.className = 'msg ' + (me ? 'me' : 'bot'); m.innerHTML = `<div class="bub">${esc(txt)}${extra}</div>`; chat.appendChild(m); chat.scrollTop = chat.scrollHeight; return m; };
    const typing = () => { const m = document.createElement('div'); m.className = 'msg bot'; m.innerHTML = `<div class="bub typ"><i></i><i></i><i></i></div>`; chat.appendChild(m); chat.scrollTop = chat.scrollHeight; return m; };
    const reply = async (k, extra) => { const ty = typing(); await wait(1000); ty.remove(); msg(t(k), false, extra || ''); };
    msg(t('ch_hi', { n: nm(ME.first), b: tl }), false);
    const act = { 1: `<button class="btn sm tonal" data-go="txn" data-p='{"id":10}'>${t('ch_open_rc')}</button>`, 3: `<button class="btn sm" data-go="kyc">${t('ch_open_kyc')}</button>` };
    el.addEventListener('click', async e => { const q = e.target.closest('[data-q]'); if (q) { const i = q.dataset.q; msg(q.textContent, true); q.remove(); await reply('ch_a' + i, act[i] ? `<div style="margin-top:8px">${act[i]}</div>` : ''); } });
    $('[data-form]', el).addEventListener('submit', async e => { e.preventDefault(); const i = $('input', el); if (!i.value.trim()) return; msg(i.value, true); i.value = ''; await reply('ch_a0'); });
  }
});
reg('help', {
  render() {
    return scr(`<label class="searchbar rise">${ic('search', 'sm')}<input class="sinp" placeholder="${t('search')}"></label><div class="list rise">${[1, 2, 3, 4].map(i => `<details class="faq"><summary><span class="sp t">${t('hp_q' + i)}</span>${ic('chevron-down', 'sm')}</summary><p class="small muted">${t('hp_a' + i)}</p></details>`).join('')}</div>
      <section class="stack s8 rise"><div class="muted small b grp">${t('hp_contact')}</div><div class="grid3"><button class="btn tonal" data-go="support" style="flex-direction:column;min-height:78px;gap:4px;border-radius:var(--r-card)">${ic('chat')}<span class="small">${t('ch_title')}</span></button><button class="btn tonal" style="flex-direction:column;min-height:78px;gap:4px;border-radius:var(--r-card)">${ic('phone')}<span class="small">${t('hp_call')}</span></button><button class="btn tonal" style="flex-direction:column;min-height:78px;gap:4px;border-radius:var(--r-card)">${ic('mail')}<span class="small">${t('hp_mail')}</span></button></div></section>`, { head: hdr(t('hp_title')) });
  }
});
