import { useMutation, useQueryClient } from '@tanstack/react-query';
import { stockMovementService } from '../../services/stockMovementService';
import type { UseStockMovementCreateOptions, UseStockMovementCreateReturn } from './types';

export const useStockMovementCreate = (
  options: UseStockMovementCreateOptions = {}
): UseStockMovementCreateReturn => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: stockMovementService.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
      options.onSuccess?.(data);
    },
    onError: (err: Error) => {
      options.onError?.(err);
    },
  });

  return {
    create: mutateAsync,
    isCreating: isPending,
    error: error as Error | null,
  };
};
