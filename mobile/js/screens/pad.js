// Amount entry: huge unboxed amount + own numeric keypad (LTR digits, Western numerals).
import { $, $$, ic, icf, haptic, num } from '../util.js';
export const keysHtml = () => `<div class="keys">${[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, 'x'].map(k => k === 'x' ? `<button data-k="del" aria-label="delete">${ic('arrow-left')}</button>` : `<button data-k="${k}">${k === '.' ? '·' : k}</button>`).join('')}</div>`;
export function mountPad(el, { dec = 3, onChange }) {
  let v = ''; const big = $('.amt-big b', el);
  const show = () => { const [i, d] = v.split('.'); big.textContent = (i ? num(+i, 0) : '0') + (v.includes('.') ? '.' + (d || '') : ''); onChange && onChange(parseFloat(v) || 0) };
  $('.keys', el).addEventListener('click', e => {
    const b = e.target.closest('[data-k]'); if (!b) return; const k = b.dataset.k; haptic(5);
    if (k === 'del') v = v.slice(0, -1); else if (k === '.') { if (!v.includes('.')) v = (v || '0') + '.' } else { if (v.includes('.') && v.split('.')[1].length >= dec) return; if (v.replace('.', '').length >= 9) return; v = v === '0' ? k : v + k }
    show();
  });
  return { set(x) { v = String(x); show() }, get: () => parseFloat(v) || 0 };
}
