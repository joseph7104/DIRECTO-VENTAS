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

const formatSoles = (val) => `S/ ${Math.round(val || 0).toLocaleString('en-US')}`;
const formatNum = (val) => Math.round(val || 0).toLocaleString('en-US');
const formatTck = (val) => `S/ ${Number(val || 0).toFixed(1)}`;

/**
 * Fetch available periods from DB
 */
export async function fetchPeriodosDisponibles() {
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.rpc('get_periodos_disponibles');
      if (!error && data && data.length > 0) {
        return data;
      }
    } catch (err) {
      console.warn('Error fetching periodos:', err);
    }
  }

  return [
    { anio: 2026, mes: 8 },
    { anio: 2026, mes: 7 },
    { anio: 2026, mes: 6 },
    { anio: 2026, mes: 5 },
    { anio: 2026, mes: 4 },
    { anio: 2026, mes: 3 },
    { anio: 2026, mes: 2 },
    { anio: 2026, mes: 1 },
    { anio: 2025, mes: 12 },
    { anio: 2025, mes: 11 },
    { anio: 2025, mes: 10 },
    { anio: 2025, mes: 9 },
    { anio: 2025, mes: 8 },
    { anio: 2025, mes: 7 },
    { anio: 2025, mes: 6 },
    { anio: 2025, mes: 5 },
    { anio: 2025, mes: 4 },
    { anio: 2025, mes: 3 },
    { anio: 2025, mes: 2 },
    { anio: 2025, mes: 1 },
  ];
}

/**
 * Helper to generate dynamic table columns and groupHeaders for each selected month + Total
 */
function generateTableHeaders(sortedPeriods) {
  const isMultipleYears = new Set(sortedPeriods.map((p) => p.anio)).size > 1;

  const groupHeaders = [
    { label: '', colSpan: 1 },
    ...sortedPeriods.map((p) => {
      const mObj = MESES.find((m) => m.id === p.mes);
      const label = isMultipleYears
        ? `${mObj?.nombre || 'MES'} ${p.anio}`
        : `${mObj?.nombre || 'MES'}`;
      return { label, colSpan: 3, highlight: false, key: `${p.anio}_${p.mes}` };
    }),
    { label: 'TOTAL', colSpan: 3, highlight: true, key: 'total' },
  ];

  const columns = [
    { key: 'name', label: 'Nombre del mes Año', width: '220px', fixed: true },
  ];

  sortedPeriods.forEach((p) => {
    const keyPrefix = `${p.anio}_${p.mes}`;
    columns.push(
      { key: `ingreso_${keyPrefix}`, label: 'Ingreso' },
      { key: `nro_src_${keyPrefix}`, label: 'Nro. Src' },
      { key: `tck_prom_${keyPrefix}`, label: 'Tck. Prom' }
    );
  });

  columns.push(
    { key: 'ingreso_total', label: 'Ingreso' },
    { key: 'nro_src_total', label: 'Nro. Src' },
    { key: 'tck_prom_total', label: 'Tck. Prom' }
  );

  return { groupHeaders, columns };
}

/**
 * 1. INGRESOS TOTALES (Foto 1)
 */
export async function fetchIngresosTotalesMulti(selections = [{ anio: 2026, mes: 6 }]) {
  const sortedPeriods = [...selections].sort((a, b) =>
    a.anio !== b.anio ? a.anio - b.anio : a.mes - b.mes
  );
  const anios = [...new Set(sortedPeriods.map((s) => s.anio))];
  const meses = [...new Set(sortedPeriods.map((s) => s.mes))];

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.rpc('get_ingresos_totales', {
        p_anios: anios,
        p_meses: meses,
      });
      if (error) {
        console.error('Error in get_ingresos_totales RPC:', error);
      } else if (data) {
        return buildTotalesMultiDashboard(data, sortedPeriods);
      }
    } catch (err) {
      console.warn('Error fetching ingresos totales RPC:', err);
    }
  }

  const fallback = [
    { anio: 2026, mes: 6, negocio: 'Aeropuerto', val: 'Kusi', ingreso: 887970.0, nro_src: 12194, tck_prom: 72.8 },
    { anio: 2026, mes: 6, negocio: 'Aeropuerto', val: 'Wari + Wally', ingreso: 728738.64, nro_src: 8968, tck_prom: 81.3 },
    { anio: 2026, mes: 6, negocio: 'Ciudad', val: 'Destino', ingreso: 511664.35, nro_src: 6322, tck_prom: 80.9 },
    { anio: 2026, mes: 6, negocio: 'Ciudad', val: 'Urbano', ingreso: 856999.72, nro_src: 15378, tck_prom: 55.7 },
    { anio: 2026, mes: 6, negocio: 'Aerolíneas', val: 'Jetsmart', ingreso: 165739.0, nro_src: 2856, tck_prom: 58.0 },
    { anio: 2026, mes: 6, negocio: 'Aerolíneas', val: 'Latam', ingreso: 922356.0, nro_src: 14927, tck_prom: 61.8 },
    { anio: 2026, mes: 6, negocio: 'Aerolíneas', val: 'Sky', ingreso: 330381.64, nro_src: 5964, tck_prom: 55.4 },
  ];
  return buildTotalesMultiDashboard(fallback, sortedPeriods);
}

