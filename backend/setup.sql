-- =============================================================
-- America Needs Nurses (ANN) - Complete PostgreSQL Schema
-- =============================================================

-- Drop tables if re-running (safe reset)
DROP TABLE IF EXISTS "ServiceRequest" CASCADE;
DROP TABLE IF EXISTS "IssueReport" CASCADE;
DROP TABLE IF EXISTS "Review" CASCADE;
DROP TABLE IF EXISTS "Notification" CASCADE;
DROP TABLE IF EXISTS "NurseRecord" CASCADE;
DROP TABLE IF EXISTS "Block" CASCADE;
DROP TABLE IF EXISTS "Message" CASCADE;
DROP TABLE IF EXISTS "ConversationMember" CASCADE;
DROP TABLE IF EXISTS "Conversation" CASCADE;
DROP TABLE IF EXISTS "PostReaction" CASCADE;
DROP TABLE IF EXISTS "PostComment" CASCADE;
DROP TABLE IF EXISTS "CommunityPost" CASCADE;
DROP TABLE IF EXISTS "BlogComment" CASCADE;
DROP TABLE IF EXISTS "Blog" CASCADE;
DROP TABLE IF EXISTS "NewsletterClick" CASCADE;
DROP TABLE IF EXISTS "NewsletterOpen" CASCADE;
DROP TABLE IF EXISTS "Newsletter" CASCADE;
DROP TABLE IF EXISTS "SubscriberPreference" CASCADE;
DROP TABLE IF EXISTS "NewsletterPreference" CASCADE;
DROP TABLE IF EXISTS "NewsletterSubscriber" CASCADE;
DROP TABLE IF EXISTS "Subscription" CASCADE;
DROP TABLE IF EXISTS "SubscriptionPlan" CASCADE;
DROP TABLE IF EXISTS "SavedJob" CASCADE;
DROP TABLE IF EXISTS "Application" CASCADE;
DROP TABLE IF EXISTS "Job" CASCADE;
DROP TABLE IF EXISTS "SavedCompany" CASCADE;
DROP TABLE IF EXISTS "CompanyImage" CASCADE;
DROP TABLE IF EXISTS "Company" CASCADE;
DROP TABLE IF EXISTS "EmployerProfile" CASCADE;
DROP TABLE IF EXISTS "NurseProfile" CASCADE;
DROP TABLE IF EXISTS "VerificationToken" CASCADE;
DROP TABLE IF EXISTS "Session" CASCADE;
DROP TABLE IF EXISTS "Account" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- Drop ENUMs if re-running
DROP TYPE IF EXISTS "Role" CASCADE;
DROP TYPE IF EXISTS "UserStatus" CASCADE;
DROP TYPE IF EXISTS "CompanyStatus" CASCADE;
DROP TYPE IF EXISTS "JobStatus" CASCADE;
DROP TYPE IF EXISTS "ApplicationStatus" CASCADE;
DROP TYPE IF EXISTS "NotificationChannel" CASCADE;
DROP TYPE IF EXISTS "NotificationType" CASCADE;
DROP TYPE IF EXISTS "SubscriptionStatus" CASCADE;
DROP TYPE IF EXISTS "MessageStatus" CASCADE;
DROP TYPE IF EXISTS "ReportStatus" CASCADE;
DROP TYPE IF EXISTS "BlogStatus" CASCADE;
DROP TYPE IF EXISTS "NewsletterType" CASCADE;
DROP TYPE IF EXISTS "NewsletterStatus" CASCADE;
DROP TYPE IF EXISTS "LicenseType" CASCADE;

-- =============================================================
-- ENUMS
-- =============================================================

CREATE TYPE "Role" AS ENUM (
  'SUPER_ADMIN', 'CONTENT_ADMIN', 'SUPPORT_ADMIN',
  'EMPLOYER', 'NURSE', 'GUEST'
);

CREATE TYPE "UserStatus" AS ENUM (
  'PENDING', 'ACTIVE', 'SUSPENDED', 'BANNED'
);

CREATE TYPE "CompanyStatus" AS ENUM (
  'DRAFT', 'PENDING', 'APPROVED', 'SUSPENDED'
);

CREATE TYPE "JobStatus" AS ENUM (
  'DRAFT', 'PENDING', 'APPROVED', 'EXPIRED', 'CLOSED'
);

