import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';
import { MESES, fetchMesesDisponibles, fetchSemanasDisponibles } from '../../services/ingresosService';
import './PeriodFilterDropdown.css';

/**
 * Hierarchical Year/Month/Week Checkbox Filter Dropdown.
 * Available periods come from the DB — nothing is hardcoded.
 */
export default function PeriodFilterDropdown({
  periodType = 'mes',
  onPeriodTypeChange,
  selectedSelections = [{ anio: 2026, mes: 6 }],
  onSelectionChange,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedYears, setExpandedYears] = useState({});
  const [availableMonths, setAvailableMonths]   = useState([]); // [{ anio, mes }]
  const [availableWeeks,  setAvailableWeeks]    = useState([]); // [{ anio, semana }]
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  // ── Close on outside click ─────────────────────────────────────────────────
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ── Load available periods from DB on mount ────────────────────────────────
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [months, weeks] = await Promise.all([
          fetchMesesDisponibles(),
          fetchSemanasDisponibles(),
        ]);
        setAvailableMonths(months);
        setAvailableWeeks(weeks);

        // Expand the most recent year by default
        const years = [...new Set([...months, ...weeks].map((p) => p.anio))];
        if (years.length > 0) {
          const maxYear = Math.max(...years);
          setExpandedYears({ [maxYear]: true });
        }
      } catch (err) {
        console.warn('PeriodFilterDropdown: error loading periods:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ── Derived data ───────────────────────────────────────────────────────────
  const current = periodType === 'semana' ? availableWeeks : availableMonths;

  // Distinct years that have data, sorted descending
  const availableYears = [...new Set(current.map((p) => p.anio))].sort((a, b) => b - a);

  // Items per year
  const itemsForYear = (yr) => {
    if (periodType === 'semana') {
      return availableWeeks
        .filter((p) => p.anio === yr)
        .map((p) => p.semana)
        .sort((a, b) => a - b);
    }
    return availableMonths
      .filter((p) => p.anio === yr)
      .map((p) => p.mes)
      .sort((a, b) => a - b);
  };

  // ── Checkbox helpers ───────────────────────────────────────────────────────
  const toggleYearExpand = (yr) =>
    setExpandedYears((prev) => ({ ...prev, [yr]: !prev[yr] }));

  const isItemSelected = (yr, id) => {
    if (periodType === 'semana')
      return selectedSelections.some((s) => s.anio === yr && s.semana === id);
    return selectedSelections.some((s) => s.anio === yr && s.mes === id);
  };

  const handleToggleItem = (yr, id) => {
    const isSelected = isItemSelected(yr, id);
    let next;
    if (isSelected) {
      next = periodType === 'semana'
        ? selectedSelections.filter((s) => !(s.anio === yr && s.semana === id))
        : selectedSelections.filter((s) => !(s.anio === yr && s.mes === id));
      if (next.length === 0) return; // keep at least one
    } else {
      next = periodType === 'semana'
        ? [...selectedSelections, { anio: yr, semana: id }]
        : [...selectedSelections, { anio: yr, mes: id }];
    }
    onSelectionChange(next);
  };

  const handleToggleYearAll = (yr) => {
    const items = itemsForYear(yr);
    const allSelected = items.every((id) => isItemSelected(yr, id));
    let next;
    if (allSelected) {
      next = selectedSelections.filter((s) => s.anio !== yr);
      if (next.length === 0) return;
    } else {
      const others = selectedSelections.filter((s) => s.anio !== yr);
      const newForYear = periodType === 'semana'
        ? items.map((w) => ({ anio: yr, semana: w }))
        : items.map((m) => ({ anio: yr, mes: m }));
      next = [...others, ...newForYear];
    }
    onSelectionChange(next);
  };

  const getYearCheckStatus = (yr) => {
    const items = itemsForYear(yr);
    const sel = items.filter((id) => isItemSelected(yr, id)).length;
    if (sel === 0) return 'none';
    if (sel === items.length) return 'all';
    return 'indeterminate';
  };

  // ── Button label ───────────────────────────────────────────────────────────
  const getButtonLabel = () => {
    if (loading) return 'Cargando…';
    if (periodType === 'semana') {
      if (selectedSelections.length === 1) {
        const s = selectedSelections[0];
        return `Semana ${s.semana} ${s.anio}`;
      }
      return selectedSelections.length > 1
        ? `Semanas (${selectedSelections.length})`
        : 'Seleccionar semanas';
    }
    if (selectedSelections.length === 1) {
      const s = selectedSelections[0];
      const mObj = MESES.find((m) => m.id === s.mes);
      return `${mObj?.nombre || 'MES'} ${s.anio}`;
    }
    return selectedSelections.length > 1
      ? `Multiple selections (${selectedSelections.length})`
      : 'Seleccionar período';
  };

  return (
    <div className="period-filter-container">
      {/* Mode Switcher */}
      {onPeriodTypeChange && (
        <div className="period-mode-toggle">
          <button
            type="button"
            className={`period-mode-btn ${periodType === 'mes' ? 'period-mode-btn--active' : ''}`}
            onClick={() => onPeriodTypeChange('mes')}
          >
            Mensual
          </button>
          <button
            type="button"
            className={`period-mode-btn ${periodType === 'semana' ? 'period-mode-btn--active' : ''}`}
            onClick={() => onPeriodTypeChange('semana')}
          >
            Semanal
          </button>
        </div>
      )}

      {/* Dropdown */}
      <div className="period-filter-dropdown" ref={containerRef}>
        <button
          type="button"
          className={`period-filter-trigger ${isOpen ? 'period-filter-trigger--open' : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Abrir filtro de períodos"
        >
          <span className="period-filter-label">
            {periodType === 'semana' ? 'AÑOS/SEMANA' : 'AÑOS/MES'}
          </span>
          <span className="period-filter-value">{getButtonLabel()}</span>
          <ChevronDown size={14} className="period-filter-chevron" />
        </button>

        {isOpen && (
          <div className="period-filter-menu">
            {loading ? (
              <div style={{ padding: '12px 16px', fontSize: '13px', opacity: 0.6 }}>
                Cargando períodos disponibles…
              </div>
            ) : (
              <div className="period-filter-tree">
                {availableYears.length === 0 && (
                  <div style={{ padding: '12px 16px', fontSize: '13px', opacity: 0.6 }}>
                    Sin datos disponibles
                  </div>
                )}
                {availableYears.map((yr) => {
                  const isExpanded = expandedYears[yr] ?? false;
                  const checkStatus = getYearCheckStatus(yr);
                  const items = itemsForYear(yr);

                  return (
                    <div key={yr} className="tree-year-group">
                      <div className="tree-year-header">
                        <button
                          type="button"
                          className="tree-expand-btn"
                          onClick={() => toggleYearExpand(yr)}
                        >
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>

                        <label className="tree-checkbox-container">
                          <div
                            className={`custom-checkbox ${
                              checkStatus === 'all'
                                ? 'custom-checkbox--checked'
                                : checkStatus === 'indeterminate'
                                ? 'custom-checkbox--indeterminate'
                                : ''
                            }`}
                            onClick={() => handleToggleYearAll(yr)}
                          >
                            {checkStatus === 'all' && <Check size={12} strokeWidth={3} />}
                            {checkStatus === 'indeterminate' && (
                              <span className="indeterminate-box" />
                            )}
                          </div>
                          <span className="tree-year-title">{yr}</span>
                        </label>
                      </div>

                      {isExpanded && (
                        <div className="tree-items-list">
                          {items.map((id) => {
                            const isChecked = isItemSelected(yr, id);
                            const name =
                              periodType === 'semana'
                                ? `Semana ${id}`
                                : MESES.find((m) => m.id === id)?.nombre || `MES ${id}`;
                            return (
                              <div
                                key={`${yr}-${id}`}
                                className="tree-sub-item"
                                onClick={() => handleToggleItem(yr, id)}
                              >
                                <div
                                  className={`custom-checkbox ${
                                    isChecked ? 'custom-checkbox--checked' : ''
                                  }`}
                                >
                                  {isChecked && <Check size={12} strokeWidth={3} />}
                                </div>
                                <span className="tree-sub-item-name">{name}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
