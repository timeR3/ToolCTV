import { LoginForm } from './login-form';
import { getCurrentUser } from '@/lib/auth-db';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) {
    // Si el usuario ya está logeado, redirigir al dashboard
    redirect('/');
  }

  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <LoginForm />
    </div>
  );
}
