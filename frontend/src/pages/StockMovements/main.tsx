import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useStockMovementList,
  useStockMovementCreate,
  useStockMovementReverse,
} from '@/domain/stockMovement';
import { StockMovementList, StockMovementFilters, StockMovementForm } from '@/domain/stockMovement';
import type {
  StockMovementListParams,
  CreateStockMovementDto,
  StockMovement,
} from '@/domain/stockMovement';

export const StockMovementsPage = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<StockMovementListParams>({
    sortOrder: 'date_desc',
    pageSize: 100,
  });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [reversingMovement, setReversingMovement] = useState<StockMovement | null>(null);
  const [reverseReason, setReverseReason] = useState('');

  const { data, isLoading, refetch } = useStockMovementList({ filters });

  const { create, isCreating } = useStockMovementCreate({
    onSuccess: () => {
      setShowCreateForm(false);
      refetch();
      alert('Movimentação registrada com sucesso!');
    },
    onError: (error: Error) => {
      alert(`Erro ao registrar movimentação: ${error.message}`);
    },
  });

  const { reverse, isReversing } = useStockMovementReverse({
    onSuccess: () => {
      setReversingMovement(null);
      setReverseReason('');
      refetch();
      alert('Movimentação estornada com sucesso!');
    },
    onError: (error: Error) => {
      alert(`Erro ao estornar movimentação: ${error.message}`);
    },
  });

  const handleFilterChange = (newFilters: StockMovementListParams) => {
    setFilters(newFilters);
  };

  const handleCreateSubmit = async (data: CreateStockMovementDto) => {
    await create(data);
  };

  const handleReverseClick = (movement: StockMovement) => {
    setReversingMovement(movement);
  };

  const handleReverseConfirm = async () => {
    if (!reversingMovement || !reverseReason.trim()) {
      alert('Motivo do estorno é obrigatório');
      return;
    }
    await reverse(reversingMovement.idStockMovement, { reason: reverseReason });
  };

  const handleReverseCancel = () => {
    setReversingMovement(null);
    setReverseReason('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Movimentações de Estoque</h1>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Nova Movimentação
        </button>
      </div>

      <StockMovementFilters onFilterChange={handleFilterChange} initialFilters={filters} />

      {data?.pagination && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600">
            Exibindo {data.movements.length} de {data.pagination.totalRecords} registros (Página{' '}
            {data.pagination.currentPage} de {data.pagination.totalPages})
          </p>
        </div>
      )}

      <StockMovementList
        movements={data?.movements || []}
        onReverse={handleReverseClick}
        isLoading={isLoading}
      />

      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Nova Movimentação</h2>
            <StockMovementForm
              onSubmit={handleCreateSubmit}
              onCancel={() => setShowCreateForm(false)}
              isSubmitting={isCreating}
            />
          </div>
        </div>
      )}

      {reversingMovement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Estornar Movimentação</h2>
            <p className="text-gray-600 mb-4">
              Você está prestes a estornar a movimentação #{reversingMovement.idStockMovement}. Esta
              ação criará uma movimentação compensatória.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Motivo do Estorno *
              </label>
              <textarea
                value={reverseReason}
                onChange={(e) => setReverseReason(e.target.value)}
                rows={3}
                maxLength={255}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Informe o motivo do estorno..."
                disabled={isReversing}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={handleReverseCancel}
                disabled={isReversing}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleReverseConfirm}
                disabled={isReversing || !reverseReason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {isReversing ? 'Estornando...' : 'Confirmar Estorno'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockMovementsPage;
