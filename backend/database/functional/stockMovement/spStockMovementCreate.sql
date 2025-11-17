/**
 * @summary
 * Creates a new stock movement transaction and updates the product balance.
 * Validates product existence, lot/expiration requirements, and sufficient stock for exits.
 * Automatically calculates new balance and stock status after the movement.
 * 
 * @procedure spStockMovementCreate
 * @schema functional
 * @type stored-procedure
 * 
 * @endpoints
 * - POST /api/v1/internal/stock-movement
 * 
 * @parameters
 * @param {INT} idAccount
 *   - Required: Yes
 *   - Description: Account identifier for multi-tenancy isolation
 * 
 * @param {INT} idUser
 *   - Required: Yes
 *   - Description: User identifier for audit trail
 * 
 * @param {INT} idProduct
 *   - Required: Yes
 *   - Description: Product identifier for the movement
 * 
 * @param {TINYINT} movementType
 *   - Required: Yes
 *   - Description: Type of movement (0=Creation, 1=Entry, 2=Exit, 3=Adjustment, 4=Deletion)
 * 
 * @param {NUMERIC(15,2)} quantity
 *   - Required: Yes
 *   - Description: Quantity to be moved (positive for entries, negative for exits)
 * 
 * @param {NVARCHAR(255)} reason
 *   - Required: No
 *   - Description: Reason or justification for the movement (mandatory for adjustments)
 * 
 * @param {VARCHAR(50)} referenceDocument
 *   - Required: No
 *   - Description: Reference document number (invoice, order, etc.)
 * 
 * @param {VARCHAR(50)} lot
 *   - Required: No
 *   - Description: Lot identification (mandatory for products with lot control)
 * 
 * @param {DATE} expirationDate
 *   - Required: No
 *   - Description: Expiration date (mandatory for products with expiration control on entries)
 * 
 * @returns {INT} idStockMovement - Created movement identifier
 * 
 * @testScenarios
 * - Valid entry movement with all required parameters
 * - Valid exit movement with sufficient stock
 * - Adjustment movement with mandatory reason
 * - Exit movement with insufficient stock (should fail)
 * - Product with lot control without lot specified (should fail)
 * - Product with expiration control without expiration date on entry (should fail)
 * - Invalid product reference (should fail)
 */
