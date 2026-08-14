import { useState, useCallback, useEffect } from 'react';
import { MoreVertical, SlidersHorizontal } from 'lucide-react';
import StatusBadge from '../StatusBadge/StatusBadge';
import './DataTable.css';

function TableRow({ row, columns, expandedRows, onToggle, hasStatusColumn }) {
  const isExpanded = expandedRows.has(row.id);
  const indent = row.level * 18;
  const hasChildren = row.expandable && row.children && row.children.length > 0;
  const totalGroupStartIndex = Math.max(1, columns.length - 3);

  return (
    <>
      <tr
        className={`data-table__row data-table__row--level-${row.level} ${
          hasChildren ? 'data-table__row--expandable' : ''
        } ${isExpanded ? 'data-table__row--expanded' : ''}`}
        onClick={() => hasChildren && onToggle(row.id)}
      >
        {columns.map((col, colIdx) => {
          if (col.key === 'name') {
            return (
              <td
                key={col.key}
                className="data-table__cell data-table__cell--name"
                style={{ paddingLeft: `${14 + indent}px` }}
              >
                <div className="data-table__name-content">
                  {hasChildren ? (
                    <button
                      className="data-table__toggle-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggle(row.id);
                      }}
                      aria-label={isExpanded ? 'Collapse' : 'Expand'}
                    >
                      <span className="toggle-symbol">{isExpanded ? '—' : '+'}</span>
                    </button>
                  ) : (
                    <span className="data-table__toggle-spacer" />
                  )}
                  <span className="data-table__name-text">{row.name}</span>
                </div>
              </td>
            );
          }
          if (col.key === 'estado' && hasStatusColumn) {
            return (
              <td key={col.key} className="data-table__cell data-table__cell--status">
                <StatusBadge status={row[col.key]} />
              </td>
            );
          }
          return (
            <td
              key={col.key}
              className={`data-table__cell data-table__cell--numeric ${
                colIdx >= totalGroupStartIndex ? 'data-table__cell--total-group' : ''
              }`}
            >
              <span className="data-table__cell-value">{row[col.key] || ''}</span>
            </td>
          );
        })}
      </tr>

      {isExpanded &&
        row.children &&
        row.children.map((child) => (
          <TableRow
            key={child.id}
            row={child}
            columns={columns}
            expandedRows={expandedRows}
            onToggle={onToggle}
            hasStatusColumn={hasStatusColumn}
          />
        ))}
    </>
  );
}

export default function DataTable({
  title,
  columns,
  rows,
  totalRow,
  groupHeaders,
  hasStatusColumn = false,
}) {
  const [expandedRows, setExpandedRows] = useState(new Set());
  const totalGroupStartIndex = Math.max(1, (columns?.length || 0) - 3);

  useEffect(() => {
    if (rows && rows.length > 0) {
      const initial = new Set();
      rows.forEach((r) => {
        initial.add(r.id);
        if (r.children) {
          r.children.forEach((child) => {
            if (
              child.name?.toLowerCase().includes('aeropuerto') ||
              child.name?.toLowerCase().includes('ciudad') ||
              child.name?.toLowerCase().includes('destino') ||
              child.name?.toLowerCase().includes('urbano')
            ) {
              initial.add(child.id);
            }
          });
        }
      });
      setExpandedRows(initial);
    }
  }, [rows]);

  const onToggle = useCallback((id) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const hasGroupHeaderRow = groupHeaders && groupHeaders.length > 0;

  return (
    <div className="data-table">
      {title && (
        <div className="data-table__header">
          <h3 className="data-table__title">{title}</h3>
          <div className="data-table__actions">
            <button className="data-table__action-btn" aria-label="Filter">
              <SlidersHorizontal size={16} />
            </button>
            <button className="data-table__action-btn" aria-label="More options">
              <MoreVertical size={16} />
            </button>
          </div>
        </div>
      )}
      <div className="data-table__scroll">
        <table className="data-table__table">
          <thead>
            {hasGroupHeaderRow && (
              <tr className="data-table__group-header-row">
                {groupHeaders.map((gh, i) => (
                  <th
                    key={gh.key || i}
                    colSpan={gh.colSpan}
                    className={`data-table__group-header ${
                      i === 0 ? 'data-table__group-header--first' : ''
                    } ${gh.highlight ? 'data-table__group-header--highlight' : ''}`}
                  >
                    {gh.label}
                  </th>
                ))}
              </tr>
            )}
            <tr className="data-table__header-row">
              {columns.map((col, colIdx) => (
                <th
                  key={col.key}
                  className={`data-table__th ${
                    col.key === 'name' ? 'data-table__th--name' : 'data-table__th--numeric'
                  } ${colIdx >= totalGroupStartIndex ? 'data-table__th--total-group' : ''}`}
                  style={col.width ? { width: col.width, minWidth: col.width } : undefined}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <TableRow
                key={row.id}
                row={row}
                columns={columns}
                expandedRows={expandedRows}
                onToggle={onToggle}
                hasStatusColumn={hasStatusColumn}
              />
            ))}
            {totalRow && (
              <tr className="data-table__row data-table__row--total">
                {columns.map((col, colIdx) => (
                  <td
                    key={col.key}
                    className={`data-table__cell ${
                      col.key === 'name'
                        ? 'data-table__cell--name data-table__cell--total-name'
                        : 'data-table__cell--numeric'
                    } ${colIdx >= totalGroupStartIndex ? 'data-table__cell--total-group' : ''}`}
                  >
                    {totalRow[col.key] || ''}
                  </td>
                ))}
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
