
'use client';

import { useState, useEffect, useContext } from 'react';
import { supabase } from '@/lib/supabase';
import type { SuggestRecipesOutput } from '@/ai/flows/suggest-recipes';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import Image from 'next/image';
import { format } from 'date-fns';
import { bn, enUS } from 'date-fns/locale';
import { LanguageContext, content } from '@/context/language-context';
import { useAuth } from '@/context/auth-context';
import { ListPlus } from 'lucide-react';

interface HistoryItem {
  id: string;
  image_url: string | null;
  ingredients: string[];
  recipes: SuggestRecipesOutput['recipes'];
  created_at: string | null;
}

export default function HistoryList() {
  const [history, setHistory] = useState<Record<string, HistoryItem[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const { language } = useContext(LanguageContext);
  const t = content[language];
  const { user, loading: authLoading } = useAuth();
  const dateLocale = language === 'bn' ? bn : enUS;

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      };
      setIsLoading(true);
      try {
        const { data: historyData, error } = await supabase
          .from('history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        const groupedByDate = (historyData || []).reduce((acc, item) => {
          if (item.created_at) {
            const date = format(new Date(item.created_at), 'MMMM dd, yyyy', { locale: dateLocale });
            if (!acc[date]) {
              acc[date] = [];
            }
            acc[date].push(item);
          }
          return acc;
        }, {} as Record<string, HistoryItem[]>);

        setHistory(groupedByDate);
      } catch (error) {
        console.error("Error fetching history: ", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!authLoading) {
      fetchHistory();
    }
  }, [user, authLoading, dateLocale]);

  if (isLoading || authLoading) {
    return (
      <div className="space-y-8">
        {[...Array(2)].map((_, i) => (
          <div key={i}>
            <Skeleton className="h-8 w-48 mb-4" />
            <Card>
              <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <Skeleton className="w-full h-48 rounded-lg" />
                <div className="md:col-span-2 space-y-4">
                  <Skeleton className="h-6 w-1/4" />
                  <Skeleton className="h-4 w-3/4" />
                   <Skeleton className="h-6 w-1/4 mt-4" />
                   <div className="space-y-2">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                   </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold mb-4">{t.history.loginPrompt.title}</h1>
        <p className="text-muted-foreground">{t.history.loginPrompt.description}</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold font-headline text-primary">{t.history.title}</h1>
      {Object.keys(history).length === 0 && !isLoading ? (
        <p className="text-muted-foreground text-center py-8">{t.history.empty}</p>
      ) : (
        Object.entries(history).map(([date, items]) => (
          <div key={date}>
            <h2 className="text-xl font-semibold font-headline text-foreground/80 mb-4">{date}</h2>
            <div className="space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                  {item.image_url ? (
                    <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-md">
                      <Image src={item.image_url} alt="Ingredients" fill style={{objectFit: 'cover'}} data-ai-hint="food ingredients" />
                    </div>
                  ) : (
                    <div className="relative w-full aspect-square rounded-lg bg-muted flex flex-col items-center justify-center text-muted-foreground">
                      <ListPlus className="w-16 h-16" />
                      <p className="mt-2 text-sm font-medium">{t.history.manualEntry}</p>
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <div>
                      <h3 className="text-lg font-semibold font-headline">{t.history.ingredientsUsed}</h3>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {item.ingredients.map((ing, i) => (
                          <span key={i} className="text-sm bg-muted text-muted-foreground px-2 py-1 rounded-md">
                            {language === 'bn' ? (t.ingredients.list[ing.toLowerCase() as keyof typeof t.ingredients.list] || ing) : ing}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4">
                       <h3 className="text-lg font-semibold font-headline mb-2">{t.history.suggestedRecipes}</h3>
                       <Accordion type="single" collapsible className="w-full">
                          {item.recipes.map((recipe, index) => (
                            <AccordionItem key={index} value={`item-${index}`}>
                              <AccordionTrigger className="font-headline text-md hover:no-underline">
                                {language === 'bn' ? recipe.name_bn || recipe.name : recipe.name_en || recipe.name}
                              </AccordionTrigger>
                              <AccordionContent className="space-y-2">
                                <p className="whitespace-pre-wrap text-foreground/80">
                                  {language === 'bn' ? recipe.instructions_bn || recipe.instructions : recipe.instructions_en || recipe.instructions}
                                </p>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