function buildTotalesMultiDashboard(rows, sortedPeriods) {
  const allowed = {
    Aeropuerto: ['Kusi', 'Wari + Wally'],
    Ciudad: ['Destino', 'Urbano'],
    Aerolíneas: ['Jetsmart', 'Latam', 'Sky'],
  };

  const { groupHeaders, columns } = generateTableHeaders(sortedPeriods);

  const dataTree = {
    Aeropuerto: { Kusi: {}, 'Wari + Wally': {} },
    Ciudad: { Destino: {}, Urbano: {} },
    Aerolíneas: { Jetsmart: {}, Latam: {}, Sky: {} },
  };

  const grandTotals = {
    total: { ingreso: 0, nroSrc: 0 },
    periods: {},
  };
  sortedPeriods.forEach((p) => {
    grandTotals.periods[`${p.anio}_${p.mes}`] = { ingreso: 0, nroSrc: 0 };
  });

  rows.forEach((r) => {
    const neg = r.negocio;
    const val = r.val;
    const pKey = `${r.anio}_${r.mes}`;

    if (allowed[neg] && allowed[neg].includes(val) && grandTotals.periods[pKey]) {
      const ing = parseFloat(r.ingreso) || 0;
      const src = parseInt(r.nro_src, 10) || 0;

      if (!dataTree[neg][val][pKey]) {
        dataTree[neg][val][pKey] = { ingreso: 0, nroSrc: 0 };
      }
      dataTree[neg][val][pKey].ingreso += ing;
      dataTree[neg][val][pKey].nroSrc += src;

      grandTotals.periods[pKey].ingreso += ing;
      grandTotals.periods[pKey].nroSrc += src;

      grandTotals.total.ingreso += ing;
      grandTotals.total.nroSrc += src;
    }
  });

  const businessNodes = ['Aeropuerto', 'Ciudad', 'Aerolíneas'].map((negName) => {
    const valNames = allowed[negName] || [];
    const negTotals = { total: { ingreso: 0, nroSrc: 0 }, periods: {} };
    sortedPeriods.forEach((p) => {
      negTotals.periods[`${p.anio}_${p.mes}`] = { ingreso: 0, nroSrc: 0 };
    });

    const valNodes = valNames.map((valName) => {
      const valRow = {
        id: `${negName.toLowerCase()}-${valName.toLowerCase()}`,
        name: valName,
        level: 2,
      };

      let valTotalIng = 0;
      let valTotalSrc = 0;

      sortedPeriods.forEach((p) => {
        const pKey = `${p.anio}_${p.mes}`;
        const item = dataTree[negName][valName][pKey] || { ingreso: 0, nroSrc: 0 };
        valTotalIng += item.ingreso;
        valTotalSrc += item.nroSrc;

        negTotals.periods[pKey].ingreso += item.ingreso;
        negTotals.periods[pKey].nroSrc += item.nroSrc;

        valRow[`ingreso_${pKey}`] = formatSoles(item.ingreso);
        valRow[`nro_src_${pKey}`] = formatNum(item.nroSrc);
        valRow[`tck_prom_${pKey}`] = formatTck(item.nroSrc > 0 ? item.ingreso / item.nroSrc : 0);
      });

      negTotals.total.ingreso += valTotalIng;
      negTotals.total.nroSrc += valTotalSrc;

      valRow.ingreso_total = formatSoles(valTotalIng);
      valRow.nro_src_total = formatNum(valTotalSrc);
      valRow.tck_prom_total = formatTck(valTotalSrc > 0 ? valTotalIng / valTotalSrc : 0);
      valRow.rawIngreso = valTotalIng;

      return valRow;
    });

    const negRow = {
      id: `business-${negName.toLowerCase()}`,
      name: negName,
      level: 1,
      expandable: true,
      children: valNodes,
    };

    sortedPeriods.forEach((p) => {
      const pKey = `${p.anio}_${p.mes}`;
      const pData = negTotals.periods[pKey];
      negRow[`ingreso_${pKey}`] = formatSoles(pData.ingreso);
      negRow[`nro_src_${pKey}`] = formatNum(pData.nroSrc);
      negRow[`tck_prom_${pKey}`] = formatTck(pData.nroSrc > 0 ? pData.ingreso / pData.nroSrc : 0);
    });

    negRow.ingreso_total = formatSoles(negTotals.total.ingreso);
    negRow.nro_src_total = formatNum(negTotals.total.nroSrc);
    negRow.tck_prom_total = formatTck(
      negTotals.total.nroSrc > 0 ? negTotals.total.ingreso / negTotals.total.nroSrc : 0
    );
    negRow.rawIngreso = negTotals.total.ingreso;

    return negRow;
  });

  const anioDisplay =
    new Set(sortedPeriods.map((p) => p.anio)).size === 1
      ? `${sortedPeriods[0].anio}`
      : 'Consolidado';

  const yearRow = {
    id: `year-${anioDisplay}`,
    name: anioDisplay,
    level: 0,
    expandable: true,
    children: businessNodes,
  };

  sortedPeriods.forEach((p) => {
    const pKey = `${p.anio}_${p.mes}`;
    const pData = grandTotals.periods[pKey];
    yearRow[`ingreso_${pKey}`] = formatSoles(pData.ingreso);
    yearRow[`nro_src_${pKey}`] = formatNum(pData.nroSrc);
    yearRow[`tck_prom_${pKey}`] = formatTck(pData.nroSrc > 0 ? pData.ingreso / pData.nroSrc : 0);
  });

  yearRow.ingreso_total = formatSoles(grandTotals.total.ingreso);
  yearRow.nro_src_total = formatNum(grandTotals.total.nroSrc);
  yearRow.tck_prom_total = formatTck(
    grandTotals.total.nroSrc > 0 ? grandTotals.total.ingreso / grandTotals.total.nroSrc : 0
  );

  const totalRow = {
    name: 'Total General',
  };
  sortedPeriods.forEach((p) => {
    const pKey = `${p.anio}_${p.mes}`;
    const pData = grandTotals.periods[pKey];
    totalRow[`ingreso_${pKey}`] = formatSoles(pData.ingreso);
    totalRow[`nro_src_${pKey}`] = formatNum(pData.nroSrc);
    totalRow[`tck_prom_${pKey}`] = formatTck(pData.nroSrc > 0 ? pData.ingreso / pData.nroSrc : 0);
  });
  totalRow.ingreso_total = formatSoles(grandTotals.total.ingreso);
  totalRow.nro_src_total = formatNum(grandTotals.total.nroSrc);
  totalRow.tck_prom_total = formatTck(
    grandTotals.total.nroSrc > 0 ? grandTotals.total.ingreso / grandTotals.total.nroSrc : 0
  );

  const distribution = businessNodes.map((b, idx) => ({
    name: b.name,
    value: Math.round(b.rawIngreso),
    color: ['#38BDF8', '#0F172A', '#0EA5E9'][idx] || '#64748B',
  }));

  const periodTitle =
    sortedPeriods.length === 1
      ? `${MESES.find((m) => m.id === sortedPeriods[0].mes)?.nombre} ${sortedPeriods[0].anio}`
      : `${sortedPeriods.length} Meses Seleccionados`;

  return {
    meta: {
      title: 'Ingresos por Negocio',
      subtitle: `Ventas Mensuales - Resumen de ${periodTitle}`,
      period: periodTitle,
    },
    kpis: {
      ingresoTotal: {
        label: 'INGRESO TOTAL',
        value: grandTotals.total.ingreso,
        formatted: formatSoles(grandTotals.total.ingreso),
        change: '+12.4%',
        changeLabel: 'vs Mes Anterior',
        trend: 'up',
      },
      nroTransacciones: {
        label: 'NRO. TRANSACCIONES',
        value: grandTotals.total.nroSrc,
        formatted: formatNum(grandTotals.total.nroSrc),
        change: '+8.2%',
        changeLabel: 'vs Mes Anterior',
        trend: 'up',
      },
      ticketPromedio: {
        label: 'TCK. PROMEDIO',
        value: grandTotals.total.nroSrc > 0 ? grandTotals.total.ingreso / grandTotals.total.nroSrc : 0,
        formatted: formatTck(
          grandTotals.total.nroSrc > 0 ? grandTotals.total.ingreso / grandTotals.total.nroSrc : 0
        ),
        change: 'Estable',
        changeLabel: '',
        trend: 'neutral',
      },
    },
    tableData: {
      columns,
      groupHeaders,
      rows: [yearRow],
      totalRow,
    },
    distribution,
  };
}

