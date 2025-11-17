/**
 * @interface StockMovementCreateRequest
 * @description Request parameters for creating a stock movement
 *
 * @property {number} idAccount - Account identifier
 * @property {number} idUser - User identifier
 * @property {number} idProduct - Product identifier
 * @property {number} movementType - Movement type (0=Creation, 1=Entry, 2=Exit, 3=Adjustment, 4=Deletion)
 * @property {number} quantity - Quantity to move
 * @property {string | null} [reason] - Movement reason
 * @property {string | null} [referenceDocument] - Reference document
 * @property {string | null} [lot] - Lot identification
 * @property {string | null} [expirationDate] - Expiration date
 */
export interface StockMovementCreateRequest {
  idAccount: number;
  idUser: number;
  idProduct: number;
  movementType: number;
  quantity: number;
  reason?: string | null;
  referenceDocument?: string | null;
  lot?: string | null;
  expirationDate?: string | null;
}

/**
 * @interface StockMovementCreateResponse
 * @description Response from creating a stock movement
 *
 * @property {number} idStockMovement - Created movement identifier
 */
export interface StockMovementCreateResponse {
  idStockMovement: number;
}

/**
 * @interface StockMovementListRequest
 * @description Request parameters for listing stock movements
 *
 * @property {number} idAccount - Account identifier
 * @property {number} [idProduct] - Filter by product
 * @property {string} [startDate] - Filter from date
 * @property {string} [endDate] - Filter to date
 * @property {number} [movementType] - Filter by movement type
 * @property {number} [idUser] - Filter by user
 * @property {string} [sortOrder] - Sort order
 * @property {number} [pageSize] - Records per page
 * @property {number} [pageNumber] - Page number
 */
export interface StockMovementListRequest {
  idAccount: number;
  idProduct?: number;
  startDate?: string;
  endDate?: string;
  movementType?: number;
  idUser?: number;
  sortOrder?: string;
  pageSize?: number;
  pageNumber?: number;
}

/**
 * @interface StockMovement
 * @description Stock movement entity
 *
 * @property {number} idStockMovement - Movement identifier
 * @property {number} idProduct - Product identifier
 * @property {string} productName - Product name
 * @property {string} productSku - Product SKU
 * @property {number} movementType - Movement type code
 * @property {string} movementTypeName - Movement type description
 * @property {number} quantity - Quantity moved
 * @property {string | null} reason - Movement reason
 * @property {string | null} referenceDocument - Reference document
 * @property {string | null} lot - Lot identification
 * @property {string | null} expirationDate - Expiration date
 * @property {boolean} isReversal - Indicates if movement is a reversal
 * @property {number | null} idOriginalMovement - Original movement if reversal
 * @property {number} idUser - User who created the movement
 * @property {string} dateCreated - Movement creation date
 * @property {number} runningBalance - Balance after this movement
 */
export interface StockMovement {
  idStockMovement: number;
  idProduct: number;
  productName: string;
  productSku: string;
  movementType: number;
  movementTypeName: string;
  quantity: number;
  reason: string | null;
  referenceDocument: string | null;
  lot: string | null;
  expirationDate: string | null;
  isReversal: boolean;
  idOriginalMovement: number | null;
  idUser: number;
  dateCreated: string;
  runningBalance: number;
}

/**
 * @interface Pagination
 * @description Pagination information
 *
 * @property {number} totalRecords - Total number of records
 * @property {number} pageSize - Records per page
 * @property {number} pageNumber - Current page number
 * @property {number} totalPages - Total number of pages
 */
export interface Pagination {
  totalRecords: number;
  pageSize: number;
  pageNumber: number;
  totalPages: number;
}

/**
 * @interface StockMovementListResponse
 * @description Response from listing stock movements
 *
 * @property {StockMovement[]} movements - List of movements
 * @property {Pagination} pagination - Pagination information
 */
export interface StockMovementListResponse {
  movements: StockMovement[];
  pagination: Pagination;
}

/**
 * @interface StockMovementGetRequest
 * @description Request parameters for getting a stock movement
 *
 * @property {number} idAccount - Account identifier
 * @property {number} idStockMovement - Movement identifier
 */
export interface StockMovementGetRequest {
  idAccount: number;
  idStockMovement: number;
}

/**
 * @interface StockMovementGetResponse
 * @description Response from getting a stock movement
 *
 * @property {number} idStockMovement - Movement identifier
 * @property {number} idProduct - Product identifier
 * @property {string} productName - Product name
 * @property {string} productSku - Product SKU
 * @property {number} movementType - Movement type code
 * @property {string} movementTypeName - Movement type description
 * @property {number} quantity - Quantity moved
 * @property {string | null} reason - Movement reason
 * @property {string | null} referenceDocument - Reference document
 * @property {string | null} lot - Lot identification
 * @property {string | null} expirationDate - Expiration date
 * @property {boolean} isReversal - Indicates if movement is a reversal
 * @property {number | null} idOriginalMovement - Original movement if reversal
 * @property {number} idUser - User who created the movement
 * @property {string} dateCreated - Movement creation date
 * @property {boolean} hasBeenReversed - Indicates if movement has been reversed
 */
export interface StockMovementGetResponse {
  idStockMovement: number;
  idProduct: number;
  productName: string;
  productSku: string;
  movementType: number;
  movementTypeName: string;
  quantity: number;
  reason: string | null;
  referenceDocument: string | null;
  lot: string | null;
  expirationDate: string | null;
  isReversal: boolean;
  idOriginalMovement: number | null;
  idUser: number;
  dateCreated: string;
  hasBeenReversed: boolean;
}

/**
 * @interface StockMovementReverseRequest
 * @description Request parameters for reversing a stock movement
 *
 * @property {number} idAccount - Account identifier
 * @property {number} idUser - User identifier
 * @property {number} idStockMovement - Movement to reverse
 * @property {string} reason - Reversal reason
 */
export interface StockMovementReverseRequest {
  idAccount: number;
  idUser: number;
  idStockMovement: number;
  reason: string;
}

/**
 * @interface StockMovementReverseResponse
 * @description Response from reversing a stock movement
 *
 * @property {number} idReversalMovement - Created reversal movement identifier
 */
export interface StockMovementReverseResponse {
  idReversalMovement: number;
}
