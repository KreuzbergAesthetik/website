/* ===== Briefumschlag C6 (162 x 114 mm, quer): Absender Praxis, Empfänger Patient. Wird bei Bedarf erzeugt und nicht gespeichert. ===== */
var UMSCHLAG_MM = 72 / 25.4;
function umschlagSafe(font, t) {
  var set = {}; try { font.getCharacterSet().forEach(function (c) { set[c] = 1; }); } catch (x) { return String(t == null ? '' : t).replace(/[^\x20-\x7E -ÿ]/g, '?'); }
  return Array.from(String(t == null ? '' : t)).map(function (ch) {
    var cp = ch.codePointAt(0); if (set[cp]) return ch;
    var fix = { '\u0131': 'i', '\u0130': 'I', '\u0142': 'l', '\u0141': 'L', '\u0111': 'd', '\u0110': 'D', '\u00f8': 'o', '\u00d8': 'O', '\u2013': '-', '\u2014': '-' }[ch]; if (fix) return fix;
    var base = ch.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); if (base && base !== ch && set[base.codePointAt(0)]) return base;
    return /\s/.test(ch) ? ' ' : '?';
  }).join('');
}
/* Zeilen für Absender und Empfänger; null, wenn die Anschrift des Patienten fehlt */
function umschlagLines(p) {
  var tt = PRAXIS.kopf.split(' - ');
  var absender = [tt[0], tt[1] || '', PRAXIS.strasse, PRAXIS.ort].filter(Boolean);
  var a = addrParse(p.adresse), l2 = ((a.str || '') + ' ' + (a.nr || '')).trim(), l3 = ((a.plz || '') + ' ' + (a.ort || '')).trim();
  if (!l2 && !l3) return null;
  var anrede = p.anrede === 'Frau' || p.anrede === 'Herr' ? p.anrede : '';
  var name = [p.titel, p.vorname, p.nachname].map(function (x) { return String(x || '').trim(); }).filter(Boolean).join(' ');
  return { absender: absender, empfaenger: [anrede, name, l2, l3].filter(Boolean), nameIdx: anrede ? 1 : 0 };
}
/* Praxis-Logo (schwarz, transparent) für den Absender; fehlt die Datei, entsteht der Umschlag ohne Logo */
var umschlagLogoBytes = null;
async function umschlagLogo() {
  if (umschlagLogoBytes !== null) return umschlagLogoBytes || null;
  try { var r = await fetch('logo-umschlag.png'); if (!r.ok) throw new Error('logo'); umschlagLogoBytes = new Uint8Array(await r.arrayBuffer()); } catch (x) { umschlagLogoBytes = false; }
  return umschlagLogoBytes || null;
}
async function umschlagPdf(p) {
  var ln = umschlagLines(p); if (!ln) return null;
  var L = await loadPdfLib(), doc = await L.PDFDocument.create();
  doc.setTitle('Briefumschlag C6'); doc.setCreator('Kreuzberg Ästhetik Praxis-App');
  var W = 162 * UMSCHLAG_MM, H = 114 * UMSCHLAG_MM, page = doc.addPage([W, H]);
  var f = await doc.embedFont(L.StandardFonts.Helvetica), fb = await doc.embedFont(L.StandardFonts.HelveticaBold), ink = L.rgb(0.07, 0.09, 0.15), gray = L.rgb(0.3, 0.34, 0.4);
  /* Absender: oben links, 10 mm vom Rand; links das Logo (16 mm), rechts daneben der Text */
  var x0 = 10 * UMSCHLAG_MM, y0 = H - 11.25 * UMSCHLAG_MM, LOGO = 16 * UMSCHLAG_MM, tx = x0, lb = await umschlagLogo();
  if (lb) { try { var img = await doc.embedPng(lb); page.drawImage(img, { x: x0, y: H - 8 * UMSCHLAG_MM - LOGO, width: LOGO, height: LOGO }); tx = x0 + LOGO + 4 * UMSCHLAG_MM; } catch (x) { tx = x0; y0 = H - 10 * UMSCHLAG_MM - 8; } }
  else y0 = H - 10 * UMSCHLAG_MM - 8;
  ln.absender.forEach(function (t, i) { page.drawText(umschlagSafe(i === 0 ? fb : f, t), { x: tx, y: y0 - i * 11, size: 8.5, font: i === 0 ? fb : f, color: i === 0 ? ink : gray }); });
  /* Empfänger: rechte Hälfte, ab 92 mm von links und 62 mm von oben. Zu lange Zeilen werden erst verkleinert (bis 10 pt), dann nach Wörtern umbrochen */
  var xr = 92 * UMSCHLAG_MM, maxW = W - xr - 10 * UMSCHLAG_MM, y = H - 62 * UMSCHLAG_MM, LH = 16;
  ln.empfaenger.forEach(function (t, i) {
    var ft = i === ln.nameIdx ? fb : f, txt = umschlagSafe(ft, t), size = 12.5, rows = [txt];
    while (size > 10 && ft.widthOfTextAtSize(txt, size) > maxW) size -= 0.5;
    if (ft.widthOfTextAtSize(txt, size) > maxW) {
      rows = []; var cur = '';
      txt.split(' ').forEach(function (w) { var nx = cur ? cur + ' ' + w : w; if (cur && ft.widthOfTextAtSize(nx, size) > maxW) { rows.push(cur); cur = w; } else cur = nx; });
      if (cur) rows.push(cur);
    }
    rows.forEach(function (r) {
      var sz = size; while (sz > 7 && ft.widthOfTextAtSize(r, sz) > maxW) sz -= 0.5;
      page.drawText(r, { x: xr, y: y, size: sz, font: ft, color: ink }); y -= LH;
    });
  });
  return await doc.save();
}
function umschlagFile(p) { return 'Umschlag-C6-' + [p.nachname, p.vorname].map(function (x) { return String(x || '').replace(/[^A-Za-z0-9ÄÖÜäöüß]+/g, '_'); }).filter(Boolean).join('-') + '.pdf'; }
async function umschlagSave(p) {
  p = p || curP; if (!p) return;
  var data; try { data = await umschlagPdf(p); } catch (x) { alert('Der Briefumschlag konnte nicht erstellt werden. Ist die Datei pdf-lib.min.js vorhanden?'); return; }
  if (!data) { alert('Bei diesem Patienten fehlt die Anschrift. Bitte zuerst in den Stammdaten eintragen.'); return; }
  var name = umschlagFile(p), dl = null; try { dl = window.claude && await window.claude.use('downloads'); } catch (x) {}
  if (dl) { try { await dl.save({ filename: name, data: data }); } catch (x) { if (!x || x.code !== 'declined') alert('Die PDF konnte nicht gespeichert werden.'); } return; }
  try {
    var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([data], { type: 'application/pdf' })); a.download = name;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 60000);
  } catch (x) { alert('Die PDF konnte nicht erstellt werden.'); }
}

