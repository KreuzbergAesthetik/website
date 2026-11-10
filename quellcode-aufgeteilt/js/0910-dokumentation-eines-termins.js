/* ===== Dokumentation eines Termins (strukturiert) und To-Dos ===== */
var DK_TEXT = [['befund', 'Befund'], ['behandlung', 'Behandlung']];
var dkPend = [], dkDel = [];
var DK_VERW = [['aufkl', 'Aufklärung'], ['dok', 'Unterlagen'], ['anam', 'Anamnesebogen'], ['honorar', 'Honorarvertrag']];
var DK_FIELDS = ['anamnese', 'befund', 'behandlung', 'aufklaerung', 'leist', 'produkte', 'ausblick', 'rechnung'];
var dkEv = null, dkTodos = [], tdPrio = '', tdStat = 'offen', toCur = null;
function dokOf(e) { return e.dok || { anamnese: '', befund: '', behandlung: e.doku || '', aufklaerung: '', verw: {}, leist: '', produkte: '', ausblick: '' }; }
function dokFilled(e) {
  if (e.doku && String(e.doku).trim()) return true;
  var d = e.dok; if (!d) return false;
  return DK_FIELDS.some(function (k) { return String(d[k] || '').trim(); }) || (d.verw && (DK_VERW.some(function (v) { return d.verw[v[0]]; }) || String(d.verw.text || '').trim()));
}
/* Text für die Rechnung: ohne Verwaltung und To-Dos. e.doku wird bei jedem Speichern daraus abgeleitet. */
function dokuText(e) {
  if (!e.dok) return e.doku || '';
  var d = e.dok, out = [];
  [['anamnese', 'Anamnese'], ['befund', 'Befund'], ['behandlung', 'Behandlung'], ['aufklaerung', 'Aufklärung'], ['leist', 'Leistungen'], ['produkte', 'Weitere Produkte'], ['ausblick', 'Ausblick und Procedere']].forEach(function (k) { if (String(d[k[0]] || '').trim()) out.push(k[1] + ': ' + String(d[k[0]]).trim()); });
  var used = lager.verbrauch.filter(function (v) { return v.eid === e.id; });
  if (used.length) out.push('Verwendete Produkte: ' + used.map(function (v) { return v.name + ' ' + qty(v.menge) + ' ' + (v.einheit || '') + ' (Charge ' + (v.nr || '-') + ')'; }).join(', '));
  return out.join('\n');
}
function dokSummary(e) {
  var box = mk('div'); box.style.cssText = 'font-size:13px; margin:4px 0 0; padding:8px 10px; background:#f8fafc; border-radius:6px; cursor:pointer;';
  var d = e.dok, open = todos.filter(function (t) { return t.eid === e.id && !t.done; }).length;
  if (!dokFilled(e) && !open) { box.textContent = 'Dokumentation für diesen Termin hinzufügen'; box.style.color = '#94a3b8'; }
  else {
    var shown = false, secs = [], cl = function (t) { return String(t || '').trim(); };
    var used = lager.verbrauch.filter(function (v) { return v.eid === e.id; });
    var lt = d ? cl(d.leist).split('\n').map(cl).filter(Boolean) : []; if (!lt.length) lt = evLeistungen(e);
    var pt = used.map(function (v) { return v.name + ' ' + qty(v.menge) + ' ' + (v.einheit || ''); }); if (d && cl(d.produkte)) pt.push(cl(d.produkte));
    secs.push(['Anamnese', d ? cl(d.anamnese) : '']); secs.push(['Befund', d ? cl(d.befund) : '']);
    secs.push(['Leistungen', lt.join(', ')]); secs.push(['Produkte', pt.join(', ')]);
    secs.push(['Behandlung', d ? cl(d.behandlung) : cl(e.doku)]); secs.push(['Aufklärung', d ? cl(d.aufklaerung) : '']); secs.push(['Ausblick', d ? cl(d.ausblick) : '']);
    secs.forEach(function (k) {
      if (!k[1]) return; shown = true;
      var r = mk('div'); r.style.cssText = 'white-space:pre-wrap; padding:5px 0;' + (box.children.length ? ' border-top:1px solid #dbe2ea;' : ''); r.appendChild(mk('b', '', k[0] + ': ')); r.appendChild(document.createTextNode(k[1])); box.appendChild(r);
    });
    if (d && d.verw) { var v = DK_VERW.filter(function (x) { return d.verw[x[0]]; }).map(function (x) { return x[1]; }); if (v.length) { shown = true; var r2v = mk('div'); r2v.style.cssText = 'padding:5px 0;' + (box.children.length ? ' border-top:1px solid #dbe2ea;' : ''); r2v.appendChild(mk('b', '', 'Verwaltung: ')); r2v.appendChild(document.createTextNode(v.join(', '))); box.appendChild(r2v); } }
    if (open) { var tb = mk('span', 'badge badge-amber', open + ' offene(s) To-Do'); box.appendChild(tb); }
    if (!shown && !open) box.textContent = 'Dokumentation geöffnet';
  }
  box.onclick = function () { openDok(e.id); }; return box;
}
function dkSec(label, node) { var s2 = mk('div', 'dk-sec'); s2.appendChild(mk('div', 'dk-h', label)); s2.appendChild(node); return s2; }
function dkTa(id, val, rows) { var ta = mk('textarea', 'form-control'); ta.id = id; ta.rows = rows || 3; ta.value = val || ''; return ta; }
/* Textfeld, das mit dem Inhalt wächst: beginnt mit einer Zeile */
function autoGrow(ta) { ta.style.height = 'auto'; ta.style.height = (ta.scrollHeight + 2) + 'px'; }
var TB_ICON = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z"/><path d="M14 3v5h5M12 11v6M9 14h6"/></svg>';
function dkTextSec(id, label, val, rows, grow) {
  var w = mk('div'), ta = dkTa(id, val, grow ? 1 : rows); w.appendChild(ta);
  if (grow) { ta.classList.add('dk-grow'); ta.addEventListener('input', function () { autoGrow(ta); }); }
  var s2 = dkSec(label, w), list = settings.textbausteine || [];
  if (list.length) {
    var h = s2.firstChild; h.classList.add('dk-hrow');
    var bt = mk('button', 'dk-tb'); bt.type = 'button'; bt.innerHTML = TB_ICON; bt.title = 'Textbaustein einfügen'; bt.setAttribute('aria-label', 'Textbaustein einfügen');
    bt.onclick = function (ev) { tlMenu(ev, list.map(function (t) { return [t.name, function () {
      var a = ta.selectionStart == null ? ta.value.length : ta.selectionStart, b = ta.selectionEnd == null ? a : ta.selectionEnd;
      var pre = (a > 0 && !/\s$/.test(ta.value.slice(0, a))) ? '\n' : '', ins = pre + t.text;
      ta.value = ta.value.slice(0, a) + ins + ta.value.slice(b); ta.focus(); ta.selectionStart = ta.selectionEnd = a + ins.length; ta.dispatchEvent(new Event('input'));
    }]; })); };
    h.appendChild(bt);
  }
  return s2;
}
/* Einklappbarer Abschnitt: geschlossen, solange nichts drinsteht; Tipp auf die Überschrift öffnet ihn */
function dkFold(sec, content) {
  var h = sec.firstChild, filled = String(content || '').trim(), sum = mk('span', 'dk-sum', filled ? filled.replace(/\s+/g, ' ').slice(0, 34) + (filled.length > 34 ? '…' : '') : '');
  sec.classList.add('dk-fold'); if (!filled) sec.classList.add('closed');
  h.insertBefore(sum, h.firstChild.nextSibling); h.classList.add('dk-fh');
  h.onclick = function (ev) { if (ev.target.closest('.dk-tb')) return; sec.classList.toggle('closed'); var ta = sec.querySelector('textarea'); if (ta && !sec.classList.contains('closed')) ta.focus(); };
  return sec;
}
function dkRenderProd() {
  var box = document.getElementById('dk-prod'); if (!box || !dkEv) return; box.innerHTML = '';
  var rows = lager.verbrauch.filter(function (v) { return v.eid === dkEv.id && dkDel.indexOf(v.id) < 0; }).map(function (v) { return [v, false]; }).concat(dkPend.map(function (v) { return [v, true]; }));
  rows.forEach(function (r) {
    var v = r[0], row = mk('div'); row.style.cssText = 'display:flex; gap:8px; align-items:center; font-size:13.5px; padding:2px 0;';
    var t = mk('span', '', '• ' + v.name + ': ' + qty(v.menge) + ' ' + (v.einheit || '') + ' · Charge ' + (v.nr || '-')); t.style.flex = '1'; row.appendChild(t);
    var x = mk('button', 'x-btn', '×'); x.type = 'button'; x.title = 'Produkt entfernen'; x.setAttribute('aria-label', v.name + ' entfernen');
    x.onclick = function () { if (r[1]) dkPend = dkPend.filter(function (y) { return y !== v; }); else dkDel.push(v.id); dkRenderProd(); };
    row.appendChild(x); box.appendChild(row);
  });
  if (dkPend.length || dkDel.length) { var h = mk('div', 'hm-empty', 'Das Lager wird erst beim Speichern angepasst.'); box.appendChild(h); }
}
/* Produktänderungen der Dokumentation erst beim Speichern ins Lager übernehmen */
function dkApplyProd(e) {
  var skipped = 0, rd = function (x) { return Math.round(x * 1000) / 1000; };
  dkDel.forEach(function (id) {
    var v = lager.verbrauch.filter(function (y) { return y.id === id; })[0]; if (!v) return;
    var ch = lager.chargen.filter(function (c) { return c.id === v.chId; })[0]; if (ch) ch.rest = rd((+ch.rest || 0) + v.menge);
    lager.verbrauch = lager.verbrauch.filter(function (y) { return y.id !== id; });
  });
  dkPend.forEach(function (v) {
    var ch = lager.chargen.filter(function (c) { return c.id === v.chId; })[0];
    if (!ch || v.menge > (+ch.rest || 0) + 1e-9) { skipped++; return; }
    ch.rest = rd((+ch.rest || 0) - v.menge); v.ts = Date.now(); lager.verbrauch.push(v);
  });
  dkPend = []; dkDel = [];
  if (skipped) alert(skipped + ' Produkt(e) konnten nicht abgebucht werden, weil der Bestand der Charge nicht mehr reicht.');
  try { renderLager(); } catch (x) {}
}
function dkRenderTodos() {
  var box = document.getElementById('dk-todos'); if (!box) return; box.innerHTML = '';
  dkTodos.forEach(function (t, i) {
    var r = mk('div'); r.style.cssText = 'display:flex; gap:6px; align-items:center; flex-wrap:wrap; margin-bottom:8px;';
    var cb = mk('input', 'td-chk'); cb.type = 'checkbox'; cb.checked = !!t.done; cb.onchange = function () { t.done = cb.checked; t.doneTs = cb.checked ? Date.now() : 0; };
    var tx = mk('input', 'form-control'); tx.type = 'text'; tx.value = t.text; tx.placeholder = 'Aufgabe'; tx.style.cssText = 'flex:1 1 160px; min-width:0;'; tx.oninput = function () { t.text = tx.value; };
    var pr = mk('select', 'form-control'); pr.style.cssText = 'width:auto;'; [['hoch', 'Hoch'], ['mittel', 'Mittel'], ['niedrig', 'Niedrig']].forEach(function (o) { var op = mk('option', '', o[1]); op.value = o[0]; pr.appendChild(op); }); pr.value = t.prio; pr.onchange = function () { t.prio = pr.value; };
    var du = mk('input', 'form-control'); du.type = 'date'; du.value = t.due || ''; du.style.cssText = 'width:auto;'; du.onchange = function () { t.due = du.value; };
    var x = mk('button', 'x-btn', '×'); x.type = 'button'; x.title = 'Entfernen'; x.onclick = function () { dkTodos.splice(i, 1); dkRenderTodos(); };
    [cb, tx, pr, du, x].forEach(function (c) { r.appendChild(c); }); box.appendChild(r);
  });
}
function openDok(id) { var e = events.filter(function (x) { return x.id === id; })[0]; if (e) openDokEv(e); }
/* Freie Dokumentation (ohne Termin) in derselben Maske bearbeiten */
function openDokFree(d) {
  var dt = new Date(d.ts);
  openDokEv({ id: -1, pseudo: d, patientId: curP.id, patient: nameKey(curP), date: iso(dt), time: pad(dt.getHours()) + ':' + pad(dt.getMinutes()), dok: d.dok ? JSON.parse(JSON.stringify(d.dok)) : null, doku: d.text || '' });
}
function dkCancel() {
  var e = dkEv; closeModal('modal-dok');
  if (e && e.pseudo && curP && !String(e.pseudo.text || '').trim() && !e.pseudo.dok) { curP.doku = (curP.doku || []).filter(function (y) { return y !== e.pseudo; }); persist(); renderVerlauf(); }
  dkEv = null; dkPend = []; dkDel = [];
}
function openDokEv(e) {
  dkEv = e; var d = dokOf(e), box = document.getElementById('dk-body'); box.innerHTML = '';
  document.getElementById('dk-title').textContent = 'Dokumentation · ' + eventPatientDisplay(e) + ' · ' + fmtTermin(e);
  dkTodos = todos.filter(function (t) { return t.eid === e.id; }).map(function (t) { return Object.assign({}, t); });
  dkPend = []; dkDel = [];
  var dkT = {}; DK_TEXT.forEach(function (k) { dkT[k[0]] = dkTextSec('dk-' + k[0], k[1], d[k[0]], 1, true); });
  box.appendChild(dkFold(dkTextSec('dk-anamnese', 'Anamnese', d.anamnese), d.anamnese));
  box.appendChild(dkT.befund);
  var vw = mk('div'), vs = d.verw || {}, vg = mk('div', 'dk-vgrid'); vw.appendChild(vg);
  DK_VERW.forEach(function (v) { var l = mk('label', 'tm-chk'); l.style.cssText = 'display:flex; gap:8px; align-items:center; font-weight:400; font-size:14px; margin:0;'; var c = mk('input'); c.type = 'checkbox'; c.id = 'dk-v-' + v[0]; c.checked = !!vs[v[0]]; l.appendChild(c); l.appendChild(document.createTextNode(v[1])); vg.appendChild(l); });
  var vt = dkTa('dk-verwtext', vs.text, 1); vt.placeholder = 'Freitext zur Verwaltung'; vt.classList.add('dk-grow'); vt.addEventListener('input', function () { autoGrow(vt); }); if (!String(vs.text || '').trim()) vt.style.display = 'none'; vw.appendChild(vt);
  var vsec = dkSec('Verwaltung', vw), vh = vsec.firstChild; vh.classList.add('dk-hrow');
  var vplus = mk('button', 'dk-plus', '+ Text'); vplus.type = 'button'; vplus.onclick = function () { vt.style.display = ''; autoGrow(vt); vt.focus(); vplus.style.display = 'none'; };
  if (String(vs.text || '').trim()) vplus.style.display = 'none'; vh.appendChild(vplus);
  /* Leistungen und Produkte: eine Leiste zum Tippen oder Auswählen, darunter die gewählten Leistungen und die abgebuchten Produkte */
  var lw = mk('div'), lta = dkTa('dk-leist', d.leist || evLeistungen(e).join('\n'), 2); lta.style.display = 'none'; lw.appendChild(lta);
  var lrow = mk('div', 'dk-lrow'), lwrap = mk('div', 'dk-lwrap'), lin = mk('input', 'form-control'); lin.type = 'text'; lin.placeholder = 'Leistung eintippen oder wählen'; lin.autocomplete = 'off'; lin.setAttribute('aria-label', 'Leistung');
  var dd = mk('div', 'dk-dd'), chips = mk('div', 'dk-chips');
  var lget = function () { return lta.value.split('\n').map(function (x) { return x.trim(); }).filter(Boolean); };
  var lset = function (a) { lta.value = a.join('\n'); lta.dispatchEvent(new Event('input')); drawChips(); };
  var drawChips = function () {
    chips.innerHTML = ''; lget().forEach(function (n, k) {
      var c = mk('span', 'dk-chip', n), x = mk('button', 'dk-chx', '×'); x.type = 'button'; x.setAttribute('aria-label', n + ' entfernen');
      x.onclick = function () { var a = lget(); a.splice(k, 1); lset(a); }; c.appendChild(x); chips.appendChild(c);
    });
  };
  var addL = function (n) { n = String(n || '').trim(); if (!n) return; var a = lget(); if (a.indexOf(n) < 0) a.push(n); lset(a); lin.value = ''; dd.style.display = 'none'; };
  var showDd = function () {
    var q = lin.value.trim().toLowerCase(), cat = (settings.katalog || []).filter(function (k) { return !q || k.name.toLowerCase().indexOf(q) >= 0; }).slice(0, 12);
    dd.innerHTML = '';
    cat.forEach(function (k) { var b = mk('button', 'dk-ddi', k.name); b.type = 'button'; b.onmousedown = function (ev) { ev.preventDefault(); addL(k.name); }; dd.appendChild(b); });
    var raw = lin.value.trim(); if (raw && !cat.some(function (k) { return k.name.toLowerCase() === raw.toLowerCase(); })) { var o = mk('button', 'dk-ddi dk-own', '„' + raw + '“ so übernehmen'); o.type = 'button'; o.onmousedown = function (ev) { ev.preventDefault(); addL(raw); }; dd.appendChild(o); }
    dd.style.display = dd.children.length ? 'block' : 'none';
  };
  lin.addEventListener('input', showDd); lin.addEventListener('focus', showDd); lin.addEventListener('blur', function () { dd.style.display = 'none'; });
  lin.addEventListener('keydown', function (ev) { if (ev.key === 'Enter') { ev.preventDefault(); var q = lin.value.trim().toLowerCase(), hit = (settings.katalog || []).filter(function (k) { return k.name.toLowerCase().indexOf(q) >= 0; }); addL(q && hit.length === 1 ? hit[0].name : lin.value); } });
  lwrap.appendChild(lin); lwrap.appendChild(dd); lrow.appendChild(lwrap);
  var pb = mk('button', 'btn btn-secondary btn-sm dk-pb', '+ Produkt'); pb.type = 'button'; pb.title = 'Produkt aus dem Lager verwenden'; pb.onclick = function () { openVb(e.id); }; if (!e.pseudo) lrow.appendChild(pb);
  lw.appendChild(lrow); lw.appendChild(chips); drawChips();
  var pl = mk('div'); pl.id = 'dk-prod'; lw.appendChild(pl);
  var pta = dkTa('dk-produkte', d.produkte, 2); pta.placeholder = 'Anmerkung zu Produkten'; if (!String(d.produkte || '').trim()) pta.style.display = 'none'; lw.appendChild(pta);
  box.appendChild(dkSec('Leistung', lw));
  box.appendChild(dkT.behandlung);
  box.appendChild(dkFold(dkTextSec('dk-aufklaerung', 'Aufklärung', d.aufklaerung), d.aufklaerung));
  box.appendChild(vsec);
  box.appendChild(dkFold(dkTextSec('dk-ausblick', 'Ausblick und Procedere', d.ausblick), d.ausblick));
  var rs = dkTextSec('dk-rechnung', 'Text für die Rechnung', d.rechnung, 3); rs.appendChild(mk('div', 'hm-empty', 'Wird nicht automatisch übertragen. In der Rechnung kannst Du diesen Text bei Bedarf einfügen.')); box.appendChild(dkFold(rs, d.rechnung));
  var tw = mk('div'); var tl = mk('div'); tl.id = 'dk-todos'; tw.appendChild(tl);
  var ta2 = mk('div', 'add-row', '+ To-Do hinzufügen'); ta2.onclick = function () { dkTodos.push({ id: newId(), text: '', prio: 'mittel', due: '', done: false, created: Date.now() }); dkRenderTodos(); var ins = document.querySelectorAll('#dk-todos input[type=text]'); if (ins.length) ins[ins.length - 1].focus(); }; tw.appendChild(ta2);
  var tdf = dkFold(dkSec('To-Do', tw), dkTodos.length ? dkTodos.length + ' offen' : ''); if (e.pseudo) tdf.style.display = 'none'; box.appendChild(tdf);
  dkRenderProd(); dkRenderTodos(); openModal('modal-dok');
  [].slice.call(box.querySelectorAll('.dk-grow')).forEach(autoGrow);
}
function saveDok() {
  var e = dkEv; if (!e) return;
  var oldDok = auditDocState(dokOf(e)), g = function (id) { var el = document.getElementById(id); return el ? (el.value || '').trim() : ''; };
  if (!e.pseudo) dkApplyProd(e);
  var verw = { text: g('dk-verwtext') }; DK_VERW.forEach(function (v) { verw[v[0]] = document.getElementById('dk-v-' + v[0]).checked; });
  e.dok = { anamnese: g('dk-anamnese'), befund: g('dk-befund'), behandlung: g('dk-behandlung'), aufklaerung: g('dk-aufklaerung'), verw: verw, leist: g('dk-leist'), produkte: g('dk-produkte'), ausblick: g('dk-ausblick'), rechnung: g('dk-rechnung') };
  e.doku = dokuText(e);
  var ap = e.pseudo ? curP : patOf(e), aa = e.pseudo ? 'Freie Dokumentation' : 'Dokumentation · ' + fmtTermin(e);
  auditDiff(ap, aa, oldDok, auditDocState(e.dok), [['anamnese','Anamnese'],['befund','Befund'],['behandlung','Behandlung'],['aufklaerung','Aufklärung'],['leist','Leistungen'],['produkte','Produkte'],['ausblick','Ausblick und Procedere'],['rechnung','Rechnungstext'],['verw','Verwaltung']]);
  if (e.pseudo) {
    var d0 = e.pseudo; d0.dok = e.dok; d0.text = e.doku;
    if (!String(d0.text).trim()) curP.doku = (curP.doku || []).filter(function (y) { return y !== d0; });
    persist(); closeModal('modal-dok'); dkEv = null; renderVerlauf(); return;
  }
  var p = patOf(e);
  todos = todos.filter(function (t) { return t.eid !== e.id; }).concat(dkTodos.filter(function (t) { return String(t.text).trim(); }).map(function (t) { t.eid = e.id; t.pid = p ? p.id : undefined; t.text = String(t.text).trim(); return t; }));
  persist(); closeModal('modal-dok'); dkEv = null;
  if (curP && document.getElementById('modal-akte').classList.contains('active')) renderVerlauf();
  var tt = document.getElementById('tab-todos'); if (tt && tt.classList.contains('active')) renderTodos();
}
/* To-Do-Liste */
var PRIO_RANK = { hoch: 0, mittel: 1, niedrig: 2 };
function todoOpenToday(t) { return !t.done && (t.prio === 'hoch' || (t.due && t.due <= iso(new Date()))); }
function sortTodos(list) {
  var today = iso(new Date());
  return list.slice().sort(function (a, b) {
    if (!!a.done !== !!b.done) return a.done ? 1 : -1;
    var oa = a.due && a.due < today ? 0 : 1, ob = b.due && b.due < today ? 0 : 1; if (oa !== ob) return oa - ob;
    if (PRIO_RANK[a.prio] !== PRIO_RANK[b.prio]) return PRIO_RANK[a.prio] - PRIO_RANK[b.prio];
    return (a.due || '9999').localeCompare(b.due || '9999') || (a.created || 0) - (b.created || 0);
  });
}
function todoRow(t) {
  var today = iso(new Date()), row = mk('div', 'td-row td-' + (t.prio || 'mittel') + (t.done ? ' done' : ''));
  var cb = mk('input', 'td-chk'); cb.type = 'checkbox'; cb.checked = !!t.done; cb.setAttribute('aria-label', 'Erledigt');
  cb.onchange = function () { t.done = cb.checked; t.doneTs = cb.checked ? Date.now() : 0; persist(); refreshTodoViews(); };
  var main = mk('div', 'td-main'); main.appendChild(mk('div', 'td-text', t.text));
  var sub = mk('div', 'td-sub'), p = t.pid ? patients.filter(function (x) { return x.id === t.pid; })[0] : null, ev = t.eid ? events.filter(function (x) { return x.id === t.eid; })[0] : null;
  var parts = []; if (p) parts.push(dnP(p)); if (ev) parts.push('Termin ' + fmtTermin(ev)); sub.innerHTML = parts.map(function (x, k) { return k === 0 && p ? nmHtml(x) : esc(x); }).join(' · ');
  if (t.due) { var du = mk('span', '', (parts.length ? ' · ' : '') + 'fällig ' + fmtD(t.due)); if (!t.done && t.due < today) { du.style.color = '#b91c1c'; du.style.fontWeight = '600'; du.textContent += ' (überfällig)'; } sub.appendChild(du); }
  if (parts.length || t.due) main.appendChild(sub);
  main.onclick = function () { openTodo(t.id); };
  var pr = mk('span', 'prio prio-' + t.prio, t.prio === 'hoch' ? 'Hoch' : t.prio === 'mittel' ? 'Mittel' : 'Niedrig');
  row.appendChild(cb); row.appendChild(main); row.appendChild(pr); return row;
}
function refreshTodoViews() {
  updateTodoBadge();
  var tt = document.getElementById('tab-todos'); if (tt && tt.classList.contains('active')) renderTodos();
  if (curP && document.getElementById('modal-akte').classList.contains('active')) renderVerlauf();
}
function updateTodoBadge() {
  var n = todos.filter(todoOpenToday).length, b = document.getElementById('todo-badge'); if (!b) return;
  b.textContent = n; b.style.display = n ? 'inline' : 'none';
}
function setTdPrio(v) { tdPrio = v; renderTodos(); }
function setTdStat(v) { tdStat = v; renderTodos(); }
function renderTodos() {
  var box = document.getElementById('td-list'); if (!box) return;
  [].forEach.call(document.querySelectorAll('#td-prio button'), function (b) { b.className = b.getAttribute('data-v') === tdPrio ? 'on' : ''; });
  [].forEach.call(document.querySelectorAll('#td-stat button'), function (b) { b.className = b.getAttribute('data-v') === tdStat ? 'on' : ''; });
  var list = todos.filter(function (t) { return (!tdPrio || t.prio === tdPrio) && (tdStat === 'alle' || (tdStat === 'offen' ? !t.done : !!t.done)); });
  box.innerHTML = '';
  sortTodos(list).forEach(function (t) { box.appendChild(todoRow(t)); });
  if (!list.length) box.appendChild(mk('div', 'hm-empty', tdStat === 'erledigt' ? 'Noch nichts erledigt.' : 'Keine offenen To-Dos.'));
  updateTodoBadge();
}
function openTodo(id) {
  toCur = id ? todos.filter(function (t) { return t.id === id; })[0] : null;
  document.getElementById('to-title').textContent = toCur ? 'To-Do bearbeiten' : 'Neues To-Do';
  document.getElementById('to-text').value = toCur ? toCur.text : ''; document.getElementById('to-prio').value = toCur ? toCur.prio : 'mittel'; document.getElementById('to-due').value = toCur ? (toCur.due || '') : '';
  var p = toCur && toCur.pid ? patients.filter(function (x) { return x.id === toCur.pid; })[0] : null; document.getElementById('to-pat').value = p ? nameKey(p) : '';
  var ev = toCur && toCur.eid ? events.filter(function (x) { return x.id === toCur.eid; })[0] : null; document.getElementById('to-ev').textContent = ev ? 'Aus der Dokumentation zum Termin ' + fmtTermin(ev) : '';
  document.getElementById('to-del').style.display = toCur ? '' : 'none'; openModal('modal-todo');
}
function saveTodo() {
  var tx = document.getElementById('to-text').value.trim(); if (!tx) { alert('Bitte eine Aufgabe eingeben.'); return; }
  var pn = document.getElementById('to-pat').value.trim(), p = pn ? patients.filter(function (x) { return nameKey(x) === pn; })[0] : null;
  if (pn && !p) { alert('Den Patienten "' + pn + '" gibt es nicht. Bitte aus der Liste wählen oder das Feld leeren.'); return; }
  var t = toCur || { id: newId(), done: false, created: Date.now() };
  t.text = tx; t.prio = document.getElementById('to-prio').value; t.due = document.getElementById('to-due').value; t.pid = p ? p.id : undefined;
  if (!toCur) todos.push(t);
  persist(); closeModal('modal-todo'); refreshTodoViews();
}
async function deleteTodo() { if (!toCur || !await kaConfirm('To-Do löschen?')) return; todos = todos.filter(function (t) { return t !== toCur; }); persist(); closeModal('modal-todo'); refreshTodoViews(); }

