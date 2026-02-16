import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { getReservations } from "../fetch.data";

export const ReservationDetailByTable = () => {

  const { idTable } = useParams();

  console.log('table selected: ', idTable);

  const { data: reservations = [], isLoading, error } = useQuery({
    queryKey: ['reservations', idTable],
    queryFn: () => getReservations({ tableId: Number(idTable), status: 'today' }),
  });

  if (isLoading) return <p>Esta cargando...</p>
  if (error) return <p>Error al cargar... {error.message}</p>

  return (
    <div>
      <p>Table details {idTable}</p>
      
      {reservations.length > 0 ? (
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Fecha reserva</th>
            <th>Inicio reserva</th>
            <th>Fin reserva</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {reservations.map(r => (
            <tr key={r.id}>
              <td>{r.customerName}</td>
              <td>{r.createdAt}</td>
              <td>{r.startTime}</td>
              <td>{r.endTime}</td>
              <td>
                <button className="btn btn-warning btn-sm mx-2" >Edit</button>
                <button className="btn btn-danger btn-sm mx-1" >Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>  
      ) : (
        <div className="card-body">
          <p className="alert alert-danger">Not found reservations</p>
        </div>
      )}
      <div>
        <button className="btn btn-primary btn-sm" >New Reservation</button>
      </div>
    </div>
  )
}
