// hooks/useRestaurantLogic.ts
import { useState, useEffect } from 'react';
import * as signalR from '@microsoft/signalr';
import { getTables, getReservations } from '../fetch.data'; // Tu archivo
import type { Table } from '../interfaces/table.interface';
import type { Reservation } from '../interfaces/reservation.interface';

export const useRestaurantLogic = () => {
    const [tables, setTables] = useState<Table[]>([]);
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);

    // Función para recargar datos
    const refreshData = async (filterStatus: 'today' | 'upcoming' | 'past' | '' = '') => {
        try {
            const [dataTables, dataReservations] = await Promise.all([
                getTables(),
                getReservations(filterStatus ? { status: filterStatus as 'today' | 'upcoming' | 'past' } : {})
            ]);
            setTables(dataTables ?? []);
            setReservations(dataReservations ?? []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    // SignalR Setup
    useEffect(() => {
        const connection = new signalR.HubConnectionBuilder()
            .withUrl('https://localhost:44329/hubs/Tables')
            .withAutomaticReconnect()
            .build();

        const startConnection = async () => {
            try {
                await connection.start();
                console.log("SignalR Conectado");
                connection.on("TablesUpdated", () => {
                    console.log("Update recibido");
                    refreshData(); // Recargamos cuando el servidor avisa
                });
            } catch (error) {
                console.error("Error SignalR", error);
            }
        };

        startConnection();

        // Carga inicial
        refreshData();

        return () => {
            connection.stop();
        };
    }, []);

    return { tables, reservations, refreshData, loading };
};
