// Hand-written SVG charts. Width-aware (re-painted on resize), draw-in animation via CSS (.enter ancestor), hover tips via data-tip.
(function () {
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const CH = window.CH = { fns: [], uid: 0 };
  CH.short = v => { const a = Math.abs(v); const s = a >= 1e6 ? (a / 1e6).toFixed(a >= 1e7 ? 0 : 1).replace(/\.0$/, "") + "M" : a >= 1e3 ? (a / 1e3).toFixed(a >= 1e4 ? 0 : 1).replace(/\.0$/, "") + "K" : String(Math.round(a)); return (v < 0 ? "−" : "") + s; };
  const nice = max => { const p = Math.pow(10, Math.floor(Math.log10(max || 1))), f = max / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p; };
  CH.reset = () => { CH.fns = []; };
  // Placeholder; painted after the view renders (needs real width).
  CH.mount = (fn, h = 220, cls = "") => { CH.fns.push(fn); return `<div class="cx ${cls}" data-cx="${CH.fns.length - 1}" style="height:${h}px" data-h="${h}"></div>`; };
  CH.paint = root => {
    (root || document).querySelectorAll(".cx").forEach(el => {
      const w = Math.floor(el.clientWidth), h = +el.dataset.h, fn = CH.fns[+el.dataset.cx];
      if (!fn || w < 40) return; if (el.dataset.w == w) return; el.dataset.w = w;
      el.innerHTML = fn(w, h);
    });
  };
  const sp = (pts, t = .5) => { // smooth path through points (Catmull-Rom -> bezier)
    if (pts.length < 2) return ""; let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < pts.length - 1; i++) { const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
      const c1 = [p1[0] + (p2[0] - p0[0]) * t / 3 * 1, p1[1] + (p2[1] - p0[1]) * t / 3 * 1], c2 = [p2[0] - (p3[0] - p1[0]) * t / 3, p2[1] - (p3[1] - p1[1]) * t / 3];
      d += `C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`; }
    return d;
  };
  CH.legend = items => `<ul class="legend">${items.map(x => `<li><i style="background:${x.c}"></i>${esc(x.n)}</li>`).join("")}</ul>`;

  // Cash-flow: grouped bars (in/out) + net line, with a forecast zone (dashed line + confidence band).
  CH.cash = o => (W, H) => {
    const L = 44, R = 48, T0 = 14, B = 26, n = o.labels.length, f = o.forecastFrom, id = ++CH.uid;
    const all = [...o.inflow, ...o.outflow], max = nice(Math.max(...all) * 1.08), pw = W - L - R, ph = H - T0 - B, bw = pw / n;
    const y = v => T0 + ph * (1 - v / max), x = i => L + bw * i + bw / 2, g = Math.min(bw * .5, 24);
    let s = "";
    for (let k = 0; k <= 4; k++) { const v = max * k / 4, yy = y(v); s += `<line x1="${L}" x2="${W - R}" y1="${yy}" y2="${yy}" class="gl"/><text x="${L - 6}" y="${yy + 4}" text-anchor="end" class="at">${CH.short(v)}</text>`; }
    if (f != null) s += `<rect x="${L + bw * f}" y="${T0}" width="${pw - bw * f}" height="${ph}" class="fz"/><text x="${L + bw * f + 8}" y="${T0 + 12}" class="at fzl">${esc(o.fl || "Forecast")}</text>`;
    const step = Math.ceil(n / Math.max(3, Math.floor(W / 64)));
    o.labels.forEach((l, i) => {
      const fc = f != null && i >= f, bi = (bw - g) / 2;
      const tip = `<b>${esc(l)}</b><br>${esc(o.nIn)}: ${NX.fmt(o.inflow[i])}<br>${esc(o.nOut)}: ${NX.fmt(o.outflow[i])}<br>${esc(o.nNet)}: ${NX.fmt(o.net[i])}`;
      s += `<rect class="bar ${fc ? "fc" : ""}" style="--i:${i}" x="${(L + bw * i + g / 2).toFixed(1)}" y="${y(o.inflow[i]).toFixed(1)}" width="${(bi - 1).toFixed(1)}" height="${(y(0) - y(o.inflow[i])).toFixed(1)}" rx="${Math.min(5, bi / 2)}" fill="var(--c1)"/>`;
      s += `<rect class="bar ${fc ? "fc" : ""}" style="--i:${i}" x="${(L + bw * i + g / 2 + bi).toFixed(1)}" y="${y(o.outflow[i]).toFixed(1)}" width="${(bi - 1).toFixed(1)}" height="${(y(0) - y(o.outflow[i])).toFixed(1)}" rx="${Math.min(5, bi / 2)}" fill="var(--c3)"/>`;
      if (i % step === 0) s += `<text x="${x(i)}" y="${H - 7}" text-anchor="middle" class="at">${esc(l)}</text>`;
      s += `<rect x="${L + bw * i}" y="${T0}" width="${bw}" height="${ph}" fill="transparent" class="hit" data-tip="${esc(tip)}"/>`;
    });
    // net line (history solid, forecast dashed)
    const nb = o.net.map((v, i) => v + (f != null && i >= f ? (o.band[i - f] || 0) : 0)), nl = o.net.map((v, i) => v - (f != null && i >= f ? (o.band[i - f] || 0) : 0)), nmin = Math.min(...nl), nmax = Math.max(...nb), nr = (nmax - nmin) || 1;
    const ny = v => T0 + ph * (.06 + .5 * (1 - (v - nmin) / nr));
    [0, .5, 1].forEach(k => { s += `<text x="${W - R + 6}" y="${ny(nmin + nr * (1 - k)) + 4}" class="at ra">${CH.short(nmin + nr * (1 - k))}</text>`; });
    const pts = o.net.map((v, i) => [x(i), ny(v)]);
    const hist = f != null ? pts.slice(0, f) : pts, fut = f != null ? pts.slice(f - 1) : [];
    if (f != null && o.band) { const up = o.net.map((v, i) => [x(i), ny(v + (i >= f ? o.band[i - f] : 0))]).slice(f - 1), dn = o.net.map((v, i) => [x(i), ny(v - (i >= f ? o.band[i - f] : 0))]).slice(f - 1).reverse();
      s += `<path class="band" d="${sp(up)} L${dn.map(p => p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" L")} Z"/>`; }
    s += `<path d="${sp(hist)}" fill="none" stroke="var(--surface)" stroke-width="6" stroke-linecap="round" opacity=".8"/><path class="draw net" pathLength="1" d="${sp(hist)}" fill="none" stroke="var(--ink)" stroke-width="2.6" stroke-linecap="round"/>`;
    if (fut.length) s += `<path class="draw net dash" pathLength="1" d="${sp(fut)}" fill="none" stroke="var(--ink)" stroke-width="2.4" stroke-dasharray="5 6" stroke-linecap="round" style="stroke-dasharray:5 6"/>`;
    return `<svg class="chart" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label)}">${s}</svg>`;
  };

  // Smooth area/line with optional second series and hover tips.
  CH.area = o => (W, H) => {
    const L = o.noAxis ? 6 : 44, R = 8, T0 = 10, B = o.noAxis ? 6 : 24, id = ++CH.uid, n = o.vals.length, all = [...o.vals, ...(o.vals2 || [])];
    const mn = o.min != null ? o.min : Math.min(...all) * .96, mx = Math.max(...all) * 1.03, rng = (mx - mn) || 1, pw = W - L - R, ph = H - T0 - B;
    const x = i => L + pw * i / (n - 1), y = v => T0 + ph * (1 - (v - mn) / rng); let s = "";
    if (!o.noAxis) for (let k = 0; k <= 3; k++) { const v = mn + rng * k / 3, yy = y(v); s += `<line x1="${L}" x2="${W - R}" y1="${yy}" y2="${yy}" class="gl"/><text x="${L - 6}" y="${yy + 4}" text-anchor="end" class="at">${CH.short(v)}</text>`; }
    const col = o.color || "var(--c1)", pts = o.vals.map((v, i) => [x(i), y(v)]), d = sp(pts);
    s += ``;
    s += `<path class="area" d="${d} L${x(n - 1)},${T0 + ph} L${x(0)},${T0 + ph} Z" fill="${col}" fill-opacity=".12"/>`;
    if (o.vals2) s += `<path class="draw" pathLength="1" d="${sp(o.vals2.map((v, i) => [x(i), y(v)]))}" fill="none" stroke="var(--c3)" stroke-width="2" stroke-linecap="round" style="stroke-dasharray:4 5"/>`;
    s += `<path class="draw" pathLength="1" d="${d}" fill="none" stroke="${col}" stroke-width="${o.sw || 2.6}" stroke-linecap="round"/>`;
    if (!o.noAxis && o.labels) { const step = Math.ceil(n / Math.max(3, Math.floor(W / 70))); o.labels.forEach((l, i) => { if (i % step === 0) s += `<text x="${x(i)}" y="${H - 6}" text-anchor="middle" class="at">${esc(l)}</text>`; });
      o.vals.forEach((v, i) => { s += `<circle class="pt" cx="${x(i)}" cy="${y(v)}" r="4.5" fill="var(--surface)" stroke="${col}" stroke-width="2.4"/><rect x="${x(i) - pw / n / 2}" y="${T0}" width="${pw / n}" height="${ph}" fill="transparent" class="hit" data-tip="${esc("<b>" + o.labels[i] + "</b><br>" + (o.fmt ? o.fmt(v) : NX.fmt(v)))}" data-pt="1"/>`; }); }
    if (o.last) s += `<circle cx="${x(n - 1)}" cy="${y(o.vals[n - 1])}" r="4.5" fill="${col}" class="pulse"/>`;
    return `<svg class="chart" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label || "")}">${s}</svg>`;
  };

  CH.spark = (vals, color = "var(--p)", w = 96, h = 32) => {
    const mn = Math.min(...vals), mx = Math.max(...vals), rng = (mx - mn) || 1, pts = vals.map((v, i) => [2 + (w - 4) * i / (vals.length - 1), h - 3 - (h - 6) * (v - mn) / rng]);
    return `<svg class="spark" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true"><path class="draw" pathLength="1" d="${sp(pts)}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round"/></svg>`;
  };

  CH.donut = (parts, center, sub, size = 168) => {
    const tot = parts.reduce((a, p) => a + p.v, 0), r = size / 2 - 16, c = 2 * Math.PI * r, cx = size / 2; let off = 0;
    const segs = parts.map((p, i) => { const len = p.v / tot * c, seg = `<circle class="seg" style="--i:${i};--len:${Math.max(len - 3, .5).toFixed(1)};--c:${c.toFixed(1)}" cx="${cx}" cy="${cx}" r="${r}" fill="none" stroke="${p.c}" stroke-width="22" stroke-dasharray="${Math.max(len - 3, .5).toFixed(1)} ${(c).toFixed(1)}" stroke-dashoffset="${(-off).toFixed(1)}" transform="rotate(-90 ${cx} ${cx})" data-tip="${esc("<b>" + p.l + "</b><br>" + (p.t || NX.fmt(p.v)))}"/>`; off += len; return seg; }).join("");
    return `<svg class="donutsvg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="${esc(parts.map(p => p.l + " " + (p.t || p.v)).join(", "))}"><circle cx="${cx}" cy="${cx}" r="${r}" fill="none" stroke="var(--soft2)" stroke-width="22" opacity=".5"/>${segs}<text x="${cx}" y="${cx + 2}" text-anchor="middle" class="dc">${esc(center)}</text><text x="${cx}" y="${cx + 20}" text-anchor="middle" class="ds">${esc(sub || "")}</text></svg>`;
  };

  CH.ring = (pct, size = 44, tone = "var(--p)", label = "", sw = 5) => {
    const r = (size - sw) / 2, c = 2 * Math.PI * r, d = Math.max(0, Math.min(100, pct)) / 100 * c;
    return `<svg class="ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" role="img" aria-label="${esc(label)}"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--soft2)" stroke-width="${sw}"/><circle class="rg" style="--len:${d.toFixed(1)};--c:${c.toFixed(1)}" cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${tone}" stroke-width="${sw}" stroke-linecap="round" stroke-dasharray="${d.toFixed(1)} ${c.toFixed(1)}" transform="rotate(-90 ${size / 2} ${size / 2})"/>${label ? `<text x="${size / 2}" y="${size / 2 + 4}" text-anchor="middle" class="rt">${esc(label)}</text>` : ""}</svg>`;
  };

  CH.hbars = (items, o = {}) => { const mx = Math.max(...items.map(i => i.v), 1), f = o.fmt || (v => NX.fmt(v));
    return `<div class="hb">${items.map((i, k) => `<div class="hbr"><span class="hl">${esc(i.l)}</span><span class="hbar"><i style="--w:${(i.v / mx * 100).toFixed(1)}%;--i:${k};background:${i.c || "var(--c1)"}"></i></span><span class="hv num">${esc(f(i.v))}</span></div>`).join("")}</div>`; };

  // stacked horizontal composition bar (treasury positions)
  CH.stack = parts => { const tot = parts.reduce((a, p) => a + p.v, 0);
    return `<div class="stack">${parts.map((p, i) => `<i style="--w:${(p.v / tot * 100).toFixed(2)}%;--i:${i};background:${p.c}" data-tip="${esc("<b>" + p.l + "</b><br>" + (p.t || NX.fmt(p.v)))}"></i>`).join("")}</div>`; };

  // month heat strip for scheduled payments
  CH.heat = (vals, labels, hue = "var(--p)") => { const mx = Math.max(...vals, 1);
    return `<div class="heat">${vals.map((v, i) => `<i style="--i:${i};--t:${Math.round(8 + v / mx * 86)}%" data-tip="${esc("<b>" + labels[i] + "</b><br>" + NX.fmt(v))}"></i>`).join("")}</div>`; };
})();
