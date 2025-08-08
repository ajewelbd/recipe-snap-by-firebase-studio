
'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Heart, MessageCircle } from 'lucide-react';
import type { MyRecipe } from './my-recipes-list';
import { useSavedRecipeDetailDialog } from './saved-recipe-detail-dialog';


interface SavedRecipeCardProps {
    recipe: MyRecipe;
}

export default function SavedRecipeCard({ recipe }: SavedRecipeCardProps) {
    const { setSelectedRecipe } = useSavedRecipeDetailDialog();

    return (
        <Card 
            onClick={() => setSelectedRecipe(recipe)}
            className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer"
        >
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
            <CardFooter className="p-4 pt-0 flex justify-between items-center text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                        <Heart className={`w-4 h-4 ${recipe.has_liked ? 'text-red-500 fill-current' : ''}`} />
                        <span>{recipe.like_count}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{recipe.comment_count}</span>
                    </div>
                </div>
            </CardFooter>
        </Card>
    );
}
