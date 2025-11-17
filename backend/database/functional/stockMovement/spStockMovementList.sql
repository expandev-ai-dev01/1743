/**
 * @summary
 * Retrieves a paginated list of stock movements with optional filters.
 * Supports filtering by product, date range, movement type, and user.
 * Returns movements with calculated running balance for each record.
 * 
 * @procedure spStockMovementList
 * @schema functional
 * @type stored-procedure
 * 
 * @endpoints
 * - GET /api/v1/internal/stock-movement
 * 
 * @parameters
 * @param {INT} idAccount
 *   - Required: Yes
 *   - Description: Account identifier for multi-tenancy isolation
 * 
 * @param {INT} idProduct
 *   - Required: No
 *   - Description: Filter by specific product
 * 
 * @param {DATE} startDate
 *   - Required: No
 *   - Description: Filter movements from this date (inclusive)
 * 
 * @param {DATE} endDate
 *   - Required: No
 *   - Description: Filter movements until this date (inclusive)
 * 
 * @param {TINYINT} movementType
 *   - Required: No
 *   - Description: Filter by movement type
 * 
 * @param {INT} idUser
 *   - Required: No
 *   - Description: Filter by user who created the movement
 * 
 * @param {VARCHAR(10)} sortOrder
 *   - Required: No
 *   - Description: Sort order (date_asc, date_desc, product_asc, product_desc)
 * 
 * @param {INT} pageSize
 *   - Required: No
 *   - Description: Number of records per page (default: 100, max: 1000)
 * 
 * @param {INT} pageNumber
 *   - Required: No
 *   - Description: Page number (default: 1)
 * 
 * @testScenarios
 * - List all movements without filters
 * - Filter movements by specific product
 * - Filter movements by date range
 * - Filter movements by type
 * - Filter movements by user
 * - Combine multiple filters
 * - Test pagination with different page sizes
 * - Test different sort orders
 */
