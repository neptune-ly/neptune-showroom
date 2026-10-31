// Onboarding shared by both operator apps: welcome -> number + code -> identity check (passport, MRZ, liveness, face match, all on the device)
// -> details -> SIM/eSIM + plan -> PIN -> account creation -> SIM/eSIM activation -> home.
import * as C from './core.js';
import { mount as mountId, DEMO_PEOPLE } from '../../shared/polaris/polaris.js';
import { DICT as ID_DICT } from '../../shared/polaris/strings.js';
import { countryName as cName } from '../../shared/polaris/mrz.js';
const countryName = (c, l) => cName(c, l).replace(/\s*[(（][^)）]*[)）]\s*$/, '');
const { t, ic, esc, view, go, toast, keypadHTML, bindKeypad, haptic, sleep, msisdn, money, lockup } = C;
const img = src => /^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/.test(src || '') ? src : '';

let CFG = null, OB = null, POL = null;
export const ob = () => OB;
export function freshOB() { return { phone: '', otp: '', kyc: null, profile: {}, sim: 'esim', plan: null, pin: '', bio: true, terms: false, mode: null }; }
export function configure(cfg) { CFG = cfg; OB = freshOB(); OB.phone = cfg.op.number; return OB; }
export function destroyPolaris() { if (POL) { try { POL.destroy(); } catch (e) { /* ignore */ } POL = null; } }
export function onLangChange() { if (POL) { POL.setLang(C.lang()); return true; } return false; }
const L = k => C.loc(CFG.op[k]);

/* the identity module ships its own copy; the operator app words it as "Identity check" */
Object.assign(ID_DICT, {
  'po.demo_badge': ['Sample capture', 'التقاط نموذجي', 'Capture type'],
  'po.honest': ['Your photos are processed on this device.', 'تُعالج صورك على هذا الجهاز.', 'Vos photos sont traitées sur cet appareil.'],
  'po.intro.sub': ['Three quick steps, about two minutes.', 'ثلاث خطوات سريعة في نحو دقيقتين.', 'Trois étapes rapides, environ deux minutes.'],
  'po.intro.privacy': ['Your photos stay on this device.', 'تبقى صورك على هذا الجهاز.', 'Vos photos restent sur cet appareil.'],
  'po.perm.body': ['We use the camera to read your passport and to check that you are a live person. Pictures stay on this device.', 'نستخدم الكاميرا لقراءة جوازك والتأكد من أنك شخص حقيقي. تبقى الصور على هذا الجهاز.', 'Nous utilisons la caméra pour lire votre passeport et vérifier que vous êtes bien une personne réelle. Les images restent sur cet appareil.'],
  'po.perm.noneBody': ['This device has no camera we can use. You can use a sample capture or upload photos.', 'لا توجد كاميرا قابلة للاستخدام على هذا الجهاز. يمكنك استخدام التقاط نموذجي أو رفع صور.', 'Aucune caméra utilisable sur cet appareil. Vous pouvez utiliser une capture type ou importer des photos.'],
  'po.opt.demo': ['Use a sample capture', 'استخدم التقاطاً نموذجياً', 'Utiliser une capture type'],
  'po.opt.demo_note': ['Prepared frames: a passport and a face.', 'لقطات جاهزة: جواز ووجه.', 'Images préparées : un passeport et un visage.'],
  'po.read.sample': ['Use the sample lines', 'استخدم السطرين النموذجيين', 'Utiliser les lignes types'],
  'po.m.est': ['Estimated score', 'درجة تقديرية', 'Score estimé'],
  'po.m.est_note': ['This score is an estimate for the sample capture.', 'هذه الدرجة تقدير للالتقاط النموذجي.', 'Ce score est une estimation pour la capture type.'],
  'po.m.geo_note': ['The face model could not run, so this score is a geometric estimate.', 'تعذر تشغيل نموذج الوجوه، فهذه الدرجة تقدير هندسي.', 'Le modèle facial n’a pas pu s’exécuter : score estimé géométriquement.'],
});

/* header with a labelled five-step progress bar */
const STEPS = ['ob.s1', 'ob.s2', 'ob.s3', 'ob.s4', 'ob.s5'];
const obh = (n, { back = true } = {}) => OB.mode === 'login' ? `<div class="obh"><button class="iconbtn" data-back="ob/welcome" aria-label="${t('c.back')}">${ic('arrow-left', 'flip')}</button></div>` : `<div class="obh">${back ? `<button class="iconbtn" data-back="ob/welcome" aria-label="${t('c.back')}">${ic('arrow-left', 'flip')}</button>` : ''}
  <div class="stepper" role="progressbar" aria-valuemin="1" aria-valuemax="5" aria-valuenow="${n}" aria-label="${t('ob.step', { n, of: 5 })}"><div class="lbl"><span>${t('ob.step', { n, of: 5 })}</span><b>${t(STEPS[n - 1])}</b></div><div class="seg5">${STEPS.map((_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</div></div></div>`;
const title = (h, p) => `<div class="obtitle"><h1>${h}</h1>${p ? `<p>${p}</p>` : ''}</div>`;
const scr = (inner, ctx, extra = '') => view(`<div class="screen${ctx && ctx.back ? ' back' : ''}" ${extra}><div class="sc-in">${inner}</div></div>`);

export function route(parts, ctx) {
  const s = parts[1] || 'welcome';
  destroyPolaris();
  const R = { welcome, login, phone, otp, id, details, plan, pin, creating, sim, done }[s];
  if (!R) return false;
  R(ctx, parts[2]);
  return true;
}

