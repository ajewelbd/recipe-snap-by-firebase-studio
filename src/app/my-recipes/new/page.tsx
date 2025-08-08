
'use client';
import Header from '@/components/chefmate/header';
import NewRecipeForm from '@/components/chefmate/new-recipe-form';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useContext } from 'react';
import { LanguageContext, content } from '@/context/language-context';

export default function NewRecipePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { language } = useContext(LanguageContext);
  const t = content[language].newRecipe;

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
                <p>{t.loading}</p>
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
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold font-headline text-primary mb-6">{t.createTitle}</h1>
            <NewRecipeForm />
        </div>
      </main>
    </div>
  );
}
