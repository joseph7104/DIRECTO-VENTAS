import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export const MESES = [
  { id: 1, nombre: 'ENERO', short: 'Ene' },
  { id: 2, nombre: 'FEBRERO', short: 'Feb' },
  { id: 3, nombre: 'MARZO', short: 'Mar' },
  { id: 4, nombre: 'ABRIL', short: 'Abr' },
  { id: 5, nombre: 'MAYO', short: 'May' },
  { id: 6, nombre: 'JUNIO', short: 'Jun' },
  { id: 7, nombre: 'JULIO', short: 'Jul' },
  { id: 8, nombre: 'AGOSTO', short: 'Ago' },
  { id: 9, nombre: 'SETIEMBRE', short: 'Set' },
  { id: 10, nombre: 'OCTUBRE', short: 'Oct' },
  { id: 11, nombre: 'NOVIEMBRE', short: 'Nov' },
  { id: 12, nombre: 'DICIEMBRE', short: 'Dic' },
];

// ─── Formatters ────────────────────────────────────────────────────────────────
const formatSoles = (val) => `S/ ${Math.round(val || 0).toLocaleString('en-US')}`;
const formatNum   = (val) => Math.round(val || 0).toLocaleString('en-US');
const formatTck   = (val) => `S/ ${Number(val || 0).toFixed(1)}`;

// ─── Period key helpers ────────────────────────────────────────────────────────
const getKey = (p, periodType) =>
  periodType === 'semana' ? `${p.anio}_sem_${p.semana}` : `${p.anio}_${p.mes}`;

const getPeriodLabel = (sortedPeriods, periodType) => {
  if (periodType === 'semana') {
    return sortedPeriods.length === 1
      ? `Semana ${sortedPeriods[0].semana} ${sortedPeriods[0].anio}`
      : `${sortedPeriods.length} Semanas Seleccionadas`;
  }
  return sortedPeriods.length === 1
    ? `${MESES.find((m) => m.id === sortedPeriods[0].mes)?.nombre} ${sortedPeriods[0].anio}`
    : `${sortedPeriods.length} Meses Seleccionados`;
};

// ─── In-memory cache of full aggregated datasets (5 min TTL) ─────────────────
let _cacheMensual = null;  // { data, ts }
let _cacheSemanal = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

async function getResumenSemanal() {
  if (_cacheSemanal && Date.now() - _cacheSemanal.ts < CACHE_TTL_MS) {
    return _cacheSemanal.data;
  }
  const { data, error } = await supabase.rpc('get_resumen_semanal_full');
  if (error) throw new Error(`get_resumen_semanal_full: ${error.message}`);
  _cacheSemanal = { data: data || [], ts: Date.now() };
  return _cacheSemanal.data;
}

async function getResumenMensual() {
  if (_cacheMensual && Date.now() - _cacheMensual.ts < CACHE_TTL_MS) {
    return _cacheMensual.data;
  }
  const { data, error } = await supabase.rpc('get_resumen_mensual_full');
  if (error) throw new Error(`get_resumen_mensual_full: ${error.message}`);
  _cacheMensual = { data: data || [], ts: Date.now() };
  return _cacheMensual.data;
}

// ─── Available periods from DB (no hardcoding) ────────────────────────────────
export async function fetchMesesDisponibles() {
  if (!isSupabaseConfigured) return [];
  try {
    const rows = await getResumenMensual();
    const unique = [];
    const seen = new Set();
    rows.forEach((r) => {
      const key = `${r.anio}_${r.mes}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push({ anio: r.anio, mes: r.mes });
      }
    });
    return unique.sort((a, b) => b.anio !== a.anio ? b.anio - a.anio : b.mes - a.mes);
  } catch (err) {
    console.warn('fetchMesesDisponibles fallback to rpc:', err);
    const { data } = await supabase.rpc('get_meses_disponibles');
    return data || [];
  }
}

export async function fetchSemanasDisponibles() {
  if (!isSupabaseConfigured) return [];
  try {
    const rows = await getResumenSemanal();
    const unique = [];
    const seen = new Set();
    rows.forEach((r) => {
      const key = `${r.anio}_${r.semana}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push({ anio: r.anio, semana: r.semana });
      }
    });
    return unique.sort((a, b) => b.anio !== a.anio ? b.anio - a.anio : b.semana - a.semana);
  } catch (err) {
    console.warn('fetchSemanasDisponibles fallback to rpc:', err);
    const { data } = await supabase.rpc('get_semanas_disponibles');
    return data || [];
  }
}

// Legacy alias kept for pages that call fetchPeriodosDisponibles
export async function fetchPeriodosDisponibles() {
  return fetchMesesDisponibles();
}

