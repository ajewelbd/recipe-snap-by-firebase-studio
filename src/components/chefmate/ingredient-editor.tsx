
'use client';

import { useState, useContext, useEffect, useRef } from 'react';
import { Mic, X, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { LanguageContext, content } from '@/context/language-context';
import { useToast } from '@/hooks/use-toast';
import { extractIngredientsFromText } from '@/ai/flows/extract-ingredients-from-text';
import ImageUploaderDialog from './image-uploader-dialog';

interface IngredientEditorProps {
  ingredients: string[];
  setIngredients: (ingredients: string[]) => void;
  isLoading: boolean;
  setLastImageUrl: (url: string | null) => void;
}

// Check for SpeechRecognition API
const SpeechRecognition =
  (typeof window !== 'undefined' && window.SpeechRecognition) ||
  (typeof window !== 'undefined' && (window as any).webkitSpeechRecognition);

export default function IngredientEditor({
  ingredients,
  setIngredients,
  isLoading,
  setLastImageUrl
}: IngredientEditorProps) {
  const [newIngredient, setNewIngredient] = useState('');
  const { language } = useContext(LanguageContext);
  const t = content[language];
  const { toast } = useToast();

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const [isClient, setIsClient] = useState(false);
  const [isUploaderOpen, setIsUploaderOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleVoiceResult = async (spokenText: string) => {
    if (!spokenText) return;
    setIsListening(true); // Keep mic icon in listening state while processing
    try {
      const { ingredients: extractedIngredients } = await extractIngredientsFromText({ text: spokenText });
      if (extractedIngredients.length > 0) {
        setIngredients([...new Set([...ingredients, ...extractedIngredients])]);
      } else {
         toast({
          variant: 'default',
          title: 'No ingredients found',
          description: 'I couldn\'t find any ingredients in what you said. Please try again.'
         });
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
      setIngredients([...new Set([...ingredients, newIngredient.trim()])]);
      setNewIngredient('');
    }
  };

  const handleRemoveIngredient = (indexToRemove: number) => {
    setIngredients(ingredients.filter((_, index) => index !== indexToRemove));
  };

  const handleUploaderComplete = (newIngredients: string[], imageUrl: string) => {
    setIngredients([...new Set([...ingredients, ...newIngredients])]);
    setLastImageUrl(imageUrl);
    setIsUploaderOpen(false);
  }

  return (
    <div className="space-y-4">
       <ImageUploaderDialog 
          open={isUploaderOpen}
          onOpenChange={setIsUploaderOpen}
          onComplete={handleUploaderComplete}
       />
       <div className="flex gap-2">
         <Button 
            variant="outline"
            onClick={() => setIsUploaderOpen(true)}
            disabled={isLoading}
            className="h-12"
          >
           <Upload className="mr-2 h-5 w-5" />
            {t.uploader.uploadButton}
         </Button>
        <div className="relative flex-grow">
          <Input
              type="text"
              value={newIngredient}
              onChange={(e) => setNewIngredient(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddIngredient();
                }
              }}
              placeholder={t.ingredients.addPlaceholder}
              className="h-12 pl-4 pr-10 text-base"
              disabled={isLoading}
          />
          {isClient && SpeechRecognition && (
            <Button onClick={handleListen} variant="ghost" size="icon" aria-label={t.ingredients.voiceAriaLabel} disabled={isListening || isLoading} className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9">
                <Mic className={`h-5 w-5 ${isListening ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2 min-h-[2rem]">
        {ingredients.map((ingredient, index) => (
            <Badge key={index} variant="secondary" className="text-base py-1.5 px-3 flex items-center gap-2 rounded-full bg-secondary hover:bg-muted">
            {ingredient}
            <button
                onClick={() => handleRemoveIngredient(index)}
                disabled={isLoading}
                className="rounded-full hover:bg-gray-300 p-0.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={`Remove ${ingredient}`}
            >
                <X className="h-3.5 w-3.5" />
            </button>
            </Badge>
        ))}
         {newIngredient && (
            <Button onClick={handleAddIngredient} variant="ghost" className="text-muted-foreground hover:text-primary">
              {t.ingredients.addMore}
            </Button>
          )}
      </div>
    </div>
  );
}