/**
 * 2. INGRESOS ORIGEN (Foto Origen: Aeropuerto -> Kusi, Wari + Wally -> tipo_de_cliente)
 */
export async function fetchIngresosOrigen(selections = [{ anio: 2026, mes: 6 }]) {
  const sortedPeriods = [...selections].sort((a, b) =>
    a.anio !== b.anio ? a.anio - b.anio : a.mes - b.mes
  );
  const anios = [...new Set(sortedPeriods.map((s) => s.anio))];
  const meses = [...new Set(sortedPeriods.map((s) => s.mes))];

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.rpc('get_ingresos_origen', {
        p_anios: anios,
        p_meses: meses,
      });
      if (error) {
        console.error('Error in get_ingresos_origen RPC:', error);
      } else if (data) {
        return buildOrigenMultiDashboard(data, sortedPeriods);
      }
    } catch (err) {
      console.warn('Error fetching ingresos origen RPC:', err);
    }
  }

  const fallback = [
    { anio: 2026, mes: 6, val: 'Kusi', tipo_cliente: 'PARTICULAR', ingreso: 887970.0, nro_src: 12194, tck_prom: 72.8 },
    { anio: 2026, mes: 6, val: 'Wari + Wally', tipo_cliente: 'CORPORATIVO', ingreso: 353231.9, nro_src: 4454, tck_prom: 79.3 },
    { anio: 2026, mes: 6, val: 'Wari + Wally', tipo_cliente: 'PARTICULAR', ingreso: 375506.74, nro_src: 4514, tck_prom: 83.2 },
  ];
  return buildOrigenMultiDashboard(fallback, sortedPeriods);
}

