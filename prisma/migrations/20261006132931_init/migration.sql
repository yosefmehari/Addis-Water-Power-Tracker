-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'DISPATCHER');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('WATER', 'ELECTRICITY', 'BOTH');

-- CreateEnum
CREATE TYPE "OutageStatus" AS ENUM ('PENDING', 'VERIFIED', 'ACTIVE', 'INVESTIGATING', 'RESTORED', 'REJECTED');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'VERIFIED', 'MERGED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SeverityLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "AnnouncementPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('OUTAGE_NEARBY', 'OUTAGE_VERIFIED', 'STATUS_CHANGED', 'SERVICE_RESTORED', 'ANNOUNCEMENT', 'SYSTEM');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "avatar" TEXT,
    "bio" TEXT,
    "resetToken" TEXT,
    "resetExpires" TIMESTAMP(3),
    "subCityId" TEXT,
    "woredaId" TEXT,
    "areaId" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubCity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amharicName" TEXT,
    "code" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubCity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Woreda" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subCityId" TEXT NOT NULL,
    "code" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Woreda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Area" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "woredaId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "landmark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Area_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLocation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "subCityId" TEXT NOT NULL,
    "woredaId" TEXT,
    "areaId" TEXT,
    "address" TEXT,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Outage" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "serviceType" "ServiceType" NOT NULL,
    "problemType" TEXT NOT NULL,
    "status" "OutageStatus" NOT NULL DEFAULT 'PENDING',
    "severity" "SeverityLevel" NOT NULL DEFAULT 'MEDIUM',
    "description" TEXT NOT NULL,
    "subCityId" TEXT NOT NULL,
    "woredaId" TEXT,
    "areaId" TEXT,
    "specificLocation" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estimatedRestoration" TIMESTAMP(3),
    "restoredAt" TIMESTAMP(3),
    "verifiedAt" TIMESTAMP(3),
    "verifiedById" TEXT,
    "createdById" TEXT,
    "affectedReportsCount" INTEGER NOT NULL DEFAULT 1,
    "restoredVotesCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Outage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutageReport" (
    "id" TEXT NOT NULL,
    "outageId" TEXT,
    "serviceType" "ServiceType" NOT NULL,
    "problemType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "subCityId" TEXT NOT NULL,
    "woredaId" TEXT,
    "areaId" TEXT,
    "specificLocation" TEXT NOT NULL,
    "address" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "photoUrl" TEXT,
    "reporterName" TEXT,
    "reporterPhone" TEXT,
    "reporterEmail" TEXT,
    "userId" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "ipAddress" TEXT,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutageReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutageUpdate" (
    "id" TEXT NOT NULL,
    "outageId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "updateType" TEXT NOT NULL DEFAULT 'UPDATE',
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OutageUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AffectedConfirmation" (
    "id" TEXT NOT NULL,
    "outageId" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT,
    "isStillAffected" BOOLEAN NOT NULL DEFAULT true,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AffectedConfirmation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'SYSTEM',
    "linkUrl" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Announcement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "serviceType" "ServiceType" NOT NULL DEFAULT 'BOTH',
    "priority" "AnnouncementPriority" NOT NULL DEFAULT 'MEDIUM',
    "subCityId" TEXT,
    "scheduledStart" TIMESTAMP(3),
    "scheduledEnd" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Announcement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_subCityId_idx" ON "User"("subCityId");

-- CreateIndex
CREATE UNIQUE INDEX "SubCity_name_key" ON "SubCity"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SubCity_code_key" ON "SubCity"("code");

-- CreateIndex
CREATE INDEX "SubCity_name_idx" ON "SubCity"("name");

-- CreateIndex
CREATE INDEX "Woreda_subCityId_idx" ON "Woreda"("subCityId");

-- CreateIndex
CREATE UNIQUE INDEX "Woreda_subCityId_name_key" ON "Woreda"("subCityId", "name");

-- CreateIndex
CREATE INDEX "Area_woredaId_idx" ON "Area"("woredaId");

-- CreateIndex
CREATE UNIQUE INDEX "Area_woredaId_name_key" ON "Area"("woredaId", "name");

-- CreateIndex
CREATE INDEX "UserLocation_userId_idx" ON "UserLocation"("userId");

-- CreateIndex
CREATE INDEX "Outage_status_idx" ON "Outage"("status");

-- CreateIndex
CREATE INDEX "Outage_serviceType_idx" ON "Outage"("serviceType");

-- CreateIndex
CREATE INDEX "Outage_subCityId_idx" ON "Outage"("subCityId");

-- CreateIndex
CREATE INDEX "Outage_startedAt_idx" ON "Outage"("startedAt");

-- CreateIndex
CREATE INDEX "Outage_latitude_longitude_idx" ON "Outage"("latitude", "longitude");

-- CreateIndex
CREATE INDEX "OutageReport_status_idx" ON "OutageReport"("status");

-- CreateIndex
CREATE INDEX "OutageReport_serviceType_idx" ON "OutageReport"("serviceType");

-- CreateIndex
CREATE INDEX "OutageReport_subCityId_idx" ON "OutageReport"("subCityId");

-- CreateIndex
CREATE INDEX "OutageReport_outageId_idx" ON "OutageReport"("outageId");

-- CreateIndex
CREATE INDEX "OutageReport_userId_idx" ON "OutageReport"("userId");

-- CreateIndex
CREATE INDEX "OutageReport_createdAt_idx" ON "OutageReport"("createdAt");

-- CreateIndex
CREATE INDEX "OutageUpdate_outageId_idx" ON "OutageUpdate"("outageId");

-- CreateIndex
CREATE INDEX "AffectedConfirmation_outageId_idx" ON "AffectedConfirmation"("outageId");

-- CreateIndex
CREATE INDEX "AffectedConfirmation_userId_idx" ON "AffectedConfirmation"("userId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "Announcement_isActive_idx" ON "Announcement"("isActive");

-- CreateIndex
CREATE INDEX "Announcement_serviceType_idx" ON "Announcement"("serviceType");

-- CreateIndex
CREATE INDEX "Announcement_subCityId_idx" ON "Announcement"("subCityId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_subCityId_fkey" FOREIGN KEY ("subCityId") REFERENCES "SubCity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_woredaId_fkey" FOREIGN KEY ("woredaId") REFERENCES "Woreda"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Woreda" ADD CONSTRAINT "Woreda_subCityId_fkey" FOREIGN KEY ("subCityId") REFERENCES "SubCity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Area" ADD CONSTRAINT "Area_woredaId_fkey" FOREIGN KEY ("woredaId") REFERENCES "Woreda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLocation" ADD CONSTRAINT "UserLocation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLocation" ADD CONSTRAINT "UserLocation_subCityId_fkey" FOREIGN KEY ("subCityId") REFERENCES "SubCity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLocation" ADD CONSTRAINT "UserLocation_woredaId_fkey" FOREIGN KEY ("woredaId") REFERENCES "Woreda"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLocation" ADD CONSTRAINT "UserLocation_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Outage" ADD CONSTRAINT "Outage_subCityId_fkey" FOREIGN KEY ("subCityId") REFERENCES "SubCity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Outage" ADD CONSTRAINT "Outage_woredaId_fkey" FOREIGN KEY ("woredaId") REFERENCES "Woreda"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Outage" ADD CONSTRAINT "Outage_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Outage" ADD CONSTRAINT "Outage_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Outage" ADD CONSTRAINT "Outage_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutageReport" ADD CONSTRAINT "OutageReport_outageId_fkey" FOREIGN KEY ("outageId") REFERENCES "Outage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutageReport" ADD CONSTRAINT "OutageReport_subCityId_fkey" FOREIGN KEY ("subCityId") REFERENCES "SubCity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutageReport" ADD CONSTRAINT "OutageReport_woredaId_fkey" FOREIGN KEY ("woredaId") REFERENCES "Woreda"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutageReport" ADD CONSTRAINT "OutageReport_areaId_fkey" FOREIGN KEY ("areaId") REFERENCES "Area"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutageReport" ADD CONSTRAINT "OutageReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutageUpdate" ADD CONSTRAINT "OutageUpdate_outageId_fkey" FOREIGN KEY ("outageId") REFERENCES "Outage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutageUpdate" ADD CONSTRAINT "OutageUpdate_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffectedConfirmation" ADD CONSTRAINT "AffectedConfirmation_outageId_fkey" FOREIGN KEY ("outageId") REFERENCES "Outage"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AffectedConfirmation" ADD CONSTRAINT "AffectedConfirmation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_subCityId_fkey" FOREIGN KEY ("subCityId") REFERENCES "SubCity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Announcement" ADD CONSTRAINT "Announcement_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
