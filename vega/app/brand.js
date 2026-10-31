import { qrSvg } from '../assets/core.js';
// Vega star mark. Long N-S-E-W rays, short diagonals, sonar arcs; fills with currentColor.
const LONG = 'M0-46C2.4-16 11-4.4 36 0C11 4.4 2.4 16 0 46C-2.4 16-11 4.4-36 0C-11-4.4-2.4-16 0-46Z';
export const vegaStar = (cls = '', arcs = true) => `<svg class="vstar ${cls}" viewBox="${arcs ? "-60 -60 120 120" : "-48 -48 96 96"}" aria-hidden="true"><g fill="currentColor"><path d="${LONG}"/><path d="${LONG}" transform="rotate(45) scale(.64)"/></g>${arcs ? '<g fill="none" stroke="currentColor" stroke-linecap="round"><path d="M17-45A48 48 0 0 1 45-17" stroke-width="3" opacity=".6"/><path d="M8-58A59 59 0 0 1 58-8" stroke-width="2.4" opacity=".34"/></g>' : ''}</svg>`;
export const vegaLogo = (cls = '') => `<span class="vlogo ${cls}"><span class="vlogo-m">${vegaStar()}</span><b>Vega</b></span>`;

// Same decorative QR as the shared helper, with the Vega star in the centre.
export const qrV = (seed, o = {}) => {
  const n = o.n || 29, c = n / 2;
  return qrSvg(seed, o).replace(/<g transform="translate\([^"]*\)"><rect[\s\S]*<\/g>/, `<g transform="translate(${c} ${c}) scale(.05)"><rect x="-50" y="-50" width="100" height="100" rx="26" fill="var(--look-brand)"/><g fill="#fff" transform="scale(.62)"><path d="${LONG}"/><path d="${LONG}" transform="rotate(45) scale(.64)"/></g></g>`);
};
