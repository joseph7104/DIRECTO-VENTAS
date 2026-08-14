import { useState, useEffect } from 'react';
import { Database, AlertTriangle, RefreshCw, FolderSearch, CheckCircle2 } from 'lucide-react';
import './FeedbackStates.css';

/**
 * Animated Loading State Screen
 */
export function LoadingScreen({
  title = 'Cargando información desde Supabase...',
  subtitle = 'Extrayendo métricas de la tabla `tb_servicios_total` (1,300,629 registros)',
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const steps = [
    'Conectando con PostgreSQL (Supabase)...',
    'Filtrando por Año y Mes en 1.3M registros...',
    'Calculando sub-totales por Negocio y Canal...',
    'Generando visualización jerárquica...',
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 450);
    return () => clearInterval(timer);
  }, [steps.length]);

  return (
    <div className="feedback-card feedback-card--loading">
      <div className="loading-spinner-wrapper">
        <div className="pulse-ring"></div>
        <div className="pulse-ring pulse-ring--delayed"></div>
        <div className="spinner-core">
          <Database size={28} className="spinner-icon" />
        </div>
      </div>

      <h3 className="feedback-title">{title}</h3>
      <p className="feedback-subtitle">{subtitle}</p>

      <div className="loading-steps">
        {steps.map((st, idx) => (
          <div
            key={st}
            className={`loading-step-item ${
              idx < stepIndex
                ? 'step--done'
                : idx === stepIndex
                ? 'step--active'
                : 'step--pending'
            }`}
          >
            {idx < stepIndex ? (
              <CheckCircle2 size={14} className="step-icon step-icon--check" />
            ) : idx === stepIndex ? (
              <span className="step-bullet step-bullet--active"></span>
            ) : (
              <span className="step-bullet"></span>
            )}
            <span>{st}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Error Screen with Retry
 */
export function ErrorScreen({
  title = 'No se pudo cargar la información',
  message = 'Ocurrió un inconveniente al comunicarse con la base de datos de Supabase.',
  onRetry,
}) {
  return (
    <div className="feedback-card feedback-card--error">
      <div className="feedback-icon-box feedback-icon-box--error">
        <AlertTriangle size={32} />
      </div>
      <h3 className="feedback-title feedback-title--error">{title}</h3>
      <p className="feedback-subtitle">{message}</p>

      {onRetry && (
        <button onClick={onRetry} className="feedback-retry-btn">
          <RefreshCw size={15} />
          <span>Reintentar Conexión</span>
        </button>
      )}
    </div>
  );
}

/**
 * Empty State Screen
 */
export function EmptyScreen({
  title = 'No hay datos disponibles',
  message = 'No se encontraron registros para el periodo seleccionado.',
  actionLabel = null,
  onAction = null,
}) {
  return (
    <div className="feedback-card feedback-card--empty">
      <div className="feedback-icon-box feedback-icon-box--empty">
        <FolderSearch size={32} />
      </div>
      <h3 className="feedback-title">{title}</h3>
      <p className="feedback-subtitle">{message}</p>

      {actionLabel && onAction && (
        <button onClick={onAction} className="feedback-action-btn">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
