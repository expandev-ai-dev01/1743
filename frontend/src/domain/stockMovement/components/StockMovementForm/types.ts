import type { CreateStockMovementDto } from '../../types';

export interface StockMovementFormProps {
  onSubmit: (data: CreateStockMovementDto) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

export interface StockMovementFormData {
  idProduct: string;
  movementType: string;
  quantity: string;
  reason?: string;
  referenceDocument?: string;
  lot?: string;
  expirationDate?: string;
}
