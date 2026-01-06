-- CreateTable
CREATE TABLE "Matches" (
    "id" TEXT NOT NULL,
    "firstPersonId" TEXT NOT NULL,
    "secondPersonId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Matches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Matches_firstPersonId_secondPersonId_key" ON "Matches"("firstPersonId", "secondPersonId");

-- AddForeignKey
ALTER TABLE "Matches" ADD CONSTRAINT "Matches_firstPersonId_fkey" FOREIGN KEY ("firstPersonId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Matches" ADD CONSTRAINT "Matches_secondPersonId_fkey" FOREIGN KEY ("secondPersonId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
