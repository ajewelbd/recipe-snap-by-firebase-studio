
'use client';

import {
  Dialog,
  DialogClose,
  DialogContent,
} from "@/components/ui/dialog";
import { useState, useContext, createContext } from 'react';
import RecipeDetail from "./recipe-detail";
import { X } from "lucide-react";

interface SavedRecipeDetailDialogContextType {
    setSelectedRecipe: (recipeId: string | null) => void;
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
    const [selectedRecipeId, setSelectedRecipeId] = useState<string | null>(null);

    const handleDialogClose = () => {
        setSelectedRecipeId(null);
    };

    return (
        <SavedRecipeDetailDialogContext.Provider value={{ setSelectedRecipe: setSelectedRecipeId }}>
            <Dialog open={!!selectedRecipeId} onOpenChange={(isOpen) => !isOpen && handleDialogClose()}>
                {children}
                {selectedRecipeId && (
                    <DialogContent className="max-w-4xl p-0">
                        <DialogClose className="absolute right-4 top-4 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                            <X className="h-5 w-5" />
                            <span className="sr-only">Close</span>
                        </DialogClose>
                        <div className="p-6 md:p-8 h-[80vh] overflow-y-auto">
                            <RecipeDetail recipeId={selectedRecipeId} />
                        </div>
                    </DialogContent>
                )}
            </Dialog>
        </SavedRecipeDetailDialogContext.Provider>
    );
}