/* Rechnung als PDF über das Teilen-Menü des Geräts senden und als versendet vermerken */
async function sendInvoice() {
  var inv = invCur(); if (!inv) return;
  var p = patients.filter(function (x) { return x.id === inv.pid; })[0] || curP, name = invFile(inv), dr = DRAFT[inv.kind], what = dr ? dr.name : 'Rechnung ' + inv.nr;
  var betreff = what + ' - Kreuzberg Ästhetik', text = fillPlatzhalter('{AnredeInformell},\n\nanbei ' + (dr ? 'der ' + dr.name : 'die Rechnung ' + inv.nr) + '.\n\nManuel - Kreuzberg Ästhetik', p);
  var file; try { file = new File([buildInvoicePdf(inv, getLogoJpeg())], name, { type: 'application/pdf' }); } catch (x) { alert('Die PDF konnte nicht erstellt werden.'); return; }
  var done = function (via) {
    inv.sentAt = Date.now();
    if (p) p.log = (p.log || []).concat([{ ts: Date.now(), type: 'mail', text: what + ' gesendet (' + via + ')' }]);
    persist(); try { renderPatients(); } catch (x) {} if (curP && document.getElementById('modal-akte').classList.contains('active')) renderVerlauf();
  };
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], title: betreff, text: text }); done('Teilen-Menü'); }
    catch (x) { if (!x || x.name !== 'AbortError') alert('Das Teilen ist fehlgeschlagen. Bitte „Als PDF speichern“ nutzen und die Datei von Hand anhängen.'); }
    return;
  }
  /* Computer: PDF laden und Mail vorbereiten, Anhang hängt der Nutzer selbst an */
  var a = document.createElement('a'); a.href = URL.createObjectURL(file); a.download = name; document.body.appendChild(a); a.click(); a.remove();
  if (p && p.email) window.location.href = 'mailto:' + encodeURIComponent(p.email) + '?subject=' + encodeURIComponent(betreff) + '&body=' + encodeURIComponent(text);
  if (await kaConfirm('Die PDF wurde heruntergeladen. Bitte im Mailprogramm anhängen und senden.\n\nRechnung jetzt als versendet markieren?')) done('Mailprogramm');
}
function invFile(inv) { var dr = DRAFT[inv.kind]; return dr ? dr.datei + '-' + String(inv.name || '').replace(/[^A-Za-z0-9ÄÖÜäöüß]+/g, '_') + '-' + inv.date + '.pdf' : 'Rechnung-' + inv.nr + '.pdf'; }
function printInvoice() {
  try { window.print(); } catch (x) { alert('Drucken ist in dieser Ansicht nicht verfügbar.'); }
}

