
'use client';
import { useActionState, useEffect, useMemo, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import { saveRecipe, type FormState as SaveFormState } from '@/app/my-recipes/new/actions';
import { type FormState as UpdateFormState } from '@/app/my-recipes/[id]/edit/actions';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import ImageUploader from './image-uploader';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { LanguageContext, content } from '@/context/language-context';

interface NewRecipeFormProps {
    action?: (prevState: UpdateFormState, formData: FormData) => Promise<UpdateFormState>;
    initialData?: {
        id: string;
        title: string;
        ingredients: string;
        details: string;
        time_to_cook: string | null;
        is_public: boolean;
    };
    submitText?: string;
}

function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {text}
    </Button>
  );
}

export default function NewRecipeForm({
    action = saveRecipe,
    initialData,
    submitText
}: NewRecipeFormProps) {
  const isEditing = !!initialData;
  const router = useRouter();
  const { language } = useContext(LanguageContext);
  const t = content[language].newRecipe;

  const finalSubmitText = submitText || (isEditing ? t.updateButton : t.saveButton);

  const initialState: SaveFormState | UpdateFormState = useMemo(() => ({
    message: '',
    errors: {}
  }), []);

  const [state, dispatch] = useActionState(action, initialState);

  useEffect(() => {
    if (state.message === 'Success' && (state as SaveFormState).recipeId) {
      router.push('/my-recipes/new/success');
    }
  }, [state, router]);

  return (
    <form action={dispatch} className="space-y-8">
      {isEditing && initialData && <input type="hidden" name="id" value={initialData.id} />}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-lg">{t.titleLabel}</Label>
        <Input
          id="title"
          name="title"
          placeholder={t.titlePlaceholder}
          required
          className="text-base"
          defaultValue={initialData?.title}
        />
        {state.errors?.title && (
          <p className="text-sm text-destructive">{state.errors.title[0]}</p>
        )}
      </div>

       <div className="space-y-2">
        <Label htmlFor="ingredients" className="text-lg">{t.ingredientsLabel}</Label>
        <Textarea
          id="ingredients"
          name="ingredients"
          placeholder={t.ingredientsPlaceholder}
          required
          rows={5}
          className="text-base"
          defaultValue={initialData?.ingredients}
        />
        {state.errors?.ingredients && (
          <p className="text-sm text-destructive">{state.errors.ingredients[0]}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="time_to_cook" className="text-lg">{t.timeLabel}</Label>
        <Input
          id="time_to_cook"
          name="time_to_cook"
          placeholder={t.timePlaceholder}
          className="text-base"
          defaultValue={initialData?.time_to_cook || ''}
        />
        {state.errors?.time_to_cook && (
          <p className="text-sm text-destructive">{state.errors.time_to_cook[0]}</p>
        )}
      </div>

      {!isEditing && (
        <>
            <div className="space-y-2">
                <Label htmlFor="featured_image" className="text-lg">{t.featuredImageLabel}</Label>
                <ImageUploader name="featured_image" multiple={false} />
                {state.errors?.featured_image && (
                <p className="text-sm text-destructive">{state.errors.featured_image[0]}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="details" className="text-lg">{t.detailsLabel}</Label>
                <Textarea
                id="details"
                name="details"
                placeholder={t.detailsPlaceholder}
                required
                rows={15}
                className="text-base"
                defaultValue={initialData?.details}
                />
                {state.errors?.details && (
                <p className="text-sm text-destructive">{state.errors.details[0]}</p>
                )}
            </div>

            <div className="space-y-2">
                <Label htmlFor="result_images" className="text-lg">{t.resultPhotosLabel}</Label>
                <ImageUploader name="result_images" multiple={true} />
                {state.errors?.result_images && (
                <p className="text-sm text-destructive">{state.errors.result_images[0]}</p>
                )}
            </div>
        </>
      )}

       {isEditing && (
         <div className="space-y-2">
            <Label htmlFor="details" className="text-lg">{t.detailsLabel}</Label>
            <Textarea
            id="details"
            name="details"
            placeholder={t.detailsPlaceholder}
            required
            rows={15}
            className="text-base"
            defaultValue={initialData?.details}
            />
            {state.errors?.details && (
            <p className="text-sm text-destructive">{state.errors.details[0]}</p>
            )}
        </div>
      )}


      <div className="flex items-center space-x-4 rounded-lg border p-4">
        <Switch id="is_public" name="is_public" defaultChecked={initialData?.is_public ?? true}/>
        <div className="flex flex-col">
            <Label htmlFor="is_public" className="text-base">{t.publicLabel}</Label>
            <p className="text-sm text-muted-foreground">{t.publicDescription}</p>
        </div>
      </div>
      
      {state.errors?.database && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{state.errors.database[0]}</AlertDescription>
          </Alert>
        )}

      <SubmitButton text={finalSubmitText} />
    </form>
  );
}
