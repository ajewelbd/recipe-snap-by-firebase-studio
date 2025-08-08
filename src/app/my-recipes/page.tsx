
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
        // Only redirect if loading is finished and there's no user.
        if (!loading && !user) {
            router.push('/');
        }
    }, [user, loading, router]);

    // Show a loading state while auth is being checked.
    if (loading) {
        return (
            <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow container mx-auto p-4 md:p-8 flex items-center justify-center">
                    <p>Loading...</p>
                </main>
            </div>
        );
    }

    // If loading is done and there's still no user, the effect will handle the redirect.
    // We can return null or a loading indicator to prevent rendering the main content.
    if (!user) {
      return null;
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
