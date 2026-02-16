// Este archivo se mantiene por compatibilidad legacy
// Se recomienda usar src/services/index.ts en su lugar

import { reservationService, tableService } from './services';
import type { Table } from './interfaces/table.interface';
import type { Reservation } from './interfaces/reservation.interface';

interface GetReservationsParams {
  tableId?: number | string;
  startDate?: string;
  endDate?: string;
  status?: 'today' | 'upcoming' | 'past';
}

// Legacy exports - DEPRECATED, usa tableService en su lugar
export const getTables = async () => {
  const { tables } = await tableService.getAll();
  return tables;
};

export const getTableById = async (id: number) => {
  const { table } = await tableService.getById(id);
  return table;
};

export const updateTable = async (id: number, data: Table) => {
  const { table } = await tableService.update(id, data);
  return table;
};

export const deleteTable = async (id: number) => {
  await tableService.delete(id);
};

// Legacy exports - DEPRECATED, usa reservationService en su lugar
export const getReservations = async (params?: GetReservationsParams) => {
  const { reservations } = await reservationService.getAll(params);
  return reservations;
};

export const getReservationById = async (id: number) => {
  const { reservation } = await reservationService.getById(id);
  return reservation;
};

export const postReservation = async (reservation: Reservation) => {
  const { reservation: created } = await reservationService.create(reservation);
  return created;
};

export const updateReservation = async (id: number, data: Reservation) => {
  const { reservation: updated } = await reservationService.update(id, data);
  return updated;
};

export const deleteReservation = async (id: number) => {
  await reservationService.delete(id);
};

