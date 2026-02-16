import React from 'react';
import type { Table } from '../../interfaces/table.interface';

interface TableCardProps {
  table: Table;
  onSelect?: (table: Table) => void;
}

const statusConfig: Record<number, { color: string; label: string; badge: string }> = {
  1: { color: '#4CAF50', label: 'Disponible', badge: 'bg-success' },
  2: { color: '#F44336', label: 'Asignada', badge: 'bg-danger' },
  3: { color: '#FF9800', label: 'Reservada', badge: 'bg-warning text-dark' },
  4: { color: '#9E9E9E', label: 'Fuera de servicio', badge: 'bg-secondary' },
};

export const TableCard = React.memo<TableCardProps>(({ table, onSelect }) => {
  const config = statusConfig[table.status] || statusConfig[1];

  return (
    <div className="col-xl-3 col-lg-4 col-md-6">
      <div
        className="card table-card h-100 p-3"
        style={{ 
          border: `3px solid ${config.color}`, 
          transition: 'transform 0.2s, box-shadow 0.2s',
          cursor: onSelect ? 'pointer' : 'default'
        }}
        onClick={() => onSelect?.(table)}
        onMouseEnter={(e) => {
          if (onSelect) {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          }
        }}
        onMouseLeave={(e) => {
          if (onSelect) {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
          }
        }}
      >
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <div className="table-number fw-bold" style={{ fontSize: '1.25rem' }}>
              Mesa {table.number}
            </div>
            <span className={`badge ${config.badge}`} style={{ marginTop: '0.5rem', display: 'inline-block' }}>
              {config.label}
            </span>
            <div className="text-muted small" style={{ marginTop: '0.5rem' }}>
              Capacidad: {table.capacity} personas
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

TableCard.displayName = 'TableCard';
