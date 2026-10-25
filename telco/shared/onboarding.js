// Telco onboarding, led by Neptune Polaris: welcome -> number + OTP -> Polaris (passport, MRZ, liveness, face match) -> details
// -> SIM/eSIM + plan -> PIN -> account creation -> SIM/eSIM activation animation -> home. All inside the app, all simulated except
// the Polaris checks, which really run on the device (see shared/polaris/README.md).
import * as C from './core.js';
import { mount as mountPolaris, DEMO_PEOPLE } from '../../shared/polaris/polaris.js';
import { countryName } from '../../shared/polaris/mrz.js';
const { t, ic, esc, view, go, replace, sheet, toast, keypadHTML, bindKeypad, confetti, haptic, sleep, logoLine, msisdn, money } = C;

let CFG = null, OB = null, POL = null;
export const ob = () => OB;
export function freshOB() { return { phone: '', otp: '', kyc: null, profile: {}, sim: 'esim', plan: null, pin: '', bio: true, terms: false, steps: 0 }; }

export function configure(cfg) { CFG = cfg; OB = freshOB(); OB.phone = cfg.op.number; return OB; }
export function destroyPolaris() { if (POL) { try { POL.destroy(); } catch (e) { /* ignore */ } POL = null; } }
export function onLangChange() { if (POL) { POL.setLang(C.lang()); return true; } return false; }

const topbar = (title, { back = true, end = '' } = {}) => `<div class="topbar">${back ? `<button class="iconbtn" data-back aria-label="${t('c.back')}">${ic('arrow-left', 'flip')}</button>` : ''}<h2>${title}</h2>${end}</div>`;
const prog = (n, of = 6) => `<div class="row" style="gap:5px;padding:0 18px" aria-hidden="true">${Array.from({ length: of }, (_, i) => `<i style="flex:1;height:5px;border-radius:3px;background:${i < n ? 'var(--brand)' : 'var(--c-high)'};transition:background .4s"></i>`).join('')}</div>`;
const L = k => C.loc(CFG.op[k]);

/** Route handler for ob/<step>. Returns true when handled. */
export function route(parts, ctx) {
  const s = parts[1] || 'welcome';
  destroyPolaris();
  const R = { welcome, phone, otp, id, details, plan, pin, creating, sim, done }[s];
  if (!R) return false;
  R(ctx);
  return true;
}

/* ------------------------------------------------------------------ welcome */
function welcome(ctx) {
  const op = CFG.op;
  view(`<div class="screen${ctx.back ? ' back' : ''}"><div class="sc-in">
    <div class="band">${logoLine()}<button class="lang" data-act="ob-lang">${{ en: 'English', ar: 'العربية', fr: 'Français' }[C.lang()]}</button></div>
    <div style="padding:18px"><div class="pocket" style="background:var(--f1);border-radius:28px;display:grid;place-items:center;padding:8px 0;min-height:230px"><span style="position:absolute;top:14px;inset-inline-start:16px" class="opmark"><i>${esc(op.mark)}</i>${esc(L('app'))}</span><div style="color:var(--brand);margin-top:26px">${CFG.art()}</div></div></div>
    <div style="padding:4px 18px 0"><h1 style="font:700 30px/1.15 var(--font);letter-spacing:-.01em">${t(CFG.id === 'mobile' ? 'ob.m.h' : 'ob.v.h')}</h1><p class="muted" style="margin-top:10px">${t(CFG.id === 'mobile' ? 'ob.m.p' : 'ob.v.p')}</p></div>
    <div style="flex:1"></div>
    <div class="sec" style="gap:10px"><button class="btn block" data-go="ob/phone">${t('ob.start')}</button><button class="btn tonal block" data-act="ob-skip">${t('ob.skip_s')}</button><p class="legal">${t('ob.legal')}</p></div></div></div>`);
}
C.actions['ob-lang'] = () => { const o = ['en', 'ar', 'fr'], i = o.indexOf(C.lang()); C.setPrefs({ lang: o[(i + 1) % 3] }); };
C.actions['ob-skip'] = () => { CFG.onSkip && CFG.onSkip(); };

