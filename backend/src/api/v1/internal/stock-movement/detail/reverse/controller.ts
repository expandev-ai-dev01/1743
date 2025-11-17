import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  CrudController,
  errorResponse,
  StatusGeneralError,
  successResponse,
} from '@/middleware/crud';
import { stockMovementReverse } from '@/services/stockMovement';
import { zFK } from '@/utils/zodValidation';

const securable = 'STOCK_MOVEMENT';

const reverseSchema = z.object({
  id: zFK,
  reason: z.string().min(1).max(255),
});

/**
 * @api {post} /api/v1/internal/stock-movement/:id/reverse Reverse Stock Movement
 * @apiName ReverseStockMovement
 * @apiGroup StockMovement
 * @apiVersion 1.0.0
 *
 * @apiDescription Reverses a stock movement by creating a compensating transaction
 *
 * @apiParam {Number} id Movement identifier to reverse
 * @apiParam {String} reason Reason for reversal (required)
 *
 * @apiSuccess {Number} idReversalMovement Created reversal movement identifier
 *
 * @apiError {String} ValidationError Invalid parameters
 * @apiError {String} UnauthorizedError User lacks permission
 * @apiError {String} BusinessRuleError Movement cannot be reversed
 * @apiError {String} ServerError Internal server error
 */
export async function postHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  const operation = new CrudController([{ securable, permission: 'UPDATE' }]);

  const [validated, error] = await operation.update(req, reverseSchema);

  if (!validated) {
    return next(error);
  }

  try {
    const data = await stockMovementReverse({
      ...validated.credential,
      idStockMovement: validated.params.id,
      reason: validated.params.reason,
    });

    res.json(successResponse(data));
  } catch (error: any) {
    if (error.number === 51000) {
      res.status(400).json(errorResponse(error.message));
    } else {
      next(StatusGeneralError);
    }
  }
}
