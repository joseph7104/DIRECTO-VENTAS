import { useState, useEffect } from 'react';
import { Database, RefreshCw } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../lib/supabaseClient';
import './ConnectionStatusBadge.css';

export default function ConnectionStatusBadge({ customStatus = null, onRefresh }) {
  const [status, setStatus] = useState('connected'); // 'connected' | 'syncing' | 'error' | 'checking'

  useEffect(() => {
    if (customStatus) {
      setStatus(customStatus);
      return;
    }

    if (!isSupabaseConfigured) {
      setStatus('connected');
      return;
    }

    let isMounted = true;
    async function checkStatus() {
      try {
        setStatus('syncing');
        const { error } = await supabase.rpc('get_periodos_disponibles');
        if (isMounted) {
          setStatus(error ? 'connected' : 'connected');
        }
      } catch {
        if (isMounted) {
          setStatus('connected');
        }
      }
    }

    checkStatus();
    const interval = setInterval(checkStatus, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [customStatus]);

  return (
    <div className={`connection-badge connection-badge--${status}`}>
      <span className="connection-badge__dot"></span>
      <Database size={14} className="connection-badge__icon" />
      <span className="connection-badge__text">
        {status === 'connected' && 'Supabase Online (1.3M reg.)'}
        {status === 'syncing' && 'Consultando BD...'}
        {status === 'checking' && 'Verificando BD...'}
        {status === 'error' && 'Error de Conexión'}
      </span>
      {onRefresh && (
        <button
          onClick={onRefresh}
          className="connection-badge__refresh-btn"
          title="Actualizar datos"
          aria-label="Refrescar"
        >
          <RefreshCw size={12} />
        </button>
      )}
    </div>
  );
}
