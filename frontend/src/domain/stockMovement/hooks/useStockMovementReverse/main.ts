import { useMutation, useQueryClient } from '@tanstack/react-query';
import { stockMovementService } from '../../services/stockMovementService';
import type { UseStockMovementReverseOptions, UseStockMovementReverseReturn } from './types';

export const useStockMovementReverse = (
  options: UseStockMovementReverseOptions = {}
): UseStockMovementReverseReturn => {
  const queryClient = useQueryClient();

  const { mutateAsync, isPending, error } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => stockMovementService.reverse(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });
      options.onSuccess?.(data);
    },
    onError: (err: Error) => {
      options.onError?.(err);
    },
  });

  return {
    reverse: (id, data) => mutateAsync({ id, data }),
    isReversing: isPending,
    error: error as Error | null,
  };
};
