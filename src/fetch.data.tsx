import axios from "axios";
import type { Table } from "./interfaces/table.interface";
import type { Reservation } from "./interfaces/reservation.interface";

  const API_URL_Tables = 'https://localhost:44329/api/Tables';

  const API_URL_Reservations = 'https://localhost:44329/api/Reservations';

export const getTables = async () => {

  try {
    const resp = await axios.get(API_URL_Tables);
    return resp.data;
  } catch (error) {
    console.error(error);
  }
}

export const updateTable = async (id: number, data: Table) => {
  try {
    const resp = await axios.put(`${API_URL_Tables}/${id}`, data);
    return resp.data;
  } catch (error) {
    console.error(error);
  }
}


/** ---------------- Reservations -------------------- */

export const getReservations = async () => {
  try {
    const resp = await axios.get(API_URL_Reservations);
    return resp.data;
  } catch (error) {
    console.error(error);
  }
}


export const postReservation = async (reservation: Reservation) => {
  try {
    const resp = await axios.post(API_URL_Reservations, reservation);
    return resp.data;
  } catch (error) {
    console.error(error);
  }
}
