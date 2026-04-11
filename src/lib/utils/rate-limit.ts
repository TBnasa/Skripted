/**
 * Simple in-memory rate limiter.
 * In a production environment with multiple serverless instances, 
 * a centralized store like Redis (Upstash) should be used.
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitOptions {
  windowMs: number;
  max: number;
}

export function checkRateLimit(key: string, options: RateLimitOptions): { success: boolean; reset: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + options.windowMs });
    return { success: true, reset: now + options.windowMs };
  }

  if (entry.count >= options.max) {
    return { success: false, reset: entry.resetAt };
  }

  entry.count++;
  return { success: true, reset: entry.resetAt };
}