CREATE TYPE "ApplicationStatus" AS ENUM (
  'PENDING', 'REVIEWED', 'SHORTLISTED', 'REJECTED', 'HIRED'
);

CREATE TYPE "NotificationChannel" AS ENUM (
  'EMAIL', 'IN_APP'
);

CREATE TYPE "NotificationType" AS ENUM (
  'COMPANY_APPROVED', 'COMPANY_REJECTED', 'JOB_APPROVED',
  'JOB_EXPIRED', 'APPLICATION_UPDATE', 'NEW_MESSAGE',
  'SUBSCRIPTION_EXPIRY', 'NEWSLETTER', 'COMMUNITY_REPORT'
);

CREATE TYPE "SubscriptionStatus" AS ENUM (
  'ACTIVE', 'CANCELLED', 'EXPIRED'
);

CREATE TYPE "MessageStatus" AS ENUM (
  'SENT', 'READ', 'DELETED'
);

CREATE TYPE "ReportStatus" AS ENUM (
  'PENDING', 'RESOLVED', 'IGNORED'
);

CREATE TYPE "BlogStatus" AS ENUM (
  'DRAFT', 'PUBLISHED', 'ARCHIVED'
);

CREATE TYPE "NewsletterType" AS ENUM (
  'JOB_ALERT', 'COMPANY_HIGHLIGHT', 'WEEKLY_CONTENT', 'SPONSORED'
);

CREATE TYPE "NewsletterStatus" AS ENUM (
  'DRAFT', 'SCHEDULED', 'SENT'
);

CREATE TYPE "LicenseType" AS ENUM (
  'RN', 'LPN', 'LVN', 'NP', 'CRNA', 'CNM', 'OTHER'
);

-- =============================================================
-- USER & AUTH
-- =============================================================

