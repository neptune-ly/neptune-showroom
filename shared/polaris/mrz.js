// Neptune Polaris (showroom) - MRZ parser and builder. Pure ES module, no DOM: runs in browsers and in node.
// ICAO Doc 9303: TD3 (passport, 2x44), TD2 (2x36), TD1 (ID card, 3x30). Check digits use weights 7-3-1.
// This is a DEMO-GRADE reader: it validates check digits and repairs common OCR confusions, nothing more.

const W = [7, 3, 1];
const VAL = c => {
  if (c === '<') return 0;
  if (c >= '0' && c <= '9') return c.charCodeAt(0) - 48;
  if (c >= 'A' && c <= 'Z') return c.charCodeAt(0) - 55;
  return NaN;
};

/** ICAO check digit of a string (0-9 A-Z <). Returns a single digit char. */
export function checkDigit(s) {
  let sum = 0;
  for (let i = 0; i < s.length; i++) {
    const v = VAL(s[i]);
    if (Number.isNaN(v)) return '?';
    sum += v * W[i % 3];
  }
  return String(sum % 10);
}
/** True when `data` + `digit` agree. A '<' digit equals 0 only for optional data that is all fillers. */
export function checkOk(data, digit) {
  if (digit === '<') return /^<*$/.test(data);
  return checkDigit(data) === digit;
}

const NUM_FIX = { O: '0', Q: '0', D: '0', I: '1', L: '1', B: '8', S: '5', Z: '2', G: '6', T: '7' };
const ALPHA_FIX = { 0: 'O', 1: 'I', 8: 'B', 5: 'S', 2: 'Z', 6: 'G' };
const toNum = s => s.replace(/[A-Z<]/g, c => NUM_FIX[c] ?? c);
const toAlpha = s => s.replace(/[0-9]/g, c => ALPHA_FIX[c] ?? c);

/** Normalise raw OCR text of one line: upper-case, strip spaces, map look-alike chevrons to '<'. */
export function normLine(raw) {
  return String(raw || '')
    .toUpperCase()
    .replace(/[«‹〈⟨‹<]/g, '<')
    .replace(/\s+/g, '')
    .replace(/[^A-Z0-9<]/g, '<');
}

