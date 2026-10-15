-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'house_manager', 'staff', 'read_only');

-- CreateEnum
CREATE TYPE "BedStatus" AS ENUM ('open', 'occupied', 'reserved', 'offline');

-- CreateEnum
CREATE TYPE "ResidentStatus" AS ENUM ('active', 'alumni', 'waitlist');

-- CreateEnum
CREATE TYPE "WorkOrderCategory" AS ENUM ('maintenance', 'cleaning', 'safety', 'supplies', 'other');

-- CreateEnum
CREATE TYPE "WorkOrderPriority" AS ENUM ('low', 'normal', 'high', 'urgent');

-- CreateEnum
CREATE TYPE "WorkOrderStatus" AS ENUM ('open', 'in_progress', 'blocked', 'done', 'cancelled');

-- CreateEnum
CREATE TYPE "ShiftSessionStatus" AS ENUM ('open', 'closed');

-- CreateEnum
CREATE TYPE "NightCheckStatus" AS ENUM ('in_progress', 'completed');

-- CreateEnum
CREATE TYPE "NightCheckEntryStatus" AS ENUM ('pending', 'present', 'out_on_pass', 'late', 'missing', 'skipped');

-- CreateEnum
CREATE TYPE "ClientLogType" AS ENUM ('progress', 'behavior', 'shift');

-- CreateEnum
CREATE TYPE "UaOutcome" AS ENUM ('neg', 'pos', 'refused', 'unable');

-- CreateEnum
CREATE TYPE "BehavioralContractStatus" AS ENUM ('active', 'completed', 'void');

