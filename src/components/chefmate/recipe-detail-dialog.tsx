
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { type RecipeWithImage } from '@/app/page';
import { useState, useContext, createContext } from 'react';
import Image from "next/image";
import { Skeleton } from "../ui/skeleton";
import { LanguageContext, content } from "@/context/language-context";
import { Badge } from "../ui/badge";
import { X } from "lucide-react";


interface RecipeDetailDialogContextType {
    setSelectedRecipe: (recipe: RecipeWithImage | null) => void;
}

const RecipeDetailDialogContext = createContext<RecipeDetailDialogContextType | null>(null);

const useRecipeDetailDialog = () => {
    const context = useContext(RecipeDetailDialogContext);
    if (!context) {
        throw new Error('useRecipeDetailDialog must be used within a RecipeDetailDialog');
    }
    return context;
}

interface RecipeDetailDialogProps {
  children: React.ReactNode;
  recipes: RecipeWithImage[];
  userIngredients: string[];
}

export default function RecipeDetailDialog({ children, recipes, userIngredients }: RecipeDetailDialogProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeWithImage | null>(null);
  const { language } = useContext(LanguageContext);
  const t = content[language];
  
  const getRecipeName = (recipe: RecipeWithImage) => {
    return language === 'bn' ? recipe.name_bn : recipe.name_en;
  };

  const getRecipeInstructions = (recipe: RecipeWithImage) => {
    return language === 'bn' ? recipe.instructions_bn : recipe.instructions_en;
  };

  const highlightIngredients = (instructions: string) => {
    const userIngredientsLower = userIngredients.map(ing => ing.toLowerCase());
    const regex = new RegExp(`\\b(${userIngredientsLower.join('|')})\\b`, 'gi');
    return instructions.replace(regex, (match) => `<strong class="font-bold text-primary">${match}</strong>`);
  };

  return (
    <RecipeDetailDialogContext.Provider value={{ setSelectedRecipe }}>
        <Dialog open={!!selectedRecipe} onOpenChange={(isOpen) => !isOpen && setSelectedRecipe(null)}>
            {children}
            {selectedRecipe && (
                <DialogContent className="max-w-md p-0 gap-0">
                    <DialogHeader className="p-4 border-b">
                        <DialogTitle className="text-xl">{getRecipeName(selectedRecipe)}</DialogTitle>
                    </DialogHeader>
                    <div className="p-4 space-y-4 h-[70vh] overflow-y-auto">
                        {selectedRecipe.imageUrl ? (
                            <div className="relative w-full aspect-video rounded-lg overflow-hidden border shadow-sm bg-muted">
                                <Image src={selectedRecipe.imageUrl} alt={getRecipeName(selectedRecipe)} fill className="object-cover" data-ai-hint="recipe food" />
                            </div>
                        ) : (
                            <Skeleton className="w-full aspect-video rounded-lg" />
                        )}

                        <div className="flex gap-2">
                            <Badge variant="secondary">{selectedRecipe.totalTime}</Badge>
                            <Badge variant="secondary">{t.recipes.ingredientsUsed(selectedRecipe.ingredientsUsedCount)}</Badge>
                        </div>
                        
                        <div>
                            <h3 className="font-bold mb-2">{language === 'bn' ? 'নির্দেশাবলী' : 'Instructions'}</h3>
                            <p 
                                className="whitespace-pre-wrap text-foreground/80"
                                dangerouslySetInnerHTML={{ __html: highlightIngredients(getRecipeInstructions(selectedRecipe)) }}
                            />
                        </div>
                    </div>
                </DialogContent>
            )}
        </Dialog>
    </RecipeDetailDialogContext.Provider>
  );
}


const RecipeDetailDialogTrigger = ({ children, recipe }: { children: React.ReactNode, recipe: RecipeWithImage }) => {
    const { setSelectedRecipe } = useRecipeDetailDialog();
    return (
        <div onClick={() => setSelectedRecipe(recipe)} className="cursor-pointer">
            {children}
        </div>
    )
}

RecipeDetailDialog.Trigger = RecipeDetailDialogTrigger;
