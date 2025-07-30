'use server';

/**
 * @fileOverview Finds related recipe videos from YouTube based on the suggested recipes.
 *
 * - findRelatedVideos - A function that handles the retrieval of related recipe videos.
 * - FindRelatedVideosInput - The input type for the findRelatedVideos function.
 * - FindRelatedVideosOutput - The return type for the findRelatedVideos function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FindRelatedVideosInputSchema = z.object({
  recipeName: z.string().describe('The name of the recipe to find related videos for.'),
});
export type FindRelatedVideosInput = z.infer<typeof FindRelatedVideosInputSchema>;

const FindRelatedVideosOutputSchema = z.object({
  videoUrls: z.array(z.string()).describe('An array of YouTube video URLs related to the recipe.'),
});
export type FindRelatedVideosOutput = z.infer<typeof FindRelatedVideosOutputSchema>;

export async function findRelatedVideos(input: FindRelatedVideosInput): Promise<FindRelatedVideosOutput> {
  return findRelatedVideosFlow(input);
}

const findVideosPrompt = ai.definePrompt({
  name: 'findVideosPrompt',
  input: {schema: FindRelatedVideosInputSchema},
  output: {schema: FindRelatedVideosOutputSchema},
  prompt: `You are a helpful assistant that finds YouTube videos related to recipes.

  Find 3 public, embeddable YouTube videos related to the following recipe:
  {{recipeName}}

  Return the video URLs in a JSON array. Only return URLs that are publicly accessible and can be embedded. Do not return private or unavailable videos.
  `,
});

const findRelatedVideosFlow = ai.defineFlow(
  {
    name: 'findRelatedVideosFlow',
    inputSchema: FindRelatedVideosInputSchema,
    outputSchema: FindRelatedVideosOutputSchema,
  },
  async input => {
    const {output} = await findVideosPrompt(input);
    return output!;
  }
);
