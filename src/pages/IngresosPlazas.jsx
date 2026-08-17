import { useState } from 'react';
import { Store } from 'lucide-react';
import PeriodFilterDropdown from '../components/Filters/PeriodFilterDropdown';
import './MonthlyEarnings.css';

export default function IngresosPlazas() {
  const [periodType, setPeriodType] = useState('mes');
  const [selectedPeriods, setSelectedPeriods] = useState([{ anio: 2026, mes: 6 }]);

  const handlePeriodTypeChange = (newType) => {
    setPeriodType(newType);
    if (newType === 'semana') {
      setSelectedPeriods([
        { anio: 2026, semana: 1 },
        { anio: 2026, semana: 2 },
        { anio: 2026, semana: 3 },
      ]);
    } else {
      setSelectedPeriods([{ anio: 2026, mes: 6 }]);
    }
  };

  return (
    <div className="page monthly-page">
      <div className="page__top">
        <div className="page__title-block">
          <h2 className="page__title">INGRESOS PLAZAS</h2>
          <p className="page__subtitle">
            Análisis y rendimiento de ingresos por plazas y estaciones comerciales.
          </p>
        </div>

        {/* Filter on top */}
        <div className="page__filters">
          <PeriodFilterDropdown
            periodType={periodType}
            onPeriodTypeChange={handlePeriodTypeChange}
            selectedSelections={selectedPeriods}
            onSelectionChange={setSelectedPeriods}
          />
        </div>
      </div>

      <div style={{ background: '#ffffff', borderRadius: 12, padding: 40, border: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b', marginTop: 20 }}>
        <Store size={40} style={{ color: '#0284c7', margin: '0 auto 16px' }} />
        <h3 style={{ color: '#0f172a', marginBottom: 8, fontSize: 18, fontWeight: 700 }}>Módulo de Ingresos Plazas</h3>
        <p>Visualización y análisis de puntos de venta y plazas comerciales.</p>
      </div>
    </div>
  );
}
