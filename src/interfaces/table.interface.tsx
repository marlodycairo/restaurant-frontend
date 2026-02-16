export const TableStatus = {
  Available: 1,
  Assigned: 2,
  Reserved: 3,
  OutOfService: 4,
} as const;

export type TableStatusType = (typeof TableStatus)[keyof typeof TableStatus];

export interface Table {
  id: number;
  number: number;
  status: number;
  capacity: number;
}

// Para mantener compatibilidad con API si necesario
export interface TableAPI {
  idTable: number;
  tableNumber: number;
  tableStatus: number;
  capacity: number;
}