/* ------------------------------------------------------------------ phone + OTP */
function phone(ctx) {
  view(`<div class="screen${ctx.back ? ' back' : ''}"><div class="sc-in">${topbar(t('ob.phone_h'))}${prog(1)}
    <div class="sec">
      <p class="muted">${t('ob.phone_p', { op: L('name') })}</p>
      <div class="pocket f2" id="simdet" style="display:flex;gap:14px;align-items:center"><span class="lead" style="width:48px;height:48px;border-radius:14px;background:var(--surface);display:grid;place-items:center;color:var(--brand)">${ic('sim', 'lg')}</span><div><div style="font-weight:700" id="simt">${t('ob.detecting')}</div><div class="sm" id="sims" style="opacity:.8">${t('ob.detecting_s')}</div></div></div>
      <div class="field"><label for="ph">${t('ob.number')}</label><div class="row" style="gap:8px"><span class="input" style="width:auto;display:flex;align-items:center;gap:8px;flex:none;min-width:88px"><b class="num">+218</b></span><input id="ph" class="input ltr" inputmode="tel" autocomplete="tel-national" value="${esc(OB.phone.replace('+218', '').replace(/(\d{2})(\d{3})(\d{4})/, '$1 $2 $3'))}" aria-describedby="phh"></div><span class="hint" id="phh">${t('ob.number_h')}</span></div>
      <label class="row" style="gap:12px;align-items:flex-start"><input type="checkbox" id="tc" ${OB.terms ? 'checked' : ''} style="width:24px;height:24px;accent-color:var(--brand);margin-top:2px"><span class="sm">${t('ob.terms', { op: L('name') })}</span></label>
      <button class="btn block" id="phn" ${OB.terms ? '' : 'disabled'} data-go="ob/otp">${t('ob.send_code')}</button>
    </div></div></div>`);
  setTimeout(() => { const a = C.$('#simt'); if (!a) return; a.textContent = t('ob.sim_found'); C.$('#sims').textContent = msisdn(CFG.op.number); C.$('#simdet').classList.add('anim-pop'); }, 1100);
  C.$('#tc').addEventListener('change', e => { OB.terms = e.target.checked; C.$('#phn').disabled = !OB.terms; });
  C.$('#ph').addEventListener('input', e => { const d = e.target.value.replace(/\D/g, '').slice(0, 9); OB.phone = '+218' + d; });
}
function otp(ctx) {
  let v = '';
  view(`<div class="screen${ctx.back ? ' back' : ''}"><div class="sc-in">${topbar(t('ob.otp_h'))}${prog(1)}
    <div class="sec">
      <p class="muted">${t('ob.otp_p', { n: `<b class="num" dir="ltr">${msisdn(OB.phone)}</b>` })}</p>
      <div class="pin-dots" id="otpd" style="gap:10px" role="status" aria-label="code">${Array.from({ length: 6 }, () => '<i></i>').join('')}</div>
      <div class="pocket f3 sm" style="display:flex;gap:10px;align-items:center">${ic('info', 'sm')}<span>${t('ob.otp_demo')} <b class="num">482913</b></span><span class="sp"></span><button class="btn sm tonal" id="fill" style="min-height:44px">${t('ob.fill')}</button></div>
      ${keypadHTML()}
      <p class="legal"><span id="rs">${t('ob.resend', { s: '0:28' })}</span></p>
    </div></div></div>`);
  const dots = C.$('#otpd').children; const paint = () => [...dots].forEach((d, i) => d.classList.toggle('on', i < v.length));
  const done = async () => { haptic(20); C.$('#otpd').insertAdjacentHTML('afterend', `<div class="row anim-pop" style="justify-content:center;color:var(--ok);font-weight:700">${ic('success-check')} ${t('ob.verified')}</div>`); await sleep(650); OB.otp = v; go('ob/id'); };
  const kp = bindKeypad(C.$('.keypad'), { max: 6, onChange: x => { v = x; paint(); if (v.length === 6) done(); } });
  C.$('#fill').addEventListener('click', async () => { for (const ch of '482913') { kp.set(kp.get() + ch); await sleep(130); } });
}

