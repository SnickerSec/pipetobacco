-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "reminder1hSent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "reminder24hSent" BOOLEAN NOT NULL DEFAULT false;
