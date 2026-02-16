import React from 'react';
import { Alert, Spinner, Table } from 'react-bootstrap';
import type { Reservation } from '../interfaces/reservation.interface';

interface ReservationsTableProps {
  reservations: Reservation[];
  isLoading: boolean;
  error: string | null;
  onEdit: (reservation: Reservation) => void;
  onDelete: (id: number) => Promise<void>;
  isDeletingId?: number | null;
}

export const ReservationsTable = React.memo<ReservationsTableProps>(
  ({ reservations, isLoading, error, onEdit, onDelete, isDeletingId }) => {
    if (isLoading) {
      return (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
          <p className="mt-2">Cargando reservas...</p>
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="danger">
          <Alert.Heading>Error al cargar reservas</Alert.Heading>
          <p>{error}</p>
        </Alert>
      );
    }

    if (reservations.length === 0) {
      return (
        <Alert variant="info" className="text-center fw-bold" style={{ fontSize: '1.125rem' }}>
          No hay reservas para mostrar
        </Alert>
      );
    }

    return (
      <div className="table-responsive">
        <Table striped bordered hover>
          <thead>
            <tr className="text-center">
              <th>#</th>
              <th>Mesa</th>
              <th>Cliente</th>
              <th>Teléfono</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((reservation) => (
              <tr key={reservation.id}>
                <td className="text-center">{reservation.id}</td>
                <td className="text-center">{reservation.tableId}</td>
                <td>{reservation.customerName}</td>
                <td className="text-center">{reservation.phone}</td>
                <td>{new Date(reservation.startTime).toLocaleString('es-ES')}</td>
                <td>{new Date(reservation.endTime).toLocaleString('es-ES')}</td>
                <td className="text-center">
                  <button
                    className="btn btn-warning btn-sm me-2"
                    onClick={() => onEdit(reservation)}
                    disabled={isDeletingId === reservation.id}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => onDelete(reservation.id)}
                    disabled={isDeletingId === reservation.id}
                  >
                    {isDeletingId === reservation.id ? 'Eliminando...' : 'Cancelar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    );
  }
);

ReservationsTable.displayName = 'ReservationsTable';
