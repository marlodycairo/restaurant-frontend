import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tableService } from '../services';
import type { Table } from '../interfaces/table.interface';

const TABLES_QUERY_KEY = ['tables'];

export const useTables = () => {
  return useQuery({
    queryKey: TABLES_QUERY_KEY,
    queryFn: async () => {
      const { tables, error } = await tableService.getAll();
      if (error) throw new Error(error);
      return tables;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  });
};

export const useTableMutations = () => {
  const queryClient = useQueryClient();

  const updateTable = useMutation({
    mutationFn: (payload: { id: number; table: Table }) => 
      tableService.update(payload.id, payload.table),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TABLES_QUERY_KEY });
    },
  });

  const deleteTable = useMutation({
    mutationFn: (id: number) => tableService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TABLES_QUERY_KEY });
    },
  });

  return { updateTable, deleteTable };
};
