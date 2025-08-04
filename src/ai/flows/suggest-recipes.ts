'use server';

/**
 * @fileOverview Suggests recipes tailored to a list of ingredients and user preferences.
 *
 * - suggestRecipes - A function that suggests recipes based on the provided ingredients and filters.
 * - SuggestRecipesInput - The input type for the suggestRecipes function.
 * - SuggestRecipesOutput - The return type for the suggestRecipes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NutrientSchema = z.object({
    value: z.number().describe('The numerical value of the nutrient.'),
    unit: z.string().describe('The unit of measurement (e.g., "g", "mg", "kcal").'),
});

const SuggestRecipesInputSchema = z.object({
  ingredients: z.array(z.string()).describe('A list of ingredients to base the recipe suggestions on.'),
  language: z.string().describe("The user's preferred language for the output. Can be 'en' for English or 'bn' for Bengali."),
  cuisine: z.string().optional().describe('A preferred cuisine (e.g., "Italian", "Mexican").'),
  diet: z.string().optional().describe('A dietary restriction (e.g., "Vegan", "Gluten-Free").'),
  time: z.string().optional().describe('A maximum preparation time constraint (e.g., "Under 30 minutes").'),
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
      imageGenerationPrompt: z.string().describe('A detailed, photorealistic image generation prompt for the final, plated dish. This prompt will be used to create an image of the food.'),
      ingredientsUsedCount: z.number().describe('The number of ingredients from the user\'s list that are used in this recipe.'),
      totalTime: z.string().describe('The total time to prepare the recipe (e.g., "30 min").'),
      nutrition: z.object({
        servingSize: z.string().describe('The estimated serving size, including a precise quantity in parentheses. For example: "1 bowl (400g)" or "1 glass (250ml)".'),
        calories: NutrientSchema.describe('Estimated calories per serving.'),
        protein: NutrientSchema.describe('Estimated protein per serving.'),
        carbs: NutrientSchema.describe('Estimated carbohydrates per serving.'),
        fat: NutrientSchema.describe('Estimated fat per serving.'),
      }).describe('Estimated nutritional information. This is an AI-generated estimate and should not be used for medical purposes.'),
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
  prompt: `You are a helpful recipe assistant. Suggest 4 diverse recipes based on the following ingredients:

{{#each ingredients}}
- {{this}}
{{/each}}

Please consider the following user preferences:
{{#if cuisine}}
- Cuisine: {{cuisine}}
{{/if}}
{{#if diet}}
- Dietary Restriction: {{diet}}
{{/if}}
{{#if time}}
- Maximum Time: {{time}}
{{/if}}
{{#unless cuisine}}{{#unless diet}}{{#unless time}}
- No specific preferences provided.
{{/unless}}{{/unless}}{{/unless}}


For each recipe, provide the following information:
1.  **Recipe Name & Instructions**: Generate the recipe name and instructions in BOTH English and Bengali.
    -   The 'name' and 'instructions' fields should be in the user's preferred language ({{language}}).
    -   'name_en' and 'instructions_en' must be in English.
    -   'name_bn' and 'instructions_bn' must be in Bengali (Bangla).
2.  **Total Time**: A string representing the total time to prepare the recipe (e.g., "30 min", "1 hour").
3.  **Ingredients Used Count**: Count how many of the user-provided ingredients are used in the recipe. For example, if the user provided ["tomato", "onion", "garlic"] and the recipe uses tomatoes and onions, this value should be 2.
4.  **Nutritional Information**: Provide estimated nutritional info (calories, protein, carbs, fat) for a defined 'servingSize'. This is an AI-generated estimate.
5.  **YouTube Search Query**: An effective, simple search query in English to find a video for this recipe.
6.  **Image Generation Prompt**: A detailed, photorealistic image generation prompt in English for the final, plated dish. This prompt will be used to create an image of the food.`,
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
