/* ===== Eingangskorb: Fotos aus dem Teilen-Menü des Handys (Service Worker legt sie vorübergehend ab) ===== */
var EG = { urls: [], keys: [], open: false };
/* Nach dem Entsperren werden die Fotos im Zwischenspeicher sofort mit dem App-Schlüssel verschlüsselt (an Ort und Stelle,
   nicht im Dateispeicher, damit der Geräte-Abgleich sie nicht überträgt). Unverschlüsselt liegen sie nur zwischen Teilen und Entsperren. */
async function egSeal() {
  if (!window.caches || !KA.key) return;
  try {
    var c = await caches.open('ka-eingang'), ks = await c.keys();
    for (var i = 0; i < ks.length; i++) {
      var r = await c.match(ks[i]); if (!r || r.headers.get('X-Enc') === '1') continue;
      var img = new Uint8Array(await r.arrayBuffer()), meta = new TextEncoder().encode(JSON.stringify({ name: decodeURIComponent(r.headers.get('X-Name') || 'Foto.jpg'), type: r.headers.get('Content-Type') || 'image/jpeg' }));
      var raw = new Uint8Array(4 + meta.length + img.length); new DataView(raw.buffer).setUint32(0, meta.length); raw.set(meta, 4); raw.set(img, 4 + meta.length);
      var enc = await kaEncBytes(raw); raw.fill(0); img.fill(0);
      await c.put(ks[i], new Response(enc, { headers: { 'Content-Type': 'application/octet-stream', 'X-Enc': '1' } }));
    }
  } catch (e) {}
}
async function egList() {
  try {
    if (!window.caches) return [];
    var c = await caches.open('ka-eingang'), ks = await c.keys(), out = [];
    for (var i = 0; i < ks.length; i++) {
      var r = await c.match(ks[i]); if (!r) continue;
      if (r.headers.get('X-Enc') === '1') {
        try {
          var raw = await kaDecBytes(new Uint8Array(await r.arrayBuffer())), n = new DataView(raw.buffer, raw.byteOffset).getUint32(0), m = JSON.parse(new TextDecoder().decode(raw.subarray(4, 4 + n)));
          out.push({ key: ks[i].url, name: m.name || 'Foto.jpg', blob: new Blob([raw.subarray(4 + n)], { type: m.type || 'image/jpeg' }) });
        } catch (x) {}
      } else out.push({ key: ks[i].url, name: decodeURIComponent(r.headers.get('X-Name') || 'Foto.jpg'), blob: await r.blob() });
    }
    return out;
  } catch (e) { return []; }
}
async function egClear(keys) { try { var c = await caches.open('ka-eingang'); for (var i = 0; i < keys.length; i++) await c.delete(keys[i]); } catch (e) {} }
async function egCheck() {
  if (EG.open) return;
  await egSeal();
  var items = await egList(); if (!items.length) return;
  EG.open = true; ensurePatients();
  var ov = document.createElement('div'), box = document.createElement('div'), sel = null;
  ov.style.cssText = 'position:fixed;inset:0;z-index:9990;background:rgba(15,23,42,.45);display:flex;align-items:center;justify-content:center;padding:12px';
  box.style.cssText = 'background:#fff;border-radius:16px;padding:16px;width:100%;max-width:460px;max-height:92vh;overflow:auto;box-shadow:0 10px 30px rgba(15,23,42,.35)';
  var urls = items.map(function (it) { return URL.createObjectURL(it.blob); });
  var h = document.createElement('div'); h.style.cssText = 'font-weight:700;font-size:16px;margin-bottom:8px'; h.textContent = items.length + (items.length === 1 ? ' Foto' : ' Fotos') + ' zuordnen';
  var th = document.createElement('div'); th.style.cssText = 'display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px';
  urls.forEach(function (u) { var im = document.createElement('img'); im.src = u; im.style.cssText = 'width:64px;height:64px;object-fit:cover;border-radius:8px;border:1px solid #c3cedf'; th.appendChild(im); });
  var q = document.createElement('input'); q.type = 'text'; q.className = 'form-control'; q.placeholder = 'Patient suchen …'; q.autocomplete = 'off'; q.style.cssText = 'width:100%;margin-bottom:8px';
  var lst = document.createElement('div'); lst.style.cssText = 'max-height:30vh;overflow:auto;margin-bottom:12px';
  var foot = document.createElement('div'); foot.style.cssText = 'display:flex;gap:8px;justify-content:space-between;align-items:center';
  var del = document.createElement('button'); del.type = 'button'; del.className = 'btn btn-sm'; del.textContent = '🗑'; del.title = 'Verwerfen'; del.style.cssText = 'background:none;border:0;box-shadow:none;color:#dc2626;font-size:18px';
  var rt = document.createElement('span'); rt.style.cssText = 'display:flex;gap:8px';
  var later = document.createElement('button'); later.type = 'button'; later.className = 'btn btn-cancel'; later.textContent = 'Später';
  var ok = document.createElement('button'); ok.type = 'button'; ok.className = 'btn btn-save'; ok.textContent = 'Zur Akte'; ok.disabled = true;
  var close = function () { urls.forEach(function (u) { URL.revokeObjectURL(u); }); if (ov.parentNode) ov.parentNode.removeChild(ov); EG.open = false; };
  function fill() {
    var t = q.value.trim().toLowerCase(); lst.innerHTML = '';
    var l = patients.filter(function (p) { return !t || (dnP(p) + ' ' + (p.nr || '')).toLowerCase().indexOf(t) >= 0; });
    l.sort(function (a, b) { return (b.erstellt || 0) - (a.erstellt || 0); });
    l.slice(0, 40).forEach(function (p) {
      var r = document.createElement('div'); r.innerHTML = nmHtml(dnP(p));
      r.style.cssText = 'padding:10px;border-radius:10px;cursor:pointer;border:1px solid ' + (sel === p ? '#16a34a' : 'transparent') + ';background:' + (sel === p ? '#f0fdf4' : '#fff');
      r.onclick = function () { sel = p; ok.disabled = false; fill(); };
      lst.appendChild(r);
    });
    if (!l.length) lst.textContent = 'Kein Patient gefunden.';
  }
  q.oninput = fill;
  later.onclick = close;
  del.onclick = async function () { if (!await kaConfirm('Diese Fotos löschen?')) return; await egClear(items.map(function (i) { return i.key; })); close(); };
  ok.onclick = async function () {
    if (!sel) return; ok.disabled = true; var p = sel, base = Date.now(), added = [];
    for (var i = 0; i < items.length; i++) {
      var b = await readImg(items[i].blob); if (!b) continue; var id = newId();
      if (await fPut(id, items[i].name, b)) added.push({ id: id, ts: base + i, name: items[i].name });
    }
    auditFilesAdded(p, added, 'Bilder');
    if (added.length === items.length) { p.bilder = (p.bilder || []).concat(added); persist(); await egClear(items.map(function (i) { return i.key; })); close(); viewAkte(p); alert(added.length + (added.length === 1 ? ' Foto' : ' Fotos') + ' gespeichert.'); }
    else { if (added.length) { p.bilder = (p.bilder || []).concat(added); persist(); } await egClear(items.filter(function (it, i) { return i < added.length; }).map(function (i) { return i.key; })); alert('Nicht alle Fotos konnten gespeichert werden. Der Rest bleibt im Eingang.'); close(); }
  };
  rt.appendChild(later); rt.appendChild(ok); foot.appendChild(del); foot.appendChild(rt);
  [h, th, q, lst, foot].forEach(function (n) { box.appendChild(n); }); ov.appendChild(box); document.body.appendChild(ov); fill();
}
try { egCheck(); document.addEventListener('visibilitychange', function () { if (!document.hidden) egCheck(); }); if (/eingang=1/.test(location.search)) history.replaceState(null, '', location.pathname); } catch (x) {}

/* Zeilen-Buttons: Tipp auf die Zeile zeigt sie, Tipp daneben blendet sie wieder aus */
document.addEventListener('click', function (ev) {
  var t = ev.target; if (!t || !t.closest) return;
  var row = t.closest('#tab-patienten tbody tr, #tab-zahlungen tbody tr');
  if (row && !row.querySelector('.pt-acts, .btn.btn-sm')) row = null;
  [].forEach.call(document.querySelectorAll('tr.ra-open'), function (x) { if (x !== row) x.classList.remove('ra-open'); });
  if (!row || t.closest('button, a, input, select, textarea, label')) return;
  row.classList.toggle('ra-open');
});
try { srchInit(); } catch (x) {}
try { EXT.reload(); EXT.ui(); setTimeout(function () { EXT.refresh(); }, 4000); setInterval(function () { if (document.visibilityState === 'visible') EXT.refresh(); }, 900000); } catch (x) {}
try { KS.init(); } catch (x) {}

