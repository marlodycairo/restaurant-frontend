import { useEffect, useState, useCallback, useMemo } from "react";
import "./App.css";
import "./AreaTables.css";
import { getTables, updateTable, getReservations } from "./fetch.data";
import { ReservationForm } from "./reservation-form";
import type { Table } from "./interfaces/table";
import type { Reservation } from "./interfaces/reservation";

const visualStyles = {
  Disponible: {
    cardClass: "border-success border-2 shadow-sm",
    textClass: "text-success",
    badgeClass: "bg-success-subtle text-success-emphasis",
    badgeText: "Disponible",
    statusClass: "status-available",
  },
  ProximaReserva: {
    cardClass: "bg-warning text-dark shadow-sm",
    textClass: "text-dark",
    badgeClass: "bg-light text-warning-emphasis",
    badgeText: "Próxima Reserva",
    statusClass: "status-upcoming",
  },
  ReservaActiva: {
    cardClass: "bg-danger text-white shadow-sm",
    textClass: "text-white",
    badgeClass: "bg-light text-danger-emphasis",
    badgeText: "Reservada (Activa)",
    statusClass: "status-active",
  },
  Ocupada: {
    cardClass: "bg-secondary text-white shadow-sm",
    textClass: "text-white",
    badgeClass: "bg-light text-dark-emphasis",
    badgeText: "Ocupada",
    statusClass: "status-occupied",
  },
};

export const AreaTables = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const loadData = async () => {
      try {
        const [tablesData, reservationsData] = await Promise.all([
          getTables(),
          getReservations(),
        ]);
        setTables(tablesData);
        setReservations(reservationsData);
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };
    loadData();
  }, []);

  // Actualiza el reloj cada minuto
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Determina el color de una mesa
  const getDynamicTableStyles = useCallback(
    (table: Table) => {
      const now = currentTime;
      const tableReservations = reservations.filter(
        (r) => r.tableId === table.idTable
      );

      let style = visualStyles.Disponible;

      for (const r of tableReservations) {
        const resTime = new Date(r.reservationTime);
        const diffMin = (resTime.getTime() - now.getTime()) / (1000 * 60);

        console.log('current time: ', now);

        console.log('reservation: ', r);
        if (diffMin <= 0 && diffMin >= -60) {
          // 🔴 dentro del rango de la reserva (ya empezó y dura 1h)
          style = visualStyles.ReservaActiva;
          break;
        } else if (diffMin > 0 && diffMin <= 60) {
          // 🟨 dentro de la próxima hora
          style = visualStyles.ProximaReserva;
        }
      }

      // Si está ocupada manualmente en la BD
      if (table.tableStatus === 2) {
        style = visualStyles.Ocupada;
      }

      return style;
    },
    [reservations, currentTime]
  );

  const tablesWithStyles = useMemo(
    () =>
      tables.map((table) => ({
        ...table,
        visuals: getDynamicTableStyles(table),
      })),
    [tables, getDynamicTableStyles]
  );

  const handleOpenModal = (table: Table) => {
    setSelectedTable(table);
    setShowReservationForm(false);
  };

  const handleCloseModal = () => {
    setSelectedTable(null);
    setShowReservationForm(false);
  };

  const handleUpdateStatus = async (newStatus: number) => {
    if (!selectedTable) return;

    if (newStatus === 3) {
      setShowReservationForm(true);
      return;
    }

    const updatedTableData = {
      ...selectedTable,
      tableStatus: newStatus,
    };

    try {
      await updateTable(selectedTable.idTable, updatedTableData);
      setTables((prev) =>
        prev.map((t) =>
          t.idTable === selectedTable.idTable ? updatedTableData : t
        )
      );
      // Forzar un “tick” para recalcular estilos
      setCurrentTime(new Date());
      handleCloseModal();
    } catch (error) {
      console.error(error);
    }
  };

  const statusOptions = [
    { id: 1, name: "Disponible", class: "btn-outline-success" },
    { id: 2, name: "Ocupada", class: "btn-outline-danger" },
    { id: 3, name: "Reservar", class: "btn-outline-warning" },
  ];

  return (
    <div className="container my-5">
      <h2 className="text-center mb-4 fw-light">Plano de Mesas</h2>

      <div className="row g-4">
        {tablesWithStyles.map((table) => {
          const styles = table.visuals;
          return (
            <div className="col-lg-3 col-md-4 col-sm-6" key={table.idTable}>
              <div
                className={`card h-100 text-center ${styles.cardClass}`}
                onClick={() => handleOpenModal(table)}
              >
                <div className="card-body d-flex flex-column justify-content-center">
                  <h1 className={`display-3 fw-bold ${styles.textClass}`}>
                    {table.tableNumber}
                  </h1>
                  <p className="card-text text-muted mb-2">
                    Capacidad: {table.capacity} personas
                  </p>
                  <div>
                    <span
                      className={`badge rounded-pill ${styles.badgeClass}`}
                    >
                      {styles.badgeText}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- MODAL --- */}
      {selectedTable && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div
            className="modal fade show"
            style={{ display: "block" }}
            tabIndex={-1}
            role="dialog"
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    Gestionar Mesa {selectedTable.tableNumber}
                  </h5>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={handleCloseModal}
                  ></button>
                </div>

                <div className="modal-body">
                  {!showReservationForm ? (
                    <>
                      <p>Selecciona el nuevo estado para la mesa:</p>
                      <div className="d-grid gap-2">
                        {statusOptions.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            className={`btn ${option.class} btn-lg`}
                            onClick={() => handleUpdateStatus(option.id)}
                          >
                            {option.name}
                          </button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <ReservationForm
                      tableId={selectedTable.idTable}
                      onCreated={(newRes) => {
                        setReservations((prev) => [...prev, newRes]);
                        handleCloseModal();
                      }}
                    />
                  )}
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseModal}
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
