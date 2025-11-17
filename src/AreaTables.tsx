import { useEffect, useState } from "react";
import * as signalR from '@microsoft/signalr';
import "./App.css";
import "./AreaTables.css";
import { getTables,  } from "./fetch.data";
import type { Table } from './interfaces/table.interface';
import { useNavigate } from "react-router";

export interface TableVisual extends Table {
  visualStyle: string;
  visualLabel: string;
  visualBadge: string;
}

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
  const navigate = useNavigate();

  // signalR connection
  useEffect(() => {

    const connection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:44329/hubs/Tables')  //  'https://localhost:44329/api/Tables'
      .configureLogging(signalR.LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    const startConnection = async () => {
      try {
        await connection.start();
        console.log("Conectado al Hub de SignalR");

        // Subscripción al evento
        const handler = () => {
          console.log("Actualización recibida desde el backend");
          // loadTables(); // si luego quieres recargar mesas
        };

        connection.on("TablesUpdated", handler);

        // Log de reconexiones
        connection.onreconnecting(() => {
          console.warn("SignalR intentando reconectar...");
        });

        connection.onreconnected(() => {
          console.log("SignalR reconectado correctamente");
        });

        connection.onclose(() => {
          console.warn("SignalR se ha cerrado");
        });

        // Cleanup
        return () => {
          connection.off("TablesUpdated", handler);
          connection.stop();
        };

      } catch (error) {
        console.error("Error conectando a SignalR:", error);
      }
    };

    const cleanupPromise = startConnection();

    return () => {
      // Si startConnection generó un cleanup, lo esperamos
      cleanupPromise.then(cleanup => {
        if (typeof cleanup === "function") cleanup();
      });
    };
  }, []);

  // recupera las mesas
  useEffect(() => {
    const fetchData = async () => {
      try {
        const tablesData = await getTables();
        setTables(tablesData);
      } catch (error) {
        console.error(error);
      }
    }

    fetchData();
  }, []);

  const tablesStyles = (status: number) => {
    switch (status) {
      case 1:
        return visualStyles.Available;
      case 2:
        return visualStyles.Assigned;
      case 3:
        return visualStyles.Reserved;
      default:
        return {
          color: 'green',
          label: 'Out of service',
          badge: 'bg-secondary'
        };
    }
  }

  const getTablesStyles = () => {
    const processedTables: TableVisual[] = tables.map((t) => {
      const { color, label, badge } = tablesStyles(t.tableStatus);

      return {
        ...t,
        visualStyle: color,
        visualLabel: label,
        visualBadge: badge
      };
    });

    return processedTables;
  }

  const handleReservationsByTable = (table: Table) => {
    navigate(`/reservationDetailByTable/${table.idTable}`);
  };

  return (
    <div className="container py-4">
      <h2 className="text-center mb-4 fw-semibold text-primary">
        🍽️ Gestión de Mesas
      </h2>
      <div className="row g-4 justify-content-center">
        {getTablesStyles().map((table) => (
          <div key={table.idTable} className="col-lg-3 col-md-4 col-sm-6" >
            <div className="card text-center shadow-sm" style={{ border: `3px solid ${table.visualStyle}`, transition: 'transform 0.2s' }}
              onClick={() => handleReservationsByTable(table)}>
              <div className="card-body">
                <h1 className="display-4 fw-bold"
                >{table.tableNumber}</h1>
                <span className={`badge ${table.visualBadge}`} >{table.visualLabel}</span>
                <p className="card-text mt-2 text-muted">Capacidad: {table.capacity} personas</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
