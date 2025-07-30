'use client';

import { useContext } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { SuggestRecipesOutput } from '@/ai/flows/suggest-recipes';
import VideoSuggestions from './video-suggestions';
import { LanguageContext, content } from '@/context/language-context';


interface RecipeDisplayProps {
  recipes: SuggestRecipesOutput['recipes'];
}

export default function RecipeDisplay({ recipes }: RecipeDisplayProps) {
  const { language } = useContext(LanguageContext);
  const t = content[language];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.recipes.title}</CardTitle>
        <CardDescription>{t.recipes.description}</CardDescription>
      </CardHeader>
      <CardContent>
        {recipes.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {recipes.map((recipe, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="font-headline text-lg hover:no-underline">{recipe.name}</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <p className="whitespace-pre-wrap text-foreground/80">{recipe.instructions}</p>
                  <VideoSuggestions recipeName={recipe.name} searchQuery={recipe.youtubeSearchQuery} />
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
