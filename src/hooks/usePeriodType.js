import { useState, useEffect, useCallback } from 'react';
import { fetchSemanasDisponibles, fetchMesesDisponibles } from '../services/ingresosService';

/**
 * Shared hook for period type + selection management.
 *
 * Initial load:  all months of the most recent year that has data.
 * Switch to 'semana': all weeks of the most recent year that has weekly data.
 * Switch to 'mes':    all months of the most recent year that has monthly data.
 *
 * Everything comes from the DB — nothing is hardcoded.
 */
export function usePeriodType() {
  const [periodType, setPeriodType]           = useState('mes');
  const [selectedPeriods, setSelectedPeriods] = useState([]);
  const [initialized, setInitialized]         = useState(false);

  // Load initial month selection from DB on mount
  useEffect(() => {
    async function init() {
      try {
        const meses = await fetchMesesDisponibles();
        if (meses && meses.length > 0) {
          // Pick the most recent year and select ALL its months
          const latestYear = Math.max(...meses.map((m) => m.anio));
          const monthsOfLatestYear = meses
            .filter((m) => m.anio === latestYear)
            .map((m) => ({ anio: m.anio, mes: m.mes }));
          setSelectedPeriods(monthsOfLatestYear);
        }
      } catch (err) {
        console.warn('usePeriodType init error:', err);
      } finally {
        setInitialized(true);
      }
    }
    init();
  }, []);

  const handlePeriodTypeChange = useCallback(async (newType) => {
    setPeriodType(newType);
    try {
      if (newType === 'semana') {
        const semanas = await fetchSemanasDisponibles();
        if (semanas && semanas.length > 0) {
          // All weeks of the most recent year
          const latestYear = Math.max(...semanas.map((s) => s.anio));
          const weeksOfLatestYear = semanas
            .filter((s) => s.anio === latestYear)
            .map((s) => ({ anio: s.anio, semana: s.semana }));
          setSelectedPeriods(weeksOfLatestYear);
        } else {
          setSelectedPeriods([]);
        }
      } else {
        const meses = await fetchMesesDisponibles();
        if (meses && meses.length > 0) {
          const latestYear = Math.max(...meses.map((m) => m.anio));
          const monthsOfLatestYear = meses
            .filter((m) => m.anio === latestYear)
            .map((m) => ({ anio: m.anio, mes: m.mes }));
          setSelectedPeriods(monthsOfLatestYear);
        } else {
          setSelectedPeriods([]);
        }
      }
    } catch (err) {
      console.warn('usePeriodType switch error:', err);
    }
  }, []);

  return { periodType, selectedPeriods, setSelectedPeriods, handlePeriodTypeChange, initialized };
}
