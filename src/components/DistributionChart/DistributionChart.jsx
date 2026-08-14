import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line,
} from 'recharts';
import './DistributionChart.css';

const CHART_COLORS = ['#0F172A', '#334155', '#0EA5E9', '#38BDF8', '#64748B', '#94A3B8'];

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="dist-chart__tooltip">
        <p className="dist-chart__tooltip-label">{data.name || data.payload?.name}</p>
        <p className="dist-chart__tooltip-value">
          {typeof data.value === 'number'
            ? `$${data.value.toLocaleString()}`
            : data.value}
        </p>
      </div>
    );
  }
  return null;
}

function CustomLegend({ payload }) {
  return (
    <div className="dist-chart__legend">
      {payload.map((entry, index) => (
        <div key={index} className="dist-chart__legend-item">
          <span
            className="dist-chart__legend-dot"
            style={{ backgroundColor: entry.color }}
          />
          <span className="dist-chart__legend-text">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function DistributionChart({ title, subtitle, data, type = 'donut' }) {
  return (
    <div className="dist-chart">
      <div className="dist-chart__header">
        <h4 className="dist-chart__title">{title}</h4>
        {subtitle && <p className="dist-chart__subtitle">{subtitle}</p>}
      </div>
      <div className="dist-chart__body">
        <ResponsiveContainer width="100%" height={220}>
          {type === 'donut' ? (
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color || CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
            </PieChart>
          ) : type === 'bar' ? (
            <BarChart data={data} barCategoryGap="20%">
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#64748B', fontFamily: 'JetBrains Mono' }}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    key={`bar-${index}`}
                    fill={index === data.length - 1 ? '#0EA5E9' : '#CBD5E1'}
                  />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#64748B', fontFamily: 'JetBrains Mono' }}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#0EA5E9"
                strokeWidth={2.5}
                dot={{ fill: '#0EA5E9', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
