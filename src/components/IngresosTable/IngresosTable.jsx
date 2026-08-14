import React, { useState } from 'react';
import { MinusSquare, PlusSquare, ChevronDown } from 'lucide-react';
import './IngresosTable.css';

export default function IngresosTable({
  data,
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
  availableYears = [2026, 2025],
  meses = [],
  loading = false,
}) {
  const [expandedYear, setExpandedYear] = useState(true);
  const [expandedNegocios, setExpandedNegocios] = useState({
    Aeropuerto: true,
    Ciudad: true,
    Aerolíneas: true,
    Plazas: true,
  });

  const toggleNegocio = (negName) => {
    setExpandedNegocios((prev) => ({
      ...prev,
      [negName]: !prev[negName],
    }));
  };

  const formatCurrency = (val) => {
    return `S/ ${Math.round(val).toLocaleString('en-US')}`;
  };

  const formatNumber = (val) => {
    return Math.round(val).toLocaleString('en-US');
  };

  const formatDecimal = (val) => {
    return `S/ ${Number(val).toFixed(1)}`;
  };

  return (
    <div className="ingresos-table-container">
      <div className="ingresos-table-card">
        <table className="ingresos-table">
          <thead>
            {/* Top Month Header Row */}
            <tr className="ingresos-table__top-header">
              <th className="th-month-label">
                <span>Nombre del mes</span>
              </th>
              <th colSpan="3" className="th-month-value">
                <div className="month-selector-wrapper">
                  <select
                    value={selectedMonth}
                    onChange={(e) => onMonthChange(Number(e.target.value))}
                    className="month-select"
                  >
                    {meses.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nombre}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="select-arrow" />
                </div>
              </th>
            </tr>

            {/* Sub Header Row */}
            <tr className="ingresos-table__sub-header">
              <th className="col-dimension">
                <div className="year-selector-header">
                  <span>Año</span>
                  <select
                    value={selectedYear}
                    onChange={(e) => onYearChange(Number(e.target.value))}
                    className="year-select"
                  >
                    {availableYears.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </th>
              <th className="col-metric">Ingreso</th>
              <th className="col-metric">Nro. Src</th>
              <th className="col-metric">Tck. Prom</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="ingresos-table__loading">
                  <div className="spinner"></div>
                  <span>Cargando datos de Supabase...</span>
                </td>
              </tr>
            ) : !data || data.negocios?.length === 0 ? (
              <tr>
                <td colSpan="4" className="ingresos-table__empty">
                  No hay registros disponibles para este periodo.
                </td>
              </tr>
            ) : (
              <>
                {/* YEAR LEVEL ROW (Collapsible) */}
                <tr className="row-year-level">
                  <td className="cell-dimension">
                    <button
                      className="tree-toggle-btn"
                      onClick={() => setExpandedYear(!expandedYear)}
                      aria-label="Toggle año"
                    >
                      {expandedYear ? (
                        <MinusSquare size={16} className="toggle-icon toggle-icon--active" />
                      ) : (
                        <PlusSquare size={16} className="toggle-icon" />
                      )}
                      <span className="node-title year-title">{data.anio}</span>
                    </button>
                  </td>
                  <td className="cell-metric cell-bold">{formatCurrency(data.totalIngreso)}</td>
                  <td className="cell-metric cell-bold">{formatNumber(data.totalNroSrc)}</td>
                  <td className="cell-metric cell-bold">{formatDecimal(data.totalTckProm)}</td>
                </tr>

                {/* NEGOCIOS LEVEL */}
                {expandedYear &&
                  data.negocios?.map((neg) => {
                    const isNegExpanded = expandedNegocios[neg.name] ?? true;
                    return (
                      <React.Fragment key={neg.name}>
                        {/* Negocio Row */}
                        <tr className="row-negocio-level">
                          <td className="cell-dimension cell-indent-1">
                            <button
                              className="tree-toggle-btn"
                              onClick={() => toggleNegocio(neg.name)}
                              aria-label={`Toggle ${neg.name}`}
                            >
                              {isNegExpanded ? (
                                <MinusSquare size={15} className="toggle-icon toggle-icon--active" />
                              ) : (
                                <PlusSquare size={15} className="toggle-icon" />
                              )}
                              <span className="node-title negocio-title">{neg.name}</span>
                            </button>
                          </td>
                          <td className="cell-metric cell-bold">{formatCurrency(neg.ingreso)}</td>
                          <td className="cell-metric cell-bold">{formatNumber(neg.nroSrc)}</td>
                          <td className="cell-metric cell-bold">{formatDecimal(neg.tckProm)}</td>
                        </tr>

                        {/* VAL ROWS */}
                        {isNegExpanded &&
                          neg.vals?.map((valItem) => (
                            <tr key={`${neg.name}-${valItem.name}`} className="row-val-level">
                              <td className="cell-dimension cell-indent-2">
                                <span className="val-title">{valItem.name}</span>
                              </td>
                              <td className="cell-metric">{formatCurrency(valItem.ingreso)}</td>
                              <td className="cell-metric">{formatNumber(valItem.nroSrc)}</td>
                              <td className="cell-metric">{formatDecimal(valItem.tckProm)}</td>
                            </tr>
                          ))}
                      </React.Fragment>
                    );
                  })}
              </>
            )}
          </tbody>

          {/* TOTAL FOOTER */}
          {data && (
            <tfoot>
              <tr className="row-total-footer">
                <td className="cell-dimension cell-bold">Total</td>
                <td className="cell-metric cell-bold">{formatCurrency(data.totalIngreso)}</td>
                <td className="cell-metric cell-bold">{formatNumber(data.totalNroSrc)}</td>
                <td className="cell-metric cell-bold">{formatDecimal(data.totalTckProm)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
