'use client';

import { useEffect, useState, useContext } from 'react';
import { findRelatedVideos, type FindRelatedVideosOutput } from '@/ai/flows/find-related-videos';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '../ui/separator';
import { LanguageContext, content } from '@/context/language-context';


interface VideoSuggestionsProps {
  recipeName: string;
  searchQuery: string;
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

export default function VideoSuggestions({ recipeName, searchQuery }: VideoSuggestionsProps) {
  const [videos, setVideos] = useState<FindRelatedVideosOutput['videoUrls']>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { language } = useContext(LanguageContext);
  const t = content[language];

  useEffect(() => {
    if (searchQuery) {
      setIsLoading(true);
      findRelatedVideos({ recipeName: searchQuery })
        .then((result) => setVideos(result.videoUrls))
        .catch((error) => console.error('Error finding videos:', error))
        .finally(() => setIsLoading(false));
    }
  }, [searchQuery]);

  return (
    <div className="space-y-4 pt-4">
      <Separator />
      <h4 className="font-semibold font-headline">{t.videos.title}</h4>
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
        <p className="text-sm text-muted-foreground">{t.videos.empty}</p>
      )}
    </div>
  );
}
