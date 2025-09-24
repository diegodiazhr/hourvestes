
import { Suspense } from 'react';
import { RegisterFormWrapper } from '@/components/register-form-wrapper';
import { Loader2 } from 'lucide-react';

function RegisterPageLoading() {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
    );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterPageLoading />}>
      <RegisterFormWrapper />
    </Suspense>
  );
}
