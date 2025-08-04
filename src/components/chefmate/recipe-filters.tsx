
'use client';

import { useContext } from "react";
import { Button } from "@/components/ui/button";
import { LanguageContext, content } from "@/context/language-context";

export default function RecipeFilters() {
  const { language } = useContext(LanguageContext);
  const t = content[language];

  return (
    <div className="flex items-center gap-2">
      <Button variant="ghost" className="text-muted-foreground">{t.recipes.filters.cuisine}</Button>
      <Button variant="ghost" className="text-muted-foreground">{t.recipes.filters.diet}</Button>
      <Button variant="ghost" className="text-muted-foreground">{t.recipes.filters.time}</Button>
    </div>
  );
}
