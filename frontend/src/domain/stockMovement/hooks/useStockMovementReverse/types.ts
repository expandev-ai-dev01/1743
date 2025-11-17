import type { ReverseStockMovementDto } from '../../types';

export interface UseStockMovementReverseOptions {
  onSuccess?: (data: { idReversalMovement: number }) => void;
  onError?: (error: Error) => void;
}

export interface UseStockMovementReverseReturn {
  reverse: (id: number, data: ReverseStockMovementDto) => Promise<{ idReversalMovement: number }>;
  isReversing: boolean;
  error: Error | null;
}
