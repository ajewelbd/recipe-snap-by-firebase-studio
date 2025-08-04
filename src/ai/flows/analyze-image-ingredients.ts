'use server';

/**
 * @fileOverview This file contains the Genkit flow for analyzing image ingredients.
 *
 * - analyzeImageIngredients - A function that handles the image analysis process.
 * - AnalyzeImageIngredientsInput - The input type for the analyzeImageIngredientsInput function.
 * - AnalyzeImageIngredientsOutput - The return type for the analyzeImageIngredientsInput function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeImageIngredientsInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of ingredients, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeImageIngredientsInput = z.infer<typeof AnalyzeImageIngredientsInputSchema>;

const AnalyzeImageIngredientsOutputSchema = z.object({
  ingredients: z.array(z.string()).describe('A list of ingredients identified in the image.'),
});
export type AnalyzeImageIngredientsOutput = z.infer<typeof AnalyzeImageIngredientsOutputSchema>;

export async function analyzeImageIngredients(
  input: AnalyzeImageIngredientsInput
): Promise<AnalyzeImageIngredientsOutput> {
  return analyzeImageIngredientsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeImageIngredientsPrompt',
  input: {schema: AnalyzeImageIngredientsInputSchema},
  output: {schema: AnalyzeImageIngredientsOutputSchema},
  prompt: `You are an AI that identifies ingredients in a photo.

  Analyze the image and extract the ingredients.
  Do not include any ingredients that you are not confident about.

  Photo: {{media url=photoDataUri}}
  `,
});

const analyzeImageIngredientsFlow = ai.defineFlow(
  {
    name: 'analyzeImageIngredientsFlow',
    inputSchema: AnalyzeImageIngredientsInputSchema,
    outputSchema: AnalyzeImageIngredientsOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      return output ?? { ingredients: [] };
    } catch(error) {
      console.error('Error in analyzeImageIngredientsFlow:', error);
      return { ingredients: [] };
    }
  }
);
