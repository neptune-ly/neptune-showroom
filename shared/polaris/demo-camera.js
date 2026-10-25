// Neptune Polaris (showroom) - "Demo camera": synthetic frames so the whole flow works with no camera (headless tests,
// desktops without a webcam, a locked-down meeting room). Nothing here is a real person: a flat-illustration avatar and a
// specimen passport of the fictional state "Utopia" (ICAO's example country code UTO) are drawn on canvases.
// The avatar "performs" the prompted challenge, and the module reports its (analytic) signals through the same liveness
// state machine as a real camera. It is labelled "Simulated" in the UI and its match score is a demo estimate.

import { buildTD3 } from './mrz.js';

const TAU = Math.PI * 2;
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const clamp01 = v => Math.max(0, Math.min(1, v));

export const DEMO_PEOPLE = [
  { id: 'noor', given: 'NOUR EL HUDA', surname: 'HADDAD', sex: 'F', dob: '1994-03-21', docNumber: 'P4821907', nationality: 'UTO', expiry: '2032-09-30', skin: '#D9A77B', hair: '#2B1B14', hairStyle: 'long', shirt: '#C8175D', place: 'UTOPIA CITY' },
  { id: 'karim', given: 'KARIM', surname: 'BENSALEM', sex: 'M', dob: '1989-11-02', docNumber: 'P7305514', nationality: 'UTO', expiry: '2031-05-17', skin: '#C58F66', hair: '#1A1411', hairStyle: 'short', shirt: '#07315F', place: 'UTOPIA CITY' },
];

/** Draw a flat-illustration avatar. p = {turn(-1..1 + = subject's left = viewer's right), blink 0..1, smile 0..1, tilt rad}.
 *  (cx,cy) head centre, hw head half-width. */
