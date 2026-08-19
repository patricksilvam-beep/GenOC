/* ==========================================================================
   DATOS POR DEFECTO DE LAS EMPRESAS
   ========================================================================== */
const DEFAULT_COMPANIES = {
  global_fruit: {
    id: 'global_fruit',
    nombre: 'GLOBAL FRUIT PERU E.I.R.L.',
    razonSocial: 'GLOBAL FRUIT PERU E.I.R.L.',
    ruc: '20607947385',
    direccion: 'Av. José Larco 1301 Piso 14, Miraflores, Lima - Perú',
    telefonos: '968 419 224 / 965 206 249',
    correos: 'gerencia@globalfruitperu.com / comexglobal@globalfruitperu.com',
    logo: (typeof LOGO_GLOBAL_FRUIT !== 'undefined') ? LOGO_GLOBAL_FRUIT : '',
    // Paleta tomada del logo: azul + verde
    theme: { navy: '#0C4387', navyDark: '#08305f', accent: '#9ACB3D', accentDark: '#7fae23' }
  },
  premium_fruit: {
    id: 'premium_fruit',
    nombre: 'PREMIUM FRUIT PERU',
    razonSocial: 'PREMIUM FRUIT PERU',
    ruc: '',
    direccion: '',
    telefonos: '',
    correos: '',
    logo: (typeof LOGO_PREMIUM_FRUIT !== 'undefined') ? LOGO_PREMIUM_FRUIT : '',
    // Paleta tomada del logo: azul marino + naranja/amarillo (sol)
    theme: { navy: '#0C4387', navyDark: '#03244D', accent: '#F6A934', accentDark: '#c9791a' }
  }
};

const STORAGE_KEY = 'oc_companies_v1';

function loadCompanies(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return structuredClone(DEFAULT_COMPANIES);
    const saved = JSON.parse(raw);
    // aseguramos que siempre existan ambas empresas y el logo embebido
    const merged = structuredClone(DEFAULT_COMPANIES);
    for(const key of Object.keys(merged)){
      if(saved[key]){
        merged[key] = { ...merged[key], ...saved[key], logo: merged[key].logo, theme: merged[key].theme };
      }
    }
    return merged;
  }catch(e){
    console.warn('No se pudo leer localStorage, usando valores por defecto', e);
    return structuredClone(DEFAULT_COMPANIES);
  }
}

function saveCompanies(companies){
  const toSave = {};
  for(const key of Object.keys(companies)){
    const { logo, theme, ...rest } = companies[key];
    toSave[key] = rest; // no guardamos el logo ni el tema (siempre vienen del código)
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
}

let companies = loadCompanies();

/* ==========================================================================
   NAVEGACIÓN DE TABS
   ========================================================================== */
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

/* ==========================================================================
   TAB EMPRESAS
   ========================================================================== */
function renderCompanyGrid(){
  const grid = document.getElementById('companyGrid');
  grid.innerHTML = '';

  Object.values(companies).forEach(c => {
    const card = document.createElement('div');
    card.className = 'company-card';
    card.style.setProperty('--card-accent', c.theme.accent);
    card.innerHTML = `
      <div class="company-card-logo"><img src="${c.logo}" alt="${c.nombre}"></div>
      <div class="field">
        <label>Razón Social</label>
        <input type="text" data-company="${c.id}" data-field="razonSocial" value="${escapeHtml(c.razonSocial)}">
      </div>
      <div class="field">
        <label>RUC</label>
        <input type="text" data-company="${c.id}" data-field="ruc" value="${escapeHtml(c.ruc)}">
      </div>
      <div class="field">
        <label>Dirección</label>
        <textarea rows="2" data-company="${c.id}" data-field="direccion">${escapeHtml(c.direccion)}</textarea>
      </div>
      <div class="field">
        <label>Teléfonos</label>
        <input type="text" data-company="${c.id}" data-field="telefonos" value="${escapeHtml(c.telefonos)}">
      </div>
      <div class="field">
        <label>Correos</label>
        <textarea rows="2" data-company="${c.id}" data-field="correos">${escapeHtml(c.correos)}</textarea>
      </div>
    `;
    grid.appendChild(card);
  });

  grid.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('input', () => {
      const id = el.dataset.company;
      const field = el.dataset.field;
      companies[id][field] = el.value;
      saveCompanies(companies);
      // si la empresa editada es la seleccionada actualmente en la orden, refrescamos
      if(document.getElementById('empresaSelect').value === id){
        fillCompanyFields(id);
      }
    });
  });
}

