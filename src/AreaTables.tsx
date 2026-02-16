import * as signalR from '@microsoft/signalr';
import "./App.css";
import "./AreaTables.css";
import { tableService, reservationService } from './services/index';
import type { Table } from './interfaces/table.interface';
import type { Reservation } from './interfaces/reservation.interface';
import { useState, useEffect } from "react";
import React from 'react';

export interface TableVisual extends Table {
  visualStyle: string;
  visualLabel: string;
  visualBadge: string;
}

const visualStyles = {
  Available: {
    color: "#4CAF50",
    label: "Available",
    badge: "bg-success",
  },
  Reserved: {
    color: "#FF9800",
    label: "Reserved",
    badge: "bg-warning text-dark",
  },
  Assigned: {
    color: "#F44336",
    label: "Assigned",
    badge: "bg-danger",
  },
};

export const AreaTables = () => {

  const [tables, setTables] = useState<Table[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Reservation>({
    id: 0,
    customerName: '',
    phone: '',
    startTime: '',
    endTime: '',
    tableId: 0,
    createdAt: ''
  });

  // recupera las mesas y las reservaciones
  useEffect(() => {
    const loadData = async () => {
      const today = new Date().toISOString().split("T")[0];
      try {
        const [dataTables, dataReservations] = await Promise.all([
          tableService.getAll(),
          reservationService.getAll({ startDate: today, endDate: today, })
        ]);
        console.log("Mesas cargadas:", dataTables);
        console.log("Reservas cargadas:", dataReservations);

        setTables(dataTables.tables ?? []);
        setReservations(dataReservations.reservations ?? []);
      } catch (error) {
        console.error(error);
      }
    };

    loadData();
  }, []);

  // signalR connection
  useEffect(() => {

    const connection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:44329/hubs/Tables')  //  'https://localhost:44329/api/Tables'
      .configureLogging(signalR.LogLevel.Information)
      .withAutomaticReconnect()
      .build();

    const startConnection = async () => {
      try {
        await connection.start();
        console.log("Conectado al Hub de SignalR");

        // Subscripción al evento
        const handler = () => {
          console.log("Actualización recibida desde el backend");
          // loadTables(); // si luego quieres recargar mesas
        };

        connection.on("TablesUpdated", handler);

        // Log de reconexiones
        connection.onreconnecting(() => {
          console.warn("SignalR intentando reconectar...");
        });

        connection.onreconnected(() => {
          console.log("SignalR reconectado correctamente");
        });

        connection.onclose(() => {
          console.warn("SignalR se ha cerrado");
        });

        // Cleanup
        return () => {
          connection.off("TablesUpdated", handler);
          connection.stop();
        };

      } catch (error) {
        console.error("Error conectando a SignalR:", error);
      }
    };

    const cleanupPromise = startConnection();

    return () => {
      // Si startConnection generó un cleanup, lo esperamos
      cleanupPromise.then(cleanup => {
        if (typeof cleanup === "function") cleanup();
      });
    };
  }, []);

  // estilos para las mesas
  const tablesStyles = (status: number) => {
    switch (status) {
      case 1:
        return visualStyles.Available;
      case 2:
        return visualStyles.Assigned;
      case 3:
        return visualStyles.Reserved;
      default:
        return {
          color: 'green',
          label: 'Out of service',
          badge: 'bg-secondary'
        };
    }
  }

  // recupera las mesas con sus estilos
  const getTablesStyles = () => {
    const processedTables: TableVisual[] = (tables ?? []).map((t) => {
      const { color, label, badge } = tablesStyles(t.status);

      return {
        ...t,
        visualStyle: color,
        visualLabel: label,
        visualBadge: badge
      };
    });

    return processedTables;
  }

  const openModal = () => {
    setShowModal(true);
  }

  const closeModal = () => {
    setShowModal(false);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const today = new Date().toISOString().split("T")[0];

    const payload = {
      ...formData,
      createdAt: new Date().toISOString(),
      startTime: `${today}T${formData.startTime}:00`,
      endTime: `${today}T${formData.endTime}:00`,
    };

    try {
      if (editingReservation) {
        // ✅ Si hay reserva en edición, usamos update
        await reservationService.update(editingReservation.id, payload);

        // Actualizamos la lista en el frontend
        setReservations(prev =>
          prev.map(r => (r.id === editingReservation.id ? { ...r, ...payload } : r))
        );
      } else {
        // ✅ Si no hay reserva en edición, creamos nueva
        await reservationService.create(payload);

        // Recargar reservas del día
        const data = await reservationService.getAll({ startDate: today, endDate: today });
        setReservations(data.reservations ?? []);
      }

      // Limpiar estado del modal
      closeModal();
      setEditingReservation(null);
      setFormData({
        id: 0,
        customerName: '',
        phone: '',
        startTime: '',
        endTime: '',
        tableId: 0,
        createdAt: ''
      });

    } catch (error) {
      console.error(error);
    }
  };


  const handleEditReservation = (reservation: Reservation) => {
    setEditingReservation(reservation);
    setFormData({
      ...reservation,
      startTime: reservation.startTime.split("T")[1].slice(0, 5), // HH:mm
      endTime: reservation.endTime.split("T")[1].slice(0, 5)
    });
    openModal();
  };


  const handleDeleteReservation = async (id: number) => {
    try {
      await tableService.delete(id);
      setReservations(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="app-root d-flex">
      {/* MAIN */}
      <main className="main-content p-4">
        <header className="d-flex justify-content-between align-items-start mb-4">
          <div className='text-center mb-4 col-10'>
            <h2 className="fw-bold">Restaurant Control Panel</h2>
            <small className="text-muted">Vista estado de las reservas</small>
          </div>
          <div>
            <button className="btn btn-outline-primary" onClick={openModal} >Nueva reserva</button>
          </div>
        </header>
        {/* RESERVAS */}
        <div>
          <div>
            <h2 className='text-center display-5'>Reservaciones</h2>
          </div>
          {/* TABLA FILTRADA */}
          {reservations.length === 0 && (
            <p className='alert alert-warning text-center fw-bolder' style={{ fontSize: '20px' }} >
              No hay reservas para mostrar!
            </p>
          )}
          <table className='table table-bordered'>
            <thead>
              <tr className='text-center'>
                <th># reserva</th>
                <th># mesa</th>
                <th>Asignado a</th>
                <th>Fecha - Hora</th>
                <th>Hasta</th>
                <th>Options</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map(r => (
                <tr>
                  <td>{r.id}</td>
                  <td>{r.tableId}</td>
                  <td>{r.customerName}</td>
                  <td>{r.startTime}</td>
                  <td>{r.endTime}</td>
                  <td className='text-center'>
                    <button className='btn btn-warning btn-sm m-auto mx-3' onClick={() => handleEditReservation(r)} >Modificar</button>
                    <button className='btn btn-danger btn-sm' onClick={() => handleDeleteReservation(r.id)} >Cancelar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>



        </div>
        {/* TABLE GRID */}
        <section>
          <div className="row g-3">
            {getTablesStyles().map((t) => (
              <div key={t.id} className="col-xl-3 col-lg-4 col-md-6">
                <div className="card table-card h-100 p-3" style={{ border: `3px solid ${t.visualStyle}`, transition: 'transform 0.2s' }}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="table-number fw-bold">Mesa {t.number}</div>
                      <span className={`badge ${t.visualBadge} bg- status-badge`}>{t.visualLabel}</span>
                      <div className="text-muted small"> Capacidad {t.capacity}</div>
                    </div>
                    <span className={`badge ${t.visualBadge} bg- status-badge`}></span>
                  </div>
                  <div className="mt-3 d-flex justify-content-between align-items-end">
                    <div className="text-muted small">Últ. actualización: —</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
        {/* MODAL DE NUEVA RESERVA */}
        {showModal && (
          <div className='modal fade show d-block' tabIndex={-1} role='dialog' style={{ background: "rgba(0, 0, 0, .45)" }}>
            <div className='modal-dialog modal-dialog-centered'>
              <div className='modal-content'>
                <form onSubmit={handleSubmit} >
                  <div className='modal-header'>
                    <h5 className='modal-title'>{editingReservation ? "Editar reserva" : "Nueva reserva"}</h5>
                    <button className='btn-close' onClick={closeModal}></button>
                  </div>
                  <div className='modal-body'>
                    <div className='mb-3'>
                      <label className='form-label fw-semibold'>Titular reservación</label>
                      <input type="text" name='customerName' className='form-control' placeholder='Nombre del cliente' value={formData.customerName} onChange={handleChange} required />
                    </div>
                    <div className='mb-3'>
                      <label className='form-label fw-semibold'>Telefono</label>
                      <input type="text" name='phone' className='form-control' placeholder='Telefono del cliente' value={formData.phone} onChange={handleChange} required />
                    </div>
                    <div className='mb-3'>
                      <label className='form-label fw-semibold'>Fecha</label>
                      <input type="date" name='createdAt' className='form-control' value={formData.createdAt} onChange={handleChange} required />
                    </div>
                    <div className='mb-3'>
                      <label className='form-label fw-semibold'>Reserva desde</label>
                      <input type="time" name='startTime' className='form-control' value={formData.startTime} onChange={handleChange} required />
                    </div>
                    <div className='mb-3'>
                      <label className='form-label fw-semibold'>Reserva hasta</label>
                      <input type="time" name='endTime' className='form-control' value={formData.endTime} onChange={handleChange} required />
                    </div>
                    <div className='mb-3'>
                      <label className='form-label fw-semibold'>Mesa</label>
                      <select className='form-select' name='tableId' value={formData.tableId} onChange={handleChange} required >
                        <option value="">Elegir mesa</option>
                        {tables.map(t => (
                          <option key={t.id} value={t.id}>{t.number}</option>
                        ))}
                      </select>
                    </div>

                  </div>
                  <div className='modal-footer'>
                    <button className='btn btn-secondary' onClick={closeModal}>Cancelar</button>
                    <button type='submit' className='btn btn-primary'>Guardar</button>
                  </div>


                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

