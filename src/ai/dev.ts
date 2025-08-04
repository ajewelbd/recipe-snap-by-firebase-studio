import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-image-ingredients.ts';
import '@/ai/flows/suggest-recipes.ts';
import '@/ai/flows/generate-recipe-speech.ts';
import '@/ai/flows/find-youtube-videos.ts';
import '@/ai/flows/extract-ingredients-from-text.ts';
import '@/ai/flows/generate-recipe-image.ts';
import '@/ai/flows/categorize-recipe.ts';
