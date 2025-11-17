/**
 * @schema functional
 * Business logic schema for StockBox inventory management system
 */
CREATE SCHEMA [functional];
GO

/**
 * @table product Product catalog and inventory items
 * @multitenancy true
 * @softDelete true
 * @alias prd
 */
CREATE TABLE [functional].[product] (
  [idProduct] INTEGER IDENTITY(1, 1) NOT NULL,
  [idAccount] INTEGER NOT NULL,
  [name] NVARCHAR(100) NOT NULL,
  [description] NVARCHAR(500) NOT NULL DEFAULT (''),
  [sku] VARCHAR(50) NOT NULL,
  [minimumLevel] NUMERIC(15, 2) NOT NULL DEFAULT (0),
  [hasLotControl] BIT NOT NULL DEFAULT (0),
  [hasExpirationControl] BIT NOT NULL DEFAULT (0),
  [dateCreated] DATETIME2 NOT NULL DEFAULT (GETUTCDATE()),
  [dateModified] DATETIME2 NOT NULL DEFAULT (GETUTCDATE()),
  [deleted] BIT NOT NULL DEFAULT (0)
);
GO

/**
 * @table stockMovement Stock movement transactions
 * @multitenancy true
 * @softDelete false
 * @alias stk
 */
CREATE TABLE [functional].[stockMovement] (
  [idStockMovement] INTEGER IDENTITY(1, 1) NOT NULL,
  [idAccount] INTEGER NOT NULL,
  [idProduct] INTEGER NOT NULL,
  [idUser] INTEGER NOT NULL,
  [movementType] TINYINT NOT NULL,
  [quantity] NUMERIC(15, 2) NOT NULL,
  [reason] NVARCHAR(255) NULL,
  [referenceDocument] VARCHAR(50) NULL,
  [lot] VARCHAR(50) NULL,
  [expirationDate] DATE NULL,
  [isReversal] BIT NOT NULL DEFAULT (0),
  [idOriginalMovement] INTEGER NULL,
  [dateCreated] DATETIME2 NOT NULL DEFAULT (GETUTCDATE())
);
GO

/**
 * @table productBalance Current stock balance per product
 * @multitenancy true
 * @softDelete false
 * @alias bal
 */
CREATE TABLE [functional].[productBalance] (
  [idProductBalance] INTEGER IDENTITY(1, 1) NOT NULL,
  [idAccount] INTEGER NOT NULL,
  [idProduct] INTEGER NOT NULL,
  [currentBalance] NUMERIC(15, 2) NOT NULL DEFAULT (0),
  [stockStatus] TINYINT NOT NULL DEFAULT (0),
  [lastMovementDate] DATETIME2 NULL,
  [lastMovementType] TINYINT NULL,
  [dateModified] DATETIME2 NOT NULL DEFAULT (GETUTCDATE())
);
GO

/**
 * @primaryKey pkProduct
 * @keyType Object
 */
ALTER TABLE [functional].[product]
ADD CONSTRAINT [pkProduct] PRIMARY KEY CLUSTERED ([idProduct]);
GO

/**
 * @primaryKey pkStockMovement
 * @keyType Object
 */
ALTER TABLE [functional].[stockMovement]
ADD CONSTRAINT [pkStockMovement] PRIMARY KEY CLUSTERED ([idStockMovement]);
GO

/**
 * @primaryKey pkProductBalance
 * @keyType Object
 */
ALTER TABLE [functional].[productBalance]
ADD CONSTRAINT [pkProductBalance] PRIMARY KEY CLUSTERED ([idProductBalance]);
GO

/**
 * @foreignKey fkStockMovement_Product
 * @target functional.product
 */
ALTER TABLE [functional].[stockMovement]
ADD CONSTRAINT [fkStockMovement_Product] FOREIGN KEY ([idProduct])
REFERENCES [functional].[product]([idProduct]);
GO

/**
 * @foreignKey fkStockMovement_OriginalMovement
 * @target functional.stockMovement
 */
