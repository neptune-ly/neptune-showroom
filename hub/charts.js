// Inline-SVG chart helpers. Text sizes are in viewBox units; wide charts scroll on narrow screens (.chart-wrap).
(function () {
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const nice = max => { const p = Math.pow(10, Math.floor(Math.log10(max || 1))); const f = max / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p; };
  const CH = window.CH = {};
  CH.colors = ["var(--c1)", "var(--c2)", "var(--c3)", "var(--c4)", "var(--c5)"];
  CH.legend = s => `<ul class="legend">${s.map((x, i) => `<li><i style="background:${x.color || CH.colors[i % 5]}"></i>${esc(x.name)}</li>`).join("")}</ul>`;
  CH.line = (o) => {
    const W = 640, H = o.h || 220, L = 46, R = 12, T0 = 12, B = 28, n = o.labels.length, all = o.series.flatMap(s => s.vals), max = nice(Math.max(...all, 1)), fmt = o.fmt || (v => v);
    const x = i => L + (W - L - R) * (n === 1 ? .5 : i / (n - 1)), y = v => T0 + (H - T0 - B) * (1 - v / max);
    const grid = [0, .25, .5, .75, 1].map(f => { const yy = T0 + (H - T0 - B) * (1 - f); return `<line x1="${L}" x2="${W - R}" y1="${yy}" y2="${yy}" class="gl"/><text x="${L - 6}" y="${yy + 4}" text-anchor="end" class="at">${esc(fmt(max * f))}</text>`; }).join("");
    const step = Math.ceil(n / 8), xl = o.labels.map((l, i) => i % step === 0 ? `<text x="${x(i)}" y="${H - 8}" text-anchor="middle" class="at">${esc(l)}</text>` : "").join("");
    const lines = o.series.map((s, k) => { const c = s.color || CH.colors[k % 5], pts = s.vals.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
      return `${o.area !== false && k === 0 ? `<polygon points="${x(0)},${y(0)} ${pts} ${x(n - 1)},${y(0)}" fill="${c}" opacity=".13"/>` : ""}<polyline points="${pts}" fill="none" stroke="${c}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>${s.vals.map((v, i) => `<circle cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="${n > 20 ? 0 : 3.2}" fill="var(--surface)" stroke="${c}" stroke-width="2"><title>${esc(s.name)} · ${esc(o.labels[i])}: ${esc(fmt(v))}</title></circle>`).join("")}`; }).join("");
    return `<div class="chart-wrap"><svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label || "")}">${grid}${xl}${lines}</svg></div>${o.series.length > 1 ? CH.legend(o.series) : ""}`;
  };
  CH.bars = (o) => { // o.series: [{name, vals, color}] ; stacked when o.stacked
    const W = 640, H = o.h || 220, L = 46, R = 12, T0 = 12, B = 28, n = o.labels.length, fmt = o.fmt || (v => v);
    const tot = i => o.series.reduce((a, s) => a + s.vals[i], 0), max = nice(o.stacked ? Math.max(...o.labels.map((_, i) => tot(i)), 1) : Math.max(...o.series.flatMap(s => s.vals), 1));
    const y = v => T0 + (H - T0 - B) * (1 - v / max), bw = (W - L - R) / n, gap = bw * .28, k = o.stacked ? 1 : o.series.length;
    const grid = [0, .5, 1].map(f => { const yy = T0 + (H - T0 - B) * (1 - f); return `<line x1="${L}" x2="${W - R}" y1="${yy}" y2="${yy}" class="gl"/><text x="${L - 6}" y="${yy + 4}" text-anchor="end" class="at">${esc(fmt(max * f))}</text>`; }).join("");
    const bars = o.labels.map((l, i) => { let acc = 0; return o.series.map((s, j) => { const c = s.color || CH.colors[j % 5], v = s.vals[i], w1 = (bw - gap) / k, xx = L + bw * i + gap / 2 + (o.stacked ? 0 : w1 * j);
      const y0 = o.stacked ? y(acc + v) : y(v), hh = (o.stacked ? y(acc) : y(0)) - y0; acc += v; return `<rect x="${xx.toFixed(1)}" y="${y0.toFixed(1)}" width="${w1.toFixed(1)}" height="${Math.max(hh, 0).toFixed(1)}" rx="5" fill="${c}"><title>${esc(s.name)} · ${esc(l)}: ${esc(fmt(v))}</title></rect>`; }).join(""); }).join("");
    const xl = o.labels.map((l, i) => `<text x="${L + bw * i + bw / 2}" y="${H - 8}" text-anchor="middle" class="at">${esc(l)}</text>`).join("");
    return `<div class="chart-wrap"><svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label || "")}">${grid}${bars}${xl}</svg></div>${o.series.length > 1 ? CH.legend(o.series) : ""}`;
  };
  CH.hbars = (items, o = {}) => { // [{l, v, c}] horizontal bars as HTML for crisp text
    const max = Math.max(...items.map(i => i.v), 1), fmt = o.fmt || (v => v);
    return `<div class="hb">${items.map((i, k) => `<div class="hbr"><span class="hl">${esc(i.l)}</span><span class="hbar"><i style="width:${(i.v / max * 100).toFixed(1)}%;background:${i.c || o.color || "var(--c1)"}"></i></span><span class="hv num">${esc(fmt(i.v))}</span></div>`).join("")}</div>`;
  };
  CH.donut = (parts, center, sub) => {
    const tot = parts.reduce((a, p) => a + p.v, 0) || 1, r = 52, c = 2 * Math.PI * r; let off = 0;
    const segs = parts.map((p, i) => { const len = p.v / tot * c, s = `<circle cx="70" cy="70" r="${r}" fill="none" stroke="${p.c || CH.colors[i % 5]}" stroke-width="20" stroke-dasharray="${Math.max(len - 2, 0).toFixed(1)} ${(c - len + 2).toFixed(1)}" stroke-dashoffset="${(-off).toFixed(1)}" transform="rotate(-90 70 70)"><title>${esc(p.l)}: ${p.v}</title></circle>`; off += len; return s; }).join("");
    return `<div class="donut"><svg viewBox="0 0 140 140" role="img" aria-label="${esc(parts.map(p => p.l + " " + p.v).join(", "))}">${segs}<text x="70" y="70" text-anchor="middle" class="dc">${esc(center || "")}</text><text x="70" y="88" text-anchor="middle" class="ds">${esc(sub || "")}</text></svg>${CH.legend(parts.map((p, i) => ({ name: p.l + " · " + p.v, color: p.c || CH.colors[i % 5] })))}</div>`;
  };
  CH.heat = (mat, rows, cols, o = {}) => { // mat[r][c] numbers
    const cw = 34, ch = 27, L = 52, T0 = 4, B = 22, W = L + cols.length * cw, H = T0 + rows.length * ch + B, flat = mat.flat(), mn = Math.min(...flat), mx = Math.max(...flat), fmt = o.fmt || (v => v);
    const cells = mat.map((r, i) => r.map((v, j) => { const t = (v - mn) / ((mx - mn) || 1); return `<rect x="${L + j * cw + 1}" y="${T0 + i * ch + 1}" width="${cw - 2}" height="${ch - 2}" rx="5" fill="color-mix(in srgb, ${o.hue || "var(--p)"} ${Math.round(6 + t * 88)}%, var(--surface))"><title>${esc(rows[i])} ${esc(cols[j])} · ${esc(fmt(v))}</title></rect>`; }).join("")).join("");
    const rl = rows.map((r, i) => `<text x="${L - 8}" y="${T0 + i * ch + ch / 2 + 4}" text-anchor="end" class="at">${esc(r)}</text>`).join(""), cl = cols.map((c, j) => j % 3 === 0 ? `<text x="${L + j * cw + cw / 2}" y="${H - 6}" text-anchor="middle" class="at">${esc(c)}</text>` : "").join("");
    return `<div class="chart-wrap"><svg class="chart heat" style="min-width:${W}px" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label || "")}">${cells}${rl}${cl}</svg></div>
      <div class="hscale"><span>${esc(fmt(mn))}</span><i style="display:flex;gap:2px;background:none">${[6,28,50,72,94].map(v => `<b style="flex:1;border-radius:2px;background:color-mix(in srgb,${o.hue || "var(--p)"} ${v}%,var(--surface))"></b>`).join("")}</i><span>${esc(fmt(mx))}</span></div>`;
  };
  CH.spark = (vals, color = "var(--p)", h = 36) => {
    const W = 120, mx = Math.max(...vals), mn = Math.min(...vals), pts = vals.map((v, i) => `${(i / (vals.length - 1) * W).toFixed(1)},${(h - 4 - (v - mn) / ((mx - mn) || 1) * (h - 8)).toFixed(1)}`).join(" ");
    return `<svg class="spark" viewBox="0 0 ${W} ${h}" preserveAspectRatio="none" aria-hidden="true"><polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round"/></svg>`;
  };
  CH.gauge = (pct, label, tone = "var(--p)") => {
    const r = 54, c = Math.PI * r, d = Math.min(Math.max(pct, 0), 100) / 100 * c;
    return `<div class="gauge"><svg viewBox="0 0 140 84" role="img" aria-label="${esc(label)} ${pct}%"><path d="M16 74a54 54 0 01108 0" fill="none" stroke="var(--soft2)" stroke-width="14" stroke-linecap="round"/><path d="M16 74a54 54 0 01108 0" fill="none" stroke="${tone}" stroke-width="14" stroke-linecap="round" stroke-dasharray="${d.toFixed(1)} ${c.toFixed(1)}"/><text x="70" y="70" text-anchor="middle" class="dc">${pct}%</text></svg><div class="muted">${esc(label)}</div></div>`;
  };
  CH.funnel = items => { const mx = items[0].v; return `<div class="funnel">${items.map((i, k) => `<div class="fr"><span class="fl">${esc(i.l)}</span><span class="fb"><i style="width:${(i.v / mx * 100).toFixed(1)}%;background:${CH.colors[k % 5]}"></i></span><span class="fv num">${i.v}${k ? ` <small>${Math.round(i.v / items[k - 1].v * 100)}%</small>` : ""}</span></div>`).join("")}</div>`; };
})();