CREATE OR ALTER PROCEDURE [functional].[spStockMovementList]
  @idAccount INTEGER,
  @idProduct INTEGER = NULL,
  @startDate DATE = NULL,
  @endDate DATE = NULL,
  @movementType TINYINT = NULL,
  @idUser INTEGER = NULL,
  @sortOrder VARCHAR(10) = 'date_desc',
  @pageSize INTEGER = 100,
  @pageNumber INTEGER = 1
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @offset INTEGER;
  DECLARE @totalRecords INTEGER;

  /**
   * @validation Validate required parameters
   * @throw {parameterRequired}
   */
  IF @idAccount IS NULL
  BEGIN
    ;THROW 51000, 'idAccountRequired', 1;
  END;

  /**
   * @validation Validate page size limits
   * @throw {invalidPageSize}
   */
  IF (@pageSize < 1) OR (@pageSize > 1000)
  BEGIN
    ;THROW 51000, 'pageSizeMustBeBetween1And1000', 1;
  END;

  /**
   * @validation Validate page number
   * @throw {invalidPageNumber}
   */
  IF @pageNumber < 1
  BEGIN
    ;THROW 51000, 'pageNumberMustBeGreaterThanZero', 1;
  END;

  /**
   * @validation Validate date range
   * @throw {invalidDateRange}
   */
  IF (@startDate IS NOT NULL) AND (@endDate IS NOT NULL) AND (@startDate > @endDate)
  BEGIN
    ;THROW 51000, 'startDateMustBeBeforeEndDate', 1;
  END;

  /**
   * @validation Validate product exists if filter is provided
   * @throw {productDoesntExist}
   */
  IF (@idProduct IS NOT NULL) AND NOT EXISTS (
    SELECT *
    FROM [functional].[product] prd
    WHERE prd.[idProduct] = @idProduct
      AND prd.[idAccount] = @idAccount
  )
  BEGIN
    ;THROW 51000, 'productDoesntExist', 1;
  END;

  /**
   * @validation Validate sort order
   * @throw {invalidSortOrder}
   */
  IF @sortOrder NOT IN ('date_asc', 'date_desc', 'product_asc', 'product_desc')
  BEGIN
    SET @sortOrder = 'date_desc';
  END;

  /**
   * @rule {db-pagination-calculation} Calculate pagination offset
   */
  SET @offset = (@pageNumber - 1) * @pageSize;

  /**
   * @rule {db-total-count} Get total count of filtered records
   */
  SELECT @totalRecords = COUNT(*)
  FROM [functional].[stockMovement] stk
  WHERE stk.[idAccount] = @idAccount
    AND ((@idProduct IS NULL) OR (stk.[idProduct] = @idProduct))
    AND ((@startDate IS NULL) OR (CAST(stk.[dateCreated] AS DATE) >= @startDate))
    AND ((@endDate IS NULL) OR (CAST(stk.[dateCreated] AS DATE) <= @endDate))
    AND ((@movementType IS NULL) OR (stk.[movementType] = @movementType))
    AND ((@idUser IS NULL) OR (stk.[idUser] = @idUser));

  /**
   * @output {MovementList, n, n}
   * @column {INT} idStockMovement - Movement identifier
   * @column {INT} idProduct - Product identifier
   * @column {NVARCHAR} productName - Product name
   * @column {VARCHAR} productSku - Product SKU
   * @column {TINYINT} movementType - Movement type code
   * @column {NVARCHAR} movementTypeName - Movement type description
   * @column {NUMERIC} quantity - Quantity moved
   * @column {NVARCHAR} reason - Movement reason
   * @column {VARCHAR} referenceDocument - Reference document
   * @column {VARCHAR} lot - Lot identification
   * @column {DATE} expirationDate - Expiration date
   * @column {BIT} isReversal - Indicates if movement is a reversal
   * @column {INT} idOriginalMovement - Original movement if reversal
   * @column {INT} idUser - User who created the movement
   * @column {DATETIME2} dateCreated - Movement creation date
   * @column {NUMERIC} runningBalance - Calculated balance after this movement
   */
  WITH [MovementData] AS (
    SELECT
      stk.[idStockMovement],
      stk.[idProduct],
      prd.[name] AS [productName],
      prd.[sku] AS [productSku],
      stk.[movementType],
      CASE stk.[movementType]
        WHEN 0 THEN 'Creation'
        WHEN 1 THEN 'Entry'
        WHEN 2 THEN 'Exit'
        WHEN 3 THEN 'Adjustment'
        WHEN 4 THEN 'Deletion'
      END AS [movementTypeName],
      stk.[quantity],
      stk.[reason],
      stk.[referenceDocument],
      stk.[lot],
      stk.[expirationDate],
      stk.[isReversal],
      stk.[idOriginalMovement],
      stk.[idUser],
      stk.[dateCreated],
      SUM(stk.[quantity]) OVER (
        PARTITION BY stk.[idProduct]
        ORDER BY stk.[dateCreated], stk.[idStockMovement]
        ROWS UNBOUNDED PRECEDING
      ) AS [runningBalance]
    FROM [functional].[stockMovement] stk
      JOIN [functional].[product] prd ON (prd.[idAccount] = stk.[idAccount] AND prd.[idProduct] = stk.[idProduct])
    WHERE stk.[idAccount] = @idAccount
      AND ((@idProduct IS NULL) OR (stk.[idProduct] = @idProduct))
      AND ((@startDate IS NULL) OR (CAST(stk.[dateCreated] AS DATE) >= @startDate))
      AND ((@endDate IS NULL) OR (CAST(stk.[dateCreated] AS DATE) <= @endDate))
      AND ((@movementType IS NULL) OR (stk.[movementType] = @movementType))
      AND ((@idUser IS NULL) OR (stk.[idUser] = @idUser))
  )
  SELECT
    mvt.[idStockMovement],
    mvt.[idProduct],
    mvt.[productName],
    mvt.[productSku],
    mvt.[movementType],
    mvt.[movementTypeName],
    mvt.[quantity],
    mvt.[reason],
    mvt.[referenceDocument],
    mvt.[lot],
    mvt.[expirationDate],
    mvt.[isReversal],
    mvt.[idOriginalMovement],
    mvt.[idUser],
    mvt.[dateCreated],
    mvt.[runningBalance]
  FROM [MovementData] mvt
  ORDER BY
    CASE WHEN @sortOrder = 'date_desc' THEN mvt.[dateCreated] END DESC,
    CASE WHEN @sortOrder = 'date_asc' THEN mvt.[dateCreated] END ASC,
    CASE WHEN @sortOrder = 'product_desc' THEN mvt.[productName] END DESC,
    CASE WHEN @sortOrder = 'product_asc' THEN mvt.[productName] END ASC,
    mvt.[idStockMovement]
  OFFSET @offset ROWS
  FETCH NEXT @pageSize ROWS ONLY;

  /**
   * @output {Pagination, 1, n}
   * @column {INT} totalRecords - Total number of records matching filters
   * @column {INT} pageSize - Records per page
   * @column {INT} pageNumber - Current page number
   * @column {INT} totalPages - Total number of pages
   */
  SELECT
    @totalRecords AS [totalRecords],
    @pageSize AS [pageSize],
    @pageNumber AS [pageNumber],
    CEILING(CAST(@totalRecords AS FLOAT) / @pageSize) AS [totalPages];
END;
GO