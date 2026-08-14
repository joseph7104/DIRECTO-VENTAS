import { useState } from 'react';
import { Layers } from 'lucide-react';
import PeriodFilterDropdown from '../components/Filters/PeriodFilterDropdown';
import './MonthlyEarnings.css';

export default function OtrosIngresos() {
  const [selectedPeriods, setSelectedPeriods] = useState([{ anio: 2026, mes: 6 }]);

  return (
    <div className="page monthly-page">
      <div className="page__top">
        <div className="page__title-block">
          <h2 className="page__title">OTROS INGRESOS</h2>
          <p className="page__subtitle">
            Análisis consolidado de otros conceptos, recargos y servicios adicionales.
          </p>
        </div>

        {/* Filter on top */}
        <div className="page__filters">
          <PeriodFilterDropdown
            selectedSelections={selectedPeriods}
            onSelectionChange={setSelectedPeriods}
          />
        </div>
      </div>

      <div style={{ background: '#ffffff', borderRadius: 12, padding: 40, border: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b', marginTop: 20 }}>
        <Layers size={40} style={{ color: '#0284c7', margin: '0 auto 16px' }} />
        <h3 style={{ color: '#0f172a', marginBottom: 8, fontSize: 18, fontWeight: 700 }}>Módulo de Otros Ingresos</h3>
        <p>Visualización y desglose de recargos y conceptos complementarios.</p>
      </div>
    </div>
  );
}
