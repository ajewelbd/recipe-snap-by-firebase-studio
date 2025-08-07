
'use server';

/**
 * @fileOverview Analyzes recipe text to generate estimated nutrition facts.
 *
 * - analyzeRecipeNutrition - A function that handles the nutrition analysis.
 * - AnalyzeRecipeNutritionInput - The input type for the function.
 * - AnalyzeRecipeNutritionOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NutrientSchema = z.object({
    value: z.number().describe('The numerical value of the nutrient.'),
    unit: z.string().describe('The unit of measurement (e.g., "g", "mg", "kcal").'),
});

const AnalyzeRecipeNutritionInputSchema = z.object({
  title: z.string().describe('The title of the recipe.'),
  details: z.string().describe('The detailed instructions and ingredients of the recipe.'),
});
type AnalyzeRecipeNutritionInput = z.infer<typeof AnalyzeRecipeNutritionInputSchema>;

const AnalyzeRecipeNutritionOutputSchema = z.object({
    servingSize: z.string().describe('The estimated serving size, including a precise quantity in parentheses. For example: "1 bowl (400g)" or "1 glass (250ml)".'),
    calories: NutrientSchema.describe('Estimated calories per serving.'),
    protein: NutrientSchema.describe('Estimated protein per serving.'),
    carbs: NutrientSchema.describe('Estimated carbohydrates per serving.'),
    fat: NutrientSchema.describe('Estimated fat per serving.'),
}).describe('Estimated nutritional information. This is an AI-generated estimate and should not be used for medical purposes.');
export type AnalyzeRecipeNutritionOutput = z.infer<typeof AnalyzeRecipeNutritionOutputSchema>;

export async function analyzeRecipeNutrition(
  input: AnalyzeRecipeNutritionInput
): Promise<AnalyzeRecipeNutritionOutput> {
  return analyzeRecipeNutritionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeRecipeNutritionPrompt',
  input: {schema: AnalyzeRecipeNutritionInputSchema},
  output: {schema: AnalyzeRecipeNutritionOutputSchema},
  prompt: `You are an expert nutritionist. Analyze the following recipe title and details to estimate its nutritional information per serving.

Recipe Title: "{{title}}"

Recipe Details:
{{details}}

Based on the ingredients and preparation method, provide an estimated serving size and the amount of calories, protein, carbohydrates, and fat per serving. This is an AI-generated estimate and should not be used for medical purposes.
`,
});

const analyzeRecipeNutritionFlow = ai.defineFlow(
  {
    name: 'analyzeRecipeNutritionFlow',
    inputSchema: AnalyzeRecipeNutritionInputSchema,
    outputSchema: AnalyzeRecipeNutritionOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) {
        throw new Error("Nutrition analysis returned no output.");
      }
      return output;
    } catch (error) {
      console.error('Error in analyzeRecipeNutritionFlow:', error);
      // Return a default value on error
      return {
        servingSize: '1 serving',
        calories: { value: 0, unit: 'kcal'},
        protein: { value: 0, unit: 'g'},
        carbs: { value: 0, unit: 'g'},
        fat: { value: 0, unit: 'g'}
      };
    }
  }
);
