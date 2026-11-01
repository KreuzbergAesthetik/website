import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless:true, ...(process.env.CHROMIUM_EXECUTABLE_PATH ? {executablePath:process.env.CHROMIUM_EXECUTABLE_PATH} : {}) });
const context = await browser.newContext({viewport:{width:1280,height:900},serviceWorkers:'block'});
const page = await context.newPage();
const errors=[]; page.on('pageerror',e=>errors.push(String(e)));
try {
  await page.goto(process.env.APP_URL || 'http://127.0.0.1:4173/index.html');
  await page.fill('#al-pw','LayoutTestPasswort-123!');
  await page.fill('#al-pw2','LayoutTestPasswort-123!');
  await page.click('#al-submit');
  await page.waitForFunction(()=>window.KA && KA.booted && !document.documentElement.classList.contains('locked'));
  const checks=await page.evaluate(async()=>{
    patients.length=0; invoices.length=0; entw.length=0;
    const p={id:'layout-patient',nr:1,vorname:'Layout',nachname:'Testperson',adresse:'Teststraße 1\n10115 Teststadt',medikation:[],log:[],doku:[],dokumente:[],bilder:[]};
    patients.push(p);settings.steuernr='TEST';
    const create=async(kind)=>{openInvoiceKind(p,kind);invRows=[{type:'pos',text:'Testleistung',qty:'1',price:'100',rate:'19',datum:'',note:'',rab:''}];renderInvRows();await saveInvoice();closeModal('modal-invview');};
    await create('test');const test=entw.find(e=>e.kind==='test');
    await create('kv');const kv=entw.find(e=>e.kind==='kv');
    await create('rechnung');
    invTab='rechnung';invF='';renderInvoices();
    const out={};
    out.tabs=document.getElementById('inv-kind').textContent==='Rechnungen & KVTest-Rechnungen';
    out.billingRows=document.querySelectorAll('#inv-table tr').length===2;
    out.kvLabel=!!document.querySelector('#inv-table .inv-kv-label');
    out.separateStorage=invoices.length===1 && entw.length===2 && invKind(kv)==='kv';
    out.noTestInMain=![...document.querySelectorAll('#inv-table button.pn')].some(e=>e.textContent==='Test-Rechnung');
    out.noKvDebt=invOpenInfo().list.length===1;
    invF='kv';renderInvoices();out.kvFilter=document.querySelectorAll('#inv-table tr').length===1 && !!document.querySelector('.inv-kv-label');
    invTab='test';renderInvoices();out.onlyTests=document.querySelectorAll('#entw-list .entw-row').length===1;
    viewInvoice(test.id);editInvoice();document.getElementById('inv-vortext').value='Bearbeiteter Test';await saveInvoice();closeModal('modal-invview');
    out.editTest=entw.find(e=>e.id===test.id).vortext==='Bearbeiteter Test';
    viewInvoice(kv.id);kvToInvoice();await saveInvoice();closeModal('modal-invview');
    out.kvToInvoice=invoices.length===2 && new Set(invoices.map(e=>e.nr)).size===2 && entw.includes(kv);
    viewInvoice(invoices[0].id);invoiceToKv();await saveInvoice();closeModal('modal-invview');
    out.invoiceCopy=entw.filter(e=>e.kind==='kv').length===2 && invoices.length===2;
    const oldConfirm=window.kaConfirm;window.kaConfirm=async()=>true;
    viewInvoice(test.id);await deleteInvoice();window.kaConfirm=oldConfirm;
    out.deleteTest=!entw.some(e=>e.id===test.id) && invoices.length===2;
    fillNavMenu();out.menuGroups=document.querySelectorAll('#nav-menu .nav-section').length===5;
    out.settingsGroups=document.querySelectorAll('#tab-settings .settings-section').length===5;
    openInvoice(p);invDocumentChanged('kv');out.kindSwitch=invMode==='kv' && document.getElementById('inv-title').textContent.includes('Kostenvoranschlag');
    closeModal('modal-inv');
    return out;
  });
  for(const [key,value] of Object.entries(checks)) assert.equal(value,true,key);
  for(const width of [390,760,1280]) {
    await page.setViewportSize({width,height:900});
    await page.evaluate(()=>{switchTab('rechnungen');invTab='rechnung';renderInvoices();openInvoice(patients[0]);});
    const geometry=await page.evaluate(()=>{
      const a=document.getElementById('inv-flt').getBoundingClientRect(),b=document.getElementById('inv-b-new').getBoundingClientRect();
      const modal=document.querySelector('#modal-inv .modal-box');
      return {sameIcons:Math.abs(a.width-b.width)<1 && Math.abs(a.height-b.height)<1,noOverflow:modal.scrollWidth<=modal.clientWidth+1};
    });
    assert.equal(geometry.sameIcons,true,'equal icon sizes '+width);
    assert.equal(geometry.noOverflow,true,'invoice modal overflow '+width);
    await page.evaluate(()=>closeModal('modal-inv'));
  }
  assert.deepEqual(errors,[]);
  console.log('Layout and invoice checks OK',checks);
} finally {await browser.close();}
