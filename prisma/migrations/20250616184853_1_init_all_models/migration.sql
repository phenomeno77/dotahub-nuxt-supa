/*
  Warnings:

  - You are about to drop the `ban_history` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `postComment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `posts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_profile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ban_history" DROP CONSTRAINT "ban_history_bannedById_fkey";

-- DropForeignKey
ALTER TABLE "ban_history" DROP CONSTRAINT "ban_history_userId_fkey";

-- DropForeignKey
ALTER TABLE "postComment" DROP CONSTRAINT "postComment_postId_fkey";

-- DropForeignKey
ALTER TABLE "postComment" DROP CONSTRAINT "postComment_userId_fkey";

-- DropForeignKey
ALTER TABLE "posts" DROP CONSTRAINT "posts_userId_fkey";

-- DropTable
DROP TABLE "ban_history";

-- DropTable
DROP TABLE "postComment";

-- DropTable
DROP TABLE "posts";

-- DropTable
DROP TABLE "user_profile";

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "avatarUrl" TEXT,
    "steamId" TEXT,
    "password" TEXT,
    "isLoggedIn" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'user',
    "userStatus" "UserStatus" NOT NULL DEFAULT 'active',
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "premiumExpiresAt" TIMESTAMP(3),
    "postsToday" INTEGER NOT NULL DEFAULT 0,
    "commentsToday" INTEGER NOT NULL DEFAULT 0,
    "lastPostReset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastCommentReset" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Posts" (
    "id" SERIAL NOT NULL,
    "partySize" INTEGER NOT NULL,
    "positionsNeeded" "Position"[],
    "minRank" "Rank" NOT NULL,
    "maxRank" "Rank" NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostComments" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "postId" INTEGER NOT NULL,

    CONSTRAINT "PostComments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BanHistory" (
    "id" SERIAL NOT NULL,
    "reason" TEXT NOT NULL,
    "bannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "banExpiration" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "bannedById" TEXT,

    CONSTRAINT "BanHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_email_key" ON "UserProfile"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_steamId_key" ON "UserProfile"("steamId");

-- AddForeignKey
ALTER TABLE "Posts" ADD CONSTRAINT "Posts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostComments" ADD CONSTRAINT "PostComments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostComments" ADD CONSTRAINT "PostComments_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BanHistory" ADD CONSTRAINT "BanHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BanHistory" ADD CONSTRAINT "BanHistory_bannedById_fkey" FOREIGN KEY ("bannedById") REFERENCES "UserProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
