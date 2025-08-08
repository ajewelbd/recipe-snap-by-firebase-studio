
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/context/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, PlusCircle } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';
import SavedRecipeCard from './saved-recipe-card';
import { SavedRecipeDetailDialogProvider } from './saved-recipe-detail-dialog';
import { deleteRecipe } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


export interface MyRecipe {
  id: string;
  title: string;
  featured_image_url: string | null;
  category: string | null;
  created_at: string;
  like_count: number;
  comment_count: number;
  has_liked: boolean;
  user_id: string;
  is_public: boolean;
}

export default function MyRecipesList() {
  const [recipes, setRecipes] = useState<MyRecipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const [recipeToDelete, setRecipeToDelete] = useState<MyRecipe | null>(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .rpc('get_recipes_with_interactions', { request_user_id: user.id })
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
    if (user) {
        fetchRecipes();
    }
  }, [user]);

  const handleDeleteConfirm = async () => {
    if (!recipeToDelete) return;
    const { error } = await deleteRecipe(recipeToDelete.id);
    if (error) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: error,
        });
    } else {
        toast({
            title: 'Success',
            description: `"${recipeToDelete.title}" has been deleted.`,
        });
        setRecipes(recipes.filter(r => r.id !== recipeToDelete.id));
    }
    setRecipeToDelete(null);
  }

  if (isLoading) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-96 w-full" />
            ))}
        </div>
    );
  }

  return (
    <>
    <AlertDialog open={!!recipeToDelete} onOpenChange={(isOpen) => !isOpen && setRecipeToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
                This action cannot be undone. This will permanently delete "{recipeToDelete?.title}" and all its associated data.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
    <SavedRecipeDetailDialogProvider>
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
                    <SavedRecipeCard 
                        key={recipe.id} 
                        recipe={recipe} 
                        isOwner={recipe.user_id === user?.id}
                        onDelete={() => setRecipeToDelete(recipe)}
                    />
                ))}
                </div>
            )}
        </div>
    </SavedRecipeDetailDialogProvider>
    </>
  );
}

