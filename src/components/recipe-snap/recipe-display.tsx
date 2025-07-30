'use client';

import { useState, useContext } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { SuggestRecipesOutput } from '@/ai/flows/suggest-recipes';
import VideoSuggestions from './video-suggestions';
import { LanguageContext, content } from '@/context/language-context';
import { Button } from '../ui/button';
import { Loader2, Volume2 } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';


interface RecipeDisplayProps {
  recipes: SuggestRecipesOutput['recipes'];
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


  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.recipes.title}</CardTitle>
        <CardDescription>{t.recipes.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {recipes.length > 0 ? (
          <Accordion type="single" collapsible className="w-full" onValueChange={(value) => setActiveRecipe(value)}>
            {recipes.map((recipe, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="font-headline text-lg hover:no-underline">{recipe.name}</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div className="flex items-start gap-4">
                    <p className="whitespace-pre-wrap text-foreground/80 flex-grow pt-2">{recipe.instructions}</p>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => handleListen(recipe.name, recipe.instructions)}
                      disabled={loadingAudio === recipe.name}
                      aria-label={t.recipes.listen}
                    >
                      {loadingAudio === recipe.name ? <Loader2 className="animate-spin" /> : <Volume2 />}
                    </Button>
                  </div>
                  
                  {loadingAudio === recipe.name && !audioUrl && (
                    <Skeleton className="h-12 w-full" />
                  )}

                  {audioUrl && loadingAudio !== recipe.name && activeRecipe === `item-${index}` && (
                    <div className="w-full">
                        <audio controls src={audioUrl} className="w-full">
                            Your browser does not support the audio element.
                        </audio>
                    </div>
                  )}

                  <VideoSuggestions searchQuery={recipe.youtubeSearchQuery} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <p className="text-muted-foreground text-center py-8">{t.recipes.empty}</p>
        )}
      </CardContent>
    </Card>
  );
}
