import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  MapPin,
  Building2,
  Plane,
  Store,
  Layers,
  FileDown,
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { to: '/ingresos-totales', label: 'INGRESOS TOTALES', icon: BarChart3 },
  { to: '/ingresos-origen', label: 'INGRESOS ORIGEN', icon: MapPin },
  { to: '/ingresos-ciudad', label: 'INGRESOS CIUDAD', icon: Building2 },
  { to: '/ingresos-aerolineas', label: 'INGRESOS AEROLÍNEAS', icon: Plane },
  { to: '/ingresos-plazas', label: 'INGRESOS PLAZAS', icon: Store },
  { to: '/otros-ingresos', label: 'OTROS INGRESOS', icon: Layers },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__header">
        <div className="sidebar__logo">
          <div className="sidebar__logo-icon">
            <BarChart3 size={20} strokeWidth={2.5} />
          </div>
          <div className="sidebar__logo-text">
            <span className="sidebar__logo-name">DIRECTO</span>
            <span className="sidebar__logo-tagline">ENTERPRISE ANALYTICS</span>
          </div>
        </div>
      </div>

      <nav className="sidebar__nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`
              }
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar__footer">
        <button className="sidebar__export-btn">
          <FileDown size={18} />
          <span>Export Report</span>
        </button>
      </div>
    </aside>
  );
}
