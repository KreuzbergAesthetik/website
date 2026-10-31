from pathlib import Path

p = Path('index.html')
s = p.read_text()

def one(old, new, label):
    global s
    n = s.count(old)
    if n != 1:
        raise SystemExit(f'{label}: expected 1 occurrence, got {n}')
    s = s.replace(old, new, 1)

one("var KA_V = '2026-11-01-n';", "var KA_V = '2026-11-01-o';", 'app version')

old_nav = """var PRAXIS_NAV = [['rechnungen', 'Rechnungen', 'renderInvoices'], ['zahlungen', 'Zahlungen', 'renderZahlungen'], ['statistik', 'Statistik', 'renderStat'], '-',
  ['settings', 'Praxisdaten', 'openSettings'], ['lager', 'Lager', 'renderLager'], ['leistungen', 'Leistungen', 'renderLeist'], ['dokumente', 'Vorlagen', 'renderTemplates'], ['nachrichten', 'Nachrichtenvorlagen', 'renderNachr'], ['textbausteine', 'Textbausteine', 'renderTxt'], '-',
  ['', 'Patientenstammdaten'], ['', 'Automationen'], ['webformulare', 'Webformulare', 'renderWebf'], ['abgleich', 'Geräte-Abgleich', 'renderSync'], ['sicherung', 'Sicherung', 'renderSicherung']];
var PRAXIS_TABS = PRAXIS_NAV.filter(function (x) { return x[0]; }).map(function (x) { return x[0]; });"""
new_nav = """var PRAXIS_NAV = [['#', 'Finanzen'], ['rechnungen', 'Rechnungen', 'renderInvoices'], ['zahlungen', 'Zahlungen', 'renderZahlungen'], ['statistik', 'Statistik', 'renderStat'],
  ['#', 'Praxis'], ['lager', 'Lager', 'renderLager'], ['leistungen', 'Leistungen', 'renderLeist'], ['settings', 'Praxisdaten', 'openSettings'],
  ['#', 'Kommunikation & Vorlagen'], ['webformulare', 'Webformulare', 'renderWebf'], ['dokumente', 'Vorlagen', 'renderTemplates'], ['nachrichten', 'Nachrichtenvorlagen', 'renderNachr'], ['textbausteine', 'Textbausteine', 'renderTxt'],
  ['#', 'Daten & Technik'], ['abgleich', 'Geräte-Abgleich', 'renderSync'], ['sicherung', 'Sicherung', 'renderSicherung'],
  ['#', 'Geplant'], ['', 'Patientenstammdaten'], ['', 'Automationen']];
var NAV_PINNED = ['rechnungen'];
var PRAXIS_TABS = PRAXIS_NAV.filter(function (x) { return x[0] && x[0] !== '#'; }).map(function (x) { return x[0]; });"""
one(old_nav, new_nav, 'praxis navigation')

one("if (x === '-' || !x[0]) return;\n    var b = document.createElement('button'); b.type = 'button'; b.className = 'nav-btn nav-x' + (x[0] === 'rechnungen' || x[0] === 'zahlungen' ? ' nav-main' : '');", "if (!x || !x[0] || x[0] === '#' || NAV_PINNED.indexOf(x[0]) < 0) return;\n    var b = document.createElement('button'); b.type = 'button'; b.className = 'nav-btn nav-x nav-main';", 'pinned navigation')

one("PRAXIS_NAV.forEach(function (x) { if (x[0]) TAB_RENDER[x[0]] = x[2]; });", "PRAXIS_NAV.forEach(function (x) { if (x[0] && x[0] !== '#') TAB_RENDER[x[0]] = x[2]; });", 'tab render')

old_fill = """PRAXIS_NAV.forEach(function (x) {
    if (x === '-') { if (last && last !== '-') { var sp = document.createElement('div'); sp.className = 'nav-sep'; box.appendChild(sp); last = '-'; } return; }
    var vb = x[0] && document.getElementById('btn-' + x[0]);"""
new_fill = """PRAXIS_NAV.forEach(function (x) {
    if (x === '-') { if (last && last !== '-') { var sp = document.createElement('div'); sp.className = 'nav-sep'; box.appendChild(sp); last = '-'; } return; }
    if (x[0] === '#') { var h = document.createElement('div'); h.className = 'nav-group'; h.textContent = x[1]; box.appendChild(h); last = 'h'; return; }
    var vb = x[0] && document.getElementById('btn-' + x[0]);"""
one(old_fill, new_fill, 'menu groups')

old_btn = '<button type="button" class="nav-btn nav-more" id="btn-praxis" onclick="toggleNavMenu(event)" title="Praxis" aria-label="Praxis"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></button>'
new_btn = '<button type="button" class="nav-btn nav-more" id="btn-praxis" onclick="toggleNavMenu(event)" title="Praxis" aria-label="Praxis"><span class="nav-more-label">Praxis</span><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></button>'
one(old_btn, new_btn, 'praxis button')

one(".nav-menu button:hover:not(:disabled) { background:#f1f5f9; } .nav-menu button:disabled { color:#94a3b8; cursor:default; } .nav-menu small { color:#94a3b8; font-size:11px; margin-left:6px; }", ".nav-menu button:hover:not(:disabled) { background:#f1f5f9; } .nav-menu button:disabled { color:#94a3b8; cursor:default; } .nav-menu small { color:#94a3b8; font-size:11px; margin-left:6px; }\n.nav-group { padding:10px 10px 4px; color:#64748b; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:.06em; } .nav-group:not(:first-child) { margin-top:5px; border-top:1px solid #e2e8f0; padding-top:10px; }", 'menu group css')

one("@media (max-width:760px) { header .nav-btn { padding-left:1px; padding-right:1px; font-size:12.5px; } header .nav-btn.nav-more { padding-left:10px; padding-right:10px; } }", "@media (max-width:760px) { header .nav-btn { padding-left:1px; padding-right:1px; font-size:12.5px; } header .nav-btn.nav-more { padding-left:10px; padding-right:10px; } .nav-more-label { display:none; } }", 'mobile praxis label')

p.write_text(s)

sw = Path('sw.js')
t = sw.read_text()
if t.count("var V='2026-11-01-n'") != 1:
    raise SystemExit('service worker version mismatch')
sw.write_text(t.replace("var V='2026-11-01-n'", "var V='2026-11-01-o'", 1))

# Regression assertions
assert "var NAV_PINNED = ['rechnungen'];" in s
assert "['#', 'Finanzen']" in s
assert "['#', 'Daten & Technik']" in s
assert 'nav-more-label">Praxis<' in s
