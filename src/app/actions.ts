
'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export async function toggleLike(recipeId: string, hasLiked: boolean) {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.error('User not authenticated');
        return;
    }

    if (hasLiked) {
        // Unlike
        await supabase.from('likes').delete().match({ recipe_id: recipeId, user_id: user.id });
    } else {
        // Like
        await supabase.from('likes').insert({ recipe_id: recipeId, user_id: user.id });
    }

    revalidatePath(`/my-recipes/${recipeId}`);
    revalidatePath(`/my-recipes`);
    revalidatePath(`/`);
}

export async function addComment(formData: FormData) {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.error('User not authenticated');
        return;
    }

    const content = formData.get('content') as string;
    const recipeId = formData.get('recipeId') as string;

    if (!content || !recipeId) {
        console.error('Missing content or recipeId');
        return;
    }
    
    await supabase.from('comments').insert({
        content,
        recipe_id: recipeId,
        user_id: user.id,
        user_full_name: user.user_metadata.full_name,
        user_avatar_url: user.user_metadata.avatar_url,
    });
    
    revalidatePath(`/my-recipes/${recipeId}`);
    revalidatePath(`/my-recipes`);
    revalidatePath(`/`);
}

export async function deleteComment(commentId: string, recipeId: string) {
     const supabase = createSupabaseServerClient();
     const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        console.error('User not authenticated');
        return;
    }

    await supabase.from('comments').delete().match({ id: commentId, user_id: user.id });

    revalidatePath(`/my-recipes/${recipeId}`);
    revalidatePath(`/my-recipes`);
    revalidatePath(`/`);
}

export async function deleteRecipe(recipeId: string) {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'User not authenticated' };
    }
    
    // First, fetch image URLs to delete them from storage
    const { data: recipeData, error: fetchError } = await supabase
        .from('my_recipies')
        .select('featured_image_url, result_image_urls')
        .eq('id', recipeId)
        .eq('user_id', user.id)
        .single();

    if (fetchError) {
        console.error('Error fetching recipe for deletion:', fetchError);
        return { error: 'Could not find the recipe to delete.' };
    }

    // Now, delete the recipe record from the table
    const { error: deleteError } = await supabase
        .from('my_recipies')
        .delete()
        .eq('id', recipeId);

    if (deleteError) {
        console.error('Error deleting recipe:', deleteError);
        return { error: 'Failed to delete the recipe.' };
    }

    // If deletion was successful, delete associated images from storage
    const urlsToDelete: string[] = [];
    if (recipeData.featured_image_url) {
        urlsToDelete.push(recipeData.featured_image_url);
    }
    if (recipeData.result_image_urls) {
        urlsToDelete.push(...recipeData.result_image_urls);
    }
    
    const filePaths = urlsToDelete.map(url => {
        const parts = url.split('/');
        return parts.slice(parts.indexOf('recipe-images')).join('/');
    });

    if (filePaths.length > 0) {
        const { error: storageError } = await supabase.storage
            .from('recipe-images')
            .remove(filePaths);
        if (storageError) {
            console.error("Error deleting images from storage, but recipe was deleted:", storageError);
            // Don't return an error to the user, as the main record is gone.
            // Log it for maintenance.
        }
    }

    revalidatePath('/my-recipes');
    revalidatePath('/');
    return { error: null };
}
