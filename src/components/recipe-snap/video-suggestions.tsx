'use client';

import { useEffect, useState } from 'react';
import { findRelatedVideos, type FindRelatedVideosOutput } from '@/ai/flows/find-related-videos';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '../ui/separator';

interface VideoSuggestionsProps {
  recipeName: string;
}

function convertToEmbedUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
      const videoId = urlObj.searchParams.get('v');
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    if (urlObj.hostname === 'youtu.be') {
      const videoId = urlObj.pathname.slice(1);
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
  } catch (error) {
    console.error("Invalid URL:", error);
    return null;
  }
  return null;
}

export default function VideoSuggestions({ recipeName }: VideoSuggestionsProps) {
  const [videos, setVideos] = useState<FindRelatedVideosOutput['videoUrls']>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (recipeName) {
      setIsLoading(true);
      findRelatedVideos({ recipeName })
        .then((result) => setVideos(result.videoUrls))
        .catch((error) => console.error('Error finding videos:', error))
        .finally(() => setIsLoading(false));
    }
  }, [recipeName]);

  return (
    <div className="space-y-4 pt-4">
      <Separator />
      <h4 className="font-semibold font-headline">Related Videos</h4>
      {isLoading && (
        <div className="space-y-2">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}
      {!isLoading && videos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {videos.map((videoUrl, index) => {
            const embedUrl = convertToEmbedUrl(videoUrl);
            if (!embedUrl) return null;
            return(
            <div key={index} className="aspect-video">
              <iframe
                className="w-full h-full rounded-lg"
                src={embedUrl}
                title={`YouTube video player for ${recipeName}`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )})}
        </div>
      )}
      {!isLoading && videos.length === 0 && (
        <p className="text-sm text-muted-foreground">No related videos found.</p>
      )}
    </div>
  );
}