function escapeHtml(str){
  return (str || '').replace(/[&<>"']/g, m => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[m]));
}

/* ==========================================================================
   SELECCIÓN DE EMPRESA EN LA ORDEN
   ========================================================================== */
const empresaSelect = document.getElementById('empresaSelect');
empresaSelect.addEventListener('change', () => {
  fillCompanyFields(empresaSelect.value);
  const c = companies[empresaSelect.value];
  empresaSelect.style.borderColor = c ? c.theme.accentDark : '';
  empresaSelect.style.boxShadow = c ? `0 0 0 3px ${c.theme.accent}33` : '';
});

function fillCompanyFields(id){
  const c = companies[id];
  if(!c){
    document.getElementById('empRazonSocial').value = '';
    document.getElementById('empRuc').value = '';
    document.getElementById('empDireccion').value = '';
    document.getElementById('empTelefonos').value = '';
    document.getElementById('empCorreos').value = '';
    return;
  }
  document.getElementById('empRazonSocial').value = c.razonSocial;
  document.getElementById('empRuc').value = c.ruc;
  document.getElementById('empDireccion').value = c.direccion;
  document.getElementById('empTelefonos').value = c.telefonos;
  document.getElementById('empCorreos').value = c.correos;
}

/* ==========================================================================
   ÍTEMS DE LA ORDEN
   ========================================================================== */
const itemsBody = document.getElementById('itemsBody');
let itemCounter = 0;

function addItemRow(prefill){
  itemCounter++;
  const tr = document.createElement('tr');
  tr.dataset.rowId = itemCounter;
  tr.innerHTML = `
    <td class="col-item">${itemCounter}</td>
    <td class="col-desc"><input type="text" class="f-desc" placeholder="Descripción del producto o servicio"></td>
    <td class="col-unidad"><input type="text" class="f-unidad" placeholder="Kg / Caja / Unid."></td>
    <td class="col-cant"><input type="number" class="f-cant" min="0" step="0.01" value="0"></td>
    <td class="col-precio"><input type="number" class="f-precio" min="0" step="0.01" value="0"></td>
    <td class="col-importe"><input type="text" class="f-importe" readonly value="0.00"></td>
    <td class="col-actions"><button type="button" class="row-del-btn" title="Eliminar fila">✕</button></td>
  `;
  itemsBody.appendChild(tr);

  const cant = tr.querySelector('.f-cant');
  const precio = tr.querySelector('.f-precio');
  const importe = tr.querySelector('.f-importe');

  function recalcRow(){
    const val = (parseFloat(cant.value) || 0) * (parseFloat(precio.value) || 0);
    importe.value = val.toFixed(2); // valor "crudo" para cálculos internos
    importe.dataset.raw = val;
    recalcTotals();
  }
  cant.addEventListener('input', recalcRow);
  precio.addEventListener('input', recalcRow);

  tr.querySelector('.row-del-btn').addEventListener('click', () => {
    tr.remove();
    renumberRows();
    recalcTotals();
  });
}

function renumberRows(){
  [...itemsBody.querySelectorAll('tr')].forEach((tr, idx) => {
    tr.querySelector('.col-item').textContent = idx + 1;
  });
}

document.getElementById('btnAddItem').addEventListener('click', () => addItemRow());

// filas iniciales (10, como la plantilla)
for(let i = 0; i < 10; i++) addItemRow();

/* ==========================================================================
   TOTALES
   ========================================================================== */
function formatNumber(value){
  return (parseFloat(value) || 0).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function recalcTotals(){
  let subtotal = 0;
  itemsBody.querySelectorAll('.f-importe').forEach(inp => {
    subtotal += parseFloat(inp.value) || 0;
  });
  const igv = subtotal * 0.18;
  const otros = parseFloat(document.getElementById('otrosCargos').value) || 0;
  const total = subtotal + igv + otros;

  const moneda = document.getElementById('moneda').value || 'S/';
  document.getElementById('subtotal').value = `${moneda} ${formatNumber(subtotal)}`;
  document.getElementById('igv').value = `${moneda} ${formatNumber(igv)}`;
  document.getElementById('total').value = `${moneda} ${formatNumber(total)}`;
}
document.getElementById('otrosCargos').addEventListener('input', recalcTotals);
document.getElementById('moneda').addEventListener('change', recalcTotals);
recalcTotals();

/* ==========================================================================
   LIMPIAR FORMULARIO
   ========================================================================== */
document.getElementById('btnLimpiar').addEventListener('click', () => {
  if(!confirm('¿Seguro que deseas limpiar todo el formulario de la orden de compra?')) return;
  document.getElementById('ordenForm').reset();
  itemsBody.innerHTML = '';
  itemCounter = 0;
  for(let i = 0; i < 10; i++) addItemRow();
  recalcTotals();
});

/* ==========================================================================
   GENERAR PDF
   ========================================================================== */
function fmtDate(value){
  if(!value) return '____ / ____ / ______';
  const [y, m, d] = value.split('-');
  return `${d} / ${m} / ${y}`;
}
function fmtMoneyPlain(moneda, value){
  return `${moneda} ${formatNumber(value)}`;
}
function val(id){ return document.getElementById(id).value || ''; }

document.getElementById('btnGenerarPdf').addEventListener('click', () => {
  const empresaId = empresaSelect.value;
  if(!empresaId){
    alert('Por favor selecciona la empresa emisora de la orden de compra.');
    document.querySelector('.tab-btn[data-tab="orden"]').click();
    empresaSelect.focus();
    return;
  }
  if(!val('ocNumero').trim()){
    alert('Por favor ingresa el N.° de Orden de Compra.');
    document.getElementById('ocNumero').focus();
    return;
  }

  const c = companies[empresaId];
  const moneda = val('moneda') || 'S/';

  // ---- Paleta de colores según el logo de la empresa
  const docPage = document.getElementById('docPage');
  docPage.style.setProperty('--doc-navy', c.theme.navy);
  docPage.style.setProperty('--doc-navy-dark', c.theme.navyDark);
  docPage.style.setProperty('--doc-accent', c.theme.accent);
  docPage.style.setProperty('--doc-accent-dark', c.theme.accentDark);

  // ---- Header
  document.getElementById('docLogo').src = c.logo;
  document.getElementById('docOcNumero').textContent = val('ocNumero');
  document.getElementById('docFecha').textContent = fmtDate(val('fechaEmision'));
  document.getElementById('docMoneda').textContent = moneda;

  // ---- Datos empresa / proveedor
  document.getElementById('docBoxEmpresaTitle').textContent = `DATOS DE ${c.nombre}`;
  document.getElementById('docEmpRazon').textContent = val('empRazonSocial');
  document.getElementById('docEmpRuc').textContent = val('empRuc');
  document.getElementById('docEmpDireccion').textContent = val('empDireccion');
  document.getElementById('docEmpTelefonos').textContent = val('empTelefonos');
  document.getElementById('docEmpCorreos').textContent = val('empCorreos');

  document.getElementById('docProvRazon').textContent = val('provRazonSocial');
  document.getElementById('docProvRuc').textContent = val('provRuc');
  document.getElementById('docProvDireccion').textContent = val('provDireccion');
  document.getElementById('docProvContacto').textContent = val('provContacto');
  document.getElementById('docProvTelefono').textContent = val('provTelefono');
  document.getElementById('docProvCorreo').textContent = val('provCorreo');

  // ---- Ítems
  const docItemsBody = document.getElementById('docItemsBody');
  docItemsBody.innerHTML = '';
  const rows = itemsBody.querySelectorAll('tr');
  const rowCount = Math.max(rows.length, 10); // mínimo 10 filas visuales como la plantilla
  for(let i = 0; i < rowCount; i++){
    const tr = rows[i];
    const desc = tr ? tr.querySelector('.f-desc').value : '';
    const unidad = tr ? tr.querySelector('.f-unidad').value : '';
    const cant = tr ? tr.querySelector('.f-cant').value : '';
    const precio = tr ? tr.querySelector('.f-precio').value : '';
    const importe = tr ? tr.querySelector('.f-importe').value : '';

    const cantNum = parseFloat(cant) || 0;
    const precioNum = parseFloat(precio) || 0;

    const docTr = document.createElement('tr');
    docTr.innerHTML = `
      <td class="w-item">${i + 1}</td>
      <td class="w-desc">${escapeHtml(desc)}</td>
      <td class="w-unidad">${escapeHtml(unidad)}</td>
      <td class="w-cant">${cantNum ? cantNum : ''}</td>
      <td class="w-precio">${precioNum ? fmtMoneyPlain(moneda, precioNum) : ''}</td>
      <td class="w-importe">${importe && parseFloat(importe) ? fmtMoneyPlain(moneda, importe) : ''}</td>
    `;
    docItemsBody.appendChild(docTr);
  }

  // ---- Condiciones comerciales
  document.getElementById('docFormaPago').textContent = val('formaPago');
  document.getElementById('docPlazoPago').textContent = val('plazoPago');
  document.getElementById('docPlazoEntrega').textContent = val('plazoEntrega');
  document.getElementById('docLugarEntrega').textContent = val('lugarEntrega');

  // ---- Resumen de importes
  document.getElementById('docSubtotal').textContent = val('subtotal');
  document.getElementById('docIgv').textContent = val('igv');
  document.getElementById('docOtros').textContent = fmtMoneyPlain(moneda, val('otrosCargos'));
  document.getElementById('docTotal').textContent = val('total');

  // ---- Información adicional
  document.getElementById('docCotizacionRef').textContent = val('cotizacionRef');
  document.getElementById('docObservaciones').textContent = val('observaciones');

  // ---- Firmas
  document.getElementById('docElabNombre').textContent = val('elabNombre');
  document.getElementById('docElabCargo').textContent = val('elabCargo');
  document.getElementById('docElabFecha').textContent = fmtDate(val('elabFecha'));

  document.getElementById('docRevNombre').textContent = val('revNombre');
  document.getElementById('docRevCargo').textContent = val('revCargo');
  document.getElementById('docRevFecha').textContent = fmtDate(val('revFecha'));

  document.getElementById('docAprNombre').textContent = val('aprNombre');
  document.getElementById('docAprCargo').textContent = val('aprCargo');
  document.getElementById('docAprFecha').textContent = fmtDate(val('aprFecha'));

  // ---- Notas
  document.getElementById('docFacturarA').textContent = c.nombre;

  // ---- Generar PDF
  const btn = document.getElementById('btnGenerarPdf');
  const originalText = btn.textContent;
  btn.disabled = true;
  btn.textContent = '⏳ Generando PDF...';

  const fileName = `Orden_Compra_${val('ocNumero').replace(/[^\w-]+/g,'_') || 'sin_numero'}.pdf`;

  generarPdfDesdeDoc(docPage, fileName)
    .catch(err => {
      console.error(err);
      alert('Ocurrió un error generando el PDF. Intenta nuevamente.\n\nDetalle: ' + (err && err.message ? err.message : err));
    })
    .finally(() => {
      btn.disabled = false;
      btn.textContent = originalText;
    });
});

/* --------------------------------------------------------------------------
   Genera el PDF a partir de la plantilla oculta, garantizando que TODO el
   contenido entre en una sola hoja A4 (se escala la imagen completa para
   que se ajuste a la página, en vez de dejar que se corte en varias hojas).

   Usa html2canvas + jsPDF directamente (librerías por separado, cargadas en
   index.html), en vez de html2pdf.js: es más simple, predecible y evita
   los problemas de captura en blanco que dio el motor interno de
   html2pdf.bundle.min.js.

   CÓMO SE CAPTURA EL DOCUMENTO (importante):
   La plantilla original (#printArea) vive fuera de la pantalla
   (left:-99999px) para no molestar visualmente. html2canvas no puede
   capturar de forma fiable un elemento tan lejos del viewport (queda fuera
   de su "ventana" de renderizado y produce un canvas 0x0). Por eso, justo
   antes de capturar, clonamos la plantilla ya rellenada y la insertamos
   TEMPORALMENTE en una posición normal en pantalla (0,0), pero la tapamos
   con una pantalla de carga a pantalla completa ("Generando PDF...") con
   un z-index mayor. Así html2canvas captura el clon correctamente (está en
   una posición real y visible del documento) y el usuario nunca ve el
   destello, porque queda debajo de la pantalla de carga. Al terminar, se
   elimina tanto el clon como la pantalla de carga.
   -------------------------------------------------------------------------- */
async function generarPdfDesdeDoc(docPageTemplate, fileName){
  if(typeof html2canvas !== 'function'){
    throw new Error('No se cargó la librería html2canvas (revisa tu conexión a internet o el bloqueo de scripts externos).');
  }
  if(!window.jspdf || typeof window.jspdf.jsPDF !== 'function'){
    throw new Error('No se cargó la librería jsPDF (revisa tu conexión a internet o el bloqueo de scripts externos).');
  }

  // 1) Pantalla de carga a pantalla completa (tapa el clon mientras se genera)
  const overlay = document.createElement('div');
  overlay.style.cssText = [
    'position:fixed', 'inset:0', 'background:#f2f4f7', 'z-index:999999',
    'display:flex', 'align-items:center', 'justify-content:center',
    "font-family:'Segoe UI',Roboto,Arial,sans-serif", 'font-size:16px',
    'color:#0C4387', 'font-weight:700'
  ].join(';');
  overlay.textContent = '⏳ Generando PDF...';
  document.body.appendChild(overlay);

  // 2) Clon visible en una posición normal de pantalla (0,0), pero debajo
  //    del overlay, así que el usuario no lo ve.
  const clone = docPageTemplate.cloneNode(true);
  clone.removeAttribute('id');
  clone.style.position = 'fixed';
  clone.style.top = '0';
  clone.style.left = '0';
  clone.style.margin = '0';
  clone.style.zIndex = '999998';
  document.body.appendChild(clone);

  try{
    // Esperar a que el logo del clon esté completamente decodificado.
    const logoImg = clone.querySelector('img');
    if(logoImg && logoImg.src){
      try{ await logoImg.decode(); }catch(e){ /* si falla el decode, seguimos igual */ }
    }

    // Esperar dos frames de animación para asegurar que el navegador ya
    // insertó y pintó el clon por completo antes de capturarlo.
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    const canvas = await html2canvas(clone, {
      scale: 3,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false
    });

    if(!canvas || canvas.width === 0 || canvas.height === 0){
      throw new Error('La captura del documento salió vacía (0x0). Prueba recargando la página (Ctrl+Shift+R) y vuelve a intentar.');
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Escalamos la imagen completa del documento para que quepa entera en
    // UNA sola página A4, manteniendo su proporción (sin cortes ni páginas extra).
    const canvasRatio = canvas.height / canvas.width;
    let imgWidth = pageWidth;
    let imgHeight = imgWidth * canvasRatio;
    if(imgHeight > pageHeight){
      imgHeight = pageHeight;
      imgWidth = imgHeight / canvasRatio;
    }
    const x = (pageWidth - imgWidth) / 2;
    const y = (pageHeight - imgHeight) / 2;

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight, undefined, 'FAST');
    pdf.save(fileName);
  } finally {
    clone.remove();
    overlay.remove();
  }
}

/* ==========================================================================
   INIT
   ========================================================================== */
renderCompanyGrid();