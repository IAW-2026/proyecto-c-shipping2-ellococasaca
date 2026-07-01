-- AlterTable
ALTER TABLE "shipments" ADD COLUMN     "productIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
