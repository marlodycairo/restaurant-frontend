export interface Reservation {
        id: number;
        createdAt: Date;
        reservationTime: Date;
        tableId: number;
        customerName: string;
        phone: string;
}