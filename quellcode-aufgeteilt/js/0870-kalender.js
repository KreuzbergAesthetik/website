/* ===== Kalender ===== */
var H = 48, START = 8, END = 20, DSTART = 8, DEND = 20, view = 'tag', cur = new Date();
var MN = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
var WD = ['Mo','Di','Mi','Do','Fr','Sa','So'];
function pad(n) { return n < 10 ? '0' + n : '' + n; }
function iso(d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); }
function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
function monday(d) { return addDays(d, -((d.getDay() + 6) % 7)); }
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;'); }

var events = [];

events.forEach(function (e, i) { e.id = i + 1; });
try { var se = JSON.parse(kaGet('ka_events')); if (Array.isArray(se)) events = se; } catch (x) {}
var nid = events.reduce(function (m, e) { return Math.max(m, e.id || 0); }, 0) + 1, editId = null;
function col(e) { var cc = evColor(e); return cc ? 'background:' + cc + '26;border-left-color:' + cc + ';color:#0f172a' : ''; }
function evBlock(e, lane, lanes) {
  var p = e.time.split(':'), mins = parseInt(p[0], 10) * 60 + parseInt(p[1], 10);
  var top = (mins - START * 60) * H / 60, h = Math.max(e.dur * H / 60, 20);
  var pos = lanes > 1 ? 'left:calc(' + (lane * 100 / lanes) + '% + 2px);right:auto;width:calc(' + (100 / lanes) + '% - 4px);' : '';
  var cats = evKats(e), seg = '', chips = '';
  if (cats.length > 1) { seg = '<span class="evseg">' + cats.map(function (c) { return '<i style="background:' + c.color + '"></i>'; }).join('') + '</span>'; if (h >= 62) chips = '<div class="evchips">' + cats.map(function (c) { return '<i style="background:' + c.color + '">' + esc(c.name) + '</i>'; }).join('') + '</div>'; }
  return '<div class="ev' + (e.phase === 'Abgesagt' ? ' cancel' : '') + (cats.length > 1 ? ' multi' : '') + (e.status === 'Bestätigt' ? ' ok' : '') + '" onpointerdown="evDown(event,' + e.id + ')" oncontextmenu="return false" style="top:' + top + 'px;height:' + h + 'px;' + pos + col(e) + '" title="' + esc(e.behandlung) + '">' + seg + evFlag(e) + '<b>' + e.time + '</b> ' + nmHtml(eventPatientDisplay(e)) + '<br>' + esc(e.behandlung) + chips + '</div>';
}

/* Überlappende Termine nebeneinander statt übereinander */
function layoutDay(list) {
  var items = list.slice().sort(function (a, b) { return toMin(a.time) - toMin(b.time); }).map(function (e) { return { e: e, s: toMin(e.time), f: toMin(e.time) + Math.max(e.dur || 60, 20 * 60 / H), lane: 0, lanes: 1 }; });
  var grp = [], gEnd = -1;
  function close() { var n = 0; grp.forEach(function (x) { n = Math.max(n, x.lane + 1); }); grp.forEach(function (x) { x.lanes = n; }); grp = []; }
  items.forEach(function (x) {
    if (grp.length && x.s >= gEnd) { close(); gEnd = -1; }
    var used = grp.filter(function (y) { return y.f > x.s; }).map(function (y) { return y.lane; }), l = 0;
    while (used.indexOf(l) >= 0) l++;
    x.lane = l; grp.push(x); gEnd = Math.max(gEnd, x.f);
  });
  close();
  return items;
}
function fitHours() {
  START = DSTART; END = DEND;
  events.forEach(function (e) {
    if (!/^\d{1,2}:\d{2}$/.test(e.time || '')) return;
    START = Math.min(START, Math.floor(toMin(e.time) / 60));
    END = Math.max(END, Math.min(24, Math.ceil((toMin(e.time) + (e.dur || 60)) / 60)));
  });
}
function timeGrid(days) {
  var wk = days.length > 1, addC = wk && (!wkSa || !wkSo);
  var cols = 'grid-template-columns:30px repeat(' + days.length + ',1fr)' + (addC ? ' 34px' : '') + ';';
  var minW = wk ? 'min-width:' + (days.length * 100 + 60) + 'px;' : '';
  var today = iso(new Date());
  var html = '<div style="' + minW + '"><div class="tg-row" style="' + cols + '"><div class="dh" style="border-right:1px solid #e2e8f0;"></div>';
  days.forEach(function (d) {
    var wdi = (d.getDay() + 6) % 7;
    html += '<div class="dh' + (iso(d) === today ? ' today' : '') + '">' + WD[wdi] + ' ' + d.getDate() + '.' + (wk && wdi >= 5 ? '<span class="wk-x" onclick="wkTog(\'' + (wdi === 5 ? 'sa' : 'so') + '\')" title="Ausblenden">×</span>' : '') + '</div>';
  });
  if (addC) html += '<div class="dh" style="padding:2px">' + (wkSa ? '' : '<button type="button" class="wk-add" onclick="wkTog(\'sa\')" title="Samstag einblenden">+Sa</button>') + (wkSo ? '' : '<button type="button" class="wk-add" onclick="wkTog(\'so\')" title="Sonntag einblenden">+So</button>') + '</div>';
  html += '</div><div class="tg-row" style="' + cols + '"><div class="tc">';
  for (var h = START; h < END; h++) html += '<div class="hl">' + h + '</div>';
  var nw = new Date(), nmin = nw.getHours() * 60 + nw.getMinutes(), nowShow = days.some(function (d) { return iso(d) === today; }) && nmin >= START * 60 && nmin < END * 60;
  if (nowShow) html += '<div class="now-tag" style="top:' + ((nmin - START * 60) * H / 60) + 'px">' + pad(nw.getHours()) + ':' + pad(nw.getMinutes()) + '</div>';
  html += '</div>';
  days.forEach(function (d) {
    var k = iso(d);
    html += '<div class="dc" data-date="' + k + '" style="height:' + (END - START) * H + 'px;cursor:pointer" onclick="slotClick(event,\'' + k + '\')">';
    html += EXT.blocks(k);
    layoutDay(events.filter(function (e) { return e.date === k; })).forEach(function (x) { html += evBlock(x.e, x.lane, x.lanes); });
    if (nowShow && k === today) html += '<div class="now-line" style="top:' + ((nmin - START * 60) * H / 60) + 'px"></div>';
    html += '</div>';
  });
  if (addC) html += '<div></div>';
  return html + '</div></div>';
}

