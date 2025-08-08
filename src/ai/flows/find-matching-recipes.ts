
'use server';

/**
 * @fileOverview Finds matching public recipes from the database based on a list of ingredients.
 *
 * - findMatchingRecipes - A function that finds recipes.
 * - FindMatchingRecipesInput - The input type for the findMatchingRecipes function.
 * - FindMatchingRecipesOutput - The return type for the findMatchingRecipes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { supabase } from '@/lib/supabase/client';
import { createSupabaseServerClient } from '@/lib/supabase/server';


const RecipeSchema = z.object({
    id: z.string(),
    title: z.string(),
    featured_image_url: z.string().nullable(),
    category: z.string().nullable(),
    created_at: z.string(),
    user_id: z.string(),
    is_public: z.boolean(),
    like_count: z.number(),
    comment_count: z.number(),
    has_liked: z.boolean(),
    ingredients: z.array(z.string()).nullable(),
});

const FindMatchingRecipesInputSchema = z.object({
  ingredients: z.array(z.string()).describe('A list of ingredients to search for.'),
});
export type FindMatchingRecipesInput = z.infer<typeof FindMatchingRecipesInputSchema>;

const FindMatchingRecipesOutputSchema = z.object({
  recipes: z.array(RecipeSchema).describe('A list of matching recipes from the database.'),
});
export type FindMatchingRecipesOutput = z.infer<typeof FindMatchingRecipesOutputSchema>;

export async function findMatchingRecipes(input: FindMatchingRecipesInput): Promise<FindMatchingRecipesOutput> {
  return findMatchingRecipesFlow(input);
}

const findMatchingRecipesFlow = ai.defineFlow(
  {
    name: 'findMatchingRecipesFlow',
    inputSchema: FindMatchingRecipesInputSchema,
    outputSchema: FindMatchingRecipesOutputSchema,
  },
  async ({ ingredients }) => {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    try {
        const { data, error } = await supabase
            .rpc('find_recipes_by_ingredients', { 
                p_ingredients: ingredients,
                p_request_user_id: user?.id
            });

      if (error) {
        throw new Error(`Supabase RPC error: ${error.message}`);
      }
      
      const parsedRecipes = z.array(RecipeSchema).safeParse(data);
      if (!parsedRecipes.success) {
          console.error("Zod parsing error:", parsedRecipes.error);
          throw new Error("Failed to parse recipes from database.");
      }

      return { recipes: parsedRecipes.data };
    } catch (error) {
      console.error("Error in findMatchingRecipesFlow:", error);
      return { recipes: [] };
    }
  }
);
