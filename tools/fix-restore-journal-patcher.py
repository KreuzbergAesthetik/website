from pathlib import Path

p = Path('tools/apply-restore-journal.py')
s = p.read_text(encoding='utf-8')
mark = '# Browser-Test: unterbrochenen Dateitausch und committed cleanup real in IndexedDB prüfen.'
pos = s.find(mark)
if pos < 0:
    raise SystemExit('Browser-Patchblock nicht gefunden')

new_tail = r'''# Browser-Test: unterbrochenen Dateitausch und committed cleanup real in IndexedDB prüfen.
b = BROWSER.read_text(encoding='utf-8')
if 'restoreJournalCrashRecovery' not in b:
    old = r'''    // Restore-Dateien werden erst vorbereitet und dann in einer einzigen IndexedDB-Transaktion umgeschaltet.
    await fClear();
    await fPut('ci-old', 'old.txt', new Blob(['old'], { type:'text/plain' }));
    const pref = '\uffffka_restore_ci_';
    const stage = pref + '0';
    await fPut(stage, 'new.txt', new Blob(['new'], { type:'text/plain' }));
    const swapped = await fCommitStagedFiles(pref, { [stage]:'ci-new' });
    const oldAfter = await fGet('ci-old');
    const newAfter = await fGet('ci-new');
    out.atomicFileSwap = swapped && !oldAfter && !!newAfter && (await newAfter.blob.text()) === 'new';
    await fClear();

    // Sync-Schicht ist geladen, ohne einen echten Serverzugriff auszulösen.'''
    new = r'''    // Restore-Journal: Ein unterbrochener Restore muss Kerndaten und Dateien vollständig zurückrollen.
    await fClear();
    const oldCore = JSON.stringify([{ id:7101, patient:'Journal Alt', date:'2026-10-30', time:'09:00', dur:30 }]);
    kaSet('ka_events', oldCore); await kaIdle();
    await fPut('ci-j-old', 'old.txt', new Blob(['old-file'], { type:'text/plain' }));
    const j1 = await restoreJournalBegin();
    const stage1 = j1.stagePrefix + '0';
    await fPut(stage1, 'new.txt', new Blob(['new-file'], { type:'text/plain' }));
    const map1 = {}; map1[stage1] = 'ci-j-new';
    const swapped1 = await fCommitStagedFiles(j1.stagePrefix, map1, j1.backupPrefix);
    restoreJournalPhase(j1, 'files-swapped');
    kaSet('ka_events', JSON.stringify([{ id:7102, patient:'Journal Neu', date:'2026-10-31', time:'10:00', dur:30 }])); await kaIdle();
    await rjEarlyCore(); await kaLoadAll(); await kaIdle();
    await restoreJournalStartup();
    const oldFile = await fGet('ci-j-old'), newFileAfterRollback = await fGet('ci-j-new');
    out.restoreJournalCrashRecovery = swapped1 && JSON.parse(kaGet('ka_events'))[0]?.id === 7101 && !!oldFile && (await oldFile.blob.text()) === 'old-file' && !newFileAfterRollback && !localStorage.getItem(RJ_KEY);
    await fClear();

    // Nach Commit werden nur die neuen Dateien behalten und das Journal restlos entfernt.
    await fPut('ci-j-old2', 'old2.txt', new Blob(['old-2'], { type:'text/plain' }));
    const j2 = await restoreJournalBegin();
    const stage2 = j2.stagePrefix + '0';
    await fPut(stage2, 'new2.txt', new Blob(['new-2'], { type:'text/plain' }));
    const map2 = {}; map2[stage2] = 'ci-j-new2';
    const swapped2 = await fCommitStagedFiles(j2.stagePrefix, map2, j2.backupPrefix);
    restoreJournalPhase(j2, 'files-swapped');
    kaSet('ka_events', JSON.stringify([{ id:7103, patient:'Journal Commit', date:'2026-10-31', time:'11:00', dur:30 }])); await kaIdle();
    restoreJournalPhase(j2, 'committed');
    await restoreJournalFinalize(j2);
    const old2 = await fGet('ci-j-old2'), new2 = await fGet('ci-j-new2');
    out.restoreJournalCommit = swapped2 && !old2 && !!new2 && (await new2.blob.text()) === 'new-2' && JSON.parse(kaGet('ka_events'))[0]?.id === 7103 && !localStorage.getItem(RJ_KEY);
    await fClear();

    // Sync-Schicht ist geladen, ohne einen echten Serverzugriff auszulösen.'''
    if old not in b:
        raise SystemExit('Aktueller Restore-Browsertest nicht gefunden')
    b = b.replace(old, new, 1)
    BROWSER.write_text(b, encoding='utf-8')

