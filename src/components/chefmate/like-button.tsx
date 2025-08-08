
'use client';

import { useAuth } from '@/context/auth-context';
import { Button } from '../ui/button';
import { Heart, Loader2 } from 'lucide-react';
import { toggleLike } from '@/app/my-recipes/[id]/actions';
import { useTransition } from 'react';

interface LikeButtonProps {
    likeCount: number;
    hasLiked: boolean;
    recipeId: string;
}

export default function LikeButton({ likeCount, hasLiked, recipeId }: LikeButtonProps) {
    const { user, loading: authLoading } = useAuth();
    const [isPending, startTransition] = useTransition();

    const handleLike = () => {
        if (!user) return; // Or prompt to login
        startTransition(async () => {
            await toggleLike(recipeId, hasLiked);
        });
    }

    if (authLoading) {
        return (
            <Button variant="outline" disabled>
                <Loader2 className="mr-2 animate-spin" />
                Loading...
            </Button>
        );
    }
    
    return (
        <Button 
            variant="outline" 
            onClick={handleLike} 
            disabled={!user || isPending}
        >
            {isPending ? (
                 <Loader2 className="mr-2 animate-spin" />
            ) : (
                <Heart className={`mr-2 ${hasLiked ? 'text-red-500 fill-current' : ''}`} />
            )}
            {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
        </Button>
    )
}
