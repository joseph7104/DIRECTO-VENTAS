import { useState, useEffect, useCallback } from 'react';
import { Plane, Receipt, Tag } from 'lucide-react';
import KpiCard from '../components/KpiCard/KpiCard';
import DataTable from '../components/DataTable/DataTable';
import PeriodFilterDropdown from '../components/Filters/PeriodFilterDropdown';
import {
  LoadingScreen,
  ErrorScreen,
  EmptyScreen,
} from '../components/Feedback/FeedbackStates';
import { fetchIngresosOrigen } from '../services/ingresosService';
import { usePeriodType } from '../hooks/usePeriodType';
import './MonthlyEarnings.css';

export default function IngresosOrigen() {
  const { periodType, selectedPeriods, setSelectedPeriods, handlePeriodTypeChange, initialized } = usePeriodType();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchIngresosOrigen(selectedPeriods, periodType);
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching origen data:', err);
      setError(err.message || 'Error al consultar datos de Origen');
    } finally {
      setLoading(false);
    }
  }, [selectedPeriods, periodType]);

  useEffect(() => {
    if (initialized && selectedPeriods.length > 0) loadData();
  }, [loadData, initialized]);

  return (
    <div className="page monthly-page">
      {/* Top Header */}
      <div className="page__top">
        <div className="page__title-block">
          <h2 className="page__title">
            {dashboardData?.meta?.title || 'Ingresos Origen (Aeropuerto)'}
          </h2>
          <p className="page__subtitle">
            {dashboardData?.meta?.subtitle ||
              (periodType === 'semana'
                ? 'Ventas Semanales - Aeropuerto por Kusi, Wari + Wally y Tipo de Cliente'
                : 'Ventas Mensuales - Aeropuerto por Kusi, Wari + Wally y Tipo de Cliente')}
          </p>
        </div>

        {/* Multi-Period Tree Filter Dropdown with Mode Toggle */}
        <div className="page__filters">
          <PeriodFilterDropdown
            periodType={periodType}
            onPeriodTypeChange={handlePeriodTypeChange}
            selectedSelections={selectedPeriods}
            onSelectionChange={setSelectedPeriods}
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

      {/* MAIN CONTENT */}
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
            handlePeriodTypeChange('mes');
          }}
        />
      )}
    </div>
  );
}
