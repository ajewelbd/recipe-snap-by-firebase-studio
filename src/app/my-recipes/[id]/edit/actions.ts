
'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { categorizeRecipe } from '@/ai/flows/categorize-recipe';
import { analyzeRecipeNutrition } from '@/ai/flows/analyze-recipe-nutrition';
import type { AnalyzeRecipeNutritionOutput } from '@/ai/flows/analyze-recipe-nutrition';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Title is required.'),
  ingredients: z.string().min(1, 'Ingredients are required.'),
  details: z.string().min(1, 'Recipe details are required.'),
  time_to_cook: z.string().optional(),
  is_public: z.boolean(),
});

export type FormState = {
  message: string;
  errors?: {
    title?: string[];
    ingredients?: string[];
    details?: string[];
    time_to_cook?: string[];
    database?: string[];
  };
};

export async function updateRecipe(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
        message: 'Error',
        errors: { database: ['User not authenticated. Please log in.'] },
    };
  }

  const validatedFields = FormSchema.safeParse({
    id: formData.get('id'),
    title: formData.get('title'),
    ingredients: formData.get('ingredients'),
    details: formData.get('details'),
    time_to_cook: formData.get('time_to_cook'),
    is_public: formData.get('is_public') === 'on',
  });

  if (!validatedFields.success) {
    return {
      message: 'Validation Error',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { id, title, details, ingredients, is_public, time_to_cook } = validatedFields.data;
  
  const ingredientsArray = ingredients
    .split(/,|\band\b/i)
    .map(ing => ing.trim())
    .filter(Boolean);

  let categorization: { tags: string[], category: string };
  let nutrition: AnalyzeRecipeNutritionOutput | null;

  try {
    const [catResult, nutResult] = await Promise.all([
        categorizeRecipe({ title, details }),
        analyzeRecipeNutrition({ title, details })
    ]);
    categorization = catResult;
    nutrition = nutResult;
  } catch (aiError) {
    console.error('AI processing error during update:', aiError);
    categorization = { tags: [], category: 'Uncategorized' };
    nutrition = null;
  }
  
  try {
    const { error: dbError } = await supabase.from('my_recipies').update({
      title,
      details,
      ingredients: ingredientsArray,
      is_public,
      time_to_cook,
      tags: categorization.tags,
      category: categorization.category,
      nutrition: nutrition,
    }).eq('id', id).eq('user_id', user.id);

    if (dbError) {
      console.error('Database Update Error:', dbError);
      return { 
          message: 'Error',
          errors: { database: [`Failed to update recipe. Details: ${dbError.message}`] } 
      };
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { 
        message: 'Error',
        errors: { database: [errorMessage] }
    };
  }

  revalidatePath(`/my-recipes/${id}`);
  revalidatePath('/my-recipes');
  revalidatePath('/');
  redirect(`/my-recipes/${id}`);
}
