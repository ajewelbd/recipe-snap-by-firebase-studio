
'use client';

import { useState, useContext, useEffect } from 'react';
import type { SuggestRecipesOutput } from '@/ai/flows/suggest-recipes';
import { suggestRecipes } from '@/ai/flows/suggest-recipes';
import { generateRecipeImage } from '@/ai/flows/generate-recipe-image';
import { supabase } from '@/lib/supabase/client';

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

export type FilterType = 'cuisine' | 'diet' | 'time';
export type FilterValues = {
  cuisine: string;
  diet: string;
  time: string;
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
  const [lastImageUrl, setLastImageUrl] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterValues>({ cuisine: '', diet: '', time: '' });

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
  
  const saveSearchToHistory = async (searchIngredients: string[], foundRecipes: RecipeWithImage[], imageUrl?: string | null) => {
    if (!user) return; // Only save history for logged-in users
    try {
        const { error } = await supabase.from('history').insert({
            user_id: user.id,
            ingredients: searchIngredients,
            recipes: foundRecipes,
            image_url: imageUrl
        });
        if (error) throw error;
    } catch (error) {
        console.error("Error saving search to history:", error);
    }
  }


  const generateImagesInBackground = (recipesToUpdate: RecipeWithImage[]) => {
    recipesToUpdate.forEach((recipe, index) => {
      // Skip if image already exists
      if (recipe.imageUrl) return;

      (async () => {
        try {
          const imageResult = await generateRecipeImage({ prompt: recipe.imageGenerationPrompt });
          // Update the specific recipe in the state with the new image URL
          setRecipes(currentRecipes => {
            const newRecipes = [...currentRecipes];
            // Find the recipe in the current state to update, in case the order has changed
            const recipeIndex = newRecipes.findIndex(r => r.name === recipe.name);
            if (recipeIndex !== -1) {
              newRecipes[recipeIndex] = { ...newRecipes[recipeIndex], imageUrl: imageResult.imageUrl };
            }
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
      const result = await suggestRecipes({ 
        ingredients: ingredients, 
        language,
        cuisine: filters.cuisine && filters.cuisine !== 'any' ? filters.cuisine : undefined,
        diet: filters.diet && filters.diet !== 'any' ? filters.diet : undefined,
        time: filters.time && filters.time !== 'any' ? filters.time : undefined
      });
      
      const recipesWithImagePlaceholder = result.recipes.map(r => ({...r, imageUrl: undefined}));
      setRecipes(recipesWithImagePlaceholder);
      
      generateImagesInBackground(recipesWithImagePlaceholder); // Start generating images
      
      if (user) {
        await saveSearchToHistory(ingredients, result.recipes, lastImageUrl);
      } else {
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
      setLastImageUrl(null); // Reset after search
    }
  };

  const handleFilterChange = (filterType: FilterType, value: string) => {
    setFilters(prev => ({...prev, [filterType]: value}));
  }

  const getRecipesDisabled = ingredients.length === 0 || isLoadingRecipes || (!user && remainingSearches <= 0);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:px-6 md:py-8">
        <div className="max-w-2xl mx-auto w-full space-y-8">
          <IngredientEditor
            ingredients={ingredients}
            setIngredients={setIngredients}
            isLoading={isLoadingRecipes}
            setLastImageUrl={setLastImageUrl}
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
          {!user && (
            <p className="text-sm text-center text-muted-foreground">
              {t.ingredients.searchesLeft(remainingSearches)} <span className="underline">{t.ingredients.loginForMore}</span>
            </p>
          )}

          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-2xl font-bold">{t.recipes.title}</h2>
              <RecipeFilters onFilterChange={handleFilterChange} filters={filters} />
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
