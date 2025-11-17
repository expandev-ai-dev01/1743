/**
 * @summary
 * Retrieves detailed information about a specific stock movement.
 * Includes product details, user information, and reversal status.
 * 
 * @procedure spStockMovementGet
 * @schema functional
 * @type stored-procedure
 * 
 * @endpoints
 * - GET /api/v1/internal/stock-movement/:id
 * 
 * @parameters
 * @param {INT} idAccount
 *   - Required: Yes
 *   - Description: Account identifier for multi-tenancy isolation
 * 
 * @param {INT} idStockMovement
 *   - Required: Yes
 *   - Description: Movement identifier to retrieve
 * 
 * @testScenarios
 * - Retrieve existing movement with valid parameters
 * - Attempt to retrieve non-existent movement (should fail)
 * - Attempt to retrieve movement from different account (should fail)
 */
CREATE OR ALTER PROCEDURE [functional].[spStockMovementGet]
  @idAccount INTEGER,
  @idStockMovement INTEGER
AS
BEGIN
  SET NOCOUNT ON;

  /**
   * @validation Validate required parameters
   * @throw {parameterRequired}
   */
  IF @idAccount IS NULL
  BEGIN
    ;THROW 51000, 'idAccountRequired', 1;
  END;

  IF @idStockMovement IS NULL
  BEGIN
    ;THROW 51000, 'idStockMovementRequired', 1;
  END;

  /**
   * @validation Validate movement exists and belongs to account
   * @throw {movementDoesntExist}
   */
  IF NOT EXISTS (
    SELECT *
    FROM [functional].[stockMovement] stk
    WHERE stk.[idStockMovement] = @idStockMovement
      AND stk.[idAccount] = @idAccount
  )
  BEGIN
    ;THROW 51000, 'movementDoesntExist', 1;
  END;

  /**
   * @output {MovementDetail, 1, n}
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
   * @column {BIT} hasBeenReversed - Indicates if this movement has been reversed
   */
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
    CASE
      WHEN EXISTS (
        SELECT *
        FROM [functional].[stockMovement] rev
        WHERE rev.[idOriginalMovement] = stk.[idStockMovement]
          AND rev.[isReversal] = 1
      ) THEN 1
      ELSE 0
    END AS [hasBeenReversed]
  FROM [functional].[stockMovement] stk
    JOIN [functional].[product] prd ON (prd.[idAccount] = stk.[idAccount] AND prd.[idProduct] = stk.[idProduct])
  WHERE stk.[idStockMovement] = @idStockMovement
    AND stk.[idAccount] = @idAccount;
END;
GO