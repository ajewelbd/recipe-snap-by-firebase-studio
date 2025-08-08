
'use client';
import Header from '@/components/chefmate/header';
import RecipeDetail from '@/components/chefmate/recipe-detail';
import { useAuth } from '@/context/auth-context';
import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RecipeDetailPage() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

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
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <RecipeDetail recipeId={id} />
      </main>
    </div>
  );
}
