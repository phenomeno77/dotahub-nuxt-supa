-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('user', 'admin', 'moderator');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'banned', 'deleted');

-- CreateEnum
CREATE TYPE "Position" AS ENUM ('carry', 'mid', 'offlane', 'soft support', 'hard support');

-- CreateEnum
CREATE TYPE "Rank" AS ENUM ('Herald', 'Guardian', 'Crusader', 'Archon', 'Legend', 'Ancient', 'Divine', 'Immortal');

-- CreateTable
CREATE TABLE "user_profile" (
    "id" UUID NOT NULL,
    "username" VARCHAR,
    "avatarUrl" VARCHAR,
    "steamId" VARCHAR,
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
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_profile_steamId_key" ON "user_profile"("steamId");