// ─── Table headers builder ─────────────────────────────────────────────────────
function generateTableHeaders(sortedPeriods, periodType = 'mes') {
  const isMultipleYears = new Set(sortedPeriods.map((p) => p.anio)).size > 1;

  const buildCols = (prefix) => [
    { key: `ingreso_${prefix}`,   label: 'Ingreso' },
    { key: `nro_src_${prefix}`,   label: 'Nro. Src' },
    { key: `tck_prom_${prefix}`,  label: 'Tck. Prom' },
  ];

  if (periodType === 'semana') {
    const groupHeaders = [
      { label: '', colSpan: 1 },
      ...sortedPeriods.map((p) => ({
        label: isMultipleYears ? `SEMANA ${p.semana} ${p.anio}` : `SEMANA ${p.semana}`,
        colSpan: 3,
        highlight: false,
        key: getKey(p, periodType),
      })),
      { label: 'TOTAL', colSpan: 3, highlight: true, key: 'total' },
    ];
    const columns = [
      { key: 'name', label: 'Nombre Semana Año', width: '220px', fixed: true },
      ...sortedPeriods.flatMap((p) => buildCols(getKey(p, periodType))),
      ...buildCols('total'),
    ];
    return { groupHeaders, columns };
  }

  const groupHeaders = [
    { label: '', colSpan: 1 },
    ...sortedPeriods.map((p) => {
      const mObj = MESES.find((m) => m.id === p.mes);
      return {
        label: isMultipleYears ? `${mObj?.nombre || 'MES'} ${p.anio}` : `${mObj?.nombre || 'MES'}`,
        colSpan: 3,
        highlight: false,
        key: getKey(p, periodType),
      };
    }),
    { label: 'TOTAL', colSpan: 3, highlight: true, key: 'total' },
  ];
  const columns = [
    { key: 'name', label: 'Nombre del mes Año', width: '220px', fixed: true },
    ...sortedPeriods.flatMap((p) => buildCols(getKey(p, periodType))),
    ...buildCols('total'),
  ];
  return { groupHeaders, columns };
}

// ─── Normalise negocio/val strings coming from DB ─────────────────────────────
function normaliseNegocio(raw) {
  const n = (raw || '').trim().toUpperCase();
  if (n.includes('AEROPUERTO')) return 'Aeropuerto';
  if (n === 'CIUDAD' || n === 'URBANO' || n === 'DESTINO') return 'Ciudad';
  if (n.includes('AEROL')) return 'Aerolíneas';
  if (n.includes('COSTA') && n.includes('SOL')) return 'Flit - Costa del Sol';
  if (n.includes('FLIT') && n.includes('DIRECTO')) return 'Flit - Directo';
  if (n === 'FLIT') return 'Flit';
  if (n.includes('LOGISTIC')) return 'Logistic';
  if (n.includes('MIGO')) return 'Migo';
  return raw;
}

function normaliseVal(rawVal, rawNeg) {
  const v = (rawVal || '').trim().toUpperCase();
  const n = (rawNeg || '').trim().toUpperCase();
  if (v.includes('KUSI')) return 'Kusi';
  if (v.includes('WARI')) return 'Wari + Wally';
  if (v.includes('DESTINO') || n === 'DESTINO') return 'Destino';
  if (v.includes('URBANO') || n === 'URBANO') return 'Urbano';
  if (v.includes('JETSMART')) return 'Jetsmart';
  if (v.includes('LATAM')) return 'Latam';
  if (v.includes('SKY')) return 'Sky';
  if (v.includes('COSTA') && v.includes('SOL')) return 'Flit - Costa del Sol';
  if (v.includes('COSTE')) return 'Coste Ventas';
  if (v.includes('INGRESO')) return 'Ingresos Ventas';
  if (v === 'FLIT') return 'Flit';
  if (v.includes('LOGISTIC')) return 'Logistic';
  if (v.includes('MIGO')) return 'Migo1';
  return rawVal;
}

// Filter aggregated rows to only matching selections
function filterRows(allRows, selections, periodType) {
  return allRows.filter((r) => {
    return selections.some((s) => {
      if (s.anio !== r.anio) return false;
      return periodType === 'semana' ? s.semana === r.semana : s.mes === r.mes;
    });
  });
}

// ─── Generic accumulator ──────────────────────────────────────────────────────
function accum(bucket, pKey, ingreso, servicios) {
  if (!bucket[pKey]) bucket[pKey] = { ingreso: 0, servicios: 0 };
  bucket[pKey].ingreso   += ingreso;
  bucket[pKey].servicios += servicios;
}

// Build formatted cell values for one period bucket
function cellsForPeriod(bucket, pKey) {
  const d = bucket[pKey] || { ingreso: 0, servicios: 0 };
  return {
    [`ingreso_${pKey}`]:  formatSoles(d.ingreso),
    [`nro_src_${pKey}`]:  formatNum(d.servicios),
    [`tck_prom_${pKey}`]: formatTck(d.servicios > 0 ? d.ingreso / d.servicios : 0),
  };
}