function monthGrid() {
  var y = cur.getFullYear(), m = cur.getMonth(), today = iso(new Date());
  var first = new Date(y, m, 1), d0 = monday(first);
  var html = '<div style="min-width:560px"><div class="mg">';
  WD.forEach(function (w) { html += '<div class="mh">' + w + '</div>'; });
  var weeks = Math.ceil(((first.getDay() + 6) % 7 + new Date(y, m + 1, 0).getDate()) / 7);
  for (var i = 0; i < weeks * 7; i++) {
    var d = addDays(d0, i), k = iso(d);
    var list = events.filter(function (e) { return e.date === k; }).sort(function (a, b) { return a.time < b.time ? -1 : 1; });
    html += '<div class="mc' + (d.getMonth() !== m ? ' out' : '') + (k === today ? ' today' : '') + '" onclick="openDay(\'' + k + '\')"><div class="n">' + d.getDate() + '</div>';
    list.slice(0, 3).forEach(function (e) {
      html += '<div class="mp' + (e.status === 'Bestätigt' ? ' ok' : '') + '" onclick="event.stopPropagation();openTerminView(' + e.id + ')" style="cursor:pointer;' + col(e) + '">' + e.time + ' ' + nmHtml(eventPatientDisplay(e)) + '</div>';
    });
    if (list.length > 3) html += '<div style="color:#64748b;margin-top:2px;">+' + (list.length - 3) + ' weitere</div>';
    html += EXT.pills(k);
    html += '</div>';
  }
  return html + '</div></div>';
}

