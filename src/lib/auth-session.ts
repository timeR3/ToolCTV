'use server';

import { cookies } from 'next/headers';
import * as jose from 'jose';
import type { User } from '@/types';

const secret = new TextEncoder().encode(process.env.AUTH_SECRET || 'default-secret-key-that-is-long-enough');
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
        return null;
    }
}

export async function getSession() {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) return null;
    return await decrypt(sessionCookie);
}
