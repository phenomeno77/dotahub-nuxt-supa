export function getBanExpiration(duration: string): Date | null {
  const now = new Date();

  switch (duration) {
    case "1h":
      return new Date(now.getTime() + 1 * 60 * 60 * 1000);
    case "6h":
      return new Date(now.getTime() + 6 * 60 * 60 * 1000);
    case "12h":
      return new Date(now.getTime() + 12 * 60 * 60 * 1000);
    case "1d":
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case "3d":
      return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    case "1w":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case "perm":
      return null;
    default:
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid ban duration",
      });
  }
}