/* ------------------------------------------------------------------ Polaris (passport, MRZ, liveness, match) */
function id(ctx) {
  view(`<div class="screen" style="overflow:hidden;animation:none"><div id="polaris" style="position:absolute;inset:0"></div></div>`);
  const host = C.$('#polaris'); const q = new URLSearchParams(location.search);
  POL = mountPolaris(host, { lang: C.lang(), camera: q.get('camera') || 'auto', person: DEMO_PEOPLE[CFG.id === 'mobile' ? 0 : 1], continueLabel: t('ob.polaris_continue'), challengeList: q.get('challenges') ? q.get('challenges').split(',') : undefined, livenessTimeoutMs: q.get('timeout') ? +q.get('timeout') : undefined, allowDemo: true, allowUpload: true });
  window.__polaris = POL;
  POL.on('result', r => { OB.kyc = r; window.__polarisResult = r; })
    .on('continue', r => { OB.kyc = r; OB.profile = prefill(r); go('ob/details'); })
    .on('close', () => { go('ob/phone'); });
  const back = POL.root.querySelector('[data-act=back]');
  POL.on('step', e => { if (e.id === 'intro' && back) back.onclick = ev => { ev.stopPropagation(); go('ob/otp'); }; });
}
const titleCase = s => String(s || '').toLowerCase().replace(/(^|[\s'-])(\p{L})/gu, (m, a, b) => a + b.toUpperCase());
function prefill(r) {
  const d = r.document || {};
  return { name: titleCase([d.givenNames, d.surname].filter(Boolean).join(' ')), dob: d.dob, nat: d.nationality, doc: d.docNumber, sex: d.sex, expiry: d.expiry, photo: r.images && r.images.passportPhoto, selfie: r.images && r.images.selfie, decision: r.decision, mode: r.mode, ref: r.reference, match: r.match && Math.round(r.match.score * 100) };
}

/* ------------------------------------------------------------------ details */
function details(ctx) {
  const p = OB.profile; if (!p.name) { p.name = 'Nour El Huda Haddad'; p.dob = '1994-03-21'; p.nat = 'UTO'; p.doc = 'P4821907'; p.demoFill = true; }
  const dob = (p.dob || '').split('-').reverse().join('/');
  const tier = OB.kyc && OB.kyc.decision === 'accepted' ? 'std' : 'basic';
  view(`<div class="screen${ctx.back ? ' back' : ''}"><div class="sc-in">${topbar(t('ob.det_h'))}${prog(3)}
    <div class="sec">
      <div class="pocket f2" style="display:flex;gap:14px;align-items:center">${p.photo ? `<img src="${p.photo}" alt="" style="width:64px;height:80px;border-radius:14px;object-fit:cover;border:2px solid var(--surface)">` : `<span class="lead" style="width:64px;height:80px;border-radius:14px;background:var(--surface);display:grid;place-items:center">${ic('user', 'xl')}</span>`}
        <div style="min-width:0"><div class="eyebrow" style="opacity:.7">${t('ob.det_from')}</div><div style="font:700 19px/1.2 var(--display)">${esc(p.name)}</div><div class="sm num" style="opacity:.85">${esc(p.doc)} · ${esc(countryName(p.nat, C.lang()))}</div>
        <div class="row" style="gap:6px;margin-top:6px;flex-wrap:wrap"><span class="badge ${tier === 'std' ? 'ok' : 'warn'}">${ic('shield-check', 'sm')} ${t(tier === 'std' ? 'ob.id_ok' : 'ob.id_review')}</span></div></div></div>
      <div class="grid2"><div class="field"><label>${t('ob.dob')}</label><input class="input ltr" value="${esc(dob)}" readonly aria-readonly="true"></div><div class="field"><label>${t('ob.nat')}</label><input class="input" value="${esc(countryName(p.nat, C.lang()))}" readonly aria-readonly="true"></div></div>
      <div class="field"><label for="addr">${t('ob.addr')}</label><input id="addr" class="input" value="${esc(p.addr || '')}" placeholder="${t('ob.addr_ph')}" autocomplete="street-address"></div>
      <div class="grid2"><div class="field"><label for="occ">${t('ob.occ')}</label><select id="occ" class="input">${['emp', 'self', 'stu', 'ret'].map(k => `<option value="${k}" ${p.occ === k ? 'selected' : ''}>${t('ob.occ_' + k)}</option>`).join('')}</select></div>
        <div class="field"><label for="src">${t('ob.src')}</label><select id="src" class="input">${['sal', 'biz', 'fam', 'sav'].map(k => `<option value="${k}" ${p.src === k ? 'selected' : ''}>${t('ob.src_' + k)}</option>`).join('')}</select></div></div>
      <label class="row" style="gap:12px;align-items:flex-start"><input type="checkbox" id="mk" style="width:24px;height:24px;accent-color:var(--brand);margin-top:2px" ${p.mk ? 'checked' : ''}><span class="sm">${t('ob.marketing')}</span></label>
      <button class="btn block" id="dn">${t('c.continue')}${ic('arrow-right', 'flip')}</button>
    </div></div></div>`);
  C.$('#addr').value = p.addr || (p.addr = t('ob.addr_demo'));
  C.$('#dn').addEventListener('click', () => { p.addr = C.$('#addr').value; p.occ = C.$('#occ').value; p.src = C.$('#src').value; p.mk = C.$('#mk').checked; go('ob/plan'); });
}

/* ------------------------------------------------------------------ SIM / eSIM + starter plan */
function plan(ctx) {
  const plans = CFG.plans;
  OB.plan = OB.plan || plans[1].id;
  view(`<div class="screen${ctx.back ? ' back' : ''}"><div class="sc-in">${topbar(t('ob.plan_h'))}${prog(4)}
    <div class="sec">
      <h3 class="sec-h">${t('ob.sim_h')}</h3>
      <div class="grid2" role="radiogroup" aria-label="${t('ob.sim_h')}">${[['esim', 'esim', 'ob.esim', 'ob.esim_s'], ['sim', 'sim', 'ob.sim', 'ob.sim_s']].map(([k, i, a, b]) => `<button class="card choice" role="radio" aria-checked="${OB.sim === k}" data-sim="${k}" style="text-align:start;display:flex;flex-direction:column;gap:6px;min-height:48px"><span class="row">${ic(i, 'lg')}<span class="sp"></span><span class="tick">${ic('success-check')}</span></span><b>${t(a)}</b><span class="sm muted">${t(b)}</span></button>`).join('')}</div>
      <h3 class="sec-h" style="margin-top:6px">${t('ob.plan_s')}</h3>
      <div class="col" role="radiogroup" aria-label="${t('ob.plan_s')}">${plans.map(p => `<button class="card choice" role="radio" aria-checked="${OB.plan === p.id}" data-plan="${p.id}" style="text-align:start;display:flex;gap:14px;align-items:center;min-height:72px"><span class="lead" style="width:48px;height:48px;border-radius:14px;background:var(--${p.f});display:grid;place-items:center;color:var(--brand);flex:none">${ic(p.icon, 'lg')}</span><div style="flex:1"><div style="font-weight:800">${t(p.name)}</div><div class="sm muted">${t(p.desc)}</div></div><div style="font-weight:800;text-align:end">${p.price ? money(p.price, { short: true }) : t('ob.free')}<small style="display:block;font-weight:500;color:var(--muted);font-size:12px">${t('ob.per_month')}</small></div></button>`).join('')}</div>
      <button class="btn block" id="pn">${t('c.continue')}${ic('arrow-right', 'flip')}</button>
    </div></div></div>
    <style>.choice{border-width:2px;transition:border-color .25s,background .25s,transform .3s var(--spring-s)}.choice .tick{opacity:0;color:var(--ok);transform:scale(.4);transition:all .35s var(--spring-s)}.choice[aria-checked=true]{border-color:var(--brand);background:var(--f1)}.choice[aria-checked=true] .tick{opacity:1;transform:none}.choice:active{transform:scale(.97)}</style>`);
  const app = C.appEl();
  app.querySelectorAll('[data-sim]').forEach(b => b.addEventListener('click', () => { OB.sim = b.dataset.sim; app.querySelectorAll('[data-sim]').forEach(x => x.setAttribute('aria-checked', x === b)); haptic(8); }));
  app.querySelectorAll('[data-plan]').forEach(b => b.addEventListener('click', () => { OB.plan = b.dataset.plan; app.querySelectorAll('[data-plan]').forEach(x => x.setAttribute('aria-checked', x === b)); haptic(8); }));
  C.$('#pn').addEventListener('click', () => go('ob/pin'));
}

/* ------------------------------------------------------------------ PIN */
function pin(ctx) {
  let stage = 0, v = '', first = '';
  view(`<div class="screen${ctx.back ? ' back' : ''}"><div class="sc-in">${topbar(t('ob.pin_h'))}${prog(5)}
    <div class="sec" style="align-items:center;text-align:center">
      <span class="lead" style="width:64px;height:64px;border-radius:20px;background:var(--f1);display:grid;place-items:center;color:var(--brand)">${ic('lock', 'xl')}</span>
      <h3 id="pt" style="font:var(--dw) 22px var(--display)">${t('ob.pin_1')}</h3><p class="muted sm" id="ps">${t('ob.pin_s')}</p>
      <div class="pin-dots" id="pd" style="margin:10px 0">${Array.from({ length: 4 }, () => '<i></i>').join('')}</div>
      <div style="width:100%">${keypadHTML()}</div>
      <label class="row" style="gap:12px;margin-top:6px"><button class="switch" id="bio" role="switch" aria-checked="${OB.bio}" aria-label="${t('ob.bio')}"></button><span class="sm" style="text-align:start">${ic('face-id', 'sm')} ${t('ob.bio')}</span></label>
    </div></div></div>`);
  const dots = C.$('#pd'); const paint = () => [...dots.children].forEach((d, i) => d.classList.toggle('on', i < v.length));
  C.$('#bio').addEventListener('click', e => { OB.bio = !OB.bio; e.currentTarget.setAttribute('aria-checked', OB.bio); });
  const onc = async x => {
    v = x; paint(); if (v.length < 4) return; await sleep(180);
    if (stage === 0) { first = v; stage = 1; kp.set(''); C.$('#pt').textContent = t('ob.pin_2'); return; }
    if (v === first) { OB.pin = v; haptic([20, 40, 20]); go('ob/creating'); } else { dots.classList.add('err'); haptic(60); C.$('#ps').textContent = t('ob.pin_bad'); C.$('#ps').style.color = 'var(--err)'; await sleep(450); dots.classList.remove('err'); stage = 0; first = ''; kp.set(''); C.$('#pt').textContent = t('ob.pin_1'); }
  };
  const kp = bindKeypad(C.$('.keypad'), { max: 4, onChange: onc });
}

/* ------------------------------------------------------------------ creating the account (animated) */
function creating() {
  const steps = ['ob.cr1', 'ob.cr2', 'ob.cr3', CFG.id === 'mobile' ? 'ob.cr4m' : 'ob.cr4v', 'ob.cr5'];
  view(`<div class="screen" style="animation:none"><div class="sc-in" style="justify-content:center;align-items:center;padding:24px;gap:20px;text-align:center">
    <div style="position:relative;width:170px;height:170px;display:grid;place-items:center">${C.ring({ pct: 0.02, size: 170, stroke: 12, color: 'var(--accent)', mid: `<span class="big-num num" id="pc">0</span>` })}</div>
    <h2 style="font:var(--dw) 25px var(--display)">${t('ob.creating')}</h2>
    <div class="list" style="width:100%;text-align:start" id="crl">${steps.map((s, i) => `<div class="item" data-i="${i}" style="min-height:54px;opacity:.45;transition:opacity .4s"><span class="st" style="width:26px;height:26px;border-radius:50%;border:2px dashed var(--line);display:grid;place-items:center;flex:none;transition:all .35s var(--spring-s);color:transparent">${ic('success-check', 'sm')}</span><span class="t" style="font-weight:600;font-size:15px">${t(s)}</span></div>`).join('')}</div>
  </div></div>`);
  (async () => {
    const fg = C.$('.ring .fg'), circ = parseFloat(fg.getAttribute('stroke-dasharray')), pc = C.$('#pc');
    for (let i = 0; i < steps.length; i++) {
      const it = C.$(`[data-i="${i}"]`); if (!it) return; it.style.opacity = 1; it.querySelector('.st').style.cssText += 'border-style:solid;border-color:var(--brand);border-top-color:transparent;animation:tc-spin .8s linear infinite';
      await sleep(C.reduced() ? 60 : 650);
      const st = it.querySelector('.st'); st.style.cssText = 'width:26px;height:26px;border-radius:50%;display:grid;place-items:center;flex:none;background:var(--ok);border:2px solid var(--ok);color:#fff'; haptic(10);
      const p = (i + 1) / steps.length; fg.style.strokeDashoffset = circ * (1 - p); pc.textContent = Math.round(p * 100);
    }
    await sleep(300); if (C.path() === 'ob/creating') go('ob/sim');
  })();
}

/* ------------------------------------------------------------------ SIM / eSIM activation animation */
function sim() {
  const esim = OB.sim === 'esim';
  const steps = esim ? ['ob.es1', 'ob.es2', 'ob.es3', 'ob.es4'] : ['ob.sm1', 'ob.sm2', 'ob.sm3', 'ob.sm4'];
  view(`<div class="screen" style="animation:none;overflow:hidden"><div class="sc-in" style="padding:10px 18px 24px;gap:14px">
    ${topbar(t(esim ? 'ob.esim_act' : 'ob.sim_act'), { back: false })}
    <div class="pocket brand" style="padding:0;min-height:292px;display:grid;place-items:center" id="simart">${simArt(esim)}</div>
    <div style="text-align:center"><div class="eyebrow" id="snet" style="color:var(--muted)">${t('ob.net_search')}</div><div class="big-num num" id="snum" style="font-size:30px;margin-top:2px;min-height:34px;direction:ltr"></div></div>
    <div class="list" id="sl">${steps.map((s, i) => `<div class="item" data-i="${i}" style="min-height:54px;opacity:.4;transition:opacity .4s"><span class="st" style="width:26px;height:26px;border-radius:50%;border:2px dashed var(--line);display:grid;place-items:center;flex:none;color:transparent;transition:all .35s var(--spring-s)">${ic('success-check', 'sm')}</span><span style="font-weight:600">${t(s)}</span></div>`).join('')}</div>
    <button class="btn block" id="sgo" disabled>${t('ob.open_app', { app: L('app') })}</button>
  </div></div>
  <style>@keyframes tc-spin{to{transform:rotate(360deg)}}@keyframes tc-wave{0%{transform:scale(.4);opacity:.9}100%{transform:scale(1.5);opacity:0}}@keyframes tc-bar{from{transform:scaleY(.15);opacity:.3}to{transform:scaleY(1);opacity:1}}@keyframes tc-float{50%{transform:translateY(-6px)}}
  .simart .w{transform-box:fill-box;transform-origin:center;animation:tc-wave 2.2s infinite;opacity:0}.simart .w2{animation-delay:.7s}.simart .w3{animation-delay:1.4s}.simart.on .w{animation:none;opacity:0}.simart .sb rect{transform-box:fill-box;transform-origin:bottom;transform:scaleY(.15);opacity:.3}.simart.on .sb rect{animation:tc-bar .5s var(--spring) both}.simart.on .sb rect:nth-child(2){animation-delay:.12s}.simart.on .sb rect:nth-child(3){animation-delay:.24s}.simart.on .sb rect:nth-child(4){animation-delay:.36s}.simart .chip-g{animation:tc-float 2.6s ease-in-out infinite}</style>`);
  const art = C.$('#simart svg'), st = n => C.$(`[data-i="${n}"]`);
  (async () => {
    const hold = ms => sleep(C.reduced() ? 60 : ms);
    for (let i = 0; i < steps.length; i++) {
      const it = st(i); if (!it) return; it.style.opacity = 1; const s = it.querySelector('.st'); s.style.cssText += 'border-style:solid;border-color:var(--brand);border-top-color:transparent;animation:tc-spin .8s linear infinite';
      if (esim && i === 0) { const m = C.$('#simart .prof'); if (m) { m.style.transition = 'transform 1.3s cubic-bezier(.3,1.3,.5,1), opacity .6s'; m.style.transform = 'translateY(0)'; m.style.opacity = '1'; } }
      if (i === 1) { const pr = C.$('#simart .pbar'); if (pr) { pr.style.transition = 'transform 1.6s ease-out'; pr.style.transform = 'scaleX(1)'; } }
      await hold(i === 2 ? 1500 : 1250);
      s.style.cssText = 'width:26px;height:26px;border-radius:50%;display:grid;place-items:center;flex:none;background:var(--ok);border:2px solid var(--ok);color:#fff'; haptic(12);
      if (i === 2) { C.$('#snet').textContent = t('ob.net_found', { op: L('name') }); }
    }
    C.$('#simart svg').classList.add('on'); C.$('#snet').textContent = t('ob.net_ok', { op: L('name') }); C.$('#snet').style.color = 'var(--ok)';
    const num = msisdn(CFG.op.number); const el = C.$('#snum'); for (const ch of num) { el.textContent += ch; await sleep(C.reduced() ? 0 : 55); }
    haptic([30, 40, 60]);
    const b = C.$('#sgo'); b.disabled = false; b.addEventListener('click', () => go('ob/done'));
  })();
}
function simArt(esim) {
  return `<svg class="simart" viewBox="0 0 320 292" width="100%" height="292" role="img" aria-label="${t('ob.net_search')}" style="display:block"><g style="color:var(--on-brand)">
    <g transform="translate(160 150)"><circle class="w" r="64" fill="none" stroke="currentColor" stroke-width="3"/><circle class="w w2" r="64" fill="none" stroke="currentColor" stroke-width="3"/><circle class="w w3" r="64" fill="none" stroke="currentColor" stroke-width="3"/></g>
    <rect x="102" y="46" width="116" height="204" rx="22" fill="none" stroke="currentColor" stroke-width="5" opacity=".9"/><rect x="142" y="56" width="36" height="8" rx="4" fill="currentColor" opacity=".6"/>
    ${esim ? `<g class="prof" style="transform:translateY(-120px);opacity:0"><rect x="116" y="96" width="88" height="56" rx="12" style="fill:var(--accent)"/><text x="160" y="119" text-anchor="middle" style="fill:var(--on-accent);font:800 15px var(--display)">eSIM</text><rect x="126" y="130" width="68" height="6" rx="3" style="fill:var(--on-accent)" opacity=".5"/><circle cx="190" cy="108" r="6" style="fill:var(--on-accent)" opacity=".7"/></g>
      <g transform="translate(116 168)"><rect width="88" height="8" rx="4" fill="currentColor" opacity=".25"/><rect class="pbar" width="88" height="8" rx="4" style="fill:var(--accent);transform-origin:left;transform:scaleX(0)"/></g>` :
    `<g class="chip-g"><rect x="128" y="104" width="64" height="64" rx="10" style="fill:var(--accent)"/><rect x="140" y="118" width="40" height="36" rx="6" fill="none" style="stroke:var(--on-accent)" stroke-width="3"/><path d="M140 136h40M160 118v36" style="stroke:var(--on-accent)" stroke-width="3"/></g>`}
    <g class="sb" transform="translate(130 196)">${[0, 1, 2, 3].map(i => `<rect x="${i * 16}" y="${30 - (i + 1) * 8}" width="10" height="${(i + 1) * 8}" rx="3" fill="currentColor"/>`).join('')}</g>
    </g></svg>`;
}

/* ------------------------------------------------------------------ welcome home */
function done() {
  view(`<div class="screen" style="animation:none"><div class="sc-in" style="justify-content:center;align-items:center;text-align:center;padding:24px;gap:16px">
    <div class="anim-pop" style="width:120px;height:120px;border-radius:50%;background:var(--ok);color:#fff;display:grid;place-items:center">${ic('success-check', 'xl')}</div>
    <h1 style="font:var(--dw) 30px/1.1 var(--display)">${t('ob.done_h', { name: esc((OB.profile.name || '').split(' ')[0]) })}</h1>
    <p class="muted" style="max-width:300px">${t('ob.done_p', { app: L('app') })}</p>
    <div class="grid2" style="width:100%"><div class="pocket f3"><div class="eyebrow">${t('ob.bonus_data')}</div><div class="big-num num" style="font-size:30px">1 GB</div></div><div class="pocket f2"><div class="eyebrow">${t('ob.bonus_pts')}</div><div class="big-num num" style="font-size:30px">500</div></div></div>
    <button class="btn block" id="fin">${t('ob.open_wallet')}</button></div></div>`);
  
  C.$('#fin').addEventListener('click', () => { CFG.onFinish && CFG.onFinish(OB); });
}

C.add({
  'ob.skip_s': ['I already have an account', 'لدي حساب', 'J’ai déjà un compte'], 'ob.start': ['Get started', 'ابدأ الآن', 'Commencer'], 'ob.skip': ['I already have an account (skip onboarding)', 'لدي حساب (تخطَّ التسجيل)', 'J’ai déjà un compte (passer l’inscription)'],
  'ob.legal': ['Demonstration with simulated data and an invented operator. Polaris identity checks run on this device, demo-grade only.', 'عرض توضيحي ببيانات محاكاة ومشغّل مُختلق. تعمل فحوص هوية بولاريس على هذا الجهاز بمستوى العرض فقط.', 'Démonstration avec données simulées et opérateur fictif. Les contrôles d’identité Polaris tournent sur cet appareil, niveau démo uniquement.'],
  'ob.m.eyebrow': ['{op} · SIM-linked wallet', '{op} · محفظة مرتبطة بالشريحة', '{op} · portefeuille lié à la SIM'], 'ob.m.h': ['Your number is now your wallet', 'رقمك أصبح محفظتك', 'Votre numéro devient votre portefeuille'], 'ob.m.p': ['Open an account in minutes with your passport and a selfie, then get your eSIM or SIM activated without leaving the app.', 'افتح حساباً خلال دقائق بجواز سفرك وصورة سيلفي ثم فعّل شريحتك أو الشريحة الرقمية دون مغادرة التطبيق.', 'Ouvrez un compte en quelques minutes avec votre passeport et un selfie, puis activez votre eSIM ou SIM sans quitter l’app.'],
  'ob.v.eyebrow': ['{op} · mobile money', '{op} · المال عبر الجوال', '{op} · mobile money'], 'ob.v.h': ['Money in your pocket, agents on your street', 'المال في جيبك ووكلاء في شارعك', 'L’argent dans votre poche, des agents dans votre rue'], 'ob.v.p': ['Verify yourself once, then cash in, cash out, send and pay from your phone number.', 'تحقق من هويتك مرة واحدة ثم أودع وسحب وحوّل وادفع برقم هاتفك.', 'Vérifiez votre identité une fois, puis déposez, retirez, envoyez et payez avec votre numéro.'],
  'ob.f1': ['Passport and live selfie', 'جواز السفر وسيلفي مباشر', 'Passeport et selfie en direct'], 'ob.f1s': ['Checked on your device in seconds', 'يُفحص على جهازك خلال ثوانٍ', 'Vérifiés sur votre appareil en quelques secondes'],
  'ob.f2': ['SIM or eSIM, activated for you', 'شريحة أو شريحة رقمية مفعّلة لك', 'SIM ou eSIM activée pour vous'], 'ob.f2s': ['Number, plan and wallet linked', 'الرقم والباقة والمحفظة مرتبطة', 'Numéro, forfait et portefeuille liés'],
  'ob.f3m': ['Pay by QR, bundles and bills', 'ادفع بالرمز وباقات وفواتير', 'Payez par QR, forfaits et factures'], 'ob.f3ms': ['Everything on one number', 'كل شيء على رقم واحد', 'Tout sur un seul numéro'],
  'ob.f3v': ['Cash in and out at agents', 'إيداع وسحب لدى الوكلاء', 'Dépôt et retrait chez les agents'], 'ob.f3vs': ['Hundreds of agents near you', 'مئات الوكلاء بالقرب منك', 'Des centaines d’agents près de vous'],
  'ob.phone_h': ['Your phone number', 'رقم هاتفك', 'Votre numéro'], 'ob.phone_p': ['{op} will send a one-time code by SMS to confirm this number.', 'سيرسل {op} رمزاً لمرة واحدة برسالة نصية لتأكيد هذا الرقم.', '{op} enverra un code à usage unique par SMS pour confirmer ce numéro.'],
  'ob.detecting': ['Looking for your SIM…', 'جارٍ البحث عن شريحتك…', 'Recherche de votre SIM…'], 'ob.detecting_s': ['Reading the number from the SIM', 'قراءة الرقم من الشريحة', 'Lecture du numéro sur la SIM'], 'ob.sim_found': ['SIM found', 'تم العثور على الشريحة', 'SIM détectée'],
  'ob.number': ['Mobile number', 'رقم الجوال', 'Numéro de mobile'], 'ob.number_h': ['Demo number. Any 9 digits work.', 'رقم تجريبي. يصلح أي 9 أرقام.', 'Numéro de démo. N’importe quels 9 chiffres.'],
  'ob.terms': ['I accept the {op} wallet terms and privacy notice (demo).', 'أقبل شروط محفظة {op} وإشعار الخصوصية (عرض).', 'J’accepte les conditions du portefeuille {op} et l’avis de confidentialité (démo).'], 'ob.send_code': ['Send code', 'أرسل الرمز', 'Envoyer le code'],
  'ob.otp_h': ['Enter the code', 'أدخل الرمز', 'Saisissez le code'], 'ob.otp_p': ['We sent a 6-digit code to {n}.', 'أرسلنا رمزاً من 6 أرقام إلى {n}.', 'Nous avons envoyé un code à 6 chiffres au {n}.'], 'ob.otp_demo': ['Demo code:', 'الرمز التجريبي:', 'Code de démo :'], 'ob.fill': ['Fill', 'املأ', 'Remplir'], 'ob.verified': ['Number verified', 'تم التحقق من الرقم', 'Numéro vérifié'], 'ob.resend': ['Resend code in {s}', 'إعادة الإرسال بعد {s}', 'Renvoyer le code dans {s}'],
  'ob.polaris_continue': ['Continue', 'متابعة', 'Continuer'],
  'ob.det_h': ['Confirm your details', 'أكّد بياناتك', 'Confirmez vos informations'], 'ob.det_from': ['Read from your passport', 'مقروء من جواز سفرك', 'Lu sur votre passeport'], 'ob.id_ok': ['Identity verified', 'تم التحقق من الهوية', 'Identité vérifiée'], 'ob.id_review': ['Identity in review', 'الهوية قيد المراجعة', 'Identité en vérification'],
  'ob.dob': ['Date of birth', 'تاريخ الميلاد', 'Date de naissance'], 'ob.nat': ['Nationality', 'الجنسية', 'Nationalité'], 'ob.addr': ['Home address', 'عنوان السكن', 'Adresse'], 'ob.addr_ph': ['Street, district, city', 'الشارع، الحي، المدينة', 'Rue, quartier, ville'], 'ob.addr_demo': ['12 Orchard Street, Old Town, Utopia City', '12 شارع البستان، المدينة القديمة، مدينة يوتوبيا', '12 rue du Verger, Vieille Ville, Utopia City'],
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
