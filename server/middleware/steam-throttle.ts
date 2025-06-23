// server/middleware/steam-throttle.ts
export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event) || "unknown";
  const key = `rate-limit:steam:${ip}`;
  const store = useStorage("rate-limit");

  const count = (await store.getItem<number>(key)) || 0;
  if (count > 5) {
    throw createError({
      statusCode: 429,
      message: "Too many Steam login attempts. Try again later.",
    });
  }

  await store.setItem(key, count + 1, { maxAge: 60 }); // 5 per minute
});
