/**
 * @summary
 * Reverses a stock movement by creating a compensating movement with inverted quantity.
 * Validates that the movement can be reversed (not already reversed, within 30 days).
 * Updates product balance accordingly.
 * 
 * @procedure spStockMovementReverse
 * @schema functional
 * @type stored-procedure
 * 
 * @endpoints
 * - POST /api/v1/internal/stock-movement/:id/reverse
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
 * @param {INT} idStockMovement
 *   - Required: Yes
 *   - Description: Movement identifier to reverse
 * 
 * @param {NVARCHAR(255)} reason
 *   - Required: Yes
 *   - Description: Reason for the reversal
 * 
 * @returns {INT} idReversalMovement - Created reversal movement identifier
 * 
 * @testScenarios
 * - Valid reversal with all required parameters
 * - Attempt to reverse already reversed movement (should fail)
 * - Attempt to reverse movement older than 30 days (should fail)
 * - Attempt to reverse non-existent movement (should fail)
 * - Reversal without reason (should fail)
 */
CREATE OR ALTER PROCEDURE [functional].[spStockMovementReverse]
  @idAccount INTEGER,
  @idUser INTEGER,
  @idStockMovement INTEGER,
  @reason NVARCHAR(255)
AS
BEGIN
  SET NOCOUNT ON;

  DECLARE @idReversalMovement INTEGER;
  DECLARE @idProduct INTEGER;
  DECLARE @originalQuantity NUMERIC(15, 2);
  DECLARE @reversalQuantity NUMERIC(15, 2);
  DECLARE @movementDate DATETIME2;
  DECLARE @daysSinceMovement INTEGER;
  DECLARE @currentBalance NUMERIC(15, 2);
  DECLARE @newBalance NUMERIC(15, 2);
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

  IF @idStockMovement IS NULL
  BEGIN
    ;THROW 51000, 'idStockMovementRequired', 1;
  END;

  IF (@reason IS NULL) OR (LTRIM(RTRIM(@reason)) = '')
  BEGIN
    ;THROW 51000, 'reasonRequired', 1;
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
   * @validation Validate movement has not been reversed already
   * @throw {movementAlreadyReversed}
   */
  IF EXISTS (
    SELECT *
    FROM [functional].[stockMovement] rev
    WHERE rev.[idOriginalMovement] = @idStockMovement
      AND rev.[isReversal] = 1
  )
  BEGIN
    ;THROW 51000, 'movementAlreadyReversed', 1;
  END;

  /**
   * @rule {db-movement-data-retrieval} Get original movement data
   */
  SELECT
    @idProduct = stk.[idProduct],
    @originalQuantity = stk.[quantity],
    @movementDate = stk.[dateCreated]
  FROM [functional].[stockMovement] stk
  WHERE stk.[idStockMovement] = @idStockMovement;

  /**
   * @validation Validate movement is within 30 days
   * @throw {movementTooOld}
   */
  SET @daysSinceMovement = DATEDIFF(DAY, @movementDate, GETUTCDATE());

  IF @daysSinceMovement > 30
  BEGIN
    ;THROW 51000, 'canOnlyReverseMovementsWithin30Days', 1;
  END;

  /**
   * @rule {db-reversal-quantity-calculation} Calculate reversal quantity (inverted)
   */
  SET @reversalQuantity = -@originalQuantity;

  /**
   * @rule {db-product-data-retrieval} Get product minimum level
   */
  SELECT @minimumLevel = prd.[minimumLevel]
  FROM [functional].[product] prd
  WHERE prd.[idProduct] = @idProduct
    AND prd.[idAccount] = @idAccount;

  /**
   * @rule {db-balance-retrieval} Get current balance
   */
  SELECT
    @currentBalance = bal.[currentBalance],
    @idProductBalance = bal.[idProductBalance]
  FROM [functional].[productBalance] bal
  WHERE bal.[idProduct] = @idProduct
    AND bal.[idAccount] = @idAccount;

  /**
   * @validation Validate sufficient stock for reversal if original was entry
   * @throw {insufficientStockForReversal}
   */
  SET @newBalance = @currentBalance + @reversalQuantity;

  IF @newBalance < 0
  BEGIN
    ;THROW 51000, 'insufficientStockForReversal', 1;
  END;

  BEGIN TRY
    /**
     * @rule {db-transaction-control} Begin transaction for atomic operation
     */
    BEGIN TRAN;

      /**
       * @rule {db-reversal-creation} Create reversal movement
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
        [idOriginalMovement],
        [dateCreated]
      )
      SELECT
        @idAccount,
        stk.[idProduct],
        @idUser,
        stk.[movementType],
        @reversalQuantity,
        @reason,
        stk.[referenceDocument],
        stk.[lot],
        stk.[expirationDate],
        1,
        @idStockMovement,
        GETUTCDATE()
      FROM [functional].[stockMovement] stk
      WHERE stk.[idStockMovement] = @idStockMovement;

      SET @idReversalMovement = SCOPE_IDENTITY();

      /**
       * @rule {db-stock-status-calculation} Calculate new stock status
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
       * @rule {db-balance-update} Update product balance
       */
      UPDATE [functional].[productBalance]
      SET
        [currentBalance] = @newBalance,
        [stockStatus] = @stockStatus,
        [lastMovementDate] = GETUTCDATE(),
        [lastMovementType] = 3,
        [dateModified] = GETUTCDATE()
      WHERE [idProductBalance] = @idProductBalance;

    COMMIT TRAN;

    /**
     * @output {ReversalMovement, 1, 1}
     * @column {INT} idReversalMovement
     * - Description: Created reversal movement identifier
     */
    SELECT @idReversalMovement AS [idReversalMovement];

  END TRY
  BEGIN CATCH
    ROLLBACK TRAN;
    THROW;
  END CATCH;
END;
GO