function totalCells(allPeriodBuckets, sortedPeriods, periodType) {
  let ing = 0, srv = 0;
  sortedPeriods.forEach((p) => {
    const d = allPeriodBuckets[getKey(p, periodType)] || {};
    ing += d.ingreso || 0;
    srv += d.servicios || 0;
  });
  return {
    ingreso_total:  formatSoles(ing),
    nro_src_total:  formatNum(srv),
    tck_prom_total: formatTck(srv > 0 ? ing / srv : 0),
    _rawIngreso:    ing,
    _rawServicios:  srv,
  };
}

// ─── 1. INGRESOS TOTALES ──────────────────────────────────────────────────────
export async function fetchIngresosTotalesMulti(
  selections = [{ anio: 2026, mes: 6 }],
  periodType = 'mes'
) {
  const sortedPeriods = [...selections].sort((a, b) => {
    if (a.anio !== b.anio) return a.anio - b.anio;
    return periodType === 'semana' ? a.semana - b.semana : a.mes - b.mes;
  });

  const allRows = periodType === 'semana'
    ? await getResumenSemanal(sortedPeriods)
    : await getResumenMensual(sortedPeriods);

  const rows = filterRows(allRows, sortedPeriods, periodType);

  const allowed = {
    Aeropuerto: ['Kusi', 'Wari + Wally'],
    Ciudad:     ['Destino', 'Urbano'],
    Aerolíneas: ['Jetsmart', 'Latam', 'Sky'],
  };

  // tree: negocio -> val -> pKey -> { ingreso, servicios }
  const tree = {};
  Object.keys(allowed).forEach((neg) => {
    tree[neg] = {};
    allowed[neg].forEach((v) => { tree[neg][v] = {}; });
  });

  const grandByPeriod = {};
  sortedPeriods.forEach((p) => { grandByPeriod[getKey(p, periodType)] = { ingreso: 0, servicios: 0 }; });

  rows.forEach((r) => {
    const neg = normaliseNegocio(r.negocio);
    const val = normaliseVal(r.val, r.negocio);
    const pKey = getKey(r, periodType);
    const ing = parseFloat(r.total_ingreso) || 0;
    const srv = parseInt(r.total_servicios, 10) || 0;

    if (tree[neg]?.[val] !== undefined && grandByPeriod[pKey] !== undefined) {
      accum(tree[neg][val], pKey, ing, srv);
      grandByPeriod[pKey].ingreso   += ing;
      grandByPeriod[pKey].servicios += srv;
    }
  });

  // Build node tree
  const businessNodes = Object.keys(allowed).map((negName) => {
    const negByPeriod = {};
    sortedPeriods.forEach((p) => { negByPeriod[getKey(p, periodType)] = { ingreso: 0, servicios: 0 }; });

    const valNodes = allowed[negName].map((valName) => {
      const vRow = { id: `${negName}-${valName}`, name: valName, level: 2 };
      sortedPeriods.forEach((p) => {
        const pKey = getKey(p, periodType);
        const d = tree[negName][valName][pKey] || { ingreso: 0, servicios: 0 };
        negByPeriod[pKey].ingreso   += d.ingreso;
        negByPeriod[pKey].servicios += d.servicios;
        Object.assign(vRow, cellsForPeriod(tree[negName][valName], pKey));
      });
      Object.assign(vRow, totalCells(tree[negName][valName], sortedPeriods, periodType));
      return vRow;
    });

    const nRow = { id: `neg-${negName}`, name: negName, level: 1, expandable: true, children: valNodes };
    sortedPeriods.forEach((p) => {
      Object.assign(nRow, cellsForPeriod(negByPeriod, getKey(p, periodType)));
    });
    Object.assign(nRow, totalCells(negByPeriod, sortedPeriods, periodType));
    return nRow;
  });

  const anioLabel = new Set(sortedPeriods.map((p) => p.anio)).size === 1
    ? `${sortedPeriods[0].anio}` : 'Consolidado';
  const yearRow = { id: `year-${anioLabel}`, name: anioLabel, level: 0, expandable: true, children: businessNodes };
  sortedPeriods.forEach((p) => { Object.assign(yearRow, cellsForPeriod(grandByPeriod, getKey(p, periodType))); });
  Object.assign(yearRow, totalCells(grandByPeriod, sortedPeriods, periodType));

  const totalRow = { name: 'Total General' };
  sortedPeriods.forEach((p) => { Object.assign(totalRow, cellsForPeriod(grandByPeriod, getKey(p, periodType))); });
  Object.assign(totalRow, totalCells(grandByPeriod, sortedPeriods, periodType));

  const gt = totalCells(grandByPeriod, sortedPeriods, periodType);
  const { groupHeaders, columns } = generateTableHeaders(sortedPeriods, periodType);
  const periodTitle = getPeriodLabel(sortedPeriods, periodType);

  return {
    meta: {
      title: 'Ingresos por Negocio',
      subtitle: `${periodType === 'semana' ? 'Ventas Semanales' : 'Ventas Mensuales'} - ${periodTitle}`,
      period: periodTitle,
    },
    kpis: {
      ingresoTotal:     { label: 'INGRESO TOTAL',        value: gt._rawIngreso,    formatted: formatSoles(gt._rawIngreso),    change: '', changeLabel: '', trend: 'up' },
      nroTransacciones: { label: 'NRO. TRANSACCIONES',   value: gt._rawServicios,  formatted: formatNum(gt._rawServicios),    change: '', changeLabel: '', trend: 'up' },
      ticketPromedio:   { label: 'TCK. PROMEDIO',        value: gt._rawServicios > 0 ? gt._rawIngreso / gt._rawServicios : 0, formatted: formatTck(gt._rawServicios > 0 ? gt._rawIngreso / gt._rawServicios : 0), change: '', changeLabel: '', trend: 'neutral' },
    },
    tableData: { columns, groupHeaders, rows: [yearRow], totalRow },
  };
}

