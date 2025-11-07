import { useCallback, useState, useEffect } from "react";
import { getTables, getReservations } from "../fetch.data";
import dayjs from "dayjs";
import { Table, Form, Row, Col, Button } from "react-bootstrap";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { Reservation } from "../interfaces/reservation.interface";

// interface Reservation {
//   id: number;
//   tableId: number;
//   customerName: string;
//   date: string; // formato ISO
//   people: number;
// }

export default function ReservationsDetails() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedDate, setSelectedDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [selectedTable, setSelectedTable] = useState<number | "">("");
  const [tables, setTables] = useState<number[]>([]);

  const loadData = useCallback(async () => {
      try {
        const [tablesData, reservationsData] = await Promise.all([
          getTables(),
          getReservations(),
        ]);
        setTables(tablesData.map((t: any) => t.id));
        setReservations(reservationsData);
      } catch (error) {
        console.error(error);
      }
    }, []);

  // Cargar reservas y mesas
  useEffect(() => {
    loadData();
    // axios.get("/api/reservations").then((res) => setReservations(res.data));
    // axios.get("/api/tables").then((res) => setTables(res.data.map((t: any) => t.id)));
  }, [loadData]);

  // Filtrar reservas para la tabla diaria
  const filteredDaily = reservations.filter((r) => {
    const sameDay = dayjs(r.startTime).isSame(selectedDate, "day");
    const sameTable = selectedTable ? r.tableId === selectedTable : true;
    return sameDay && sameTable;
  });

  // Eventos para el calendario mensual/semanal
  const calendarEvents = reservations
    .filter((r) => (selectedTable ? r.tableId === selectedTable : true))
    .map((r) => ({
      title: `Mesa ${r.tableId} - ${r.customerName}`,
      start: r.startTime,
      extendedProps: { id: r.id },
    }));

  // Al hacer clic en un día del calendario
  const handleDateClick = (info: any) => {
    setSelectedDate(dayjs(info.date).format("YYYY-MM-DD"));
  };

  return (
    <div className="container mt-4">
      <h3 className="mb-3">Gestor de Reservas</h3>

      {/* FILTROS */}
      <Row className="align-items-end">
        <Col md={3}>
          <Form.Group>
            <Form.Label>Filtrar por mesa</Form.Label>
            <Form.Select
              value={selectedTable}
              onChange={(e) =>
                setSelectedTable(e.target.value ? Number(e.target.value) : "")
              }
            >
              <option value="">Todas</option>
              {tables.map((t) => (
                <option key={t} value={t}>
                  Mesa {t}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>

        <Col md={3}>
          <Form.Group>
            <Form.Label>Seleccionar día</Form.Label>
            <Form.Control
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </Form.Group>
        </Col>

        <Col md={2}>
          <Button
            variant="secondary"
            className="mt-3"
            onClick={() => {
              setSelectedDate(dayjs().format("YYYY-MM-DD"));
              setSelectedTable("");
            }}
          >
            Limpiar filtros
          </Button>
        </Col>
      </Row>

      {/* CALENDARIO */}
      <div className="mt-4 border rounded p-2 bg-light">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={calendarEvents}
          height="auto"
          dateClick={handleDateClick}
        />
      </div>

      {/* TABLA DE RESERVAS DEL DÍA */}
      <h5 className="mt-4">
        Reservas del {dayjs(selectedDate).format("DD/MM/YYYY")}
        {selectedTable ? ` - Mesa ${selectedTable}` : ""}
      </h5>

      {filteredDaily.length === 0 ? (
        <p className="text-muted">No hay reservas para este día.</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Mesa</th>
              <th>Cliente</th>
              <th>Personas</th>
              <th>Fecha y hora</th>
            </tr>
          </thead>
          <tbody>
            {filteredDaily.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                <td>{r.tableId}</td>
                <td>{r.customerName}</td>
                <td>{r.people}</td>
                <td>{dayjs(r.date).format("DD/MM/YYYY HH:mm")}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
