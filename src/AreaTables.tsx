import { useEffect, useState, useCallback, useMemo } from "react";
import "./App.css";
import "./AreaTables.css";
import { getTables, updateTable, getReservations } from "./fetch.data";
import { ReservationForm } from "./reservation-form";
import type { Table } from "./interfaces/table.interface";
import type { Reservation } from "./interfaces/reservation.interface";

const visualStyles = {
  Disponible: {
    color: "#4CAF50",
    label: "Disponible",
    badge: "bg-success",
  },
  Reservada: {
    color: "#FF9800",
    label: "Reservada",
    badge: "bg-warning text-dark",
  },
  Ocupada: {
    color: "#F44336",
    label: "Ocupada",
    badge: "bg-danger",
  },
};

export const AreaTables = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showReservationsForm, setShowReservationsForm] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [tablesData, reservationsData] = await Promise.all([
        getTables(),
        getReservations(),
      ]);
      setTables(tablesData);
      setReservations(reservationsData);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);

    return () => clearInterval(interval);
  }, [loadData]);

  const tablesWithStyles = useMemo(() =>
    tables.map((t) => {
      let style, badgeClass, labelText;
      switch (t.tableStatus) {
        case 1:
          style = visualStyles.Disponible.color;
          badgeClass = visualStyles.Disponible.badge;
          labelText = visualStyles.Disponible.label;
          break;
        case 2:
          style = visualStyles.Ocupada.color;
          badgeClass = visualStyles.Ocupada.badge;
          labelText = visualStyles.Ocupada.label;
          break;
        case 3:
          style = visualStyles.Reservada.color;
          badgeClass = visualStyles.Reservada.badge;
          labelText = visualStyles.Reservada.label;
          break;
        default:
          style = '#ccc';
          badgeClass = 'bg-secondary';
          labelText = 'Fuera de Servicio';
      }
      return {
        ...t,
        visualStyle: style,
        visualBadge: badgeClass,
        visualLabel: labelText,
      };
    }), [tables]
  );

  const handleOpenModal = (table: Table) => {
    setSelectedTable(table);
    setShowReservationsForm(false);
  }

  const handleCloseModal = () => {
    setSelectedTable(null);
    setShowReservationsForm(false);
  }

  const handleUpdateStatus = async (newStatus: number) => {
    if (!selectedTable) return;
    if (newStatus === 3) {
      setShowReservationsForm(true);
      return;
    }

    const updatedTableData = { ...selectedTable, tableStatus: newStatus };
    await updateTable(selectedTable.idTable, updatedTableData);
    setTables((prev) => prev.map((t) => 
      t.idTable === selectedTable.idTable ? updatedTableData : t
    ));
    handleCloseModal();
  }

  return (
    <div className="container py-4">
      <h2 className="text-center mb-4 fw-semibold text-primary">
        🍽️ Gestión de Mesas
      </h2>

      <div className="row g-4 justify-content-center">
        {tablesWithStyles.map((table) => (
          <div key={table.idTable} className="col-lg-3 col-md-4 col-sm-6" onClick={() => handleOpenModal(table)}>
          <div className="card text-center shadow-sm" 
               style={{ border: `3px solid ${table.visualStyle}`, transition: 'transform 0.2s'}}>
            <div className="card-body">
              <h1 className="display-4 fw-bold" 
              style={{ color: table.visualStyle}}>{table.tableNumber}</h1>
              <span className={`badge ${table.visualBadge}`}>
                  {table.visualLabel}</span>
              <p className="mt-2 text-muted">Capacidad: {table.capacity} personas</p>
            </div>
          </div>
        </div>
        ))}
        
      </div>
      {/* Modal */}
      {selectedTable && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show" style={{ display: 'block'}} tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-4">
                <div className="modal-header bg-light">
                  <h5 className="modal-title fw-semibold">Mesa {selectedTable.tableNumber}</h5>
                  <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                </div>
                <div className="modal-body">
                  {!showReservationsForm ? (
                    <>
                      <p>Selecciona una acción: </p>
                      <div className="d-grid gap-2">
                        <button className="btn btn-outline-success btn-lg" onClick={() => handleUpdateStatus(1)}>Disponible</button>
                        <button className="btn btn-outline-danger btn-lg" onClick={() => handleUpdateStatus(2)}>Ocupada</button>
                        <button className="btn btn-outline-warning btn-lg" onClick={() => handleUpdateStatus(3)}>Reservar</button>
                      </div>
                    </>
                  ) : (
                    <ReservationForm 
                      tableId={selectedTable.idTable}
                      onCreated={(newRes) => {
                        setReservations((prev) => [...prev, newRes]);
                        handleCloseModal();
                      }} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
