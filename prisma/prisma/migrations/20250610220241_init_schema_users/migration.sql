-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('user', 'admin', 'moderator');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('active', 'banned', 'deleted');

-- CreateEnum
CREATE TYPE "Position" AS ENUM ('carry', 'mid', 'offlane', 'soft_support', 'hard_support');

-- CreateEnum
CREATE TYPE "Rank" AS ENUM ('Herald', 'Guardian', 'Crusader', 'Archon', 'Legend', 'Ancient', 'Divine', 'Immortal');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "username" TEXT,
    "avatarUrl" TEXT,
    "steamId" TEXT UNIQUE,
    "userStatus" "UserStatus" NOT NULL DEFAULT 'active',
    "role" "UserRole" NOT NULL DEFAULT 'user',
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "premiumExpiresAt" TIMESTAMP(3),
    "postsToday" INTEGER NOT NULL DEFAULT 0,
    "commentsToday" INTEGER NOT NULL DEFAULT 0,
    "lastPostReset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastCommentReset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" TIMESTAMP(3),
    "isLoggedIn" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth.users" (
    "id" UUID NOT NULL,
    "email" TEXT,

    CONSTRAINT "auth.users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_steamId_key" ON "users"("steamId");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_id_fkey" FOREIGN KEY ("id") REFERENCES "auth.users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
