import './StatusBadge.css';

export default function StatusBadge({ status }) {
  if (!status) return null;

  const className =
    status === 'ACTUAL' ? 'status-badge--actual' :
    status === 'CERRADO' ? 'status-badge--cerrado' :
    'status-badge--default';

  return (
    <span className={`status-badge ${className}`}>
      {status}
    </span>
  );
}
