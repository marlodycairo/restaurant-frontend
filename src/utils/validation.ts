import { z } from 'zod';

export const ReservationFormSchema = z.object({
  id: z.number().optional(),
  customerName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  phone: z
    .string()
    .regex(/^\d{10}$/, 'El teléfono debe tener 10 dígitos')
    .or(z.string().regex(/^\+\d{1,3}\d{9,14}$/, 'Formato de teléfono inválido')),
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:mm)'),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:mm)'),
  tableId: z
    .number()
    .min(1, 'Debes seleccionar una mesa'),
  createdAt: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), 'Fecha inválida'),
});

export type ReservationFormData = z.infer<typeof ReservationFormSchema>;

export const validateReservation = (data: unknown) => {
  try {
    return ReservationFormSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { errors: error.flatten().fieldErrors };
    }
    throw error;
  }
};
