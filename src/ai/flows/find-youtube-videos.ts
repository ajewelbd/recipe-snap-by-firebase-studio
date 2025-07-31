'use server';

/**
 * @fileOverview Finds relevant YouTube videos for a given recipe search query using the YouTube Data API.
 *
 * - findYoutubeVideos - A function that finds YouTube videos.
 * - FindYoutubeVideosInput - The input type for the findYoutubeVideos function.
 * - FindYoutubeVideosOutput - The return type for the findYoutubeVideos function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {google} from 'googleapis';

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

const findYoutubeVideosFlow = ai.defineFlow(
  {
    name: 'findYoutubeVideosFlow',
    inputSchema: FindYoutubeVideosInputSchema,
    outputSchema: FindYoutubeVideosOutputSchema,
  },
  async (input) => {
    if (!process.env.YOUTUBE_API_KEY) {
      console.warn("YouTube API key not found. Returning empty video list.");
      return { videos: [] };
    }

    const youtube = google.youtube('v3');
    try {
      const response = await youtube.search.list({
        key: process.env.YOUTUBE_API_KEY,
        part: ['snippet'],
        q: input.query,
        type: ['video'],
        maxResults: 3,
        videoEmbeddable: 'true',
      });

      const videos = response.data.items
        ?.map(item => ({
          videoId: item.id?.videoId || '',
          title: item.snippet?.title || '',
        }))
        .filter(v => v.videoId && v.title) || [];

      return { videos };
    } catch (error) {
        console.error("Error fetching from YouTube API: ", error);
        // Return empty list on error to prevent app crash
        return { videos: [] };
    }
  }
);
