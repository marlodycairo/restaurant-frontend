import { useEffect, useState } from "react";
import { getReservationsByTable } from "../fetch.data";
import type { Reservation } from "../interfaces/reservation.interface"
import type { Table } from "../interfaces/table.interface";

interface currentReservationsProps {
  table: Table;
  onClose: () => void;
  updateStatus: (newStatus: number) => Promise<void>;
}

export const CurrentReservationsModal = ({ table, onClose, updateStatus }: currentReservationsProps) => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [message, setMessage] = useState<string | null>(null);


  console.log('status prop modal: ', updateStatus);
  useEffect(() => {

    reservationsByTable(table.tableNumber);
  }, [table.tableNumber]);

  const reservationsByTable = async (tableId: number) => {
    try {
      const dataReservations = await getReservationsByTable(tableId);
      if (dataReservations.error) {
        setMessage(dataReservations.error);
      } else {
        setReservations(dataReservations);
      }
      //setReservations(dataReservations);
    } catch (error) {
      console.error(error);
    }
  }

  if (!table) return null;

  return (
    <div>
      {/**modal */}
      <div className="modal-backdrop fade show"></div>
      <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1} >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4">
            <div className="modal-header bg-light">
              <h5 className="modal-title fw-semibold display-6">Table selected {table.tableNumber}</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <p>Current reservations</p>

              {reservations.length > 0 ? (
                <table className="table table-bordered border-info">
                  <thead>
                    <tr>
                      <th>No. reserva</th>
                      <th>Cliente</th>
                      <th>Fecha</th>
                      <th>Action</th>
                      <th>State</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map(r => (
                      <tr key={r.id}>
                        <td>{r.id}</td>
                        <td>{r.customerName}</td>
                        <td>{r.startTime}</td>
                        <td>
                          <button className="btn btn-warning btn-sm">edit</button>
                          <button className="btn btn-danger btn-sm">delete</button>
                        </td>
                        <td>
                          {/* <label>
                          <input type="checkbox" />
                        </label> */}
                          <button className="btn btn-warning btn-sm">Assigned</button>
                          <button className="btn btn-success btn-sm">Available</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div>
                  <p className="alert alert-warning">{message}</p>
                </div>

              )}
              {/**table */}
              <div className="d-grid gap-2">
                <button className="btn btn-outline-success btn-lg" onClick={() => updateStatus(1)}>Available</button>
                <button className="btn btn-outline-danger btn-lg" onClick={() => updateStatus(2)}>Assigned</button>
                <button className="btn btn-outline-warning btn-lg" onClick={() => updateStatus(3)}>Reserved</button>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  )
}
