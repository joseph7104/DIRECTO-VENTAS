import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Check } from 'lucide-react';
import { MESES } from '../../services/ingresosService';
import './PeriodFilterDropdown.css';

/**
 * Hierarchical Year/Month Checkbox Filter Dropdown matching Photo 4
 */
export default function PeriodFilterDropdown({
  selectedSelections = [{ anio: 2026, mes: 6 }],
  onSelectionChange,
  availablePeriods = [
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
  ],
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedYears, setExpandedYears] = useState({ 2026: true, 2025: false });
  const containerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Group available periods by year
  const yearsMap = {};
  availablePeriods.forEach((p) => {
    if (!yearsMap[p.anio]) {
      yearsMap[p.anio] = [];
    }
    if (!yearsMap[p.anio].includes(p.mes)) {
      yearsMap[p.anio].push(p.mes);
    }
  });

  const availableYears = Object.keys(yearsMap)
    .map(Number)
    .sort((a, b) => b - a);

  // Toggle Year expand/collapse
  const toggleYearExpand = (yr) => {
    setExpandedYears((prev) => ({
      ...prev,
      [yr]: !prev[yr],
    }));
  };

  // Check if month is selected
  const isMonthSelected = (yr, mes) => {
    return selectedSelections.some((s) => s.anio === yr && s.mes === mes);
  };

  // Toggle Month
  const handleToggleMonth = (yr, mes) => {
    const exists = isMonthSelected(yr, mes);
    let next;
    if (exists) {
      next = selectedSelections.filter((s) => !(s.anio === yr && s.mes === mes));
      if (next.length === 0) {
        // Keep at least one selection
        return;
      }
    } else {
      next = [...selectedSelections, { anio: yr, mes }];
    }
    onSelectionChange(next);
  };

  // Toggle All Months of a Year
  const handleToggleYearAll = (yr) => {
    const yearMonths = yearsMap[yr] || [];
    const allSelected = yearMonths.every((m) => isMonthSelected(yr, m));

    let next;
    if (allSelected) {
      // Remove all months of this year
      next = selectedSelections.filter((s) => s.anio !== yr);
      if (next.length === 0) return;
    } else {
      // Select all months of this year
      const otherSelections = selectedSelections.filter((s) => s.anio !== yr);
      const newForYear = yearMonths.map((m) => ({ anio: yr, mes: m }));
      next = [...otherSelections, ...newForYear];
    }
    onSelectionChange(next);
  };

  // Get status of year (all, some, none)
  const getYearCheckStatus = (yr) => {
    const yearMonths = yearsMap[yr] || [];
    const selectedCount = yearMonths.filter((m) => isMonthSelected(yr, m)).length;
    if (selectedCount === 0) return 'none';
    if (selectedCount === yearMonths.length) return 'all';
    return 'indeterminate';
  };

  // Format label for button
  const getButtonLabel = () => {
    if (selectedSelections.length === 1) {
      const sel = selectedSelections[0];
      const mObj = MESES.find((m) => m.id === sel.mes);
      return `${mObj?.nombre || 'MES'} ${sel.anio}`;
    }
    if (selectedSelections.length > 1) {
      return `Multiple selections (${selectedSelections.length})`;
    }
    return 'Multiple selections';
  };

  return (
    <div className="period-filter-dropdown" ref={containerRef}>
      <button
        type="button"
        className={`period-filter-trigger ${isOpen ? 'period-filter-trigger--open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Abrir filtro de años y meses"
      >
        <span className="period-filter-label">AÑOS/MES</span>
        <span className="period-filter-value">{getButtonLabel()}</span>
        <ChevronDown size={14} className="period-filter-chevron" />
      </button>

      {isOpen && (
        <div className="period-filter-menu">
          <div className="period-filter-tree">
            {availableYears.map((yr) => {
              const isExpanded = expandedYears[yr] ?? true;
              const checkStatus = getYearCheckStatus(yr);
              const yearMonths = (yearsMap[yr] || []).sort((a, b) => a - b);

              return (
                <div key={yr} className="tree-year-group">
                  {/* Year Header Item */}
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
                          <span className="indeterminate-box"></span>
                        )}
                      </div>
                      <span className="tree-year-title">{yr}</span>
                    </label>
                  </div>

                  {/* Months List */}
                  {isExpanded && (
                    <div className="tree-months-list">
                      {yearMonths.map((mId) => {
                        const mObj = MESES.find((m) => m.id === mId);
                        const isChecked = isMonthSelected(yr, mId);

                        return (
                          <div
                            key={`${yr}-${mId}`}
                            className="tree-month-item"
                            onClick={() => handleToggleMonth(yr, mId)}
                          >
                            <div
                              className={`custom-checkbox ${
                                isChecked ? 'custom-checkbox--checked' : ''
                              }`}
                            >
                              {isChecked && <Check size={12} strokeWidth={3} />}
                            </div>
                            <span className="tree-month-name">{mObj?.nombre || `MES ${mId}`}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