ALTER TABLE [functional].[stockMovement]
ADD CONSTRAINT [fkStockMovement_OriginalMovement] FOREIGN KEY ([idOriginalMovement])
REFERENCES [functional].[stockMovement]([idStockMovement]);
GO

/**
 * @foreignKey fkProductBalance_Product
 * @target functional.product
 */
ALTER TABLE [functional].[productBalance]
ADD CONSTRAINT [fkProductBalance_Product] FOREIGN KEY ([idProduct])
REFERENCES [functional].[product]([idProduct]);
GO

/**
 * @check chkStockMovement_MovementType
 * @enum {0} Creation - Initial product creation
 * @enum {1} Entry - Stock entry
 * @enum {2} Exit - Stock exit
 * @enum {3} Adjustment - Stock adjustment
 * @enum {4} Deletion - Product deletion
 */
ALTER TABLE [functional].[stockMovement]
ADD CONSTRAINT [chkStockMovement_MovementType] CHECK ([movementType] BETWEEN 0 AND 4);
GO

/**
 * @check chkProductBalance_StockStatus
 * @enum {0} Normal - Stock at normal levels
 * @enum {1} Low - Stock below minimum level
 * @enum {2} Critical - Stock below 30% of minimum level
 * @enum {3} Zero - Stock depleted
 */
ALTER TABLE [functional].[productBalance]
ADD CONSTRAINT [chkProductBalance_StockStatus] CHECK ([stockStatus] BETWEEN 0 AND 3);
GO

/**
 * @index ixProduct_Account
 * @type ForeignKey
 */
CREATE NONCLUSTERED INDEX [ixProduct_Account]
ON [functional].[product]([idAccount])
WHERE [deleted] = 0;
GO

/**
 * @index ixProduct_Account_Name
 * @type Search
 */
CREATE NONCLUSTERED INDEX [ixProduct_Account_Name]
ON [functional].[product]([idAccount], [name])
INCLUDE ([sku], [minimumLevel])
WHERE [deleted] = 0;
GO

/**
 * @index uqProduct_Account_SKU
 * @type Search
 * @unique true
 */
CREATE UNIQUE NONCLUSTERED INDEX [uqProduct_Account_SKU]
ON [functional].[product]([idAccount], [sku])
WHERE [deleted] = 0;
GO

/**
 * @index ixStockMovement_Account
 * @type ForeignKey
 */
CREATE NONCLUSTERED INDEX [ixStockMovement_Account]
ON [functional].[stockMovement]([idAccount]);
GO

/**
 * @index ixStockMovement_Account_Product
 * @type Search
 */
CREATE NONCLUSTERED INDEX [ixStockMovement_Account_Product]
ON [functional].[stockMovement]([idAccount], [idProduct], [dateCreated] DESC)
INCLUDE ([movementType], [quantity]);
GO

/**
 * @index ixStockMovement_Account_DateCreated
 * @type Search
 */
CREATE NONCLUSTERED INDEX [ixStockMovement_Account_DateCreated]
ON [functional].[stockMovement]([idAccount], [dateCreated] DESC)
INCLUDE ([idProduct], [movementType], [quantity]);
GO

/**
 * @index ixStockMovement_OriginalMovement
 * @type ForeignKey
 */
CREATE NONCLUSTERED INDEX [ixStockMovement_OriginalMovement]
ON [functional].[stockMovement]([idOriginalMovement])
WHERE [isReversal] = 1;
GO

/**
 * @index ixProductBalance_Account
 * @type ForeignKey
 */
CREATE NONCLUSTERED INDEX [ixProductBalance_Account]
ON [functional].[productBalance]([idAccount]);
GO

/**
 * @index uqProductBalance_Account_Product
 * @type Search
 * @unique true
 */
CREATE UNIQUE NONCLUSTERED INDEX [uqProductBalance_Account_Product]
ON [functional].[productBalance]([idAccount], [idProduct]);
GO

/**
 * @index ixProductBalance_Account_StockStatus
 * @type Search
 */
CREATE NONCLUSTERED INDEX [ixProductBalance_Account_StockStatus]
ON [functional].[productBalance]([idAccount], [stockStatus])
INCLUDE ([idProduct], [currentBalance]);
GO