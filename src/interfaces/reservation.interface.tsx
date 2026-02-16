export const ReservationStatus = {
  Confirmed: 'confirmed',
  Completed: 'completed',
  Cancelled: 'cancelled',
  NoShow: 'no-show',
} as const;

export type ReservationStatusType = (typeof ReservationStatus)[keyof typeof ReservationStatus];

export interface Reservation {
  id: number;
  customerName: string;
  phone: string;
  startTime: string;
  endTime: string;
  tableId: number;
  createdAt: string;
  status?: ReservationStatusType;
}