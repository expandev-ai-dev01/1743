import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  CrudController,
  errorResponse,
  StatusGeneralError,
  successResponse,
} from '@/middleware/crud';
import {
  stockMovementCreate,
  stockMovementList,
  stockMovementGet,
  stockMovementReverse,
} from '@/services/stockMovement';
import { zFK, zNullableString, zNumeric, zNullableDateString } from '@/utils/zodValidation';

const securable = 'STOCK_MOVEMENT';

const createSchema = z.object({
  idProduct: zFK,
  movementType: z.coerce.number().int().min(0).max(4),
  quantity: zNumeric,
  reason: zNullableString(255),
  referenceDocument: zNullableString(50),
  lot: zNullableString(50),
  expirationDate: zNullableDateString,
});

const listSchema = z.object({
  idProduct: z.coerce.number().int().positive().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  movementType: z.coerce.number().int().min(0).max(4).optional(),
  idUser: z.coerce.number().int().positive().optional(),
  sortOrder: z.enum(['date_asc', 'date_desc', 'product_asc', 'product_desc']).optional(),
  pageSize: z.coerce.number().int().min(1).max(1000).optional(),
  pageNumber: z.coerce.number().int().min(1).optional(),
});

const getSchema = z.object({
  id: zFK,
});

const reverseSchema = z.object({
  id: zFK,
  reason: z.string().min(1).max(255),
});

/**
 * @api {post} /api/v1/internal/stock-movement Create Stock Movement
 * @apiName CreateStockMovement
 * @apiGroup StockMovement
 * @apiVersion 1.0.0
 *
 * @apiDescription Creates a new stock movement transaction
 *
 * @apiParam {Number} idProduct Product identifier
 * @apiParam {Number} movementType Movement type (0=Creation, 1=Entry, 2=Exit, 3=Adjustment, 4=Deletion)
 * @apiParam {Number} quantity Quantity to move
 * @apiParam {String} [reason] Reason for movement (mandatory for adjustments)
 * @apiParam {String} [referenceDocument] Reference document number
 * @apiParam {String} [lot] Lot identification
 * @apiParam {String} [expirationDate] Expiration date (ISO format)
 *
 * @apiSuccess {Number} idStockMovement Created movement identifier
 *
 * @apiError {String} ValidationError Invalid parameters
 * @apiError {String} UnauthorizedError User lacks permission
 * @apiError {String} ServerError Internal server error
 */
export async function postHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  const operation = new CrudController([{ securable, permission: 'CREATE' }]);

  const [validated, error] = await operation.create(req, createSchema);

  if (!validated) {
    return next(error);
  }

  try {
    const data = await stockMovementCreate({
      ...validated.credential,
      ...validated.params,
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

/**
 * @api {get} /api/v1/internal/stock-movement List Stock Movements
 * @apiName ListStockMovements
 * @apiGroup StockMovement
 * @apiVersion 1.0.0
 *
 * @apiDescription Retrieves paginated list of stock movements with filters
 *
 * @apiParam {Number} [idProduct] Filter by product
 * @apiParam {String} [startDate] Filter from date (YYYY-MM-DD)
 * @apiParam {String} [endDate] Filter to date (YYYY-MM-DD)
 * @apiParam {Number} [movementType] Filter by movement type
 * @apiParam {Number} [idUser] Filter by user
 * @apiParam {String} [sortOrder] Sort order (date_asc, date_desc, product_asc, product_desc)
 * @apiParam {Number} [pageSize] Records per page (default: 100, max: 1000)
 * @apiParam {Number} [pageNumber] Page number (default: 1)
 *
 * @apiSuccess {Array} movements List of movements
 * @apiSuccess {Object} pagination Pagination information
 *
 * @apiError {String} ValidationError Invalid parameters
 * @apiError {String} UnauthorizedError User lacks permission
 * @apiError {String} ServerError Internal server error
 */
export async function getHandler(req: Request, res: Response, next: NextFunction): Promise<void> {
  const operation = new CrudController([{ securable, permission: 'READ' }]);

  const [validated, error] = await operation.read(req, listSchema);

  if (!validated) {
    return next(error);
  }

  try {
    const data = await stockMovementList({
      ...validated.credential,
      ...validated.params,
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
