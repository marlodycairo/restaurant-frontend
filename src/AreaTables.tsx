import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import * as signalR from '@microsoft/signalr';
import "./App.css";
import "./AreaTables.css";
import { getTables, updateTable, getReservations } from "./fetch.data";
import { ReservationForm } from "./reservation-form";
import type { Table } from "./interfaces/table.interface";
import type { Reservation } from "./interfaces/reservation.interface";
// import { Toast } from "bootstrap";
import { CurrentReservationsModal } from "./modals/current.reservations.modal";

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
  // const toastRef = useRef<HTMLDivElement>(null);

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

  //   const showToast = (message: string, type: "success" | "error" = "success") => {
  //   const toastEl = toastRef.current;
  //   if (toastEl) {
  //     const toastBody = toastEl.querySelector(".toast-body") as HTMLElement;
  //     toastBody.textContent = message;

  //     // Colorear el cuerpo según tipo
  //     toastBody.className = "toast-body " + (type === "success" ? "text-success" : "text-danger");

  //     const toast = new Toast(toastEl);
  //     toast.show();
  //   }
  // };

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
      // showToast(`Mesa ${selectedTable.tableNumber} actualizada correctamente.`, "success");
    } catch {
      // showToast(`Error actualizando la mesa ${selectedTable?.tableNumber}.`, "error")
    }

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
              style={{ border: `3px solid ${table.visualStyle}`, transition: 'transform 0.2s' }}>
              <div className="card-body">
                <h1 className="display-4 fw-bold"
                  style={{ color: table.visualStyle }}>{table.tableNumber}</h1>
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
          <CurrentReservationsModal table={selectedTable} onClose={handleCloseModal} />
        </>
      )}

    </div>
  );
};
