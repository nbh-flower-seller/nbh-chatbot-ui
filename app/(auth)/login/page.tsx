'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { toast } from '@/components/toast';

import { AuthForm } from '@/components/auth-form';
import { SubmitButton } from '@/components/submit-button';

import { login, type LoginActionState } from '../actions';

export default function Page() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [email, setEmail] = useState('');
  const [result, setResult] = useState<LoginActionState | null>(null);
  const [isSuccessful, setIsSuccessful] = useState(false);

  useEffect(() => {
    if (!result) return;

    if (result.status === 'failed') {
      toast({
        type: 'error',
        description: 'Invalid credentials!',
      });
    } else if (result.status === 'invalid_data') {
      toast({
        type: 'error',
        description: 'Failed validating your submission!',
      });
    } else if (result.status === 'success') {
      setIsSuccessful(true);
      router.refresh();
    }

    // Reset result after handling
    setResult(null);
  }, [result, router]);

  const handleSubmit = (formData: FormData) => {
    setEmail(formData.get('email') as string);
    startTransition(async () => {
      // Pass initial state (null or equivalent) as the first arg if your server action expects it
      // If `login` action was modified for useActionState to NOT take the state as first arg, adjust here.
      // Assuming the `login` action still expects a state argument (even if unused)
      const actionResult = await login({ status: 'idle' } /* initial state */, formData);
      setResult(actionResult);
    });
  };

  return (
    <div className="flex h-dvh w-screen items-start pt-12 md:pt-0 md:items-center justify-center bg-background">
      <div className="w-full max-w-md overflow-hidden rounded-2xl flex flex-col gap-12">
        <div className="flex flex-col items-center justify-center gap-2 px-4 text-center sm:px-16">
          <h3 className="text-xl font-semibold dark:text-zinc-50">Sign In</h3>
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Use your email and password to sign in
          </p>
        </div>
        {/* Pass isPending to SubmitButton if it accepts a loading prop */}
        <AuthForm action={handleSubmit} defaultEmail={email}>
          <SubmitButton isSuccessful={isSuccessful} isPending={isPending}>Sign in</SubmitButton>
          <p className="text-center text-sm text-gray-600 mt-4 dark:text-zinc-400">
            {"Don't have an account? "}
            <Link
              href="/register"
              className="font-semibold text-gray-800 hover:underline dark:text-zinc-200"
            >
              Sign up
            </Link>
            {' for free.'}
          </p>
        </AuthForm>
      </div>
    </div>
  );
}
