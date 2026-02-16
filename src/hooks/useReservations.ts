import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reservationService } from '../services';
import type { Reservation } from '../interfaces/reservation.interface';

interface GetReservationsParams {
  tableId?: number | string;
  startDate?: string;
  endDate?: string;
  status?: 'today' | 'upcoming' | 'past';
}

const RESERVATIONS_QUERY_KEY = ['reservations'];

export const useReservations = (params?: GetReservationsParams) => {
  return useQuery({
    queryKey: [RESERVATIONS_QUERY_KEY, params],
    queryFn: async () => {
      const { reservations, error } = await reservationService.getAll(params);
      if (error) throw new Error(error);
      return reservations;
    },
    staleTime: 3 * 60 * 1000, // 3 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
};

export const useReservationMutations = () => {
  const queryClient = useQueryClient();

  const createReservation = useMutation({
    mutationFn: (reservation: Omit<Reservation, 'id'>) =>
      reservationService.create(reservation as Reservation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESERVATIONS_QUERY_KEY });
    },
  });

  const updateReservation = useMutation({
    mutationFn: (payload: { id: number; reservation: Reservation }) =>
      reservationService.update(payload.id, payload.reservation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESERVATIONS_QUERY_KEY });
    },
  });

  const deleteReservation = useMutation({
    mutationFn: (id: number) => reservationService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESERVATIONS_QUERY_KEY });
    },
  });

  return { createReservation, updateReservation, deleteReservation };
};
