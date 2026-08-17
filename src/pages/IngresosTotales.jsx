import { useState, useEffect, useCallback } from 'react';
import { Banknote, Receipt, Tag } from 'lucide-react';
import KpiCard from '../components/KpiCard/KpiCard';
import DataTable from '../components/DataTable/DataTable';
import PeriodFilterDropdown from '../components/Filters/PeriodFilterDropdown';
import {
  LoadingScreen,
  ErrorScreen,
  EmptyScreen,
} from '../components/Feedback/FeedbackStates';
import { fetchIngresosTotalesMulti } from '../services/ingresosService';
import { usePeriodType } from '../hooks/usePeriodType';
import './MonthlyEarnings.css';

export default function IngresosTotales() {
  const { periodType, selectedPeriods, setSelectedPeriods, handlePeriodTypeChange, initialized } = usePeriodType();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchIngresosTotalesMulti(selectedPeriods, periodType);
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Error al conectar con la base de datos');
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
            {dashboardData?.meta?.title || 'Ingresos por Negocio'}
          </h2>
          <p className="page__subtitle">
            {dashboardData?.meta?.subtitle ||
              (periodType === 'semana' ? 'Ventas Semanales' : 'Ventas Mensuales')}
          </p>
        </div>

        {/* Tree Filter Dropdown with Mode Toggle */}
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
          title="Error al consultar datos"
          message={`No se pudieron obtener los datos de la base de datos: ${error}`}
          onRetry={loadData}
        />
      )}

      {/* INITIAL FULL SCREEN LOADING */}
      {loading && !dashboardData && (
        <LoadingScreen
          title="Cargando información desde Supabase..."
          subtitle="Procesando métricas para Aeropuerto, Ciudad y Aerolíneas"
        />
      )}

      {/* MAIN CONTENT */}
      {dashboardData && !error && (
        <>
          {/* KPI Cards */}
          <div className="page__kpis">
            <KpiCard
              label={dashboardData.kpis.ingresoTotal.label}
              value={dashboardData.kpis.ingresoTotal.formatted}
              change={dashboardData.kpis.ingresoTotal.change}
              changeLabel={dashboardData.kpis.ingresoTotal.changeLabel}
              trend={dashboardData.kpis.ingresoTotal.trend}
              icon={Banknote}
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

          {/* Full Width Table Layout */}
          <div className="page__content-grid">
            <div className="page__table-area">
              <DataTable
                title="Detalle por Negocio"
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
          title="No hay datos registrados"
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
