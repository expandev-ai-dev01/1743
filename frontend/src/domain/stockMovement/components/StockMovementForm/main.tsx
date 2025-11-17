import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { StockMovementFormProps, StockMovementFormData } from './types';
import { MovementType } from '../../types';

const formSchema = z
  .object({
    idProduct: z.string().min(1, 'Produto é obrigatório'),
    movementType: z.string().min(1, 'Tipo de movimentação é obrigatório'),
    quantity: z
      .string()
      .min(1, 'Quantidade é obrigatória')
      .refine(
        (val) => !isNaN(Number(val)) && Number(val) > 0,
        'Quantidade deve ser maior que zero'
      ),
    reason: z.string().optional(),
    referenceDocument: z.string().max(50, 'Máximo de 50 caracteres').optional(),
    lot: z.string().max(50, 'Máximo de 50 caracteres').optional(),
    expirationDate: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.movementType === String(MovementType.Adjustment) && !data.reason) {
        return false;
      }
      return true;
    },
    {
      message: 'Motivo é obrigatório para ajustes',
      path: ['reason'],
    }
  );

export const StockMovementForm = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
}: StockMovementFormProps) => {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<StockMovementFormData>({
    resolver: zodResolver(formSchema),
  });

  const movementType = watch('movementType');
  const isAdjustment = movementType === String(MovementType.Adjustment);

  const onFormSubmit = (data: StockMovementFormData) => {
    const payload = {
      idProduct: Number(data.idProduct),
      movementType: Number(data.movementType),
      quantity: Number(data.quantity),
      reason: data.reason || undefined,
      referenceDocument: data.referenceDocument || undefined,
      lot: data.lot || undefined,
      expirationDate: data.expirationDate || undefined,
    };
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Produto *</label>
        <input
          type="number"
          {...register('idProduct')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSubmitting}
        />
        {errors.idProduct && (
          <p className="text-red-600 text-sm mt-1">{errors.idProduct.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tipo de Movimentação *
        </label>
        <select
          {...register('movementType')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSubmitting}
        >
          <option value="">Selecione...</option>
          <option value={MovementType.Creation}>Criação</option>
          <option value={MovementType.Entry}>Entrada</option>
          <option value={MovementType.Exit}>Saída</option>
          <option value={MovementType.Adjustment}>Ajuste</option>
          <option value={MovementType.Deletion}>Exclusão</option>
        </select>
        {errors.movementType && (
          <p className="text-red-600 text-sm mt-1">{errors.movementType.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade *</label>
        <input
          type="number"
          step="0.01"
          {...register('quantity')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSubmitting}
        />
        {errors.quantity && <p className="text-red-600 text-sm mt-1">{errors.quantity.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Motivo {isAdjustment && '*'}
        </label>
        <textarea
          {...register('reason')}
          rows={3}
          maxLength={255}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSubmitting}
        />
        {errors.reason && <p className="text-red-600 text-sm mt-1">{errors.reason.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Documento de Referência
        </label>
        <input
          type="text"
          {...register('referenceDocument')}
          maxLength={50}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSubmitting}
        />
        {errors.referenceDocument && (
          <p className="text-red-600 text-sm mt-1">{errors.referenceDocument.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Lote</label>
        <input
          type="text"
          {...register('lot')}
          maxLength={50}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSubmitting}
        />
        {errors.lot && <p className="text-red-600 text-sm mt-1">{errors.lot.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Data de Validade</label>
        <input
          type="date"
          {...register('expirationDate')}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSubmitting}
        />
        {errors.expirationDate && (
          <p className="text-red-600 text-sm mt-1">{errors.expirationDate.message}</p>
        )}
      </div>

      <div className="flex gap-3 justify-end pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  );
};
