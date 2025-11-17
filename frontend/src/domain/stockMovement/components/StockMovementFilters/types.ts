import type { StockMovementListParams } from '../../types';

export interface StockMovementFiltersProps {
  onFilterChange: (filters: StockMovementListParams) => void;
  initialFilters?: StockMovementListParams;
}
