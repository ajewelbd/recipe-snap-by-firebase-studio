'use client';

import { useContext } from 'react';
import { Separator } from '../ui/separator';
import { LanguageContext, content } from '@/context/language-context';
import { Button } from '../ui/button';
import { Youtube } from 'lucide-react';


interface VideoSuggestionsProps {
  searchQuery: string;
}

export default function VideoSuggestions({ searchQuery }: VideoSuggestionsProps) {
  const { language } = useContext(LanguageContext);
  const t = content[language];
  
  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;

  return (
    <div className="space-y-4 pt-4">
      <Separator />
      <div className="flex items-center justify-between">
        <h4 className="font-semibold font-headline">{t.videos.title}</h4>
        <Button asChild variant="outline" size="sm">
            <a href={youtubeSearchUrl} target="_blank" rel="noopener noreferrer">
                <Youtube className="mr-2" />
                {t.videos.search}
            </a>
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        {t.videos.prompt(searchQuery)}
      </p>
    </div>
  );
}
