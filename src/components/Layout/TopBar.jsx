import { Bell, User } from 'lucide-react';
import ConnectionStatusBadge from '../Feedback/ConnectionStatusBadge';
import './TopBar.css';

export default function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar__left">
        <h1 className="topbar__title">
          <span className="topbar__title-accent">DIRECTO</span> Enterprise Sales Dashboard
        </h1>
      </div>

      <div className="topbar__right">
        {/* Live Database Connection Indicator */}
        <ConnectionStatusBadge />

        <div className="topbar__icons">
          <button className="topbar__icon-btn" aria-label="Notifications">
            <Bell size={18} />
          </button>
          <button className="topbar__icon-btn" aria-label="Profile">
            <User size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}
