'use server';

/**
 * @fileOverview Suggests recipes tailored to a list of ingredients.
 *
 * - suggestRecipes - A function that suggests recipes based on the provided ingredients.
 * - SuggestRecipesInput - The input type for the suggestRecipes function.
 * - SuggestRecipesOutput - The return type for the suggestRecipes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRecipesInputSchema = z.object({
  ingredients: z.array(z.string()).describe('A list of ingredients to base the recipe suggestions on.'),
  language: z.string().describe("The language to generate the recipes in. Can be 'en' for English or 'bn' for Bengali."),
});
export type SuggestRecipesInput = z.infer<typeof SuggestRecipesInputSchema>;

const SuggestRecipesOutputSchema = z.object({
  recipes: z.array(
    z.object({
      name: z.string().describe('The name of the recipe.'),
      instructions: z.string().describe('The cooking instructions for the recipe.'),
      youtubeSearchQuery: z.string().describe('A simple, effective search query to find a YouTube video for this recipe in English.'),
    })
  ).describe('A list of suggested recipes based on the provided ingredients.'),
});
export type SuggestRecipesOutput = z.infer<typeof SuggestRecipesOutputSchema>;

export async function suggestRecipes(input: SuggestRecipesInput): Promise<SuggestRecipesOutput> {
  return suggestRecipesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRecipesPrompt',
  input: {schema: SuggestRecipesInputSchema},
  output: {schema: SuggestRecipesOutputSchema},
  prompt: `Suggest 3 recipes based on the following ingredients:

{{#each ingredients}}
- {{this}}
{{/each}}

The user's preferred language is {{language}}. 'en' is English, and 'bn' is Bengali.
Generate the recipe name and instructions in the user's preferred language.
The youtubeSearchQuery should always be in English.

Each recipe should include a name, cooking instructions, and a simple YouTube search query.`,
});

const suggestRecipesFlow = ai.defineFlow(
  {
    name: 'suggestRecipesFlow',
    inputSchema: SuggestRecipesInputSchema,
    outputSchema: SuggestRecipesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
