interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up stale records periodically
setInterval(() => {
  const now = Date.now();
  rateLimitStore.forEach((value, key) => {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  });
}, 60000);

/**
 * Basic in-memory rate limiter for public submissions and authentication
 * @param identifier IP address or user ID
 * @param maxRequests Maximum requests allowed within window
 * @param windowMs Window in milliseconds (e.g. 60000 for 1 min)
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 20,
  windowMs: number = 60000
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    const newRecord: RateLimitRecord = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitStore.set(identifier, newRecord);
    return { success: true, remaining: maxRequests - 1, resetTime: newRecord.resetTime };
  }

  if (record.count >= maxRequests) {
    return { success: false, remaining: 0, resetTime: record.resetTime };
  }

  record.count += 1;
  return { success: true, remaining: maxRequests - record.count, resetTime: record.resetTime };
}

export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return req.headers.get('x-real-ip') || '127.0.0.1';
}
