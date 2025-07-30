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
  if (!url) return null;
  try {
    const urlObj = new URL(url);
    let videoId = null;

    if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
      if (urlObj.pathname === '/watch') {
        videoId = urlObj.searchParams.get('v');
      } else if (urlObj.pathname.startsWith('/embed/')) {
        videoId = urlObj.pathname.substring('/embed/'.length);
      }
    } else if (urlObj.hostname === 'youtu.be') {
      videoId = urlObj.pathname.slice(1);
    }

    if (videoId) {
      const cleanVideoId = videoId.split('&')[0];
      return `https://www.youtube.com/embed/${cleanVideoId}`;
    }
  } catch (error) {
    console.error("Invalid URL:", url, error);
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

  const embeddableVideos = videos.map(convertToEmbedUrl).filter(Boolean) as string[];

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
      {!isLoading && embeddableVideos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {embeddableVideos.map((embedUrl, index) => (
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
          ))}
        </div>
      )}
      {!isLoading && embeddableVideos.length === 0 && (
        <p className="text-sm text-muted-foreground">{t.videos.empty}</p>
      )}
    </div>
  );
}
