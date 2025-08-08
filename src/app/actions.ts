
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
