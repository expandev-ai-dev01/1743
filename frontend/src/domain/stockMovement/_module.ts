export * from './types';
export * from './services/stockMovementService';
export * from './hooks/useStockMovementList';
export * from './hooks/useStockMovementCreate';
export * from './hooks/useStockMovementReverse';
export * from './components/StockMovementForm';
export * from './components/StockMovementList';
export * from './components/StockMovementFilters';

export const moduleMetadata = {
  name: 'stockMovement',
  domain: 'functional',
  version: '1.0.0',
  publicComponents: ['StockMovementForm', 'StockMovementList', 'StockMovementFilters'],
  publicHooks: ['useStockMovementList', 'useStockMovementCreate', 'useStockMovementReverse'],
  publicServices: ['stockMovementService'],
  dependencies: {
    internal: ['@/core/lib/api', '@/core/components'],
    external: ['react', 'react-hook-form', 'zod', '@tanstack/react-query', 'axios', 'date-fns'],
    domains: [],
  },
  exports: {
    components: ['StockMovementForm', 'StockMovementList', 'StockMovementFilters'],
    hooks: ['useStockMovementList', 'useStockMovementCreate', 'useStockMovementReverse'],
    services: ['stockMovementService'],
    types: [
      'StockMovement',
      'StockMovementListParams',
      'CreateStockMovementDto',
      'ReverseStockMovementDto',
      'MovementType',
    ],
  },
} as const;
