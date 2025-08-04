'use server';

import { createSupabaseServerClient } from '@/lib/supabase';
import { categorizeRecipe } from '@/ai/flows/categorize-recipe';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  details: z.string().min(1, 'Recipe details are required.'),
  is_public: z.boolean(),
  featured_image: z.any().optional(),
  result_images: z.any().optional(),
});

export type FormState = {
  message: string;
  errors?: {
    title?: string[];
    details?: string[];
    featured_image?: string[];
    result_images?: string[];
    database?: string[];
  };
};

async function uploadImage(file: File, bucket: string): Promise<string | null> {
    if (!file || file.size === 0) return null;
    
    const supabase = createSupabaseServerClient();
    const userResponse = await supabase.auth.getUser();
    if (userResponse.error || !userResponse.data.user) {
        throw new Error('User not authenticated.');
    }
    const userId = userResponse.data.user.id;
    
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
  const userResponse = await supabase.auth.getUser();
  if (userResponse.error || !userResponse.data.user) {
    return {
        message: 'Error',
        errors: { database: ['User not authenticated. Please log in.'] },
    };
  }
  const userId = userResponse.data.user.id;

  const validatedFields = FormSchema.safeParse({
    title: formData.get('title'),
    details: formData.get('details'),
    is_public: formData.get('is_public') === 'on',
    featured_image: formData.get('featured_image'),
    result_images: formData.getAll('result_images'),
  });

  if (!validatedFields.success) {
    return {
      message: 'Validation Error',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { title, details, is_public, featured_image, result_images } = validatedFields.data;

  try {
    // 1. Categorize Recipe
    const categorization = await categorizeRecipe({ title, details });

    // 2. Upload images
    let featuredImageUrl: string | null = null;
    if (featured_image instanceof File && featured_image.size > 0) {
        featuredImageUrl = await uploadImage(featured_image, 'recipe-images');
    }

    let resultImageUrls: string[] = [];
     if (Array.isArray(result_images)) {
        for (const file of result_images) {
            if (file instanceof File && file.size > 0) {
                const url = await uploadImage(file, 'recipe-images');
                if (url) resultImageUrls.push(url);
            }
        }
    }


    // 3. Save to database
    const { error: dbError } = await supabase.from('my_recipies').insert({
      user_id: userId,
      title,
      details,
      is_public,
      featured_image_url: featuredImageUrl,
      result_image_urls: resultImageUrls.length > 0 ? resultImageUrls : null,
      tags: categorization.tags,
      category: categorization.category,
    });

    if (dbError) {
      console.error('Database Error:', dbError);
      return { 
          message: 'Error',
          errors: { database: ['Failed to save recipe to the database.'] } 
      };
    }
  } catch (error) {
    console.error('An unexpected error occurred:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
    return { 
        message: 'Error',
        errors: { database: [errorMessage] }
    };
  }
  
  // Revalidate and redirect on success
  revalidatePath('/my-recipes');
  redirect('/my-recipes/new/success');
}
