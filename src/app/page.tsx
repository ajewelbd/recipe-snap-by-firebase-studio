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
import { getFirestoreInstance, getStorageInstance } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { useAuth } from '@/context/auth-context';

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

  const handleGetRecipes = async () => {
    if (ingredients.length === 0) return;
    setIsLoadingRecipes(true);
    try {
      const result = await suggestRecipes({ ingredients, language });
      setRecipes(result.recipes);
      
      // Save to Firebase in a separate try/catch to not block UI
      if (user && image) {
        try {
            const firestore = getFirestoreInstance();
            const storage = getStorageInstance();
            const storageRef = ref(storage, `history/${user.uid}/${new Date().toISOString()}`);
            await uploadString(storageRef, image, 'data_url');
            const imageUrl = await getDownloadURL(storageRef);

            await addDoc(collection(firestore, 'users', user.uid, 'history'), {
              imageUrl,
              ingredients,
              recipes: result.recipes,
              createdAt: serverTimestamp(),
            });
        } catch (firebaseError) {
            console.error("Error saving to Firebase:", firebaseError);
            toast({
                variant: 'destructive',
                title: 'Database Error',
                description: 'Failed to save recipe to your history. Your recipes are still available to view.',
            });
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
