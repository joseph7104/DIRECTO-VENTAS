import { CalendarDays, Camera, ClipboardList, ShoppingCart, ChevronDown } from 'lucide-react';
import KpiCard from '../components/KpiCard/KpiCard';
import DataTable from '../components/DataTable/DataTable';
import DistributionChart from '../components/DistributionChart/DistributionChart';
import { dailyKpis, dailyTableData, dailyDistribution, dailyMeta } from '../data/dailyData';
import './DailyEarnings.css';

export default function DailyEarnings() {
  return (
    <div className="page daily-page">
      <div className="page__top">
        <div className="page__title-block">
          <h2 className="page__title">{dailyMeta.title}</h2>
          <p className="page__subtitle">{dailyMeta.subtitle}</p>
        </div>
        <div className="page__filters">
          <button className="page__date-selector">
            <CalendarDays size={16} />
            <span>{dailyMeta.dateRange}</span>
            <ChevronDown size={14} />
          </button>
        </div>
      </div>

      <div className="page__kpis">
        <KpiCard
          label={dailyKpis.ingresoTotal.label}
          value={dailyKpis.ingresoTotal.formatted}
          change={dailyKpis.ingresoTotal.change}
          changeLabel={dailyKpis.ingresoTotal.changeLabel}
          trend={dailyKpis.ingresoTotal.trend}
          icon={Camera}
        />
        <KpiCard
          label={dailyKpis.nroTransacciones.label}
          value={dailyKpis.nroTransacciones.formatted}
          change={dailyKpis.nroTransacciones.change}
          changeLabel={dailyKpis.nroTransacciones.changeLabel}
          trend={dailyKpis.nroTransacciones.trend}
          icon={ClipboardList}
        />
        <KpiCard
          label={dailyKpis.ticketPromedio.label}
          value={dailyKpis.ticketPromedio.formatted}
          change={dailyKpis.ticketPromedio.change}
          changeLabel={dailyKpis.ticketPromedio.changeLabel}
          trend={dailyKpis.ticketPromedio.trend}
          icon={ShoppingCart}
        />
      </div>

      <div className="page__content-grid">
        <div className="page__table-area">
          <DataTable
            title={`Detalle por Día (Semana 4 - Julio 2025)`}
            columns={dailyTableData.columns}
            rows={dailyTableData.rows}
            hasStatusColumn={true}
          />
        </div>
        <div className="page__chart-area">
          <DistributionChart
            title="Tendencia de Ingresos"
            subtitle="Últimos 7 días"
            data={dailyDistribution}
            type="line"
          />
        </div>
      </div>
    </div>
  );
}
