// Voucher catalogue: invented brands with drawn marks (no real trademarks).
import { esc } from '../util.js';

// glyphs are drawn in a 24x24 box, white on the brand gradient
const G = {
  wave: '<path d="M3 15c3-7 6-7 9 0s6 7 9 0" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>',
  orbit: '<circle cx="12" cy="12" r="3.2" fill="#fff"/><path d="M4.5 12a7.5 7.5 0 0 1 15 0" fill="none" stroke="#fff" stroke-width="2.3" stroke-linecap="round"/><path d="M19.5 12a7.5 7.5 0 0 1-15 0" fill="none" stroke="#fff" stroke-width="2.3" stroke-linecap="round" opacity=".55"/>',
  signal: '<path d="M5 18V13M10 18V9M15 18V5M20 18V11" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none"/>',
  play: '<path d="M8 5.5v13l11-6.5z" fill="#fff"/>',
  note: '<path d="M9 17V6l9-2v11" fill="none" stroke="#fff" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="7" cy="17" r="2.4" fill="#fff"/><circle cx="16" cy="15" r="2.4" fill="#fff"/>',
  reel: '<circle cx="12" cy="12" r="8" fill="none" stroke="#fff" stroke-width="2.3"/><circle cx="12" cy="7.5" r="1.7" fill="#fff"/><circle cx="12" cy="16.5" r="1.7" fill="#fff"/><circle cx="7.5" cy="12" r="1.7" fill="#fff"/><circle cx="16.5" cy="12" r="1.7" fill="#fff"/>',
  pad: '<rect x="3" y="7.5" width="18" height="10" rx="5" fill="#fff"/><path d="M8 10.5v4M6 12.5h4" style="stroke:var(--c2)" stroke-width="1.8" stroke-linecap="round"/><circle cx="15.5" cy="11.5" r="1.2" style="fill:var(--c2)"/><circle cx="18" cy="13.7" r="1.2" style="fill:var(--c2)"/>',
  shield: '<path d="M12 3.5l7 2.6v5.3c0 4.3-3 7.4-7 9.1-4-1.7-7-4.8-7-9.1V6.1z" fill="#fff"/><path d="M9 11.5l2.2 2.2L15.2 9.6" fill="none" style="stroke:var(--c2)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  bolt: '<path d="M13.5 3L6 13.5h5L10 21l8-11h-5.2z" fill="#fff"/>',
  bag: '<path d="M5.5 8.5h13l-1 11h-11z" fill="#fff"/><path d="M9 10V7.5a3 3 0 0 1 6 0V10" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/>',
  tag: '<path d="M3.5 12.2V4.5h7.7L20 13.3 13.3 20z" fill="#fff"/><circle cx="8" cy="9" r="1.6" style="fill:var(--c2)"/>',
  cart: '<path d="M3.5 5h2.7l2 9.5h9l1.8-6.8H7" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="9.5" cy="18.5" r="1.7" fill="#fff"/><circle cx="16.5" cy="18.5" r="1.7" fill="#fff"/>',
  fork: '<path d="M7 3.5v6a2 2 0 0 0 4 0v-6M9 3.5v17M16 20.5V3.5c-2 1.5-3 4-3 7h3" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
  cup: '<path d="M5 8.5h11v6a4.5 4.5 0 0 1-4.5 4.5h-2A4.5 4.5 0 0 1 5 14.5z" fill="#fff"/><path d="M16 10h1.6a2.4 2.4 0 0 1 0 4.8H16" fill="none" stroke="#fff" stroke-width="2"/><path d="M8.5 3.5c-.8 1 .8 1.7 0 2.8M12 3.5c-.8 1 .8 1.7 0 2.8" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>',
  burger: '<path d="M4.5 11a7.5 6 0 0 1 15 0z" fill="#fff"/><rect x="4" y="12.6" width="16" height="2.2" rx="1.1" fill="#fff" opacity=".7"/><path d="M4.5 16.5h15a0 0 0 0 1 0 0 3.5 3.5 0 0 1-3.5 3.5h-8a3.5 3.5 0 0 1-3.5-3.5z" fill="#fff"/>',
  ring: '<circle cx="12" cy="12" r="7" fill="none" stroke="#fff" stroke-width="3"/><circle cx="12" cy="12" r="2" fill="#fff"/>',
};

