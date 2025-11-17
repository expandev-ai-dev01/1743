/**
 * @summary
 * Retrieves current balance and stock status for a specific product.
 * Includes last movement information and stock status details.
 * 
 * @procedure spProductBalanceGet
 * @schema functional
 * @type stored-procedure
 * 
 * @endpoints
 * - GET /api/v1/internal/product/:idProduct/balance
 * 
 * @parameters
 * @param {INT} idAccount
 *   - Required: Yes
 *   - Description: Account identifier for multi-tenancy isolation
 * 
 * @param {INT} idProduct
 *   - Required: Yes
 *   - Description: Product identifier
 * 
 * @testScenarios
 * - Retrieve balance for existing product
 * - Attempt to retrieve balance for non-existent product (should fail)
 * - Retrieve balance for product with no movements (should return zero balance)
 */
CREATE OR ALTER PROCEDURE [functional].[spProductBalanceGet]
  @idAccount INTEGER,
  @idProduct INTEGER
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

  IF @idProduct IS NULL
  BEGIN
    ;THROW 51000, 'idProductRequired', 1;
  END;

  /**
   * @validation Validate product exists and belongs to account
   * @throw {productDoesntExist}
   */
  IF NOT EXISTS (
    SELECT *
    FROM [functional].[product] prd
    WHERE prd.[idProduct] = @idProduct
      AND prd.[idAccount] = @idAccount
      AND prd.[deleted] = 0
  )
  BEGIN
    ;THROW 51000, 'productDoesntExist', 1;
  END;

  /**
   * @output {ProductBalance, 1, n}
   * @column {INT} idProduct - Product identifier
   * @column {NVARCHAR} productName - Product name
   * @column {VARCHAR} productSku - Product SKU
   * @column {NUMERIC} currentBalance - Current stock balance
   * @column {NUMERIC} minimumLevel - Configured minimum level
   * @column {TINYINT} stockStatus - Stock status code
   * @column {NVARCHAR} stockStatusName - Stock status description
   * @column {DATETIME2} lastMovementDate - Last movement date
   * @column {TINYINT} lastMovementType - Last movement type code
   * @column {NVARCHAR} lastMovementTypeName - Last movement type description
   */
  SELECT
    prd.[idProduct],
    prd.[name] AS [productName],
    prd.[sku] AS [productSku],
    ISNULL(bal.[currentBalance], 0) AS [currentBalance],
    prd.[minimumLevel],
    ISNULL(bal.[stockStatus], 0) AS [stockStatus],
    CASE ISNULL(bal.[stockStatus], 0)
      WHEN 0 THEN 'Normal'
      WHEN 1 THEN 'Low'
      WHEN 2 THEN 'Critical'
      WHEN 3 THEN 'Zero'
    END AS [stockStatusName],
    bal.[lastMovementDate],
    bal.[lastMovementType],
    CASE bal.[lastMovementType]
      WHEN 0 THEN 'Creation'
      WHEN 1 THEN 'Entry'
      WHEN 2 THEN 'Exit'
      WHEN 3 THEN 'Adjustment'
      WHEN 4 THEN 'Deletion'
    END AS [lastMovementTypeName]
  FROM [functional].[product] prd
    LEFT JOIN [functional].[productBalance] bal ON (bal.[idAccount] = prd.[idAccount] AND bal.[idProduct] = prd.[idProduct])
  WHERE prd.[idProduct] = @idProduct
    AND prd.[idAccount] = @idAccount
    AND prd.[deleted] = 0;
END;
GO