import axios, { AxiosError } from "axios";
import type { Table } from "./interfaces/table.interface";
import type { Reservation } from "./interfaces/reservation.interface";
import type { Product } from "./interfaces/product.interface";

  const API_URL_Tables = 'https://localhost:44329/api/Tables';
  const API_URL_Reservations = 'https://localhost:44329/api/Reservations';
  const API_URL_Products = 'https://localhost:44329/api/Products';

export const getTables = async () => {
  try {
    const resp = await axios.get(API_URL_Tables);
    return resp.data;
  } catch (error) {
    console.error(error);
  }
}

export const getTableById = async (id: number) => {
  try {
    const response = await axios.get(`${API_URL_Tables}/${id}`);
    return response.data;
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

export const deleteTable = async (id: number) => {
  try {
    await axios.delete(`${API_URL_Tables}/${id}`);
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

export const getReservationById = async (id: number) => {
  try {
    const response = await axios.get(`${API_URL_Reservations}/${id}`);
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

export const getReservationsByTable = async (tableId: number) => {
  try {
    const resp = await axios.get(`${API_URL_Reservations}/byTable/${tableId}`);
    return resp.data;
  } catch (error) {
    const err = error as AxiosError;
    if (err.response && err.response.status !== 200) {
      return { error: err.response.data }; // texto: "No hay reservas para esta mesa."
    }
    return { error: "Error al obtener las reservas" };
  }
}

export const postReservation = async (reservation: Reservation) => {
  console.log('post reservation: ', reservation);
  try {
    const resp = await axios.post(API_URL_Reservations, reservation);
    console.log('resp post: ', resp);
    return resp.data;
  } catch (error) {
    console.error(error);
  }
}

export const updateReservation = async (id: number, data: Reservation) => {
  try {
    const resp = await axios.put(`${API_URL_Reservations}/${id}`, data);
    return resp.data;
  } catch (error) {
    console.error(error);
  }
}

export const deleteReservation = async (id: number) => {
  try {
    await axios.delete(`${API_URL_Reservations}/${id}`);
  } catch (error) {
    console.error(error);
  }
}

/** -------------------------Products------------------- */

export const getProducts = async () => {
  try {
    const resp = await axios.get(API_URL_Products);
    console.log('response api: ', resp.data);
    return resp.data;
  } catch (error) {
    console.error(error);
  }
}

export const getProductById = async (id: number) => {
  try {
    const response = await axios.get(`${API_URL_Products}/${id}`);
    return response.data;
  } catch (error) {
    console.error(error);
  }
}

export const updateProduct = async (id: number, data: Product) => {
  try {
    const resp = await axios.put(`${API_URL_Products}/${id}`, data);
    return resp.data;
  } catch (error) {
    console.error(error);
  }
}

export const deleteProduct = async (id: number) => {
  try {
    await axios.delete(`${API_URL_Products}/${id}`);
  } catch (error) {
    console.error(error);
  }
}

/** 5. Flujo completo — Explicación de principio a fin

Aquí tienes el flujo funcional totalmente integrado, paso por paso.

Escenario:

Una reserva está programada para las 3:00 PM. Son las 2:59 PM y la aplicación debe cambiar la mesa a “Reservada” automáticamente.

1. El frontend carga la página

React hace:

GET /tables

GET /reservations

React se conecta al Hub:

connection.start()

connection.on("TablesUpdated", updateTables)

2. La API responde con el estado actual

Entrega lo que está en la base de datos.

No predice futuros cambios (eso lo hace el background).

3. Background Service ejecuta su ciclo

Ejemplo: corre cada 1 minuto o cada 30 minutos (según tu configuración).

¿Qué hace internamente?

Obtiene now = DateTimeOffset.UtcNow.

Carga todas las mesas con sus reservas.

Para cada mesa:

Revisa si existe una reserva activa:

r.StartTime <= now && r.EndTime > now


Si encuentra una reserva activa → Actualiza TableStatus.

Si el estado cambió → lo guarda en la BD.

Importante: el background no envia mesas sin cambios, solo cuando hay cambios reales.

4. El Background detecta cambio

Mesa 5 pasa de "Available" a "Reserved".

Lo persiste.

Luego envía por SignalR:

await hub.Clients.All.SendAsync("TablesUpdated", updatedTables);

5. SignalR Hub envía el evento a todas las conexiones activas

No ejecuta lógica extra.

No modifica base de datos.

No calcula nada.

Solo transmite.

6. El frontend React recibe el evento

El handler configurado se dispara:

connection.on("TablesUpdated", (tables) => {
    setTables(tables);
});


React:

Actualiza el estado.

Redibuja la UI inmediatamente.

Sin recargar.

Sin fetch adicional.*/