
'use client';

import { useState, useContext } from 'react';
import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type RecipeWithImage } from '@/app/page';
import VideoSuggestions from './video-suggestions';
import { LanguageContext, content } from '@/context/language-context';
import { Button } from '../ui/button';
import { Loader2, Volume2, Soup } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';


interface RecipeDisplayProps {
  recipes: RecipeWithImage[];
  onGetSpeech: (text: string) => Promise<string | null>;
}

export default function RecipeDisplay({ recipes, onGetSpeech }: RecipeDisplayProps) {
  const { language } = useContext(LanguageContext);
  const t = content[language];
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loadingAudio, setLoadingAudio] = useState<string | null>(null);
  const [activeRecipe, setActiveRecipe] = useState<string | null>(null);


  const handleListen = async (recipeName: string, text: string) => {
    setLoadingAudio(recipeName);
    setAudioUrl(null);
    const url = await onGetSpeech(text);
    setAudioUrl(url);
    setLoadingAudio(null);
  };

  const getRecipeName = (recipe: RecipeWithImage) => {
    if (language === 'bn') {
      return recipe.name_bn || recipe.name;
    }
    return recipe.name_en || recipe.name;
  };

  const getRecipeInstructions = (recipe: RecipeWithImage) => {
    if (language === 'bn') {
      return recipe.instructions_bn || recipe.instructions;
    }
    return recipe.instructions_en || recipe.instructions;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.recipes.title}</CardTitle>
        <CardDescription>{t.recipes.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {recipes.length > 0 ? (
          <Accordion type="single" collapsible className="w-full" onValueChange={(value) => setActiveRecipe(value)}>
            {recipes.map((recipe, index) => {
                const recipeName = getRecipeName(recipe);
                const recipeInstructions = getRecipeInstructions(recipe);

                return (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="font-headline text-lg hover:no-underline text-left">{recipeName}</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  
                  {recipe.imageUrl ? (
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden border shadow-sm bg-muted">
                        <Image src={recipe.imageUrl} alt={recipeName} fill className="object-cover" data-ai-hint="recipe food" />
                    </div>
                  ) : (
                    <Skeleton className="w-full aspect-video rounded-lg" />
                  )}

                  <div className="flex flex-wrap items-start gap-4">
                    <p className="whitespace-pre-wrap text-foreground/80 flex-grow pt-2">{recipeInstructions}</p>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handleListen(recipeName, recipeInstructions)}
                      disabled={loadingAudio === recipeName}
                      aria-label={t.recipes.listen}
                      className="shrink-0"
                    >
                      {loadingAudio === recipeName ? <Loader2 className="animate-spin" /> : <Volume2 />}
                    </Button>
                  </div>
                  
                  {loadingAudio === recipeName && !audioUrl && (
                    <Skeleton className="h-12 w-full" />
                  )}

                  {audioUrl && loadingAudio !== recipeName && activeRecipe === `item-${index}` && (
                    <div className="w-full">
                        <audio controls src={audioUrl} className="w-full">
                            Your browser does not support the audio element.
                        </audio>
                    </div>
                  )}

                  <div className="space-y-4 pt-4">
                    <Separator />
                     <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <h4 className="font-semibold font-headline flex items-center gap-2">
                          <Soup />
                          {t.recipes.nutrition}
                        </h4>
                        <Badge variant="outline">{t.recipes.servingSize}: {recipe.nutrition.servingSize}</Badge>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div className="bg-muted p-3 rounded-lg text-center">
                            <p className="font-semibold">{recipe.nutrition.calories.value} {recipe.nutrition.calories.unit}</p>
                            <p className="text-muted-foreground">{t.recipes.calories}</p>
                        </div>
                        <div className="bg-muted p-3 rounded-lg text-center">
                            <p className="font-semibold">{recipe.nutrition.protein.value} {recipe.nutrition.protein.unit}</p>
                            <p className="text-muted-foreground">{t.recipes.protein}</p>
                        </div>
                        <div className="bg-muted p-3 rounded-lg text-center">
                            <p className="font-semibold">{recipe.nutrition.carbs.value} {recipe.nutrition.carbs.unit}</p>
                            <p className="text-muted-foreground">{t.recipes.carbs}</p>
                        </div>
                        <div className="bg-muted p-3 rounded-lg text-center">
                            <p className="font-semibold">{recipe.nutrition.fat.value} {recipe.nutrition.fat.unit}</p>
                            <p className="text-muted-foreground">{t.recipes.fat}</p>
                        </div>
                      </div>
                  </div>


                  <VideoSuggestions searchQuery={recipe.youtubeSearchQuery} />
                </AccordionContent>
              </AccordionItem>
            )})}
          </Accordion>
        ) : (
          <p className="text-muted-foreground text-center py-8">{t.recipes.empty}</p>
        )}
      </CardContent>
    </Card>
  );
}