/* Marker für die aktuelle Uhrzeit: wird jede halbe Minute nachgezogen */
function updNow() {
  var tab = document.getElementById('tab-kalender'); if (!tab || !tab.classList.contains('active') || view === 'monat') return;
  var n = new Date(), m = n.getHours() * 60 + n.getMinutes(), y = (m - START * 60) * H / 60;
  var line = document.querySelector('#cal-body .now-line'), tag = document.querySelector('#cal-body .now-tag');
  var want = m >= START * 60 && m < END * 60 && document.querySelector('#cal-body .dc[data-date="' + iso(n) + '"]');
  if (!!line !== !!want) { renderCal(); return; }
  if (!line) return;
  line.style.top = y + 'px'; if (tag) { tag.style.top = y + 'px'; tag.textContent = pad(n.getHours()) + ':' + pad(n.getMinutes()); }
}
setInterval(updNow, 30000);
var wkSa = false, wkSo = false;
try { wkSa = kaGet('ka_wksa') === '1'; wkSo = kaGet('ka_wkso') === '1'; } catch (x) {}
function wkTog(k) { if (k === 'sa') wkSa = !wkSa; else wkSo = !wkSo; try { kaSet('ka_wksa', wkSa ? '1' : '0'); kaSet('ka_wkso', wkSo ? '1' : '0'); } catch (x) {} renderCal(); }
function renderCal() {
  fitHours();
  ['tag', 'woche', 'monat'].forEach(function (v) {
    document.getElementById('v-' + v).className = (v === view) ? 'on' : '';
  });
  var title, body;
  if (view === 'tag') {
    title = WD[(cur.getDay() + 6) % 7] + ', ' + cur.getDate() + '. ' + MN[cur.getMonth()] + ' ' + cur.getFullYear();
    body = timeGrid([cur]);
  } else if (view === 'woche') {
    var mo = monday(cur), days = [];
    for (var i = 0; i < 7; i++) if (i < 5 || (i === 5 && wkSa) || (i === 6 && wkSo)) days.push(addDays(mo, i));
    var so = days[days.length - 1];
    title = mo.getDate() + '. ' + MN[mo.getMonth()].slice(0, 3) + ' bis ' + so.getDate() + '. ' + MN[so.getMonth()].slice(0, 3) + ' ' + so.getFullYear();
    body = timeGrid(days);
  } else {
    title = MN[cur.getMonth()] + ' ' + cur.getFullYear();
    body = monthGrid();
  }
  calLegend();
  document.getElementById('cal-title').innerText = title; saveLast();
  var cb = document.getElementById('cal-body'); cb.innerHTML = body;
  if (view !== 'monat' && cb.scrollHeight > cb.clientHeight + 4) {
    var nw = new Date(), hr = nw.getHours(), isNowView = !!cb.querySelector('.now-line'), t0 = isNowView ? hr - 1 : START + 0;
    var first = (cb.querySelector('.ev') || {}).offsetTop; cb.scrollTop = isNowView ? Math.max(0, (t0 - START) * H) : (first != null ? Math.max(0, Math.floor((first - 20) / H) * H) : 0);
  }
}
function setView(v) { view = v; renderCal(); }
function step(n) {
  if (view === 'tag') cur = addDays(cur, n);
  else if (view === 'woche') cur = addDays(cur, 7 * n);
  else cur = new Date(cur.getFullYear(), cur.getMonth() + n, 1);
  renderCal();
}
function goToday() { cur = new Date(); renderCal(); }
function openDay(k) { var p = k.split('-'); cur = new Date(+p[0], +p[1] - 1, +p[2]); view = 'tag'; renderCal(); }
var tDur = 60, tPatientId = null;
function toMin(t) { var p = t.split(':'); return parseInt(p[0], 10) * 60 + parseInt(p[1], 10); }
function fromMin(m) { m = ((m % 1440) + 1440) % 1440; return pad(Math.floor(m / 60)) + ':' + pad(m % 60); }
function dLabel(d) { document.getElementById('t-dlabel').innerText = d > 0 ? '(' + d + ' min)' : '(Ende vor Beginn)'; }
/* Kopf der Termin-Maske: Farbe der Leistung und Vorschau */
function tmSub() {
  var hd = document.getElementById('tm-head'); if (!hd) return;
  var c = document.getElementById('t-farbe').value || '#94a3b8'; hd.style.setProperty('--tmc', c);
  var dt = document.getElementById('t-datum').value, z = document.getElementById('t-zeit').value, en = document.getElementById('t-ende').value, g = document.getElementById('t-ganztag').checked, parts = [];
  if (dt) { var d = new Date(dt + 'T12:00:00'); parts.push(WD[(d.getDay() + 6) % 7] + ', ' + d.getDate() + '. ' + MN[d.getMonth()].slice(0, 3) + '.'); }
  if (g) parts.push('ganztägig'); else if (z) parts.push(z + (en ? ' – ' + en : '') + ' Uhr');
  if (tLeist.length) parts.push(tLeist.join(', '));
}
function shiftEnd() {
  var z = document.getElementById('t-zeit').value;
  if (!z) return;
  document.getElementById('t-ende').value = fromMin(toMin(z) + tDur);
  dLabel(tDur); tmSub();
}
function updDur() {
  var z = document.getElementById('t-zeit').value, e = document.getElementById('t-ende').value;
  if (!z || !e) return;
  var d = toMin(e) - toMin(z);
  if (d > 0) tDur = d;
  dLabel(d); tmSub();
}
function toggleGanztag() {
  var g = document.getElementById('t-ganztag').checked;
  document.getElementById('t-zeit').disabled = g;
  document.getElementById('t-ende').disabled = g;
  document.querySelector('#modal-termin .tm-times').style.display = g ? 'none' : '';
  tmSub();
}
var retP = null;
function closeTermin() {
  closeModal('modal-termin');
  if (retP) { var p = retP; retP = null; viewAkte(p); }
}
function openTermin(k, t, fromAkte) {
  retP = fromAkte ? curP : null;
  tPatientId = fromAkte && curP ? curP.id : null;
  editId = null; document.getElementById('t-del').style.display = 'none'; document.getElementById('t-title').textContent = 'Neuer Termin';
  document.getElementById('t-patient').value = tPatientId ? nameKey(curP) : '';
  document.getElementById('t-datum').value = k || iso(cur);
  document.getElementById('t-zeit').value = t || '11:30';
  tDur = 60; shiftEnd();
  document.getElementById('t-notiz').value = '';
  document.getElementById('t-leistung').value = ''; tLeist = []; renderTLeist();
  document.getElementById('t-ganztag').checked = false; toggleGanztag();
  document.getElementById('t-farbe').value = '#16a34a'; tmSub();
  openModal('modal-termin');
}
function editTermin(id, fromAkte) {
  if (noClick) return;
  retP = fromAkte ? curP : null;
  var e = events.filter(function (x) { return x.id === id; })[0];
  if (!e) return;
  editId = id; tDur = e.dur; document.getElementById('t-title').textContent = 'Termin bearbeiten';
  document.getElementById('t-datum').value = e.date;
  document.getElementById('t-zeit').value = e.time;
  document.getElementById('t-ende').value = fromMin(toMin(e.time) + e.dur);
  dLabel(e.dur);
  var ep = eventPatient(e); tPatientId = ep ? ep.id : null; document.getElementById('t-patient').value = ep ? nameKey(ep) : (e.patient || '');
  document.getElementById('t-leistung').value = ''; tLeist = evLeistungen(e).slice(); if (!tLeist.length && e.behandlung && e.behandlung !== 'Beratung') tLeist = [e.behandlung]; renderTLeist();
  document.getElementById('t-notiz').value = e.notiz || '';
  document.getElementById('t-farbe').value = e.color || '#16a34a'; terminKatColor();
  document.getElementById('t-ganztag').checked = false; toggleGanztag();
  document.getElementById('t-del').style.display = 'inline-block';
  openModal('modal-termin');
}
async function deleteTermin() {
  if (!await kaConfirm('Termin wirklich löschen?')) return;
  events = events.filter(function (x) { return x.id !== editId; });
  persist(); renderCal();
  closeTermin();
}
/* Termine per Antippen und Halten verschieben */
var drag = null, noClick = false;
function evDown(e, id) {
  var el = e.currentTarget;
  var d = { id: id, el: el, x: e.clientX, y: e.clientY, on: false };
  drag = d;
  d.t = setTimeout(function () {
    d.on = true;
    el.classList.add('drag');
    d.top0 = parseFloat(el.style.top);
    d.cols = Array.prototype.slice.call(document.querySelectorAll('#cal-body .dc'));
    d.c0 = d.cols.indexOf(el.parentNode); d.idx = d.c0;
    if (navigator.vibrate) navigator.vibrate(20);
  }, 450);
  el.setPointerCapture(e.pointerId);
  el.onpointermove = evMove; el.onpointerup = evUp; el.onpointercancel = evCancel;
}
function evMove(e) {
  var d = drag; if (!d) return;
  if (!d.on) {
    if (Math.abs(e.clientX - d.x) > 8 || Math.abs(e.clientY - d.y) > 8) { clearTimeout(d.t); drag = null; }
    return;
  }
  var max = (END - START) * H - d.el.offsetHeight;
  d.top = Math.max(0, Math.min(max, Math.round((d.top0 + e.clientY - d.y) / (H / 4)) * (H / 4)));
  d.el.style.top = d.top + 'px';
  for (var i = 0; i < d.cols.length; i++) {
    var r = d.cols[i].getBoundingClientRect();
    if (e.clientX >= r.left && e.clientX < r.right) d.idx = i;
  }
  var dx = d.cols[d.idx].getBoundingClientRect().left - d.cols[d.c0].getBoundingClientRect().left;
  d.el.style.transform = 'translateX(' + dx + 'px)';
  d.mins = Math.round((START * 60 + d.top / H * 60) / 15) * 15;
  d.el.querySelector('b').textContent = fromMin(d.mins);
}
function evUp(e) {
  var d = drag; if (!d) return;
  clearTimeout(d.t); drag = null;
  if (!d.on) { openTerminView(d.id); return; }
  noClick = true; setTimeout(function () { noClick = false; }, 400);
  if (d.mins !== undefined) {
    for (var i = 0; i < events.length; i++) {
      if (events[i].id === d.id) { events[i].date = d.cols[d.idx].getAttribute('data-date'); events[i].time = fromMin(d.mins); events[i].mod = Date.now(); }
    }
  }
  persist(); renderCal();
}
function evCancel() {
  var d = drag; if (!d) return;
  clearTimeout(d.t); drag = null;
  if (d.on) renderCal();
}
function goHome() {
  retP = null;
  ['modal-patient', 'modal-termin', 'modal-akte', 'modal-img'].forEach(function (id) { closeModal(id); });
  switchTab('start');
  window.scrollTo(0, 0);
}
