import { Camera, ClipboardList, ShoppingCart } from 'lucide-react';
import KpiCard from '../components/KpiCard/KpiCard';
import DataTable from '../components/DataTable/DataTable';
import DistributionChart from '../components/DistributionChart/DistributionChart';
import { monthlyKpis, monthlyTableData, monthlyDistribution, monthlyMeta } from '../data/monthlyData';
import './MonthlyEarnings.css';

export default function MonthlyEarnings() {
  const groupHeaders = [
    { label: '', colSpan: 1 },
    { label: 'JULIO', colSpan: 3, highlight: false },
    { label: 'TOTAL', colSpan: 3, highlight: true },
  ];

  return (
    <div className="page monthly-page">
      <div className="page__top">
        <div className="page__title-block">
          <h2 className="page__title">{monthlyMeta.title}</h2>
          <p className="page__subtitle">{monthlyMeta.subtitle}</p>
        </div>
        <div className="page__filters">
          <select className="page__select" defaultValue="julio-2025">
            <option value="julio-2025">AÑOS/MES Multiple selections</option>
          </select>
        </div>
      </div>

      <div className="page__kpis">
        <KpiCard
          label={monthlyKpis.ingresoTotal.label}
          value={monthlyKpis.ingresoTotal.formatted}
          change={monthlyKpis.ingresoTotal.change}
          changeLabel={monthlyKpis.ingresoTotal.changeLabel}
          trend={monthlyKpis.ingresoTotal.trend}
          icon={Camera}
        />
        <KpiCard
          label={monthlyKpis.nroTransacciones.label}
          value={monthlyKpis.nroTransacciones.formatted}
          change={monthlyKpis.nroTransacciones.change}
          changeLabel={monthlyKpis.nroTransacciones.changeLabel}
          trend={monthlyKpis.nroTransacciones.trend}
          icon={ClipboardList}
        />
        <KpiCard
          label={monthlyKpis.ticketPromedio.label}
          value={monthlyKpis.ticketPromedio.formatted}
          change={monthlyKpis.ticketPromedio.change}
          changeLabel={monthlyKpis.ticketPromedio.changeLabel}
          trend={monthlyKpis.ticketPromedio.trend}
          icon={ShoppingCart}
        />
      </div>

      <div className="page__content-grid">
        <div className="page__table-area">
          <DataTable
            title="Detalle por Negocio"
            columns={monthlyTableData.columns}
            rows={monthlyTableData.rows}
            totalRow={monthlyTableData.totalRow}
            groupHeaders={groupHeaders}
          />
        </div>
        <div className="page__chart-area">
          <DistributionChart
            title="Distribución de Ingresos"
            data={monthlyDistribution}
            type="donut"
          />
          <div className="page__period-label">{monthlyMeta.period}</div>
        </div>
      </div>
    </div>
  );
}
