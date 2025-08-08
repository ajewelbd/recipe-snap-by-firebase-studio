
'use client';

import { useAuth } from '@/context/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { addComment, deleteComment } from '@/app/actions';
import { useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Loader2, Send, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { CommentWithProfile } from './recipe-interactions';


interface CommentSectionProps {
    comments: CommentWithProfile[];
    recipeId: string;
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" size="icon" disabled={pending} aria-label="Post comment">
            {pending ? <Loader2 className="animate-spin" /> : <Send />}
        </Button>
    )
}

function DeleteButton({ comment, recipeId }: { comment: CommentWithProfile, recipeId: string }) {
    const { pending } = useFormStatus();
    return (
         <Button
            type="submit"
            variant="ghost"
            size="icon"
            className="w-7 h-7 text-muted-foreground hover:text-destructive"
            disabled={pending}
            aria-label="Delete comment"
        >
           {pending ? <Loader2 className="animate-spin h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
        </Button>
    )
}


export default function CommentSection({ comments, recipeId }: CommentSectionProps) {
    const { user, loading } = useAuth();
    const formRef = useRef<HTMLFormElement>(null);
    
    if (loading) return null;
    
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold font-headline">{comments.length} Comments</h3>
            {user ? (
                <form 
                    ref={formRef}
                    action={async (formData) => {
                        await addComment(formData);
                        formRef.current?.reset();
                    }} 
                    className="flex items-start gap-4"
                >
                    <Avatar className="h-10 w-10 border">
                        <AvatarImage src={user.user_metadata?.avatar_url || ''} alt={user.user_metadata?.full_name || 'User'} />
                        <AvatarFallback>{user.user_metadata?.full_name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-grow flex items-center gap-2">
                        <Textarea
                            name="content"
                            placeholder="Add a comment..."
                            className="text-base"
                            rows={1}
                            required
                        />
                         <input type="hidden" name="recipeId" value={recipeId} />
                        <SubmitButton />
                    </div>
                </form>
            ) : (
                <p className="text-muted-foreground">Please log in to add a comment.</p>
            )}

            <div className="space-y-4">
                {comments.map(comment => (
                    <div key={comment.id} className="flex items-start gap-4">
                        <Avatar className="h-10 w-10 border">
                            <AvatarImage src={comment.user_avatar_url || ''} alt={comment.user_full_name || 'User'} />
                            <AvatarFallback>{comment.user_full_name?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-grow">
                            <div className="flex items-center justify-between">
                               <div className="flex items-center gap-2">
                                  <span className="font-semibold">{comment.user_full_name || 'Anonymous'}</span>
                                  <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
                               </div>
                                {user?.id === comment.user_id && (
                                    <form action={() => deleteComment(comment.id, recipeId)}>
                                        <DeleteButton comment={comment} recipeId={recipeId} />
                                    </form>
                                )}
                            </div>
                            <p className="text-foreground/90">{comment.content}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
