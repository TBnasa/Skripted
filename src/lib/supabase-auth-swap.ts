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
    console.error('[AuthSwap] Critical: SUPABASE_JWT_SECRET environment variable is missing!');
    return null;
  }

  try {
    const supabaseRef = supabaseUrl.split('.')[0].replace('https://', '');
    const encoder = new TextEncoder();
    
    // Most Supabase JWT secrets are provided as a string, 
    // but some environments might expect them to be decoded if they are base64.
    // We try to handle both or just use the literal string which is Supabase default.
    let secretKey: Uint8Array;
    
    // Check if it's a base64 string (often 88 chars for 64 bytes)
    if (secret.length > 40 && /^[a-zA-Z0-9+/]*={0,2}$/.test(secret)) {
       try {
         // Attempt to decode base64 - if it fails, fallback to raw string
         const binaryString = atob(secret);
         secretKey = new Uint8Array(binaryString.length);
         for (let i = 0; i < binaryString.length; i++) {
           secretKey[i] = binaryString.charCodeAt(i);
         }
       } catch {
         secretKey = encoder.encode(secret);
       }
    } else {
      secretKey = encoder.encode(secret);
    }

    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + (60 * 60); // 1 hour

    const payload = {
      aud: 'authenticated',
      role: 'authenticated',
      sub: clerkUserId,
      userId: clerkUserId,
      iss: 'supabase',
      ref: supabaseRef,
      iat,
      exp,
    };

    const jwt = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .sign(secretKey);
    
    return jwt;
  } catch (error) {
    console.error('[AuthSwap] Signing failed:', error);
    return null;
  }
}
