/* ===== Statistik ===== */
var stYear = new Date().getFullYear(), COL1 = '#2a78d6', COL2 = '#eb6834', SVGNS = 'http://www.w3.org/2000/svg';
function sv(tag, attrs, parent) { var e = document.createElementNS(SVGNS, tag); Object.keys(attrs || {}).forEach(function (k) { e.setAttribute(k, attrs[k]); }); if (parent) parent.appendChild(e); return e; }
function niceMax(v) { if (v <= 0) return 400; var x = v / 4, e = Math.pow(10, Math.floor(Math.log10(x))), f = x / e, ns = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]; return ns.filter(function (a) { return a >= f - 1e-9; })[0] * e * 4; }
function eurShort(v) { return Math.round(v).toLocaleString('de-DE') + ' €'; }
function stStep(n) { stYear += n; renderStat(); }
function vizTip(wrap, evt, lines) {
  var t = wrap.querySelector('.viz-tip'); if (!t) { t = mk('div', 'viz-tip'); wrap.appendChild(t); }
  t.innerHTML = ''; lines.forEach(function (l, i) { var d = mk('div', '', l); if (i === 0) d.style.fontWeight = '700'; t.appendChild(d); });
  var r = wrap.getBoundingClientRect(), x = evt.clientX - r.left + 12, y = evt.clientY - r.top - 10;
  t.style.display = 'block'; t.style.left = Math.max(0, Math.min(x, r.width - t.offsetWidth - 4)) + 'px'; t.style.top = Math.max(0, y - t.offsetHeight) + 'px';
}
function vizTipHide(wrap) { var t = wrap.querySelector('.viz-tip'); if (t) t.style.display = 'none'; }
function chartFrame(wrap, W, H, ml, mr, mt, mb, max) {
  wrap.innerHTML = '';
  var svg = sv('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Diagramm, die Tabelle darunter enthält dieselben Werte' }, wrap), ph = H - mt - mb;
  for (var i = 0; i <= 4; i++) {
    var y = mt + ph - ph * i / 4; sv('line', { x1: ml, x2: W - mr, y1: y, y2: y, stroke: '#e2e8f0', 'stroke-width': 1 }, svg);
    var tx = sv('text', { x: ml - 6, y: y + 4, 'text-anchor': 'end', 'font-size': 11, fill: '#64748b' }, svg); tx.textContent = eurShort(max * i / 4);
  }
  return { svg: svg, ph: ph, pw: W - ml - mr };
}
function barPath(x, y, w, h) { var r = Math.min(4, w / 2, h); return 'M' + x + ',' + (y + h) + ' L' + x + ',' + (y + r) + ' Q' + x + ',' + y + ' ' + (x + r) + ',' + y + ' L' + (x + w - r) + ',' + y + ' Q' + (x + w) + ',' + y + ' ' + (x + w) + ',' + (y + r) + ' L' + (x + w) + ',' + (y + h) + ' Z'; }
function drawBars(ms) {
  var wrap = document.getElementById('st-bars'), W = 720, H = 280, ml = 62, mr = 10, mt = 12, mb = 28, max = niceMax(Math.max.apply(null, ms.rev.concat(ms.out))), f = chartFrame(wrap, W, H, ml, mr, mt, mb, max), cw = f.pw / 12, bw = Math.min(18, cw * 0.32);
  for (var i = 0; i < 12; i++) {
    var x0 = ml + i * cw + cw / 2, base = mt + f.ph;
    [[ms.rev[i], COL1, x0 - bw - 1], [ms.out[i], COL2, x0 + 1]].forEach(function (b) { var h = b[0] / max * f.ph; if (h > 0.5) sv('path', { d: barPath(b[2], base - h, bw, h), fill: b[1] }, f.svg); });
    var lb = sv('text', { x: x0, y: H - 8, 'text-anchor': 'middle', 'font-size': 11, fill: '#64748b' }, f.svg); lb.textContent = MN3[i];
    (function (i) {
      var hit = sv('rect', { x: ml + i * cw, y: mt, width: cw, height: f.ph, fill: 'transparent', style: 'cursor:pointer' }, f.svg);
      var show = function (e) { vizTip(wrap, e, [MN[i] + ' ' + stYear, 'Umsatz: ' + eur(ms.rev[i]), 'Ausgaben: ' + eur(ms.out[i])]); };
      hit.addEventListener('mousemove', show); hit.addEventListener('click', show); hit.addEventListener('mouseleave', function () { vizTipHide(wrap); });
    })(i);
  }
}
function drawLine(ms) {
  var wrap = document.getElementById('st-line'), W = 720, H = 280, ml = 62, mr = 74, mt = 12, mb = 28, now = new Date(), last = stYear === now.getFullYear() ? now.getMonth() : stYear < now.getFullYear() ? 11 : -1;
  var cr = [], co = [], a = 0, b = 0; for (var i = 0; i < 12; i++) { a += ms.rev[i]; b += ms.out[i]; cr.push(a); co.push(b); }
  var max = niceMax(Math.max(a, b)), f = chartFrame(wrap, W, H, ml, mr, mt, mb, max), cw = f.pw / 12, base = mt + f.ph;
  var X = function (i) { return ml + i * cw + cw / 2; }, Y = function (v) { return base - v / max * f.ph; };
  for (var m = 0; m < 12; m++) { var lb = sv('text', { x: X(m), y: H - 8, 'text-anchor': 'middle', 'font-size': 11, fill: '#64748b' }, f.svg); lb.textContent = MN3[m]; }
  if (last >= 0) {
    [[cr, COL1, 'Umsatz'], [co, COL2, 'Ausgaben']].forEach(function (s2, si) {
      var d = ''; for (var k = 0; k <= last; k++) d += (k ? 'L' : 'M') + X(k) + ',' + Y(s2[0][k]);
      sv('path', { d: d, fill: 'none', stroke: s2[1], 'stroke-width': 2, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' }, f.svg);
      for (var k2 = 0; k2 <= last; k2++) sv('circle', { cx: X(k2), cy: Y(s2[0][k2]), r: 4, fill: s2[1], stroke: '#fff', 'stroke-width': 2 }, f.svg);
      var ly = Y(s2[0][last]), other = Y((si === 0 ? co : cr)[last]); if (Math.abs(ly - other) < 14) ly += (ly <= other ? -7 : 7);
      var t = sv('text', { x: X(last) + 10, y: ly + 4, 'font-size': 12, fill: '#0f172a' }, f.svg); t.textContent = s2[2];
    });
    var rule = sv('line', { x1: 0, x2: 0, y1: mt, y2: base, stroke: '#94a3b8', 'stroke-width': 1, style: 'display:none' }, f.svg);
    for (var j = 0; j <= last; j++) (function (j) {
      var hit = sv('rect', { x: ml + j * cw, y: mt, width: cw, height: f.ph, fill: 'transparent', style: 'cursor:pointer' }, f.svg);
      var show = function (e) { rule.setAttribute('x1', X(j)); rule.setAttribute('x2', X(j)); rule.style.display = ''; vizTip(wrap, e, [MN[j] + ' ' + stYear, 'Umsatz kumuliert: ' + eur(cr[j]), 'Ausgaben kumuliert: ' + eur(co[j])]); };
      hit.addEventListener('mousemove', show); hit.addEventListener('click', show); hit.addEventListener('mouseleave', function () { rule.style.display = 'none'; vizTipHide(wrap); });
    })(j);
  }
}
function renderStat() {
  var kp = document.getElementById('st-kpi'); if (!kp) return;
  document.getElementById('st-year').textContent = stYear;
  var ms = monthSeries(stYear), sum = function (a) { return a.reduce(function (x, y) { return x + y; }, 0); }, rev = sum(ms.rev), out = sum(ms.out);
  var openSum = 0; invoices.forEach(function (i) { if (!invState(i).full) openSum += i.total - paidSum(i); });
  kp.innerHTML = ''; [['Umsatz', eur(rev)], ['Ausgaben', eur(out)], ['Ergebnis', eur(rev - out), rev - out < 0 ? '#b91c1c' : ''], ['Offene Forderungen', eur(openSum)], ['Termine', String(sum(ms.ter))], ['Neue Patienten', String(sum(ms.pat))]].forEach(function (x) { kp.appendChild(statBox(x[0], x[1], x[2])); });
  drawBars(ms); drawLine(ms);
  var tb = document.getElementById('st-table'); tb.innerHTML = ''; var cr = 0, co = 0;
  for (var i = 0; i < 12; i++) { cr += ms.rev[i]; co += ms.out[i]; var r = tb.insertRow(); [MN[i], eur(ms.rev[i]), eur(ms.out[i]), eur(ms.rev[i] - ms.out[i]), eur(cr), eur(co)].forEach(function (t) { r.insertCell().textContent = t; }); }
  var tr = tb.insertRow(); [['Summe', eur(rev), eur(out), eur(rev - out), '', '']][0].forEach(function (t) { var c = tr.insertCell(); c.textContent = t; c.style.fontWeight = '700'; });
  var by = {}; invoices.forEach(function (i) { if (String(i.date).slice(0, 4) !== String(stYear)) return; (i.items || []).forEach(function (it) { if (it.rabatt) return; var k = String(it.text).split(' – ')[0].trim(); by[k] = by[k] || { n: 0, sum: 0 }; by[k].n += it.qty || 1; by[k].sum += it.amount != null ? it.amount : r2(it.qty * it.price); }); });
  var tt = document.getElementById('st-top'); tt.innerHTML = '';
  Object.keys(by).sort(function (a, b) { return by[b].sum - by[a].sum; }).slice(0, 10).forEach(function (k) { var r2r = tt.insertRow(); r2r.insertCell().textContent = k; r2r.insertCell().textContent = String(by[k].n).replace('.', ','); r2r.insertCell().textContent = eur(by[k].sum); });
  if (!tt.rows.length) { var er = tt.insertRow(), ec = er.insertCell(); ec.colSpan = 3; ec.textContent = 'Keine Rechnungen in diesem Jahr'; ec.style.color = '#94a3b8'; }
}

