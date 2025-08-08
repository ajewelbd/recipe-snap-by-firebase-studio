
'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Heart, MessageCircle, MoreVertical, Pencil, Trash2 } from 'lucide-react';
import type { MyRecipe } from './my-recipes-list';
import { useSavedRecipeDetailDialog } from './saved-recipe-detail-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '../ui/button';
import Link from 'next/link';
import { useContext } from 'react';
import { LanguageContext, content } from '@/context/language-context';
import { useAuth } from '@/context/auth-context';

interface SavedRecipeCardProps {
    recipe: MyRecipe;
    isOwner: boolean;
    onDelete?: () => void;
}

export default function SavedRecipeCard({ recipe, isOwner, onDelete }: SavedRecipeCardProps) {
    const { setSelectedRecipe } = useSavedRecipeDetailDialog();
    const { language } = useContext(LanguageContext);
    const t = content[language];
    const { user } = useAuth();

    const handleCardClick = (e: React.MouseEvent) => {
        // Prevent dialog from opening if the click was on any interactive element inside the card
        if ((e.target as HTMLElement).closest('a, button, [role="menuitem"]')) {
            return;
        }
        setSelectedRecipe(recipe);
    };

    return (
        <Card 
            onClick={handleCardClick}
            className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300 cursor-pointer"
        >
            <CardHeader className="p-0 relative">
                <div className="relative w-full aspect-video bg-muted">
                    {recipe.featured_image_url ? (
                        <Image src={recipe.featured_image_url} alt={recipe.title} fill className="object-cover" data-ai-hint="recipe food" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-16 h-16 text-muted-foreground" />
                        </div>
                    )}
                </div>
                {isOwner && (
                     <div className="absolute top-2 right-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button 
                                    variant="secondary" 
                                    size="icon" 
                                    className="h-8 w-8 rounded-full bg-black/50 text-white hover:bg-black/70"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href={`/my-recipes/${recipe.id}/edit`}>
                                        <Pencil className="mr-2 h-4 w-4" />
                                        <span>{t.myRecipes.edit}</span>
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    <span>{t.myRecipes.delete}</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </CardHeader>
            <CardContent className="p-4 flex-grow">
                <CardTitle className="text-xl mb-1 line-clamp-2">{recipe.title}</CardTitle>
                {!isOwner && recipe.owner_full_name && (
                    <p className="text-xs text-muted-foreground mb-2">by {recipe.owner_full_name}</p>
                )}
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
