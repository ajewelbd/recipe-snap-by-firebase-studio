
'use client';

import type { RecipeWithImage } from '@/app/page';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { LanguageContext, content } from '@/context/language-context';
import { useContext } from 'react';
import RecipeDetailDialog from './recipe-detail-dialog';

interface RecipeGridProps {
  recipes: RecipeWithImage[];
  isLoading: boolean;
  userIngredients: string[];
  hasSearched: boolean;
}

export default function RecipeGrid({ recipes, isLoading, userIngredients, hasSearched }: RecipeGridProps) {
    const { language } = useContext(LanguageContext);
    const t = content[language];

    const getRecipeName = (recipe: RecipeWithImage) => {
        return language === 'bn' ? recipe.name_bn : recipe.name_en;
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-2">
                    <Skeleton className="w-full aspect-square rounded-lg" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                </div>
            ))}
            </div>
        );
    }

    if (hasSearched && recipes.length === 0) {
        return (
            <div className="text-center py-16">
                <p className="text-muted-foreground">{t.recipes.empty}</p>
            </div>
        );
    }
  
    return (
        <RecipeDetailDialog.Provider userIngredients={userIngredients}>
            <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            {recipes.map((recipe, index) => (
                <RecipeDetailDialog.Trigger key={index} recipe={recipe}>
                    <div className="space-y-2 group">
                        <Card className="overflow-hidden rounded-xl border-0 shadow-none">
                            <CardContent className="p-0">
                            {recipe.imageUrl ? (
                                <div className="relative w-full aspect-square bg-muted">
                                <Image 
                                    src={recipe.imageUrl} 
                                    alt={getRecipeName(recipe)} 
                                    fill 
                                    className="object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out" 
                                    data-ai-hint="recipe food" 
                                />
                                </div>
                            ) : (
                                <Skeleton className="w-full aspect-square rounded-xl" />
                            )}
                            </CardContent>
                        </Card>
                        <div className="text-left">
                            <h3 className="font-bold text-base">{getRecipeName(recipe)}</h3>
                            <p className="text-sm text-muted-foreground">{recipe.totalTime}</p>
                            <p className="text-sm text-muted-foreground">{t.recipes.ingredientsUsed(recipe.ingredientsUsedCount)}</p>
                        </div>
                    </div>
                </RecipeDetailDialog.Trigger>
            ))}
            </div>
        </RecipeDetailDialog.Provider>
    );
}