CREATE OR ALTER PROCEDURE [functional].[spStockMovementCreate]
  @idAccount INTEGER,
  @idUser INTEGER,
  @idProduct INTEGER,
  @movementType TINYINT,
  @quantity NUMERIC(15, 2),
  @reason NVARCHAR(255) = NULL,
  @referenceDocument VARCHAR(50) = NULL,
  @lot VARCHAR(50) = NULL,
  @expirationDate DATE = NULL
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @idStockMovement INTEGER;
  DECLARE @currentBalance NUMERIC(15, 2);
  DECLARE @newBalance NUMERIC(15, 2);
  DECLARE @hasLotControl BIT;
  DECLARE @hasExpirationControl BIT;
  DECLARE @minimumLevel NUMERIC(15, 2);
  DECLARE @stockStatus TINYINT;
  DECLARE @idProductBalance INTEGER;

  /**
   * @validation Validate required parameters
   * @throw {parameterRequired}
   */
  IF @idAccount IS NULL
  BEGIN
    ;THROW 51000, 'idAccountRequired', 1;
  END;

  IF @idUser IS NULL
  BEGIN
    ;THROW 51000, 'idUserRequired', 1;
  END;

  IF @idProduct IS NULL
  BEGIN
    ;THROW 51000, 'idProductRequired', 1;
  END;

  IF @movementType IS NULL
  BEGIN
    ;THROW 51000, 'movementTypeRequired', 1;
  END;

  IF @quantity IS NULL
  BEGIN
    ;THROW 51000, 'quantityRequired', 1;
  END;

  /**
   * @validation Validate movement type range
   * @throw {invalidMovementType}
   */
  IF (@movementType < 0) OR (@movementType > 4)
  BEGIN
    ;THROW 51000, 'invalidMovementType', 1;
  END;

  /**
   * @validation Validate quantity is valid number
   * @throw {invalidQuantity}
   */
  IF @quantity = 0
  BEGIN
    ;THROW 51000, 'quantityCannotBeZero', 1;
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
   * @rule {db-product-controls} Retrieve product control settings
   */
  SELECT
    @hasLotControl = prd.[hasLotControl],
    @hasExpirationControl = prd.[hasExpirationControl],
    @minimumLevel = prd.[minimumLevel]
  FROM [functional].[product] prd
  WHERE prd.[idProduct] = @idProduct
    AND prd.[idAccount] = @idAccount;

  /**
   * @validation Validate reason is mandatory for adjustments
   * @throw {reasonRequiredForAdjustment}
   */
  IF (@movementType = 3) AND ((@reason IS NULL) OR (LTRIM(RTRIM(@reason)) = ''))
  BEGIN
    ;THROW 51000, 'reasonRequiredForAdjustment', 1;
  END;

  /**
   * @validation Validate lot is mandatory for products with lot control
   * @throw {lotRequired}
   */
  IF (@hasLotControl = 1) AND ((@lot IS NULL) OR (LTRIM(RTRIM(@lot)) = ''))
  BEGIN
    ;THROW 51000, 'lotRequired', 1;
  END;

  /**
   * @validation Validate expiration date is mandatory for products with expiration control on entries
   * @throw {expirationDateRequired}
   */
  IF (@hasExpirationControl = 1) AND (@movementType IN (0, 1)) AND (@expirationDate IS NULL)
  BEGIN
    ;THROW 51000, 'expirationDateRequired', 1;
  END;

  /**
   * @validation Validate expiration date is in the future
   * @throw {expirationDateMustBeFuture}
   */
  IF (@expirationDate IS NOT NULL) AND (@expirationDate <= CAST(GETUTCDATE() AS DATE))
  BEGIN
    ;THROW 51000, 'expirationDateMustBeFuture', 1;
  END;

  /**
   * @rule {db-balance-calculation} Get current balance
   */
  SELECT
    @currentBalance = bal.[currentBalance],
    @idProductBalance = bal.[idProductBalance]
  FROM [functional].[productBalance] bal
  WHERE bal.[idProduct] = @idProduct
    AND bal.[idAccount] = @idAccount;

  IF @currentBalance IS NULL
  BEGIN
    SET @currentBalance = 0;
  END;

  /**
   * @validation Validate sufficient stock for exits
   * @throw {insufficientStock}
   */
  IF (@movementType = 2) AND (ABS(@quantity) > @currentBalance)
  BEGIN
    ;THROW 51000, 'insufficientStock', 1;
  END;

  BEGIN TRY
    /**
     * @rule {db-transaction-control} Begin transaction for atomic operation
     */
    BEGIN TRAN;

      /**
       * @rule {db-movement-creation} Insert stock movement record
       */
      INSERT INTO [functional].[stockMovement] (
        [idAccount],
        [idProduct],
        [idUser],
        [movementType],
        [quantity],
        [reason],
        [referenceDocument],
        [lot],
        [expirationDate],
        [isReversal],
        [dateCreated]
      )
      VALUES (
        @idAccount,
        @idProduct,
        @idUser,
        @movementType,
        @quantity,
        @reason,
        @referenceDocument,
        @lot,
        @expirationDate,
        0,
        GETUTCDATE()
      );

      SET @idStockMovement = SCOPE_IDENTITY();

      /**
       * @rule {db-balance-calculation} Calculate new balance
       */
      SET @newBalance = @currentBalance + @quantity;

      /**
       * @rule {db-stock-status-calculation} Calculate stock status
       */
      IF @newBalance = 0
      BEGIN
        SET @stockStatus = 3;
      END
      ELSE IF @newBalance < (@minimumLevel * 0.3)
      BEGIN
        SET @stockStatus = 2;
      END
      ELSE IF @newBalance < @minimumLevel
      BEGIN
        SET @stockStatus = 1;
      END
      ELSE
      BEGIN
        SET @stockStatus = 0;
      END;

      /**
       * @rule {db-balance-update} Update or create product balance
       */
      IF @idProductBalance IS NULL
      BEGIN
        INSERT INTO [functional].[productBalance] (
          [idAccount],
          [idProduct],
          [currentBalance],
          [stockStatus],
          [lastMovementDate],
          [lastMovementType],
          [dateModified]
        )
        VALUES (
          @idAccount,
          @idProduct,
          @newBalance,
          @stockStatus,
          GETUTCDATE(),
          @movementType,
          GETUTCDATE()
        );
      END
      ELSE
      BEGIN
        UPDATE [functional].[productBalance]
        SET
          [currentBalance] = @newBalance,
          [stockStatus] = @stockStatus,
          [lastMovementDate] = GETUTCDATE(),
          [lastMovementType] = @movementType,
          [dateModified] = GETUTCDATE()
        WHERE [idProductBalance] = @idProductBalance;
      END;

    COMMIT TRAN;

    /**
     * @output {CreatedMovement, 1, 1}
     * @column {INT} idStockMovement
     * - Description: Created movement identifier
     */
    SELECT @idStockMovement AS [idStockMovement];

  END TRY
  BEGIN CATCH
    ROLLBACK TRAN;
    THROW;
  END CATCH;
END;
GO