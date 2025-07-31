import { useContext } from 'react';
import Link from 'next/link';
import { ChefHat, Globe, History, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { LanguageContext, content } from '@/context/language-context';
import { useAuth } from '@/context/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Skeleton } from '../ui/skeleton';

export default function Header() {
  const { language, setLanguage } = useContext(LanguageContext);
  const t = content[language];
  const { user, loading, signInWithGoogle, signOut } = useAuth();

  const UserMenu = () => {
    if (loading) {
      return <Skeleton className="h-9 w-24" />;
    }
    if (user) {
      const displayName = user.user_metadata?.full_name || user.email;
      const avatarUrl = user.user_metadata?.avatar_url;
      const email = user.email;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={avatarUrl || ''} alt={displayName || 'User'} />
                <AvatarFallback>{displayName?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{displayName}</p>
                <p className="text-xs leading-none text-muted-foreground">{email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>{language === 'en' ? 'Log out' : 'লগ আউট'}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
    return (
      <Button onClick={signInWithGoogle} variant="outline" size="sm">
        {language === 'en' ? 'Login' : 'লগইন'}
      </Button>
    )
  }

  return (
    <header className="bg-card border-b p-4">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/" className="flex items-center gap-2 md:gap-4">
            <ChefHat className="w-6 h-6 md:w-8 md:h-8 text-primary" />
            <h1 className="text-xl md:text-2xl font-bold font-headline text-primary">
              {t.appName}
            </h1>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {user && (
            <Link href="/history" prefetch={true}>
              <Button variant="outline" size="sm">
                <History className="mr-2 h-4 w-4" />
                {language === 'en' ? 'History' : 'ইতিহাস'}
              </Button>
            </Link>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Globe className="mr-2 h-4 w-4" />
                {t.languageName}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuRadioGroup value={language} onValueChange={(value) => setLanguage(value as 'en' | 'bn')}>
                <DropdownMenuRadioItem value="en">English</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="bn">বাংলা</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
