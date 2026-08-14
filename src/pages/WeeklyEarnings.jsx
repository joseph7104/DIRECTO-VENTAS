import { CalendarDays, Camera, ClipboardList, ShoppingCart, ChevronDown } from 'lucide-react';
import KpiCard from '../components/KpiCard/KpiCard';
import DataTable from '../components/DataTable/DataTable';
import DistributionChart from '../components/DistributionChart/DistributionChart';
import { weeklyKpis, weeklyTableData, weeklyDistribution, weeklyMeta } from '../data/weeklyData';
import './WeeklyEarnings.css';

export default function WeeklyEarnings() {
  return (
    <div className="page weekly-page">
      <div className="page__top">
        <div className="page__title-block">
          <h2 className="page__title">{weeklyMeta.title}</h2>
          <p className="page__subtitle">{weeklyMeta.subtitle}</p>
        </div>
        <div className="page__filters">
          <button className="page__date-selector">
            <CalendarDays size={16} />
            <span>{weeklyMeta.dateRange}</span>
            <ChevronDown size={14} />
          </button>
        </div>
      </div>

      <div className="page__kpis">
        <KpiCard
          label={weeklyKpis.ingresoTotal.label}
          value={weeklyKpis.ingresoTotal.formatted}
          change={weeklyKpis.ingresoTotal.change}
          changeLabel={weeklyKpis.ingresoTotal.changeLabel}
          trend={weeklyKpis.ingresoTotal.trend}
          icon={Camera}
        />
        <KpiCard
          label={weeklyKpis.nroTransacciones.label}
          value={weeklyKpis.nroTransacciones.formatted}
          change={weeklyKpis.nroTransacciones.change}
          changeLabel={weeklyKpis.nroTransacciones.changeLabel}
          trend={weeklyKpis.nroTransacciones.trend}
          icon={ClipboardList}
        />
        <KpiCard
          label={weeklyKpis.ticketPromedio.label}
          value={weeklyKpis.ticketPromedio.formatted}
          change={weeklyKpis.ticketPromedio.change}
          changeLabel={weeklyKpis.ticketPromedio.changeLabel}
          trend={weeklyKpis.ticketPromedio.trend}
          icon={ShoppingCart}
        />
      </div>

      <div className="page__content-grid">
        <div className="page__table-area">
          <DataTable
            title={`Detalle por Semana (Julio 2025)`}
            columns={weeklyTableData.columns}
            rows={weeklyTableData.rows}
            hasStatusColumn={true}
          />
          <div className="page__view-more">
            <button>
              Ver Semanas Anteriores
              <ChevronDown size={14} />
            </button>
          </div>
        </div>
        <div className="page__chart-area">
          <DistributionChart
            title="Distribución de Ingresos"
            subtitle="Tendencia Semanal - Julio"
            data={weeklyDistribution}
            type="bar"
          />
        </div>
      </div>
    </div>
  );
}
