'use server';

/**
 * @fileOverview Finds relevant YouTube videos for a given recipe search query.
 *
 * - findYoutubeVideos - A function that finds YouTube videos.
 * - FindYoutubeVideosInput - The input type for the findYoutubeVideos function.
 * - FindYoutubeVideosOutput - The return type for the findYoutubeVideos function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FindYoutubeVideosInputSchema = z.object({
  query: z.string().describe('The search query for YouTube, e.g., a recipe name.'),
});
export type FindYoutubeVideosInput = z.infer<typeof FindYoutubeVideosInputSchema>;

const FindYoutubeVideosOutputSchema = z.object({
  videos: z.array(
    z.object({
      videoId: z.string().describe('The unique YouTube video ID.'),
      title: z.string().describe('The title of the YouTube video.'),
    })
  ).describe('A list of 3 relevant and public YouTube videos.'),
});
export type FindYoutubeVideosOutput = z.infer<typeof FindYoutubeVideosOutputSchema>;

export async function findYoutubeVideos(input: FindYoutubeVideosInput): Promise<FindYoutubeVideosOutput> {
  return findYoutubeVideosFlow(input);
}

const prompt = ai.definePrompt({
  name: 'findYoutubeVideosPrompt',
  input: {schema: FindYoutubeVideosInputSchema},
  output: {schema: FindYoutubeVideosOutputSchema},
  prompt: `You are an expert at finding relevant YouTube videos.
  
  Find 3 public, popular, and relevant YouTube videos for the following search query: {{{query}}}.
  
  IMPORTANT: Only return the video ID and title for each video. You must not return private, deleted, or otherwise unavailable videos. Ensure the videos are in English and are embeddable. Double-check that each video is publicly accessible before including it in the output.`,
});

const findYoutubeVideosFlow = ai.defineFlow(
  {
    name: 'findYoutubeVideosFlow',
    inputSchema: FindYoutubeVideosInputSchema,
    outputSchema: FindYoutubeVideosOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