export function drawAvatar(g, person, p, cx, cy, hw) {
  const hh = hw * 1.28;
  const t = p.turn || 0, at = Math.abs(t);
  const sx = 1 - 0.1 * at;
  g.save();
  g.translate(cx, cy); g.rotate(p.tilt || 0);
  // shoulders / shirt
  g.fillStyle = person.shirt;
  g.beginPath(); g.ellipse(t * -hw * 0.05, hh * 1.35, hw * 1.75, hh * 0.7, 0, Math.PI, TAU); g.fill();
  g.fillRect(-hw * 1.75 - t * hw * 0.05, hh * 1.33, hw * 3.5, hh * 0.9);
  // neck
  g.fillStyle = shade(person.skin, -14);
  roundRect(g, -hw * 0.34 + t * hw * 0.04, hh * 0.55, hw * 0.68, hh * 0.75, hw * 0.2); g.fill();
  // back hair
  g.fillStyle = person.hair;
  if (person.hairStyle === 'long') { roundRect(g, -hw * 1.12 * sx + t * hw * 0.1, -hh * 0.95, hw * 2.24 * sx, hh * 2.0, hw * 0.9); g.fill(); }
  // ears
  g.fillStyle = shade(person.skin, -6);
  const ex = hw * 0.98 * sx;
  g.beginPath(); g.ellipse(-ex + t * hw * 0.2, hh * 0.08, hw * 0.13, hw * 0.2, 0, 0, TAU); g.fill();
  g.beginPath(); g.ellipse(ex + t * hw * 0.2, hh * 0.08, hw * 0.13, hw * 0.2, 0, 0, TAU); g.fill();
  // head
  g.fillStyle = person.skin;
  g.beginPath(); g.ellipse(t * hw * 0.16, 0, hw * sx, hh, 0, 0, TAU); g.fill();
  // cheek blush
  g.fillStyle = 'rgba(214,92,92,.16)';
  g.beginPath(); g.ellipse(-hw * 0.5 + t * hw * 0.5, hh * 0.28, hw * 0.2, hw * 0.12, 0, 0, TAU); g.fill();
  g.beginPath(); g.ellipse(hw * 0.5 + t * hw * 0.5, hh * 0.28, hw * 0.2, hw * 0.12, 0, 0, TAU); g.fill();
  // features shift further than the head outline when turned (this is the "depth" cue)
  const fx = t * hw * 0.62;
  // brows
  g.strokeStyle = person.hair; g.lineWidth = hw * 0.065; g.lineCap = 'round';
  for (const s of [-1, 1]) {
    const k = s === 1 ? 1 - Math.max(0, -t) * 0.35 : 1 - Math.max(0, t) * 0.35; // far-side features compress
    g.beginPath(); g.moveTo(s * hw * 0.62 * k + fx - hw * 0.2 * k, -hh * 0.3 - (p.smile || 0) * 3); g.quadraticCurveTo(s * hw * 0.5 * k + fx, -hh * 0.37, s * hw * 0.28 * k + fx + hw * 0.1 * k * s * -1, -hh * 0.3); g.stroke();
  }
  // eyes
  for (const s of [-1, 1]) {
    const far = s === 1 ? Math.max(0, -t) : Math.max(0, t);
    const k = 1 - far * 0.4;
    const ex2 = s * hw * 0.42 * (1 - at * 0.1) + fx, ey = -hh * 0.14;
    const w = hw * 0.17 * k, hgt = hw * 0.125 * (1 - clamp01(p.blink) * 0.92);
    g.fillStyle = '#fff'; g.beginPath(); g.ellipse(ex2, ey, w, Math.max(1.5, hgt), 0, 0, TAU); g.fill();
    if (p.blink < 0.7) { g.fillStyle = '#3B2417'; g.beginPath(); g.ellipse(ex2 + t * w * 0.5, ey, w * 0.5, Math.max(1, hgt * 0.8), 0, 0, TAU); g.fill(); g.fillStyle = '#fff'; g.beginPath(); g.arc(ex2 + t * w * 0.5 + w * 0.15, ey - hgt * 0.25, w * 0.13, 0, TAU); g.fill(); }
    g.strokeStyle = person.hair; g.lineWidth = hw * 0.04; g.beginPath(); g.ellipse(ex2, ey, w, Math.max(1.5, hgt), 0, Math.PI * 1.05, Math.PI * 1.95); g.stroke();
  }
  // nose (moves the most when the head turns)
  g.strokeStyle = shade(person.skin, -38); g.lineWidth = hw * 0.05;
  g.beginPath(); g.moveTo(fx * 1.25 + t * hw * 0.1, -hh * 0.05); g.quadraticCurveTo(fx * 1.25 + hw * 0.1 + t * hw * 0.2, hh * 0.16, fx * 1.25 - hw * 0.02 + t * hw * 0.12, hh * 0.2); g.stroke();
  g.fillStyle = shade(person.skin, -26); g.beginPath(); g.ellipse(fx * 1.25 + t * hw * 0.12, hh * 0.21, hw * 0.12, hw * 0.05, 0, 0, TAU); g.fill();
  // mouth
  const my = hh * 0.5, mw = hw * (0.3 + 0.16 * (p.smile || 0)), mx = fx * 1.1;
  g.strokeStyle = '#8E2F3A'; g.lineWidth = hw * 0.06; g.lineCap = 'round';
  g.beginPath(); g.moveTo(mx - mw, my - (p.smile || 0) * hw * 0.04); g.quadraticCurveTo(mx, my + hw * 0.04 + (p.smile || 0) * hw * 0.22, mx + mw, my - (p.smile || 0) * hw * 0.04); g.stroke();
  if ((p.smile || 0) > 0.5) { g.fillStyle = 'rgba(255,255,255,.9)'; g.beginPath(); g.moveTo(mx - mw * 0.75, my + hw * 0.015); g.quadraticCurveTo(mx, my + hw * 0.2, mx + mw * 0.75, my + hw * 0.015); g.quadraticCurveTo(mx, my + hw * 0.1, mx - mw * 0.75, my + hw * 0.015); g.fill(); }
  // front hair
  g.fillStyle = person.hair;
  g.beginPath();
  if (person.hairStyle === 'long') {
    g.ellipse(t * hw * 0.2, -hh * 0.45, hw * 1.04 * sx, hh * 0.62, 0, Math.PI * 0.97, Math.PI * 2.03);
    g.quadraticCurveTo(t * hw * 0.3 + hw * 0.4, -hh * 0.5, t * hw * 0.3 - hw * 0.6, -hh * 0.2); g.closePath();
  } else {
    g.ellipse(t * hw * 0.18, -hh * 0.36, hw * 1.02 * sx, hh * 0.66, 0, Math.PI * 1.02, Math.PI * 1.98);
    g.lineTo(hw * 0.9 * sx + t * hw * 0.2, -hh * 0.3); g.quadraticCurveTo(t * hw * 0.2, -hh * 0.55, -hw * 0.9 * sx + t * hw * 0.2, -hh * 0.3); g.closePath();
  }
  g.fill();
  g.restore();
}
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16), r = Math.max(0, Math.min(255, (n >> 16) + amt)), gg = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt)), b = Math.max(0, Math.min(255, (n & 255) + amt));
  return `rgb(${r},${gg},${b})`;
}
function roundRect(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }

