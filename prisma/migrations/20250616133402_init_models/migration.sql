/*
  Warnings:

  - The primary key for the `user_profile` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Made the column `updatedAt` on table `user_profile` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "user_profile" DROP CONSTRAINT "user_profile_pkey",
ADD COLUMN     "password" TEXT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "premiumExpiresAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "lastPostReset" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "lastCommentReset" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "lastLoginAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updatedAt" SET NOT NULL,
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "user_profile_pkey" PRIMARY KEY ("id");

-- CreateTable
CREATE TABLE "posts" (
    "id" SERIAL NOT NULL,
    "partySize" INTEGER NOT NULL,
    "positionsNeeded" "Position"[],
    "minRank" "Rank" NOT NULL,
    "maxRank" "Rank" NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "postComment" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "postId" INTEGER NOT NULL,

    CONSTRAINT "postComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ban_history" (
    "id" SERIAL NOT NULL,
    "reason" TEXT NOT NULL,
    "bannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "banExpiration" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "bannedById" TEXT,

    CONSTRAINT "ban_history_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postComment" ADD CONSTRAINT "postComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "postComment" ADD CONSTRAINT "postComment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ban_history" ADD CONSTRAINT "ban_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ban_history" ADD CONSTRAINT "ban_history_bannedById_fkey" FOREIGN KEY ("bannedById") REFERENCES "user_profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
