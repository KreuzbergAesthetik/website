/* ===== Rechnungen ===== */
var invoices = [];
try { var sinv = JSON.parse(kaGet('ka_invoices')); if (Array.isArray(sinv)) invoices = sinv; } catch (x) {}
var QRM = {"pp": ["1111111001110110100001000111001111111", "1000001001001111111111111010101000001", "1011101011011010011111101011001011101", "1011101001000011111000001100101011101", "1011101011111111000001100011001011101", "1000001010100010001111101000101000001", "1111111010101010101010101010101111111", "0000000000110100100111011100000000000", "0100101010100101000011101101010110100", "0010100010010111100100010010001010100", "1101011111110110011110011111110000010", "0011100000000111001011100011110100101", "1110111111000001000110101000011001001", "1000010100110000010000111001110010110", "0101111110101011010101111111101011100", "1101000001000011111011001010111000100", "0011011101001111101110000000011101100", "1110010110111000000110101001100110000", "1010111101110111101011111111010001100", "0000110100011011011101110010010110101", "0101101011110111011111100101011000101", "0100110101101110010000000101010011101", "0111111010000010011011010001101000000", "0110010101011111011011101010110100100", "1001001000001010010001101111001001111", "1000110110000001001000010100010110010", "0001011110110010000010110111110000000", "0010010111110100111101000010001011100", "1111101111010010000100100000111111111", "0000000010101000000111110101100011010", "1111111000111000000010011000101011100", "1000001000110111110010101010100010100", "1011101010000000101100101000111111101", "1011101000110001101110000101001000010", "1011101001101101001010100111101000110", "1000001010101111001001101011010000110", "1111111000011110000100110101010110111"]};
var DEF_KATALOG = [{"name": "Neuromodulator 1 Zone", "price": 169, "rate": 19}, {"name": "Neuromodulator 2 Zonen", "price": 259, "rate": 19}, {"name": "Neuromodulator 3 Zonen", "price": 349, "rate": 19}, {"name": "Jede weitere Zone", "price": 90, "rate": 19}, {"name": "Hyperhidrosis (Achseln, Hände, ...)", "price": 499, "rate": 19}, {"name": "Bruxismus/Masseter", "price": 299, "rate": 19}, {"name": "Nefertiti komplett (Jawline + Platysma)", "price": 399, "rate": 19}, {"name": "Jawline", "price": 269, "rate": 19}, {"name": "Platysma", "price": 269, "rate": 19}, {"name": "Trap-Tox, Barbie, Botox", "price": 349, "rate": 19}, {"name": "Hyaluron Filler 0,55 ml", "price": 249, "rate": 19}, {"name": "Hyaluron Filler 0,7 ml", "price": 299, "rate": 19}, {"name": "Hyaluron Filler 1 ml", "price": 349, "rate": 19}, {"name": "Hyaluron Filler Hochrisiko", "price": 399, "rate": 19}, {"name": "Polynukleotide 2 ml", "price": 349, "rate": 19}, {"name": "Profhilo® 2 ml", "price": 349, "rate": 19}, {"name": "CaHA (z.B. Radiesse®) 1,5 ml", "price": 449, "rate": 19}, {"name": "PLLA (z.B. Sculptra®) 1 Vial", "price": 599, "rate": 19}, {"name": "Ellansé® 1 ml", "price": 399, "rate": 19}, {"name": "UltraCol®", "price": 399, "rate": 19}, {"name": "Hylase intern", "price": 149, "rate": 19}, {"name": "Hylase extern", "price": 249, "rate": 19}, {"name": "Fett-Weg-Spritze/Lipolyse (PB-Serum®)", "price": 499, "rate": 19}, {"name": "Fett-Weg-Spritze/Lipolyse (traditionell)", "price": 249, "rate": 19}, {"name": "Fett-Weg-Spritze/Lipolyse (Lemonbottle®)", "price": 249, "rate": 19}, {"name": "PRX-T33®-Peeling", "price": 149, "rate": 19}, {"name": "Retinol-Peeling", "price": 199, "rate": 19}, {"name": "PRP", "price": 399, "rate": 19}, {"name": "PRF", "price": 399, "rate": 19}, {"name": "Microneedling", "price": 249, "rate": 19}, {"name": "Microneedling mit Exosomen", "price": 399, "rate": 19}, {"name": "NCTF®-Mesotherapie", "price": 249, "rate": 19}, {"name": "Rotlicht-Therapie (LED)", "price": 20, "rate": 19}, {"name": "NAD+-Infusion 250 mg", "price": 399, "rate": 19}, {"name": "2 x Sculptra® innerhalb von 6 Monaten", "price": 999, "rate": 19}, {"name": "3 x Sculptra® innerhalb eines Jahres", "price": 1399, "rate": 19}, {"name": "4 x Retinol-Peeling innerhalb von 6 Monaten", "price": 699, "rate": 19}, {"name": "4 x PRX-T33®-Peeling innerhalb von 6 Monaten", "price": 499, "rate": 19}, {"name": "2 x Exosomen + Needling", "price": 799, "rate": 19}, {"name": "3 x Exosomen + Needling", "price": 999, "rate": 19}, {"name": "3 x Polynukleotide", "price": 899, "rate": 19}, {"name": "4 x Polynukleotide", "price": 1199, "rate": 19}, {"name": "3 x NAD+-Infusion", "price": 999, "rate": 19}, {"name": "4 x NAD+-Infusion", "price": 1299, "rate": 19}, {"name": "Lip-Flip + 0,7 ml Hyaluron (Abstand 2 Wochen)", "price": 349, "rate": 19}];
var settings = { steuernr: '', ustid: 'DE370141890', inhaber: 'Manuel Fella', bank: '', bic: '', iban: '', paypal: '', hinweis: '', zahlung: '', katalog: [] };
try { var sset = JSON.parse(kaGet('ka_settings')); if (sset && typeof sset === 'object') settings = Object.assign(settings, sset); } catch (x) {}
if (!Array.isArray(settings.katalog)) settings.katalog = [];
if (!settings.katSeeded) { if (!settings.katalog.length) settings.katalog = DEF_KATALOG.map(function (k) { return { name: k.name, price: k.price, rate: k.rate }; }); settings.katSeeded = true; }
if (!settings.inhaber) settings.inhaber = 'Manuel Fella';
titelMigration();
var PRAXIS = { kopf: 'Kreuzberg Ästhetik - Manuel Fella', titel: 'Arzt für ästhetische Medizin', strasse: 'Neuenburger Str. 24', ort: '10969 Berlin', tel: '+49 173 2874413', mail: 'manuel.fella@kreuzberg-aesthetik.de', web: 'www.kreuzberg-aesthetik.de' };
var invRows = [], invP = null, viewInvId = null;
function nf(n) { return (Math.round(n * 100) / 100).toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function eur(n) { return nf(n) + ' €'; }
function eurP(n) { return '€ ' + nf(n); }
function r2(n) { return Math.round(n * 100) / 100; }
function numIn(v) {
  var t = String(v == null ? '' : v).trim();
  if (t.indexOf(',') >= 0) t = t.replace(/\./g, '').replace(',', '.');
  var n = parseFloat(t); return isNaN(n) ? 0 : n;
}
function fmtD(d) { var p = String(d || '').split('-'); return p.length === 3 ? p[2] + '.' + p[1] + '.' + p[0] : ''; }
function fmtLong(d) { var p = String(d || '').split('-'); return p.length === 3 ? parseInt(p[2], 10) + '. ' + MN[parseInt(p[1], 10) - 1] + ' ' + p[0] : ''; }
function rowAmount(i) {
  var r = invRows[i];
  if (r.type === 'rabatt') {
    var base = 0; for (var k = 0; k < i; k++) if (invRows[k].type !== 'rabatt') base += numIn(invRows[k].qty) * numIn(invRows[k].price) - posRab(k);
    return r.art === 'eur' ? -r2(Math.min(Math.max(base, 0), numIn(r.pct))) : -r2(base * numIn(r.pct) / 100);
  }
  return r2(numIn(r.qty) * numIn(r.price));
}
function posRab(i) { var r = invRows[i]; if (!r || r.type === 'rabatt') return 0; var g = r2(numIn(r.qty) * numIn(r.price)); return r.rabArt === 'eur' ? r2(Math.min(g, numIn(r.rab))) : r2(g * Math.min(100, numIn(r.rab)) / 100); }
function invTotal() { var t = 0; for (var i = 0; i < invRows.length; i++) t += rowAmount(i) - posRab(i); return r2(t); }
function paidSum(inv) { return (inv.payments || []).reduce(function (a, p) { return a + p.amount; }, 0); }
function invState(inv) {
  var n = (inv.payments || []).length, sum = paidSum(inv);
  if (inv.stornoFor) return { txt: 'Stornorechnung', cls: 'badge-gray', full: true };
  if (inv.storniert) return { txt: 'Storniert', cls: 'badge-gray', full: true };
  if ((inv.paid && !n) || sum >= inv.total - 0.005) return { txt: 'Bezahlt', cls: 'badge-green', full: true };
  if (sum > 0) return { txt: 'Teilzahlung', cls: 'badge-amber', full: false };
  return { txt: 'Offen', cls: 'badge-amber', full: false };
}

function refreshLeistungen() {
  var dl = document.getElementById('t-leistung-list'); if (!dl) return;
  var names = ['Botulinumtoxin', 'Hyaluronsäure', 'Beratungsgespräch', 'Kontrolle'];
  (settings.katalog || []).forEach(function (k) { if (k.name && names.indexOf(k.name) < 0) names.push(k.name); });
  dl.innerHTML = ''; names.forEach(function (n) { var o = document.createElement('option'); o.value = n; dl.appendChild(o); });
}
function findKat(name) {
  var n = String(name || '').trim().toLowerCase();
  return (settings.katalog || []).filter(function (k) { return k.name.trim().toLowerCase() === n; })[0];
}
