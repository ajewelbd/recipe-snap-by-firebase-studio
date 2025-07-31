
'use client';

import { useState, useContext } from 'react';
import { Trash2, Plus, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LanguageContext, content } from '@/context/language-context';
import { Skeleton } from '../ui/skeleton';

interface IngredientEditorProps {
  ingredients: string[];
  setIngredients: React.Dispatch<React.SetStateAction<string[]>>;
  onGetRecipes: () => void;
  isLoading: boolean;
  isImageLoading: boolean;
  analysisPerformed: boolean;
}

export default function IngredientEditor({
  ingredients,
  setIngredients,
  onGetRecipes,
  isLoading,
  isImageLoading,
  analysisPerformed,
}: IngredientEditorProps) {
  const [newIngredient, setNewIngredient] = useState('');
  const { language } = useContext(LanguageContext);
  const t = content[language];

  const handleAddIngredient = () => {
    if (newIngredient.trim() !== '') {
      setIngredients([...ingredients, newIngredient.trim()]);
      setNewIngredient('');
    }
  };

  const handleRemoveIngredient = (indexToRemove: number) => {
    setIngredients(ingredients.filter((_, index) => index !== indexToRemove));
  };

  const renderContent = () => {
    if (isImageLoading) {
        return (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-4/5" />
            </div>
          );
    }

    if (analysisPerformed && ingredients.length === 0) {
        return (
            <div className="text-center text-muted-foreground p-4 bg-muted rounded-md">
                {t.ingredients.notFound}
            </div>
        )
    }

    return (
        <>
            <div className="flex flex-wrap gap-2 min-h-[2.5rem]">
            {ingredients.map((ingredient, index) => (
                <Badge key={index} variant="secondary" className="text-base py-1 pl-3 pr-2 flex items-center gap-2">
                {ingredient}
                <button
                    onClick={() => handleRemoveIngredient(index)}
                    className="rounded-full hover:bg-muted-foreground/20 p-0.5 transition-colors"
                    aria-label={`Remove ${ingredient}`}
                >
                    <Trash2 className="h-3 w-3" />
                </button>
                </Badge>
            ))}
            </div>

            <div className="flex gap-2">
            <Input
                type="text"
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddIngredient()}
                placeholder={t.ingredients.addPlaceholder}
            />
            <Button onClick={handleAddIngredient} variant="outline" size="icon" aria-label={t.ingredients.addAriaLabel}>
                <Plus className="h-4 w-4" />
            </Button>
            </div>
        </>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.ingredients.title}</CardTitle>
        <CardDescription>{t.ingredients.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {renderContent()}
        <Button onClick={onGetRecipes} disabled={ingredients.length === 0 || isLoading || isImageLoading} className="w-full bg-primary hover:bg-primary/90">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t.ingredients.loading}
            </>
          ) : (
            t.ingredients.getButton
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
