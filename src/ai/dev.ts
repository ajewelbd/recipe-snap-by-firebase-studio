import { config } from 'dotenv';
config();

import '@/ai/flows/analyze-image-ingredients.ts';
import '@/ai/flows/suggest-recipes.ts';
import '@/ai/flows/find-related-videos.ts';