/* E-Mail-Versand: über sendmail.php auf dem Webspace der Praxis (Praxisdaten), sonst über das Mailprogramm des Geräts */
function sendViaServer(mail) {
  var url = (settings.mailUrl || '').trim();
  if (url) {
    return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: settings.mailToken || '', an: mail.an, betreff: mail.betreff, text: mail.text }) })
      .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || !j.ok) throw new Error(j.error || 'Fehler ' + r.status); return { via: 'server' }; }); });
  }
  var href = 'mailto:' + encodeURIComponent(mail.an) + '?subject=' + encodeURIComponent(mail.betreff) + '&body=' + encodeURIComponent(mail.text);
  if (href.length > 1800) return Promise.reject(new Error('Der Text ist für das Mailprogramm zu lang. Bitte kürzen oder den Mailversand in den Praxisdaten einrichten.'));
  window.location.href = href;
  return Promise.resolve({ via: 'mailto' });
}
function openMail() {
  var vs = document.getElementById('m-vorl'); vs.innerHTML = ''; var o0 = mk('option', '', 'Keine Vorlage'); o0.value = ''; vs.appendChild(o0);
  (settings.nachrichten || []).forEach(function (n) { var o = mk('option', '', n.name); o.value = n.id; vs.appendChild(o); });
  var tbx = document.getElementById('m-tb'); tbx.innerHTML = ''; var tp = tbPicker(document.getElementById('m-text')); if (tp) tbx.appendChild(tp);
  document.getElementById('m-an').value = curP.email || '';
  document.getElementById('m-betreff').value = '';
  document.getElementById('m-text').value = '';
  mailAtt = []; mailAttRender();
  openModal('modal-mail');
}
function sendMail() {
  var an = document.getElementById('m-an').value.trim();
  var betreff = document.getElementById('m-betreff').value.trim();
  var text = document.getElementById('m-text').value.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(an)) { alert('Bitte eine gültige E-Mail-Adresse eingeben.'); return; }
  if (!betreff) { alert('Bitte einen Betreff eingeben.'); return; }
  var p = curP;
  var btn = document.querySelector('#modal-mail .btn-save'); btn.disabled = true;
  if (mailAtt.length) { sendMailWithFiles(an, betreff, text, p, btn); return; }
  sendViaServer({ von: PRAXIS.mail, an: an, betreff: betreff, text: text }).then(function (r) {
    btn.disabled = false;
    p.log = (p.log || []).concat([{ ts: Date.now(), type: 'mail', text: (r.via === 'mailto' ? 'E-Mail im Mailprogramm vorbereitet für ' : 'E-Mail gesendet an ') + an + '\nBetreff: ' + betreff + (text ? '\n' + text : '') }]);
    persist(); closeModal('modal-mail'); if (curP === p) renderVerlauf();
  }, function (err) {
    btn.disabled = false;
    alert('Die E-Mail wurde nicht gesendet und nichts in die Zeitleiste eingetragen. ' + (err && err.message ? err.message + ' ' : '') + 'Dein Text bleibt hier erhalten.');
  });
}
async function sendMailWithFiles(an, betreff, text, p, btn) {
  try {
    var files = [];
    for (var i = 0; i < mailAtt.length; i++) { var f = await fGet(mailAtt[i].id); if (f && f.blob) files.push(new File([f.blob], mailAtt[i].name, { type: f.blob.type || 'application/octet-stream' })); }
    if (!files.length) throw new Error('Die Anhänge konnten nicht gelesen werden.');
    var names = files.map(function (x) { return x.name; }).join(', '), via;
    if (navigator.canShare && navigator.canShare({ files: files })) {
      await navigator.share({ files: files, title: betreff, text: text }); via = 'Teilen-Menü';
    } else {
      files.forEach(function (x) { var a = document.createElement('a'); a.href = URL.createObjectURL(x); a.download = x.name; document.body.appendChild(a); a.click(); a.remove(); });
      await sendViaServer({ von: PRAXIS.mail, an: an, betreff: betreff, text: text }); via = 'Mailprogramm';
      alert('Dein Gerät kann keine Anhänge direkt übergeben. Die Dateien wurden heruntergeladen, bitte im Mailprogramm anhängen.');
    }
    p.log = (p.log || []).concat([{ ts: Date.now(), type: 'mail', text: 'E-Mail vorbereitet (' + via + ') für ' + an + '\nBetreff: ' + betreff + '\nAnhänge: ' + names + (text ? '\n' + text : '') }]);
    persist(); closeModal('modal-mail'); if (curP === p) renderVerlauf();
  } catch (x) {
    if (!(x && x.name === 'AbortError')) alert('Die E-Mail wurde nicht vorbereitet. ' + (x && x.message ? x.message + ' ' : '') + 'Dein Text bleibt hier erhalten.');
  }
  btn.disabled = false;
}
function logMailSent(p, betreff, text) {
  p.log = (p.log || []).concat([{ ts: Date.now(), type: 'mail', text: 'E-Mail gesendet an ' + (p.email || '') + '\nBetreff: ' + betreff + (text ? '\n' + text : '') }]);
  persist(); if (curP === p) renderVerlauf();
}
function logAdd(type, text) { curP.log = (curP.log || []).concat([{ ts: Date.now(), type: type, text: text }]); }

/* Unveränderliche Änderungshistorie der Patientenakte. Die normalen Daten bleiben editierbar; jede relevante Änderung erhält zusätzlich einen append-only Audit-Eintrag. */
var AUD_LABEL = { anrede:'Anrede', titel:'Titel', vorname:'Vorname', nachname:'Nachname', dob:'Geburtsdatum', phone:'Telefon', email:'E-Mail', adresse:'Anschrift', allergien:'Allergien', diagnosen:'Erkrankungen / Diagnosen', honorarVom:'Honorarvereinbarung vom', notizen:'Notiz' };
function auditNorm(v) {
  if (v == null) return '';
  if (typeof v === 'string') return v.trim();
  if (Array.isArray(v)) return v.map(auditNorm).join('\n');
  if (typeof v === 'object') { try { return JSON.stringify(v); } catch (x) { return String(v); } }
  return String(v);
}
function auditPush(p, area, changes) {
  if (!p) return;
  var c = (changes || []).map(function (x) { return { field: x.field || 'Wert', from: auditNorm(x.from), to: auditNorm(x.to) }; }).filter(function (x) { return x.from !== x.to; });
  if (!c.length) return;
  p.audit = (p.audit || []).concat([{ ts: Date.now(), area: area || 'Patientenakte', changes: c }]);
}
function auditOne(p, area, field, from, to) { auditPush(p, area, [{ field: field, from: from, to: to }]); }
function auditDiff(p, area, before, after, fields) {
  var c = [];
  (fields || []).forEach(function (f) { var k = Array.isArray(f) ? f[0] : f, lab = Array.isArray(f) ? f[1] : (AUD_LABEL[k] || k); c.push({ field: lab, from: before ? before[k] : '', to: after ? after[k] : '' }); });
  auditPush(p, area, c);
}
/* Dateivorgänge protokollieren nur Metadaten, keine Dateiinhalte. */
function auditFileState(r) {
  if (!r) return '[nicht vorhanden]';
  return ['ID: ' + r.id, 'Name: ' + (r.name || ''), 'Datum: ' + (r.ts ? fmtDT(r.ts) : ''),
    'Kategorie: ' + (r.kat || ''), 'Zuordnung: ' + (r.zu || 'frei'),
    'Unterschrift: ' + (r.sig && r.sig.ts ? fmtDT(r.sig.ts) : 'keine')].join('\n');
}
function auditFileChange(p, r, before, area) {
  auditOne(p, area || ((p.bilder || []).indexOf(r) >= 0 ? 'Bilder' : 'Dokumente'), 'Datei: ' + (r.name || r.id), before, auditFileState(r));
}
function auditFilesAdded(p, list, area) {
  auditPush(p, area, (list || []).map(function (r) { return { field: 'Hinzugefügt: ' + (r.name || r.id), from: '', to: auditFileState(r) }; }));
}

