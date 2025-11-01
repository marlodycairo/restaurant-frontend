export interface Reservation {
        id: number;
        createdAt: string;
        startTime: string;
        endTime: string;
        tableId: number;
        customerName: string;
        phone: string;
}