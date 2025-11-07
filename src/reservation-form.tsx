// ReservationForm.tsx (corregido)
import React from "react";
import { useForm } from "react-hook-form";
import { postReservation } from "./fetch.data";
import type { Reservation } from "./interfaces/reservation.interface";

interface Props {
  tableId: number;
  onCreated: (res: Reservation) => void;
}

type FormValues = {
  date: string;        // yyyy-mm-dd
  startTime: string;   // HH:MM
  endTime: string;     // HH:MM
  customerName: string;
  phone: string;
};

export const ReservationForm: React.FC<Props> = ({ tableId, onCreated }) => {
  const now = new Date();
  const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
  const { register, handleSubmit, reset, formState } = useForm<FormValues>({
    defaultValues: {
      date: new Date().toISOString().slice(0, 10), // today YYYY-MM-DD
      startTime: now.toISOString().slice(0, 5), // HH:mm,
      endTime: oneHourLater.toISOString().slice(0, 5), // HH:mm,
      customerName: "",
      phone: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      // Validaciones básicas
      if (!data.date || !data.startTime || !data.endTime) {
        return alert("Selecciona fecha e hora inicio/fin.");
      }

      // Combinar date + time en ISO local (luego convertimos a ISO UTC si quieres)
      const start = new Date(`${data.date}T${data.startTime}:00`);
      const end = new Date(`${data.date}T${data.endTime}:00`);

      if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
        return alert("Fechas inválidas. Asegúrate que la hora fin sea mayor a la de inicio.");
      }

      // Construir payload en el formato que .NET espera (ISO 8601)
      const payload: Reservation = {
        // id se asigna en el servidor
        createdAt: new Date().toISOString(),
        startTime: start.toISOString(), // ISO 8601
        endTime: end.toISOString(),     // ISO 8601
        tableId: tableId,
        customerName: data.customerName,
        phone: data.phone,
      };

      console.log("Payload enviado:", payload);
      const created = await postReservation(payload);
      console.log("Respuesta del servidor:", created);
      onCreated(created);
      reset();
    } catch (err) {
      console.error("Error creando reserva:", err);
      alert("Error creando la reserva. Revisa consola.");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mb-2">
        <label className="form-label">Fecha</label>
        <input type="date" className="form-control" {...register("date", { required: true })} />
      </div>

      <div className="d-flex gap-2 mb-2">
        <div className="flex-fill">
          <label className="form-label">Hora inicio</label>
          <input type="time" className="form-control" {...register("startTime", { required: true })} />
        </div>
        <div className="flex-fill">
          <label className="form-label">Hora fin</label>
          <input type="time" className="form-control" {...register("endTime", { required: true })} />
        </div>
      </div>

      <div className="mb-2">
        <label className="form-label">Nombre</label>
        <input type="text" className="form-control" {...register("customerName", { required: true })} />
      </div>

      <div className="mb-2">
        <label className="form-label">Teléfono</label>
        <input type="tel" className="form-control" {...register("phone", { required: true })} />
      </div>

      <button className="btn btn-success w-100" type="submit" disabled={formState.isSubmitting}>
        Guardar reserva
      </button>
    </form>
  );
};
