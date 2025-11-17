import { dbRequest, ExpectedReturn } from '@/utils/database';
import {
  StockMovementCreateRequest,
  StockMovementListRequest,
  StockMovementGetRequest,
  StockMovementReverseRequest,
  StockMovementCreateResponse,
  StockMovementListResponse,
  StockMovementGetResponse,
  StockMovementReverseResponse,
} from './stockMovementTypes';

/**
 * @summary
 * Creates a new stock movement transaction
 *
 * @function stockMovementCreate
 * @module stockMovement
 *
 * @param {StockMovementCreateRequest} params - Movement creation parameters
 * @param {number} params.idAccount - Account identifier
 * @param {number} params.idUser - User identifier
 * @param {number} params.idProduct - Product identifier
 * @param {number} params.movementType - Movement type (0-4)
 * @param {number} params.quantity - Quantity to move
 * @param {string | null} params.reason - Movement reason
 * @param {string | null} params.referenceDocument - Reference document
 * @param {string | null} params.lot - Lot identification
 * @param {string | null} params.expirationDate - Expiration date
 *
 * @returns {Promise<StockMovementCreateResponse>} Created movement identifier
 *
 * @throws {ValidationError} When parameters fail validation
 * @throws {BusinessRuleError} When business rules are violated
 * @throws {DatabaseError} When database operation fails
 */
export async function stockMovementCreate(
  params: StockMovementCreateRequest
): Promise<StockMovementCreateResponse> {
  const result = await dbRequest(
    '[functional].[spStockMovementCreate]',
    params,
    ExpectedReturn.Single
  );

  return result;
}

/**
 * @summary
 * Retrieves paginated list of stock movements with filters
 *
 * @function stockMovementList
 * @module stockMovement
 *
 * @param {StockMovementListRequest} params - List query parameters
 * @param {number} params.idAccount - Account identifier
 * @param {number} [params.idProduct] - Filter by product
 * @param {string} [params.startDate] - Filter from date
 * @param {string} [params.endDate] - Filter to date
 * @param {number} [params.movementType] - Filter by type
 * @param {number} [params.idUser] - Filter by user
 * @param {string} [params.sortOrder] - Sort order
 * @param {number} [params.pageSize] - Records per page
 * @param {number} [params.pageNumber] - Page number
 *
 * @returns {Promise<StockMovementListResponse>} Movements list and pagination
 *
 * @throws {ValidationError} When parameters fail validation
 * @throws {DatabaseError} When database operation fails
 */
export async function stockMovementList(
  params: StockMovementListRequest
): Promise<StockMovementListResponse> {
  const results = (await dbRequest(
    '[functional].[spStockMovementList]',
    params,
    ExpectedReturn.Multi
  )) as any[];

  return {
    movements: results[0],
    pagination: results[1][0],
  };
}

/**
 * @summary
 * Retrieves detailed information about a specific stock movement
 *
 * @function stockMovementGet
 * @module stockMovement
 *
 * @param {StockMovementGetRequest} params - Get query parameters
 * @param {number} params.idAccount - Account identifier
 * @param {number} params.idStockMovement - Movement identifier
 *
 * @returns {Promise<StockMovementGetResponse>} Movement details
 *
 * @throws {ValidationError} When parameters fail validation
 * @throws {NotFoundError} When movement doesn't exist
 * @throws {DatabaseError} When database operation fails
 */
export async function stockMovementGet(
  params: StockMovementGetRequest
): Promise<StockMovementGetResponse> {
  const result = await dbRequest(
    '[functional].[spStockMovementGet]',
    params,
    ExpectedReturn.Single
  );

  return result;
}

/**
 * @summary
 * Reverses a stock movement by creating a compensating transaction
 *
 * @function stockMovementReverse
 * @module stockMovement
 *
 * @param {StockMovementReverseRequest} params - Reversal parameters
 * @param {number} params.idAccount - Account identifier
 * @param {number} params.idUser - User identifier
 * @param {number} params.idStockMovement - Movement to reverse
 * @param {string} params.reason - Reversal reason
 *
 * @returns {Promise<StockMovementReverseResponse>} Reversal movement identifier
 *
 * @throws {ValidationError} When parameters fail validation
 * @throws {BusinessRuleError} When reversal is not allowed
 * @throws {DatabaseError} When database operation fails
 */
export async function stockMovementReverse(
  params: StockMovementReverseRequest
): Promise<StockMovementReverseResponse> {
  const result = await dbRequest(
    '[functional].[spStockMovementReverse]',
    params,
    ExpectedReturn.Single
  );

  return result;
}
