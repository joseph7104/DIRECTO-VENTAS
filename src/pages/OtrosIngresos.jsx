import { useState, useEffect, useCallback } from 'react';
import { Layers, Receipt, Tag } from 'lucide-react';
import KpiCard from '../components/KpiCard/KpiCard';
import DataTable from '../components/DataTable/DataTable';
import PeriodFilterDropdown from '../components/Filters/PeriodFilterDropdown';
import {
  LoadingScreen,
  ErrorScreen,
  EmptyScreen,
} from '../components/Feedback/FeedbackStates';
import { fetchOtrosIngresos } from '../services/ingresosService';
import { usePeriodType } from '../hooks/usePeriodType';
import './MonthlyEarnings.css';

export default function OtrosIngresos() {
  const { periodType, selectedPeriods, setSelectedPeriods, handlePeriodTypeChange, initialized } = usePeriodType();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  // Fetch data
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOtrosIngresos(selectedPeriods, periodType);
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching Otros Ingresos data:', err);
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
            {dashboardData?.meta?.title || 'OTROS INGRESOS'}
          </h2>
          <p className="page__subtitle">
            {dashboardData?.meta?.subtitle ||
              (periodType === 'semana'
                ? 'Ventas Semanales - Flit, Flit - Costa del Sol, Flit - Directo, Logistic y Migo'
                : 'Ventas Mensuales - Flit, Flit - Costa del Sol, Flit - Directo, Logistic y Migo')}
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
          title="Error al consultar datos de Otros Ingresos"
          message={`No se pudieron obtener los datos de la base de datos: ${error}`}
          onRetry={loadData}
        />
      )}

      {/* LOADING STATE */}
      {loading && !dashboardData && (
        <LoadingScreen
          title="Cargando Otros Ingresos..."
          subtitle="Procesando métricas para Flit, Flit - Costa del Sol, Flit - Directo, Logistic y Migo"
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
              icon={Layers}
            />
            <KpiCard
              label={dashboardData.kpis.nroNegocios.label}
              value={dashboardData.kpis.nroNegocios.formatted}
              change={dashboardData.kpis.nroNegocios.change}
              changeLabel={dashboardData.kpis.nroNegocios.changeLabel}
              trend={dashboardData.kpis.nroNegocios.trend}
              icon={Receipt}
            />
            <KpiCard
              label={dashboardData.kpis.promedioMensual.label}
              value={dashboardData.kpis.promedioMensual.formatted}
              change={dashboardData.kpis.promedioMensual.change}
              changeLabel={dashboardData.kpis.promedioMensual.changeLabel}
              trend={dashboardData.kpis.promedioMensual.trend}
              icon={Tag}
            />
          </div>

          {/* Full Width Table Layout */}
          <div className="page__content-grid">
            <div className="page__table-area">
              <DataTable
                title="Detalle Otros Ingresos"
                columns={dashboardData.tableData.columns}
                rows={dashboardData.tableData.rows}
                totalRow={dashboardData.tableData.totalRow}
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
          actionLabel="Ver Enero a Marzo 2025"
          onAction={() => {
            handlePeriodTypeChange('mes');
          }}
        />
      )}
    </div>
  );
}