/* ------------------------------------------------------------------ welcome: full-bleed scene, glass pills */
function welcome(ctx) {
  OB.mode = null;
  const m = CFG.id === 'lumo' ? 'm' : 'v';
  view(`<div class="screen${ctx.back ? ' back' : ''}"><div class="wl"><div class="rings"></div>
    <div class="wl-top">${lockup(36)}<button class="wl-lang glass" data-act="ob-lang" aria-label="${t('ob.lang')}">${{ en: 'English', ar: 'العربية', fr: 'Français' }[C.lang()]}</button></div>
    <div class="wl-art" aria-hidden="true">${CFG.scene()}</div>
    <h1>${t(`ob.${m}.h`)}</h1><p class="lead-p">${t(`ob.${m}.p`)}</p>
    <div class="wl-feats">${CFG.feats.map(([i, k]) => `<span class="gchip">${ic(i, 'sm')} ${t(k)}</span>`).join('')}</div>
    <div class="wl-ctas"><button class="btn block" data-go="ob/phone">${t('ob.start')}</button><button class="btn glass block" data-act="ob-skip">${t('ob.skip_s')}</button></div>
    <p class="legal">${t('ob.legal')}</p></div></div>`);
}
C.actions['ob-lang'] = () => { const o = ['en', 'ar', 'fr'], i = o.indexOf(C.lang()); C.setPrefs({ lang: o[(i + 1) % 3] }); };
C.actions['ob-skip'] = () => go('ob/login');

/* ------------------------------------------------------------------ sign in: PIN on a phone that already holds the account;
   otherwise (or "Forgot PIN") the number, the SMS code and a new PIN */
function login(ctx, sub) {
  const acct = CFG.account();
  OB.mode = 'login';
  if (!acct || sub === 'new') { OB.phone = acct ? acct.num : CFG.op.number; return phone(ctx); }
  let tries = 0, busy = false;
  scr(`<div class="obh"><button class="iconbtn" data-back="ob/welcome" aria-label="${t('c.back')}">${ic('arrow-left', 'flip')}</button><span class="sp"></span>${lockup(28)}<span class="sp"></span><span style="width:48px" aria-hidden="true"></span></div>
    <div class="sec fill" style="align-items:center;text-align:center;gap:8px">
      <span class="avatar" style="width:76px;height:76px;font-size:26px;margin-top:10px">${acct.avatar}</span>
      <h1 style="font:var(--dw) 26px/1.15 var(--display);margin-top:6px">${t('ob.wb', { name: `<bdi>${esc(acct.first)}</bdi>` })}</h1>
      <p class="muted sm"><span class="num" dir="ltr">${msisdn(acct.num)}</span></p>
      <div class="pin-dots" id="ld" style="margin:14px 0 2px">${'<i></i>'.repeat(4)}</div>
      <p class="hint" id="lh" aria-live="polite">${t('ob.wb_pin')}</p>
      <div style="width:100%;margin-top:6px">${keypadHTML()}</div>
      ${acct.bio ? `<button class="btn tonal block" id="lbio"><span class="row" style="gap:10px">${ic('face-id')} ${t('ob.wb_face')}</span></button>` : ''}
      <button class="btn text" data-go="ob/login/new">${t('ob.forgot')}</button>
    </div>`, ctx);
  const dots = C.$('#ld'), lh = C.$('#lh'), paint = v => [...dots.children].forEach((d, i) => d.classList.toggle('on', i < v.length));
  const enter = () => { if (busy) return; busy = true; haptic([20, 30]); CFG.onLogin(null); };
  const kp = bindKeypad(C.$('.keypad'), { max: 4, onChange: async v => {
    paint(v); if (v.length < 4 || busy) return; await sleep(160);
    if (v === acct.pin) return enter();
    tries++; dots.classList.add('err'); haptic(60); lh.textContent = t(tries >= 5 ? 'ob.wb_lock' : 'p.wrong'); lh.style.color = 'var(--err)';
    await sleep(420); dots.classList.remove('err'); kp.set('');
    if (tries >= 5) { busy = true; await sleep(900); go('ob/login/new'); }
  } });
  const b = C.$('#lbio'); if (b) b.addEventListener('click', async () => { if (b.disabled) return; b.disabled = true; b.classList.add('busy'); await sleep(700); enter(); });
}

