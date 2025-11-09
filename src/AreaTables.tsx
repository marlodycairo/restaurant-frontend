import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import * as signalR from '@microsoft/signalr';
import "./App.css";
import "./AreaTables.css";
import { getTables, updateTable, getReservations } from "./fetch.data";
import { ReservationForm } from "./reservation-form";
import type { Table } from "./interfaces/table.interface";
import type { Reservation } from "./interfaces/reservation.interface";
import { Toast } from "bootstrap";

const visualStyles = {
  Available: {
    color: "#4CAF50",
    label: "Available",
    badge: "bg-success",
  },
  Reserved: {
    color: "#FF9800",
    label: "Reserved",
    badge: "bg-warning text-dark",
  },
  Assigned: {
    color: "#F44336",
    label: "Assigned",
    badge: "bg-danger",
  },
};

export const AreaTables = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showReservationsForm, setShowReservationsForm] = useState(false);
  const toastRef = useRef<HTMLDivElement>(null);

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

  // signalR connection
  useEffect(() => {
    loadData();
    
    const connection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:44329/hubs/Tables')  //  'https://localhost:44329/api/Tables'
      .configureLogging(signalR.LogLevel.Information)
      .withAutomaticReconnect()
      .build(); 

      connection
        .start()
        .then(() => {
          console.log('Conectado al Hub de SignalR!');

          connection.on('TablesUpdated', () => {
            console.log('Actualización recibida desde el backend');
            loadData();
          });
        })
        .catch((err) => console.error("Error conectando a SignalR:", err))

    return () => {
      connection.stop();
    }
  }, [loadData]);

  const tablesWithStyles = useMemo(() =>
    tables.map((t) => {
      let style, badgeClass, labelText;
      switch (t.tableStatus) {
        case 1:
          style = visualStyles.Available.color;
          badgeClass = visualStyles.Available.badge;
          labelText = visualStyles.Available.label;
          break;
        case 2:
          style = visualStyles.Assigned.color;
          badgeClass = visualStyles.Assigned.badge;
          labelText = visualStyles.Assigned.label;
          break;
        case 3:
          style = visualStyles.Reserved.color;
          badgeClass = visualStyles.Reserved.badge;
          labelText = visualStyles.Reserved.label;
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

  const showToast = (message: string, type: "success" | "error" = "success") => {
  const toastEl = toastRef.current;
  if (toastEl) {
    const toastBody = toastEl.querySelector(".toast-body") as HTMLElement;
    toastBody.textContent = message;

    // Colorear el cuerpo según tipo
    toastBody.className = "toast-body " + (type === "success" ? "text-success" : "text-danger");

    const toast = new Toast(toastEl);
    toast.show();
  }
};

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

    try {
      const updatedTableData = { ...selectedTable, tableStatus: newStatus };
      await updateTable(selectedTable.idTable, updatedTableData);
      setTables((prev) => prev.map((t) => 
      t.idTable === selectedTable.idTable ? updatedTableData : t
      ));
      showToast(`Mesa ${selectedTable.tableNumber} actualizada correctamente.`, "success");
    } catch {
      showToast(`Error actualizando la mesa ${selectedTable?.tableNumber}.`, "error")
    }

    handleCloseModal();
  }

  return (
    <div className="container py-4">
      {/* Toast Bootstrap */}
      <div
        className="toast position-fixed top-0 end-0 m-3"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        ref={toastRef}
        style={{ zIndex: 2000 }}
        data-bs-delay="4000" data-bs-autohide="true"
      >
        <div className="toast-header">
          <strong className="me-auto">Notificación</strong>
          <small>Ahora</small>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="toast"
            aria-label="Close"
          ></button>
        </div>
        <div className="toast-body"></div>
      </div>

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
                    <div>
                      
                      <table className="table table-bordered border-info">
                        <thead>
                          <tr>
                          <th>No. reserva</th>
                          <th>Cliente</th>
                          <th>Fecha</th>
                          <th>Action</th>
                          <th>State</th>
                        </tr>
                        </thead>
                        <tbody>
                          {reservations.map(r => (
                            <tr key={r.id}>
                              <td>{r.id}</td>
                              <td>{r.customerName}</td>
                              <td>{r.startTime}</td>
                              <td>
                                <button>edit</button>
                              </td>
                              <td><label>
                                  <input type="checkbox" />
                                </label></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      
                    </div>
                      <p>Selecciona una acción: </p>
                      <div className="d-grid gap-2">
                        <button className="btn btn-outline-success btn-lg" onClick={() => handleUpdateStatus(1)}>Available</button>
                        <button className="btn btn-outline-danger btn-lg" onClick={() => handleUpdateStatus(2)}>Assigned</button>
                        <button className="btn btn-outline-warning btn-lg" onClick={() => handleUpdateStatus(3)}>Reserved</button>
                      </div>
                    </>
                  ) : (
                    <ReservationForm 
                      tableId={selectedTable.idTable}
                      onCreated={(newRes) => {
                        setReservations((prev) => [...prev, newRes]);
                        handleCloseModal();
                        showToast(
                          `Table ${selectedTable.tableNumber} Reserved to ${new Date(newRes.startTime).toLocaleString()}.`,
                          "success"
                        );
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