// ─── 2. INGRESOS ORIGEN ───────────────────────────────────────────────────────
export async function fetchIngresosOrigen(
  selections = [{ anio: 2026, mes: 6 }],
  periodType = 'mes'
) {
  const sortedPeriods = [...selections].sort((a, b) => {
    if (a.anio !== b.anio) return a.anio - b.anio;
    return periodType === 'semana' ? a.semana - b.semana : a.mes - b.mes;
  });

  const allRows = periodType === 'semana'
    ? await getResumenSemanal(sortedPeriods)
    : await getResumenMensual(sortedPeriods);

  const rows = filterRows(allRows, sortedPeriods, periodType);

  // Structure: Aeropuerto > {Kusi, Wari+Wally} > {PARTICULAR, CORPORATIVO}
  const tree = { Kusi: {}, 'Wari + Wally': {} };
  const grandByPeriod = {};
  sortedPeriods.forEach((p) => { grandByPeriod[getKey(p, periodType)] = { ingreso: 0, servicios: 0 }; });

  rows.forEach((r) => {
    const neg = normaliseNegocio(r.negocio);
    if (neg !== 'Aeropuerto') return;
    const val = normaliseVal(r.val, r.negocio);
    if (!tree[val]) return;
    const pKey = getKey(r, periodType);
    if (grandByPeriod[pKey] === undefined) return;
    const tipo = (r.tipo_de_cliente || r.tipo_cliente || 'PARTICULAR').toString().toUpperCase().trim() || 'PARTICULAR';
    const ing = parseFloat(r.total_ingreso) || 0;
    const srv = parseInt(r.total_servicios, 10) || 0;
    if (!tree[val][tipo]) tree[val][tipo] = {};
    accum(tree[val][tipo], pKey, ing, srv);
    grandByPeriod[pKey].ingreso   += ing;
    grandByPeriod[pKey].servicios += srv;
  });

  const valNodes = ['Kusi', 'Wari + Wally'].map((vName) => {
    const vByPeriod = {};
    sortedPeriods.forEach((p) => { vByPeriod[getKey(p, periodType)] = { ingreso: 0, servicios: 0 }; });

    const tipos = vName === 'Kusi' ? ['PARTICULAR'] : ['CORPORATIVO', 'PARTICULAR'];
    const clientNodes = tipos.map((cName) => {
      const cRow = { id: `origen-${vName}-${cName}`, name: cName, level: 3 };
      sortedPeriods.forEach((p) => {
        const pKey = getKey(p, periodType);
        const d = tree[vName]?.[cName]?.[pKey] || { ingreso: 0, servicios: 0 };
        vByPeriod[pKey].ingreso   += d.ingreso;
        vByPeriod[pKey].servicios += d.servicios;
        Object.assign(cRow, cellsForPeriod(tree[vName]?.[cName] || {}, pKey));
      });
      Object.assign(cRow, totalCells(tree[vName]?.[cName] || {}, sortedPeriods, periodType));
      return cRow;
    });

    const vRow = { id: `origen-${vName}`, name: vName, level: 2, expandable: true, children: clientNodes };
    sortedPeriods.forEach((p) => { Object.assign(vRow, cellsForPeriod(vByPeriod, getKey(p, periodType))); });
    Object.assign(vRow, totalCells(vByPeriod, sortedPeriods, periodType));
    return vRow;
  });

  const aeropNode = { id: 'neg-aeropuerto', name: 'Aeropuerto', level: 1, expandable: true, children: valNodes };
  sortedPeriods.forEach((p) => { Object.assign(aeropNode, cellsForPeriod(grandByPeriod, getKey(p, periodType))); });
  Object.assign(aeropNode, totalCells(grandByPeriod, sortedPeriods, periodType));

  const anioLabel = new Set(sortedPeriods.map((p) => p.anio)).size === 1 ? `${sortedPeriods[0].anio}` : 'Consolidado';
  const yearRow = { id: `year-${anioLabel}`, name: anioLabel, level: 0, expandable: true, children: [aeropNode] };
  sortedPeriods.forEach((p) => { Object.assign(yearRow, cellsForPeriod(grandByPeriod, getKey(p, periodType))); });
  Object.assign(yearRow, totalCells(grandByPeriod, sortedPeriods, periodType));

  const totalRow = { name: 'Total Aeropuerto' };
  sortedPeriods.forEach((p) => { Object.assign(totalRow, cellsForPeriod(grandByPeriod, getKey(p, periodType))); });
  Object.assign(totalRow, totalCells(grandByPeriod, sortedPeriods, periodType));

  const gt = totalCells(grandByPeriod, sortedPeriods, periodType);
  const { groupHeaders, columns } = generateTableHeaders(sortedPeriods, periodType);
  const periodTitle = getPeriodLabel(sortedPeriods, periodType);

  return {
    meta: { title: 'Ingresos Origen (Aeropuerto)', subtitle: `Aeropuerto - Kusi, Wari + Wally y Tipo Cliente (${periodTitle})`, period: periodTitle },
    kpis: {
      ingresoTotal:     { label: 'INGRESO ORIGEN',       value: gt._rawIngreso,   formatted: formatSoles(gt._rawIngreso),  change: '', changeLabel: '', trend: 'up' },
      nroTransacciones: { label: 'NRO. TRANSACCIONES',   value: gt._rawServicios, formatted: formatNum(gt._rawServicios),  change: '', changeLabel: '', trend: 'up' },
      ticketPromedio:   { label: 'TCK. PROMEDIO',        value: gt._rawServicios > 0 ? gt._rawIngreso / gt._rawServicios : 0, formatted: formatTck(gt._rawServicios > 0 ? gt._rawIngreso / gt._rawServicios : 0), change: '', changeLabel: '', trend: 'neutral' },
    },
    tableData: { columns, groupHeaders, rows: [yearRow], totalRow },
  };
}

