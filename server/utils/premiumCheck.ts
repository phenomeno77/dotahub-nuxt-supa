import { UserProfile } from "@prisma/client";
import prisma from "~/lib/prisma";

export const checkAndUpdatePremiumStatus = async (user: UserProfile) => {
  if (
    user.isPremium &&
    user.premiumExpiresAt &&
    new Date() > user.premiumExpiresAt
  ) {
    await prisma.userProfile.update({
      where: { id: user.id },
      data: {
        isPremium: false,
        premiumExpiresAt: null,
      },
    });
  }
};
