'use client';

import { useState } from 'react';
import type { AnalyzeImageIngredientsOutput } from '@/ai/flows/analyze-image-ingredients';
import type { SuggestRecipesOutput } from '@/ai/flows/suggest-recipes';
import { analyzeImageIngredients } from '@/ai/flows/analyze-image-ingredients';
import { suggestRecipes } from '@/ai/flows/suggest-recipes';

import Header from '@/components/recipe-snap/header';
import ImageUploader from '@/components/recipe-snap/image-uploader';
import IngredientEditor from '@/components/recipe-snap/ingredient-editor';
import RecipeDisplay from '@/components/recipe-snap/recipe-display';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<AnalyzeImageIngredientsOutput['ingredients']>([]);
  const [recipes, setRecipes] = useState<SuggestRecipesOutput['recipes']>([]);
  const [isLoadingIngredients, setIsLoadingIngredients] = useState(false);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);
  const { toast } = useToast();

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      setIngredients([]);
      setRecipes([]);
    };
    reader.readAsDataURL(file);
  };

  const handleImageCapture = (dataUri: string) => {
    setImage(dataUri);
    setIngredients([]);
    setRecipes([]);
  };

  const handleAnalyzeImage = async () => {
    if (!image) return;
    setIsLoadingIngredients(true);
    setRecipes([]);
    try {
      const result = await analyzeImageIngredients({ photoDataUri: image });
      setIngredients(result.ingredients);
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Failed to analyze ingredients from the image.',
      });
    } finally {
      setIsLoadingIngredients(false);
    }
  };

  const handleGetRecipes = async () => {
    if (ingredients.length === 0) return;
    setIsLoadingRecipes(true);
    try {
      const result = await suggestRecipes({ ingredients });
      setRecipes(result.recipes);
    } catch (error) {
      console.error('Error suggesting recipes:', error);
      toast({
        variant: 'destructive',
        title: 'Uh oh! Something went wrong.',
        description: 'Failed to generate new recipes.',
      });
    } finally {
      setIsLoadingRecipes(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <div className="space-y-8">
            <ImageUploader
              onImageUpload={handleImageUpload}
              onImageCapture={handleImageCapture}
              onAnalyze={handleAnalyzeImage}
              isLoading={isLoadingIngredients}
              imagePreview={image}
            />
            {isLoadingIngredients ? (
              <Card>
                <CardHeader>
                  <CardTitle>Ingredients</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-4/5" />
                </CardContent>
              </Card>
            ) : (
              (image || ingredients.length > 0) && (
                <IngredientEditor
                  ingredients={ingredients}
                  setIngredients={setIngredients}
                  onGetRecipes={handleGetRecipes}
                  isLoading={isLoadingRecipes}
                />
              )
            )}
          </div>
          <div className="lg:mt-0">
            {isLoadingRecipes ? (
               <Card>
                <CardHeader>
                  <CardTitle>Suggested Recipes</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-4/5" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                </CardContent>
              </Card>
            ) : (
              (recipes.length > 0 || isLoadingRecipes) && <RecipeDisplay recipes={recipes} />
            )}
            
            {!isLoadingRecipes && recipes.length === 0 && ingredients.length > 0 && (
                 <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
                    <CardHeader>
                        <CardTitle>Ready to Cook?</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">Your delicious recipe suggestions will appear here once you click &quot;Get Recipes&quot;.</p>
                    </CardContent>
                </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
