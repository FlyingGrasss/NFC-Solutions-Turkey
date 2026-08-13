-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "googleReviewUrl" TEXT;

-- CreateTable
CREATE TABLE "StockItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "StockItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockChange" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByName" TEXT NOT NULL DEFAULT 'Bilinmiyor',
    "stockItemId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "StockChange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StockItem_userId_updatedAt_idx" ON "StockItem"("userId", "updatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "StockItem_userId_name_key" ON "StockItem"("userId", "name");

-- CreateIndex
CREATE INDEX "StockChange_userId_createdAt_idx" ON "StockChange"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "StockChange_stockItemId_createdAt_idx" ON "StockChange"("stockItemId", "createdAt");

-- AddForeignKey
ALTER TABLE "StockItem" ADD CONSTRAINT "StockItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockChange" ADD CONSTRAINT "StockChange_stockItemId_fkey" FOREIGN KEY ("stockItemId") REFERENCES "StockItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockChange" ADD CONSTRAINT "StockChange_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