/* Ausblenden verändert nur die Ansicht; Einträge und Dateien bleiben erhalten. */
function recordVisible(r) { return !r.hiddenFromView || tlAuditVisible; }
function setRecordHidden(p, r, hide, area, label) {
  var wasHidden = !!r.hiddenFromView;
  if (wasHidden === hide) return;
  if (hide) r.hiddenFromView = true; else delete r.hiddenFromView;
  if (area !== 'Notiz') auditOne(p, area, 'Sichtbarkeit: ' + label, wasHidden ? 'ausgeblendet' : 'sichtbar', hide ? 'ausgeblendet' : 'sichtbar');
  persist();
  if (curP === p) renderVerlauf();
}
function fileHide(p, r) {
  setRecordHidden(p, r, !r.hiddenFromView, (p.bilder || []).indexOf(r) >= 0 ? 'Bilder' : 'Dokumente', r.name || r.id);
}
function restoreVisibilityButton(fn) {
  var b = mk('button', 'btn btn-secondary btn-sm', 'Wieder einblenden');
  b.type = 'button'; b.title = 'Dauerhaft in der normalen Ansicht einblenden';
  b.style.cssText = 'margin-left:8px;padding:3px 7px;font-size:11px;';
  b.onclick = function (ev) { ev.stopPropagation(); fn(); };
  return b;
}

function fileHiddenBadge(r) {
  var b = mk('span', '', 'Ausgeblendet'); b.style.cssText = 'font-size:11px;color:#64748b;margin-left:6px;'; return b;
}

function auditDocState(d) {
  d = d || {}; var v = d.verw || {}, verw = [];
  DK_VERW.forEach(function (x) { if (v[x[0]]) verw.push(x[1]); }); if (String(v.text || '').trim()) verw.push(String(v.text).trim());
  return { anamnese:d.anamnese || '', befund:d.befund || '', behandlung:d.behandlung || '', aufklaerung:d.aufklaerung || '', leist:d.leist || '', produkte:d.produkte || '', ausblick:d.ausblick || '', rechnung:d.rechnung || '', verw:verw.join('\n') };
}
function auditDocPlain(d, fallback) {
  var a = auditDocState(d), out = [];
  [['anamnese','Anamnese'],['befund','Befund'],['behandlung','Behandlung'],['aufklaerung','Aufklärung'],['leist','Leistungen'],['produkte','Produkte'],['ausblick','Ausblick'],['rechnung','Rechnungstext'],['verw','Verwaltung']].forEach(function (x) { if (String(a[x[0]] || '').trim()) out.push(x[1] + ': ' + a[x[0]]); });
  return out.join('\n') || String(fallback || '').trim();
}

