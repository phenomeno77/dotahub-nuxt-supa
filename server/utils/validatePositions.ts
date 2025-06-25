// server/utils/validatePosition.ts
import { Position } from "@prisma/client";

const labelToEnumMap: Record<string, Position> = {
  carry: "carry",
  mid: "mid",
  offlane: "offlane",
  "soft support": "soft_support",
  "hard support": "hard_support",
};

export function parseAndValidatePositions(positions: string[]): Position[] {
  return positions.map((label) => {
    const mapped = labelToEnumMap[label];
    if (!mapped) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid position: ${label}`,
      });
    }
    return mapped;
  });
}
