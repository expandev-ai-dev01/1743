import type { StockMovement } from '../../types';

export interface StockMovementListProps {
  movements: StockMovement[];
  onReverse?: (movement: StockMovement) => void;
  isLoading?: boolean;
}
