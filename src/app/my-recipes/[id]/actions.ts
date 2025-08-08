
'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const CommentSchema = z.object({
    content: z.string().min(1, 'Comment cannot be empty.'),
    recipeId: z.string().uuid(),
});

export async function addComment(formData: FormData) {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'User not authenticated.' };
    }

    const validatedFields = CommentSchema.safeParse({
        content: formData.get('content'),
        recipeId: formData.get('recipeId'),
    });

    if (!validatedFields.success) {
        return { success: false, error: 'Invalid comment data.' };
    }

    const { content, recipeId } = validatedFields.data;

    const { error } = await supabase.from('comments').insert({
        content,
        recipe_id: recipeId,
        user_id: user.id,
    });

    if (error) {
        console.error('Error adding comment:', error);
        return { success: false, error: 'Failed to add comment.' };
    }

    revalidatePath(`/my-recipes/${recipeId}`);
    return { success: true };
}


export async function deleteComment(commentId: string, recipeId: string) {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'User not authenticated.' };
    }

    const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', user.id);

    if (error) {
        console.error('Error deleting comment:', error);
        return { success: false, error: 'Failed to delete comment.' };
    }

    revalidatePath(`/my-recipes/${recipeId}`);
    return { success: true };
}


export async function toggleLike(recipeId: string, hasLiked: boolean) {
    const supabase = createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: 'User not authenticated.' };
    }

    if (hasLiked) {
        // User has liked, so we need to unlike (delete the row)
        const { error } = await supabase
            .from('likes')
            .delete()
            .eq('recipe_id', recipeId)
            .eq('user_id', user.id);
        
        if (error) {
            console.error('Error unliking recipe:', error);
            return { success: false, error: 'Failed to unlike recipe.' };
        }
    } else {
        // User has not liked, so we need to like (insert a row)
        const { error } = await supabase.from('likes').insert({
            recipe_id: recipeId,
            user_id: user.id,
        });

        if (error) {
            console.error('Error liking recipe:', error);
            return { success: false, error: 'Failed to like recipe.' };
        }
    }

    revalidatePath(`/my-recipes/${recipeId}`);
    return { success: true };
}
