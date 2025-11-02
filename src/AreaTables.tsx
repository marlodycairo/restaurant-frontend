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
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const loadData = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getDynamicTableStyles = useCallback(
    (table: Table) => {
      const now = currentTime;

      const tableReservations = reservations.filter(
        (r:Reservation) => r.tableId === table.idTable
      );

      let style = visualStyles.Disponible;

      for (const r of tableReservations) {
        const start = new Date(r.startTime);
        const end = new Date(r.endTime);

        if (now >= start && now <= end) {
          style = visualStyles.Ocupada;
          break;
        } else if (start > now && start <= new Date(now.getTime() + 60 * 60000)) {
          style = visualStyles.Reservada;
        }
      }

      return style;
    },
    [reservations, currentTime]
  );

  const tablesWithStyles = useMemo(
    () =>
      tables.map((t) => ({
        ...t,
        visuals: getDynamicTableStyles(t),
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

    const updatedTableData = { ...selectedTable, tableStatus: newStatus };
    await updateTable(selectedTable.idTable, updatedTableData);
    setTables((prev) =>
      prev.map((t) =>
        t.idTable === selectedTable.idTable ? updatedTableData : t
      )
    );
    handleCloseModal();
  };

  return (
    <div className="container py-4">
      <h2 className="text-center mb-4 fw-semibold text-primary">
        🪑 Gestión de Mesas
      </h2>

      <div className="row g-4 justify-content-center">
        {tablesWithStyles.map((table) => (
          <div
            key={table.idTable}
            className="col-lg-3 col-md-4 col-sm-6"
            onClick={() => handleOpenModal(table)}
          >
            <div
              className="card text-center shadow-sm"
              style={{
                border: `3px solid ${table.visuals.color}`,
                transition: "transform 0.2s",
              }}
            >
              <div className="card-body">
                <h1
                  className="display-4 fw-bold"
                  style={{ color: table.visuals.color }}
                >
                  {table.tableNumber}
                </h1>
                <span className={`badge ${table.visuals.badge}`}>
                  {table.visuals.label}
                </span>
                <p className="mt-2 text-muted">
                  Capacidad: {table.capacity} personas
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedTable && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div
            className="modal fade show"
            style={{ display: "block" }}
            tabIndex={-1}
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-4">
                <div className="modal-header bg-light">
                  <h5 className="modal-title fw-semibold">
                    Mesa {selectedTable.tableNumber}
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
                      <p>Selecciona una acción:</p>
                      <div className="d-grid gap-2">
                        <button
                          className="btn btn-outline-success btn-lg"
                          onClick={() => handleUpdateStatus(1)}
                        >
                          Disponible
                        </button>
                        <button
                          className="btn btn-outline-danger btn-lg"
                          onClick={() => handleUpdateStatus(2)}
                        >
                          Ocupada
                        </button>
                        <button
                          className="btn btn-outline-warning btn-lg"
                          onClick={() => handleUpdateStatus(3)}
                        >
                          Reservar
                        </button>
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
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
