/* ===== PDF-Erzeugung (ohne Fremdbibliothek) ===== */
var HW = [278,278,355,556,556,889,667,191,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,278,278,584,584,584,556,1015,667,667,722,722,667,611,778,722,278,500,667,556,833,722,778,667,778,722,667,611,722,667,944,667,667,611,278,278,278,469,556,333,556,556,500,556,556,278,556,556,222,222,500,222,833,556,556,556,556,333,500,278,556,500,722,500,500,500,334,260,334,584];
var HB = [278,333,474,556,556,889,722,238,333,333,389,584,278,333,278,278,556,556,556,556,556,556,556,556,556,556,333,333,584,584,584,611,975,722,722,722,722,667,611,778,722,278,556,722,611,833,722,778,667,778,722,667,611,722,667,944,667,667,611,333,278,333,584,556,333,556,611,556,611,556,333,611,611,278,278,556,278,889,611,611,611,611,389,556,333,611,556,778,556,556,500,389,280,389,584];
function pdfBase(ch) { return 'ÄÀÁÂÃÅ'.indexOf(ch) >= 0 ? 'A' : 'ÖÒÓÔÕ'.indexOf(ch) >= 0 ? 'O' : 'ÜÙÚÛ'.indexOf(ch) >= 0 ? 'U' : 'äàáâãå'.indexOf(ch) >= 0 ? 'a' : 'öòóôõ'.indexOf(ch) >= 0 ? 'o' : 'üùúû'.indexOf(ch) >= 0 ? 'u' : 'éèêë'.indexOf(ch) >= 0 ? 'e' : 'íìîï'.indexOf(ch) >= 0 ? 'i' : ch; }
function pdfW(s, bold, size) {
  var t = bold ? HB : HW, w = 0;
  for (var i = 0; i < s.length; i++) {
    var ch = pdfBase(s.charAt(i)), c = ch.charCodeAt(0);
    w += (c >= 32 && c <= 126) ? t[c - 32] : (ch === 'ß' ? 611 : ch === '·' ? 278 : 556);
  }
  return w * size / 1000;
}
function pdfEnc(s) {
  var o = '';
  for (var i = 0; i < s.length; i++) {
    var c = s.charCodeAt(i), m = { 8364: 128, 8211: 150, 8212: 151, 8222: 132, 8220: 147, 8221: 148, 8217: 146, 8230: 133, 8226: 149 }[c];
    if (m) c = m; else if (c > 255) c = 63;
    var ch = String.fromCharCode(c);
    o += (ch === '(' || ch === ')' || ch === '\\') ? '\\' + ch : ch;
  }
  return o;
}
function pdfWrap(text, bold, size, maxW) {
  var out = [];
  String(text).split('\n').forEach(function (para) {
    var words = para.split(' '), line = '';
    words.forEach(function (w) {
      var t = line ? line + ' ' + w : w;
      if (line && pdfW(t, bold, size) > maxW) { out.push(line); line = w; } else line = t;
    });
    out.push(line);
  });
  return out;
}
function bstr(str) { var a = new Uint8Array(str.length); for (var i = 0; i < str.length; i++) a[i] = str.charCodeAt(i) & 255; return a; }
function getLogoJpeg() {
  try {
    var im = document.getElementById('inv-logo'); if (!im) return null;
    var c = document.createElement('canvas'); c.width = im.naturalWidth || 144; c.height = im.naturalHeight || 144;
    var g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, c.width, c.height); g.drawImage(im, 0, 0, c.width, c.height);
    var b = atob(c.toDataURL('image/jpeg', 0.92).split(',')[1]), a = new Uint8Array(b.length);
    for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i);
    return { w: c.width, h: c.height, bytes: a };
  } catch (x) { return null; }
}
var TW = { 'K': 722, 'r': 333, 'e': 444, 'u': 500, 'z': 444, 'b': 500, 'g': 500, ' ': 250, 'Ä': 722, 's': 389, 't': 278, 'h': 500, 'i': 278, 'k': 500, 'M': 889, 'a': 444, 'n': 500, 'l': 278, 'F': 556 };
function timesW(s, size) { var w = 0; for (var i = 0; i < s.length; i++) w += TW[s.charAt(i)] || 500; return w * size / 1000; }
function b64bytes(b) { var s = atob(b), a = new Uint8Array(s.length); for (var i = 0; i < s.length; i++) a[i] = s.charCodeAt(i); return a; }
