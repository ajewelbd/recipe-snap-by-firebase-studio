import { useContext } from 'react';
import Link from 'next/link';
import { Globe, History, LogOut } from 'lucide-react';
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
import { AuthForm } from './auth-form';
import Logo from './logo';

export default function Header() {
  const { language, setLanguage } = useContext(LanguageContext);
  const t = content[language];
  const { user, loading, signOut } = useAuth();

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
              <span>{t.auth.logout}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
    return <AuthForm />;
  }

  return (
    <header className="bg-card border-b p-4">
      <div className="container mx-auto flex items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-3 flex-shrink-0">
          <Logo className="w-10 h-10" />
          <h1 className="text-2xl font-bold font-headline text-primary">
            {t.appName}
          </h1>
        </Link>
        <div className="flex items-center gap-2">
          {user && (
            <Link href="/history" prefetch={true}>
               <Button variant="outline" size="sm" className="relative md:w-auto w-9 p-0 md:px-3">
                  <History className="h-4 w-4" />
                  <span className="hidden md:inline ml-2">{t.history.title}</span>
                  <span className="sr-only">{t.history.title}</span>
               </Button>
            </Link>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
               <Button variant="outline" size="sm" className="relative md:w-auto w-9 p-0 md:px-3">
                  <Globe className="h-4 w-4" />
                  <span className="hidden md:inline ml-2">{t.languageName}</span>
                  <span className="sr-only">{t.languageName}</span>
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
