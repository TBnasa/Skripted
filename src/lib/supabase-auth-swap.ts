import { SignJWT, importJWK } from 'jose';

/**
 * Sweets Clerk JWT for Supabase by re-signing it with the Supabase JWT Secret.
 * This resolves issues where Supabase expects a different signing key (e.g. ECC vs HS256)
 * or specific claims (aud: authenticated).
 */
export async function swapClerkTokenForSupabase(clerkUserId: string) {
  const secret = process.env.SUPABASE_JWT_SECRET;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  
  if (!secret) {
    console.error('[AuthSwap] SUPABASE_JWT_SECRET is missing. Check Vercel environment variables.');
    return null;
  }

  // Extract reference ID from Supabase URL (e.g. https://xyz.supabase.co -> xyz)
  const supabaseRef = supabaseUrl.split('.')[0].replace('https://', '');

  const encoder = new TextEncoder();
  const secretKey = encoder.encode(secret);

  const payload = {
    aud: 'authenticated', // Standard Supabase audience
    role: 'authenticated', // Standard Supabase role
    sub: clerkUserId,
    userId: clerkUserId,
    iss: 'supabase', // Match the Anon key issuer
    ref: supabaseRef, // Match the project reference
    exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour
    iat: Math.floor(Date.now() / 1000),
  };

  try {
    const jwt = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .sign(secretKey);
    
    return jwt;
  } catch (error) {
    console.error('[AuthSwap] Critical: Failed to sign Supabase token:', error);
    return null;
  }
}
