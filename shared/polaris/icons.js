// Neptune Polaris (showroom) - tiny inline icon set (24px grid, 2px stroke, currentColor). Own drawings, no external assets.
const P = {
  camera: '<path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.2l1.1-1.6A1.5 1.5 0 0 1 10 4h4a1.5 1.5 0 0 1 1.2.4L16.3 6h1.2A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5z"/><circle cx="12" cy="12.5" r="3.4"/>',
  upload: '<path d="M12 16V5"/><path d="M7.5 9.5 12 5l4.5 4.5"/><path d="M5 15v2.5A1.5 1.5 0 0 0 6.5 19h11a1.5 1.5 0 0 0 1.5-1.5V15"/>',
  shield: '<path d="M12 3.2 5 5.8v5.6c0 4.2 2.8 7.5 7 9.4 4.2-1.9 7-5.2 7-9.4V5.8z"/><path d="m8.8 12 2.3 2.3 4.2-4.6"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  x: '<path d="M6 6l12 12M18 6 6 18"/>',
  face: '<circle cx="12" cy="12" r="8.5"/><path d="M9 10.2v.6M15 10.2v.6"/><path d="M8.8 14.4c.8 1.1 1.9 1.7 3.2 1.7s2.4-.6 3.2-1.7"/>',
  idcard: '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><circle cx="8.6" cy="11" r="2"/><path d="M5.8 16c.5-1.5 1.5-2.2 2.8-2.2s2.3.7 2.8 2.2"/><path d="M14 10h4.5M14 13h4.5M14 16h2.5"/>',
  eye: '<path d="M2.8 12S6 6.2 12 6.2 21.2 12 21.2 12 18 17.8 12 17.8 2.8 12 2.8 12z"/><circle cx="12" cy="12" r="2.7"/>',
  chevL: '<path d="m14.5 6-6 6 6 6"/>',
  chevR: '<path d="m9.5 6 6 6-6 6"/>',
  arrowL: '<path d="M19 12H5"/><path d="m11 6-6 6 6 6"/>',
  arrowR: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
  smile: '<circle cx="12" cy="12" r="8.5"/><path d="M9 10v.8M15 10v.8"/><path d="M8 13.6c1 1.9 2.3 2.8 4 2.8s3-.9 4-2.8"/>',
  turn: '<circle cx="11" cy="11" r="5.2"/><path d="M5 20c.7-2.6 2.9-4 6-4s5.3 1.4 6 4"/><path d="M19.2 5.5c1.1.9 1.8 2 2 3.4"/><path d="m21.4 6.6-.2 2.4-2.3-.5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"/>',
  move: '<path d="M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15"/>',
  lock: '<rect x="5" y="10.5" width="14" height="9.5" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
  info: '<circle cx="12" cy="12" r="8.6"/><path d="M12 11v5"/><path d="M12 7.8v.1"/>',
  sparkle: '<path d="M12 3.5 13.7 9l5.5 1.7-5.5 1.7L12 18l-1.7-5.6L4.8 10.7 10.3 9z"/>',
  refresh: '<path d="M4.5 12a7.5 7.5 0 0 1 13-5.1L19.5 9"/><path d="M19.5 4.8V9h-4.2"/><path d="M19.5 12a7.5 7.5 0 0 1-13 5.1L4.5 15"/><path d="M4.5 19.2V15h4.2"/>',
  scan: '<path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"/><path d="M4 12h16"/>',
  clock: '<circle cx="12" cy="12" r="8.6"/><path d="M12 7.5V12l3 2"/>',
  user: '<circle cx="12" cy="8.5" r="3.6"/><path d="M5 20c.8-3.6 3.5-5.5 7-5.5s6.2 1.9 7 5.5"/>',
  bolt: '<path d="M13 3 5.5 13.2H11L10 21l7.5-10.2H12z"/>',
  film: '<rect x="3.5" y="5" width="17" height="14" rx="2.5"/><path d="M8 5v14M16 5v14M3.5 9.5H8M3.5 14.5H8M16 9.5h4.5M16 14.5h4.5"/>',
};
export function icon(name, size = 24, extra = '') {
  const body = P[name];
  if (!body) return '';
  return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${body}</svg>`;
}
/** Blinking-eye glyph with an animated lid (used in the blink prompt). */
export function blinkIcon(size = 30) {
  return `<svg class="po-ic-blink" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><g class="lid"><path d="M2.8 12S6 6.2 12 6.2 21.2 12 21.2 12 18 17.8 12 17.8 2.8 12 2.8 12z"/><circle cx="12" cy="12" r="2.7"/></g></svg>`;
}
export const ICONS = Object.keys(P);
