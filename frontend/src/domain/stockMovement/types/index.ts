export interface StockMovement {
  idStockMovement: number;
  dateTime: string;
  movementType: MovementType;
  idProduct: number;
  quantity: number;
  idUser: number;
  reason?: string;
  referenceDocument?: string;
  lot?: string;
  expirationDate?: string;
  productName?: string;
  userName?: string;
  isReversed?: boolean;
  reversalMovementId?: number;
}

export interface StockMovementListParams {
  idProduct?: number;
  startDate?: string;
  endDate?: string;
  movementType?: number;
  idUser?: number;
  sortOrder?: 'date_asc' | 'date_desc' | 'product_asc' | 'product_desc';
  pageSize?: number;
  pageNumber?: number;
}

export interface CreateStockMovementDto {
  idProduct: number;
  movementType: number;
  quantity: number;
  reason?: string;
  referenceDocument?: string;
  lot?: string;
  expirationDate?: string;
}

export interface ReverseStockMovementDto {
  reason: string;
}

export interface StockMovementListResponse {
  movements: StockMovement[];
  pagination: {
    currentPage: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
  };
}

export enum MovementType {
  Creation = 0,
  Entry = 1,
  Exit = 2,
  Adjustment = 3,
  Deletion = 4,
}

export const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  [MovementType.Creation]: 'Criação',
  [MovementType.Entry]: 'Entrada',
  [MovementType.Exit]: 'Saída',
  [MovementType.Adjustment]: 'Ajuste',
  [MovementType.Deletion]: 'Exclusão',
};
