
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/context/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { BookOpen, Camera, Clock, Calendar, Soup } from 'lucide-react';
import { format } from 'date-fns';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '../ui/carousel';
import type { AnalyzeRecipeNutritionOutput } from '@/ai/flows/analyze-recipe-nutrition';

interface Recipe {
  id: string;
  title: string;
  details: string;
  time_to_cook: string | null;
  featured_image_url: string | null;
  result_image_urls: string[] | null;
  tags: string[] | null;
  category: string | null;
  is_public: boolean;
  created_at: string;
  nutrition: AnalyzeRecipeNutritionOutput | null;
}

interface RecipeDetailProps {
  recipeId: string;
}

export default function RecipeDetail({ recipeId }: RecipeDetailProps) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!user || !recipeId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('my_recipies')
          .select('*')
          .eq('id', recipeId)
          .eq('user_id', user.id)
          .single();

        if (error) {
            if (error.code === 'PGRST116') { // "Not a single row was returned"
                console.warn('Recipe not found or access denied.');
                setRecipe(null);
            } else {
                throw error;
            }
        } else {
            setRecipe(data);
        }
      } catch (error) {
        console.error("Error fetching recipe:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecipe();
  }, [user, recipeId]);

  if (isLoading) {
    return <RecipeDetailSkeleton />;
  }

  if (!recipe) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold">Recipe Not Found</h1>
        <p className="text-muted-foreground">The recipe you are looking for does not exist or you do not have permission to view it.</p>
      </div>
    );
  }

  const { nutrition } = recipe;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
        <div>
            {recipe.category && <Badge variant="secondary">{recipe.category}</Badge>}
            <h1 className="text-4xl font-bold font-headline mt-2">{recipe.title}</h1>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mt-2">
                <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    <span>Created on {format(new Date(recipe.created_at), 'MMMM d, yyyy')}</span>
                </div>
                {recipe.time_to_cook && (
                    <div className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        <span>{recipe.time_to_cook}</span>
                    </div>
                )}
            </div>
        </div>
        
        {recipe.featured_image_url && (
             <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden shadow-lg">
                <Image src={recipe.featured_image_url} alt={recipe.title} fill className="object-cover" data-ai-hint="recipe food" />
            </div>
        )}

        <div className="prose prose-lg dark:prose-invert max-w-none">
            <h2 className="font-headline flex items-center gap-2"><BookOpen /> Details</h2>
            <p className="whitespace-pre-wrap">{recipe.details}</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
            {recipe.tags?.map((tag, i) => (
                <Badge key={i} variant="outline" className="text-sm">{tag}</Badge>
            ))}
        </div>

        {nutrition && (
            <div className="space-y-4 pt-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <h2 className="text-2xl font-bold font-headline flex items-center gap-2">
                    <Soup />
                    Nutritional Information
                </h2>
                <Badge variant="outline">Serving Size: {nutrition.servingSize}</Badge>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div className="bg-muted p-3 rounded-lg text-center">
                        <p className="font-semibold text-lg">{nutrition.calories.value} {nutrition.calories.unit}</p>
                        <p className="text-muted-foreground">Calories</p>
                    </div>
                    <div className="bg-muted p-3 rounded-lg text-center">
                        <p className="font-semibold text-lg">{nutrition.protein.value}{nutrition.protein.unit}</p>
                        <p className="text-muted-foreground">Protein</p>
                    </div>
                    <div className="bg-muted p-3 rounded-lg text-center">
                        <p className="font-semibold text-lg">{nutrition.carbs.value}{nutrition.carbs.unit}</p>
                        <p className="text-muted-foreground">Carbs</p>
                    </div>
                    <div className="bg-muted p-3 rounded-lg text-center">
                        <p className="font-semibold text-lg">{nutrition.fat.value}{nutrition.fat.unit}</p>
                        <p className="text-muted-foreground">Fat</p>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground text-center">Disclaimer: Nutritional information is an AI-generated estimate and should not be used for medical purposes.</p>
            </div>
        )}

        {recipe.result_image_urls && recipe.result_image_urls.length > 0 && (
            <div>
                 <h2 className="text-2xl font-bold font-headline mb-4 flex items-center gap-2"><Camera /> Final Results</h2>
                 <Carousel className="w-full" opts={{ align: "start", loop: true }}>
                    <CarouselContent>
                        {recipe.result_image_urls.map((url, index) => (
                        <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                            <div className="p-1">
                                <div className="relative aspect-square w-full rounded-lg overflow-hidden">
                                     <Image src={url} alt={`Result photo ${index + 1}`} fill className="object-cover" data-ai-hint="recipe food" />
                                </div>
                            </div>
                        </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                </Carousel>
            </div>
        )}
    </div>
  );
}

function RecipeDetailSkeleton() {
    return (
        <div className="max-w-4xl mx-auto animate-pulse space-y-8">
            <div>
                <Skeleton className="h-8 w-1/4 mb-2" />
                <Skeleton className="h-12 w-3/4 mb-4" />
                <Skeleton className="h-6 w-1/2" />
            </div>

            <Skeleton className="w-full aspect-[16/9] rounded-xl" />
            
            <div>
                <Skeleton className="h-8 w-1/4 mb-4" />
                <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-3/4" />
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-16" />
            </div>

             <div>
                <Skeleton className="h-8 w-1/3 mb-4" />
                 <div className="grid grid-cols-4 gap-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                </div>
            </div>
        </div>
    )
}
