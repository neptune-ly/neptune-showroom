// Drawn glyphs: spending categories (24px, stroke) and voucher brand art (fictional brands, 160x100).
const sv = (body, s) => `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
const G = {
  food: '<path d="M5 9h11v4.5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5Z"/><path d="M16 10h1.6a2.4 2.4 0 0 1 0 4.8H16M8.5 3.5v2.2M12 3.5v2.2"/>',
  groceries: '<path d="M3 4h2.4l2 10.2a1.5 1.5 0 0 0 1.5 1.2h7.7a1.5 1.5 0 0 0 1.5-1.1L20 8H6.2"/><circle cx="9.5" cy="19.2" r="1.2"/><circle cx="16.5" cy="19.2" r="1.2"/>',
  transport: '<path d="M5 17V8.5A2.5 2.5 0 0 1 7.5 6h6A2.5 2.5 0 0 1 16 8.5V17M5 12.5h11M16 9h1.6l1.9 2.4V17H16"/><path d="M3.5 20h15"/>',
  bills: '<path d="M13 2.5 5 13.5h6l-1 8 8-11h-6Z"/>',
  shopping: '<path d="M5.5 8h13l-1 11.2a1.6 1.6 0 0 1-1.6 1.4H8.1a1.6 1.6 0 0 1-1.6-1.4Z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
  health: '<rect x="4" y="9" width="16" height="11" rx="3"/><path d="M12 12v5M9.5 14.5h5M8 9V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
  fun: '<path d="M4 8.5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2V10a2 2 0 0 0 0 4v1.5a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V14a2 2 0 0 0 0-4Z"/><path d="M14 7v10" stroke-dasharray="1.5 2.5"/>',
  transfers: '<path d="M7 17 17 7M9 7h8v8"/>',
  other: '<circle cx="12" cy="12" r="8"/><path d="M12 8v4l2.5 1.5"/>'
};
export const catGlyph = (k, s = 22) => sv(G[k] || G.other, s);

/* tone per spending category / transaction type */
export const CAT_TONE = { food: 'sand', groceries: 'teal', transport: 'sky', bills: 'navy', shopping: 'coral', health: 'rose', fun: 'amber', transfers: 'coral', other: 'sand' };
export const TYPE_TONE = { send: 'coral', receive: 'teal', cashin: 'teal', cashout: 'sand', bill: 'navy', airtime: 'sky', cashback: 'amber', exchange: 'navy', voucher: 'coral', topup: 'teal' };

/* ---- voucher brand art ---- */
const art = (id, c1, c2, body) => `<svg class="vart" viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="va-${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="160" height="100" fill="url(#va-${id})"/><g fill="none" stroke="#fff" stroke-opacity=".14"><circle cx="150" cy="-4" r="34"/><circle cx="150" cy="-4" r="52"/><circle cx="150" cy="-4" r="70"/></g>${body}</svg>`;
const W = '#fff';
export const VOUCHERS = [
  { id: 'pulse', name: 'Pulse Mobile', cat: 'telecom', vals: [1000, 2000, 5000, 10000], hot: 1, art: art('pulse', '#07315F', '#1E8FD0', `<path d="M24 56h26l9-26 15 48 11-38 9 16h42" fill="none" stroke="${W}" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="133" cy="56" r="5" fill="#3BC1EE"/>`) },
  { id: 'aurora', name: 'Aurora Telecom', cat: 'telecom', vals: [1000, 2000, 5000], art: art('aurora', '#00798A', '#07315F', `<g fill="none" stroke-linecap="round"><path d="M28 78C50 22 110 22 132 78" stroke="${W}" stroke-width="5.5"/><path d="M46 78C60 44 100 44 114 78" stroke="#8FE9DA" stroke-width="5.5"/><path d="M64 78c6-14 26-14 32 0" stroke="#F0CE9D" stroke-width="5.5"/></g>`) },
  { id: 'nimbus', name: 'Nimbus Data', cat: 'telecom', vals: [2000, 5000, 10000], art: art('nimbus', '#3BC1EE', '#1666B0', `<path d="M42 72a16 16 0 0 1 4-31.4 23 23 0 0 1 43-4A18 18 0 0 1 112 72Z" fill="${W}"/><path d="M62 82h38" stroke="#fff" stroke-opacity=".55" stroke-width="4.5" stroke-linecap="round"/>`) },
  { id: 'streambox', name: 'StreamBox', cat: 'streaming', vals: [1500, 3000, 6000], hot: 1, art: art('streambox', '#EB4E4D', '#7A1F3A', `<rect x="36" y="26" width="88" height="54" rx="12" fill="${W}"/><path d="M71 40v26l22-13Z" fill="#EB4E4D"/><path d="M58 90h44" stroke="#fff" stroke-opacity=".6" stroke-width="4.5" stroke-linecap="round"/>`) },
  { id: 'melodia', name: 'Melodia', cat: 'streaming', vals: [1200, 2400, 4800], art: art('melodia', '#F59E4B', '#D6405A', `<path d="M70 30v38" stroke="${W}" stroke-width="6" stroke-linecap="round"/><path d="M70 30l32-8v36" fill="none" stroke="${W}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="60" cy="70" rx="12" ry="9" fill="${W}"/><ellipse cx="92" cy="60" rx="12" ry="9" fill="${W}"/>`) },
  { id: 'playverse', name: 'PlayVerse', cat: 'gaming', vals: [2000, 5000, 10000], hot: 1, art: art('playverse', '#07315F', '#00A8AE', `<path d="M44 38h72a14 14 0 0 1 14 15l-3 18a9 9 0 0 1-15 5l-8-9H56l-8 9a9 9 0 0 1-15-5l-3-18A14 14 0 0 1 44 38Z" fill="${W}"/><path d="M52 49v12M46 55h12" stroke="#07315F" stroke-width="4" stroke-linecap="round"/><circle cx="106" cy="52" r="4" fill="#EB4E4D"/><circle cx="116" cy="60" r="4" fill="#00A8AE"/>`) },
  { id: 'pixelpass', name: 'PixelPass', cat: 'gaming', vals: [1500, 3000, 6000], art: art('pixelpass', '#4A2A7A', '#EB4E4D', `<g fill="${W}"><rect x="48" y="28" width="18" height="18" rx="4"/><rect x="71" y="28" width="18" height="18" rx="4" opacity=".55"/><rect x="94" y="28" width="18" height="18" rx="4"/><rect x="48" y="51" width="18" height="18" rx="4" opacity=".55"/><rect x="71" y="51" width="18" height="18" rx="4"/><rect x="94" y="51" width="18" height="18" rx="4" opacity=".55"/><rect x="48" y="74" width="18" height="12" rx="4"/><rect x="94" y="74" width="18" height="12" rx="4"/></g>`) },
  { id: 'skymarket', name: 'SkyMarket', cat: 'shopping', vals: [2500, 5000, 10000, 20000], hot: 1, art: art('skymarket', '#00A8AE', '#07315F', `<path d="M48 40h64l-5 40a6 6 0 0 1-6 5H59a6 6 0 0 1-6-5Z" fill="${W}"/><path d="M64 40v-6a16 16 0 0 1 32 0v6" fill="none" stroke="${W}" stroke-width="5.5" stroke-linecap="round"/><path d="M68 58q12 11 24 0" fill="none" stroke="#00A8AE" stroke-width="5" stroke-linecap="round"/>`) },
  { id: 'olive', name: 'Olive & Co.', cat: 'shopping', vals: [2500, 5000, 10000], art: art('olive', '#C9A14F', '#6B7B3A', `<path d="M80 86V42" stroke="${W}" stroke-width="5" stroke-linecap="round"/><path d="M80 52C58 52 48 40 46 26c20 0 34 8 34 26Z" fill="${W}"/><path d="M80 66c22 0 32-12 34-26-20 0-34 8-34 26Z" fill="#fff" fill-opacity=".72"/>`) },
  { id: 'zaytun', name: 'Zaytun Café', cat: 'food', vals: [1000, 2500, 5000], art: art('zaytun', '#6B3A22', '#E39A4E', `<path d="M48 48h54v22a16 16 0 0 1-16 16H64a16 16 0 0 1-16-16Z" fill="${W}"/><path d="M102 54h6a10 10 0 0 1 0 20h-6" fill="none" stroke="${W}" stroke-width="6" stroke-linecap="round"/><path d="M62 38c-4-5 4-8 0-14M76 38c-4-5 4-8 0-14M90 38c-4-5 4-8 0-14" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="4.5" stroke-linecap="round"/>`) },
  { id: 'foodrun', name: 'FoodRun', cat: 'food', vals: [1500, 3000, 6000], hot: 1, art: art('foodrun', '#F0A53F', '#EB4E4D', `<path d="M80 90C58 66 50 56 50 44a30 30 0 0 1 60 0c0 12-8 22-30 46Z" fill="${W}"/><path d="M70 32v16m6-16v16m6-16v16M70 48h12M76 48v16" fill="none" stroke="#EB4E4D" stroke-width="3.6" stroke-linecap="round"/><path d="M90 32c4 0 6 6 6 14h-6Z" fill="#EB4E4D"/>`) }
];
export const VCATS = ['telecom', 'streaming', 'gaming', 'shopping', 'food'];
export const voucher = id => VOUCHERS.find(v => v.id === id);
