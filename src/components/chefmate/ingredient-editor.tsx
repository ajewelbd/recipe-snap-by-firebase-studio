
'use client';

import { useState, useContext, useEffect, useRef } from 'react';
import { Trash2, Plus, Loader2, Mic } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LanguageContext, content } from '@/context/language-context';
import { Skeleton } from '../ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { extractIngredientsFromText } from '@/ai/flows/extract-ingredients-from-text';

interface IngredientEditorProps {
  ingredients: string[];
  setIngredients: (ingredients: string[]) => void;
  onGetRecipes: () => void;
  isLoading: boolean;
  isImageLoading: boolean;
  analysisPerformed: boolean;
  remainingSearches?: number;
}

// Check for SpeechRecognition API
const SpeechRecognition =
  (typeof window !== 'undefined' && window.SpeechRecognition) ||
  (typeof window !== 'undefined' && (window as any).webkitSpeechRecognition);

export default function IngredientEditor({
  ingredients,
  setIngredients,
  onGetRecipes,
  isLoading,
  isImageLoading,
  analysisPerformed,
  remainingSearches
}: IngredientEditorProps) {
  const [newIngredient, setNewIngredient] = useState('');
  const { language } = useContext(LanguageContext);
  const t = content[language];
  const { toast } = useToast();

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleVoiceResult = async (spokenText: string) => {
    if (!spokenText) return;
    setIsListening(true); // Keep mic icon in listening state while processing
    try {
      const { ingredients: extractedIngredients } = await extractIngredientsFromText({ text: spokenText });
      if (extractedIngredients.length > 0) {
        setIngredients([...ingredients, ...extractedIngredients]);
      }
    } catch (error) {
      console.error('Error extracting ingredients from text:', error);
       toast({
        variant: 'destructive',
        title: 'Voice Error',
        description: 'Sorry, I had trouble understanding the ingredients.'
       });
    } finally {
      setIsListening(false);
    }
  };


  useEffect(() => {
    if (!SpeechRecognition) {
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language === 'bn' ? 'bn-BD' : 'en-US';

    recognition.onresult = (event: any) => {
      const spokenText = event.results[0][0].transcript;
      handleVoiceResult(spokenText);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        toast({
            variant: 'destructive',
            title: 'Microphone Access Denied',
            description: 'Please enable microphone permissions in your browser settings to use voice input.'
        });
      }
      setIsListening(false);
    };
    
    recognition.onend = () => {
        setIsListening(false);
    }

    recognitionRef.current = recognition;
  }, [language, ingredients, setIngredients, toast]);
  
  const handleListen = () => {
    if (isListening || !recognitionRef.current) {
      return;
    }
    try {
        recognitionRef.current.start();
        setIsListening(true);
    } catch(e) {
        console.error("Could not start recognition", e);
        setIsListening(false);
    }
  };


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

    if (ingredients.length > 0) {
        return (
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
        )
    }
    
    return null;
  }

  const getRecipesDisabled = ingredients.length === 0 || isLoading || isImageLoading || (remainingSearches !== undefined && remainingSearches <= 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.ingredients.title}</CardTitle>
        <CardDescription>{t.ingredients.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {renderContent()}
        
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
          {isClient && SpeechRecognition && (
            <Button onClick={handleListen} variant={isListening ? 'destructive' : 'outline'} size="icon" aria-label={t.ingredients.voiceAriaLabel} disabled={isListening}>
                <Mic className={`h-4 w-4 ${isListening ? 'animate-pulse' : ''}`} />
            </Button>
          )}
        </div>

        <Button onClick={onGetRecipes} disabled={getRecipesDisabled} className="w-full bg-primary hover:bg-primary/90">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t.ingredients.loading}
            </>
          ) : (
            t.ingredients.getButton
          )}
        </Button>

        {remainingSearches !== undefined && (
          <p className="text-center text-sm text-muted-foreground">
            {remainingSearches > 0
              ? t.ingredients.searchesLeft(remainingSearches)
              : t.ingredients.loginForMore}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
