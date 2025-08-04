'use client';
import Header from '@/components/chefmate/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

export default function SuccessPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8 flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
            <CardHeader>
                <div className="mx-auto bg-primary/20 text-primary rounded-full h-16 w-16 flex items-center justify-center">
                    <CheckCircle className="h-10 w-10" />
                </div>
                <CardTitle className="mt-4">Recipe Saved!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <p className="text-muted-foreground">Your new recipe has been successfully saved to your collection.</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild>
                        <Link href="/my-recipes">View My Recipes</Link>
                    </Button>
                     <Button variant="outline" asChild>
                        <Link href="/my-recipes/new">Create Another Recipe</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