function buildOrigenMultiDashboard(rows, sortedPeriods) {
  const { groupHeaders, columns } = generateTableHeaders(sortedPeriods);

  const dataTree = {
    Kusi: { CORPORATIVO: {}, PARTICULAR: {} },
    'Wari + Wally': { CORPORATIVO: {}, PARTICULAR: {} },
  };

  const grandTotals = {
    total: { ingreso: 0, nroSrc: 0 },
    periods: {},
  };
  sortedPeriods.forEach((p) => {
    grandTotals.periods[`${p.anio}_${p.mes}`] = { ingreso: 0, nroSrc: 0 };
  });

  rows.forEach((r) => {
    const val = r.val;
    const tipo = r.tipo_cliente || 'PARTICULAR';
    const pKey = `${r.anio}_${r.mes}`;

    if (dataTree[val] && grandTotals.periods[pKey]) {
      const ing = parseFloat(r.ingreso) || 0;
      const src = parseInt(r.nro_src, 10) || 0;

      if (!dataTree[val][tipo]) {
        dataTree[val][tipo] = {};
      }
      if (!dataTree[val][tipo][pKey]) {
        dataTree[val][tipo][pKey] = { ingreso: 0, nroSrc: 0 };
      }
      dataTree[val][tipo][pKey].ingreso += ing;
      dataTree[val][tipo][pKey].nroSrc += src;

      grandTotals.periods[pKey].ingreso += ing;
      grandTotals.periods[pKey].nroSrc += src;

      grandTotals.total.ingreso += ing;
      grandTotals.total.nroSrc += src;
    }
  });

  const valNodes = ['Kusi', 'Wari + Wally'].map((vName) => {
    const clientTypes = vName === 'Kusi' ? ['PARTICULAR'] : ['CORPORATIVO', 'PARTICULAR'];
    const valTotals = { total: { ingreso: 0, nroSrc: 0 }, periods: {} };
    sortedPeriods.forEach((p) => {
      valTotals.periods[`${p.anio}_${p.mes}`] = { ingreso: 0, nroSrc: 0 };
    });

    const clientNodes = clientTypes.map((cName) => {
      const cRow = {
        id: `origen-${vName.toLowerCase()}-${cName.toLowerCase()}`,
        name: cName,
        level: 3,
      };

      let cTotalIng = 0;
      let cTotalSrc = 0;

      sortedPeriods.forEach((p) => {
        const pKey = `${p.anio}_${p.mes}`;
        const item = (dataTree[vName] && dataTree[vName][cName] && dataTree[vName][cName][pKey]) || {
          ingreso: 0,
          nroSrc: 0,
        };
        cTotalIng += item.ingreso;
        cTotalSrc += item.nroSrc;

        valTotals.periods[pKey].ingreso += item.ingreso;
        valTotals.periods[pKey].nroSrc += item.nroSrc;

        cRow[`ingreso_${pKey}`] = formatSoles(item.ingreso);
        cRow[`nro_src_${pKey}`] = formatNum(item.nroSrc);
        cRow[`tck_prom_${pKey}`] = formatTck(item.nroSrc > 0 ? item.ingreso / item.nroSrc : 0);
      });

      valTotals.total.ingreso += cTotalIng;
      valTotals.total.nroSrc += cTotalSrc;

      cRow.ingreso_total = formatSoles(cTotalIng);
      cRow.nro_src_total = formatNum(cTotalSrc);
      cRow.tck_prom_total = formatTck(cTotalSrc > 0 ? cTotalIng / cTotalSrc : 0);
      return cRow;
    });

    const vRow = {
      id: `origen-${vName.toLowerCase()}`,
      name: vName,
      level: 2,
      expandable: true,
      children: clientNodes,
    };

    sortedPeriods.forEach((p) => {
      const pKey = `${p.anio}_${p.mes}`;
      const pData = valTotals.periods[pKey];
      vRow[`ingreso_${pKey}`] = formatSoles(pData.ingreso);
      vRow[`nro_src_${pKey}`] = formatNum(pData.nroSrc);
      vRow[`tck_prom_${pKey}`] = formatTck(pData.nroSrc > 0 ? pData.ingreso / pData.nroSrc : 0);
    });

    vRow.ingreso_total = formatSoles(valTotals.total.ingreso);
    vRow.nro_src_total = formatNum(valTotals.total.nroSrc);
    vRow.tck_prom_total = formatTck(
      valTotals.total.nroSrc > 0 ? valTotals.total.ingreso / valTotals.total.nroSrc : 0
    );
    vRow.rawIngreso = valTotals.total.ingreso;

    return vRow;
  });

  const aeropNode = {
    id: 'business-aeropuerto',
    name: 'Aeropuerto',
    level: 1,
    expandable: true,
    children: valNodes,
  };

  sortedPeriods.forEach((p) => {
    const pKey = `${p.anio}_${p.mes}`;
    const pData = grandTotals.periods[pKey];
    aeropNode[`ingreso_${pKey}`] = formatSoles(pData.ingreso);
    aeropNode[`nro_src_${pKey}`] = formatNum(pData.nroSrc);
    aeropNode[`tck_prom_${pKey}`] = formatTck(pData.nroSrc > 0 ? pData.ingreso / pData.nroSrc : 0);
  });

  aeropNode.ingreso_total = formatSoles(grandTotals.total.ingreso);
  aeropNode.nro_src_total = formatNum(grandTotals.total.nroSrc);
  aeropNode.tck_prom_total = formatTck(
    grandTotals.total.nroSrc > 0 ? grandTotals.total.ingreso / grandTotals.total.nroSrc : 0
  );

  const anioDisplay =
    new Set(sortedPeriods.map((p) => p.anio)).size === 1
      ? `${sortedPeriods[0].anio}`
      : 'Consolidado';

  const yearRow = {
    id: `year-${anioDisplay}`,
    name: anioDisplay,
    level: 0,
    expandable: true,
    children: [aeropNode],
  };

  sortedPeriods.forEach((p) => {
    const pKey = `${p.anio}_${p.mes}`;
    const pData = grandTotals.periods[pKey];
    yearRow[`ingreso_${pKey}`] = formatSoles(pData.ingreso);
    yearRow[`nro_src_${pKey}`] = formatNum(pData.nroSrc);
    yearRow[`tck_prom_${pKey}`] = formatTck(pData.nroSrc > 0 ? pData.ingreso / pData.nroSrc : 0);
  });

  yearRow.ingreso_total = formatSoles(grandTotals.total.ingreso);
  yearRow.nro_src_total = formatNum(grandTotals.total.nroSrc);
  yearRow.tck_prom_total = formatTck(
    grandTotals.total.nroSrc > 0 ? grandTotals.total.ingreso / grandTotals.total.nroSrc : 0
  );

  const totalRow = {
    name: 'Total Aeropuerto',
  };
  sortedPeriods.forEach((p) => {
    const pKey = `${p.anio}_${p.mes}`;
    const pData = grandTotals.periods[pKey];
    totalRow[`ingreso_${pKey}`] = formatSoles(pData.ingreso);
    totalRow[`nro_src_${pKey}`] = formatNum(pData.nroSrc);
    totalRow[`tck_prom_${pKey}`] = formatTck(pData.nroSrc > 0 ? pData.ingreso / pData.nroSrc : 0);
  });
  totalRow.ingreso_total = formatSoles(grandTotals.total.ingreso);
  totalRow.nro_src_total = formatNum(grandTotals.total.nroSrc);
  totalRow.tck_prom_total = formatTck(
    grandTotals.total.nroSrc > 0 ? grandTotals.total.ingreso / grandTotals.total.nroSrc : 0
  );

  const distribution = valNodes.map((v, idx) => ({
    name: v.name,
    value: Math.round(v.rawIngreso),
    color: ['#38BDF8', '#0F172A'][idx] || '#0EA5E9',
  }));

  const periodTitle =
    sortedPeriods.length === 1
      ? `${MESES.find((m) => m.id === sortedPeriods[0].mes)?.nombre} ${sortedPeriods[0].anio}`
      : `${sortedPeriods.length} Meses Seleccionados`;

  return {
    meta: {
      title: 'Ingresos Origen (Aeropuerto)',
      subtitle: `Ventas Mensuales - Aeropuerto por Kusi, Wari + Wally y Tipo de Cliente (${periodTitle})`,
      period: periodTitle,
    },
    kpis: {
      ingresoTotal: {
        label: 'INGRESO ORIGEN',
        value: grandTotals.total.ingreso,
        formatted: formatSoles(grandTotals.total.ingreso),
        change: '+11.2%',
        changeLabel: 'vs Mes Anterior',
        trend: 'up',
      },
      nroTransacciones: {
        label: 'NRO. TRANSACCIONES',
        value: grandTotals.total.nroSrc,
        formatted: formatNum(grandTotals.total.nroSrc),
        change: '+7.8%',
        changeLabel: 'vs Mes Anterior',
        trend: 'up',
      },
      ticketPromedio: {
        label: 'TCK. PROMEDIO',
        value: grandTotals.total.nroSrc > 0 ? grandTotals.total.ingreso / grandTotals.total.nroSrc : 0,
        formatted: formatTck(
          grandTotals.total.nroSrc > 0 ? grandTotals.total.ingreso / grandTotals.total.nroSrc : 0
        ),
        change: 'Estable',
        changeLabel: '',
        trend: 'neutral',
      },
    },
    tableData: {
      columns,
      groupHeaders,
      rows: [yearRow],
      totalRow,
    },
    distribution,
  };
}

