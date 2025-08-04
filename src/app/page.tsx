
'use client';

import { useState, useContext, useEffect } from 'react';
import type { AnalyzeImageIngredientsOutput } from '@/ai/flows/analyze-image-ingredients';
import type { SuggestRecipesOutput } from '@/ai/flows/suggest-recipes';
import { analyzeImageIngredients } from '@/ai/flows/analyze-image-ingredients';
import { suggestRecipes } from '@/ai/flows/suggest-recipes';
import { generateRecipeSpeech } from '@/ai/flows/generate-recipe-speech';
import { generateRecipeImage } from '@/ai/flows/generate-recipe-image';

import Header from '@/components/chefmate/header';
import ImageUploader from '@/components/chefmate/image-uploader';
import IngredientEditor from '@/components/chefmate/ingredient-editor';
import RecipeDisplay from '@/components/chefmate/recipe-display';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { LanguageContext, content } from '@/context/language-context';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/auth-context';
import type { User } from '@supabase/supabase-js';

// Define a new type for the recipe that includes the optional imageUrl
export type RecipeWithImage = SuggestRecipesOutput['recipes'][0] & {
  imageUrl?: string;
};

// Helper to convert data URI to a Blob
const dataURIToBlob = (dataURI: string) => {
  const splitDataURI = dataURI.split(',');
  const byteString = splitDataURI[0].indexOf('base64') >= 0 ? atob(splitDataURI[1]) : decodeURI(splitDataURI[1]);
  const mimeString = splitDataURI[0].split(':')[1].split(';')[0];
  const ia = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ia], { type: mimeString });
}

const GUEST_SEARCH_LIMIT = 3;

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [imageSource, setImageSource] = useState<'file' | 'camera' | null>(null);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<RecipeWithImage[]>([]);
  const [isLoadingIngredients, setIsLoadingIngredients] = useState(false);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);
  const [analysisPerformed, setAnalysisPerformed] = useState(false);
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

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      setImageSource('file');
      setIngredients([]);
      setRecipes([]);
      setAnalysisPerformed(false);
    };
    reader.readAsDataURL(file);
  };

  const handleImageCapture = (dataUri: string) => {
    setImage(dataUri);
    setImageSource('camera');
    setIngredients([]);
    setRecipes([]);
    setAnalysisPerformed(false);
  };

  const handleRemoveImage = () => {
    setImage(null);
    setImageSource(null);
    setIngredients([]);
    setRecipes([]);
    setAnalysisPerformed(false);
  }

  const handleAnalyzeImage = async () => {
    if (!image) return;
    setIsLoadingIngredients(true);
    setRecipes([]);
    setAnalysisPerformed(false); 
    try {
      const result = await analyzeImageIngredients({ photoDataUri: image });
      setIngredients(result.ingredients);
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast({
        variant: 'destructive',
        title: t.toast.error.title,
        description: t.toast.error.analyze,
      });
    } finally {
      setIsLoadingIngredients(false);
      setAnalysisPerformed(true);
    }
  };

  const saveHistoryInBackground = async (
    currentUser: User, 
    imageData: string | null, 
    recipeData: SuggestRecipesOutput,
    currentIngredients: string[],
  ) => {
    try {
      let imageUrl: string | null = null;
      if (imageData) {
        // 1. Upload image to Supabase Storage if it exists
        const file = dataURIToBlob(imageData);
        const filePath = `public/${currentUser.id}/${new Date().toISOString()}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('history-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type,
          });

        if (uploadError) throw uploadError;

        // 2. Get public URL for the uploaded image
        const { data: urlData } = supabase.storage
          .from('history-images')
          .getPublicUrl(uploadData.path);
        
        imageUrl = urlData.publicUrl;
      }

      // 3. Save history to Supabase database
      const { error: dbError } = await supabase.from('history').insert({
        user_id: currentUser.id,
        image_url: imageUrl,
        ingredients: currentIngredients,
        recipes: recipeData.recipes,
      });

      if (dbError) throw dbError;

    } catch (supabaseError) {
      console.error("Error saving to Supabase in background:", supabaseError);
      // Non-blocking error - we don't want to hang the UI
      // But we can inform the user if something went wrong
      toast({
        variant: 'destructive',
        title: 'Database Error',
        description: 'Failed to save recipe to your history. Your recipes are still available to view.',
      });
    }
  };

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
    try {
      const result = await suggestRecipes({ ingredients: ingredients, language });
      setRecipes(result.recipes);
      generateImagesInBackground(result.recipes); // Start generating images
      
      if (user) {
        // Don't wait for this to complete. Let it run in the background.
        saveHistoryInBackground(user, image, result, ingredients);
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
    }
  };

  const handleGetSpeech = async (text: string) => {
    try {
      const result = await generateRecipeSpeech({ text });
      return result.audioDataUri;
    } catch (error) {
      console.error('Error generating speech:', error);
      toast({
        variant: 'destructive',
        title: t.toast.error.title,
        description: t.toast.error.speech,
      });
      return null;
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
              onRemove={handleRemoveImage}
              isLoading={isLoadingIngredients}
              imagePreview={image}
              imageSource={imageSource}
            />

            <IngredientEditor
              ingredients={ingredients}
              setIngredients={setIngredients}
              onGetRecipes={handleGetRecipes}
              isLoading={isLoadingRecipes}
              isImageLoading={isLoadingIngredients}
              analysisPerformed={analysisPerformed}
              remainingSearches={user ? undefined : remainingSearches}
            />
          </div>
          <div className="lg:mt-0">
            {isLoadingRecipes ? (
               <Card>
                <CardHeader>
                  <CardTitle>{t.recipes.title}</CardTitle>
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
              (recipes.length > 0 || isLoadingRecipes) && <RecipeDisplay recipes={recipes} onGetSpeech={handleGetSpeech} />
            )}
            
            {!isLoadingRecipes && recipes.length === 0 && ingredients.length > 0 && (
                 <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
                    <CardHeader>
                        <CardTitle>{t.recipes.ready}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{t.recipes.prompt}</p>
                    </CardContent>
                </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
