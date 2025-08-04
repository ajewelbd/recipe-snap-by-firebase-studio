
'use client';
import Header from '@/components/chefmate/header';
import MyRecipesList from '@/components/chefmate/my-recipes-list';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function MyRecipesPage() {
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
        <MyRecipesList />
      </main>
    </div>
  );
}
