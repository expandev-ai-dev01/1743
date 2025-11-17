import { format } from 'date-fns';
import { MOVEMENT_TYPE_LABELS } from '../../types';
import type { StockMovementListProps } from './types';

export const StockMovementList = ({
  movements,
  onReverse,
  isLoading = false,
}: StockMovementListProps) => {
  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Carregando movimentações...</p>
      </div>
    );
  }

  if (!movements || movements.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-600">Nenhuma movimentação encontrada</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Data/Hora
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tipo
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Produto
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quantidade
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Usuário
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Motivo
            </th>
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {movements.map((movement) => (
            <tr key={movement.idStockMovement} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-sm text-gray-900">
                {format(new Date(movement.dateTime), 'dd/MM/yyyy HH:mm')}
              </td>
              <td className="px-4 py-3 text-sm">
                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                  {MOVEMENT_TYPE_LABELS[movement.movementType]}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {movement.productName || `Produto #${movement.idProduct}`}
              </td>
              <td className="px-4 py-3 text-sm text-right text-gray-900">
                {movement.quantity.toFixed(2)}
              </td>
              <td className="px-4 py-3 text-sm text-gray-900">
                {movement.userName || `Usuário #${movement.idUser}`}
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">{movement.reason || '-'}</td>
              <td className="px-4 py-3 text-sm text-center">
                {!movement.isReversed && onReverse && (
                  <button
                    onClick={() => onReverse(movement)}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Estornar
                  </button>
                )}
                {movement.isReversed && <span className="text-gray-400 text-xs">Estornado</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
