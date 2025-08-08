
'use client';

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useContext, createContext } from 'react';
import RecipeDetail from "./recipe-detail";
import { X } from "lucide-react";
import type { MyRecipe } from "./my-recipes-list";

interface SavedRecipeDetailDialogContextType {
    setSelectedRecipe: (recipe: MyRecipe | null) => void;
}

const SavedRecipeDetailDialogContext = createContext<SavedRecipeDetailDialogContextType | null>(null);

export const useSavedRecipeDetailDialog = () => {
    const context = useContext(SavedRecipeDetailDialogContext);
    if (!context) {
        throw new Error('useSavedRecipeDetailDialog must be used within a SavedRecipeDetailDialogProvider');
    }
    return context;
}

interface SavedRecipeDetailDialogProviderProps {
  children: React.ReactNode;
}

export function SavedRecipeDetailDialogProvider({ children }: SavedRecipeDetailDialogProviderProps) {
    const [selectedRecipe, setSelectedRecipe] = useState<MyRecipe | null>(null);

    const handleDialogClose = () => {
        setSelectedRecipe(null);
    };

    return (
        <SavedRecipeDetailDialogContext.Provider value={{ setSelectedRecipe }}>
            <Dialog open={!!selectedRecipe} onOpenChange={(isOpen) => !isOpen && handleDialogClose()}>
                {children}
                {selectedRecipe && (
                    <DialogContent className="max-w-4xl p-0">
                         <DialogHeader>
                            {/* This title is for accessibility. It is visually hidden but available to screen readers. */}
                            <DialogTitle className="sr-only">{selectedRecipe.title}</DialogTitle>
                        </DialogHeader>
                        <DialogClose className="absolute right-4 top-4 z-10 rounded-full p-1 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground bg-background/60 backdrop-blur-sm">
                            <X className="h-5 w-5" />
                            <span className="sr-only">Close</span>
                        </DialogClose>
                        <div className="p-6 md:p-8 h-[80vh] overflow-y-auto">
                            <RecipeDetail recipeId={selectedRecipe.id} />
                        </div>
                    </DialogContent>
                )}
            </Dialog>
        </SavedRecipeDetailDialogContext.Provider>
    );
}
