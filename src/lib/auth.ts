import type { User } from '@/types';
import { getUsers } from './data';

// In a real application, this would involve session management, JWTs, etc.
// For this demo, we'll use a hardcoded user id and fetch the user from our mock data.
// You can change the role to 'User', 'Admin', or 'Superadmin' to test permissions.
const MOCK_USER_ID = 'user-1';

export async function getCurrentUser(): Promise<User> {
  // Simulate an async operation
  const users = await getUsers();
  const user = users.find(u => u.id === MOCK_USER_ID);
  if (!user) {
    throw new Error("Current user not found");
  }
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(user);
    }, 50);
  });
}
