
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, BookOpen } from 'lucide-react';

interface PublicRecipe {
  id: string;
  title: string;
  featured_image_url: string | null;
  tags: string[] | null;
  category: string | null;
  created_at: string;
}

export default function PublicRecipesList() {
  const [recipes, setRecipes] = useState<PublicRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('my_recipies')
          .select('id, title, featured_image_url, tags, category, created_at')
          .eq('is_public', true)
          .order('created_at', { ascending: false })
          .limit(6);

        if (error) throw error;
        setRecipes(data || []);
      } catch (error) {
        console.error("Error fetching public recipes:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecipes();
  }, []);

  if (isLoading) {
    return (
        <div className="space-y-6">
            <Skeleton className="h-8 w-64" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader className="p-0">
                            <Skeleton className="aspect-video w-full" />
                        </CardHeader>
                        <CardContent className="p-4">
                            <Skeleton className="h-6 w-3/4 mb-2" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardContent>
                        <CardFooter className="p-4">
                            <Skeleton className="h-8 w-1/4" />
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
  }

  if (recipes.length === 0) {
    return null; // Don't render anything if there are no public recipes
  }

  return (
    <div className="space-y-6">
        <h2 className="text-3xl font-bold font-headline text-primary flex items-center gap-3">
            <Sparkles />
            Recent Community Recipes
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.map(recipe => (
            <Link key={recipe.id} href={`/my-recipes/${recipe.id}`} passHref>
                <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                    <CardHeader className="p-0">
                        <div className="relative w-full aspect-video bg-muted">
                            {recipe.featured_image_url ? (
                                <Image src={recipe.featured_image_url} alt={recipe.title} fill className="object-cover" data-ai-hint="recipe food" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <BookOpen className="w-16 h-16 text-muted-foreground" />
                                </div>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 flex-grow">
                        <CardTitle className="text-xl mb-2 line-clamp-2">{recipe.title}</CardTitle>
                        {recipe.category && <Badge variant="secondary">{recipe.category}</Badge>}
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                        <div className="flex flex-wrap gap-1">
                            {recipe.tags?.slice(0, 3).map((tag, i) => (
                                <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                            ))}
                        </div>
                    </CardFooter>
                </Card>
            </Link>
        ))}
        </div>
    </div>
  );
}
