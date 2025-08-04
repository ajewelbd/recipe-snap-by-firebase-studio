'use server';

/**
 * @fileOverview Extracts a list of ingredients from a natural language text string.
 *
 * - extractIngredientsFromText - A function that handles the ingredient extraction.
 * - ExtractIngredientsFromTextInput - The input type for the function.
 * - ExtractIngredientsFromTextOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractIngredientsFromTextInputSchema = z.object({
  text: z.string().describe('A natural language string containing one or more ingredients.'),
});
export type ExtractIngredientsFromTextInput = z.infer<typeof ExtractIngredientsFromTextInputSchema>;

const ExtractIngredientsFromTextOutputSchema = z.object({
  ingredients: z.array(z.string()).describe('A list of distinct ingredients extracted from the text.'),
});
export type ExtractIngredientsFromTextOutput = z.infer<typeof ExtractIngredientsFromTextOutputSchema>;

export async function extractIngredientsFromText(
  input: ExtractIngredientsFromTextInput
): Promise<ExtractIngredientsFromTextOutput> {
  return extractIngredientsFromTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractIngredientsFromTextPrompt',
  input: {schema: ExtractIngredientsFromTextInputSchema},
  output: {schema: ExtractIngredientsFromTextOutputSchema},
  prompt: `You are an expert at identifying cooking ingredients from a block of text.

  Extract the distinct ingredients from the following text. Do not add amounts or quantities.
  For example, if the text is "I have tomatoes, onions, and a little bit of garlic", you should return ["tomatoes", "onions", "garlic"].
  If the text is "green bell peppers and olive oil", you should return ["green bell peppers", "olive oil"].

  Text: "{{text}}"
  `,
});

const extractIngredientsFromTextFlow = ai.defineFlow(
  {
    name: 'extractIngredientsFromTextFlow',
    inputSchema: ExtractIngredientsFromTextInputSchema,
    outputSchema: ExtractIngredientsFromTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
