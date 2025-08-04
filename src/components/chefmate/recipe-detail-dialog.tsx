
'use client';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { type RecipeWithImage } from '@/app/page';
import { useState, useContext, createContext } from 'react';
import Image from "next/image";
import { Skeleton } from "../ui/skeleton";
import { LanguageContext, content } from "@/context/language-context";
import { Badge } from "../ui/badge";
import { Volume2, Loader2, X } from "lucide-react";
import { Button } from "../ui/button";
import { generateRecipeSpeech } from "@/ai/flows/generate-recipe-speech";
import { useToast } from "@/hooks/use-toast";


interface RecipeDetailDialogContextType {
    setSelectedRecipe: (recipe: RecipeWithImage | null) => void;
}

const RecipeDetailDialogContext = createContext<RecipeDetailDialogContextType | null>(null);

export const useRecipeDetailDialog = () => {
    const context = useContext(RecipeDetailDialogContext);
    if (!context) {
        throw new Error('useRecipeDetailDialog must be used within a RecipeDetailDialogProvider');
    }
    return context;
}

interface RecipeDetailDialogProviderProps {
  children: React.ReactNode;
  userIngredients: string[];
}

export function RecipeDetailDialogProvider({ children, userIngredients }: RecipeDetailDialogProviderProps) {
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeWithImage | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const { language } = useContext(LanguageContext);
  const t = content[language];
  const { toast } = useToast();
  
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

  const handleListen = async (text: string) => {
    if (!text) return;
    setIsLoadingAudio(true);
    setAudioUrl(null);
    try {
        const result = await generateRecipeSpeech({ text });
        setAudioUrl(result.audioDataUri);
    } catch (error) {
        console.error("Error generating speech:", error);
        toast({
            variant: 'destructive',
            title: t.toast.error.title,
            description: t.toast.error.speech,
        });
    } finally {
        setIsLoadingAudio(false);
    }
  }

  const handleDialogClose = () => {
    setSelectedRecipe(null);
    setAudioUrl(null);
    setIsLoadingAudio(false);
  }

  return (
    <RecipeDetailDialogContext.Provider value={{ setSelectedRecipe }}>
        <Dialog open={!!selectedRecipe} onOpenChange={(isOpen) => !isOpen && handleDialogClose()}>
            {children}
            {selectedRecipe && (
                <DialogContent className="max-w-md sm:rounded-lg">
                    <DialogHeader className="p-4 border-b flex-row items-center justify-between">
                        <DialogTitle className="text-xl truncate">{getRecipeName(selectedRecipe)}</DialogTitle>
                         <DialogClose className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                            <X className="h-4 w-4" />
                            <span className="sr-only">Close</span>
                        </DialogClose>
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
                            <Badge variant="outline">{selectedRecipe.totalTime}</Badge>
                            <Badge variant="outline">{t.recipes.ingredientsUsed(selectedRecipe.ingredientsUsedCount)}</Badge>
                        </div>
                        
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold">{language === 'bn' ? 'নির্দেশাবলী' : 'Instructions'}</h3>
                                <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    onClick={() => handleListen(getRecipeInstructions(selectedRecipe))}
                                    disabled={isLoadingAudio}
                                    aria-label={t.recipes.listen}
                                >
                                    {isLoadingAudio ? <Loader2 className="animate-spin" /> : <Volume2 />}
                                </Button>
                            </div>
                            {audioUrl && !isLoadingAudio && (
                                <div className="mb-2">
                                    <audio controls src={audioUrl} className="w-full h-10">
                                        Your browser does not support the audio element.
                                    </audio>
                                </div>
                            )}
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

export default {
    Provider: RecipeDetailDialogProvider,
    Trigger: RecipeDetailDialogTrigger,
};