print('Restore-Journal Patch angewendet.')
'''

# Outer Python string quoting is awkward because the target script itself contains triple strings.
# Build the same tail using repr-safe concatenation instead.
new_tail = """# Browser-Test: unterbrochenen Dateitausch und committed cleanup real in IndexedDB prüfen.\nb = BROWSER.read_text(encoding='utf-8')\nif 'restoreJournalCrashRecovery' not in b:\n    old = \"\"\"    // Restore-Dateien werden erst vorbereitet und dann in einer einzigen IndexedDB-Transaktion umgeschaltet.\n    await fClear();\n    await fPut('ci-old', 'old.txt', new Blob(['old'], { type:'text/plain' }));\n    const pref = '\\\\uffffka_restore_ci_';\n    const stage = pref + '0';\n    await fPut(stage, 'new.txt', new Blob(['new'], { type:'text/plain' }));\n    const swapped = await fCommitStagedFiles(pref, { [stage]:'ci-new' });\n    const oldAfter = await fGet('ci-old');\n    const newAfter = await fGet('ci-new');\n    out.atomicFileSwap = swapped && !oldAfter && !!newAfter && (await newAfter.blob.text()) === 'new';\n    await fClear();\n\n    // Sync-Schicht ist geladen, ohne einen echten Serverzugriff auszulösen.\"\"\"\n    new = \"\"\"    // Restore-Journal: Ein unterbrochener Restore muss Kerndaten und Dateien vollständig zurückrollen.\n    await fClear();\n    const oldCore = JSON.stringify([{ id:7101, patient:'Journal Alt', date:'2026-10-30', time:'09:00', dur:30 }]);\n    kaSet('ka_events', oldCore); await kaIdle();\n    await fPut('ci-j-old', 'old.txt', new Blob(['old-file'], { type:'text/plain' }));\n    const j1 = await restoreJournalBegin();\n    const stage1 = j1.stagePrefix + '0';\n    await fPut(stage1, 'new.txt', new Blob(['new-file'], { type:'text/plain' }));\n    const map1 = {}; map1[stage1] = 'ci-j-new';\n    const swapped1 = await fCommitStagedFiles(j1.stagePrefix, map1, j1.backupPrefix);\n    restoreJournalPhase(j1, 'files-swapped');\n    kaSet('ka_events', JSON.stringify([{ id:7102, patient:'Journal Neu', date:'2026-10-31', time:'10:00', dur:30 }])); await kaIdle();\n    await rjEarlyCore(); await kaLoadAll(); await kaIdle();\n    await restoreJournalStartup();\n    const oldFile = await fGet('ci-j-old'), newFileAfterRollback = await fGet('ci-j-new');\n    out.restoreJournalCrashRecovery = swapped1 && JSON.parse(kaGet('ka_events'))[0]?.id === 7101 && !!oldFile && (await oldFile.blob.text()) === 'old-file' && !newFileAfterRollback && !localStorage.getItem(RJ_KEY);\n    await fClear();\n\n    // Nach Commit werden nur die neuen Dateien behalten und das Journal restlos entfernt.\n    await fPut('ci-j-old2', 'old2.txt', new Blob(['old-2'], { type:'text/plain' }));\n    const j2 = await restoreJournalBegin();\n    const stage2 = j2.stagePrefix + '0';\n    await fPut(stage2, 'new2.txt', new Blob(['new-2'], { type:'text/plain' }));\n    const map2 = {}; map2[stage2] = 'ci-j-new2';\n    const swapped2 = await fCommitStagedFiles(j2.stagePrefix, map2, j2.backupPrefix);\n    restoreJournalPhase(j2, 'files-swapped');\n    kaSet('ka_events', JSON.stringify([{ id:7103, patient:'Journal Commit', date:'2026-10-31', time:'11:00', dur:30 }])); await kaIdle();\n    restoreJournalPhase(j2, 'committed');\n    await restoreJournalFinalize(j2);\n    const old2 = await fGet('ci-j-old2'), new2 = await fGet('ci-j-new2');\n    out.restoreJournalCommit = swapped2 && !old2 && !!new2 && (await new2.blob.text()) === 'new-2' && JSON.parse(kaGet('ka_events'))[0]?.id === 7103 && !localStorage.getItem(RJ_KEY);\n    await fClear();\n\n    // Sync-Schicht ist geladen, ohne einen echten Serverzugriff auszulösen.\"\"\"\n    if old not in b:\n        raise SystemExit('Aktueller Restore-Browsertest nicht gefunden')\n    b = b.replace(old, new, 1)\n    BROWSER.write_text(b, encoding='utf-8')\n\nprint('Restore-Journal Patch angewendet.')\n"""

p.write_text(s[:pos] + new_tail, encoding='utf-8')
print('Patcher korrigiert.')
