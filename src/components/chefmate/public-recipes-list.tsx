
'use client';

import { useState, useEffect, useContext } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import type { MyRecipe } from './my-recipes-list';
import SavedRecipeCard from './saved-recipe-card';
import { SavedRecipeDetailDialogProvider } from './saved-recipe-detail-dialog';
import { LanguageContext, content } from '@/context/language-context';

export default function PublicRecipesList() {
  const [recipes, setRecipes] = useState<MyRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { language } = useContext(LanguageContext);
  const t = content[language];


  useEffect(() => {
    const fetchRecipes = async () => {
      setIsLoading(true);
      try {
         const { data, error } = await supabase
          .rpc('get_public_recipes_with_interactions', { 
              request_user_id: user?.id ?? null
            })
          .order('created_at', { ascending: false })
          .limit(6);

        if (error) throw error;
        setRecipes(data || []);
      } catch (error) {
        console.error("Error fetching public recipes:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecipes();
  }, [user]);

  if (isLoading) {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold font-headline text-primary flex items-center gap-3">
                <Sparkles />
                {t.publicRecipes}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                   <Skeleton key={i} className="h-96 w-full" />
                ))}
            </div>
        </div>
    );
  }

  if (recipes.length === 0) {
    return null; // Don't render anything if there are no public recipes
  }

  return (
    <SavedRecipeDetailDialogProvider>
        <div className="space-y-6">
            <h2 className="text-3xl font-bold font-headline text-primary flex items-center gap-3">
                <Sparkles />
                {t.publicRecipes}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map(recipe => (
                <SavedRecipeCard 
                    key={recipe.id} 
                    recipe={recipe} 
                    isOwner={user?.id === recipe.user_id}
                />
            ))}
            </div>
        </div>
    </SavedRecipeDetailDialogProvider>
  );
}