// ─── 3. INGRESOS CIUDAD ───────────────────────────────────────────────────────
export async function fetchIngresosCiudad(
  selections = [{ anio: 2026, mes: 6 }],
  periodType = 'mes'
) {
  const sortedPeriods = [...selections].sort((a, b) => {
    if (a.anio !== b.anio) return a.anio - b.anio;
    return periodType === 'semana' ? a.semana - b.semana : a.mes - b.mes;
  });

  const allRows = periodType === 'semana'
    ? await getResumenSemanal(sortedPeriods)
    : await getResumenMensual(sortedPeriods);

  const rows = filterRows(allRows, sortedPeriods, periodType);

  const tree = { Destino: {}, Urbano: {} };
  const grandByPeriod = {};
  sortedPeriods.forEach((p) => { grandByPeriod[getKey(p, periodType)] = { ingreso: 0, servicios: 0 }; });

  rows.forEach((r) => {
    const neg = normaliseNegocio(r.negocio);
    if (neg !== 'Ciudad') return;
    const val = normaliseVal(r.val, r.negocio);
    if (!tree[val]) return;
    const pKey = getKey(r, periodType);
    if (grandByPeriod[pKey] === undefined) return;
    const tipo = (r.tipo_de_cliente || r.tipo_cliente || 'PARTICULAR').toString().toUpperCase().trim() || 'PARTICULAR';
    const ing = parseFloat(r.total_ingreso) || 0;
    const srv = parseInt(r.total_servicios, 10) || 0;
    if (!tree[val][tipo]) tree[val][tipo] = {};
    accum(tree[val][tipo], pKey, ing, srv);
    grandByPeriod[pKey].ingreso   += ing;
    grandByPeriod[pKey].servicios += srv;
  });

  const valNodes = ['Destino', 'Urbano'].map((vName) => {
    const vByPeriod = {};
    sortedPeriods.forEach((p) => { vByPeriod[getKey(p, periodType)] = { ingreso: 0, servicios: 0 }; });

    const tipos = vName === 'Destino' ? ['PARTICULAR'] : ['CORPORATIVO', 'PARTICULAR'];
    const clientNodes = tipos.map((cName) => {
      const cRow = { id: `ciudad-${vName}-${cName}`, name: cName, level: 3 };
      sortedPeriods.forEach((p) => {
        const pKey = getKey(p, periodType);
        const d = tree[vName]?.[cName]?.[pKey] || { ingreso: 0, servicios: 0 };
        vByPeriod[pKey].ingreso   += d.ingreso;
        vByPeriod[pKey].servicios += d.servicios;
        Object.assign(cRow, cellsForPeriod(tree[vName]?.[cName] || {}, pKey));
      });
      Object.assign(cRow, totalCells(tree[vName]?.[cName] || {}, sortedPeriods, periodType));
      return cRow;
    });

    const vRow = { id: `ciudad-${vName}`, name: vName, level: 2, expandable: true, children: clientNodes };
    sortedPeriods.forEach((p) => { Object.assign(vRow, cellsForPeriod(vByPeriod, getKey(p, periodType))); });
    Object.assign(vRow, totalCells(vByPeriod, sortedPeriods, periodType));
    return vRow;
  });

  const ciudadNode = { id: 'neg-ciudad', name: 'Ciudad', level: 1, expandable: true, children: valNodes };
  sortedPeriods.forEach((p) => { Object.assign(ciudadNode, cellsForPeriod(grandByPeriod, getKey(p, periodType))); });
  Object.assign(ciudadNode, totalCells(grandByPeriod, sortedPeriods, periodType));

  const anioLabel = new Set(sortedPeriods.map((p) => p.anio)).size === 1 ? `${sortedPeriods[0].anio}` : 'Consolidado';
  const yearRow = { id: `year-${anioLabel}`, name: anioLabel, level: 0, expandable: true, children: [ciudadNode] };
  sortedPeriods.forEach((p) => { Object.assign(yearRow, cellsForPeriod(grandByPeriod, getKey(p, periodType))); });
  Object.assign(yearRow, totalCells(grandByPeriod, sortedPeriods, periodType));

  const totalRow = { name: 'Total Ciudad' };
  sortedPeriods.forEach((p) => { Object.assign(totalRow, cellsForPeriod(grandByPeriod, getKey(p, periodType))); });
  Object.assign(totalRow, totalCells(grandByPeriod, sortedPeriods, periodType));

  const gt = totalCells(grandByPeriod, sortedPeriods, periodType);
  const { groupHeaders, columns } = generateTableHeaders(sortedPeriods, periodType);
  const periodTitle = getPeriodLabel(sortedPeriods, periodType);

  return {
    meta: { title: 'Ingresos Ciudad', subtitle: `Ciudad - Destino y Urbano por Tipo Cliente (${periodTitle})`, period: periodTitle },
    kpis: {
      ingresoTotal:     { label: 'INGRESO CIUDAD',       value: gt._rawIngreso,   formatted: formatSoles(gt._rawIngreso),  change: '', changeLabel: '', trend: 'up' },
      nroTransacciones: { label: 'NRO. TRANSACCIONES',   value: gt._rawServicios, formatted: formatNum(gt._rawServicios),  change: '', changeLabel: '', trend: 'up' },
      ticketPromedio:   { label: 'TCK. PROMEDIO',        value: gt._rawServicios > 0 ? gt._rawIngreso / gt._rawServicios : 0, formatted: formatTck(gt._rawServicios > 0 ? gt._rawIngreso / gt._rawServicios : 0), change: '', changeLabel: '', trend: 'neutral' },
    },
    tableData: { columns, groupHeaders, rows: [yearRow], totalRow },
  };
}

