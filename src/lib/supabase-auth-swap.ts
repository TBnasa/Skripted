import { SignJWT } from 'jose';

export async function swapClerkTokenForSupabase(clerkUserId: string) {
  const secret = process.env.SUPABASE_JWT_SECRET;
  
  if (!secret) {
    console.error('[AuthSwap] SUPABASE_JWT_SECRET is missing!');
    return null;
  }

  try {
    const encoder = new TextEncoder();
    const secretKey = encoder.encode(secret);

    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + (24 * 60 * 60); // 24 hours to be safe

    const payload = {
      aud: 'authenticated',
      role: 'authenticated',
      sub: clerkUserId,
      iat,
      exp,
    };

    // Use minimum protected header
    const jwt = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .sign(secretKey);
    
    return jwt;
  } catch (error) {
    console.error('[AuthSwap] Signing failed:', error);
    throw error; // Rethrow to let the API catch it
  }
}