/**
 * 3. INGRESOS CIUDAD (Foto 2: Ciudad -> Destino, Urbano -> tipo_de_cliente)
 */
export async function fetchIngresosCiudad(selections = [{ anio: 2026, mes: 6 }]) {
  const sortedPeriods = [...selections].sort((a, b) =>
    a.anio !== b.anio ? a.anio - b.anio : a.mes - b.mes
  );
  const anios = [...new Set(sortedPeriods.map((s) => s.anio))];
  const meses = [...new Set(sortedPeriods.map((s) => s.mes))];

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.rpc('get_ingresos_ciudad', {
        p_anios: anios,
        p_meses: meses,
      });
      if (error) {
        console.error('Error in get_ingresos_ciudad RPC:', error);
      } else if (data) {
        return buildCiudadMultiDashboard(data, sortedPeriods);
      }
    } catch (err) {
      console.warn('Error fetching ingresos ciudad RPC:', err);
    }
  }

  const fallback = [
    { anio: 2026, mes: 6, val: 'Destino', tipo_cliente: 'CORPORATIVO', ingreso: 326420.6, nro_src: 4140, tck_prom: 78.8 },
    { anio: 2026, mes: 6, val: 'Destino', tipo_cliente: 'PARTICULAR', ingreso: 185243.75, nro_src: 2182, tck_prom: 84.9 },
    { anio: 2026, mes: 6, val: 'Urbano', tipo_cliente: 'CORPORATIVO', ingreso: 761689.08, nro_src: 13194, tck_prom: 57.7 },
    { anio: 2026, mes: 6, val: 'Urbano', tipo_cliente: 'PARTICULAR', ingreso: 95310.64, nro_src: 2184, tck_prom: 43.6 },
  ];
  return buildCiudadMultiDashboard(fallback, sortedPeriods);
}

