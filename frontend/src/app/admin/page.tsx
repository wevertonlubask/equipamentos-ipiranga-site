'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/admin/dashboard'); }, [router]);
  return <div className="min-h-screen bg-neutral-950 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" /></div>;
}
