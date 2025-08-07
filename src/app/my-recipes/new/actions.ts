
'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { categorizeRecipe } from '@/ai/flows/categorize-recipe';
import { analyzeRecipeNutrition } from '@/ai/flows/analyze-recipe-nutrition';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const FormSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  details: z.string().min(1, 'Recipe details are required.'),
  time_to_cook: z.string().optional(),
  is_public: z.boolean(),
});

export type FormState = {
  message: string;
  errors?: {
    title?: string[];
    details?: string[];
    time_to_cook?: string[];
    featured_image?: string[];
    result_images?: string[];
    database?: string[];
  };
  recipeId?: string;
};

async function uploadImage(supabase: ReturnType<typeof createSupabaseServerClient>, file: File, bucket: string, userId: string): Promise<string | null> {
    if (!file || file.size === 0) return null;
    
    const filePath = `${userId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

    if (uploadError) {
        console.error('Upload Error:', uploadError);
        throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
}

export async function saveRecipe(
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
  const userId = user.id;

  const validatedFields = FormSchema.safeParse({
    title: formData.get('title'),
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

  const { title, details, is_public, time_to_cook } = validatedFields.data;
  
  try {
    // 1. AI Categorization & Nutrition Analysis
    const [categorization, nutrition] = await Promise.all([
        categorizeRecipe({ title, details }),
        analyzeRecipeNutrition({ title, details })
    ]);
    
    // 2. Upload images
    const featured_image = formData.get('featured_image');
    let featuredImageUrl: string | null = null;
    if (featured_image instanceof File && featured_image.size > 0) {
        featuredImageUrl = await uploadImage(supabase, featured_image, 'recipe-images', userId);
    }

    const result_images = formData.getAll('result_images');
    let resultImageUrls: string[] = [];
    for (const file of result_images) {
        if (file instanceof File && file.size > 0) {
            const url = await uploadImage(supabase, file, 'recipe-images', userId);
            if (url) resultImageUrls.push(url);
        }
    }

    // 3. Save to database
    const { data: newRecipe, error: dbError } = await supabase.from('my_recipies').insert({
      user_id: userId,
      title,
      details,
      is_public,
      time_to_cook,
      featured_image_url: featuredImageUrl,
      result_image_urls: resultImageUrls.length > 0 ? resultImageUrls : null,
      tags: categorization.tags,
      category: categorization.category,
      nutrition: nutrition,
    }).select('id').single();

    if (dbError) {
      console.error('Database Error:', dbError);
      return { 
          message: 'Error',
          errors: { database: [`Failed to save recipe to the database. Details: ${dbError.message}`] } 
      };
    }

    revalidatePath('/my-recipes');
    return {
        message: 'Success',
        recipeId: newRecipe.id
    };

  } catch (error) {
    console.error('An unexpected error occurred in saveRecipe:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { 
        message: 'Error',
        errors: { database: [errorMessage] }
    };
  }
}