// ─── 4. INGRESOS AEROLÍNEAS ───────────────────────────────────────────────────
export async function fetchIngresosAerolineas(
  selections = [{ anio: 2026, mes: 6 }],
  periodType = 'mes'
) {
  const sortedPeriods = [...selections].sort((a, b) => {
    if (a.anio !== b.anio) return a.anio - b.anio;
    return periodType === 'semana' ? a.semana - b.semana : a.mes - b.mes;
  });

  const allRows = periodType === 'semana'
    ? await getResumenSemanal(sortedPeriods)
    : await getResumenMensual(sortedPeriods);

  const rows = filterRows(allRows, sortedPeriods, periodType);

  const tree = { Jetsmart: {}, Latam: {}, Sky: {} };
  const grandByPeriod = {};
  sortedPeriods.forEach((p) => { grandByPeriod[getKey(p, periodType)] = { ingreso: 0, servicios: 0 }; });

  rows.forEach((r) => {
    const neg = normaliseNegocio(r.negocio);
    if (neg !== 'Aerolíneas') return;
    const val = normaliseVal(r.val, r.negocio);
    if (!tree[val]) return;
    const pKey = getKey(r, periodType);
    if (grandByPeriod[pKey] === undefined) return;
    const ing = parseFloat(r.total_ingreso) || 0;
    const srv = parseInt(r.total_servicios, 10) || 0;
    accum(tree[val], pKey, ing, srv);
    grandByPeriod[pKey].ingreso   += ing;
    grandByPeriod[pKey].servicios += srv;
  });

  const valNodes = ['Jetsmart', 'Latam', 'Sky'].map((vName) => {
    const vRow = { id: `aero-${vName}`, name: vName, level: 2 };
    sortedPeriods.forEach((p) => { Object.assign(vRow, cellsForPeriod(tree[vName], getKey(p, periodType))); });
    Object.assign(vRow, totalCells(tree[vName], sortedPeriods, periodType));
    return vRow;
  });

  const aeroNode = { id: 'neg-aerolineas', name: 'Aerolíneas', level: 1, expandable: true, children: valNodes };
  sortedPeriods.forEach((p) => { Object.assign(aeroNode, cellsForPeriod(grandByPeriod, getKey(p, periodType))); });
  Object.assign(aeroNode, totalCells(grandByPeriod, sortedPeriods, periodType));

  const anioLabel = new Set(sortedPeriods.map((p) => p.anio)).size === 1 ? `${sortedPeriods[0].anio}` : 'Consolidado';
  const yearRow = { id: `year-${anioLabel}`, name: anioLabel, level: 0, expandable: true, children: [aeroNode] };
  sortedPeriods.forEach((p) => { Object.assign(yearRow, cellsForPeriod(grandByPeriod, getKey(p, periodType))); });
  Object.assign(yearRow, totalCells(grandByPeriod, sortedPeriods, periodType));

  const totalRow = { name: 'Total Aerolíneas' };
  sortedPeriods.forEach((p) => { Object.assign(totalRow, cellsForPeriod(grandByPeriod, getKey(p, periodType))); });
  Object.assign(totalRow, totalCells(grandByPeriod, sortedPeriods, periodType));

  const gt = totalCells(grandByPeriod, sortedPeriods, periodType);
  const { groupHeaders, columns } = generateTableHeaders(sortedPeriods, periodType);
  const periodTitle = getPeriodLabel(sortedPeriods, periodType);

  return {
    meta: { title: 'Ingresos Aerolíneas', subtitle: `Aerolíneas - Jetsmart, Latam, Sky (${periodTitle})`, period: periodTitle },
    kpis: {
      ingresoTotal:     { label: 'INGRESO AEROLÍNEAS',   value: gt._rawIngreso,   formatted: formatSoles(gt._rawIngreso),  change: '', changeLabel: '', trend: 'up' },
      nroTransacciones: { label: 'NRO. TRANSACCIONES',   value: gt._rawServicios, formatted: formatNum(gt._rawServicios),  change: '', changeLabel: '', trend: 'up' },
      ticketPromedio:   { label: 'TCK. PROMEDIO',        value: gt._rawServicios > 0 ? gt._rawIngreso / gt._rawServicios : 0, formatted: formatTck(gt._rawServicios > 0 ? gt._rawIngreso / gt._rawServicios : 0), change: '', changeLabel: '', trend: 'neutral' },
    },
    tableData: { columns, groupHeaders, rows: [yearRow], totalRow },
  };
}