/* Kopfbereich: Titel und Kacheln (Kontakt, Notiz, Medikation, Allergien, Diagnosen, Anschrift) */
var tileEdit = '', akTab = 'akte';
function tilePen(fn) { var b = mk('button', 'a-pen'); b.type = 'button'; b.innerHTML = ICON_PEN; b.title = 'Bearbeiten'; b.setAttribute('aria-label', 'Bearbeiten'); b.onclick = fn; return b; }
/* Medikament für die Anzeige kürzen: nur Name und Dosierung, ohne Packungsgröße und Anwendung (der volle Text bleibt gespeichert) */
function medSplit(m) {
  var t = String(m || '').replace(/\s+/g, ' ').trim(), w = t.split(' '), i = 0, UNIT = /^(mg|µg|mcg|g|ml|ie|i\.e\.|%)(\/(g|ml|l|h|tag|hub|dosis))?[,.;]?$/i;
  while (i < w.length && !/^\d/.test(w[i])) i++;
  if (i === 0 || i >= w.length) return { n: t.replace(/[,;]\s*$/, ''), d: '' };
  var name = w.slice(0, i).join(' ').replace(/[,;]\s*$/, ''), dose = '', x = w[i].replace(/[,;]$/, '');
  var mm = /^(\d+(?:[.,]\d+)?(?:\/\d+(?:[.,]\d+)?)?)(mg|µg|mcg|g|ml|ie|%)(\/(?:g|ml|l|h|tag|hub|dosis))?$/i.exec(x);
  if (mm) dose = x;
  else if (/^\d+(?:[.,]\d+)?(?:\/\d+(?:[.,]\d+)?)?$/.test(x)) {
    var um = /^(mg|µg|mcg|g|ml|ie|i\.e\.|%)(\/(?:g|ml|l|h|tag|hub|dosis))?(?:\/\S*)?[,.;]?$/i.exec(w[i + 1] || '');
    if (um) dose = x + ' ' + um[1] + (um[2] || '');
    else if (!/^(st|stk|stück|x|n\d|tabl|tbl|kaps|amp)/i.test(w[i + 1] || '')) dose = x;
  }
  return { n: name, d: dose };
}
function tileBox(key, title, cls, fill) {
  var t = mk('div', 'a-tile' + (cls ? ' ' + cls : '')); t.appendChild(mk('h4', '', title));
  if (tileEdit === key) { t.className += ' ed'; fill(t, true); } else { t.appendChild(tilePen(function () { stammEdit = false; tileEdit = key; renderHead(); var f = document.getElementById('a-tile-in') || document.getElementById('a-med-in'); if (f) f.focus(); })); fill(t, false); if (t.querySelector('.a-none') && !t.querySelector('li')) t.style.display = 'none'; }
  return t;
}
function txtTile(key, title, cls, ph) {
  return tileBox(key, title, cls, function (t, ed) {
    if (!ed) { var v = (curP[key] || '').trim(); if (key === 'notizen' && curP.titel) v = ('Titel: ' + curP.titel + (v ? '\n' + v : '')); t.appendChild(mk('div', v ? 'a-txt' : 'a-txt a-none', v || ph)); return; }
    if (key === 'adresse') t.appendChild(addrBlock('a-adr-', curP.adresse)); else { var ta = mk('textarea', 'form-control'); ta.id = 'a-tile-in'; ta.rows = 3; ta.value = curP[key] || ''; t.appendChild(ta); }
    var fb = mk('div', 'foot-bar'); fb.style.cssText = 'margin-top:10px; padding-top:10px;';
    var c = mk('button', 'btn btn-cancel', 'Abbrechen'); c.type = 'button'; c.onclick = function () { tileEdit = ''; renderHead(); };
    var sv = mk('button', 'btn btn-save', 'Speichern'); sv.type = 'button'; sv.onclick = function () { tileSave(key); };
    fb.appendChild(c); fb.appendChild(sv); t.appendChild(fb);
  });
}
function tileSave(key) {
  var old = curP[key] || '', v = key === 'adresse' ? addrRead('a-adr-') : document.getElementById('a-tile-in').value.trim(), changed = v !== old;
  curP[key] = v;
  // Persönliche Notizen bleiben frei editierbar, ohne automatische Historien- oder Verlaufseinträge.
  if (changed && key !== 'notizen') auditOne(curP, 'Patientenakte', AUD_LABEL[key] || key, old, v);
  tileEdit = ''; persist(); renderHead(); renderVerlauf(); renderPatients();
}
function renderHead() {
  var p = curP, box = document.getElementById('a-head'), ttl = document.getElementById('a-title'); box.innerHTML = ''; ttl.innerHTML = '';
  var pidn = mk('span', 'a-pid', '#' + patNr(p)); pidn.title = 'Nummer ändern'; pidn.style.cursor = 'pointer'; pidn.onclick = function () { changePatNr(p); };
  var idc = mk('div', 'a-idc'); idc.appendChild(pidn);
  var sx = { Frau: ['♀', 'weiblich'], Herr: ['♂', 'männlich'], Divers: ['⚧', 'divers'] }[p.anrede]; if (sx) { var sp = mk('span', 'a-sex', sx[0]); sp.title = sx[1]; idc.appendChild(sp); }
  var nmb = mk('div', 'a-nm'), nl = mk('span', 'a-nl', (noTitel(p.nachname) || p.nachname || '').toUpperCase() + ','), nf = mk('span', 'a-nf', noTitel(p.vorname) || p.vorname || '');
  if (p.titel) nf.appendChild(mk('small', 'a-tit', p.titel));
  nmb.appendChild(nl); nmb.appendChild(document.createTextNode(' ')); nmb.appendChild(nf);
  ttl.appendChild(idc); ttl.appendChild(nmb);
  var ageT = p.dob ? ageOf(p.dob) : ''; if (ageT !== '' && ageT !== null && !isNaN(ageT)) { var ag = mk('span', 'a-age', String(ageT)); ag.title = 'Alter: ' + ageT + ' Jahre'; ttl.appendChild(ag); }
  renderFlags();
  document.getElementById('a-edit').style.display = stammEdit ? 'none' : 'inline-flex';
  document.querySelector('.a-fab').style.visibility = stammEdit ? 'hidden' : '';
  if (stammEdit) {
    var grid = document.createElement('div'); grid.className = 'grid-2';
    HEAD_FIELDS.forEach(function (k) {
      var g = mk('div', 'form-group'); g.appendChild(mk('label', '', k[1]));
      var inp;
      if (k[0] === 'adresse') { g.appendChild(addrBlock('se-adr-', p.adresse)); g.style.gridColumn = '1 / -1'; grid.appendChild(g); return; }
      if (k[0] === 'anrede') {
        inp = mk('select', 'form-control');
        ['', 'Frau', 'Herr', 'Divers'].forEach(function (o) { var op = mk('option', '', o || 'Keine Angabe'); op.value = o; inp.appendChild(op); });
      } else if (k[0] === 'diagnosen') { inp = mk('textarea', 'form-control'); inp.rows = 2; g.style.gridColumn = '1 / -1'; } else inp = mk('input', 'form-control');
      inp.id = 'se-' + k[0]; inp.value = p[k[0]] || '';
      if (k[0] === 'dob' || k[0] === 'honorarVom') { inp.placeholder = 'TT.MM.JJJJ'; inp.inputMode = 'numeric'; inp.maxLength = 10; inp.oninput = function () { maskDob(inp); }; }
      g.appendChild(inp); grid.appendChild(g);
    });
    box.appendChild(grid);
    var fb = mk('div', 'foot-bar');
    var cb = mk('button', 'btn btn-cancel', 'Abbrechen'); cb.type = 'button'; cb.onclick = function () { cancelStamm(); };
    var sbn = mk('button', 'btn btn-save', 'Speichern'); sbn.type = 'button'; sbn.onclick = function () { toggleStamm(); };
    var db = mk('button', 'btn btn-del btn-ico'); db.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>'; db.title = 'Patient löschen'; db.setAttribute('aria-label', 'Patient löschen'); db.type = 'button'; db.onclick = function () { deletePatient(); };
    var mgb = mk('button', 'btn btn-secondary btn-ico'); mgb.type = 'button'; mgb.title = 'Mit einer anderen Akte zusammenlegen'; mgb.setAttribute('aria-label', mgb.title); mgb.innerHTML = tvSvg('merge'); mgb.firstChild.style.cssText = 'width:18px;height:18px;'; mgb.onclick = function () { mgOpen(curP); };
    fb.appendChild(db); fb.appendChild(mgb); fb.appendChild(cb); fb.appendChild(sbn); box.appendChild(fb);
    return;
  }
  var tiles = mk('div', 'a-tiles'), age = ageOf(p.dob);
  var kt = mk('div', 'a-tile a-kt'); kt.appendChild(mk('h4', '', 'Kontakt')); kt.appendChild(tilePen(function () { toggleStamm(); }));
  kt.appendChild(mk('div', p.dob ? '' : 'a-none', p.dob ? p.dob + (age !== '' ? ' (' + age + ' Jahre)' : '') : 'Geburtsdatum fehlt'));
  if (p.phone) { var l1 = mk('div', 'tl-ln'); l1.innerHTML = ICON_PHONE; var a1 = mk('a', '', p.phone); a1.href = 'tel:' + p.phone.replace(/\s/g, ''); l1.appendChild(a1); kt.appendChild(l1); }
  if (p.email) { var l2 = mk('div', 'tl-ln'); l2.innerHTML = ICON_MAIL; var a2 = mk('a', '', p.email); a2.href = 'mailto:' + p.email; l2.appendChild(a2); kt.appendChild(l2); }
  if (p.honorarVom) kt.appendChild(mk('div', '', 'Honorarvereinbarung vom ' + p.honorarVom));
  tiles.appendChild(kt);
  tiles.appendChild(tileBox('wiedervorstellung', 'Wiedervorstellung', '', function (t, ed) {
    if (!ed) {
      var v = p.wiedervorstellung || '';
      var tx = mk('div', 'a-txt', v ? 'Empfohlen am ' + fmtD(v) : 'Keine Wiedervorstellung geplant');
      if (!v) tx.style.color = '#94a3b8'; t.appendChild(tx); return;
    }
    var inp = mk('input', 'form-control'); inp.type = 'date'; inp.id = 'a-wieder-in'; inp.value = p.wiedervorstellung || ''; t.appendChild(inp);
    var fb = mk('div', 'foot-bar'); fb.style.cssText = 'margin-top:10px; padding-top:10px;';
    var rm = mk('button', 'btn btn-cancel', 'Entfernen'); rm.type = 'button'; rm.style.marginRight = 'auto'; rm.onclick = function () { tileEdit = ''; setWiedervorstellung(p, ''); };
    var cb = mk('button', 'btn btn-cancel', 'Abbrechen'); cb.type = 'button'; cb.onclick = function () { tileEdit = ''; renderHead(); };
    var sv = mk('button', 'btn btn-save', 'Speichern'); sv.type = 'button'; sv.onclick = function () { var v = inp.value; if (!v) { alert('Bitte ein Datum wählen oder „Entfernen“ verwenden.'); return; } tileEdit = ''; setWiedervorstellung(p, v); };
    fb.appendChild(rm); fb.appendChild(cb); fb.appendChild(sv); t.appendChild(fb);
  }));
  tiles.appendChild(txtTile('notizen', 'Notiz', '', 'Keine Notiz'));
  tiles.appendChild(tileBox('med', 'Medikation', 'a-wide', function (t, ed) {
    var list = p.medikation || [];
    if (!list.length && !ed) t.appendChild(mk('div', 'a-txt a-none', 'Keine Medikation'));
    var ul = mk('ul'); list.forEach(function (m, i) {
      var li = mk('li'), md = medSplit(m), tx = mk('span', 'med-t'); tx.title = ed ? 'Tippen zum Bearbeiten' : m;
      tx.appendChild(mk('b', 'med-n', md.n)); if (md.d) tx.appendChild(mk('span', 'med-d', ' ' + md.d));
      if (ed) { tx.style.cursor = 'pointer'; tx.onclick = async function () { var v = await kaPrompt('Medikament bearbeiten:', m); if (v === null) return; v = v.trim(); if (v && v !== m) { p.medikation[i] = v; auditOne(p, 'Medikation', 'Medikament', m, v); persist(); renderHead(); renderVerlauf(); } }; }
      li.appendChild(tx);
      if (ed) { var b = mk('button', '', '×'); b.type = 'button'; b.onclick = function () { var old = p.medikation[i]; p.medikation.splice(i, 1); auditOne(p, 'Medikation', 'Medikament', old, '[entfernt]'); persist(); renderHead(); renderVerlauf(); }; li.appendChild(b); }
      ul.appendChild(li);
    }); t.appendChild(ul);
    if (ed) {
      var row = mk('div'); row.style.cssText = 'display:flex; gap:6px; margin-top:6px;';
      var inp = mk('input', 'form-control'); inp.id = 'a-med-in'; inp.placeholder = 'Medikament hinzufügen...'; inp.onkeydown = function (e) { if (e.key === 'Enter') addMed(); };
      var ad = mk('button', 'btn', '+'); ad.type = 'button'; ad.onclick = addMed; row.appendChild(inp); row.appendChild(ad); t.appendChild(row);
      var fb = mk('div', 'foot-bar'); fb.style.cssText = 'margin-top:10px; padding-top:10px;';
      var ok = mk('button', 'btn btn-save', 'Fertig'); ok.type = 'button'; ok.onclick = function () { tileEdit = ''; renderHead(); }; fb.appendChild(ok); t.appendChild(fb);
    }
  }));
  var tAl = txtTile('allergien', 'Allergien', (hasWarn(p) ? 'a-warn ' : '') + 'a-half', 'Keine Angabe'), tAd = txtTile('adresse', 'Anschrift', 'a-half', 'Keine Anschrift');
  tiles.appendChild(tAl); tiles.appendChild(tAd);
  if ([tAl, tAd].filter(function (x) { return x.style.display !== 'none'; }).length === 1) { tAl.classList.remove('a-half'); tAd.classList.remove('a-half'); }
  tiles.appendChild(txtTile('diagnosen', 'Erkrankungen / Diagnosen', '', 'Keine Angabe'));
  tiles.setAttribute('data-n', [].filter.call(tiles.children, function (c) { return c.style.display !== 'none'; }).length);
  box.appendChild(tiles);
}
function hdH() { var h = document.querySelector('header'); if (h) document.documentElement.style.setProperty('--hdh', h.offsetHeight + 'px'); }
window.addEventListener('resize', hdH);
try { new ResizeObserver(hdH).observe(document.querySelector('header')); } catch (x) {}
hdH();
/* Rechte Akte-Karte: untere Ecken erst am Ende des Inhalts abrunden (Querformat, Karte scrollt selbst) */
var akEdgeQ = false;
function akEdgeUpdate() {
  akEdgeQ = false;
  var p = document.querySelector('#modal-akte.active .a-pane'); if (!p) return;
  p.classList.toggle('ak-more', p.scrollHeight - p.scrollTop - p.clientHeight > 2);
}
function akEdgeSoon() { if (akEdgeQ) return; akEdgeQ = true; requestAnimationFrame(akEdgeUpdate); }
document.addEventListener('scroll', function (e) { if (e.target && e.target.classList && e.target.classList.contains('a-pane')) akEdgeSoon(); }, true);
window.addEventListener('resize', akEdgeSoon);
try { new MutationObserver(akEdgeSoon).observe(document.getElementById('modal-akte'), { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] }); } catch (x) {}
function setAkTab(t) {
  akTab = t; saveLast();
  ['akte', 'anl', 'fin'].forEach(function (k) { var el = document.getElementById('at-' + k), b = document.getElementById('atb-' + k); if (el) el.style.display = k === t ? 'block' : 'none'; if (b) b.className = k === t ? 'on' : ''; });
  akTabs();
}
function akTabs() {
  var b = document.getElementById('atb-anl'); if (!b || !curP) return;
  var n = (curP.bilder || []).length + (curP.dokumente || []).length;
  b.textContent = 'Anlagen' + (n ? ' (' + n + ')' : '');
}
function toggleStamm() {
  if (!stammEdit) { stammEdit = true; tileEdit = ''; renderHead(); return; }
  var g = function (k) { return document.getElementById('se-' + k).value.trim(); };
  if (!g('vorname') || !g('nachname')) { alert('Vorname und Nachname dürfen nicht leer sein.'); return; }
  if (!validDob(g('dob'))) { alert(DOB_MSG); return; }
  if (g('honorarVom') && !/^\d{2}\.\d{2}\.\d{4}$/.test(g('honorarVom'))) { alert('Bitte das Datum der Honorarvereinbarung als TT.MM.JJJJ eingeben.'); return; }
  var old = nameKey(curP), before = {};
  HEAD_FIELDS.forEach(function (k) { before[k[0]] = curP[k[0]] || ''; });
  if (patients.some(function (x) { return x !== curP && nameKey(x).toLowerCase() === (g('vorname') + ' ' + g('nachname')).toLowerCase(); })) { alert('Einen Patienten mit diesem Namen gibt es schon.'); return; }
  HEAD_FIELDS.forEach(function (k) { if (k[0] !== 'adresse') curP[k[0]] = g(k[0]); });
  curP.adresse = addrRead('se-adr-');
  var after = {}; HEAD_FIELDS.forEach(function (k) { after[k[0]] = curP[k[0]] || ''; });
  auditDiff(curP, 'Stammdaten', before, after, HEAD_FIELDS);
  var nn = nameKey(curP);
  if (nn !== old) events.forEach(function (e) { if (String(e.patientId) === String(curP.id) || e.patient === old) { e.patientId = curP.id; e.patient = nn; } });
  persist(); renderPatients(); renderCal(); viewAkte(curP);
}
/* Aufbewahrungspflicht: Akten mit medizinischer Dokumentation 10 Jahre nach der letzten Behandlung (§ 630f Abs. 3 BGB) */
function patAufbewahrung(p) {
  var was = [], last = 0, now = Date.now(), tsOfD = function (x) { return x.ts || tsOf(x) || 0; };
  if ((p.doku || []).length) { was.push('Dokumentation'); p.doku.forEach(function (d) { last = Math.max(last, tsOfD(d)); }); }
  if ((p.dokumente || []).length) { was.push('Dokumente'); p.dokumente.forEach(function (d) { last = Math.max(last, tsOfD(d)); }); }
  if ((p.bilder || []).length) { was.push('Bilder'); p.bilder.forEach(function (d) { last = Math.max(last, tsOfD(d)); }); }
  if ((p.medikation || []).length || String(p.allergien || '').trim() || String(p.diagnosen || '').trim()) { was.push('Anamnese'); last = Math.max(last, p.erstellt || 0); }
  var ev = events.filter(function (e) { if (!eventBelongs(e, p) || e.phase === 'Abgesagt') return false; var t = new Date(e.date + 'T' + (e.time || '00:00') + ':00').getTime(); return t && t <= now; });
  if (ev.length) { was.push('Behandlungstermine'); ev.forEach(function (e) { last = Math.max(last, new Date(e.date + 'T12:00:00').getTime()); }); }
  if (!was.length) return { was: was, bis: 0 };
  if (!last) last = now;
  var d = new Date(last); d.setFullYear(d.getFullYear() + 10);
  return { was: was, bis: d.getTime() };
}
async function deletePatient() {
  var p = curP;
  if (invoices.some(function (i) { return i.pid === p.id; })) { alert('Zu diesem Patienten gibt es Rechnungen. Diese müssen aufbewahrt werden, deshalb kann er nicht gelöscht werden.'); return; }
  if (lager.verbrauch.some(function (v) { return v.pid === p.id; })) { alert('Zu diesem Patienten gibt es Produktbuchungen aus dem Lager. Deshalb kann er nicht gelöscht werden.'); return; }
  var aufb = patAufbewahrung(p);
  if (aufb.bis && aufb.bis > Date.now()) { alert('Diese Akte enthält medizinische Dokumentation (' + aufb.was.join(', ') + '). Sie muss bis ' + new Date(aufb.bis).toLocaleDateString('de-DE') + ' aufbewahrt werden (10 Jahre nach der letzten Behandlung, § 630f BGB) und kann bis dahin nicht gelöscht werden.'); return; }
  var name = nameKey(p), n = events.filter(function (e) { return eventBelongs(e, p); }).length;
  if (!await kaConfirm('Patient "' + name + '" mit Akte und ' + n + ' Termin(en) endgültig löschen? Das lässt sich nur mit einer Sicherung rückgängig machen.')) return;
  (p.bilder || []).concat(p.dokumente || []).forEach(function (x) { fDel(x.id); });
  patients = patients.filter(function (x) { return x !== p; });
  events = events.filter(function (e) { return !eventBelongs(e, p); });
  stammEdit = false; curP = null;
  persist(); renderPatients(); renderCal(); closeModal('modal-akte');
}
function cancelStamm() { stammEdit = false; renderHead(); }
function viewAkte(p) {
  var was = document.getElementById('modal-akte').classList.contains('active');
  curP = p; stammEdit = false; editingDokuId = null; medInput = false; medMode = false; notizEdit = false; dokPick = false;
  document.getElementById('a-menu').style.display = 'none';
  tileEdit = ''; recentAdd(p.id); hdH(); renderHead(); renderPick(); renderVerlauf(); setAkTab('akte');
  openModal('modal-akte');
  if (!was) window.scrollTo(0, 0);
  saveLast();
}

