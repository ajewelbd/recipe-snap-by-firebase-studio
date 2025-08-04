'use client';
import Header from '@/components/chefmate/header';
import NewRecipeForm from '@/components/chefmate/new-recipe-form';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function NewRecipePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container mx-auto p-4 md:p-8 flex items-center justify-center">
                <p>Loading...</p>
            </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold font-headline text-primary mb-6">Create New Recipe</h1>
            <NewRecipeForm />
        </div>
      </main>
    </div>
  );
}
