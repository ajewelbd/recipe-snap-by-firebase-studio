'use client';

import { useState, useEffect, useContext } from 'react';
import Image from 'next/image';
import { Separator } from '../ui/separator';
import { LanguageContext, content } from '@/context/language-context';
import { findYoutubeVideos, type FindYoutubeVideosOutput } from '@/ai/flows/find-youtube-videos';
import { Skeleton } from '../ui/skeleton';
import { Card } from '../ui/card';
import { Youtube, PlayCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";


interface VideoSuggestionsProps {
  searchQuery: string;
}

export default function VideoSuggestions({ searchQuery }: VideoSuggestionsProps) {
  const { language } = useContext(LanguageContext);
  const t = content[language];
  const [videos, setVideos] = useState<FindYoutubeVideosOutput['videos']>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<FindYoutubeVideosOutput['videos'][0] | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      if (!searchQuery) return;
      setIsLoading(true);
      try {
        const result = await findYoutubeVideos({ query: searchQuery });
        setVideos(result.videos);
      } catch (error) {
        console.error('Error finding videos:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchVideos();
  }, [searchQuery]);

  const getThumbnailUrl = (videoId: string) => `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  const getEmbedUrl = (videoId: string) => `https://www.youtube.com/embed/${videoId}`;

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
        <Dialog>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {videos.map((video) => (
              <DialogTrigger asChild key={video.videoId} onClick={() => setSelectedVideo(video)}>
                <Card className="overflow-hidden flex flex-col cursor-pointer group">
                  <div className="relative w-full aspect-video bg-muted">
                    <Image
                      src={getThumbnailUrl(video.videoId)}
                      alt={video.title}
                      width={320}
                      height={180}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <PlayCircle className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <div className="p-3 flex-grow">
                    <p className="text-xs font-medium line-clamp-2">{video.title}</p>
                  </div>
                </Card>
              </DialogTrigger>
            ))}
          </div>
          {selectedVideo && (
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>{selectedVideo.title}</DialogTitle>
              </DialogHeader>
              <div className="aspect-video">
                <iframe
                  width="100%"
                  height="100%"
                  src={getEmbedUrl(selectedVideo.videoId)}
                  title={selectedVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg"
                ></iframe>
              </div>
            </DialogContent>
          )}
        </Dialog>
      ) : (
        <p className="text-sm text-muted-foreground">{t.videos.unavailable}</p>
      )}
    </div>
  );
}
