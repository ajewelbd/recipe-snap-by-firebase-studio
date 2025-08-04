
'use client';

import { useState, useContext, useEffect } from 'react';
import type { SuggestRecipesOutput } from '@/ai/flows/suggest-recipes';
import { suggestRecipes } from '@/ai/flows/suggest-recipes';
import { generateRecipeImage } from '@/ai/flows/generate-recipe-image';

import Header from '@/components/chefmate/header';
import IngredientEditor from '@/components/chefmate/ingredient-editor';
import { useToast } from '@/hooks/use-toast';
import { LanguageContext, content } from '@/context/language-context';
import { useAuth } from '@/context/auth-context';
import RecipeGrid from '@/components/chefmate/recipe-grid';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import RecipeFilters from '@/components/chefmate/recipe-filters';

// Define a new type for the recipe that includes the optional imageUrl
export type RecipeWithImage = SuggestRecipesOutput['recipes'][0] & {
  imageUrl?: string;
};

const GUEST_SEARCH_LIMIT = 3;

export default function Home() {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<RecipeWithImage[]>([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);
  const { toast } = useToast();
  const { language } = useContext(LanguageContext);
  const t = content[language];
  const { user } = useAuth();
  const [remainingSearches, setRemainingSearches] = useState(GUEST_SEARCH_LIMIT);

  useEffect(() => {
    if (!user) {
      try {
        const storedCount = localStorage.getItem('guestRecipeSearches');
        if (storedCount !== null) {
          setRemainingSearches(parseInt(storedCount, 10));
        } else {
          localStorage.setItem('guestRecipeSearches', String(GUEST_SEARCH_LIMIT));
          setRemainingSearches(GUEST_SEARCH_LIMIT);
        }
      } catch (error) {
        console.error("Could not access localStorage. Guest search limit will not work.", error);
        setRemainingSearches(GUEST_SEARCH_LIMIT); // Fallback
      }
    }
  }, [user]);
  
  const generateImagesInBackground = (recipes: RecipeWithImage[]) => {
    recipes.forEach((recipe, index) => {
      (async () => {
        try {
          const imageResult = await generateRecipeImage({ prompt: recipe.imageGenerationPrompt });
          // Update the specific recipe in the state with the new image URL
          setRecipes(currentRecipes => {
            const newRecipes = [...currentRecipes];
            newRecipes[index] = { ...newRecipes[index], imageUrl: imageResult.imageUrl };
            return newRecipes;
          });
        } catch (error) {
          console.error(`Error generating image for recipe "${recipe.name}":`, error);
          // Optionally, you could set an error state or a default fallback image URL here
        }
      })();
    });
  };

  const handleGetRecipes = async () => {
    if (ingredients.length === 0) return;
    
    if (!user) {
      if (remainingSearches <= 0) {
        toast({
          variant: 'destructive',
          title: t.toast.limit.title,
          description: t.toast.limit.description,
        });
        return;
      }
    }

    setIsLoadingRecipes(true);
    setRecipes([]); // Clear previous recipes
    try {
      const result = await suggestRecipes({ ingredients: ingredients, language });
      setRecipes(result.recipes);
      generateImagesInBackground(result.recipes); // Start generating images
      
      if (!user) {
         // Decrement and save for guest users
         try {
            const newCount = remainingSearches - 1;
            setRemainingSearches(newCount);
            localStorage.setItem('guestRecipeSearches', String(newCount));
         } catch (error) {
            console.error("Could not access localStorage to update search count.", error);
         }
      }

    } catch (error) {
      console.error('Error suggesting recipes:', error);
      toast({
        variant: 'destructive',
        title: t.toast.error.title,
        description: t.toast.error.recipes,
      });
    } finally {
      setIsLoadingRecipes(false);
    }
  };

  const getRecipesDisabled = ingredients.length === 0 || isLoadingRecipes || (remainingSearches !== undefined && remainingSearches <= 0);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:px-6 md:py-8">
        <div className="max-w-2xl mx-auto w-full space-y-8">
          <IngredientEditor
            ingredients={ingredients}
            setIngredients={setIngredients}
            isLoading={isLoadingRecipes}
          />
          <Button 
            onClick={handleGetRecipes} 
            disabled={getRecipesDisabled} 
            className="w-full h-12 text-lg rounded-full"
            size="lg"
          >
            {isLoadingRecipes ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {t.ingredients.loading}
              </>
            ) : (
              t.ingredients.getButton
            )}
          </Button>

          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-2xl font-bold">{t.recipes.title}</h2>
              <RecipeFilters />
            </div>
            <RecipeGrid 
              recipes={recipes} 
              isLoading={isLoadingRecipes} 
              userIngredients={ingredients}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
