'use client';

import { useState, useContext } from 'react';
import type { AnalyzeImageIngredientsOutput } from '@/ai/flows/analyze-image-ingredients';
import type { SuggestRecipesOutput } from '@/ai/flows/suggest-recipes';
import { analyzeImageIngredients } from '@/ai/flows/analyze-image-ingredients';
import { suggestRecipes } from '@/ai/flows/suggest-recipes';
import { generateRecipeSpeech } from '@/ai/flows/generate-recipe-speech';

import Header from '@/components/recipe-snap/header';
import ImageUploader from '@/components/recipe-snap/image-uploader';
import IngredientEditor from '@/components/recipe-snap/ingredient-editor';
import RecipeDisplay from '@/components/recipe-snap/recipe-display';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { LanguageContext, content } from '@/context/language-context';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/auth-context';
import type { User } from '@supabase/supabase-js';

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

export default function Home() {
  const [image, setImage] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<AnalyzeImageIngredientsOutput['ingredients']>([]);
  const [recipes, setRecipes] = useState<SuggestRecipesOutput['recipes']>([]);
  const [isLoadingIngredients, setIsLoadingIngredients] = useState(false);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);
  const { toast } = useToast();
  const { language } = useContext(LanguageContext);
  const t = content[language];
  const { user } = useAuth();

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

  const handleRemoveImage = () => {
    setImage(null);
    setIngredients([]);
    setRecipes([]);
  }

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
        title: t.toast.error.title,
        description: t.toast.error.analyze,
      });
    } finally {
      setIsLoadingIngredients(false);
    }
  };

  const saveHistoryInBackground = async (
    currentUser: User, 
    imageData: string, 
    recipeData: SuggestRecipesOutput,
    currentIngredients: string[],
  ) => {
    try {
      // 1. Upload image to Supabase Storage
      const file = dataURIToBlob(imageData);
      const filePath = `history/${currentUser.id}/${new Date().toISOString()}`;
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
      
      const imageUrl = urlData.publicUrl;

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

  const handleGetRecipes = async () => {
    if (ingredients.length === 0) return;
    setIsLoadingRecipes(true);
    try {
      const result = await suggestRecipes({ ingredients, language });
      setRecipes(result.recipes);
      
      if (user && image) {
        // Don't wait for this to complete. Let it run in the background.
        saveHistoryInBackground(user, image, result, ingredients);
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
            />

            <IngredientEditor
              ingredients={ingredients}
              setIngredients={setIngredients}
              onGetRecipes={handleGetRecipes}
              isLoading={isLoadingRecipes}
              isImageLoading={isLoadingIngredients}
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