export const VCATS = [
  ['all', ['All', 'Tout', 'الكل']], ['telecom', ['Telecom', 'Télécom', 'اتصالات']], ['stream', ['Streaming', 'Streaming', 'بث']], ['game', ['Gaming', 'Jeux', 'ألعاب']], ['shop', ['Shopping', 'Shopping', 'تسوق']], ['food', ['Food', 'Restauration', 'طعام']],
];
// d = fixed denominations (LYD), m = kind of product, how = redemption steps
export const VB = [
  { id: 'zephyr', n: ['Zephyr Mobile', 'Zephyr Mobile', 'زيفير موبايل'], cat: 'telecom', c: ['#2EB6E8', '#0B6BB5'], g: 'wave', d: [10, 20, 30, 50, 100], kind: ['Airtime recharge', 'Recharge crédit', 'شحن رصيد'], hot: 1 },
  { id: 'comet', n: ['Comet Telecom', 'Comet Telecom', 'كوميت للاتصالات'], cat: 'telecom', c: ['#F0605A', '#B02D3A'], g: 'orbit', d: [10, 20, 30, 50, 100], kind: ['Airtime recharge', 'Recharge crédit', 'شحن رصيد'] },
  { id: 'lumen', n: ['Lumen Net', 'Lumen Net', 'لومن نت'], cat: 'telecom', c: ['#2FC6A4', '#0A7F86'], g: 'signal', d: [25, 50, 75, 150], kind: ['Home internet credit', 'Crédit internet', 'رصيد إنترنت المنزل'] },
  { id: 'streamly', n: ['Streamly', 'Streamly', 'ستريملي'], cat: 'stream', c: ['#F0605A', '#A2263A'], g: 'play', d: [30, 60, 120], kind: ['Video subscription', 'Abonnement vidéo', 'اشتراك فيديو'], hot: 1 },
  { id: 'echo', n: ['Echo Music', 'Echo Music', 'إيكو ميوزك'], cat: 'stream', c: ['#7DD87A', '#1E8A5B'], g: 'note', d: [20, 40, 80], kind: ['Music subscription', 'Abonnement musique', 'اشتراك موسيقى'] },
  { id: 'cinebox', n: ['Cinebox', 'Cinebox', 'سينابوكس'], cat: 'stream', c: ['#5B7BE8', '#23306E'], g: 'reel', d: [25, 50, 100], kind: ['Movies & series', 'Films et séries', 'أفلام ومسلسلات'] },
  { id: 'pixelplay', n: ['PixelPlay', 'PixelPlay', 'بيكسل بلاي'], cat: 'game', c: ['#B06BF0', '#4A2A9E'], g: 'pad', d: [25, 50, 100, 200], kind: ['Game wallet credit', 'Crédit jeux', 'رصيد ألعاب'], hot: 1 },
  { id: 'arena', n: ['Arena Credits', 'Arena Credits', 'أرينا كريديتس'], cat: 'game', c: ['#FFB347', '#C0541A'], g: 'shield', d: [20, 50, 100], kind: ['In-game currency', 'Monnaie de jeu', 'عملة داخل اللعبة'] },
  { id: 'questly', n: ['Questly', 'Questly', 'كويستلي'], cat: 'game', c: ['#3BC1EE', '#2A4FB8'], g: 'bolt', d: [15, 30, 75], kind: ['Mobile game pass', 'Pass jeux mobile', 'بطاقة ألعاب الجوال'] },
  { id: 'bazaar', n: ['Bazaar', 'Bazaar', 'بازار'], cat: 'shop', c: ['#F7B955', '#D2622A'], g: 'bag', d: [50, 100, 200, 500], kind: ['Gift card', 'Carte cadeau', 'بطاقة هدية'], hot: 1 },
  { id: 'atlasmall', n: ['Atlas Mall', 'Atlas Mall', 'أطلس مول'], cat: 'shop', c: ['#34D1C6', '#0D7A78'], g: 'tag', d: [50, 100, 250], kind: ['Gift card', 'Carte cadeau', 'بطاقة هدية'] },
  { id: 'urbancart', n: ['Urban Cart', 'Urban Cart', 'أوربان كارت'], cat: 'shop', c: ['#8C98F0', '#3B3FA6'], g: 'cart', d: [30, 75, 150], kind: ['Online shopping credit', 'Crédit achats en ligne', 'رصيد تسوق إلكتروني'] },
  { id: 'savora', n: ['Savora', 'Savora', 'سافورا'], cat: 'food', c: ['#FF8A5B', '#D63D3A'], g: 'fork', d: [20, 40, 80], kind: ['Food delivery credit', 'Crédit livraison repas', 'رصيد توصيل الطعام'], hot: 1 },
  { id: 'nomad', n: ['Café Nomad', 'Café Nomad', 'مقهى نوماد'], cat: 'food', c: ['#C8935B', '#6B3F22'], g: 'cup', d: [10, 25, 50], kind: ['Café gift card', 'Carte cadeau café', 'بطاقة هدية مقهى'] },
  { id: 'biteclub', n: ['Bite Club', 'Bite Club', 'بايت كلوب'], cat: 'food', c: ['#FFC24B', '#E0572A'], g: 'burger', d: [15, 30, 60], kind: ['Restaurant gift card', 'Carte cadeau restaurant', 'بطاقة هدية مطعم'] },
];
export const vb = id => VB.find(b => b.id === id) || VB[0];
export const vl = (b, s = 56) => `<span class="vl" style="--s:${s}px;--c1:${b.c[0]};--c2:${b.c[1]}"><svg viewBox="0 0 24 24" aria-hidden="true">${G[b.g]}</svg></span>`;
export const vlName = b => esc(b.n[0]);
