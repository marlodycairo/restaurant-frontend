import { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css'; // Importaremos este CSS para los efectos
import { getTables, updateTable, getReservations } from './fetch.data';
import './AreaTables.css';
import type { Reservation } from './interfaces/reservation';
import type { Table } from './interfaces/table';

// --- Componente de Estilos de Mesas ---

const statusOptions = [
  { id: 1, name: 'Disponible', class: 'btn-outline-success' },
  { id: 3, name: 'Reservada', class: 'btn-outline-danger' },
  { id: 2, name: 'Asignado', class: 'btn-outline-secondary' },
];

// --- NUEVO: Estilos visuales ---
// Definimos los 3 colores que verá el usuario
const visualStyles = {
  Disponible: {
    cardClass: 'border-success border-2 shadow-sm',
    textClass: 'text-success',
    badgeClass: 'bg-success-subtle text-success-emphasis',
    badgeText: 'Disponible',
    statusClass: 'status-available',
  },
  Asignada: { // El nuevo estado para "próxima reserva"
    cardClass: 'bg-warning text-white shadow',
    textClass: 'text-white',
    badgeClass: 'bg-light text-warning-emphasis',
    badgeText: 'Asignada',
    statusClass: 'status-assigned',
  },
  Ocupada: { // Para 'Asignado' (status 2) o 'Reservada' (status 3)
    cardClass: 'bg-secondary text-white shadow',
    textClass: 'text-white',
    badgeClass: 'bg-light text-dark-emphasis',
    badgeText: 'Ocupada',
    statusClass: 'status-occupied',
  },
  Reservada: { // Color para "Reservada" (lejos) - ¡Usamos el de disponible!
    cardClass: 'border-success border-2 shadow-sm',
    textClass: 'text-success',
    badgeClass: 'bg-success-subtle text-success-emphasis',
    badgeText: 'Disponible', // ¡El truco!
    statusClass: 'status-available',
  }
};

export const AreaMesas = () => {
  
  const [tables, setTables] = useState<Table[]>([]);

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

// 2. Qué mesa está seleccionada para editar en la modal
  const [selectedTable, setSelectedTable] = useState<Table | null>();
  // 3. Visibilidad de la modal
  const [showModal, setShowModal] = useState(false);
          
  useEffect(() => {
    const loadTables = async () => {
      try {
        const [tablesData, reservationsData] = await Promise.all([
          getTables(),
          getReservations()
        ]);
 
        setTables(tablesData);
        setReservations(reservationsData);
      } catch (error) {
        console.error(error);
      }
    }

    loadTables();

  }, []);
  
  // --- 2. El Reloj (Timer) ---
  useEffect(() => {
    // Actualiza la 'currentTime' cada 60 segundos
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 1 minuto

    console.log("Reloj iniciado", timerId);
    // Limpiamos el intervalo cuando el componente se desmonte
    return () => clearInterval(timerId);
  }, []); // Se ejecuta solo una vez al montar

  /* Esta función determina el estilo visual de UNA mesa,
   * basándose en su estado de DB y la hora actual.
   */
  const getDynamicTableStyles = useCallback((table: Table) => {
    
    // ESTADO 2: 'Asignado' (Ocupada)
    // Si está 'Asignado' en la DB, siempre se muestra ocupada.
    if (table.tableStatus === 2) {
      return visualStyles.Asignada;
    }

    // ESTADO 3: 'Reservada'
    // Aquí comprobamos la hora.
    if (table.tableStatus === 3) {
      // Buscamos la reserva de esta mesa
      const reservation = reservations.find(r => r.tableId === table.idTable);

      if (reservation) {
        const reservationTime = new Date(reservation.reservationTime);
        const minutesUntil = (reservationTime.getTime() - currentTime.getTime()) / 60000;

        // --- TU LÓGICA DE TIEMPO ---
        // Si faltan 30 min o menos (o ya pasó hace poco)
        if (minutesUntil <= 30 && minutesUntil > -120) { // 30 min antes hasta 2h después
          return visualStyles.Reservada; // ¡Amarillo!
        }

        // Si la reserva es muy en el futuro (minutesUntil > 30)
        // La mostramos como DISPONIBLE (verde)
        return visualStyles.Disponible; 
      }
    }
    return visualStyles.Disponible;
 
  }, [reservations, currentTime]);

  // --- 4. Memoización (Optimización) ---
  // Calculamos los estilos de todas las mesas solo si algo cambia
  const tablesWithVisualStyles = useMemo(() => {
    return tables.map(table => ({
      ...table,
      visuals: getDynamicTableStyles(table) // Calcula el estilo
    }));
  }, [tables, getDynamicTableStyles]); // <- Se re-calcula si cambia el reloj
  // --- FUNCIONES DE LÓGICA ---

  // 1. Abre la modal y guarda la mesa seleccionada
  const handleOpenModal = (table: Table) => {
    setSelectedTable(table);
    setShowModal(true);
  };

  // 2. Cierra la modal y limpia la mesa seleccionada
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTable(null);
  };

  // 3. ACTUALIZA el estado de la mesa en la lista principal
  const handleUpdateStatus = async (newStatus: number) => {
    if (!selectedTable) return; // Seguridad

    const updatedTableData = {
      ...selectedTable,
      tableStatus: newStatus
    };

    try {
      await updateTable(selectedTable.idTable, updatedTableData);

      setTables(currentTables => 
        currentTables.map(t => 
          t.idTable === selectedTable.idTable ? updatedTableData : t
        )
      );

      // Si se crea una reserva (newStatus: 3),
      // deberías también añadir la reserva a la lista local 'reservations'
      // o volver a pedirlas con getReservations()
      if (newStatus === 3) {
         // Opcional: recargar solo las reservas para ver el cambio
         // getReservations().then(setReservations);
      }

      handleCloseModal();

    } catch (error) {
      console.log(error);
    }
  };

  
  // Función interna para obtener las clases de estilo
  // (Esto no es "lógica de estado", solo ayuda a organizar las clases de Bootstrap)
  // const getTableStyles = (table: Table) => {
  //   switch (table.tableStatus) {
  //     case 2: //'Asignada'
  //       return {
  //         cardClass: 'bg-warning text-white shadow', // Tarjeta sólida
  //         textClass: 'text-white',
  //         badgeClass: 'bg-light text-warning-emphasis',
  //         badgeText: 'Asignado',
  //         statusClass: 'status-occupied',
  //       };
  //     case 3: //'Reservada'
  //       return {
  //         cardClass: 'border-danger border-2 shadow-sm', // Borde rojo
  //         textClass: 'text-danger',
  //         badgeClass: 'bg-danger-subtle text-danger-emphasis',
  //         badgeText: 'Reservada',
  //         statusClass: 'status-reserved',
  //       };
  //     case 1: //'Disponible'
  //     default:
  //       return {
  //         cardClass: 'border-success border-2 shadow-sm', // Borde verde
  //         textClass: 'text-success',
  //         badgeClass: 'bg-success-subtle text-success-emphasis',
  //         badgeText: 'Disponible',
  //         statusClass: 'status-available',
  //       };
  //   }
  // };


  return (
    <div className="container my-5">
      <h2 className="text-center mb-4 fw-light">Plano de Mesas</h2>

      {/* Sistema de Grillas (Grid) de Bootstrap */}
      <div className="row g-4"> {/* g-4 añade espaciado (gutter) */}

        {tablesWithVisualStyles.map(table => {

          //const styles = getTableStyles(table);
          const styles = table.visuals

          return (
            // Columnas responsivas:
            // - 4 por fila en pantallas grandes (lg)
            // - 3 por fila en pantallas medianas (md)
            // - 2 por fila en pantallas pequeñas (sm)
            <div className="col-lg-3 col-md-4 col-sm-6" key={table.idTable}>

              {/* --- Aquí empieza la Card de Bootstrap --- */}
              <div className={`card h-100 text-center ${styles.cardClass} ${styles.statusClass}`} 
                  onClick={() => handleOpenModal(table)} >

                    {/* {table.tableStatus} */}

                <div className="card-body d-flex flex-column justify-content-center">

                  {/* Número de la mesa (grande) */}
                  <h1 className={`display-3 fw-bold ${styles.textClass}`}>{table.idTable}
                  </h1>

                  {/* Capacidad */}
                  <p className="card-text text-muted mb-2">
                    Capacidad: {table.capacity} personas
                  </p>

                  {/* Badge de Estado */}
                  <div>
                    <span className={`badge rounded-pill ${styles.badgeClass}`}>
                      {styles.badgeText}
                    </span>
                  </div>

                </div> {/* fin card-body */}
              </div> {/* fin card */}

            </div> // fin col
          );
        })}

      </div> {/* fin row */}

{/* --- LA MODAL DE BOOTSTRAP --- */}
      {/* * Usamos clases de Bootstrap ('show', 'd-block') controladas por
        * el estado 'showModal' para mostrarla u ocultarla.
      */}
      
      {/* 1. El Fondo Oscuro (Backdrop) */}
      <div 
        className={`modal-backdrop fade ${showModal ? 'show' : ''}`}
        style={{ display: showModal ? 'block' : 'none' }}
      ></div>

      {/* 2. El Contenido de la Modal */}
      <div 
        className={`modal fade ${showModal ? 'show' : ''}`} 
        style={{ display: showModal ? 'block' : 'none' }}
        tabIndex={-1} 
        role="dialog"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            
            {/* Cabecera de la Modal */}
            <div className="modal-header">
              <h5 className="modal-title">
                Gestionar Mesa {selectedTable?.idTable}
              </h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={handleCloseModal}
              ></button>
            </div>
            
            {/* Cuerpo de la Modal */}
            <div className="modal-body">
              <p className="mb-3">
                Selecciona el nuevo estado para la mesa:
              </p>
              
              {/* Grupo de botones vertical para elegir estado */}
              <div className="d-grid gap-2">
                {statusOptions.map(option => (
                  <button
                    key={option.id}
                    type="button"
                    className={`btn ${option.class} btn-lg`}
                    // Deshabilitamos el botón del estado actual
                    disabled={selectedTable?.tableStatus === option.id} 
                    // Al hacer clic, actualizamos el estado
                    onClick={() => handleUpdateStatus(option.id)} 
                  >
                    {option.name}
                  </button>
                ))}
              </div>

            </div>
            
            {/* Pie de la Modal */}
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={handleCloseModal}
              >
                Cancelar
              </button>
            </div>

          </div>
        </div>
      </div>
      {/* --- FIN DE LA MODAL --- */}


    </div> // fin container
  );
};