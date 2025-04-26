'use client';

import { LoaderIcon } from '@/components/icons';

import { Button } from './ui/button';

export function SubmitButton({
  children,
  isSuccessful,
  isPending,
}: {
  children: React.ReactNode;
  isSuccessful: boolean;
  isPending: boolean;
}) {
  return (
    <Button
      type={isPending ? 'button' : 'submit'}
      aria-disabled={isPending || isSuccessful}
      disabled={isPending || isSuccessful}
      className="relative"
    >
      {children}

      {(isPending || isSuccessful) && (
        <span className="animate-spin absolute right-4">
          <LoaderIcon />
        </span>
      )}

      <output aria-live="polite" className="sr-only">
        {isPending || isSuccessful ? 'Loading' : 'Submit form'}
      </output>
    </Button>
  );
}
