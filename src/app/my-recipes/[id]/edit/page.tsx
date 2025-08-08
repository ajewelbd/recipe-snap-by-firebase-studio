
'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import Header from '@/components/chefmate/header';
import NewRecipeForm from '@/components/chefmate/new-recipe-form';
import { notFound } from 'next/navigation';
import { updateRecipe } from './actions';


export default async function EditRecipePage({ params }: { params: { id: string } }) {
  const supabase = createSupabaseServerClient();
  const { id } = params;

  const { data: { user } } = await supabase.auth.getUser();

  const { data: recipe } = await supabase
    .from('my_recipies')
    .select('*')
    .eq('id', id)
    .single();

  if (!recipe || recipe.user_id !== user?.id) {
    notFound();
  }

  // Convert ingredients array back to a string for the form
  const recipeForForm = {
    ...recipe,
    ingredients: recipe.ingredients?.join(', ') || '',
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold font-headline text-primary mb-6">Edit Recipe</h1>
            <NewRecipeForm 
                action={updateRecipe}
                initialData={recipeForForm}
                submitText="Update Recipe"
            />
        </div>
      </main>
    </div>
  );
}

