
'use server';

/**
 * @fileOverview Analyzes recipe text to generate relevant tags and a category.
 *
 * - categorizeRecipe - A function that handles the categorization process.
 * - CategorizeRecipeInput - The input type for the function.
 * - CategorizeRecipeOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeRecipeInputSchema = z.object({
  title: z.string().describe('The title of the recipe.'),
  details: z.string().describe('The detailed instructions and ingredients of the recipe.'),
});
type CategorizeRecipeInput = z.infer<typeof CategorizeRecipeInputSchema>;

const CategorizeRecipeOutputSchema = z.object({
  tags: z.array(z.string()).describe('A list of 3-5 relevant tags for the recipe (e.g., "quick", "dessert", "chicken", "spicy").'),
  category: z.string().describe('A single, broad category for the recipe (e.g., "Dinner", "Dessert", "Appetizer", "Beverage").'),
});
type CategorizeRecipeOutput = z.infer<typeof CategorizeRecipeOutputSchema>;

export async function categorizeRecipe(
  input: CategorizeRecipeInput
): Promise<CategorizeRecipeOutput> {
  return categorizeRecipeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeRecipePrompt',
  input: {schema: CategorizeRecipeInputSchema},
  output: {schema: CategorizeRecipeOutputSchema},
  prompt: `You are an expert recipe organizer. Analyze the following recipe title and details to determine the best tags and a single category for it.

Recipe Title: "{{title}}"

Recipe Details:
{{details}}

Based on the content, provide a list of 3-5 descriptive tags and one single, most appropriate category.
Tags should be specific keywords. The category should be a general meal type.
For example, for "Spicy Chicken Stir-Fry", tags might be ["chicken", "spicy", "asian", "quick"] and the category would be "Dinner".
For "Chocolate Lava Cakes", tags might be ["chocolate", "dessert", "baking", "sweet"] and the category would be "Dessert".
`,
});

const categorizeRecipeFlow = ai.defineFlow(
  {
    name: 'categorizeRecipeFlow',
    inputSchema: CategorizeRecipeInputSchema,
    outputSchema: CategorizeRecipeOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      return output ?? { tags: [], category: 'Uncategorized' };
    } catch (error) {
      console.error('Error in categorizeRecipeFlow:', error);
      // Return a default value on error
      return { tags: [], category: 'Uncategorized' };
    }
  }
);