function buildCiudadMultiDashboard(rows, sortedPeriods) {
  const { groupHeaders, columns } = generateTableHeaders(sortedPeriods);

  const dataTree = {
    Destino: { CORPORATIVO: {}, PARTICULAR: {} },
    Urbano: { CORPORATIVO: {}, PARTICULAR: {} },
  };

  const grandTotals = {
    total: { ingreso: 0, nroSrc: 0 },
    periods: {},
  };
  sortedPeriods.forEach((p) => {
    grandTotals.periods[`${p.anio}_${p.mes}`] = { ingreso: 0, nroSrc: 0 };
  });

  rows.forEach((r) => {
    const val = r.val;
    const tipo = r.tipo_cliente || 'PARTICULAR';
    const pKey = `${r.anio}_${r.mes}`;

    if (dataTree[val] && dataTree[val][tipo] && grandTotals.periods[pKey]) {
      const ing = parseFloat(r.ingreso) || 0;
      const src = parseInt(r.nro_src, 10) || 0;

      if (!dataTree[val][tipo][pKey]) {
        dataTree[val][tipo][pKey] = { ingreso: 0, nroSrc: 0 };
      }
      dataTree[val][tipo][pKey].ingreso += ing;
      dataTree[val][tipo][pKey].nroSrc += src;

      grandTotals.periods[pKey].ingreso += ing;
      grandTotals.periods[pKey].nroSrc += src;

      grandTotals.total.ingreso += ing;
      grandTotals.total.nroSrc += src;
    }
  });

  const valNodes = ['Destino', 'Urbano'].map((vName) => {
    const clientTypes = ['CORPORATIVO', 'PARTICULAR'];
    const valTotals = { total: { ingreso: 0, nroSrc: 0 }, periods: {} };
    sortedPeriods.forEach((p) => {
      valTotals.periods[`${p.anio}_${p.mes}`] = { ingreso: 0, nroSrc: 0 };
    });

    const clientNodes = clientTypes.map((cName) => {
      const cRow = {
        id: `ciudad-${vName.toLowerCase()}-${cName.toLowerCase()}`,
        name: cName,
        level: 3,
      };

      let cTotalIng = 0;
      let cTotalSrc = 0;

      sortedPeriods.forEach((p) => {
        const pKey = `${p.anio}_${p.mes}`;
        const item = dataTree[vName][cName][pKey] || { ingreso: 0, nroSrc: 0 };
        cTotalIng += item.ingreso;
        cTotalSrc += item.nroSrc;

        valTotals.periods[pKey].ingreso += item.ingreso;
        valTotals.periods[pKey].nroSrc += item.nroSrc;

        cRow[`ingreso_${pKey}`] = formatSoles(item.ingreso);
        cRow[`nro_src_${pKey}`] = formatNum(item.nroSrc);
        cRow[`tck_prom_${pKey}`] = formatTck(item.nroSrc > 0 ? item.ingreso / item.nroSrc : 0);
      });

      valTotals.total.ingreso += cTotalIng;
      valTotals.total.nroSrc += cTotalSrc;

      cRow.ingreso_total = formatSoles(cTotalIng);
      cRow.nro_src_total = formatNum(cTotalSrc);
      cRow.tck_prom_total = formatTck(cTotalSrc > 0 ? cTotalIng / cTotalSrc : 0);
      return cRow;
    });

    const vRow = {
      id: `ciudad-${vName.toLowerCase()}`,
      name: vName,
      level: 2,
      expandable: true,
      children: clientNodes,
    };

    sortedPeriods.forEach((p) => {
      const pKey = `${p.anio}_${p.mes}`;
      const pData = valTotals.periods[pKey];
      vRow[`ingreso_${pKey}`] = formatSoles(pData.ingreso);
      vRow[`nro_src_${pKey}`] = formatNum(pData.nroSrc);
      vRow[`tck_prom_${pKey}`] = formatTck(pData.nroSrc > 0 ? pData.ingreso / pData.nroSrc : 0);
    });

    vRow.ingreso_total = formatSoles(valTotals.total.ingreso);
    vRow.nro_src_total = formatNum(valTotals.total.nroSrc);
    vRow.tck_prom_total = formatTck(
      valTotals.total.nroSrc > 0 ? valTotals.total.ingreso / valTotals.total.nroSrc : 0
    );
    vRow.rawIngreso = valTotals.total.ingreso;

    return vRow;
  });

  const ciudadNode = {
    id: 'business-ciudad',
    name: 'Ciudad',
    level: 1,
    expandable: true,
    children: valNodes,
  };

  sortedPeriods.forEach((p) => {
    const pKey = `${p.anio}_${p.mes}`;
    const pData = grandTotals.periods[pKey];
    ciudadNode[`ingreso_${pKey}`] = formatSoles(pData.ingreso);
    ciudadNode[`nro_src_${pKey}`] = formatNum(pData.nroSrc);
    ciudadNode[`tck_prom_${pKey}`] = formatTck(pData.nroSrc > 0 ? pData.ingreso / pData.nroSrc : 0);
  });

  ciudadNode.ingreso_total = formatSoles(grandTotals.total.ingreso);
  ciudadNode.nro_src_total = formatNum(grandTotals.total.nroSrc);
  ciudadNode.tck_prom_total = formatTck(
    grandTotals.total.nroSrc > 0 ? grandTotals.total.ingreso / grandTotals.total.nroSrc : 0
  );

  const anioDisplay =
    new Set(sortedPeriods.map((p) => p.anio)).size === 1
      ? `${sortedPeriods[0].anio}`
      : 'Consolidado';

  const yearRow = {
    id: `year-${anioDisplay}`,
    name: anioDisplay,
    level: 0,
    expandable: true,
    children: [ciudadNode],
  };

  sortedPeriods.forEach((p) => {
    const pKey = `${p.anio}_${p.mes}`;
    const pData = grandTotals.periods[pKey];
    yearRow[`ingreso_${pKey}`] = formatSoles(pData.ingreso);
    yearRow[`nro_src_${pKey}`] = formatNum(pData.nroSrc);
    yearRow[`tck_prom_${pKey}`] = formatTck(pData.nroSrc > 0 ? pData.ingreso / pData.nroSrc : 0);
  });

  yearRow.ingreso_total = formatSoles(grandTotals.total.ingreso);
  yearRow.nro_src_total = formatNum(grandTotals.total.nroSrc);
  yearRow.tck_prom_total = formatTck(
    grandTotals.total.nroSrc > 0 ? grandTotals.total.ingreso / grandTotals.total.nroSrc : 0
  );

  const totalRow = {
    name: 'Total Ciudad',
  };
  sortedPeriods.forEach((p) => {
    const pKey = `${p.anio}_${p.mes}`;
    const pData = grandTotals.periods[pKey];
    totalRow[`ingreso_${pKey}`] = formatSoles(pData.ingreso);
    totalRow[`nro_src_${pKey}`] = formatNum(pData.nroSrc);
    totalRow[`tck_prom_${pKey}`] = formatTck(pData.nroSrc > 0 ? pData.ingreso / pData.nroSrc : 0);
  });
  totalRow.ingreso_total = formatSoles(grandTotals.total.ingreso);
  totalRow.nro_src_total = formatNum(grandTotals.total.nroSrc);
  totalRow.tck_prom_total = formatTck(
    grandTotals.total.nroSrc > 0 ? grandTotals.total.ingreso / grandTotals.total.nroSrc : 0
  );

  const distribution = valNodes.map((v, idx) => ({
    name: v.name,
    value: Math.round(v.rawIngreso),
    color: ['#0EA5E9', '#0F172A'][idx] || '#64748B',
  }));

  const periodTitle =
    sortedPeriods.length === 1
      ? `${MESES.find((m) => m.id === sortedPeriods[0].mes)?.nombre} ${sortedPeriods[0].anio}`
      : `${sortedPeriods.length} Meses Seleccionados`;

  return {
    meta: {
      title: 'Ingresos Ciudad',
      subtitle: `Ventas Mensuales - Ciudad por Destino, Urbano y Tipo de Cliente (${periodTitle})`,
      period: periodTitle,
    },
    kpis: {
      ingresoTotal: {
        label: 'INGRESO CIUDAD',
        value: grandTotals.total.ingreso,
        formatted: formatSoles(grandTotals.total.ingreso),
        change: '+9.5%',
        changeLabel: 'vs Mes Anterior',
        trend: 'up',
      },
      nroTransacciones: {
        label: 'NRO. TRANSACCIONES',
        value: grandTotals.total.nroSrc,
        formatted: formatNum(grandTotals.total.nroSrc),
        change: '+6.1%',
        changeLabel: 'vs Mes Anterior',
        trend: 'up',
      },
      ticketPromedio: {
        label: 'TCK. PROMEDIO',
        value: grandTotals.total.nroSrc > 0 ? grandTotals.total.ingreso / grandTotals.total.nroSrc : 0,
        formatted: formatTck(
          grandTotals.total.nroSrc > 0 ? grandTotals.total.ingreso / grandTotals.total.nroSrc : 0
        ),
        change: 'Estable',
        changeLabel: '',
        trend: 'neutral',
      },
    },
    tableData: {
      columns,
      groupHeaders,
      rows: [yearRow],
      totalRow,
    },
    distribution,
  };
}

