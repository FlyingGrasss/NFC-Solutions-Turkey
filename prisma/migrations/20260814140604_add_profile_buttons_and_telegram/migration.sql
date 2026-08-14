-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "buttonOrder" TEXT,
ADD COLUMN     "telegramEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "telegramFullWidth" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "telegramUrl" TEXT;

-- CreateTable
CREATE TABLE "ProfileCustomButton" (
    "id" TEXT NOT NULL,
    "buttonKey" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fullWidth" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "profileId" TEXT NOT NULL,

    CONSTRAINT "ProfileCustomButton_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProfileCustomButton_profileId_sortOrder_idx" ON "ProfileCustomButton"("profileId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "ProfileCustomButton_profileId_buttonKey_key" ON "ProfileCustomButton"("profileId", "buttonKey");

-- AddForeignKey
ALTER TABLE "ProfileCustomButton" ADD CONSTRAINT "ProfileCustomButton_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