/* ------------------------------------------------------------------ phone + code */
function phone(ctx) {
  const signin = OB.mode === 'login'; if (signin) OB.terms = true;
  scr(`${obh(1)}${title(t(signin ? 'ob.signin_h' : 'ob.phone_h'), t('ob.phone_p', { op: L('name') }))}
    <div class="sec fill" style="gap:16px">
      <div class="simcard" id="simdet"><span class="rings"></span><span class="lead" aria-hidden="true">${ic('sim', 'lg')}</span><div style="flex:1"><div style="font-weight:700" id="simt">${t('ob.detecting')}</div><div class="sm" id="sims" style="opacity:.85">${t('ob.detecting_s')}</div></div><span id="simok" style="opacity:0;transition:opacity .4s">${ic('success-check')}</span></div>
      <div class="field"><label for="ph">${t('ob.number')}</label><div class="row" dir="ltr" style="gap:8px"><span class="input" style="width:auto;display:flex;align-items:center;gap:8px;flex:none;min-width:88px"><b class="num">+218</b></span><input id="ph" class="input ltr" inputmode="tel" autocomplete="tel-national" value="${esc(OB.phone.replace('+218', '').replace(/(\d{2})(\d{3})(\d{4})/, '$1 $2 $3'))}" aria-describedby="phh"></div><span class="hint" id="phh">${t('ob.number_h')}</span></div>
      ${signin ? '' : `<label class="row" style="gap:12px;align-items:flex-start"><input type="checkbox" class="check" id="tc" ${OB.terms ? 'checked' : ''}><span class="sm">${t('ob.terms', { op: L('name') })}</span></label>`}
      <button class="btn block" id="phn" ${OB.terms && OB.phone.length === 13 ? '' : 'disabled'} data-go="ob/otp">${t('ob.send_code')}</button>
    </div>`, ctx);
  setTimeout(() => { const a = C.$('#simt'); if (!a) return; a.textContent = t('ob.sim_found'); C.$('#sims').innerHTML = `<span class="num" dir="ltr">${msisdn(CFG.op.number)}</span>`; C.$('#simok').style.opacity = 1; C.$('#simdet').classList.add('anim-pop'); }, 1100);
  const ok = () => { C.$('#phn').disabled = !(OB.terms && OB.phone.length === 13); };
  if (!signin) C.$('#tc').addEventListener('change', e => { OB.terms = e.target.checked; ok(); });
  C.$('#ph').addEventListener('input', e => { const d = e.target.value.replace(/\D/g, '').slice(0, 9); OB.phone = '+218' + d; ok(); });
}
function otp(ctx) {
  let v = '';
  scr(`${obh(1)}${title(t('ob.otp_h'), t('ob.otp_p', { n: `<b class="num" dir="ltr">${msisdn(OB.phone)}</b>` }))}
    <div class="sec" style="gap:14px">
      <div class="pin-dots" id="otpd" style="gap:10px;margin:10px 0 4px" role="status" aria-label="${t('ob.otp_h')}">${Array.from({ length: 6 }, () => '<i></i>').join('')}</div>
      <div class="row card flat" style="padding:10px 10px 10px 14px;gap:10px"><span class="gly g3" style="width:38px;height:38px">${ic('sms', 'sm')}</span><div style="flex:1;min-width:0"><div class="tiny muted">${t('ob.otp_sms')}</div><b class="num" style="font-size:17px;letter-spacing:.12em">482913</b></div><button class="btn sm tonal" id="fill">${t('ob.fill')}</button></div>
      ${keypadHTML()}
      <p class="legal">${t('ob.resend', { s: '0:28' })}</p>
    </div>`, ctx);
  const dots = C.$('#otpd').children; const paint = () => [...dots].forEach((d, i) => d.classList.toggle('on', i < v.length));
  let fin = false;
  const done = async () => { if (fin) return; fin = true; haptic(20); C.$('#otpd').insertAdjacentHTML('afterend', `<div class="row anim-pop" style="justify-content:center;color:var(--ok);font-weight:700">${ic('success-check')} ${t('ob.verified')}</div>`); await sleep(650); OB.otp = v; go(OB.mode === 'login' ? 'ob/pin' : 'ob/id'); };
  const kp = bindKeypad(C.$('.keypad'), { max: 6, onChange: x => { v = x; paint(); if (v.length === 6) done(); } });
  C.$('#fill').addEventListener('click', async e => { if (e.currentTarget.disabled) return; e.currentTarget.disabled = true; kp.set(''); for (const ch of '482913') { kp.set(kp.get() + ch); await sleep(130); } });
}

