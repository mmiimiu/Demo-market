import { Suspense } from 'react';
import { LandingPage } from '@/components/LandingPage';

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <LandingPage />
    </Suspense>
  );
}
