import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

interface Table {
  id: number;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
}

const TableBookingSystem: React.FC = () => {
  const [tables] = useState<Table[]>([
    { id: 1, capacity: 4, status: 'available' },
    { id: 2, capacity: 4, status: 'available' },
    { id: 3, capacity: 6, status: 'available' },
    { id: 4, capacity: 4, status: 'available' },
    { id: 5, capacity: 4, status: 'available' },
    { id: 6, capacity: 6, status: 'available' },
    { id: 7, capacity: 4, status: 'available' },
    { id: 8, capacity: 4, status: 'available' },
    { id: 9, capacity: 4, status: 'available' },
    { id: 10, capacity: 4, status: 'available' },
    { id: 11, capacity: 4, status: 'available' },
    { id: 12, capacity: 4, status: 'available' },
  ]);

  const [selectedTable, setSelectedTable] = useState<number | null>(null);

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'available':
        return '#10b981';
      case 'occupied':
        return '#ef4444';
      case 'reserved':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status) {
      case 'available':
        return 'Disponible';
      case 'occupied':
        return 'Ocupada';
      case 'reserved':
        return 'Reservada';
      default:
        return 'N/A';
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      padding: '40px 20px',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      <div className="container">
        <div className="text-center mb-5">
          <h1 style={{
            color: '#fff',
            fontSize: '2.5rem',
            fontWeight: '700',
            marginBottom: '10px',
            letterSpacing: '-0.5px'
          }}>
            Sistema de Reservas
          </h1>
          <p style={{
            color: '#94a3b8',
            fontSize: '1.1rem',
            fontWeight: '400'
          }}>
            Selecciona una mesa para realizar tu reserva
          </p>
        </div>

        <div className="row g-4">
          {tables.map((table) => (
            <div key={table.id} className="col-12 col-sm-6 col-lg-3">
              <div
                onClick={() => setSelectedTable(table.id)}
                style={{
                  background: selectedTable === table.id 
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: selectedTable === table.id 
                    ? '2px solid rgba(102, 126, 234, 0.5)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '20px',
                  padding: '30px 20px',
                  cursor: 'pointer',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: selectedTable === table.id
                    ? '0 20px 40px rgba(102, 126, 234, 0.3)'
                    : '0 4px 15px rgba(0, 0, 0, 0.2)',
                  transform: selectedTable === table.id ? 'translateY(-5px) scale(1.02)' : 'translateY(0) scale(1)'
                }}
                onMouseEnter={(e) => {
                  if (selectedTable !== table.id) {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedTable !== table.id) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.2)';
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  }
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '-50%',
                  right: '-50%',
                  width: '200%',
                  height: '200%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
                  pointerEvents: 'none'
                }} />
                
                <div className="text-center" style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{
                    fontSize: '3.5rem',
                    fontWeight: '800',
                    color: '#fff',
                    marginBottom: '15px',
                    textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
                  }}>
                    {table.id}
                  </div>

                  <div style={{
                    display: 'inline-block',
                    padding: '6px 16px',
                    borderRadius: '20px',
                    backgroundColor: getStatusColor(table.status),
                    color: '#fff',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '15px',
                    boxShadow: `0 4px 15px ${getStatusColor(table.status)}40`
                  }}>
                    {getStatusText(table.status)}
                  </div>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    color: '#cbd5e1',
                    fontSize: '0.95rem',
                    fontWeight: '500'
                  }}>
                    <svg 
                      width="20" 
                      height="20" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2"
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    >
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    <span>Capacidad: {table.capacity} personas</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 text-center">
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '15px',
            padding: '25px',
            display: 'inline-block'
          }}>
            <div style={{
              display: 'flex',
              gap: '30px',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: '#10b981',
                  boxShadow: '0 0 10px #10b98150'
                }} />
                <span style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>Disponible</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: '#ef4444',
                  boxShadow: '0 0 10px #ef444450'
                }} />
                <span style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>Ocupada</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: '#f59e0b',
                  boxShadow: '0 0 10px #f59e0b50'
                }} />
                <span style={{ color: '#cbd5e1', fontSize: '0.9rem' }}>Reservada</span>
              </div>
            </div>
          </div>
        </div>

        {selectedTable && (
          <div className="text-center mt-4">
            <button
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                padding: '15px 40px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 15px 40px rgba(16, 185, 129, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(16, 185, 129, 0.3)';
              }}
              onClick={() => alert(`Reservando mesa ${selectedTable}...`)}
            >
              Confirmar Reserva - Mesa {selectedTable}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TableBookingSystem;