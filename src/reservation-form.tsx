import { useState } from 'react';
import { useForm } from 'react-hook-form';
import type { Reservation } from './interfaces/reservation';


type InputsReservation = {
        reservation: Reservation
}

export const ReservationForm = () => {
  const [newReservation, setNewReservation] = useState<Reservation | null>();
  const {register, handleSubmit, formState: {errors}} = useForm<InputsReservation>();

  console.log(newReservation);
  return (
    <>
      <form onSubmit={handleSubmit((data) => {console.log('data form: ', data); setNewReservation(data.reservation)})}>
        <label> Created at:</label>
        <input {...register('reservation.createdAt',)} />
        <label> Reservation time:</label>
        <input {...register('reservation.reservationTime', )} />
        <label> Customer:</label>
        <input {...register('reservation.customerName')} />
        {errors.reservation?.customerName && <p className='alert-danger'>{errors.reservation.customerName.message}</p>}
        <label> Phone:</label>
        <input {...register('reservation.phone')} />
        <label> Table id:</label>
        <input {...register('reservation.tableId')} />
        <input type="submit" />
      </form>
    </>
  )
}
