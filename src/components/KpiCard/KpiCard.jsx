import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import './KpiCard.css';

export default function KpiCard({ label, value, change, changeLabel, trend, icon: Icon }) {
  const trendClass =
    trend === 'up' ? 'kpi-card__change--up' :
    trend === 'down' ? 'kpi-card__change--down' :
    'kpi-card__change--neutral';

  const TrendIcon =
    trend === 'up' ? TrendingUp :
    trend === 'down' ? TrendingDown :
    Minus;

  return (
    <div className="kpi-card">
      <div className="kpi-card__header">
        <span className="kpi-card__label label-mono">{label}</span>
        {Icon && (
          <span className="kpi-card__icon">
            <Icon size={20} />
          </span>
        )}
      </div>
      <div className="kpi-card__value">{value}</div>
      <div className={`kpi-card__change ${trendClass}`}>
        <TrendIcon size={14} />
        <span className="kpi-card__change-value">{change}</span>
        {changeLabel && <span className="kpi-card__change-label">{changeLabel}</span>}
      </div>
    </div>
  );
}
