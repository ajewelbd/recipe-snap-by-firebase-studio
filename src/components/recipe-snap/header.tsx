import { ChefHat } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-card border-b p-4">
      <div className="container mx-auto flex items-center gap-4">
        <ChefHat className="w-8 h-8 text-primary" />
        <h1 className="text-2xl font-bold font-headline text-primary">
          Recipe Snap
        </h1>
      </div>
    </header>
  );
}