/* Rezept: Medikamente wählen, A6 quer (148 x 105 mm) als PDF für den Vordruck */
/* Datum und Uhrzeit eines Eintrags ändern */
var dtCb = null;
function askDateTime(ts, cb) {
  var d = new Date(ts); dtCb = cb;
  document.getElementById('dt-in').value = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) + 'T' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  openModal('modal-dt');
}
function dtSave() {
  var t = new Date(document.getElementById('dt-in').value).getTime(); if (isNaN(t)) { alert('Bitte Datum und Uhrzeit angeben.'); return; }
  var cb = dtCb; dtCb = null; closeModal('modal-dt'); if (cb) cb(t);
}
/* Produktbuchung vollständig bearbeiten: Zeitpunkt, Charge, Menge, Termin; der Lagerbestand wird mit korrigiert */
var vbeCur = null;
function openVbEdit(vb) {
  vbeCur = vb; var d = new Date(vb.ts);
  document.getElementById('vbe-info').textContent = vb.name + (vb.pid ? '' : ' · Ausbuchung' + (vb.grund ? ' (' + vb.grund + ')' : ''));
  document.getElementById('vbe-datum').value = iso(d); document.getElementById('vbe-zeit').value = pad(d.getHours()) + ':' + pad(d.getMinutes());
  var sel = document.getElementById('vbe-ch'); sel.innerHTML = '';
  lager.chargen.filter(function (c) { return c.pid === vb.prodId; }).forEach(function (c) { var o = mk('option', '', 'Charge ' + (c.nr || '-') + (c.verfall ? ' · bis ' + fmtD(c.verfall) : '') + ' · Rest ' + qty(c.id === vb.chId ? (+c.rest || 0) + vb.menge : c.rest)); o.value = c.id; sel.appendChild(o); });
  sel.value = vb.chId; document.getElementById('vbe-menge').value = qty(vb.menge);
  var tg = document.getElementById('vbe-tgrp'), ts = document.getElementById('vbe-termin'); ts.innerHTML = '';
  tg.style.display = vb.pid ? '' : 'none';
  if (vb.pid) {
    var pt = patients.filter(function (x) { return x.id === vb.pid; })[0], o0 = mk('option', '', 'Kein Termin'); o0.value = ''; ts.appendChild(o0);
    events.filter(function (e) { return pt && eventBelongs(e, pt); }).sort(function (a, b) { return (b.date + b.time).localeCompare(a.date + a.time); }).forEach(function (e) { var o = mk('option', '', fmtTermin(e) + (e.behandlung ? ' · ' + e.behandlung : '')); o.value = e.id; ts.appendChild(o); });
    ts.value = vb.eid ? String(vb.eid) : '';
  }
  openModal('modal-vbe');
}
function saveVbEdit() {
  var vb = vbeCur; if (!vb) return;
  var m = num(document.getElementById('vbe-menge').value), nc = lager.chargen.filter(function (c) { return c.id === document.getElementById('vbe-ch').value; })[0], oc = lager.chargen.filter(function (c) { return c.id === vb.chId; })[0];
  var dd = document.getElementById('vbe-datum').value, tt = document.getElementById('vbe-zeit').value || '12:00';
  if (!dd) { alert('Bitte ein Datum angeben.'); return; } if (m === null || m <= 0) { alert('Bitte eine Menge größer als 0 eingeben.'); return; } if (!nc) { alert('Bitte eine Charge wählen.'); return; }
  var avail = (+nc.rest || 0) + (nc === oc ? vb.menge : 0); if (m > avail + 1e-9) { alert('Von dieser Charge sind nur noch ' + qty(avail) + ' ' + (vb.einheit || '') + ' da.'); return; }
  var rd = function (x) { return Math.round(x * 1000) / 1000; };
  if (oc) oc.rest = rd((+oc.rest || 0) + vb.menge); nc.rest = rd((+nc.rest || 0) - m);
  vb.chId = nc.id; vb.nr = nc.nr || ''; vb.verfall = nc.verfall || ''; vb.ek = nc.ek; vb.menge = m; vb.ts = new Date(dd + 'T' + tt + ':00').getTime();
  if (vb.pid) { var ev = document.getElementById('vbe-termin').value; vb.eid = ev ? +ev : null; }
  vbeCur = null; persist(); closeModal('modal-vbe'); if (curP && document.getElementById('modal-akte').classList.contains('active')) renderVerlauf(); renderLager();
}
