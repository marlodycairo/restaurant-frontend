import { useState, useEffect } from "react";
import { getReservationById, updateReservation } from "../fetch.data";
import { useParams, useNavigate } from "react-router";
import type { Reservation } from "../interfaces/reservation.interface";

export default function ReservationsEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true) 

  // Cargar detalles de la reserva
  useEffect(() => {
    if (!id) return;
    loadReservation(parseInt(id));
  }, [id]);

  const loadReservation = async (reservationId: number) => {
    try {
      const data = await getReservationById(reservationId);
      setReservation(data);
    } catch (error) {
      console.error(error);
      //toast
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Manejador de cambios en el formulario
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (!reservation) return;
    setReservation({ ...reservation, [name]: value });
  };

   // 🔹 Guardar actualización
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservation) return;

    try {
      await updateReservation(reservation.id, reservation);
      //toast.success("Reserva actualizada correctamente");
      navigate("/reservations"); // redirige al listado o al calendario
    } catch (error) {
      console.error("Error actualizando reserva:", error);
      //toast.error("Error al actualizar la reserva");
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (!reservation) return <p>No se encontró la reserva.</p>;

  return (
    <div className="container mt-4">
      <h4>Editar Reserva #{reservation.id}</h4>
      <form onSubmit={handleSubmit} className="mt-3">
        <div className="mb-3">
          <label className="form-label">Nombre del Cliente</label>
          <input
            type="text"
            className="form-control"
            name="customerName"
            value={reservation.customerName || ""}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Fecha</label>
          <input
            type="date"
            className="form-control"
            name="date"
            value={reservation.startTime?.substring(0, 10) || ""}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Hora</label>
          <input
            type="time"
            className="form-control"
            name="time"
            value={reservation.startTime || ""}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Mesa</label>
          <input
            type="number"
            className="form-control"
            name="tableId"
            value={reservation.tableId || ""}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn btn-primary">
          Guardar Cambios
        </button>
      </form>
    </div>
  );
}