let fontReady = null;
/** Load the MRZ monospace face from the vendor folder once (so the specimen prints identically everywhere). */
export function loadMrzFont(base) {
  if (fontReady) return fontReady;
  fontReady = (async () => {
    try {
      if (!document.fonts) return;
      const ff = new FontFace('PolarisMRZ', `url(${base}fonts/DejaVuSansMono-Bold.ttf)`);
      await ff.load(); document.fonts.add(ff);
    } catch (e) { /* fall back to system monospace */ }
  })();
  return fontReady;
}

/** Render a specimen passport data page (1000x704). */
export function renderPassport(person = DEMO_PEOPLE[0]) {
  const W = 1000, H = 704, c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d', { willReadFrequently: true });
  // paper + guilloche
  g.fillStyle = '#F7F1E1'; g.fillRect(0, 0, W, H);
  g.save(); g.globalAlpha = 0.5;
  for (let k = 0; k < 26; k++) { g.strokeStyle = k % 2 ? '#CFE3DD' : '#E8D9B8'; g.lineWidth = 1.2; g.beginPath(); for (let x = 0; x <= W; x += 8) { const y = 300 + Math.sin(x / 62 + k * 0.5) * (30 + k * 3) + Math.sin(x / 23 + k) * 6; x ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); }
  g.restore();
  // header band
  g.fillStyle = '#0B3B5C'; g.fillRect(0, 0, W, 86);
  g.fillStyle = '#fff'; g.font = '700 30px "Hanken Grotesk", system-ui, sans-serif'; g.textBaseline = 'middle';
  g.fillText('REPUBLIC OF UTOPIA  ·  SPECIMEN', 40, 34);
  g.font = '600 20px "Hanken Grotesk", system-ui, sans-serif'; g.fillStyle = '#BFE3F5'; g.fillText('PASSPORT / PASSEPORT / جواز سفر', 40, 64);
  g.fillStyle = '#E8B84B'; g.beginPath(); g.arc(W - 70, 43, 26, 0, TAU); g.fill(); g.fillStyle = '#0B3B5C'; g.font = '700 22px sans-serif'; g.textAlign = 'center'; g.fillText('U', W - 70, 44); g.textAlign = 'left';
  // photo
  const px = 40, py = 116, pw = 250, ph = 320;
  g.fillStyle = '#CFE6F2'; g.fillRect(px, py, pw, ph);
  g.save(); g.beginPath(); g.rect(px, py, pw, ph); g.clip();
  drawAvatar(g, person, { turn: 0, blink: 0, smile: 0.12 }, px + pw / 2, py + ph * 0.46, 82);
  g.restore();
  g.strokeStyle = '#7C8FA3'; g.lineWidth = 2; g.strokeRect(px, py, pw, ph);
  // fields
  const F = (label, val, x, y, w) => { g.fillStyle = '#5B6B7B'; g.font = '600 15px "Hanken Grotesk", system-ui, sans-serif'; g.fillText(label, x, y); g.fillStyle = '#10222F'; g.font = '700 27px "Hanken Grotesk", system-ui, sans-serif'; g.fillText(val, x, y + 30, w); };
  const fmt = d => { const [y, m, dd] = d.split('-'); const M = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'][+m - 1]; return `${dd} ${M} ${y}`; };
  g.textBaseline = 'alphabetic';
  F('Type / Type', 'P', 330, 138, 80); F('Code / Code', 'UTO', 440, 138, 100); F('Passport No. / N° de passeport', person.docNumber, 600, 138, 360);
  F('Surname / Nom', person.surname, 330, 205, 640); F('Given names / Prénoms', person.given, 330, 272, 640);
  F('Nationality / Nationalité', 'UTOPIAN', 330, 339, 300); F('Date of birth / Naissance', fmt(person.dob), 600, 339, 360);
  F('Sex / Sexe', person.sex, 330, 406, 100); F('Place of birth / Lieu', person.place, 440, 406, 300); F('Date of expiry / Expiration', fmt(person.expiry), 700, 406, 280);
  // watermark
  g.save(); g.translate(560, 330); g.rotate(-0.16); g.globalAlpha = 0.07; g.fillStyle = '#0B3B5C'; g.font = '800 96px "Hanken Grotesk", sans-serif'; g.textAlign = 'center'; g.fillText('DEMO', 0, 0); g.restore();
  // MRZ zone (clean white band so OCR is not disturbed)
  g.fillStyle = '#FFFFFF'; g.fillRect(0, 520, W, 184);
  const [l1, l2] = buildTD3({ issuer: 'UTO', surname: person.surname, givenNames: person.given, docNumber: person.docNumber, nationality: person.nationality, dob: person.dob, sex: person.sex, expiry: person.expiry, optional: '' });
  g.fillStyle = '#111'; g.textBaseline = 'middle';
  const fs = 25.2; g.font = `700 ${fs}px PolarisMRZ, "DejaVu Sans Mono", "Liberation Mono", Menlo, Consolas, monospace`;
  const cw = (W - 70) / 44;
  for (let r = 0; r < 2; r++) { const line = r ? l2 : l1; for (let i = 0; i < 44; i++) { g.textAlign = 'center'; g.fillText(line[i], 35 + cw * (i + 0.5), 578 + r * 62); } }
  g.textAlign = 'left';
  return { canvas: c, lines: [l1, l2], person };
}

/* ------------------------------------------------------------------ Demo camera */
/**
 * A fake "camera" that draws into a canvas and reports analytic signals.
 * mode 'selfie': the avatar walks into the guide, then performs whichever challenge the module cues.
 * mode 'passport': a specimen passport slides in and settles inside the guide, blurry first, then sharp.
 */
export class DemoCamera {
  constructor({ mode = 'selfie', person = DEMO_PEOPLE[0], size = [720, 960], rng = Math.random } = {}) {
    this.kind = 'demo'; this.mode = mode; this.person = person; this.rng = rng;
    this.w = size[0]; this.h = size[1];
    this.canvas = document.createElement('canvas'); this.canvas.width = this.w; this.canvas.height = this.h;
    this.g = this.canvas.getContext('2d', { willReadFrequently: true });
    this.t0 = performance.now(); this.running = false;
    this.pose = { turn: 0, blink: 0, smile: 0, tilt: 0, x: 0.5, y: 0.46, scale: 0.5 };
    this.action = null; this.tick = this.tick.bind(this);
    this.passport = null; this.mirror = false; this.guide = { w: 0.8, cy: 0.42 }; this.light = 1;
  }
  async init(vendorBase) {
    await loadMrzFont(vendorBase);
    if (this.mode === 'passport') this.passport = renderPassport(this.person);
    return this;
  }
  start() { this.running = true; this.t0 = performance.now(); this.raf = requestAnimationFrame(this.tick); return this; }
  stop() { this.running = false; cancelAnimationFrame(this.raf); }
  /** Module tells the avatar which action to perform; it reacts like a person: short reaction delay, then moves. */
  cue(challenge) {
    const now = performance.now(), react = 700 + this.rng() * 600;
    this.action = { type: challenge, start: now + react, end: now + react + (challenge === 'blink' ? 360 : challenge === 'smile' ? 1500 : 1700) };
  }
  tick() {
    if (!this.running) return;
    const now = performance.now(), el = (now - this.t0) / 1000;
    if (this.mode === 'selfie') this.drawSelfie(now, el); else this.drawPassport(el);
    this.raf = requestAnimationFrame(this.tick);
  }
  updatePose(now, el) {
    const p = this.pose;
    // walk-in: starts small, off-centre, dim; settles by ~2.4 s so the quality checks tick one by one
    const k = ease(clamp01(el / 2.4));
    p.x = lerp(0.62, 0.5, k) + Math.sin(el * 1.3) * 0.004; p.y = lerp(0.56, 0.46, k) + Math.sin(el * 1.7) * 0.003; p.scale = lerp(0.46, 0.7, ease(clamp01(el / 2.0)));
    p.tilt = Math.sin(el * 0.9) * 0.012;
    this.light = lerp(0.5, 1, ease(clamp01((el - 0.4) / 1.6)));
    let turn = 0, blink = 0, smile = 0;
    // idle: natural blink every ~4 s (spontaneous, not tied to a prompt) + breathing
    const idle = (el % 4.1);
    if (idle > 3.95) blink = Math.max(blink, Math.sin(((idle - 3.95) / 0.15) * Math.PI));
    const a = this.action;
    if (a && now >= a.start) {
      const u = clamp01((now - a.start) / (a.end - a.start));
      if (u >= 1) this.action = null;
      else if (a.type === 'blink') blink = Math.max(blink, Math.sin(u * Math.PI));
      else if (a.type === 'smile') smile = u < 0.3 ? ease(u / 0.3) : u > 0.75 ? ease((1 - u) / 0.25) : 1;
      else if (a.type === 'turnLeft' || a.type === 'turnRight') { const s = a.type === 'turnLeft' ? 1 : -1; turn = s * 0.78 * (u < 0.3 ? ease(u / 0.3) : u > 0.7 ? ease((1 - u) / 0.3) : 1); }
    }
    p.turn = turn; p.blink = blink; p.smile = smile;
  }
  drawSelfie(now, el) {
    const g = this.g, W = this.w, H = this.h;
    this.updatePose(now, el);
    const p = this.pose;
    // room: soft gradient + bokeh
    const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#6E8CA6'); gr.addColorStop(1, '#C9B9A2'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    for (let i = 0; i < 9; i++) { g.fillStyle = `rgba(255,255,255,${0.05 + (i % 3) * 0.03})`; g.beginPath(); g.arc((i * 137) % W, 120 + ((i * 211) % 400), 40 + (i % 4) * 22, 0, TAU); g.fill(); }
    drawAvatar(g, this.person, p, p.x * W, p.y * H, p.scale * 190);
    // lighting: dim at the start, lit by 2 s
    g.fillStyle = `rgba(8,12,20,${(1 - this.light) * 0.55})`; g.fillRect(0, 0, W, H);
    // grain so a "live" frame is never pixel identical
    g.fillStyle = 'rgba(255,255,255,.015)'; for (let i = 0; i < 40; i++) g.fillRect((Math.random() * W) | 0, (Math.random() * H) | 0, 2, 2);
    this.lastEl = el;
  }
  /** Analytic signal for the current frame (what the landmarker would measure). */
  signal(t) {
    const p = this.pose, H = this.h;
    const ear = 0.3 * (1 - p.blink * 0.85);
    const face = this.lastEl !== undefined;
    const hbox = (p.scale * 190 * 1.28 * 2) / H; // head height fraction
    return {
      t, face, faces: 1, box: { x: p.x - hbox * 0.36, y: p.y - hbox / 2, w: hbox * 0.72, h: hbox, cx: p.x, cy: p.y },
      ear, blink: p.blink, hasBlend: true, turn: p.turn * 0.6, pitch: 0, roll: (p.tilt * 180) / Math.PI,
      smile: p.smile, mouthW: 0.8, jaw: 0, luma: 55 + 90 * this.light, contrast: 38 * this.light + 8, sharp: 40,
      micro: 0.0016 + Math.abs(Math.sin(t / 130)) * 0.001, demo: true,
    };
  }
  /** Passport: slide in from below with a wobble, settle in the guide, defocus -> focus. guide = {x,y,w,h} fractions of the frame. */
  drawPassport(el) {
    const g = this.g, W = this.w, H = this.h;
    if (!this._desk) { // static desk background rendered once
      const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
      const desk = x.createLinearGradient(0, 0, W, H); desk.addColorStop(0, '#5A4636'); desk.addColorStop(1, '#2C2119'); x.fillStyle = desk; x.fillRect(0, 0, W, H);
      for (let i = 0; i < 80; i++) { x.strokeStyle = `rgba(255,255,255,${0.02 + (i % 4) * 0.01})`; x.beginPath(); x.moveTo(0, i * 19 + (i % 3)); x.bezierCurveTo(W * 0.3, i * 19 + 6, W * 0.7, i * 19 - 6, W, i * 19); x.stroke(); }
      this._desk = c;
    }
    g.drawImage(this._desk, 0, 0);
    const k = ease(clamp01((el - 0.2) / 1.7));
    const gw = this.guide.w * W, sc = gw / 1000;
    const cx = lerp(W * 0.78, W * 0.5, k), cy = lerp(H * 0.95, this.guide.cy * H, k);
    const rot = lerp(0.22, 0, k) + Math.sin(el * 2.2) * 0.004 * (1 - k);
    const blur = Math.max(0, 7 * (1 - clamp01((el - 1.4) / 1.0)));
    g.save(); g.translate(cx, cy); g.rotate(rot); const z = sc * lerp(0.86, 1, k); g.scale(z, z);
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(-488, -332, 1000, 704); // cheap soft shadow
    if (blur > 0.2) g.filter = `blur(${blur.toFixed(1)}px)`;
    g.drawImage(this.passport.canvas, -500, -352);
    g.restore(); g.filter = 'none';
    this.pSettled = clamp01((el - 2.4) / 0.3); this.pBlur = blur; this.lastEl = el;
  }
  setGuide(g) { this.guide = g; }
  /** Snapshot of the current frame as a canvas (full resolution). */
  snapshot() { const c = document.createElement('canvas'); c.width = this.w; c.height = this.h; c.getContext('2d').drawImage(this.canvas, 0, 0); return c; }
}