// ─── 5. OTROS INGRESOS ────────────────────────────────────────────────────────
export async function fetchOtrosIngresos(
  selections = [{ anio: 2026, mes: 6 }],
  periodType = 'mes'
) {
  const sortedPeriods = [...selections].sort((a, b) => {
    if (a.anio !== b.anio) return a.anio - b.anio;
    return periodType === 'semana' ? a.semana - b.semana : a.mes - b.mes;
  });

  const allRows = periodType === 'semana'
    ? await getResumenSemanal(sortedPeriods)
    : await getResumenMensual(sortedPeriods);

  const rows = filterRows(allRows, sortedPeriods, periodType);

  // Allowed structure: negocio -> [vals]
  const allowedStructure = {
    Flit:                 ['Flit'],
    'Flit - Costa del Sol': ['Flit - Costa del Sol'],
    'Flit - Directo':     ['Coste Ventas', 'Ingresos Ventas'],
    Logistic:             ['Logistic'],
    Migo:                 ['Migo1'],
  };

  const distinctYears = [...new Set(sortedPeriods.map((p) => p.anio))].sort((a, b) => a - b);
  const distinctUnits = [...new Set(sortedPeriods.map((p) =>
    periodType === 'semana' ? p.semana : p.mes
  ))].sort((a, b) => a - b);

  // dataTree[year][unit][negocio][val] = amount
  const dataTree = {};
  distinctYears.forEach((y) => {
    dataTree[y] = {};
    distinctUnits.forEach((u) => {
      dataTree[y][u] = {};
      Object.keys(allowedStructure).forEach((neg) => {
        dataTree[y][u][neg] = {};
        allowedStructure[neg].forEach((v) => { dataTree[y][u][neg][v] = 0; });
      });
    });
  });

  rows.forEach((r) => {
    const neg = normaliseNegocio(r.negocio);
    const val = normaliseVal(r.val, r.negocio);
    if (!allowedStructure[neg] || !allowedStructure[neg].includes(val)) return;
    const y   = r.anio;
    const u   = periodType === 'semana' ? r.semana : r.mes;
    const ing = parseFloat(r.total_ingreso) || 0;
    if (dataTree[y]?.[u]?.[neg]?.[val] !== undefined) {
      dataTree[y][u][neg][val] += ing;
    }
  });

  // Table columns
  const formatVal = (v) => Number(v || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const columns = [
    { key: 'name', label: 'Año', width: '220px', fixed: true },
    ...distinctUnits.map((u) => {
      if (periodType === 'semana') return { key: `unit_${u}`, label: `SEMANA ${u}` };
      const mObj = MESES.find((item) => item.id === u);
      return { key: `unit_${u}`, label: mObj?.nombre || `MES ${u}` };
    }),
    { key: 'total', label: 'TOTAL' },
  ];

  const grandByUnit = {};
  distinctUnits.forEach((u) => { grandByUnit[u] = 0; });
  let overallGrand = 0;

  const yearNodes = distinctYears.map((y) => {
    const yearByUnit = {};
    distinctUnits.forEach((u) => { yearByUnit[u] = 0; });

    const negNodes = Object.keys(allowedStructure).map((negName) => {
      const negByUnit = {};
      distinctUnits.forEach((u) => { negByUnit[u] = 0; });

      const valNodes = allowedStructure[negName].map((valName) => {
        const vRow = {
          id: `val-${y}-${negName}-${valName}`.replace(/\s+/g, '-'),
          name: valName,
          level: 2,
        };
        let vTotal = 0;
        distinctUnits.forEach((u) => {
          const amt = dataTree[y]?.[u]?.[negName]?.[valName] || 0;
          vTotal += amt;
          negByUnit[u] += amt;
          vRow[`unit_${u}`] = formatVal(amt);
        });
        vRow.total = formatVal(vTotal);
        return vRow;
      });

      const negRow = {
        id: `neg-${y}-${negName}`.replace(/\s+/g, '-'),
        name: negName,
        level: 1,
        expandable: true,
        children: valNodes,
      };
      let negTotal = 0;
      distinctUnits.forEach((u) => {
        const amt = negByUnit[u];
        negTotal   += amt;
        yearByUnit[u] += amt;
        negRow[`unit_${u}`] = formatVal(amt);
      });
      negRow.total = formatVal(negTotal);
      return negRow;
    });

    const yearRow = {
      id: `year-${y}`,
      name: String(y),
      level: 0,
      expandable: true,
      children: negNodes,
    };
    let yearTotal = 0;
    distinctUnits.forEach((u) => {
      const amt = yearByUnit[u];
      yearTotal += amt;
      grandByUnit[u] += amt;
      yearRow[`unit_${u}`] = formatVal(amt);
    });
    yearRow.total = formatVal(yearTotal);
    overallGrand += yearTotal;
    return yearRow;
  });

  const totalRow = { name: 'Total' };
  distinctUnits.forEach((u) => { totalRow[`unit_${u}`] = formatVal(grandByUnit[u]); });
  totalRow.total = formatVal(overallGrand);

  const periodTitle = getPeriodLabel(sortedPeriods, periodType);

  return {
    meta: {
      title: 'OTROS INGRESOS',
      subtitle: `Flit, Flit - Costa del Sol, Flit - Directo, Logistic, Migo (${periodTitle})`,
      period: periodTitle,
    },
    kpis: {
      ingresoTotal:     { label: 'INGRESO OTROS',        value: overallGrand, formatted: formatSoles(overallGrand), change: '', changeLabel: '', trend: 'up' },
      nroNegocios:      { label: 'NEGOCIOS ACTIVOS',     value: 5,            formatted: '5 Negocios',             change: '', changeLabel: '', trend: 'neutral' },
      promedioMensual:  {
        label: periodType === 'semana' ? 'PROMEDIO SEMANAL' : 'PROMEDIO MENSUAL',
        value: distinctUnits.length > 0 ? overallGrand / distinctUnits.length : 0,
        formatted: formatSoles(distinctUnits.length > 0 ? overallGrand / distinctUnits.length : 0),
        change: '', changeLabel: '', trend: 'neutral',
      },
    },
    tableData: { columns, rows: yearNodes, totalRow },
  };
}
