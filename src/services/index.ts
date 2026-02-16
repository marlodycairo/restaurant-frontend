import { apiService } from './api.service';
import type { Table, TableAPI } from '../interfaces/table.interface';
import type { Reservation } from '../interfaces/reservation.interface';

const mapTableFromAPI = (table: TableAPI): Table => ({
  id: table.idTable,
  number: table.tableNumber,
  status: table.tableStatus,
  capacity: table.capacity,
});

const mapTableToAPI = (table: Table): TableAPI => ({
  idTable: table.id,
  tableNumber: table.number,
  tableStatus: table.status,
  capacity: table.capacity,
});

export const tableService = {
  async getAll() {
    const { data, error } = await apiService.get<TableAPI[]>('/api/Tables');
    if (error || !data) return { tables: [], error };
    console.log("Datos recibidos de getAllTables:", data.data.data);
    return { tables: data.data.data.map(mapTableFromAPI), error: null };
  },

  async getById(id: number) {
    const { data, error } = await apiService.get<TableAPI>(`/api/Tables/${id}`);
    if (error || !data) return { table: null, error };
    return { table: mapTableFromAPI(data), error: null };
  },

  async update(id: number, table: Table) {
    const payload = mapTableToAPI(table);
    const { data, error } = await apiService.put<TableAPI>(`/api/Tables/${id}`, payload);
    if (error || !data) return { table: null, error };
    return { table: mapTableFromAPI(data), error: null };
  },

  async delete(id: number) {
    const { error } = await apiService.delete(`/api/Tables/${id}`);
    return { success: !error, error };
  },
};

interface GetReservationsParams {
  tableId?: number | string;
  startDate?: string;
  endDate?: string;
  status?: 'today' | 'upcoming' | 'past';
}

export const reservationService = {
  async getAll(params?: GetReservationsParams) {
    const { data, error } = await apiService.get<Reservation[]>('/api/Reservations', params as Record<string, unknown> | undefined);
    if (error || !data) return { reservations: [], error };
    return { reservations: data.data.data, error: null };
  },

  async getById(id: number) {
    const { data, error } = await apiService.get<Reservation>(`/api/Reservations/${id}`);
    if (error || !data) return { reservation: null, error };
    return { reservation: data, error: null };
  },

  async create(reservation: Reservation) {
    const { data, error } = await apiService.post<Reservation>('/api/Reservations', reservation);
    if (error || !data) return { reservation: null, error };
    return { reservation: data, error: null };
  },

  async update(id: number, reservation: Reservation) {
    const { data, error } = await apiService.put<Reservation>(`/api/Reservations/${id}`, reservation);
    if (error || !data) return { reservation: null, error };
    return { reservation: data, error: null };
  },

  async delete(id: number) {
    const { error } = await apiService.delete(`/api/Reservations/${id}`);
    return { success: !error, error };
  },
};
