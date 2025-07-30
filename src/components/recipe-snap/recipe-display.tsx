'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { SuggestRecipesOutput } from '@/ai/flows/suggest-recipes';
import VideoSuggestions from './video-suggestions';

interface RecipeDisplayProps {
  recipes: SuggestRecipesOutput['recipes'];
}

export default function RecipeDisplay({ recipes }: RecipeDisplayProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>3. Your Personalized Recipes</CardTitle>
        <CardDescription>Here are some recipe ideas based on your ingredients.</CardDescription>
      </CardHeader>
      <CardContent>
        {recipes.length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {recipes.map((recipe, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="font-headline text-lg hover:no-underline">{recipe.name}</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <p className="whitespace-pre-wrap text-foreground/80">{recipe.instructions}</p>
                  <VideoSuggestions recipeName={recipe.name} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <p className="text-muted-foreground text-center py-8">No recipes to show yet. Try generating some!</p>
        )}
      </CardContent>
    </Card>
  );
}
