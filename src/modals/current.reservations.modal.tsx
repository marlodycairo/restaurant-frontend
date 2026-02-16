import type { Table } from "../interfaces/table.interface"

interface currentReservationsProps {
  table: Table;
  onClose: () => void;
  updateStatus: (newStatus: number) => Promise<void>;
}

export const CurrentReservationsModal = ({ table, onClose, updateStatus }: currentReservationsProps) => {
  // TODO: Refactorizar con React Query

  if (!table) return null;

  return (
    <div>
      {/**modal */}
      <div className="modal-backdrop fade show"></div>
      <div className="modal fade show" style={{ display: 'block' }} tabIndex={-1} >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow-lg rounded-4">
            <div className="modal-header bg-light">
              <h5 className="modal-title fw-semibold display-6">Table selected {table.number}</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <p>Gestionar mesa</p>
              <div className="d-grid gap-2">
                <button className="btn btn-outline-success btn-lg" onClick={() => updateStatus(1)}>Disponible</button>
                <button className="btn btn-outline-danger btn-lg" onClick={() => updateStatus(2)}>Asignada</button>
                <button className="btn btn-outline-warning btn-lg" onClick={() => updateStatus(3)}>Reservada</button>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  )
}
