import { useParams } from "react-router";
import { useEffect, useState } from "react";
import type { Reservation } from "../interfaces/reservation.interface";
import { getReservationsByTable } from "../fetch.data";

export const ReservationDetailByTable = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const { idTable } = useParams();

  console.log('table selected: ', idTable);

  useEffect(() => {
    const fetchReservations = async () => {
      try {
        if (!idTable || isNaN(Number(idTable))) return;

        const tableId = Number(idTable);
        const data = await getReservationsByTable(tableId);
        setReservations(data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchReservations();
  }, [idTable]);

  return (
    <div>
      <p>Table details {idTable}</p>
      {reservations.length > 0 ? (
        <div className="row justify-content-center">
        {reservations.map((r) => (
          <div key={r.id} className="col-lg-4 col-md-4 col-sm-6" >
            <div className="card text-center shadow-sm" style={{ border: '3px solid', transition: 'transform 0.2s' }} >
              <div className="card-body">
                <h1 className="display-6 fw-bold" >{r.customerName}</h1>
                <span >{r.phone}</span>
                <p className="card-text mt-2 text-muted">Hora reserva: {r.startTime} horas</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      ) : (
        <div>
          <p className="alert alert-danger">Not found reservations</p>
        </div>
      )}
      

      <div>
        <button className="btn btn-warning btn-sm" >New Reservation</button>
      </div>
    </div>
  )
}