-- CreateTable
CREATE TABLE "Organization" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'staff',
    "passwordHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "House" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "zip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "House_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bed" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "houseId" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "status" "BedStatus" NOT NULL DEFAULT 'open',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resident" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "houseId" UUID,
    "bedId" UUID,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dob" TIMESTAMP(3),
    "insuranceCarrier" TEXT,
    "insuranceMemberId" TEXT,
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "admissionDate" TIMESTAMP(3),
    "status" "ResidentStatus" NOT NULL DEFAULT 'waitlist',
    "moveInAt" TIMESTAMP(3),
    "moveOutAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "userId" UUID,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkOrder" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "houseId" UUID NOT NULL,
    "number" SERIAL NOT NULL,
    "room" TEXT,
    "assigneeName" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "WorkOrderCategory" NOT NULL DEFAULT 'other',
    "priority" "WorkOrderPriority" NOT NULL DEFAULT 'normal',
    "status" "WorkOrderStatus" NOT NULL DEFAULT 'open',
    "createdById" UUID,
    "assigneeId" UUID,
    "dueAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkOrderEvent" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "workOrderId" UUID NOT NULL,
    "userId" UUID,
    "type" TEXT NOT NULL,
    "message" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkOrderEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkOrderAttachment" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "workOrderId" UUID NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT,
    "url" TEXT NOT NULL,
    "sizeBytes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkOrderAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResidentMed" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "residentId" UUID NOT NULL,
    "description" TEXT NOT NULL,
    "dosage" TEXT,
    "amount" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResidentMed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShiftSession" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "houseId" UUID NOT NULL,
    "status" "ShiftSessionStatus" NOT NULL DEFAULT 'open',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ShiftSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NightCheck" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "houseId" UUID NOT NULL,
    "shiftSessionId" UUID NOT NULL,
    "status" "NightCheckStatus" NOT NULL DEFAULT 'in_progress',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "handoffNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NightCheck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NightCheckEntry" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "nightCheckId" UUID NOT NULL,
    "residentId" UUID NOT NULL,
    "status" "NightCheckEntryStatus" NOT NULL DEFAULT 'pending',
    "note" TEXT,
    "markedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NightCheckEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientLog" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "residentId" UUID NOT NULL,
    "type" "ClientLogType" NOT NULL,
    "body" TEXT NOT NULL,
    "author" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClientLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UaResult" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "residentId" UUID NOT NULL,
    "houseId" UUID,
    "shiftSessionId" UUID,
    "outcome" "UaOutcome" NOT NULL,
    "note" TEXT,
    "author" TEXT,
    "testedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UaResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BehavioralContract" (
    "id" UUID NOT NULL,
    "orgId" UUID NOT NULL,
    "residentId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "notes" TEXT,
    "signedAt" TIMESTAMP(3),
    "status" "BehavioralContractStatus" NOT NULL DEFAULT 'active',
    "fileName" TEXT,
    "mimeType" TEXT,
    "filePath" TEXT,
    "fileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BehavioralContract_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "User_orgId_idx" ON "User"("orgId");

-- CreateIndex
CREATE UNIQUE INDEX "User_orgId_email_key" ON "User"("orgId", "email");

-- CreateIndex
CREATE INDEX "House_orgId_idx" ON "House"("orgId");

-- CreateIndex
CREATE INDEX "Bed_orgId_idx" ON "Bed"("orgId");

-- CreateIndex
CREATE INDEX "Bed_houseId_idx" ON "Bed"("houseId");

-- CreateIndex
CREATE INDEX "Bed_status_idx" ON "Bed"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Bed_houseId_label_key" ON "Bed"("houseId", "label");

-- CreateIndex
CREATE INDEX "Resident_orgId_idx" ON "Resident"("orgId");

-- CreateIndex
CREATE INDEX "Resident_houseId_idx" ON "Resident"("houseId");

-- CreateIndex
CREATE INDEX "Resident_status_idx" ON "Resident"("status");

-- CreateIndex
CREATE INDEX "AuditLog_orgId_idx" ON "AuditLog"("orgId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "WorkOrder_orgId_idx" ON "WorkOrder"("orgId");

-- CreateIndex
CREATE INDEX "WorkOrder_houseId_idx" ON "WorkOrder"("houseId");

-- CreateIndex
CREATE INDEX "WorkOrder_status_idx" ON "WorkOrder"("status");

-- CreateIndex
CREATE INDEX "WorkOrder_priority_idx" ON "WorkOrder"("priority");

-- CreateIndex
CREATE INDEX "WorkOrder_assigneeId_idx" ON "WorkOrder"("assigneeId");

-- CreateIndex
CREATE INDEX "WorkOrderEvent_orgId_idx" ON "WorkOrderEvent"("orgId");

-- CreateIndex
CREATE INDEX "WorkOrderEvent_workOrderId_idx" ON "WorkOrderEvent"("workOrderId");

-- CreateIndex
CREATE INDEX "WorkOrderEvent_createdAt_idx" ON "WorkOrderEvent"("createdAt");

-- CreateIndex
CREATE INDEX "WorkOrderAttachment_orgId_idx" ON "WorkOrderAttachment"("orgId");

-- CreateIndex
CREATE INDEX "WorkOrderAttachment_workOrderId_idx" ON "WorkOrderAttachment"("workOrderId");

-- CreateIndex
CREATE INDEX "ResidentMed_orgId_idx" ON "ResidentMed"("orgId");

-- CreateIndex
CREATE INDEX "ResidentMed_residentId_idx" ON "ResidentMed"("residentId");

-- CreateIndex
CREATE INDEX "ShiftSession_orgId_idx" ON "ShiftSession"("orgId");

-- CreateIndex
CREATE INDEX "ShiftSession_houseId_idx" ON "ShiftSession"("houseId");

-- CreateIndex
CREATE INDEX "ShiftSession_status_idx" ON "ShiftSession"("status");

-- CreateIndex
CREATE INDEX "NightCheck_orgId_idx" ON "NightCheck"("orgId");

-- CreateIndex
CREATE INDEX "NightCheck_houseId_idx" ON "NightCheck"("houseId");

-- CreateIndex
CREATE INDEX "NightCheck_shiftSessionId_idx" ON "NightCheck"("shiftSessionId");

-- CreateIndex
CREATE INDEX "NightCheck_status_idx" ON "NightCheck"("status");

-- CreateIndex
CREATE INDEX "NightCheckEntry_orgId_idx" ON "NightCheckEntry"("orgId");

-- CreateIndex
CREATE INDEX "NightCheckEntry_nightCheckId_idx" ON "NightCheckEntry"("nightCheckId");

-- CreateIndex
CREATE INDEX "NightCheckEntry_residentId_idx" ON "NightCheckEntry"("residentId");

-- CreateIndex
CREATE UNIQUE INDEX "NightCheckEntry_nightCheckId_residentId_key" ON "NightCheckEntry"("nightCheckId", "residentId");

-- CreateIndex
CREATE INDEX "ClientLog_orgId_idx" ON "ClientLog"("orgId");

-- CreateIndex
CREATE INDEX "ClientLog_residentId_idx" ON "ClientLog"("residentId");

-- CreateIndex
CREATE INDEX "ClientLog_createdAt_idx" ON "ClientLog"("createdAt");

-- CreateIndex
CREATE INDEX "ClientLog_type_idx" ON "ClientLog"("type");

-- CreateIndex
CREATE INDEX "UaResult_orgId_idx" ON "UaResult"("orgId");

-- CreateIndex
CREATE INDEX "UaResult_residentId_idx" ON "UaResult"("residentId");

-- CreateIndex
CREATE INDEX "UaResult_houseId_idx" ON "UaResult"("houseId");

-- CreateIndex
CREATE INDEX "UaResult_shiftSessionId_idx" ON "UaResult"("shiftSessionId");

-- CreateIndex
CREATE INDEX "UaResult_testedAt_idx" ON "UaResult"("testedAt");

-- CreateIndex
CREATE INDEX "UaResult_outcome_idx" ON "UaResult"("outcome");

-- CreateIndex
CREATE INDEX "BehavioralContract_orgId_idx" ON "BehavioralContract"("orgId");

-- CreateIndex
CREATE INDEX "BehavioralContract_residentId_idx" ON "BehavioralContract"("residentId");

-- CreateIndex
CREATE INDEX "BehavioralContract_status_idx" ON "BehavioralContract"("status");

-- CreateIndex
CREATE INDEX "BehavioralContract_createdAt_idx" ON "BehavioralContract"("createdAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "House" ADD CONSTRAINT "House_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bed" ADD CONSTRAINT "Bed_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resident" ADD CONSTRAINT "Resident_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resident" ADD CONSTRAINT "Resident_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resident" ADD CONSTRAINT "Resident_bedId_fkey" FOREIGN KEY ("bedId") REFERENCES "Bed"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderEvent" ADD CONSTRAINT "WorkOrderEvent_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderEvent" ADD CONSTRAINT "WorkOrderEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderAttachment" ADD CONSTRAINT "WorkOrderAttachment_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResidentMed" ADD CONSTRAINT "ResidentMed_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResidentMed" ADD CONSTRAINT "ResidentMed_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "Resident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftSession" ADD CONSTRAINT "ShiftSession_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShiftSession" ADD CONSTRAINT "ShiftSession_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NightCheck" ADD CONSTRAINT "NightCheck_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NightCheck" ADD CONSTRAINT "NightCheck_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NightCheck" ADD CONSTRAINT "NightCheck_shiftSessionId_fkey" FOREIGN KEY ("shiftSessionId") REFERENCES "ShiftSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NightCheckEntry" ADD CONSTRAINT "NightCheckEntry_nightCheckId_fkey" FOREIGN KEY ("nightCheckId") REFERENCES "NightCheck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NightCheckEntry" ADD CONSTRAINT "NightCheckEntry_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "Resident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientLog" ADD CONSTRAINT "ClientLog_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClientLog" ADD CONSTRAINT "ClientLog_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "Resident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UaResult" ADD CONSTRAINT "UaResult_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UaResult" ADD CONSTRAINT "UaResult_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "Resident"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UaResult" ADD CONSTRAINT "UaResult_houseId_fkey" FOREIGN KEY ("houseId") REFERENCES "House"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UaResult" ADD CONSTRAINT "UaResult_shiftSessionId_fkey" FOREIGN KEY ("shiftSessionId") REFERENCES "ShiftSession"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BehavioralContract" ADD CONSTRAINT "BehavioralContract_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BehavioralContract" ADD CONSTRAINT "BehavioralContract_residentId_fkey" FOREIGN KEY ("residentId") REFERENCES "Resident"("id") ON DELETE CASCADE ON UPDATE CASCADE;
