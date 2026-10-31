// Fails if any shipped app source uses smooth gradients (hard-stop repeating dashes are allowed).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
const skip = new Set(['_shots','_test','node_modules','vendor','design-reference','.git','showroom-pictures']);
const bad = [];
// The two flagship apps are exempt: their premium look uses brand gradients on purpose.
const gradientOk = ['mobile', 'vega/app', 'telco', 'brand/apps'];
function walk(d){ for (const n of readdirSync(d)) { if (skip.has(n)) continue; const p = join(d,n), st = statSync(p);
  if (st.isDirectory()) { walk(p); continue; }
  if (!/\.(css|js|html|svg)$/.test(n)) continue;
  if (gradientOk.some(g => p.replace(/\\/g,'/').includes('/' + g + '/') || p.startsWith(g + '/'))) continue;
  const t = readFileSync(p,'utf8');
  const re = /(?<!repeating-)(linear|radial|conic)-gradient\(|<linearGradient|<radialGradient/g; let m;
  while ((m = re.exec(t))) bad.push(`${p}: ${t.slice(m.index, m.index+60).replace(/\s+/g,' ')}`);
}}
walk(process.argv[2] || '.');
if (bad.length) { console.error(bad.join('\n')); console.error(`\n${bad.length} gradient use(s) found. Showroom design is flat.`); process.exit(1); }
console.log('flat check passed');