function iso(yymmdd, kind) {
  if (!/^\d{6}$/.test(yymmdd)) return null;
  const yy = +yymmdd.slice(0, 2), mm = +yymmdd.slice(2, 4), dd = +yymmdd.slice(4, 6);
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;
  const cur = new Date().getUTCFullYear() % 100;
  let yyyy;
  if (kind === 'dob') yyyy = yy > cur ? 1900 + yy : 2000 + yy;
  else yyyy = yy >= 70 ? 1900 + yy : 2000 + yy; // expiry: 2000-2069
  return `${yyyy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
}
const name = s => s.replace(/<+/g, ' ').trim();
// OCR often reads the '<' filler as K, C, L, E, X, S or I. Real names contain '<' only as separators, so a run of
// short all-lookalike tokens at the end of the given names is filler noise, not a name.
const LOOKALIKE = /^[KCLEXSI]{1,2}$/;
export function cleanNames(str) {
  const toks = str.split('<').filter(Boolean);
  let drop = 0;
  while (drop < toks.length - 1 && LOOKALIKE.test(toks[toks.length - 1 - drop])) drop++;
  const noise = (str.match(/<[KCL]</g) || []).length;
  if (drop >= 2 || (drop === 1 && noise >= 3)) toks.length -= drop;
  return toks.join(' ');
}
function splitNames(field) {
  const [sur, ...giv] = field.split('<<');
  return { surname: cleanNames(sur), givenNames: cleanNames(giv.join('<')) };
}
const clean = s => s.replace(/</g, ' ').trim().replace(/\s+/g, ' ');

/** Parse a TD3 passport MRZ (two 44-char lines). */
export function parseTD3(l1, l2) {
  const a = l1.padEnd(44, '<').slice(0, 44), b = l2.padEnd(44, '<').slice(0, 44);
  const docNumber = b.slice(0, 9), dob = b.slice(13, 19), exp = b.slice(21, 27), opt = b.slice(28, 42);
  const checks = {
    docNumber: checkOk(docNumber, b[9]),
    dob: checkOk(dob, b[19]),
    expiry: checkOk(exp, b[27]),
    optional: checkOk(opt, b[42]),
    composite: checkOk(b.slice(0, 10) + b.slice(13, 20) + b.slice(21, 43), b[43]),
  };
  const n = splitNames(a.slice(5));
  return finish('TD3', [a, b], checks, {
    docType: a.slice(0, 2).replace(/</g, ''), issuer: a.slice(2, 5).replace(/</g, ''),
    ...n, docNumber: docNumber.replace(/</g, ''), nationality: b.slice(10, 13).replace(/</g, ''),
    dob: iso(dob, 'dob'), sex: ['M', 'F'].includes(b[20]) ? b[20] : 'X', expiry: iso(exp, 'exp'), optional: clean(opt),
  });
}
/** Parse a TD2 (two 36-char lines). */
export function parseTD2(l1, l2) {
  const a = l1.padEnd(36, '<').slice(0, 36), b = l2.padEnd(36, '<').slice(0, 36);
  const docNumber = b.slice(0, 9), dob = b.slice(13, 19), exp = b.slice(21, 27), opt = b.slice(28, 35);
  const checks = {
    docNumber: checkOk(docNumber, b[9]), dob: checkOk(dob, b[19]), expiry: checkOk(exp, b[27]),
    composite: checkOk(b.slice(0, 10) + b.slice(13, 20) + b.slice(21, 35), b[35]),
  };
  return finish('TD2', [a, b], checks, {
    docType: a.slice(0, 2).replace(/</g, ''), issuer: a.slice(2, 5).replace(/</g, ''), ...splitNames(a.slice(5)),
    docNumber: docNumber.replace(/</g, ''), nationality: b.slice(10, 13).replace(/</g, ''),
    dob: iso(dob, 'dob'), sex: ['M', 'F'].includes(b[20]) ? b[20] : 'X', expiry: iso(exp, 'exp'), optional: clean(opt),
  });
}
/** Parse a TD1 ID card (three 30-char lines). */
export function parseTD1(l1, l2, l3) {
  const a = l1.padEnd(30, '<').slice(0, 30), b = l2.padEnd(30, '<').slice(0, 30), c = l3.padEnd(30, '<').slice(0, 30);
  const docNumber = a.slice(5, 14), dob = b.slice(0, 6), exp = b.slice(8, 14);
  const checks = {
    docNumber: checkOk(docNumber, a[14]), dob: checkOk(dob, b[6]), expiry: checkOk(exp, b[14]),
    composite: checkOk(a.slice(5, 30) + b.slice(0, 7) + b.slice(8, 15) + b.slice(18, 29), b[29]),
  };
  return finish('TD1', [a, b, c], checks, {
    docType: a.slice(0, 2).replace(/</g, ''), issuer: a.slice(2, 5).replace(/</g, ''), ...splitNames(c),
    docNumber: docNumber.replace(/</g, ''), nationality: b.slice(15, 18).replace(/</g, ''),
    dob: iso(dob, 'dob'), sex: ['M', 'F'].includes(b[7]) ? b[7] : 'X', expiry: iso(exp, 'exp'), optional: clean(a.slice(15, 30) + ' ' + b.slice(18, 29)),
  });
}
function finish(format, lines, checks, f) {
  const keys = Object.keys(checks);
  const valid = keys.every(k => checks[k]);
  return { format, lines, checks, valid, score: keys.filter(k => checks[k]).length / keys.length, ...f };
}

/** Repair a TD3/TD2/TD1 line pair by type-aware character substitutions (digits where digits belong, letters where letters belong). */
function typeFix3(l1, l2) {
  const a = l1.padEnd(44, '<').slice(0, 44);
  let b = l2.padEnd(44, '<').slice(0, 44).split('');
  const put = (from, to, fn) => { const s = fn(b.slice(from, to).join('')); for (let i = 0; i < s.length; i++) b[from + i] = s[i]; };
  put(9, 10, toNum); put(10, 13, toAlpha); put(13, 20, toNum); put(21, 28, toNum); put(42, 44, toNum);
  if (!['M', 'F', '<'].includes(b[20])) b[20] = '<';
  const aa = a.slice(0, 2) + toAlpha(a.slice(2, 5)) + a.slice(5);
  return [aa, b.join('')];
}

/** Find an MRZ in free OCR text. Returns the best parsed candidate (valid or not) or null. */
export function findMrz(text) {
  const raw = String(text || '').split(/\r?\n/).map(normLine).filter(l => l.length >= 24);
  const cands = [];
  const addScore = r => cands.push(r);
  for (let i = 0; i < raw.length; i++) {
    const L = raw[i].length;
    // TD3
    if (L >= 38 && raw[i + 1] && raw[i + 1].length >= 38) {
      const [x, y] = typeFix3(raw[i], raw[i + 1]);
      addScore(parseTD3(x, y));
    }
    // TD1
    if (L >= 26 && L <= 34 && raw[i + 1] && raw[i + 2] && raw[i + 1].length >= 26 && raw[i + 2].length >= 20) {
      const r = parseTD1(raw[i], raw[i + 1], raw[i + 2]); addScore(r);
    }
    // TD2
    if (L >= 32 && L <= 38 && raw[i + 1] && raw[i + 1].length >= 32 && raw[i + 1].length <= 38) {
      addScore(parseTD2(raw[i], raw[i + 1]));
    }
  }
  if (!cands.length) return null;
  cands.sort((p, q) => q.score - p.score || (q.dob ? 1 : 0) - (p.dob ? 1 : 0));
  const best = cands[0];
  return best.score > 0 ? best : null;
}

/** Try single-character repairs on failing digit fields (O/0, I/1, B/8, S/5, Z/2, G/6). Returns a (possibly improved) TD3 parse. */
export function repairTD3(parsed) {
  if (!parsed || parsed.format !== 'TD3' || parsed.valid) return parsed;
  const a = parsed.lines[0];
  let b = parsed.lines[1];
  const SW = { 0: ['O', 'D', 'Q'], 1: ['I', 'L'], 8: ['B'], 5: ['S'], 2: ['Z'], 6: ['G'], 7: ['T'], O: ['0'], I: ['1'], B: ['8'], S: ['5'], Z: ['2'], G: ['6'] };
  const fields = [[0, 9, 9], [13, 19, 19], [21, 27, 27], [28, 42, 42]]; // [from, to, checkIdx]
  const best = parsed;
  for (const [from, to, ci] of fields) {
    if (checkOk(b.slice(from, to), b[ci])) continue;
    // Prefer letter->digit swaps (the commoner OCR direction), then digit->letter; take the first single-character fix that satisfies the check.
    const cands = [];
    for (let i = from; i < to; i++) for (const alt of SW[b[i]] || []) cands.push([/[A-Z]/.test(b[i]) ? 0 : 1, i, alt]);
    cands.sort((p, q) => p[0] - q[0]);
    for (const [, i, alt] of cands) {
      const nb = b.slice(0, i) + alt + b.slice(i + 1);
      if (checkOk(nb.slice(from, to), nb[ci])) { b = nb; break; }
    }
    // the check digit itself may be the mis-read character
    if (!checkOk(b.slice(from, to), b[ci])) {
      const d = checkDigit(b.slice(from, to));
      if (d !== '?' && (SW[b[ci]] || []).includes(d)) b = b.slice(0, ci) + d + b.slice(ci + 1);
    }
  }
  // OCR often reads the '<' fillers of the optional-data field as K/C/L/E/S/X/I. Test "the field is all fillers" and "lookalikes are fillers".
  let p2 = parseTD3(a, b);
  if (!p2.checks.optional || !p2.checks.composite) {
    const opt = b.slice(28, 42), tries = ['<'.repeat(14), opt.replace(/[KCLESXI]/g, '<')];
    for (const o of tries) {
      const nb = b.slice(0, 28) + o + b.slice(42), c = parseTD3(a, nb);
      if (c.score > p2.score) { p2 = c; b = nb; }
      if (c.valid) break;
    }
  }
  return p2.score >= best.score ? { ...p2, repaired: true } : best;
}

/** Build a TD3 MRZ pair. dob/expiry accept 'YYYY-MM-DD'. Used by the Demo camera passport and by unit tests. */
export function buildTD3({ issuer = 'UTO', surname, givenNames, docNumber, nationality = 'UTO', dob, sex = 'F', expiry, optional = '' }) {
  const yymmdd = d => d.replace(/-/g, '').slice(2);
  const pad = (s, n) => (s + '<'.repeat(n)).slice(0, n);
  const nm = (surname.toUpperCase().replace(/[^A-Z ]/g, '').trim().replace(/ +/g, '<') + '<<' + givenNames.toUpperCase().replace(/[^A-Z ]/g, '').trim().replace(/ +/g, '<'));
  const l1 = pad('P<' + issuer + nm, 44);
  const dn = pad(docNumber.toUpperCase(), 9), db = yymmdd(dob), ex = yymmdd(expiry), op = pad(optional.toUpperCase(), 14);
  const body = dn + checkDigit(dn) + nationality + db + checkDigit(db) + sex + ex + checkDigit(ex) + op + checkDigit(op);
  const comp = checkDigit(body.slice(0, 10) + body.slice(13, 20) + body.slice(21, 43));
  return [l1, body + comp];
}

/** Compact field list for UI check-by-check progress: [[key, ok], ...] */
export function checkList(p) {
  if (!p) return [];
  return Object.entries(p.checks);
}

/** Full ISO-3166 alpha-3 names for the few codes the demo uses (the real country names stay fictional: UTO = Utopia in ICAO examples). */
export const COUNTRY = {
  UTO: { en: 'Utopia (demo)', fr: 'Utopie (démo)', ar: 'يوتوبيا (تجريبي)' },
  LBY: { en: 'Libya', fr: 'Libye', ar: 'ليبيا' }, MRT: { en: 'Mauritania', fr: 'Mauritanie', ar: 'موريتانيا' },
  MAR: { en: 'Morocco', fr: 'Maroc', ar: 'المغرب' }, TUN: { en: 'Tunisia', fr: 'Tunisie', ar: 'تونس' },
  DZA: { en: 'Algeria', fr: 'Algérie', ar: 'الجزائر' }, EGY: { en: 'Egypt', fr: 'Égypte', ar: 'مصر' },
  SEN: { en: 'Senegal', fr: 'Sénégal', ar: 'السنغال' }, CIV: { en: 'Côte d’Ivoire', fr: 'Côte d’Ivoire', ar: 'ساحل العاج' },
  FRA: { en: 'France', fr: 'France', ar: 'فرنسا' }, GBR: { en: 'United Kingdom', fr: 'Royaume-Uni', ar: 'المملكة المتحدة' },
  USA: { en: 'United States', fr: 'États-Unis', ar: 'الولايات المتحدة' }, D: { en: 'Germany', fr: 'Allemagne', ar: 'ألمانيا' },
  TUR: { en: 'Türkiye', fr: 'Turquie', ar: 'تركيا' }, SDN: { en: 'Sudan', fr: 'Soudan', ar: 'السودان' },
  MLI: { en: 'Mali', fr: 'Mali', ar: 'مالي' }, NER: { en: 'Niger', fr: 'Niger', ar: 'النيجر' }, TCD: { en: 'Chad', fr: 'Tchad', ar: 'تشاد' },
};
export const countryName = (code, lang = 'en') => (COUNTRY[code] && (COUNTRY[code][lang] || COUNTRY[code].en)) || code;
