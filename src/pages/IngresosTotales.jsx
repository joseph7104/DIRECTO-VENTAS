import { useState, useEffect, useCallback } from 'react';
import { Banknote, Receipt, Tag } from 'lucide-react';
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
  fetchIngresosTotalesMulti,
  fetchPeriodosDisponibles,
} from '../services/ingresosService';
import './MonthlyEarnings.css';

export default function IngresosTotales() {
  const [selectedPeriods, setSelectedPeriods] = useState([{ anio: 2026, mes: 6 }]);
  const [availablePeriods, setAvailablePeriods] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load available periods on mount
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

  // Fetch data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchIngresosTotalesMulti(selectedPeriods);
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Error al conectar con la base de datos');
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
            {dashboardData?.meta?.title || 'Ingresos por Negocio'}
          </h2>
          <p className="page__subtitle">
            {dashboardData?.meta?.subtitle || 'Ventas Mensuales'}
          </p>
        </div>

        {/* Tree Filter Dropdown (Photo 4) */}
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

      {/* MAIN CONTENT (EXACT DESIGN) */}
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

          {/* Grid Layout: DataTable (Left) + DistributionChart (Right) */}
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
            <div className="page__chart-area">
              <DistributionChart
                title="Distribución de Ingresos"
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
          title="No hay datos registrados"
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