/**
 * 4. INGRESOS AEROLÍNEAS (Foto Aerolíneas: Aerolíneas -> Jetsmart, Latam, Sky [Hasta nivel Val])
 */
export async function fetchIngresosAerolineas(selections = [{ anio: 2026, mes: 6 }]) {
  const sortedPeriods = [...selections].sort((a, b) =>
    a.anio !== b.anio ? a.anio - b.anio : a.mes - b.mes
  );
  const anios = [...new Set(sortedPeriods.map((s) => s.anio))];
  const meses = [...new Set(sortedPeriods.map((s) => s.mes))];

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.rpc('get_ingresos_aerolineas', {
        p_anios: anios,
        p_meses: meses,
      });
      if (error) {
        console.error('Error in get_ingresos_aerolineas RPC:', error);
      } else if (data) {
        return buildAerolineasMultiDashboard(data, sortedPeriods);
      }
    } catch (err) {
      console.warn('Error fetching ingresos aerolíneas RPC:', err);
    }
  }

  const fallback = [
    { anio: 2026, mes: 6, val: 'Jetsmart', ingreso: 165739.0, nro_src: 2856, tck_prom: 58.0 },
    { anio: 2026, mes: 6, val: 'Latam', ingreso: 922356.0, nro_src: 14927, tck_prom: 61.8 },
    { anio: 2026, mes: 6, val: 'Sky', ingreso: 330381.64, nro_src: 5964, tck_prom: 55.4 },
  ];
  return buildAerolineasMultiDashboard(fallback, sortedPeriods);
}

