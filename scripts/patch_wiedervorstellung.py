from pathlib import Path

p = Path('index.html')
s = p.read_text(encoding='utf-8')

def repl(old, new, n=1):
    global s
    c = s.count(old)
    if c != n:
        raise SystemExit(f'Erwartet {n} Treffer, gefunden {c}: {old[:100]!r}')
    s = s.replace(old, new, n)

repl("var KA_V = '2026-11-01-zf';", "var KA_V = '2026-11-03-a';")

old = "  Object.keys(m.byId).forEach(function (k) { var q = m.byId[k]; if (q.next && q.next.date <= remLim && !bestLast(patients.filter(function (x) { return String(x.id) === k; })[0] || {}, 'termin:' + q.next.id, 'sent')) q.rem = q.next; });\n  Object.keys(m.byId).forEach(function (k) { m.byId[k].unb.sort(function (a, b) { return (b.date + b.time).localeCompare(a.date + a.time); }); });"
new = "  Object.keys(m.byId).forEach(function (k) { var q = m.byId[k]; if (q.next && q.next.date <= remLim && !bestLast(patients.filter(function (x) { return String(x.id) === k; })[0] || {}, 'termin:' + q.next.id, 'sent')) q.rem = q.next; });\n  /* Wiedervorstellung: ab dem empfohlenen Datum erinnern, solange kein zukünftiger Termin gebucht ist. */\n  Object.keys(m.byId).forEach(function (k) {\n    var q = m.byId[k], p = patients.filter(function (x) { return String(x.id) === k; })[0];\n    if (p && p.wiedervorstellung && p.wiedervorstellung <= tdy && !q.next) q.wieder = p.wiedervorstellung;\n  });\n  Object.keys(m.byId).forEach(function (k) { m.byId[k].unb.sort(function (a, b) { return (b.date + b.time).localeCompare(a.date + a.time); }); });"
repl(old, new)

old = "function anamConfirm(p) {\n  bestAdd(p, 'anamnese', 'vorOrt'); p.log = p.log || []; p.log.push({ ts: Date.now(), type: 'notiz', text: 'Anamnese vor Ort bestätigt' });\n  persist(); renderUnterlagen(); if (curP === p) { renderHead(); renderVerlauf(); }\n}"
new = old + "\nfunction setWiedervorstellung(p, date) {\n  var old = p.wiedervorstellung || '', v = String(date || '').trim();\n  if (old === v) return;\n  if (v) p.wiedervorstellung = v; else delete p.wiedervorstellung;\n  auditOne(p, 'Behandlungsplanung', 'Empfohlene Wiedervorstellung', old ? fmtD(old) : '[nicht festgelegt]', v ? fmtD(v) : '[entfernt]');\n  persist(); if (curP === p) { renderHead(); renderFlags(); } renderPatients();\n}\nfunction openWiedervorstellungTermin(p) {\n  curP = p; openTermin(p.wiedervorstellung || iso(new Date()), '11:30', true);\n}"
repl(old, new)

old = "  if (f.anam) { var c = mk('span', 'fl fl-amb', 'Anamnese'); c.title = anamText(f.anam.info) + ' · Termin ' + fmtTermin(f.anam.e); out.push(c); }\n  return out;"
new = "  if (f.anam) { var c = mk('span', 'fl fl-amb', 'Anamnese'); c.title = anamText(f.anam.info) + ' · Termin ' + fmtTermin(f.anam.e); out.push(c); }\n  if (f.wieder) { var w = mk('span', 'fl fl-orange', 'Wiedervorstellung'); w.title = 'Wiedervorstellung fehlt · empfohlen ' + fmtD(f.wieder); out.push(w); }\n  return out;"
repl(old, new)

old = "  if (f.anam) out.push({ cls: 'fl-amb', label: anamText(f.anam.info), menu: [['Per E-Mail senden', function () { sendForm(p, ['anamnese'], 'mail', 'Anamnesebogen', fillPlatzhalter(ANAM_TXT, p)); }], ['Per WhatsApp senden', function () { sendForm(p, ['anamnese'], 'wa', 'Anamnesebogen', fillPlatzhalter(ANAM_TXT, p)); }], ['Vor Ort bestätigt (heute)', function () { anamConfirm(p); }]] });\n  if (f.rem) {"
new = "  if (f.anam) out.push({ cls: 'fl-amb', label: anamText(f.anam.info), menu: [['Per E-Mail senden', function () { sendForm(p, ['anamnese'], 'mail', 'Anamnesebogen', fillPlatzhalter(ANAM_TXT, p)); }], ['Per WhatsApp senden', function () { sendForm(p, ['anamnese'], 'wa', 'Anamnesebogen', fillPlatzhalter(ANAM_TXT, p)); }], ['Vor Ort bestätigt (heute)', function () { anamConfirm(p); }]] });\n  if (f.wieder) out.push({ cls: 'fl-orange', label: 'Wiedervorstellung fehlt · empfohlen ' + fmtD(f.wieder), menu: [['Termin vereinbaren', function () { openWiedervorstellungTermin(p); }], ['Empfehlung entfernen', function () { setWiedervorstellung(p, ''); }]] });\n  if (f.rem) {"
repl(old, new)

old = "  tiles.appendChild(kt);\n  tiles.appendChild(txtTile('notizen', 'Notiz', '', 'Keine Notiz'));"
new = "  tiles.appendChild(kt);\n  tiles.appendChild(tileBox('wiedervorstellung', 'Wiedervorstellung', '', function (t, ed) {\n    if (!ed) {\n      var v = p.wiedervorstellung || '';\n      var tx = mk('div', 'a-txt', v ? 'Empfohlen am ' + fmtD(v) : 'Keine Wiedervorstellung geplant');\n      if (!v) tx.style.color = '#94a3b8'; t.appendChild(tx); return;\n    }\n    var inp = mk('input', 'form-control'); inp.type = 'date'; inp.id = 'a-wieder-in'; inp.value = p.wiedervorstellung || ''; t.appendChild(inp);\n    var fb = mk('div', 'foot-bar'); fb.style.cssText = 'margin-top:10px; padding-top:10px;';\n    var rm = mk('button', 'btn btn-cancel', 'Entfernen'); rm.type = 'button'; rm.style.marginRight = 'auto'; rm.onclick = function () { tileEdit = ''; setWiedervorstellung(p, ''); };\n    var cb = mk('button', 'btn btn-cancel', 'Abbrechen'); cb.type = 'button'; cb.onclick = function () { tileEdit = ''; renderHead(); };\n    var sv = mk('button', 'btn btn-save', 'Speichern'); sv.type = 'button'; sv.onclick = function () { var v = inp.value; if (!v) { alert('Bitte ein Datum wählen oder „Entfernen“ verwenden.'); return; } tileEdit = ''; setWiedervorstellung(p, v); };\n    fb.appendChild(rm); fb.appendChild(cb); fb.appendChild(sv); t.appendChild(fb);\n  }));\n  tiles.appendChild(txtTile('notizen', 'Notiz', '', 'Keine Notiz'));"
repl(old, new)

p.write_text(s, encoding='utf-8')

sw = Path('sw.js')
w = sw.read_text(encoding='utf-8')
oldv = "var V='2026-11-01-zf'"
if w.count(oldv) != 1:
    raise SystemExit('Service-Worker-Version nicht eindeutig gefunden')
sw.write_text(w.replace(oldv, "var V='2026-11-03-a'", 1), encoding='utf-8')

Path('.github/workflows/implement-wiedervorstellung.yml').unlink()
Path('scripts/patch_wiedervorstellung.py').unlink()
