/* ===== Kategorien und Vorlagen ===== */
var KATS = ['Aufnahme und Anamnese', 'Aufklärung', 'Einwilligung und Datenschutz', 'Nachsorge', 'Rezept', 'Befund', 'Sonstiges'];
function katGuess(n) {
  n = String(n || '').toLowerCase();
  if (/aufkl|dermalfiller|hylase|sculptra|neuromodulator|botulinum|filler/.test(n)) return KATS[1];
  if (/aufnahme|anamnese/.test(n)) return KATS[0];
  if (/datenschutz|einwilligung|dsgvo/.test(n)) return KATS[2];
  if (/after|nachsorge|verhaltens/.test(n)) return KATS[3];
  if (/rezept/.test(n)) return KATS[4];
  if (/befund|labor/.test(n)) return KATS[5];
  return KATS[6];
}
function katOf(r) { return r.kat || katGuess(r.name); }
function fillKatSelect(sel, withAll) {
  var v = sel.value; sel.innerHTML = '';
  if (withAll) { var o = mk('option', '', 'Alle Kategorien'); o.value = ''; sel.appendChild(o); }
  KATS.forEach(function (k) { var o = mk('option', '', k); o.value = k; sel.appendChild(o); });
  sel.value = v || (withAll ? '' : KATS[1]);
}
function hasTpl(p, t) { return (p.dokumente || []).some(function (d) { return d.tid === t.id || String(d.name).toLowerCase() === String(t.name).toLowerCase(); }); }
function tplsForEvent(e) {
  var out = [];
  evLeistungen(e).concat([e.behandlung]).forEach(function (n) {
    var k = n ? findKat(n) : null;
    (k && k.vorlagen || []).forEach(function (id) { var t = templates.filter(function (x) { return x.id === id; })[0]; if (t && out.indexOf(t) < 0) out.push(t); });
  });
  return out;
}
function addTplTo(p, t, zu, i) {
  var id = newId();
  return fileBlob(t).then(function (bl) { return bl ? fPut(id, t.name, bl) : false; }).then(function (ok) {
    if (ok) { var rec = { id: id, ts: Date.now() + (i || 0), name: t.name, kat: t.kat || katOf(t), tid: t.id, zu: zu || undefined }; p.dokumente = (p.dokumente || []).concat([rec]); auditFilesAdded(p, [rec], 'Dokumente'); }
    return ok;
  });
}
function addTplsTo(p, list, zu, then) {
  Promise.all(list.map(function (t, i) { return addTplTo(p, t, zu, i); })).then(function (r) {
    persist(); if (curP === p && document.getElementById('modal-akte').classList.contains('active')) { renderVerlauf(); }
    if (r.some(function (x) { return !x; })) alert('Nicht alle Vorlagen konnten übernommen werden.');
    if (then) then();
  });
}
/* beim Anlegen eines Termins: zur Leistung gehörende Unterlagen vorschlagen */
async function offerVorlagen(e) {
  var p = eventPatient(e); if (!p) return;
  var miss = tplsForEvent(e).filter(function (t) { return !hasTpl(p, t); });
  if (!miss.length) return;
  if (!await kaConfirm('Zu "' + (e.leistung || e.behandlung) + '" gehören diese Unterlagen:\n' + miss.map(function (t) { return '- ' + t.name; }).join('\n') + '\n\nJetzt der Akte von ' + nameKey(p) + ' hinzufügen?')) return;
  addTplsTo(p, miss, 'e' + e.id);
}
/* bei einem neuen Patienten: Aufnahme, Anamnese, Datenschutz usw. */
async function offerNeu(p) {
  var miss = templates.filter(function (t) { return t.neu && !hasTpl(p, t); });
  if (!miss.length) return;
  if (!await kaConfirm('Für den neuen Patienten ' + nameKey(p) + ' diese Unterlagen hinzufügen?\n' + miss.map(function (t) { return '- ' + t.name; }).join('\n'))) return;
  addTplsTo(p, miss, null);
}
/* Unterlagen: Pakete, Online-Formulare mit Status, Vorlagen zum Unterschreiben */
var PK_FORMS = [['anmeldung', 'Patientenanmeldung', 'LinkAnmeldung', 'Deine Anmeldung bei Kreuzberg Ästhetik'], ['erinnerung', 'Terminerinnerung', 'LinkErinnerung', 'Terminerinnerung per E-Mail'], ['anamnese', 'Anamnesebogen', 'LinkAnamnese', 'Dein Anamnesebogen']];
/* Protokoll der Formulare und Bestätigungen am Patienten: p.best = [{ k: Formular, art: 'sent' | 'got' | 'vorOrt', ts }] */
function bestAdd(p, k, art) { (p.best = p.best || []).push({ k: k, art: art, ts: Date.now() }); }
function bestLast(p, k, art) { return (p.best || []).reduce(function (m, e) { return e.k === k && e.art === art && e.ts > m ? e.ts : m; }, 0); }
function formSt(p, k) { return { sent: bestLast(p, k, 'sent'), got: bestLast(p, k, 'got') }; }
function formMark(p, k, art) { bestAdd(p, k, art); }
function waOpen(p, txt) {
  var ph = String(p.phone || '').replace(/[^\d+]/g, '').replace(/^\+/, '').replace(/^00/, '').replace(/^0/, '49');
  window.open('https://wa.me/' + (ph.length > 6 ? ph : '') + '?text=' + encodeURIComponent(txt), '_blank');
}
function pakete() {
  settings.pakete = settings.pakete || [];
  if (!settings.paketeInit) {
    settings.paketeInit = 1;
    settings.pakete.push({ id: newId(), name: 'Erstkunden', forms: ['anmeldung', 'erinnerung'], tpls: templates.filter(function (t) { return t.neu; }).map(function (t) { return t.id; }), betreff: 'Willkommen bei Kreuzberg Ästhetik', text: '{AnredeInformell},\n\nschön, dass Du zu uns kommst! Bitte fülle vor Deinem Termin diese Formulare aus:\n\n{Links}\n\nDas geht bequem am Handy und dauert nur wenige Minuten. Den Anamnesebogen schicke ich Dir danach separat.\n\nManuel - Kreuzberg Ästhetik' });
    persist();
  }
  return settings.pakete;
}
function pkForm(k) { return PK_FORMS.filter(function (x) { return x[0] === k; })[0]; }
function tplById(id) { return templates.filter(function (t) { return t.id === id; })[0]; }
function pkLinks(p, keys) { return keys.map(function (k) { var f = pkForm(k); return f ? f[1] + ': ' + fillPlatzhalter('{' + f[2] + '}', p) : ''; }).filter(Boolean).join('\n'); }
/* Formular-Links per E-Mail oder WhatsApp senden und als gesendet merken */
function sendForm(p, keys, how, subject, txt) {
  keys.forEach(function (k) { formMark(p, k, 'sent'); });
  persist(); renderUnterlagen();
  if (how === 'wa') waOpen(p, txt); else tvMail(p, '', [subject, txt]);
}
function sendMenu(ev, p, keys, subject, txt, extra) {
  tlMenu(ev, [['Per E-Mail', function () { sendForm(p, keys, 'mail', subject, txt); }], ['Per WhatsApp', function () { sendForm(p, keys, 'wa', subject, txt); }]].concat(extra || []));
}
var ANAM_TXT = '{AnredeInformell},\n\nbitte fülle vor Deinem Termin den Anamnesebogen aus:\n{LinkAnamnese}\n\nManuel - Kreuzberg Ästhetik';
function pkSend(p, pk, how) {
  var txt = fillPlatzhalter(String(pk.text || '{Links}').replace('{Links}', pkLinks(p, pk.forms || [])), p);
  var fehlt = (pk.tpls || []).map(tplById).filter(function (t) { return t && tplState(p, t).s === 'fehlt'; });
  sendForm(p, pk.forms || [], how, pk.betreff || 'Formulare', txt);
  if (fehlt.length) addTplsTo(p, fehlt, null, renderUnterlagen);
}
/* Stand der Online-Formulare: erledigt (Anmeldung eingegangen, Anamnese gültig), wartet (gesendet) oder offen */
function formStatus(p) {
  var an = formSt(p, 'anmeldung'), am = formSt(p, 'anamnese'), ai = anamInfo(p), okA = !!an.got, okM = ai.state === 'ok' || ai.state === 'bald';
  if (okA && okM) return { s: 'ok', t: 'Formulare: alles eingegangen' };
  if ((!okA && an.sent) || (!okM && am.sent && am.sent > (ai.ts || 0))) return { s: 'wait', t: 'Formulare: gesendet, wartet auf Antwort' };
  return { s: 'todo', t: 'Formulare senden' };
}
function formMenuItems(p) {
  var out = [];
  PK_FORMS.forEach(function (f) {
    var st = formSt(p, f[0]), tag = f[0] === 'anamnese' ? (anamInfo(p).state === 'ok' ? ' ✓' : '') : st.got ? ' ✓' : st.sent ? ' …' : '';
    ['mail', 'wa'].forEach(function (how) { out.push([f[1] + (how === 'wa' ? ' per WhatsApp' : ' per E-Mail') + (how === 'mail' ? tag : ''), function () { sendForm(p, [f[0]], how, f[3], fillPlatzhalter('{AnredeInformell},\n\nbitte fülle vor Deinem Termin den Bogen aus:\n{' + f[2] + '}\n\nManuel - Kreuzberg Ästhetik', p)); }]); });
  });
  return out;
}
function fmSend(ev, p, k) {
  var f = pkForm(k);
  var st = formSt(p, k), ex = [];
  if (st.sent && !st.got) ex.push(['Als nicht gesendet zurücksetzen', function () { p.best = (p.best || []).filter(function (b) { return !(b.k === k && b.art === 'sent'); }); persist(); if (curP === p) { renderVerlauf(); renderHead(); } renderPatients(); }]);
  sendMenu(ev, p, [k], f[3], fillPlatzhalter('{AnredeInformell},\n\nbitte fülle vor Deinem Termin den Bogen aus:\n{' + f[2] + '}\n\nManuel - Kreuzberg Ästhetik', p), ex);
}
/* Hinweisblatt oder Aufklärung als Link: Hinweisblätter enthalten keine Daten (ohne Code), Aufklärungen laufen über den Patientencode */
function docLink(p, d) { var u = webfUrl(d.typ === 'info' ? 'info.html' : 'aufklaerung.html') + '?d=' + d.id; return d.typ === 'info' ? u : u + '&c=' + pCode(p); }
function docSend(ev, p, d) {
  var txt = d.typ === 'info' ? fillPlatzhalter('{AnredeInformell},\n\nhier findest Du die Hinweise nach Deiner Behandlung:\n' + docLink(p, d) + '\n\nManuel - Kreuzberg Ästhetik', p)
    : fillPlatzhalter('{AnredeInformell},\n\nbitte lies vor Deinem Termin diese Aufklärung und bestätige am Ende, dass Du sie gelesen hast:\n' + docLink(p, d) + '\n\nDie Unterschrift leistest Du bei uns in der Praxis.\n\nManuel - Kreuzberg Ästhetik', p);
  sendMenu(ev, p, ['doc:' + d.id], d.titel, txt);
}
function renderUnterlagen() {
  fNamen();
  var blk = document.getElementById('a-unt-block'), box = document.getElementById('a-unt'); if (!blk || !curP) return;
  var p = curP, today = iso(new Date()), n = nameKey(p); blk.style.display = 'block'; box.innerHTML = '';
  var row = function (cls, ic, t, sub, btn) {
    var r = mk('div', 'un-row'), m = mk('div', 'un-main'); r.appendChild(mk('div', 'un-st ' + cls, ic)); m.appendChild(mk('div', 'un-t', t)); m.appendChild(mk('div', 'un-s', sub)); r.appendChild(m); if (btn) r.appendChild(btn); box.appendChild(r); return r;
  };
  var bt = function (txt, dark, fn) { var b = mk('button', 'ak-act' + (dark ? ' hl' : '')); b.type = 'button'; b.title = txt; b.innerHTML = tvSvg(/whatsapp/i.test(txt) ? 'wa' : /hinzu/i.test(txt) ? 'plus' : /unterschr/i.test(txt) ? 'pen' : 'mail') + '<span>' + txt.replace(/^Per /, '') + '</span>'; b.onclick = fn; return b; };
  var dm = function (ts) { return fmtD(iso(new Date(ts))); };
  var unReset = function (keys) {
    var b = mk('button', 'btn btn-secondary un-btn'); b.type = 'button'; b.title = 'Als nicht gesendet zurücksetzen'; b.setAttribute('aria-label', 'Als nicht gesendet zurücksetzen');
    b.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle"><path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 010 12h-3"/></svg>';
    b.onclick = function () { p.best = (p.best || []).filter(function (x) { return !(keys.indexOf(x.k) >= 0 && x.art === 'sent'); }); persist(); renderUnterlagen(); renderPatients(); };
    return b;
  };
  /* Pakete */
  pakete().forEach(function (pk) {
    var c = mk('div', 'un-pk'); c.appendChild(mk('b', '', pk.name));
    var names = (pk.forms || []).map(function (k) { return pkForm(k)[1]; }).concat((pk.tpls || []).map(function (id) { var t = tplById(id); return t ? t.name + ' (vor Ort)' : ''; }).filter(Boolean));
    c.appendChild(mk('div', 'un-s', names.join(' + ') || 'Leeres Paket'));
    var ts = (pk.forms || []).map(function (k) { return formSt(p, k).sent || 0; }), last = Math.max.apply(null, ts.concat([0]));
    var rr = mk('div'); rr.style.cssText = 'display:flex; gap:8px; align-items:center; margin-top:8px; flex-wrap:wrap;';
    rr.appendChild(bt('Per E-Mail', true, function () { pkSend(p, pk, 'mail'); })); rr.appendChild(bt('Per WhatsApp', false, function () { pkSend(p, pk, 'wa'); }));
    rr.appendChild(mk('span', 'un-s', last ? 'gesendet ' + dm(last) : 'noch nicht gesendet')); if (last) rr.appendChild(unReset(pk.forms || [])); c.appendChild(rr); box.appendChild(c);
  });
  /* Online-Formulare */
  box.appendChild(mk('div', 'un-grp', 'Online vor dem Termin'));
  PK_FORMS.forEach(function (f) {
    var st = formSt(p, f[0]), got = st.got || 0, sent = st.sent || 0, anm = formSt(p, 'anmeldung');
    if (f[0] === 'anamnese') {
      var ai = anamInfo(p);
      if (ai.ts) {
        var sub2 = ai.state === 'ok' ? 'bestätigt ' + dm(ai.ts) + ' · gültig bis ' + dm(ai.due) : ai.state === 'bald' ? 'gültig bis ' + dm(ai.due) + ' · bald erneuern' : 'vom ' + dm(ai.ts) + ' · älter als 1 Jahr';
        if (sent && sent > ai.ts) sub2 += ' · Erneuerung gesendet ' + dm(sent);
        var b2 = ai.state === 'ok' ? null : bt('Erneuern', ai.state === 'faellig', function (ev) {
          sendMenu(ev, p, ['anamnese'], 'Anamnesebogen erneuern', fillPlatzhalter('{AnredeInformell},\n\nbitte bestätige oder aktualisiere vor Deinem Termin Deinen Anamnesebogen (einmal im Jahr nötig):\n{LinkAnamnese}\n\nManuel - Kreuzberg Ästhetik', p), [['Vor Ort bestätigt (heute)', function () { anamConfirm(p); }]]);
        });
        row(ai.state === 'ok' ? 'ok' : 'wait', ai.state === 'ok' ? '✓' : '!', f[1], sub2, b2); return;
      }
    }
    var sub = got ? 'eingegangen ' + dm(got) : sent ? 'gesendet ' + dm(sent) + ' · wartet' : f[0] === 'anamnese' && !anm.got ? 'erst nach der Anmeldung' : 'noch nicht gesendet';
    var btn = got ? null : bt('Senden', f[0] === 'anamnese' && anm.got && !sent, function (ev) { fmSend(ev, p, f[0]); });
    if (btn && sent) { var bw = mk('span'); bw.style.cssText = 'display:inline-flex; gap:6px; align-items:center; flex:none;'; bw.appendChild(unReset([f[0]])); bw.appendChild(btn); btn = bw; }
    row(got ? 'ok' : sent ? 'wait' : '', got ? '✓' : sent ? '…' : '–', f[1], sub, btn);
  });
  /* Vorlagen zum Unterschreiben */
  var req = templates.filter(function (t) { return t.neu; });
  events.forEach(function (e) { if (eventBelongs(e, p) && e.date >= today) tplsForEvent(e).forEach(function (t) { if (req.indexOf(t) < 0) req.push(t); }); });
  templates.forEach(function (t) { if (req.indexOf(t) < 0 && tplDoc(p, t)) req.push(t); });
  box.appendChild(mk('div', 'un-grp', 'In der Praxis unterschreiben'));
  req.forEach(function (t) {
    var st = tplState(p, t), d = st.d, btn;
    if (st.s === 'fehlt') btn = bt('Hinzufügen', false, function () { addTplsTo(p, [t], null); });
    else if (st.s === 'offen') btn = bt('Unterschreiben', true, function () { openSign(p, d); });
    else btn = mk('span', 'badge badge-green', d.sig ? 'unterschrieben' : 'vorhanden');
    var wd = t.web ? KA_DOCS.filter(function (x) { return x.id === t.web; })[0] : null, wsub = '';
    if (wd) { var ws = bestLast(p, 'doc:' + wd.id, 'sent'), wg = bestLast(p, 'doc:' + wd.id, 'got'); wsub = wg ? ' · online gelesen ' + dm(wg) : ws ? ' · Link gesendet ' + dm(ws) : ''; }
    var wrap = btn;
    if (wd) { wrap = mk('span'); wrap.style.cssText = 'display:inline-flex; gap:6px; align-items:center; flex:none;'; var lb = mk('button', 'btn btn-secondary un-btn'); lb.type = 'button'; lb.title = 'Link senden'; lb.setAttribute('aria-label', 'Link senden'); lb.innerHTML = tvSvg('mail'); lb.firstChild.style.cssText = 'width:16px;height:16px;vertical-align:middle;'; lb.onclick = function (ev) { ev.stopPropagation(); docSend(ev, p, wd); }; wrap.appendChild(lb); wrap.appendChild(btn); }
    row(st.s === 'ok' ? 'ok' : st.s === 'offen' ? 'wait' : '', st.s === 'ok' ? '✓' : st.s === 'offen' ? '✎' : '–', t.name, (st.s === 'ok' ? (d.sig ? 'unterschrieben ' + dm(d.sig.ts) : 'vom ' + dm(tsOf(d))) : st.s === 'offen' ? 'Unterschrift fehlt' : 'noch nicht in der Akte') + wsub, wrap);
  });
  var ds = mk('select', 'form-control'); ds.style.cssText = 'margin-top:10px; font-size:13px;';
  var d0 = mk('option', '', 'Hinweisblatt oder Aufklärung als Link senden …'); d0.value = ''; ds.appendChild(d0);
  KA_DOCS.forEach(function (d) { var o = mk('option', '', (d.typ === 'info' ? 'Hinweis: ' : 'Aufklärung: ') + d.name.replace(/^(Nachsorge|Aufklärung) /, '')); o.value = d.id; ds.appendChild(o); });
  ds.onchange = function () { var d = KA_DOCS.filter(function (x) { return x.id === ds.value; })[0]; if (d) docSend({ stopPropagation: function () {}, currentTarget: ds }, p, d); ds.value = ''; };
  box.appendChild(ds);
  var rest = templates.filter(function (t) { return req.indexOf(t) < 0; });
  if (rest.length) {
    var sel = mk('select', 'form-control'); sel.style.cssText = 'margin-top:10px; font-size:13px;';
    var o0 = mk('option', '', '+ Weitere Vorlage hinzufügen …'); o0.value = ''; sel.appendChild(o0);
    rest.forEach(function (t) { var o = mk('option', '', t.name); o.value = String(t.id); sel.appendChild(o); });
    sel.onchange = function () { var t = templates.filter(function (x) { return String(x.id) === sel.value; })[0]; if (t) addTplsTo(p, [t], null, renderUnterlagen); };
    box.appendChild(sel);
  }
}
/* Pakete verwalten (Praxis, Nachrichten) */
var pkIdx = -1;
function renderPakete() { var l = pakete(); simpleList('pk-list', l, openPaket, function (x) { return (x.forms || []).length + ' Formular(e), ' + (x.tpls || []).length + ' Vorlage(n)'; }); }
function openPaket(i) {
  pkIdx = i; var x = i >= 0 ? pakete()[i] : { name: '', forms: [], tpls: [], betreff: '', text: '{AnredeInformell},\n\nbitte fülle vor Deinem Termin diese Formulare aus:\n\n{Links}\n\nManuel - Kreuzberg Ästhetik' };
  document.getElementById('pk-name').value = x.name; document.getElementById('pk-betreff').value = x.betreff || ''; document.getElementById('pk-text').value = x.text || '';
  var fb = document.getElementById('pk-forms'); fb.innerHTML = '';
  PK_FORMS.forEach(function (f) { var l = mk('label'); l.style.cssText = 'display:flex; gap:8px; align-items:center; font-weight:400; margin-bottom:4px;'; var c = mk('input'); c.type = 'checkbox'; c.value = f[0]; c.checked = (x.forms || []).indexOf(f[0]) >= 0; l.appendChild(c); l.appendChild(document.createTextNode(f[1])); fb.appendChild(l); });
  var tb = document.getElementById('pk-tpls'); tb.innerHTML = '';
  templates.forEach(function (t) { var l = mk('label'); l.style.cssText = 'display:flex; gap:8px; align-items:center; font-weight:400; margin-bottom:4px;'; var c = mk('input'); c.type = 'checkbox'; c.value = String(t.id); c.checked = (x.tpls || []).indexOf(t.id) >= 0; l.appendChild(c); l.appendChild(document.createTextNode(t.name)); tb.appendChild(l); });
  if (!templates.length) tb.appendChild(mk('div', 'hm-empty', 'Noch keine Vorlagen unter Praxis, Vorlagen.'));
  document.getElementById('pk-del').style.display = i >= 0 ? '' : 'none'; openModal('modal-pk');
}
function savePaket() {
  var nm = document.getElementById('pk-name').value.trim(); if (!nm) { alert('Bitte einen Namen eingeben.'); return; }
  var x = { id: pkIdx >= 0 ? pakete()[pkIdx].id : newId(), name: nm, betreff: document.getElementById('pk-betreff').value.trim(), text: document.getElementById('pk-text').value,
    forms: [].slice.call(document.querySelectorAll('#pk-forms input:checked')).map(function (c) { return c.value; }),
    tpls: [].slice.call(document.querySelectorAll('#pk-tpls input:checked')).map(function (c) { var t = templates.filter(function (y) { return String(y.id) === c.value; })[0]; return t ? t.id : c.value; }) };
  if (pkIdx >= 0) settings.pakete[pkIdx] = x; else settings.pakete.push(x);
  persist(); closeModal('modal-pk'); renderPakete();
}
async function deletePaket() { if (pkIdx < 0 || !await kaConfirm('Paket löschen?')) return; settings.pakete.splice(pkIdx, 1); persist(); closeModal('modal-pk'); renderPakete(); }
/* Standardvorlagen: Nachsorge-Blätter als PDF, erstellt aus den Verhaltensregeln der Praxis (einmalig beim ersten Öffnen von Dokumente) */
var VL_VER = 5;
var AUFKL_KOPF = 'Patient/in: ______________________________   Geboren am: ________________\nBehandelter Bereich / Präparat: ________________________________________\nDatum: ________________   Behandelnder Arzt: Manuel Fella';

