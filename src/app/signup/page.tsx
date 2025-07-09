import Link from 'next/link';
import { AuthForm } from '@/components/auth/auth-forms';
import { KalaConnectLogo } from '@/components/icons';

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center">
            <Link href="/" className="flex items-center gap-2 mb-4">
                <KalaConnectLogo className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold font-headline">Join KalaConnect</h1>
            </Link>
          <p className="text-muted-foreground">Create your account to start your journey.</p>
        </div>
        <AuthForm type="signup" />
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
