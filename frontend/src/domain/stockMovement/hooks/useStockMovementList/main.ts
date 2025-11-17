import { useQuery } from '@tanstack/react-query';
import { stockMovementService } from '../../services/stockMovementService';
import type { UseStockMovementListOptions, UseStockMovementListReturn } from './types';

export const useStockMovementList = (
  options: UseStockMovementListOptions = {}
): UseStockMovementListReturn => {
  const { filters = {}, enabled = true } = options;

  const queryKey = ['stock-movements', filters];

  const { data, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: () => stockMovementService.list(filters),
    enabled,
  });

  return {
    data,
    isLoading,
    error: error as Error | null,
    refetch,
  };
};
