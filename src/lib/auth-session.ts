
'use server';

import 'dotenv/config';
import { cookies } from 'next/headers';
import * as jose from 'jose';
import { logDetailedError } from './error-logger';

const secretKey = process.env.AUTH_SECRET;
if (!secretKey) {
  throw new Error('AUTH_SECRET environment variable is not set. Please add it to your .env file.');
}
const secret = new TextEncoder().encode(secretKey);
const alg = 'HS256';

export async function encrypt(payload: any) {
  console.log('Encrypting payload:', payload);
  const token = await new jose.SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
  console.log('Encrypted token (first 20 chars):', token.substring(0, 20) + '...');
  return token;
}

export async function decrypt(input: string): Promise<any> {
    console.log('Attempting to decrypt input (first 20 chars):', input.substring(0, 20) + '...');
    try {
        const { payload } = await jose.jwtVerify(input, secret, {
            algorithms: [alg],
        });
        console.log('Decryption successful, payload:', payload);
        return payload;
    } catch (e: unknown) {
        logDetailedError('Session Decryption', e, { attemptedInput: input.substring(0, 50) + '...' });
        console.error('Decryption failed:', e);
        return null;
    }
}

export async function getSession() {
    const sessionCookie = (await cookies()).get('session')?.value;
    console.log('getSession - Session Cookie Found:', !!sessionCookie);
    if (!sessionCookie) return null;
    const session = await decrypt(sessionCookie);
    console.log('getSession - Decrypted Session (userId):', session?.userId || 'None');
    return session;
}
