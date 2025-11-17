import { useState } from 'react';
import { MovementType } from '../../types';
import type { StockMovementFiltersProps } from './types';
import type { StockMovementListParams } from '../../types';

export const StockMovementFilters = ({
  onFilterChange,
  initialFilters = {},
}: StockMovementFiltersProps) => {
  const [filters, setFilters] = useState<StockMovementListParams>(initialFilters);

  const handleChange = (field: keyof StockMovementListParams, value: any) => {
    const newFilters = { ...filters, [field]: value || undefined };
    setFilters(newFilters);
  };

  const handleApply = () => {
    onFilterChange(filters);
  };

  const handleClear = () => {
    const clearedFilters = {};
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Filtros</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Produto (ID)</label>
          <input
            type="number"
            value={filters.idProduct || ''}
            onChange={(e) =>
              handleChange('idProduct', e.target.value ? Number(e.target.value) : undefined)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ID do produto"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data Inicial</label>
          <input
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => handleChange('startDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Data Final</label>
          <input
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => handleChange('endDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Movimentação
          </label>
          <select
            value={filters.movementType !== undefined ? filters.movementType : ''}
            onChange={(e) =>
              handleChange('movementType', e.target.value ? Number(e.target.value) : undefined)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todos</option>
            <option value={MovementType.Creation}>Criação</option>
            <option value={MovementType.Entry}>Entrada</option>
            <option value={MovementType.Exit}>Saída</option>
            <option value={MovementType.Adjustment}>Ajuste</option>
            <option value={MovementType.Deletion}>Exclusão</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Usuário (ID)</label>
          <input
            type="number"
            value={filters.idUser || ''}
            onChange={(e) =>
              handleChange('idUser', e.target.value ? Number(e.target.value) : undefined)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ID do usuário"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Ordenação</label>
          <select
            value={filters.sortOrder || 'date_desc'}
            onChange={(e) => handleChange('sortOrder', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date_desc">Data (mais recente)</option>
            <option value="date_asc">Data (mais antiga)</option>
            <option value="product_asc">Produto (A-Z)</option>
            <option value="product_desc">Produto (Z-A)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Registros por página
          </label>
          <input
            type="number"
            min="1"
            max="1000"
            value={filters.pageSize || 100}
            onChange={(e) =>
              handleChange('pageSize', e.target.value ? Number(e.target.value) : undefined)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <button
          onClick={handleClear}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Limpar
        </button>
        <button
          onClick={handleApply}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Aplicar Filtros
        </button>
      </div>
    </div>
  );
};
