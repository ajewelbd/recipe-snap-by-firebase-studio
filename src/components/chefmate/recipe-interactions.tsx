
'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/context/auth-context';
import LikeButton from './like-button';
import CommentSection from './comment-section';
import { Skeleton } from '../ui/skeleton';

interface RecipeInteractionsProps {
    recipeId: string;
}

interface Like {
    user_id: string;
}

interface Comment {
    id: string;
    content: string;
    created_at: string;
    user_id: string;
    profiles: {
        full_name: string | null;
        avatar_url: string | null;
    } | null;
}

export default function RecipeInteractions({ recipeId }: RecipeInteractionsProps) {
    const { user } = useAuth();
    const [likes, setLikes] = useState<Like[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            
            const likesPromise = supabase
                .from('likes')
                .select('user_id')
                .eq('recipe_id', recipeId);

            const commentsPromise = supabase
                .from('comments')
                .select(`
                    id,
                    content,
                    created_at,
                    user_id,
                    profiles (
                        full_name,
                        avatar_url
                    )
                `)
                .eq('recipe_id', recipeId)
                .order('created_at', { ascending: false });

            const [likesRes, commentsRes] = await Promise.all([likesPromise, commentsPromise]);
            
            if (likesRes.error) {
                console.error('Error fetching likes:', likesRes.error.message);
            } else {
                setLikes(likesRes.data || []);
            }

            if (commentsRes.error) {
                console.error('Error fetching comments:', commentsRes.error.message);
            } else {
                setComments(commentsRes.data as Comment[] || []);
            }

            setIsLoading(false);
        };

        if (recipeId) {
            fetchData();
        }
        
        // Listen for real-time updates
        const channels = supabase.channel(`recipe-interactions-${recipeId}`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'likes', filter: `recipe_id=eq.${recipeId}` },
            (payload) => {
              // Refetch likes on any change
              fetchData();
            }
          )
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'comments', filter: `recipe_id=eq.${recipeId}` },
            (payload) => {
              // Refetch comments on any change
              fetchData();
            }
          )
          .subscribe()

        return () => {
            supabase.removeChannel(channels);
        }

    }, [recipeId]);
    
    if(isLoading) {
        return (
            <div className="space-y-6">
                 <div className="flex items-center gap-4">
                     <Skeleton className="h-10 w-24 rounded-md" />
                 </div>
                 <div>
                    <Skeleton className="h-8 w-40 mb-6" />
                    <div className="space-y-4">
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="flex items-start gap-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="flex-grow space-y-2">
                                    <Skeleton className="h-4 w-1/4" />
                                    <Skeleton className="h-4 w-3/4" />
                                </div>
                            </div>
                        ))}
                    </div>
                 </div>
            </div>
        )
    }

    const hasLiked = user ? likes.some(like => like.user_id === user.id) : false;
    const likeCount = likes.length;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <LikeButton recipeId={recipeId} hasLiked={hasLiked} likeCount={likeCount} />
            </div>
            <CommentSection comments={comments} recipeId={recipeId} />
        </div>
    );
}