/* ------------------------------------------------------------------ identity check (passport, MRZ, liveness, match) */
function id() {
  view(`<div class="screen" style="overflow:hidden;animation:none"><div id="idc" style="position:absolute;inset:0"></div></div>`);
  POL = mountId(C.$('#idc'), { lang: C.lang(), camera: 'auto', person: DEMO_PEOPLE[CFG.id === 'lumo' ? 0 : 1], continueLabel: t('ob.id_continue'), allowDemo: true, allowUpload: true });
  POL.on('result', r => { OB.kyc = r; })
    .on('continue', r => { OB.kyc = r; OB.profile = prefill(r); go('ob/details'); })
    .on('close', () => { C.back('ob/otp'); });
  const back = POL.root.querySelector('[data-act=back]');
  POL.on('step', e => { if (e.id === 'intro' && back) back.onclick = ev => { ev.stopPropagation(); C.back('ob/otp'); }; });
}
const titleCase = s => String(s || '').toLowerCase().replace(/(^|[\s'-])(\p{L})/gu, (m, a, b) => a + b.toUpperCase());
function prefill(r) {
  const d = r.document || {};
  return { name: titleCase([d.givenNames, d.surname].filter(Boolean).join(' ')), dob: d.dob, nat: d.nationality, doc: d.docNumber, sex: d.sex, expiry: d.expiry, photo: r.images && r.images.passportPhoto, selfie: r.images && r.images.selfie, decision: r.decision, mode: r.mode, ref: r.reference, match: r.match && Math.round(r.match.score * 100) };
}

/* ------------------------------------------------------------------ details */
function details(ctx) {
  const p = OB.profile; if (!p.name) { p.name = 'Nour El Huda Haddad'; p.dob = '1994-03-21'; p.nat = 'UTO'; p.doc = 'P4821907'; }
  const dob = (p.dob || '').split('-').reverse().join('/');
  const tier = OB.kyc && OB.kyc.decision === 'accepted' ? 'std' : 'basic';
  scr(`${obh(3)}${title(t('ob.det_h'))}
    <div class="sec fill" style="gap:14px">
      <div class="simcard" style="padding:14px">${img(p.photo) ? `<img src="${img(p.photo)}" alt="" style="width:64px;height:80px;border-radius:14px;object-fit:cover;box-shadow:0 0 0 2px rgba(255,255,255,.5)">` : `<span class="lead" style="width:64px;height:80px;border-radius:14px">${ic('user', 'xl')}</span>`}
        <div style="min-width:0"><div class="eyebrow" style="opacity:.75">${t('ob.det_from')}</div><div style="font:var(--dw) 20px/1.15 var(--display);margin-top:2px">${esc(p.name)}</div><div class="sm num" style="opacity:.85">${esc(p.doc)} · ${esc(countryName(p.nat, C.lang()))}</div>
        <span class="badge ${tier === 'std' ? 'ok' : 'warn'}" style="margin-top:8px">${ic('shield-check', 'sm')} ${t(tier === 'std' ? 'ob.id_ok' : 'ob.id_review')}</span></div></div>
      <div class="grid2"><div class="field"><label>${t('ob.dob')}</label><input class="input ltr" value="${esc(dob)}" readonly aria-readonly="true"></div><div class="field"><label>${t('ob.nat')}</label><input class="input" value="${esc(countryName(p.nat, C.lang()))}" readonly aria-readonly="true"></div></div>
      <div class="field"><label for="addr">${t('ob.addr')}</label><input id="addr" class="input" value="${esc(p.addr || t('ob.addr_fill'))}" placeholder="${t('ob.addr_ph')}" autocomplete="street-address"></div>
      <div class="grid2"><div class="field"><label for="occ">${t('ob.occ')}</label><select id="occ" class="input">${['emp', 'self', 'stu', 'ret'].map(k => `<option value="${k}" ${p.occ === k ? 'selected' : ''}>${t('ob.occ_' + k)}</option>`).join('')}</select></div>
        <div class="field"><label for="src">${t('ob.src')}</label><select id="src" class="input">${['sal', 'biz', 'fam', 'sav'].map(k => `<option value="${k}" ${p.src === k ? 'selected' : ''}>${t('ob.src_' + k)}</option>`).join('')}</select></div></div>
      <label class="row" style="gap:12px;align-items:flex-start"><input type="checkbox" class="check" id="mk" ${p.mk ? 'checked' : ''}><span class="sm">${t('ob.marketing')}</span></label>
      <button class="btn block" id="dn">${t('c.continue')}${ic('arrow-right', 'flip')}</button>
    </div>`, ctx);
  C.$('#dn').addEventListener('click', () => { p.addr = C.$('#addr').value; p.occ = C.$('#occ').value; p.src = C.$('#src').value; p.mk = C.$('#mk').checked; go('ob/plan'); });
}

/* ------------------------------------------------------------------ SIM / eSIM + starter plan */
function plan(ctx) {
  const plans = CFG.plans; OB.plan = OB.plan || plans[1].id;
  scr(`${obh(4)}${title(t('ob.plan_h'))}
    <div class="sec fill" style="gap:12px">
      <h3 class="sec-h">${t('ob.sim_h')}</h3>
      <div class="grid2" role="radiogroup" aria-label="${t('ob.sim_h')}">${[['esim', 'esim', 'ob.esim', 'ob.esim_s'], ['sim', 'sim', 'ob.sim', 'ob.sim_s']].map(([k, i, a, b]) => `<button class="choice" role="radio" aria-checked="${OB.sim === k}" data-sim="${k}" style="display:flex;flex-direction:column;gap:6px;min-height:48px"><span class="row"><span class="lead">${ic(i, 'lg')}</span><span class="sp"></span><span class="tick">${ic('success-check')}</span></span><b>${t(a)}</b><span class="sm muted">${t(b)}</span></button>`).join('')}</div>
      <h3 class="sec-h" style="margin-top:6px">${t('ob.plan_s')}</h3>
      <div class="col" role="radiogroup" aria-label="${t('ob.plan_s')}">${plans.map(p => `<button class="choice" role="radio" aria-checked="${OB.plan === p.id}" data-plan="${p.id}" style="display:flex;gap:14px;align-items:center;min-height:72px"><span class="lead ${p.f === 'f2' ? 'f2' : p.f === 'f3' ? 'f3' : ''}" style="width:48px;height:48px">${ic(p.icon, 'lg')}</span><div style="flex:1"><div style="font-weight:800">${t(p.name)}</div><div class="sm muted">${t(p.desc)}</div></div><div style="font-weight:800;text-align:end">${p.price ? money(p.price, { short: true }) : t('ob.free')}<small style="display:block;font-weight:500;color:var(--muted);font-size:12px">${t('ob.per_month')}</small></div></button>`).join('')}</div>
      <button class="btn block" id="pn">${t('c.continue')}${ic('arrow-right', 'flip')}</button>
    </div>`, ctx);
  const app = C.appEl();
  app.querySelectorAll('[data-sim]').forEach(b => b.addEventListener('click', () => { OB.sim = b.dataset.sim; app.querySelectorAll('[data-sim]').forEach(x => x.setAttribute('aria-checked', x === b)); haptic(8); }));
  app.querySelectorAll('[data-plan]').forEach(b => b.addEventListener('click', () => { OB.plan = b.dataset.plan; app.querySelectorAll('[data-plan]').forEach(x => x.setAttribute('aria-checked', x === b)); haptic(8); }));
  C.$('#pn').addEventListener('click', () => go('ob/pin'));
}

/* ------------------------------------------------------------------ PIN */
function pin(ctx) {
  let stage = 0, v = '', first = '';
  scr(`${obh(5)}
    <div class="sec" style="align-items:center;text-align:center;gap:10px">
      <span class="gly" style="width:68px;height:68px">${ic('lock', 'lg')}</span>
      <h3 id="pt" style="font:var(--dw) 24px var(--display)">${t(OB.mode === 'login' ? 'ob.pin_new' : 'ob.pin_1')}</h3><p class="muted sm" id="ps">${t('ob.pin_s')}</p>
      <div class="pin-dots" id="pd" style="margin:8px 0">${Array.from({ length: 4 }, () => '<i></i>').join('')}</div>
      <div style="width:100%">${keypadHTML()}</div>
      <label class="row" style="gap:12px;margin-top:6px"><button class="switch" id="bio" role="switch" aria-checked="${OB.bio}" aria-label="${t('ob.bio')}"></button><span class="sm" style="text-align:start">${ic('face-id', 'sm')} ${t('ob.bio')}</span></label>
    </div>`, ctx);
  const dots = C.$('#pd'); const paint = () => [...dots.children].forEach((d, i) => d.classList.toggle('on', i < v.length));
  C.$('#bio').addEventListener('click', e => { OB.bio = !OB.bio; e.currentTarget.setAttribute('aria-checked', OB.bio); });
  const onc = async x => {
    v = x; paint(); if (v.length < 4) return; await sleep(180);
    if (stage === 0) { first = v; stage = 1; kp.set(''); C.$('#pt').textContent = t('ob.pin_2'); return; }
    if (v === first) { OB.pin = v; haptic([20, 40, 20]); if (OB.mode === 'login') CFG.onLogin(OB); else C.reset('ob/creating'); } else { dots.classList.add('err'); haptic(60); C.$('#ps').textContent = t('ob.pin_bad'); C.$('#ps').style.color = 'var(--err)'; await sleep(450); dots.classList.remove('err'); stage = 0; first = ''; kp.set(''); C.$('#pt').textContent = t(OB.mode === 'login' ? 'ob.pin_new' : 'ob.pin_1'); }
  };
  const kp = bindKeypad(C.$('.keypad'), { max: 4, onChange: onc });
}

/* ------------------------------------------------------------------ creating the account */
function creating() {
  const steps = ['ob.cr1', 'ob.cr2', 'ob.cr3', CFG.id === 'lumo' ? 'ob.cr4m' : 'ob.cr4v', 'ob.cr5'];
  view(`<div class="screen scr-hero dark-hero" style="animation:none"><div class="rings" style="z-index:-1"></div><div class="sc-in" style="justify-content:center;align-items:center;padding:24px;gap:22px;text-align:center">
    <div style="position:relative;width:176px;height:176px;display:grid;place-items:center">${C.ring({ pct: 0.02, size: 176, stroke: 12, color: 'var(--accent)', mid: `<span class="big-num num" id="pc">0</span>` })}</div>
    <h2 style="font:var(--dw) 26px var(--display)">${t('ob.creating')}</h2>
    <div class="list" style="width:100%;text-align:start" id="crl">${steps.map((s, i) => `<div class="item" data-i="${i}" style="min-height:54px;opacity:.5;transition:opacity .4s"><span class="stp">${ic('success-check', 'sm')}</span><span style="font-weight:600;font-size:15px">${t(s)}</span></div>`).join('')}</div>
  </div></div>`);
  (async () => {
    const fg = C.$('.ring .fg'), circ = parseFloat(fg.getAttribute('stroke-dasharray')), pc = C.$('#pc');
    for (let i = 0; i < steps.length; i++) {
      const it = C.$(`[data-i="${i}"]`); if (!it) return; it.style.opacity = 1; it.querySelector('.stp').className = 'stp run';
      await sleep(C.reduced() ? 60 : 650);
      it.querySelector('.stp').className = 'stp ok'; haptic(10);
      const p = (i + 1) / steps.length; fg.style.strokeDashoffset = circ * (1 - p); pc.textContent = Math.round(p * 100);
    }
    await sleep(300); if (C.path() === 'ob/creating') C.replace('ob/sim');
  })();
}

/* ------------------------------------------------------------------ SIM / eSIM activation */
function sim() {
  const esim = OB.sim === 'esim';
  const steps = esim ? ['ob.es1', 'ob.es2', 'ob.es3', 'ob.es4'] : ['ob.sm1', 'ob.sm2', 'ob.sm3', 'ob.sm4'];
  view(`<div class="screen scr-hero dark-hero" style="animation:none"><div class="rings" style="z-index:-1"></div><div class="sc-in" style="padding:calc(var(--sat) + 22px) 18px calc(22px + var(--sab));gap:12px">
    <div style="text-align:center"><div class="eyebrow" style="opacity:.8">${L('name')}</div><h2 style="font:var(--dw) 26px var(--display);margin-top:4px">${t(esim ? 'ob.esim_act' : 'ob.sim_act')}</h2></div>
    <div id="simart" style="display:grid;place-items:center">${simArt(esim)}</div>
    <div style="text-align:center"><div class="eyebrow" id="snet" style="opacity:.85">${t('ob.net_search')}</div><div class="big-num num" id="snum" style="font-size:32px;margin-top:2px;min-height:36px;direction:ltr"></div></div>
    <div class="list" id="sl">${steps.map((s, i) => `<div class="item" data-i="${i}" style="min-height:52px;opacity:.5;transition:opacity .4s"><span class="stp">${ic('success-check', 'sm')}</span><span style="font-weight:600">${t(s)}</span></div>`).join('')}</div>
    <div style="flex:1"></div>
    <button class="btn block" id="sgo" disabled>${t('ob.open_app', { app: L('app') })}</button>
  </div></div>
  <style>@keyframes tc-wave{0%{transform:scale(.4);opacity:.9}100%{transform:scale(1.5);opacity:0}}@keyframes tc-bar{from{transform:scaleY(.15);opacity:.3}to{transform:scaleY(1);opacity:1}}@keyframes tc-float{50%{transform:translateY(-6px)}}
  .simart .w{transform-box:fill-box;transform-origin:center;animation:tc-wave 2.2s infinite;opacity:0}.simart .w2{animation-delay:.7s}.simart .w3{animation-delay:1.4s}.simart.on .w{animation:none;opacity:0}.simart .sb rect{transform-box:fill-box;transform-origin:bottom;transform:scaleY(.15);opacity:.3}.simart.on .sb rect{animation:tc-bar .5s var(--spring) both}.simart.on .sb rect:nth-child(2){animation-delay:.12s}.simart.on .sb rect:nth-child(3){animation-delay:.24s}.simart.on .sb rect:nth-child(4){animation-delay:.36s}.simart .chip-g{animation:tc-float 2.6s ease-in-out infinite}</style>`);
  const st = n => C.$(`[data-i="${n}"]`);
  (async () => {
    const hold = ms => sleep(C.reduced() ? 60 : ms);
    for (let i = 0; i < steps.length; i++) {
      const it = st(i); if (!it) return; it.style.opacity = 1; const s = it.querySelector('.stp'); s.className = 'stp run';
      if (esim && i === 0) { const m = C.$('#simart .prof'); if (m) { m.style.transition = 'transform 1.3s cubic-bezier(.3,1.3,.5,1), opacity .6s'; m.style.transform = 'translateY(0)'; m.style.opacity = '1'; } }
      if (i === 1) { const pr = C.$('#simart .pbar'); if (pr) { pr.style.transition = 'transform 1.6s ease-out'; pr.style.transform = 'scaleX(1)'; } }
      await hold(i === 2 ? 1500 : 1250);
      s.className = 'stp ok'; haptic(12);
      if (i === 2 && C.$('#snet')) C.$('#snet').textContent = t('ob.net_found', { op: L('name') });
    }
    if (!C.$('#simart svg')) return;
    C.$('#simart svg').classList.add('on'); C.$('#snet').textContent = t('ob.net_ok', { op: L('name') });
    const num = msisdn(CFG.op.number), el = C.$('#snum'); for (const ch of num) { if (!C.$('#snum')) return; el.textContent += ch; await sleep(C.reduced() ? 0 : 55); }
    haptic([30, 40, 60]);
    const b = C.$('#sgo'); b.disabled = false; b.addEventListener('click', () => C.replace('ob/done'));
  })();
}
function simArt(esim) {
  return `<svg class="simart" viewBox="0 0 320 250" width="100%" height="250" role="img" aria-label="${t('ob.net_search')}" style="display:block;max-width:340px"><g style="color:#fff">
    <g transform="translate(160 126)"><circle class="w" r="64" fill="none" stroke="currentColor" stroke-width="3"/><circle class="w w2" r="64" fill="none" stroke="currentColor" stroke-width="3"/><circle class="w w3" r="64" fill="none" stroke="currentColor" stroke-width="3"/></g>
    <rect x="102" y="26" width="116" height="204" rx="24" fill="rgba(255,255,255,.1)" stroke="currentColor" stroke-width="4" opacity=".95"/><rect x="142" y="36" width="36" height="8" rx="4" fill="currentColor" opacity=".6"/>
    ${esim ? `<g class="prof" style="transform:translateY(-120px);opacity:0"><rect x="116" y="76" width="88" height="56" rx="12" style="fill:var(--accent)"/><text x="160" y="110" text-anchor="middle" style="fill:var(--on-accent);font:800 17px var(--display)">eSIM</text><circle cx="190" cy="90" r="6" style="fill:var(--on-accent)" opacity=".7"/></g>
      <g transform="translate(116 148)"><rect width="88" height="8" rx="4" fill="currentColor" opacity=".25"/><rect class="pbar" width="88" height="8" rx="4" style="fill:var(--accent);transform-origin:left;transform:scaleX(0)"/></g>` :
    `<g class="chip-g"><rect x="128" y="84" width="64" height="64" rx="10" style="fill:var(--accent)"/><rect x="140" y="98" width="40" height="36" rx="6" fill="none" style="stroke:var(--on-accent)" stroke-width="3"/><path d="M140 116h40M160 98v36" style="stroke:var(--on-accent)" stroke-width="3"/></g>`}
    <g class="sb" transform="translate(130 176)">${[0, 1, 2, 3].map(i => `<rect x="${i * 16}" y="${30 - (i + 1) * 8}" width="10" height="${(i + 1) * 8}" rx="3" fill="currentColor"/>`).join('')}</g>
    </g></svg>`;
}

/* ------------------------------------------------------------------ done */
function done() {
  const first = `<bdi>${esc((OB.profile.name || '').split(' ')[0])}</bdi>`;
  view(`<div class="screen" style="animation:none"><div class="sc-in"><div class="hero" style="padding-bottom:70px;text-align:center"><div class="rings"></div>
      <div class="hrow" style="justify-content:center">${lockup(30)}</div>
      <span class="okmark anim-pop" style="margin:26px auto 18px;box-shadow:0 0 0 12px rgba(255,255,255,.16),0 18px 40px -12px rgba(0,0,0,.5)">${ic('success-check', 'xl')}</span>
      <h1 class="disp" style="font-size:32px;letter-spacing:-.02em">${t('ob.done_h', { name: first })}</h1><p style="opacity:.9;margin:8px auto 0;max-width:290px">${t('ob.done_p', { app: L('app') })}</p></div>
    <div class="sheetbody" style="display:flex;flex-direction:column"><div class="sec fill" style="gap:14px;padding-top:20px"><div class="grid2"><div class="pocket f3"><div class="eyebrow">${t('ob.bonus_data')}</div><div class="big-num num" style="font-size:32px;margin-top:4px">1 GB</div></div><div class="pocket f2"><div class="eyebrow">${t('ob.bonus_pts')}</div><div class="big-num num" style="font-size:32px;margin-top:4px">500</div></div></div>
    <button class="btn block" id="fin">${t('ob.open_wallet')}</button></div></div></div></div>`);
  C.$('#fin').addEventListener('click', e => { if (e.currentTarget.disabled) return; e.currentTarget.disabled = true; CFG.onFinish(OB); });
  C.confetti(C.appEl(), 40, .6);
}

C.add({
  'ob.signin_h': ['Sign in with your number', 'سجّل الدخول برقمك', 'Connectez-vous avec votre numéro'], 'ob.pin_new': ['Choose a PIN for this phone', 'اختر رمز PIN لهذا الهاتف', 'Choisissez un PIN pour ce téléphone'],
  'ob.wb': ['Welcome back, {name}', 'أهلاً بعودتك يا {name}', 'Bon retour, {name}'], 'ob.wb_pin': ['Enter your 4-digit PIN', 'أدخل رمز PIN من 4 أرقام', 'Saisissez votre PIN à 4 chiffres'], 'ob.wb_face': ['Sign in with face or fingerprint', 'الدخول بالوجه أو البصمة', 'Se connecter avec le visage ou l’empreinte'],
  'ob.forgot': ['Forgot PIN? Verify your number', 'نسيت الرمز؟ تحقّق من رقمك', 'PIN oublié ? Vérifiez votre numéro'], 'ob.wb_lock': ['Too many tries. Verify your number to continue.', 'محاولات كثيرة. تحقّق من رقمك للمتابعة.', 'Trop d’essais. Vérifiez votre numéro pour continuer.'],
  'ob.lang': ['Language', 'اللغة', 'Langue'], 'ob.skip_s': ['I already have an account', 'لدي حساب', 'J’ai déjà un compte'], 'ob.start': ['Get started', 'ابدأ الآن', 'Commencer'],
  'ob.legal': ['By continuing you accept the terms and the privacy notice.', 'بالمتابعة فأنت توافق على الشروط وإشعار الخصوصية.', 'En continuant, vous acceptez les conditions et l’avis de confidentialité.'],
  'ob.step': ['Step {n} of {of}', 'الخطوة {n} من {of}', 'Étape {n} sur {of}'], 'ob.s1': ['Phone', 'الهاتف', 'Téléphone'], 'ob.s2': ['Identity', 'الهوية', 'Identité'], 'ob.s3': ['Details', 'البيانات', 'Infos'], 'ob.s4': ['SIM and plan', 'الشريحة والباقة', 'SIM et forfait'], 'ob.s5': ['PIN', 'الرمز', 'PIN'],
  'ob.m.h': ['Your number is now your wallet', 'رقمك أصبح محفظتك', 'Votre numéro devient votre portefeuille'], 'ob.m.p': ['Open an account with your passport and a selfie, then get your eSIM or SIM activated without leaving the app.', 'افتح حساباً بجواز سفرك وصورة سيلفي ثم فعّل شريحتك أو الشريحة الرقمية دون مغادرة التطبيق.', 'Ouvrez un compte avec votre passeport et un selfie, puis activez votre eSIM ou SIM sans quitter l’app.'],
  'ob.v.h': ['Cash in your pocket, agents on your street', 'النقد في جيبك ووكلاء في شارعك', 'Du cash dans la poche, des agents dans votre rue'], 'ob.v.p': ['Verify yourself once, then cash in, cash out, send and pay with your phone number.', 'تحقق من هويتك مرة واحدة ثم أودع وسحب وحوّل وادفع برقم هاتفك.', 'Vérifiez votre identité une fois, puis déposez, retirez, envoyez et payez avec votre numéro.'],
  'ob.f_id': ['Passport and selfie', 'جواز وسيلفي', 'Passeport et selfie'], 'ob.f_sim': ['SIM or eSIM', 'شريحة أو رقمية', 'SIM ou eSIM'], 'ob.f_vch': ['Vouchers', 'قسائم', 'Bons'], 'ob.f_agents': ['Agents nearby', 'وكلاء بالقرب', 'Agents proches'], 'ob.f_qr': ['Pay by QR', 'ادفع بالرمز', 'Payer par QR'],
  'ob.phone_h': ['Your phone number', 'رقم هاتفك', 'Votre numéro'], 'ob.phone_p': ['{op} will send a one-time code by SMS to confirm this number.', 'سيرسل {op} رمزاً لمرة واحدة برسالة نصية لتأكيد هذا الرقم.', '{op} enverra un code à usage unique par SMS pour confirmer ce numéro.'],
  'ob.detecting': ['Looking for your SIM…', 'جارٍ البحث عن شريحتك…', 'Recherche de votre SIM…'], 'ob.detecting_s': ['Reading the number from the SIM', 'قراءة الرقم من الشريحة', 'Lecture du numéro sur la SIM'], 'ob.sim_found': ['SIM found', 'تم العثور على الشريحة', 'SIM détectée'],
  'ob.number': ['Mobile number', 'رقم الجوال', 'Numéro de mobile'], 'ob.number_h': ['The 9 digits after +218', 'الأرقام التسعة بعد 218+', 'Les 9 chiffres après +218'],
  'ob.terms': ['I accept the {op} wallet terms and privacy notice.', 'أقبل شروط محفظة {op} وإشعار الخصوصية.', 'J’accepte les conditions du portefeuille {op} et l’avis de confidentialité.'], 'ob.send_code': ['Send code', 'أرسل الرمز', 'Envoyer le code'],
  'ob.otp_h': ['Enter the code', 'أدخل الرمز', 'Saisissez le code'], 'ob.otp_p': ['We sent a 6-digit code to {n}.', 'أرسلنا رمزاً من 6 أرقام إلى {n}.', 'Nous avons envoyé un code à 6 chiffres au {n}.'], 'ob.otp_sms': ['Code from Messages', 'رمز من الرسائل', 'Code des Messages'], 'ob.fill': ['Fill', 'املأ', 'Remplir'], 'ob.verified': ['Number verified', 'تم التحقق من الرقم', 'Numéro vérifié'], 'ob.resend': ['Resend code in {s}', 'إعادة الإرسال بعد {s}', 'Renvoyer le code dans {s}'],
  'ob.id_continue': ['Continue', 'متابعة', 'Continuer'],
  'ob.det_h': ['Confirm your details', 'أكّد بياناتك', 'Confirmez vos informations'], 'ob.det_from': ['Read from your passport', 'مقروء من جواز سفرك', 'Lu sur votre passeport'], 'ob.id_ok': ['Identity verified', 'تم التحقق من الهوية', 'Identité vérifiée'], 'ob.id_review': ['Identity in review', 'الهوية قيد المراجعة', 'Identité en vérification'],
  'ob.dob': ['Date of birth', 'تاريخ الميلاد', 'Date de naissance'], 'ob.nat': ['Nationality', 'الجنسية', 'Nationalité'], 'ob.addr': ['Home address', 'عنوان السكن', 'Adresse'], 'ob.addr_ph': ['Street, district, city', 'الشارع، الحي، المدينة', 'Rue, quartier, ville'], 'ob.addr_fill': ['12 Orchard Street, Old Town, Tripoli', '12 شارع البستان، المدينة القديمة، طرابلس', '12 rue du Verger, Vieille Ville, Tripoli'],
  'ob.occ': ['Occupation', 'المهنة', 'Profession'], 'ob.occ_emp': ['Employed', 'موظف', 'Salarié'], 'ob.occ_self': ['Self-employed', 'عمل حر', 'Indépendant'], 'ob.occ_stu': ['Student', 'طالب', 'Étudiant'], 'ob.occ_ret': ['Retired', 'متقاعد', 'Retraité'],
  'ob.src': ['Source of funds', 'مصدر الأموال', 'Origine des fonds'], 'ob.src_sal': ['Salary', 'راتب', 'Salaire'], 'ob.src_biz': ['Business', 'تجارة', 'Activité'], 'ob.src_fam': ['Family support', 'دعم عائلي', 'Soutien familial'], 'ob.src_sav': ['Savings', 'مدخرات', 'Épargne'],
  'ob.marketing': ['Send me offers and rewards (optional).', 'أرسل لي العروض والمكافآت (اختياري).', 'M’envoyer des offres et récompenses (facultatif).'],
  'ob.plan_h': ['SIM and plan', 'الشريحة والباقة', 'SIM et forfait'], 'ob.sim_h': ['How do you want your SIM?', 'كيف تريد شريحتك؟', 'Comment voulez-vous votre SIM ?'], 'ob.esim': ['eSIM on this phone', 'شريحة رقمية على هذا الهاتف', 'eSIM sur ce téléphone'], 'ob.esim_s': ['Instant, no card needed', 'فوري ودون بطاقة', 'Instantané, sans carte'], 'ob.sim': ['SIM card in the box', 'شريحة في العلبة', 'Carte SIM fournie'], 'ob.sim_s': ['Insert it and we activate it', 'أدخلها ونحن نفعّلها', 'Insérez-la et nous l’activons'],
  'ob.plan_s': ['Starter plan', 'باقة البداية', 'Forfait de départ'], 'ob.free': ['Free', 'مجاني', 'Gratuit'], 'ob.per_month': ['per month', 'شهرياً', 'par mois'],
  'ob.pin_h': ['Secure your wallet', 'أمّن محفظتك', 'Sécurisez votre portefeuille'], 'ob.pin_1': ['Choose a 4-digit PIN', 'اختر رمز PIN من 4 أرقام', 'Choisissez un code PIN à 4 chiffres'], 'ob.pin_2': ['Repeat your PIN', 'أعد إدخال PIN', 'Répétez votre code PIN'], 'ob.pin_s': ['You will use it to approve payments.', 'ستستخدمه لاعتماد المدفوعات.', 'Vous l’utiliserez pour valider vos paiements.'], 'ob.pin_bad': ['PINs did not match. Try again.', 'الرمزان غير متطابقين. حاول مجدداً.', 'Les codes ne correspondent pas. Réessayez.'], 'ob.bio': ['Use face or fingerprint too', 'استخدم الوجه أو البصمة أيضاً', 'Utiliser aussi le visage ou l’empreinte'],
  'ob.creating': ['Creating your account', 'جارٍ إنشاء حسابك', 'Création de votre compte'], 'ob.cr1': ['Identity confirmed', 'تأكيد الهوية', 'Identité confirmée'], 'ob.cr2': ['Wallet opened', 'فتح المحفظة', 'Portefeuille ouvert'], 'ob.cr3': ['Number linked to the wallet', 'ربط الرقم بالمحفظة', 'Numéro lié au portefeuille'], 'ob.cr4m': ['Virtual card issued', 'إصدار البطاقة الافتراضية', 'Carte virtuelle émise'], 'ob.cr4v': ['Agent network enabled', 'تفعيل شبكة الوكلاء', 'Réseau d’agents activé'], 'ob.cr5': ['Limits and security set', 'ضبط الحدود والأمان', 'Plafonds et sécurité définis'],
  'ob.esim_act': ['Activating your eSIM', 'تفعيل شريحتك الرقمية', 'Activation de votre eSIM'], 'ob.sim_act': ['Activating your SIM', 'تفعيل شريحتك', 'Activation de votre SIM'],
  'ob.es1': ['Downloading the eSIM profile', 'تنزيل ملف الشريحة الرقمية', 'Téléchargement du profil eSIM'], 'ob.es2': ['Installing on this phone', 'التثبيت على هذا الهاتف', 'Installation sur ce téléphone'], 'ob.es3': ['Searching for the network', 'البحث عن الشبكة', 'Recherche du réseau'], 'ob.es4': ['Registering your number', 'تسجيل رقمك', 'Enregistrement de votre numéro'],
  'ob.sm1': ['Detecting the SIM card', 'اكتشاف بطاقة الشريحة', 'Détection de la carte SIM'], 'ob.sm2': ['Unlocking and pairing', 'فتح القفل والاقتران', 'Déverrouillage et appairage'], 'ob.sm3': ['Searching for the network', 'البحث عن الشبكة', 'Recherche du réseau'], 'ob.sm4': ['Registering your number', 'تسجيل رقمك', 'Enregistrement de votre numéro'],
  'ob.net_search': ['Searching for network…', 'جارٍ البحث عن الشبكة…', 'Recherche du réseau…'], 'ob.net_found': ['{op} found, signing in…', 'تم العثور على {op}، جارٍ الدخول…', '{op} trouvé, connexion…'], 'ob.net_ok': ['Connected to {op} 4G+', 'متصل بـ {op} 4G+', 'Connecté à {op} 4G+'],
  'ob.open_app': ['Continue to {app}', 'تابع إلى {app}', 'Continuer vers {app}'],
  'ob.done_h': ['Welcome, {name}!', 'أهلاً {name}!', 'Bienvenue, {name} !'], 'ob.done_p': ['Your number, plan and wallet are live in {app}.', 'رقمك وباقتك ومحفظتك جاهزة في {app}.', 'Votre numéro, forfait et portefeuille sont actifs dans {app}.'], 'ob.bonus_data': ['Welcome data', 'بيانات ترحيبية', 'Data de bienvenue'], 'ob.bonus_pts': ['Reward points', 'نقاط المكافآت', 'Points récompense'], 'ob.open_wallet': ['Open my wallet', 'افتح محفظتي', 'Ouvrir mon portefeuille'],
});
