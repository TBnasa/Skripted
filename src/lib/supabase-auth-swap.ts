import { SignJWT, importJWK } from 'jose';

/**
 * Sweets Clerk JWT for Supabase by re-signing it with the Supabase JWT Secret.
 * This resolves issues where Supabase expects a different signing key (e.g. ECC vs HS256)
 * or specific claims (aud: authenticated).
 */
export async function swapClerkTokenForSupabase(clerkUserId: string) {
  const secret = process.env.SUPABASE_JWT_SECRET;
  
  if (!secret) {
    console.error('[AuthSwap] SUPABASE_JWT_SECRET is missing in environment variables.');
    return null;
  }

  // Supabase expects HS256 for the shared secret
  const encoder = new TextEncoder();
  const secretKey = encoder.encode(secret);

  const payload = {
    aud: 'authenticated',
    role: 'authenticated',
    sub: clerkUserId,
    userId: clerkUserId, // Some RLS might use this
    exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
    iat: Math.floor(Date.now() / 1000),
  };

  try {
    const jwt = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .sign(secretKey);
    
    return jwt;
  } catch (error) {
    console.error('[AuthSwap] Failed to sign Supabase token:', error);
    return null;
  }
}
