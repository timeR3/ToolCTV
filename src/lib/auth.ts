import type { User } from '@/types';

// In a real application, this would involve session management, JWTs, etc.
// For this demo, we'll use a hardcoded user.
// You can change the role to 'User', 'Admin', or 'Superadmin' to test permissions.
const MOCK_USER: User = {
  id: 'user-1',
  name: 'Admin User',
  email: 'admin@toolbox.pro',
  avatar: 'https://placehold.co/100x100.png',
  role: 'Admin', 
};

export async function getCurrentUser(): Promise<User> {
  // Simulate an async operation
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(MOCK_USER);
    }, 100);
  });
}
