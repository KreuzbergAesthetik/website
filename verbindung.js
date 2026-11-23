/* Handy-Verbindung (Test): Handy und Tablet verbinden sich direkt im WLAN (WebRTC), ohne Server.
   Der Verbindungsaufbau läuft über zwei QR-Codes (Angebot Tablet -> Handy, Antwort Handy -> Tablet).
   Es werden keine Patientendaten übertragen; der Test sendet nur zufällige Prüfdaten.
   Es sind keine STUN-/TURN-Server eingetragen: Die Daten bleiben im lokalen Netz. */
(function () {
  'use strict';
  var KV = window.KV = {};
  var CHUNK = 16384, TESTBYTES = 4 * 1024 * 1024;

  /* ---------- Kodierung: SDP -> deflate -> base64url (passt in einen QR-Code) ---------- */
  function b64u(bytes) { var s = ''; for (var i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function unb64u(t) { t = String(t).replace(/-/g, '+').replace(/_/g, '/'); while (t.length % 4) t += '='; var s = atob(t), a = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a; }
  async function pipe(bytes, stream) {
    var w = stream.writable.getWriter(); w.write(bytes); w.close();
    return new Uint8Array(await new Response(stream.readable).arrayBuffer());
  }
  KV.pack = async function (sdp) {
    var raw = new TextEncoder().encode(sdp);
    if (typeof CompressionStream === 'undefined') return 'r' + b64u(raw);
    return 'z' + b64u(await pipe(raw, new CompressionStream('deflate-raw')));
  };
  KV.unpack = async function (code) {
    code = String(code || '').trim(); var k = code.charAt(0), body = unb64u(code.slice(1));
    if (k === 'r') return new TextDecoder().decode(body);
    if (k !== 'z') throw new Error('Unbekanntes Format');
    if (typeof DecompressionStream === 'undefined') throw new Error('Dieser Browser kann den Code nicht lesen');
    return new TextDecoder().decode(await pipe(body, new DecompressionStream('deflate-raw')));
  };

  /* ---------- QR-Code zeichnen ---------- */
  KV.qr = function (text, size) {
    var q = qrcode(0, 'L'); q.addData(text); q.make();
    var n = q.getModuleCount(), cell = Math.max(2, Math.floor(size / (n + 8))), px = cell * (n + 8), c = document.createElement('canvas');
    c.width = c.height = px; c.style.width = c.style.height = Math.min(px, size) + 'px'; c.style.imageRendering = 'pixelated';
    var g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, px, px); g.fillStyle = '#000';
    for (var r = 0; r < n; r++) for (var k = 0; k < n; k++) if (q.isDark(r, k)) g.fillRect((k + 4) * cell, (r + 4) * cell, cell, cell);
    return c;
  };

  /* ---------- Kamera: QR-Code lesen ---------- */
  KV.scan = function (video, onText) {
    var stop = false, stream = null, cv = document.createElement('canvas'), cx = cv.getContext('2d', { willReadFrequently: true });
    function end() { stop = true; if (stream) stream.getTracks().forEach(function (t) { t.stop(); }); video.srcObject = null; }
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false }).then(function (s) {
      if (stop) { s.getTracks().forEach(function (t) { t.stop(); }); return; }
      stream = s; video.srcObject = s; video.setAttribute('playsinline', ''); video.muted = true; return video.play();
    }).then(function () {
      (function tick() {
        if (stop) return;
        if (video.readyState >= 2 && video.videoWidth) {
          var w = Math.min(640, video.videoWidth), h = Math.round(w * video.videoHeight / video.videoWidth); cv.width = w; cv.height = h; cx.drawImage(video, 0, 0, w, h);
          var r = window.jsQR && jsQR(cx.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: 'dontInvert' });
          if (r && r.data) { end(); onText(r.data); return; }
        }
        setTimeout(tick, 120);
      })();
    }).catch(function (e) { onText(null, e); });
    return end;
  };

  /* Mit erteilter Kamera-Erlaubnis zeigen Browser echte lokale Adressen statt verschleierter Namen (.local). */
  KV.unmask = async function () {
    try { var s = await navigator.mediaDevices.getUserMedia({ video: true, audio: false }); s.getTracks().forEach(function (t) { t.stop(); }); return true; } catch (e) { return false; }
  };

  /* ---------- Verbindung ---------- */
  function waitIce(pc) {
    return new Promise(function (res) {
      if (pc.iceGatheringState === 'complete') return res();
      var t = setTimeout(res, 4000);
      pc.addEventListener('icegatheringstatechange', function () { if (pc.iceGatheringState === 'complete') { clearTimeout(t); res(); } });
    });
  }
  /* Tablet: Angebot erzeugen */
  KV.host = async function () {
    var pc = new RTCPeerConnection({ iceServers: [] }), dc = pc.createDataChannel('ka', { ordered: true });
    dc.binaryType = 'arraybuffer';
    await pc.setLocalDescription(await pc.createOffer()); await waitIce(pc);
    return { pc: pc, dc: dc, code: await KV.pack(pc.localDescription.sdp) };
  };
  /* Handy: Angebot annehmen, Antwort erzeugen */
  KV.accept = async function (offerCode) {
    var pc = new RTCPeerConnection({ iceServers: [] }), h = { pc: pc, dc: null, onchannel: null };
    pc.ondatachannel = function (ev) { h.dc = ev.channel; h.dc.binaryType = 'arraybuffer'; if (h.onchannel) h.onchannel(h.dc); };
    await pc.setRemoteDescription({ type: 'offer', sdp: await KV.unpack(offerCode) });
    await pc.setLocalDescription(await pc.createAnswer()); await waitIce(pc);
    h.code = await KV.pack(pc.localDescription.sdp); return h;
  };
  /* Tablet: Antwort einsetzen */
  KV.finish = async function (h, answerCode) { await h.pc.setRemoteDescription({ type: 'answer', sdp: await KV.unpack(answerCode) }); };

  /* Art der Verbindung (lokal oder über das Internet) aus den Statistiken */
  KV.pairInfo = async function (pc) {
    try {
      var st = await pc.getStats(), sel = null, byId = {};
      st.forEach(function (r) { byId[r.id] = r; });
      st.forEach(function (r) { if (r.type === 'transport' && r.selectedCandidatePairId) sel = byId[r.selectedCandidatePairId]; });
      if (!sel) st.forEach(function (r) { if (r.type === 'candidate-pair' && (r.nominated || r.selected) && r.state === 'succeeded') sel = r; });
      if (!sel) return '';
      var l = byId[sel.localCandidateId] || {}, r2 = byId[sel.remoteCandidateId] || {};
      return (l.candidateType || '?') + ' / ' + (r2.candidateType || '?') + (r2.address || r2.ip ? ' (' + (r2.address || r2.ip) + ')' : '');
    } catch (e) { return ''; }
  };

  /* ---------- Testablauf über den Datenkanal ---------- */
  function sum32(s, bytes) { for (var i = 0; i < bytes.length; i++) s = (Math.imul(s, 31) + bytes[i]) >>> 0; return s; }
  /* Tablet (Fragender): Laufzeit messen, dann Prüfdaten empfangen. cb(Zeile) meldet den Fortschritt. */
  KV.testHost = function (h, cb) {
    return new Promise(function (resolve, reject) {
      var dc = h.dc, rtts = [], got = 0, t0 = 0, sum = 0, n = 0, fertig = false;
      function ping() { dc.send(JSON.stringify({ t: 'ping', at: performance.now() })); }
      var timer = setTimeout(function () { if (!fertig) reject(new Error('Zeitüberschreitung')); }, 60000);
      dc.onmessage = function (ev) {
        if (typeof ev.data === 'string') {
          var m = JSON.parse(ev.data);
          if (m.t === 'pong') {
            rtts.push(performance.now() - m.at); n++;
            if (n < 8) ping(); else { cb('Laufzeit gemessen, Prüfdaten werden gesendet …'); t0 = performance.now(); dc.send(JSON.stringify({ t: 'send', size: TESTBYTES })); }
          } else if (m.t === 'done') {
            fertig = true; clearTimeout(timer); var sek = (performance.now() - t0) / 1000; rtts.sort(function (a, b) { return a - b; });
            var res = { rtt: rtts[Math.floor(rtts.length / 2)], mbps: (got * 8 / 1e6) / sek, bytes: got, ok: got === TESTBYTES && sum === m.sum, sek: sek };
            dc.send(JSON.stringify({ t: 'result', rtt: Math.round(res.rtt), mbps: Math.round(res.mbps * 10) / 10, ok: res.ok })); resolve(res);
          }
        } else { var b = new Uint8Array(ev.data); got += b.length; sum = sum32(sum, b); if (got % (1024 * 1024) < CHUNK) cb('Empfangen: ' + Math.round(got / 1048576 * 10) / 10 + ' von ' + TESTBYTES / 1048576 + ' MB'); }
      };
      cb('Messe Laufzeit …'); ping();
    });
  };
  /* Handy (Antwortender): Pings beantworten, Prüfdaten senden */
  KV.testGuest = function (h, cb) {
    var dc = h.dc;
    dc.bufferedAmountLowThreshold = CHUNK * 8;
    dc.onmessage = function (ev) {
      var m = JSON.parse(ev.data);
      if (m.t === 'ping') dc.send(JSON.stringify({ t: 'pong', at: m.at }));
      else if (m.t === 'send') {
        var left = m.size, sum = 0, buf = new Uint8Array(CHUNK), seed = 1;
        (function pump() {
          while (left > 0) {
            if (dc.bufferedAmount > CHUNK * 16) { dc.onbufferedamountlow = function () { dc.onbufferedamountlow = null; pump(); }; return; }
            var len = Math.min(CHUNK, left), part = new Uint8Array(len);
            for (var i = 0; i < len; i++) { seed = (Math.imul(seed, 1103515245) + 12345) >>> 0; part[i] = seed >>> 24; }
            sum = sum32(sum, part); dc.send(part); left -= len;
          }
          dc.send(JSON.stringify({ t: 'done', sum: sum }));
        })();
        cb('Sende Prüfdaten …');
      } else if (m.t === 'result') cb(null, m);
    };
  };

  /* ---------- Fenster am Tablet ---------- */
  KV.openTablet = async function () {
    var o = document.createElement('div'); o.id = 'kv-ov'; o.style.cssText = 'position:fixed; inset:0; z-index:300; background:rgba(15,23,42,.6); display:flex; align-items:flex-start; justify-content:center; overflow:auto; padding:16px;';
    var box = document.createElement('div'); box.style.cssText = 'background:#fff; border-radius:14px; max-width:520px; width:100%; padding:18px; box-shadow:0 12px 40px rgba(0,0,0,.35);';
    box.innerHTML = '<div style="font-size:17px; font-weight:800; color:#012265; margin-bottom:4px;">Handy-Verbindung testen</div>' +
      '<div id="kv-hint" style="font-size:13px; color:#475569; margin-bottom:12px;">Beide Geräte müssen im selben WLAN sein. Es werden nur Prüfdaten gesendet, keine Patientendaten.</div>' +
      '<div id="kv-main" style="text-align:center;"></div><div id="kv-status" style="margin:12px 0; font-size:14px; font-weight:600; color:#0f172a;"></div>' +
      '<details style="margin-bottom:12px; font-size:13px;"><summary style="cursor:pointer; color:#475569;">Antwort-Code einfügen statt scannen</summary><textarea id="kv-paste" rows="3" style="width:100%; margin-top:6px;" class="form-control"></textarea><button type="button" id="kv-pastego" class="btn btn-secondary btn-sm" style="margin-top:6px;">Übernehmen</button></details>' +
      '<div style="display:flex; justify-content:flex-end;"><button type="button" id="kv-close" class="btn btn-cancel">Schließen</button></div>';
    o.appendChild(box); document.body.appendChild(o);
    var main = box.querySelector('#kv-main'), status = box.querySelector('#kv-status'), h = null, stopScan = null, closed = false;
    function setS(t, bad) { status.textContent = t; status.style.color = bad ? '#b91c1c' : '#0f172a'; }
    function close() { closed = true; if (stopScan) stopScan(); try { if (h) h.pc.close(); } catch (e) {} o.remove(); }
    box.querySelector('#kv-close').onclick = close;
    setS('Verbindung wird vorbereitet …');
    await KV.unmask();
    try { h = await KV.host(); } catch (e) { setS('WebRTC wird von diesem Browser nicht unterstützt.', true); return; }
    if (closed) return;
    KV.last = h;
    var url = new URL('verbindung.html', location.href).href + '#o=' + h.code;
    main.innerHTML = '<div style="font-size:14px; margin-bottom:8px;"><b>1.</b> Handy-Kamera auf diesen Code richten und den Link öffnen.</div>';
    main.appendChild(KV.qr(url, 300));
    var vid = document.createElement('video'); vid.style.cssText = 'display:none; width:100%; max-width:320px; border-radius:10px; margin-top:10px;';
    var sb = document.createElement('button'); sb.type = 'button'; sb.className = 'btn btn-save'; sb.style.marginTop = '12px'; sb.textContent = '2. Antwort-Code vom Handy scannen';
    main.appendChild(document.createElement('br')); main.appendChild(sb); main.appendChild(document.createElement('br')); main.appendChild(vid);
    setS('Wartet auf das Handy …');
    var connected = false;
    async function answer(code) {
      try { await KV.finish(h, code); setS('Verbinde …'); } catch (e) { setS('Der Code passt nicht. Bitte noch einmal.', true); }
    }
    sb.onclick = function () {
      vid.style.display = 'block'; setS('Kamera auf den Code am Handy richten …');
      stopScan = KV.scan(vid, function (txt, err) {
        vid.style.display = 'none';
        if (!txt) { setS('Kamera nicht verfügbar. Bitte den Code unten einfügen.', true); return; }
        answer(txt.replace(/^.*#?a=/, ''));
      });
    };
    box.querySelector('#kv-pastego').onclick = function () { answer(box.querySelector('#kv-paste').value.replace(/^.*#?a=/, '')); };
    h.dc.onopen = async function () {
      if (connected) return; connected = true; if (stopScan) stopScan(); main.innerHTML = ''; setS('Verbunden. Test läuft …');
      try {
        var r = await KV.testHost(h, function (t) { setS(t); }), pair = await KV.pairInfo(h.pc);
        main.innerHTML = '<div style="font-size:15px; text-align:left; line-height:1.6;"><b style="color:' + (r.ok ? '#15803d' : '#b91c1c') + ';">' + (r.ok ? 'Verbindung funktioniert' : 'Daten kamen fehlerhaft an') + '</b><br>Laufzeit: ' + Math.round(r.rtt) + ' ms<br>Geschwindigkeit: ' + (Math.round(r.mbps * 10) / 10) + ' MBit/s (' + (Math.round(r.bytes / 104857.6) / 10) + ' MB in ' + (Math.round(r.sek * 10) / 10) + ' s)<br>Weg: ' + (pair || 'unbekannt') + '<br><span style="font-size:12px; color:#64748b;">„host / host“ heißt: direkt im lokalen Netz, ohne Internet.</span></div>';
        setS('');
      } catch (e) { setS('Der Test ist fehlgeschlagen: ' + e.message, true); }
    };
    h.pc.onconnectionstatechange = function () { if (!connected && (h.pc.connectionState === 'failed')) setS('Keine Verbindung möglich. Sind beide Geräte im selben WLAN (kein Gäste-WLAN)?', true); };
  };
})();