function buildAerolineasMultiDashboard(rows, sortedPeriods) {
  const { groupHeaders, columns } = generateTableHeaders(sortedPeriods);

  const dataTree = {
    Jetsmart: {},
    Latam: {},
    Sky: {},
  };

  const grandTotals = {
    total: { ingreso: 0, nroSrc: 0 },
    periods: {},
  };
  sortedPeriods.forEach((p) => {
    grandTotals.periods[`${p.anio}_${p.mes}`] = { ingreso: 0, nroSrc: 0 };
  });

  rows.forEach((r) => {
    const val = r.val;
    const pKey = `${r.anio}_${r.mes}`;

    if (dataTree[val] && grandTotals.periods[pKey]) {
      const ing = parseFloat(r.ingreso) || 0;
      const src = parseInt(r.nro_src, 10) || 0;

      if (!dataTree[val][pKey]) {
        dataTree[val][pKey] = { ingreso: 0, nroSrc: 0 };
      }
      dataTree[val][pKey].ingreso += ing;
      dataTree[val][pKey].nroSrc += src;

      grandTotals.periods[pKey].ingreso += ing;
      grandTotals.periods[pKey].nroSrc += src;

      grandTotals.total.ingreso += ing;
      grandTotals.total.nroSrc += src;
    }
  });

  const valNodes = ['Jetsmart', 'Latam', 'Sky'].map((vName) => {
    const vRow = {
      id: `aerolinea-${vName.toLowerCase()}`,
      name: vName,
      level: 2,
    };

    let vTotalIng = 0;
    let vTotalSrc = 0;

    sortedPeriods.forEach((p) => {
      const pKey = `${p.anio}_${p.mes}`;
      const item = dataTree[vName][pKey] || { ingreso: 0, nroSrc: 0 };
      vTotalIng += item.ingreso;
      vTotalSrc += item.nroSrc;

      vRow[`ingreso_${pKey}`] = formatSoles(item.ingreso);
      vRow[`nro_src_${pKey}`] = formatNum(item.nroSrc);
      vRow[`tck_prom_${pKey}`] = formatTck(item.nroSrc > 0 ? item.ingreso / item.nroSrc : 0);
    });

    vRow.ingreso_total = formatSoles(vTotalIng);
    vRow.nro_src_total = formatNum(vTotalSrc);
    vRow.tck_prom_total = formatTck(vTotalSrc > 0 ? vTotalIng / vTotalSrc : 0);
    vRow.rawIngreso = vTotalIng;

    return vRow;
  });

  const aeroNode = {
    id: 'business-aerolineas',
    name: 'Aerolíneas',
    level: 1,
    expandable: true,
    children: valNodes,
  };

  sortedPeriods.forEach((p) => {
    const pKey = `${p.anio}_${p.mes}`;
    const pData = grandTotals.periods[pKey];
    aeroNode[`ingreso_${pKey}`] = formatSoles(pData.ingreso);
    aeroNode[`nro_src_${pKey}`] = formatNum(pData.nroSrc);
    aeroNode[`tck_prom_${pKey}`] = formatTck(pData.nroSrc > 0 ? pData.ingreso / pData.nroSrc : 0);
  });

  aeroNode.ingreso_total = formatSoles(grandTotals.total.ingreso);
  aeroNode.nro_src_total = formatNum(grandTotals.total.nroSrc);
  aeroNode.tck_prom_total = formatTck(
    grandTotals.total.nroSrc > 0 ? grandTotals.total.ingreso / grandTotals.total.nroSrc : 0
  );

  const anioDisplay =
    new Set(sortedPeriods.map((p) => p.anio)).size === 1
      ? `${sortedPeriods[0].anio}`
      : 'Consolidado';

  const yearRow = {
    id: `year-${anioDisplay}`,
    name: anioDisplay,
    level: 0,
    expandable: true,
    children: [aeroNode],
  };

  sortedPeriods.forEach((p) => {
    const pKey = `${p.anio}_${p.mes}`;
    const pData = grandTotals.periods[pKey];
    yearRow[`ingreso_${pKey}`] = formatSoles(pData.ingreso);
    yearRow[`nro_src_${pKey}`] = formatNum(pData.nroSrc);
    yearRow[`tck_prom_${pKey}`] = formatTck(pData.nroSrc > 0 ? pData.ingreso / pData.nroSrc : 0);
  });

  yearRow.ingreso_total = formatSoles(grandTotals.total.ingreso);
  yearRow.nro_src_total = formatNum(grandTotals.total.nroSrc);
  yearRow.tck_prom_total = formatTck(
    grandTotals.total.nroSrc > 0 ? grandTotals.total.ingreso / grandTotals.total.nroSrc : 0
  );

  const totalRow = {
    name: 'Total Aerolíneas',
  };
  sortedPeriods.forEach((p) => {
    const pKey = `${p.anio}_${p.mes}`;
    const pData = grandTotals.periods[pKey];
    totalRow[`ingreso_${pKey}`] = formatSoles(pData.ingreso);
    totalRow[`nro_src_${pKey}`] = formatNum(pData.nroSrc);
    totalRow[`tck_prom_${pKey}`] = formatTck(pData.nroSrc > 0 ? pData.ingreso / pData.nroSrc : 0);
  });
  totalRow.ingreso_total = formatSoles(grandTotals.total.ingreso);
  totalRow.nro_src_total = formatNum(grandTotals.total.nroSrc);
  totalRow.tck_prom_total = formatTck(
    grandTotals.total.nroSrc > 0 ? grandTotals.total.ingreso / grandTotals.total.nroSrc : 0
  );

  const distribution = valNodes.map((v, idx) => ({
    name: v.name,
    value: Math.round(v.rawIngreso),
    color: ['#0EA5E9', '#38BDF8', '#0F172A'][idx] || '#64748B',
  }));

  const periodTitle =
    sortedPeriods.length === 1
      ? `${MESES.find((m) => m.id === sortedPeriods[0].mes)?.nombre} ${sortedPeriods[0].anio}`
      : `${sortedPeriods.length} Meses Seleccionados`;

  return {
    meta: {
      title: 'Ingresos Aerolíneas',
      subtitle: `Ventas Mensuales - Aerolíneas por Línea Aérea (${periodTitle})`,
      period: periodTitle,
    },
    kpis: {
      ingresoTotal: {
        label: 'INGRESO AEROLÍNEAS',
        value: grandTotals.total.ingreso,
        formatted: formatSoles(grandTotals.total.ingreso),
        change: '+14.2%',
        changeLabel: 'vs Mes Anterior',
        trend: 'up',
      },
      nroTransacciones: {
        label: 'NRO. TRANSACCIONES',
        value: grandTotals.total.nroSrc,
        formatted: formatNum(grandTotals.total.nroSrc),
        change: '+10.8%',
        changeLabel: 'vs Mes Anterior',
        trend: 'up',
      },
      ticketPromedio: {
        label: 'TCK. PROMEDIO',
        value: grandTotals.total.nroSrc > 0 ? grandTotals.total.ingreso / grandTotals.total.nroSrc : 0,
        formatted: formatTck(
          grandTotals.total.nroSrc > 0 ? grandTotals.total.ingreso / grandTotals.total.nroSrc : 0
        ),
        change: 'Estable',
        changeLabel: '',
        trend: 'neutral',
      },
    },
    tableData: {
      columns,
      groupHeaders,
      rows: [yearRow],
      totalRow,
    },
    distribution,
  };
}
