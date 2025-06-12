-- CreateEnum
CREATE TYPE "Position" AS ENUM ('carry', 'mid', 'offlane', 'soft support', 'hard support');

-- CreateEnum
CREATE TYPE "Rank" AS ENUM ('Herald', 'Guardian', 'Crusader', 'Archon', 'Legend', 'Ancient', 'Divine', 'Immortal');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('user', 'admin', 'moderator');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'banned', 'deleted');

-- CreateTable
CREATE TABLE "user_profile" (
    "id" UUID NOT NULL,
    "username" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "steamId" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'user',
    "userStatus" "UserStatus" NOT NULL DEFAULT 'active',
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "premiumExpiresAt" TIMESTAMPTZ(6),
    "postsToday" INTEGER NOT NULL DEFAULT 0,
    "commentsToday" INTEGER NOT NULL DEFAULT 0,
    "lastPostReset" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastCommentReset" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" TIMESTAMPTZ(6),
    "isLoggedIn" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMPTZ(6),
    "email" TEXT,

    CONSTRAINT "user_profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_profile_steamId_key" ON "user_profile"("steamId");

-- CreateIndex
CREATE UNIQUE INDEX "user_profile_email_key" ON "user_profile"("email");
