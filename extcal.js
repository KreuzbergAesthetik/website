/*
 * Privater Kalender (Google, Apple, Outlook) in der Praxis-App anzeigen, nur lesend.
 * Der Server holt die iCal-Datei ab (sync.js, Aktion calget), hier wird sie ausgewertet.
 * Angezeigt werden nur Zeiten mit Uhrzeit, als graue Blöcke im Kalender. Gespeichert wird nichts in den Praxisdaten.
 */
var EXT = (function () {
  var S = { byDay: {}, n: 0, ts: 0, err: '' };
  function key() { return 'ka_ext'; }
  function load() { try { var o = JSON.parse(kaGet(key())); if (o && o.list) { S.ts = o.ts || 0; index(o.list); } } catch (x) {} }
  function pad2(n) { return ('0' + n).slice(-2); }
  function dkey(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }

  /* ---- Zeitzonen ---- */
  function tzOff(ms, tz) {
    var f = new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }), p = {};
    f.formatToParts(new Date(ms)).forEach(function (x) { p[x.type] = x.value; });
    return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - ms;
  }
  function wallToUtc(y, mo, d, h, mi, tz) {
    var g = Date.UTC(y, mo - 1, d, h, mi, 0);
    if (!tz) return new Date(y, mo - 1, d, h, mi, 0).getTime();
    if (tz === 'UTC') return g;
    try { var t = g - tzOff(g, tz); return g - tzOff(t, tz); } catch (x) { return new Date(y, mo - 1, d, h, mi, 0).getTime(); }
  }

  /* ---- ICS lesen ---- */
  function unfold(t) { return String(t).replace(/\r\n[ \t]/g, '').replace(/\n[ \t]/g, '').split(/\r?\n/); }
  function prop(line) {
    var i = line.indexOf(':'); if (i < 0) return null; var head = line.slice(0, i), val = line.slice(i + 1), parts = head.split(';'), p = { name: parts[0].toUpperCase(), params: {}, val: val };
    for (var k = 1; k < parts.length; k++) { var q = parts[k].split('='); p.params[q[0].toUpperCase()] = (q[1] || '').replace(/"/g, ''); }
    return p;
  }
  /* liefert { w: [y,mo,d,h,mi], tz, allday } oder null */
  function dt(p) {
    if (!p) return null; var v = p.val.trim(), m = /^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?)?(Z)?$/.exec(v); if (!m) return null;
    if (p.params.VALUE === 'DATE' || !m[4]) return { allday: true };
    return { w: [+m[1], +m[2], +m[3], +m[4], +m[5]], tz: m[7] ? 'UTC' : (p.params.TZID || ''), ms: wallToUtc(+m[1], +m[2], +m[3], +m[4], +m[5], m[7] ? 'UTC' : p.params.TZID || '') };
  }
  function dur(v) { var m = /^(-)?P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?)?/.exec(v || ''); if (!m) return 0; var s = ((+m[2] || 0) * 7 * 24 * 60 + (+m[3] || 0) * 24 * 60 + (+m[4] || 0) * 60 + (+m[5] || 0)) * 60000; return m[1] ? -s : s; }
  var WDN = { SU: 0, MO: 1, TU: 2, WE: 3, TH: 4, FR: 5, SA: 6 };
  function rrule(v) {
    var o = { freq: '', interval: 1, count: 0, until: 0, byday: [], bymonthday: [], bymonth: [] };
    String(v).split(';').forEach(function (kv) {
      var q = kv.split('='), k = q[0].toUpperCase(), x = q[1] || '';
      if (k === 'FREQ') o.freq = x.toUpperCase(); else if (k === 'INTERVAL') o.interval = Math.max(1, +x || 1); else if (k === 'COUNT') o.count = +x || 0;
      else if (k === 'UNTIL') { var d = dt({ val: x, params: {} }); o.until = d && d.ms ? d.ms : (/^\d{8}$/.test(x) ? Date.UTC(+x.slice(0, 4), +x.slice(4, 6) - 1, +x.slice(6, 8), 23, 59) : 0); }
      else if (k === 'BYDAY') o.byday = x.split(',').map(function (s) { var m = /^([+-]?\d+)?(SU|MO|TU|WE|TH|FR|SA)$/.exec(s); return m ? { n: m[1] ? +m[1] : 0, d: WDN[m[2]] } : null; }).filter(Boolean);
      else if (k === 'BYMONTHDAY') o.bymonthday = x.split(',').map(Number); else if (k === 'BYMONTH') o.bymonth = x.split(',').map(Number);
    });
    return o;
  }
  function dim(y, m) { return new Date(y, m, 0).getDate(); }
  function nth(y, mo, d) { return Math.floor((d - 1) / 7) + 1; }
  function nthLast(y, mo, d) { return -Math.floor((dim(y, mo) - d) / 7) - 1; }
  /* Treffer für einen Tag (y,mo,d) bezogen auf den Starttag s = [y,mo,d] */
  function hits(r, s, y, mo, d) {
    var a = Date.UTC(s[0], s[1] - 1, s[2]), b = Date.UTC(y, mo - 1, d), days = Math.round((b - a) / 86400000), wd = new Date(b).getUTCDay();
    if (days < 0) return false;
    if (r.freq === 'DAILY') return days % r.interval === 0;
    if (r.freq === 'WEEKLY') { var swd = new Date(a).getUTCDay(), wk = Math.floor((days + ((swd + 6) % 7)) / 7); if (wk % r.interval !== 0) return false; return r.byday.length ? r.byday.some(function (x) { return x.d === wd; }) : wd === swd; }
    if (r.freq === 'MONTHLY' || r.freq === 'YEARLY') {
      var mon = (y - s[0]) * 12 + (mo - s[1]);
      if (r.freq === 'MONTHLY' ? mon % r.interval !== 0 : ((y - s[0]) % r.interval !== 0 || (r.bymonth.length ? r.bymonth.indexOf(mo) < 0 : mo !== s[1]))) return false;
      if (r.bymonthday.length) return r.bymonthday.some(function (x) { return x > 0 ? x === d : dim(y, mo) + x + 1 === d; });
      if (r.byday.length) return r.byday.some(function (x) { return x.d === wd && (!x.n || x.n === nth(y, mo, d) || x.n === nthLast(y, mo, d)); });
      return d === s[2];
    }
    return false;
  }
  function parse(text, from, to) {
    var L = unfold(text), cur = null, evs = [], masters = [], over = {};
    L.forEach(function (l) {
      if (l === 'BEGIN:VEVENT') { cur = { ex: [] }; return; }
      if (l === 'END:VEVENT') { if (cur) { if (cur.rrule) masters.push(cur); else evs.push(cur); if (cur.recid && cur.uid) over[cur.uid + '|' + cur.recid] = 1; } cur = null; return; }
      if (!cur) return; var p = prop(l); if (!p) return;
      if (p.name === 'DTSTART') cur.s = dt(p); else if (p.name === 'DTEND') cur.e = dt(p); else if (p.name === 'DURATION') cur.d = dur(p.val);
      else if (p.name === 'SUMMARY') cur.t = p.val.replace(/\\,/g, ',').replace(/\\n/gi, ' ').replace(/\;/g, ';').replace(/\\\\/g, '\\'); else if (p.name === 'RRULE') cur.rrule = rrule(p.val);
      else if (p.name === 'EXDATE') p.val.split(',').forEach(function (x) { var d = dt({ val: x, params: p.params }); if (d && d.ms) cur.ex.push(d.ms); });
      else if (p.name === 'UID') cur.uid = p.val; else if (p.name === 'RECURRENCE-ID') { var d2 = dt(p); if (d2 && d2.ms) cur.recid = d2.ms; }
      else if (p.name === 'STATUS') cur.status = p.val.toUpperCase(); else if (p.name === 'TRANSP') cur.transp = p.val.toUpperCase();
    });
    var out = [];
    function add(ev, s, e) { if (e > from && s < to) out.push({ s: s, e: e, t: ev.t || '' }); }
    function ok(ev) { return ev.s && !ev.s.allday && ev.status !== 'CANCELLED' && ev.transp !== 'TRANSPARENT'; }
    evs.forEach(function (ev) { if (!ok(ev)) return; var e = ev.e && ev.e.ms ? ev.e.ms : ev.s.ms + (ev.d || 3600000); add(ev, ev.s.ms, Math.max(e, ev.s.ms + 60000)); });
    masters.forEach(function (ev) {
      if (!ok(ev)) return; var r = ev.rrule, len = ev.e && ev.e.ms ? ev.e.ms - ev.s.ms : (ev.d || 3600000), s = ev.s.w, tz = ev.s.tz, n = 0;
      var d0 = new Date(Math.max(Date.UTC(s[0], s[1] - 1, s[2]), from - 3 * 86400000)), start = Date.UTC(s[0], s[1] - 1, s[2]);
      /* Zählung ab Serienbeginn, wenn COUNT gesetzt ist */
      var from0 = r.count ? start : d0.getTime();
      for (var t = from0, guard = 0; t <= to + 86400000 && guard < 20000; t += 86400000, guard++) {
        var D = new Date(t), y = D.getUTCFullYear(), mo = D.getUTCMonth() + 1, d = D.getUTCDate();
        if (!hits(r, s, y, mo, d)) continue; n++; if (r.count && n > r.count) break;
        var ms = wallToUtc(y, mo, d, s[3], s[4], tz); if (r.until && ms > r.until) break;
        if (ev.ex.indexOf(ms) >= 0 || over[(ev.uid || '') + '|' + ms]) continue; add(ev, ms, ms + len);
      }
    });
    return out;
  }
  function index(list) {
    S.byDay = {}; S.n = list.length;
    list.forEach(function (x) {
      var d = new Date(x.s), endMs = x.e; d.setHours(0, 0, 0, 0);
      for (var g = 0; g < 14 && d.getTime() < endMs; g++, d.setDate(d.getDate() + 1)) {
        var a = Math.max(x.s, d.getTime()), nx = new Date(d.getTime()); nx.setDate(nx.getDate() + 1); var b = Math.min(endMs, nx.getTime());
        var sm = Math.round((a - d.getTime()) / 60000), em = Math.round((b - d.getTime()) / 60000); if (em <= sm) continue;
        (S.byDay[dkey(d)] = S.byDay[dkey(d)] || []).push({ sm: sm, em: em, t: x.t });
      }
    });
  }
  function set(text) {
    var now = Date.now(), list = parse(text, now - 7 * 86400000, now + 150 * 86400000);
    S.ts = now; index(list); S.err = '';
    try { kaSet(key(), JSON.stringify({ ts: now, list: list })); } catch (x) {}
    return list.length;
  }
  function clear() { S.byDay = {}; S.n = 0; S.ts = 0; try { kaSet(key(), 'null'); } catch (x) {} }
  async function refresh() {
    var url = settings.extUrl; if (!url) return; var c = window.KS && KS.cfg(); if (!c) { S.err = 'Erst den Geräte-Abgleich einrichten.'; ui(); return; }
    try { var txt = await KS.extFetch(url); set(txt); } catch (e) { S.err = e && e.message ? e.message : 'Abruf nicht möglich.'; }
    ui(); try { if (document.querySelector('#tab-kalender.active')) renderCal(); } catch (x) {}
  }
  /* ---- Anzeige ---- */
  function label(t) { return settings.extHide ? 'Privat' : (t || 'Privat'); }
  function blocks(k) {
    var l = S.byDay[k]; if (!l || !settings.extUrl) return ''; var out = '';
    l.forEach(function (x) {
      var top = (x.sm - START * 60) * H / 60, bot = (x.em - START * 60) * H / 60; if (bot <= 0 || top >= (END - START) * H) return; top = Math.max(top, 0); bot = Math.min(bot, (END - START) * H);
      out += '<div class="ev-ext" style="top:' + top + 'px;height:' + Math.max(bot - top, 14) + 'px" title="' + esc(label(x.t)) + '">' + esc(label(x.t)) + '</div>';
    });
    return out;
  }
  function pills(k) {
    var l = S.byDay[k]; if (!l || !settings.extUrl) return ''; var out = '';
    l.slice().sort(function (a, b) { return a.sm - b.sm; }).slice(0, 2).forEach(function (x) { out += '<div class="mp ext">' + pad2(Math.floor(x.sm / 60)) + ':' + pad2(x.sm % 60) + ' ' + esc(label(x.t)) + '</div>'; });
    return out;
  }
  function ui() {
    var b = document.getElementById('ext-box'); if (!b) return;
    var on = !!settings.extUrl; b.querySelector('.eb-off').style.display = on ? 'none' : ''; b.querySelector('.eb-on').style.display = on ? '' : 'none';
    var st = b.querySelector('.eb-state'); st.textContent = S.err ? S.err : on ? (S.ts ? S.n + ' Termine geladen, zuletzt ' + new Date(S.ts).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) + ' Uhr' : 'Wird abgerufen …') : ''; st.style.color = S.err ? '#b91c1c' : '#64748b';
    var h = b.querySelector('.eb-hide'); if (h) h.checked = !!settings.extHide;
  }
  return { refresh: refresh, set: set, clear: clear, parse: parse, blocks: blocks, pills: pills, ui: ui, state: S, reload: load };
})();
