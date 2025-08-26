'use server';

import 'dotenv/config';
import { cookies } from 'next/headers';
import * as jose from 'jose';

const secretKey = process.env.AUTH_SECRET;
if (!secretKey) {
  throw new Error('AUTH_SECRET environment variable is not set. Please add it to your .env file.');
}
const secret = new TextEncoder().encode(secretKey);
const alg = 'HS256';

export async function encrypt(payload: any) {
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
}

export async function decrypt(input: string): Promise<any> {
    try {
        const { payload } = await jose.jwtVerify(input, secret, {
            algorithms: [alg],
        });
        return payload;
    } catch (e) {
        console.error('Decryption failed:', e);
        return null;
    }
}

export async function getSession() {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) return null;
    return await decrypt(sessionCookie);
}
