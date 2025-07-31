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
  language: z.string().describe("The user's preferred language for the output. Can be 'en' for English or 'bn' for Bengali."),
});
export type SuggestRecipesInput = z.infer<typeof SuggestRecipesInputSchema>;

const SuggestRecipesOutputSchema = z.object({
  recipes: z.array(
    z.object({
      name: z.string().describe('The name of the recipe, in the language requested by the user.'),
      instructions: z.string().describe('The cooking instructions for the recipe, in the language requested by the user.'),
      name_en: z.string().describe('The name of the recipe, in English.'),
      instructions_en: z.string().describe('The cooking instructions for the recipe, in English.'),
      name_bn: z.string().describe('The name of the recipe, in Bengali.'),
      instructions_bn: z.string().describe('The cooking instructions for the recipe, in Bengali.'),
      youtubeSearchQuery: z.string().describe('A simple, effective search query to find a YouTube video for this recipe in English.'),
      nutrition: z.object({
        calories: z.string().describe('Estimated calories per serving.'),
        protein: z.string().describe('Estimated protein in grams per serving.'),
        carbs: z.string().describe('Estimated carbohydrates in grams per serving.'),
        fat: z.string().describe('Estimated fat in grams per serving.'),
      }).describe('Estimated nutritional information per serving.'),
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

VERY IMPORTANT: You must generate the recipe name and instructions in BOTH English and Bengali.
- The 'name' and 'instructions' fields should be in the user's preferred language ({{language}}).
- The 'name_en' and 'instructions_en' fields must be in English.
- The 'name_bn' and 'instructions_bn' fields must be in Bengali (Bangla).

For each recipe, also provide estimated nutritional information (calories, protein, carbs, and fat) per serving.
The youtubeSearchQuery should always be in English.

Each recipe should include a name, cooking instructions, a simple YouTube search query, and nutritional information.`,
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
