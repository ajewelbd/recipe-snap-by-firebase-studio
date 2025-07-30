'use client';

import { useState, useEffect, useContext } from 'react';
import Image from 'next/image';
import { Separator } from '../ui/separator';
import { LanguageContext, content } from '@/context/language-context';
import { findYoutubeVideos, type FindYoutubeVideosOutput } from '@/ai/flows/find-youtube-videos';
import { Skeleton } from '../ui/skeleton';
import { Card } from '../ui/card';
import { Youtube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VideoSuggestionsProps {
  searchQuery: string;
}

export default function VideoSuggestions({ searchQuery }: VideoSuggestionsProps) {
  const { language } = useContext(LanguageContext);
  const t = content[language];
  const { toast } = useToast();
  const [videos, setVideos] = useState<FindYoutubeVideosOutput['videos']>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      if (!searchQuery) return;
      setIsLoading(true);
      try {
        const result = await findYoutubeVideos({ query: searchQuery });
        setVideos(result.videos);
      } catch (error) {
        console.error('Error finding videos:', error);
        // We don't show a toast here to avoid cluttering the UI for an optional feature.
      } finally {
        setIsLoading(false);
      }
    };
    fetchVideos();
  }, [searchQuery]);

  const getThumbnailUrl = (videoId: string) => `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  const getVideoUrl = (videoId: string) => `https://www.youtube.com/watch?v=${videoId}`;

  return (
    <div className="space-y-4 pt-4">
      <Separator />
      <div className="flex items-center justify-between">
        <h4 className="font-semibold font-headline flex items-center gap-2">
          <Youtube />
          {t.videos.title}
        </h4>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="w-full h-32 rounded-lg" />
          <Skeleton className="w-full h-32 rounded-lg" />
          <Skeleton className="w-full h-32 rounded-lg" />
        </div>
      ) : videos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {videos.map((video) => (
            <a key={video.videoId} href={getVideoUrl(video.videoId)} target="_blank" rel="noopener noreferrer" className="group">
              <Card className="overflow-hidden h-full flex flex-col">
                <div className="relative w-full aspect-video">
                  <Image
                    src={getThumbnailUrl(video.videoId)}
                    alt={video.title}
                    layout="fill"
                    objectFit="cover"
                    className="group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                <div className="p-3">
                  <p className="text-xs font-medium line-clamp-2">{video.title}</p>
                </div>
              </Card>
            </a>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{t.videos.unavailable}</p>
      )}
    </div>
  );
}
