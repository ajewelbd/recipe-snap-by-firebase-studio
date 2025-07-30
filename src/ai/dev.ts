import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-image-ingredients.ts';
import '@/ai/flows/suggest-recipes.ts';
import '@/ai/flows/generate-recipe-speech.ts';
