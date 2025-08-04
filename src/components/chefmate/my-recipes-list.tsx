
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { BookOpen, PlusCircle } from 'lucide-react';
import { Button } from '../ui/button';

interface MyRecipe {
  id: string;
  title: string;
  featured_image_url: string | null;
  tags: string[] | null;
  category: string | null;
  created_at: string;
}

export default function MyRecipesList() {
  const [recipes, setRecipes] = useState<MyRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecipes = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('my_recipies')
          .select('id, title, featured_image_url, tags, category, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setRecipes(data || []);
      } catch (error) {
        console.error("Error fetching recipes:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecipes();
  }, [user]);

  if (isLoading) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
                <Card key={i}>
                    <CardHeader>
                        <Skeleton className="h-48 w-full" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="h-8 w-1/4" />
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
  }

  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold font-headline text-primary flex items-center gap-3">
                <BookOpen />
                My Recipes
            </h1>
            <Button asChild>
                <Link href="/my-recipes/new">
                    <PlusCircle className="mr-2" />
                    Create New
                </Link>
            </Button>
        </div>

        {recipes.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed rounded-lg">
                <p className="text-lg font-semibold text-muted-foreground">You haven't saved any recipes yet.</p>
                <p className="text-muted-foreground mt-2">Why not create your first one?</p>
            </div>
        ) : (
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
                                {recipe.tags?.map((tag, i) => (
                                    <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                                ))}
                            </div>
                        </CardFooter>
                    </Card>
                </Link>
            ))}
            </div>
        )}
    </div>
  );
}