function tbText(n) { var t = TB_STD.filter(function (x) { return x.name === n; })[0]; return t ? t.text : ''; }
async function vlPdf(titel, blocks, sig) {
  var L = await loadPdfLib(), doc = await L.PDFDocument.create(), f = await doc.embedFont(L.StandardFonts.Helvetica), fb = await doc.embedFont(L.StandardFonts.HelveticaBold);
  var W = 595.28, H = 841.89, M = 56, y = 0, page = null, gray = L.rgb(0.4, 0.45, 0.5), black = L.rgb(0.06, 0.09, 0.16);
  var add = function () { page = doc.addPage([W, H]); y = H - M; };
  var line = function (t, o) { o = o || {}; var sz = o.size || 10.5, ft = o.bold ? fb : f; if (y < M + sz * 2) add(); page.drawText(rxSafe(t), { x: M + (o.x || 0), y: y - sz, size: sz, font: ft, color: o.color || black }); y -= sz * 1.5; };
  var wrap = function (t, sz, ft, maxW) { var out = [], cur = ''; rxSafe(t).split(/\s+/).forEach(function (w) { var c = cur ? cur + ' ' + w : w; if (cur && ft.widthOfTextAtSize(c, sz) > maxW) { out.push(cur); cur = w; } else cur = c; }); if (cur) out.push(cur); return out; };
  add();
  line(PRAXIS.kopf.replace(' - ', ' · '), { bold: true, size: 12 }); line(PRAXIS.strasse + ' · ' + PRAXIS.ort + ' · ' + PRAXIS.web, { size: 9, color: gray }); y -= 16;
  line(titel, { bold: true, size: 15 }); y -= 8;
  blocks.forEach(function (b) {
    String(b).split('\n').forEach(function (l) {
      if (!l.trim()) { y -= 6; return; }
      var bullet = /^- /.test(l), txt = bullet ? l.slice(2) : l, head = !bullet && /[:?]$/.test(l.trim()) && l.length < 70;
      var x = bullet ? 14 : 0, sz = 10.5, ft = head ? fb : f;
      wrap(txt, sz, ft, W - 2 * M - x - (bullet ? 10 : 0)).forEach(function (w, i) { if (y < M + sz * 2) add(); if (bullet && i === 0) page.drawCircle({ x: M + 4, y: y - sz * 0.4, size: 1.8, color: black }); page.drawText(w, { x: M + x + (bullet ? 10 : 0), y: y - sz, size: sz, font: ft, color: black }); y -= sz * 1.5; });
    });
    y -= 12;
  });
  if (sig) {
    /* Unterschriftsfeld an der Stelle, an der die App die Unterschrift einfügt (letzte Seite, rechts unten) */
    if (H - y > H * 0.86 - 24) add();
    var ly = H - H * 0.86 - (W * 0.30 / 3.5) - 1;
    page.drawLine({ start: { x: W * 0.55, y: ly }, end: { x: W * 0.55 + W * 0.30, y: ly }, thickness: 0.7, color: black });
    page.drawText('Unterschrift Patient/in', { x: W * 0.55, y: ly - 22, size: 8, font: f, color: gray });
    page.drawLine({ start: { x: M, y: ly }, end: { x: M + 170, y: ly }, thickness: 0.7, color: black });
    page.drawText('Ort, Datum', { x: M, y: ly - 22, size: 8, font: f, color: gray });
  }
  var bytes = await doc.save(); return new Blob([bytes], { type: 'application/pdf' });
}
var vlBusy = false;
async function vlStandard() {
  if (vlBusy || (settings.vlVer || 0) >= VL_VER) return; vlBusy = true;
  try {
    var made = 0, have = {}; templates.forEach(function (t) { have[String(t.name).toLowerCase()] = t; });
    for (var i = 0; i < KA_DOCS.length; i++) {
      var d = KA_DOCS[i], t = have[d.name.toLowerCase()], auf = d.typ === 'aufklaerung';
      if (!t) {
        var blob = await vlPdf(d.titel, auf ? [AUFKL_KOPF, d.text] : d.parts.map(function (n) { return KA_PARTS[n]; }), auf), id = newId();
        if (!(await fPut(id, d.name + '.pdf', blob))) continue;
        t = { id: id, ts: Date.now() + i, name: d.name, kat: auf ? 'Aufklärung' : 'Nachsorge', neu: false }; if (auf) t.sig = { on: true, page: 0, x: 0.55, y: 0.86, w: 0.30 };
        templates.push(t); made++;
      }
      t.web = d.id;
      /* zu passenden Leistungen verknüpfen, damit die Vorlage beim Termin vorgeschlagen wird */
      if (d.match) { var re = new RegExp(d.match, 'i'); (settings.katalog || []).forEach(function (k) { if (re.test(k.name) && (k.vorlagen = k.vorlagen || []).indexOf(t.id) < 0) k.vorlagen.push(t.id); }); }
    }
    settings.vlVer = VL_VER; persist(); renderTemplates();
    if (made) alert(made + ' Vorlagen wurden angelegt (Nachsorge und Aufklärungen). Sie sind bei passenden Leistungen verknüpft (unter Leistungen änderbar). Die Aufklärungen sind Entwürfe: bitte ärztlich und rechtlich prüfen.');
  } catch (x) {} finally { vlBusy = false; }
}
function renderTemplates() {
  vlStandard();
  var tb = document.getElementById('tp-table'); if (!tb) return;
  tb.innerHTML = ''; document.getElementById('tp-empty').style.display = templates.length ? 'none' : 'block';
  templates.forEach(function (t) {
    var row = tb.insertRow(), c0 = row.insertCell(), c1 = row.insertCell(), c2 = row.insertCell(), c3 = row.insertCell();
    var b = mk('button', 'pn', t.name); b.type = 'button'; b.onclick = function () { openTpl(t.id); }; c0.appendChild(b);
    c1.textContent = katOf(t); c2.textContent = t.neu ? 'ja' : '-'; c2.className = t.neu ? 'tp-neu' : 'tp-no';
    var n = (settings.katalog || []).filter(function (k) { return (k.vorlagen || []).indexOf(t.id) >= 0; }).length;
    c3.textContent = n ? n + ' Leistung' + (n > 1 ? 'en' : '') : '-';
  });
}
