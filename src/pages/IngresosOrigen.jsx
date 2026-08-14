import { useState, useEffect, useCallback } from 'react';
import { Plane, Receipt, Tag } from 'lucide-react';
import KpiCard from '../components/KpiCard/KpiCard';
import DataTable from '../components/DataTable/DataTable';
import DistributionChart from '../components/DistributionChart/DistributionChart';
import PeriodFilterDropdown from '../components/Filters/PeriodFilterDropdown';
import {
  LoadingScreen,
  ErrorScreen,
  EmptyScreen,
} from '../components/Feedback/FeedbackStates';
import {
  fetchIngresosOrigen,
  fetchPeriodosDisponibles,
} from '../services/ingresosService';
import './MonthlyEarnings.css';

export default function IngresosOrigen() {
  const [selectedPeriods, setSelectedPeriods] = useState([{ anio: 2026, mes: 6 }]);
  const [availablePeriods, setAvailablePeriods] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadPeriods() {
      try {
        const periods = await fetchPeriodosDisponibles();
        if (periods && periods.length > 0) {
          setAvailablePeriods(periods);
        }
      } catch (err) {
        console.warn('Error loading periods:', err);
      }
    }
    loadPeriods();
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchIngresosOrigen(selectedPeriods);
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching origen data:', err);
      setError(err.message || 'Error al consultar datos de Origen');
    } finally {
      setLoading(false);
    }
  }, [selectedPeriods]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="page monthly-page">
      {/* Top Header */}
      <div className="page__top">
        <div className="page__title-block">
          <h2 className="page__title">
            {dashboardData?.meta?.title || 'Ingresos Origen (Aeropuerto)'}
          </h2>
          <p className="page__subtitle">
            {dashboardData?.meta?.subtitle || 'Ventas Mensuales - Aeropuerto por Kusi, Wari + Wally y Tipo de Cliente'}
          </p>
        </div>

        {/* Multi-Period Tree Filter Dropdown (Foto 4) */}
        <div className="page__filters">
          <PeriodFilterDropdown
            selectedSelections={selectedPeriods}
            onSelectionChange={setSelectedPeriods}
            availablePeriods={availablePeriods}
          />
        </div>
      </div>

      {/* ERROR STATE */}
      {error && !loading && (
        <ErrorScreen
          title="Error al consultar datos de Origen"
          message={error}
          onRetry={loadData}
        />
      )}

      {/* LOADING */}
      {loading && !dashboardData && (
        <LoadingScreen
          title="Cargando ingresos de Origen (Aeropuerto)..."
          subtitle="Agrupando por Kusi, Wari + Wally y Tipo de Cliente (Corporativo / Particular)"
        />
      )}

      {/* MAIN CONTENT (Hierarchy: Año -> Aeropuerto -> Kusi/Wari+Wally -> Tipo de Cliente) */}
      {dashboardData && !error && (
        <>
          <div className="page__kpis">
            <KpiCard
              label={dashboardData.kpis.ingresoTotal.label}
              value={dashboardData.kpis.ingresoTotal.formatted}
              change={dashboardData.kpis.ingresoTotal.change}
              changeLabel={dashboardData.kpis.ingresoTotal.changeLabel}
              trend={dashboardData.kpis.ingresoTotal.trend}
              icon={Plane}
            />
            <KpiCard
              label={dashboardData.kpis.nroTransacciones.label}
              value={dashboardData.kpis.nroTransacciones.formatted}
              change={dashboardData.kpis.nroTransacciones.change}
              changeLabel={dashboardData.kpis.nroTransacciones.changeLabel}
              trend={dashboardData.kpis.nroTransacciones.trend}
              icon={Receipt}
            />
            <KpiCard
              label={dashboardData.kpis.ticketPromedio.label}
              value={dashboardData.kpis.ticketPromedio.formatted}
              change={dashboardData.kpis.ticketPromedio.change}
              changeLabel={dashboardData.kpis.ticketPromedio.changeLabel}
              trend={dashboardData.kpis.ticketPromedio.trend}
              icon={Tag}
            />
          </div>

          <div className="page__content-grid">
            <div className="page__table-area">
              <DataTable
                title="Detalle Origen por Canal y Tipo de Cliente"
                columns={dashboardData.tableData.columns}
                rows={dashboardData.tableData.rows}
                totalRow={dashboardData.tableData.totalRow}
                groupHeaders={dashboardData.tableData.groupHeaders}
              />
            </div>
            <div className="page__chart-area">
              <DistributionChart
                title="Distribución Origen"
                data={dashboardData.distribution}
                type="donut"
              />
              <div className="page__period-label">{dashboardData.meta.period}</div>
            </div>
          </div>
        </>
      )}

      {/* EMPTY STATE */}
      {!loading && !error && (!dashboardData || dashboardData.tableData.rows.length === 0) && (
        <EmptyScreen
          title="No hay datos registrados en Origen"
          message="No se encontraron registros para los períodos seleccionados."
          actionLabel="Ver Junio 2026"
          onAction={() => {
            setSelectedPeriods([{ anio: 2026, mes: 6 }]);
          }}
        />
      )}
    </div>
  );
}