CREATE TABLE "User" (
  "id"            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name"          TEXT,
  "email"         TEXT UNIQUE NOT NULL,
  "emailVerified" TIMESTAMP,
  "image"         TEXT,
  "password"      TEXT,
  "role"          "Role" NOT NULL DEFAULT 'NURSE',
  "status"        "UserStatus" NOT NULL DEFAULT 'PENDING',
  "isOnboarded"   BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt"     TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"     TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "Account" (
  "id"                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"            UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "type"              TEXT NOT NULL,
  "provider"          TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token"     TEXT,
  "access_token"      TEXT,
  "expires_at"        INTEGER,
  "token_type"        TEXT,
  "scope"             TEXT,
  "id_token"          TEXT,
  "session_state"     TEXT,
  UNIQUE("provider", "providerAccountId")
);

CREATE TABLE "Session" (
  "id"           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "sessionToken" TEXT UNIQUE NOT NULL,
  "userId"       UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "expires"      TIMESTAMP NOT NULL
);

CREATE TABLE "VerificationToken" (
  "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "identifier" TEXT NOT NULL,
  "token"      TEXT UNIQUE NOT NULL,
  "expires"    TIMESTAMP NOT NULL,
  "type"       TEXT NOT NULL DEFAULT 'EMAIL_VERIFY',
  UNIQUE("identifier", "token")
);

-- =============================================================
-- NURSE PROFILE
-- =============================================================

CREATE TABLE "NurseProfile" (
  "id"                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "fullName"           TEXT,
  "phone"              TEXT,
  "location"           TEXT,
  "state"              TEXT,
  "zipCode"            TEXT,
  "country"            TEXT,
  "licenseType"        "LicenseType",
  "licenseNumber"      TEXT,
  "specialization"     TEXT,
  "yearsOfExperience"  INTEGER DEFAULT 0,
  "bio"                TEXT,
  "resumeUrl"          TEXT,
  "employmentPref"     TEXT[],
  "skills"             TEXT[],
  "minPay"             INTEGER,
  "payPeriod"          TEXT,
  "currency"           TEXT DEFAULT 'USD',
  "preferredJobTitles" TEXT[],
  "userId"             UUID UNIQUE NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "createdAt"          TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"          TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =============================================================
-- EMPLOYER PROFILE
-- =============================================================

CREATE TABLE "EmployerProfile" (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "companyName" TEXT,
  "phone"       TEXT,
  "website"     TEXT,
  "location"    TEXT,
  "userId"      UUID UNIQUE NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "createdAt"   TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =============================================================
-- COMPANY DIRECTORY
-- =============================================================

CREATE TABLE "Company" (
  "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name"            TEXT NOT NULL,
  "slug"            TEXT UNIQUE NOT NULL,
  "category"        TEXT NOT NULL,
  "description"     TEXT NOT NULL,
  "logoUrl"         TEXT,
  "videoUrl"        TEXT,
  "status"          "CompanyStatus" NOT NULL DEFAULT 'DRAFT',
  "isFeatured"      BOOLEAN NOT NULL DEFAULT FALSE,
  "featuredAt"      TIMESTAMP,
  "phone"           TEXT,
  "whatsapp"        TEXT,
  "email"           TEXT,
  "website"         TEXT,
  "address"         TEXT,
  "zipCode"         TEXT,
  "telegramId"      TEXT,
  "metaTitle"       TEXT,
  "metaDescription" TEXT,
  "ownerId"         UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "createdAt"       TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "CompanyImage" (
  "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "url"       TEXT NOT NULL,
  "altText"   TEXT,
  "order"     INTEGER NOT NULL DEFAULT 0,
  "companyId" UUID NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "SavedCompany" (
  "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"    UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "companyId" UUID NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE("userId", "companyId")
);

-- =============================================================
-- JOB POSTING MODULE
-- =============================================================

CREATE TABLE "Job" (
  "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title"           TEXT NOT NULL,
  "slug"            TEXT UNIQUE NOT NULL,
  "specialty"       TEXT,
  "location"        TEXT NOT NULL,
  "jobType"         TEXT NOT NULL,
  "salaryMin"       INTEGER,
  "salaryMax"       INTEGER,
  "salaryCurrency"  TEXT DEFAULT 'USD',
  "salaryPeriod"    TEXT,
  "description"     TEXT NOT NULL,
  "requirements"    TEXT,
  "benefits"        TEXT,
  "shiftDetails"    TEXT,
  "status"          "JobStatus" NOT NULL DEFAULT 'PENDING',
  "expiresAt"       TIMESTAMP,
  "isFree"          BOOLEAN NOT NULL DEFAULT FALSE,
  "metaTitle"       TEXT,
  "metaDescription" TEXT,
  "companyId"       UUID NOT NULL REFERENCES "Company"("id") ON DELETE CASCADE,
  "postedById"      UUID NOT NULL,
  "createdAt"       TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "Application" (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "status"      "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
  "resumeUrl"   TEXT,
  "coverLetter" TEXT,
  "experience"  JSONB,
  "userId"      UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "jobId"       UUID NOT NULL REFERENCES "Job"("id") ON DELETE CASCADE,
  "appliedAt"   TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE("userId", "jobId")
);

CREATE TABLE "SavedJob" (
  "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId"    UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "jobId"     UUID NOT NULL REFERENCES "Job"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE("userId", "jobId")
);

-- =============================================================
-- SUBSCRIPTION MODULE
-- =============================================================

CREATE TABLE "SubscriptionPlan" (
  "id"           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name"         TEXT NOT NULL,
  "price"        DECIMAL NOT NULL,
  "currency"     TEXT NOT NULL DEFAULT 'USD',
  "billingCycle" TEXT NOT NULL,
  "jobsLimit"    INTEGER NOT NULL,
  "features"     TEXT[],
  "isPopular"    BOOLEAN NOT NULL DEFAULT FALSE,
  "isActive"     BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt"    TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "Subscription" (
  "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "status"          "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
  "startDate"       TIMESTAMP NOT NULL DEFAULT NOW(),
  "endDate"         TIMESTAMP,
  "jobsPostedCount" INTEGER NOT NULL DEFAULT 0,
  "autoRenew"       BOOLEAN NOT NULL DEFAULT FALSE,
  "userId"          UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "planId"          UUID NOT NULL REFERENCES "SubscriptionPlan"("id"),
  "createdAt"       TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"       TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =============================================================
-- NEWSLETTER MODULE
-- =============================================================

CREATE TABLE "NewsletterSubscriber" (
  "id"             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email"          TEXT UNIQUE NOT NULL,
  "isActive"       BOOLEAN NOT NULL DEFAULT TRUE,
  "subscribedAt"   TIMESTAMP NOT NULL DEFAULT NOW(),
  "unsubscribedAt" TIMESTAMP,
  "token"          TEXT UNIQUE NOT NULL DEFAULT gen_random_uuid()::TEXT
);

CREATE TABLE "SubscriberPreference" (
  "id"             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "subscriberId"   UUID NOT NULL REFERENCES "NewsletterSubscriber"("id") ON DELETE CASCADE,
  "newsletterType" "NewsletterType" NOT NULL,
  "isEnabled"      BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE("subscriberId", "newsletterType")
);

CREATE TABLE "NewsletterPreference" (
  "id"     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" UUID UNIQUE NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "types"  "NewsletterType"[]
);

CREATE TABLE "Newsletter" (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title"       TEXT NOT NULL,
  "subject"     TEXT NOT NULL,
  "content"     TEXT NOT NULL,
  "type"        "NewsletterType" NOT NULL,
  "status"      "NewsletterStatus" NOT NULL DEFAULT 'DRAFT',
  "isSponsored" BOOLEAN NOT NULL DEFAULT FALSE,
  "scheduledAt" TIMESTAMP,
  "sentAt"      TIMESTAMP,
  "createdAt"   TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "NewsletterOpen" (
  "id"           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "subscriberId" UUID NOT NULL REFERENCES "NewsletterSubscriber"("id") ON DELETE CASCADE,
  "newsletterId" UUID NOT NULL REFERENCES "Newsletter"("id") ON DELETE CASCADE,
  "openedAt"     TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE("subscriberId", "newsletterId")
);

CREATE TABLE "NewsletterClick" (
  "id"           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "subscriberId" UUID NOT NULL REFERENCES "NewsletterSubscriber"("id") ON DELETE CASCADE,
  "newsletterId" UUID NOT NULL REFERENCES "Newsletter"("id") ON DELETE CASCADE,
  "url"          TEXT NOT NULL,
  "clickedAt"    TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =============================================================
-- BLOG MODULE
-- =============================================================

CREATE TABLE "Blog" (
  "id"              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title"           TEXT NOT NULL,
  "slug"            TEXT UNIQUE NOT NULL,
  "content"         TEXT NOT NULL,
  "excerpt"         TEXT,
  "imageUrl"        TEXT,
  "status"          "BlogStatus" NOT NULL DEFAULT 'DRAFT',
  "category"        TEXT NOT NULL DEFAULT 'Nursing Tips',
  "tags"            TEXT[],
  "author"          TEXT NOT NULL DEFAULT 'Admin',
  "isSponsored"     BOOLEAN NOT NULL DEFAULT FALSE,
  "metaTitle"       TEXT,
  "metaDescription" TEXT,
  "publishedAt"     TIMESTAMP,
  "createdAt"       TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"       TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "BlogComment" (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "content"     TEXT NOT NULL,
  "authorName"  TEXT NOT NULL,
  "authorEmail" TEXT NOT NULL,
  "isApproved"  BOOLEAN NOT NULL DEFAULT FALSE,
  "isSpam"      BOOLEAN NOT NULL DEFAULT FALSE,
  "blogId"      UUID NOT NULL REFERENCES "Blog"("id") ON DELETE CASCADE,
  "parentId"    UUID REFERENCES "BlogComment"("id"),
  "createdAt"   TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =============================================================
-- NURSE COMMUNITY MODULE
-- =============================================================

CREATE TABLE "CommunityPost" (
  "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title"     TEXT NOT NULL,
  "content"   TEXT NOT NULL,
  "isLocked"  BOOLEAN NOT NULL DEFAULT FALSE,
  "isPinned"  BOOLEAN NOT NULL DEFAULT FALSE,
  "authorId"  UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "PostComment" (
  "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "content"   TEXT NOT NULL,
  "authorId"  UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "postId"    UUID NOT NULL REFERENCES "CommunityPost"("id") ON DELETE CASCADE,
  "parentId"  UUID REFERENCES "PostComment"("id"),
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "PostReaction" (
  "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "type"      TEXT NOT NULL,
  "userId"    UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "postId"    UUID REFERENCES "CommunityPost"("id") ON DELETE CASCADE,
  "commentId" UUID REFERENCES "PostComment"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE("userId", "postId"),
  UNIQUE("userId", "commentId")
);

-- =============================================================
-- MESSAGING MODULE
-- =============================================================

CREATE TABLE "Conversation" (
  "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "ConversationMember" (
  "id"             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "conversationId" UUID NOT NULL REFERENCES "Conversation"("id") ON DELETE CASCADE,
  "userId"         UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "joinedAt"       TIMESTAMP NOT NULL DEFAULT NOW(),
  "lastReadAt"     TIMESTAMP,
  UNIQUE("conversationId", "userId")
);

CREATE TABLE "Message" (
  "id"             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "content"        TEXT NOT NULL,
  "status"         "MessageStatus" NOT NULL DEFAULT 'SENT',
  "isReported"     BOOLEAN NOT NULL DEFAULT FALSE,
  "conversationId" UUID NOT NULL REFERENCES "Conversation"("id") ON DELETE CASCADE,
  "senderId"       UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "createdAt"      TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "Block" (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "blockedById" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "blockedId"   UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "createdAt"   TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE("blockedById", "blockedId")
);

-- =============================================================
-- LARGE NURSE DATABASE (400K records)
-- =============================================================

CREATE TABLE "NurseRecord" (
  "id"                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "fullName"               TEXT NOT NULL,
  "email"                  TEXT UNIQUE,
  "phone"                  TEXT,
  "location"               TEXT,
  "state"                  TEXT,
  "licenseType"            TEXT,
  "specialization"         TEXT,
  "yearsOfExp"             INTEGER,
  "isNewsletterSubscriber" BOOLEAN NOT NULL DEFAULT FALSE,
  "source"                 TEXT,
  "createdAt"              TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt"              TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for fast queries on 400K records
CREATE INDEX idx_nurse_record_email          ON "NurseRecord"("email");
CREATE INDEX idx_nurse_record_state          ON "NurseRecord"("state");
CREATE INDEX idx_nurse_record_license        ON "NurseRecord"("licenseType");
CREATE INDEX idx_nurse_record_specialization ON "NurseRecord"("specialization");

-- =============================================================
-- NOTIFICATION MODULE
-- =============================================================

CREATE TABLE "Notification" (
  "id"        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "title"     TEXT NOT NULL,
  "message"   TEXT NOT NULL,
  "type"      "NotificationType" NOT NULL,
  "channel"   "NotificationChannel" NOT NULL DEFAULT 'IN_APP',
  "isRead"    BOOLEAN NOT NULL DEFAULT FALSE,
  "metadata"  JSONB,
  "userId"    UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =============================================================
-- REVIEWS MODULE
-- =============================================================

CREATE TABLE "Review" (
  "id"         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "rating"     INTEGER NOT NULL CHECK ("rating" >= 1 AND "rating" <= 5),
  "comment"    TEXT,
  "reviewerId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "nurseId"    UUID REFERENCES "User"("id") ON DELETE SET NULL,
  "jobId"      UUID REFERENCES "Job"("id") ON DELETE SET NULL,
  "companyId"  UUID REFERENCES "Company"("id") ON DELETE SET NULL,
  "createdAt"  TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =============================================================
-- ISSUE REPORTS & MODERATION
-- =============================================================

CREATE TABLE "IssueReport" (
  "id"             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "category"       TEXT NOT NULL,
  "message"        TEXT NOT NULL,
  "status"         "ReportStatus" NOT NULL DEFAULT 'PENDING',
  "reportedById"   UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
  "reportedUserId" UUID REFERENCES "User"("id") ON DELETE SET NULL,
  "jobId"          UUID REFERENCES "Job"("id") ON DELETE SET NULL,
  "companyId"      UUID REFERENCES "Company"("id") ON DELETE SET NULL,
  "postId"         UUID REFERENCES "CommunityPost"("id") ON DELETE SET NULL,
  "resolvedAt"     TIMESTAMP,
  "resolvedBy"     TEXT,
  "adminNote"      TEXT,
  "createdAt"      TIMESTAMP NOT NULL DEFAULT NOW()
);

-- =============================================================
-- SERVICE REQUESTS
-- =============================================================

CREATE TABLE "ServiceRequest" (
  "id"          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "fullName"    TEXT NOT NULL,
  "email"       TEXT NOT NULL,
  "phone"       TEXT,
  "serviceType" TEXT NOT NULL,
  "message"     TEXT NOT NULL,
  "status"      TEXT NOT NULL DEFAULT 'PENDING',
  "createdAt"   TIMESTAMP NOT NULL DEFAULT NOW()
);
