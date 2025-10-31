import { useForm } from 'react-hook-form';
import { postReservation } from './fetch.data';
import type { Reservation } from './interfaces/reservation';

interface Props {
  tableId: number;
  onCreated: (res: Reservation) => void;
}

export const ReservationForm = ({ tableId, onCreated }: Props) => {
  const { register, handleSubmit, reset } = useForm<Reservation>({
    defaultValues: {
      createdAt: new Date().toISOString(),
      tableId: tableId,
    },
  });

  const onSubmit = async (data: Reservation) => {
    try {
      const newRes = await postReservation(data);
      onCreated(newRes);
      reset();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <label className="form-label mt-2">Fecha de reserva:</label>
      <input
        type="datetime-local"
        className="form-control"
        {...register('reservationTime', { required: true })}
      />

      <label className="form-label mt-2">Nombre del cliente:</label>
      <input
        type="text"
        className="form-control"
        {...register('customerName', { required: true })}
      />

      <label className="form-label mt-2">Teléfono:</label>
      <input
        type="text"
        className="form-control"
        {...register('phone', { required: true })}
      />

      <input type="hidden" {...register('tableId')} value={tableId} />
      <input
        type="hidden"
        {...register('createdAt')}
        value={new Date().toISOString()}
      />

      <button type="submit" className="btn btn-success mt-3 w-100">
        Guardar reserva
      </button>
    </form>
  );
};
