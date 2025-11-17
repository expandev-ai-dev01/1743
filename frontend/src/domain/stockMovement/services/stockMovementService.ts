import { authenticatedClient } from '@/core/lib/api';
import type {
  StockMovement,
  StockMovementListParams,
  CreateStockMovementDto,
  ReverseStockMovementDto,
  StockMovementListResponse,
} from '../types';

export const stockMovementService = {
  async list(params: StockMovementListParams): Promise<StockMovementListResponse> {
    const response = await authenticatedClient.get('/stock-movement', { params });
    return response.data.data;
  },

  async getById(id: number): Promise<StockMovement> {
    const response = await authenticatedClient.get(`/stock-movement/${id}`);
    return response.data.data;
  },

  async create(data: CreateStockMovementDto): Promise<{ idStockMovement: number }> {
    const response = await authenticatedClient.post('/stock-movement', data);
    return response.data.data;
  },

  async reverse(
    id: number,
    data: ReverseStockMovementDto
  ): Promise<{ idReversalMovement: number }> {
    const response = await authenticatedClient.post(`/stock-movement/${id}/reverse`, data);
    return response.data.data;
  },
};
