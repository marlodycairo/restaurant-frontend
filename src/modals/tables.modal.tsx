import type { Table } from "../interfaces/table.interface"

interface tableProps {
  table: Table;
  onClose: () => void;
}

export const TablesModal = ({table, onClose}: tableProps) => {

  return (
    <div>
      {/* Backdrop */}
          <div className="modal-backdrop fade show" onClick={onClose}></div>

          {/* Contenedor de la modal (también clickeable) */}
          <div className="modal fade show" style={{ display: "block" }}
            tabIndex={-1} role="dialog" onClick={onClose} // cerrar si clic fuera
          >
            <div className="modal-dialog modal-dialog-centered" role="document" onClick={(e) => e.stopPropagation()} // evitar cierre al click interno
            >
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Gestionar Mesa {table?.tableNumber}</h5>
                  <button type="button" className="btn-close" onClick={onClose} ></button>
                </div>

                <div className="modal-body">
                  <p>Options</p>
                  <div className="m-3">
                    <button className="btn btn-info btn-sm">Reservations</button>
                    {/* <button className="btn btn-outline-success btn-sm me-3" onClick={() => handleChangeStatus(1)} >Available</button>
                    <button className="btn btn-outline-danger btn-sm me-3" onClick={() => handleChangeStatus(2)} >Assigned</button>
                    <button className="btn btn-outline-warning btn-sm" onClick={() => handleChangeStatus(3)} >Reserved</button> */}
                  </div>
                  <div className="m-2">
                    <p>current reservations</p>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary " onClick={onClose} >Cerrar</button>
                </div>
              </div>
            </div>
          </div>
    </div>
  )
}
