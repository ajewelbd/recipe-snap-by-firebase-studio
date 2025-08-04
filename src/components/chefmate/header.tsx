
'use client';
import { useContext, useState } from 'react';
import Link from 'next/link';
import { Globe, History, LogOut, Moon, Sun, Palette, Menu, Soup } from 'lucide-react';
import { useTheme } from "next-themes";
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
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';


export default function Header() {
  const { language, setLanguage } = useContext(LanguageContext);
  const t = content[language];
  const { user, loading, signOut } = useAuth();
  const { setTheme, theme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const UserMenu = ({ isMobile = false }: { isMobile?: boolean }) => {
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
             <Button variant={isMobile ? 'ghost' : 'ghost'} className={`relative h-9 ${isMobile ? 'w-full justify-start gap-2 px-2' : 'w-9 rounded-full'}`}>
              <Avatar className="h-9 w-9">
                <AvatarImage src={avatarUrl || ''} alt={displayName || 'User'} />
                <AvatarFallback>{displayName?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
              </Avatar>
              {isMobile && (
                <div className="flex flex-col items-start">
                  <p className="text-sm font-medium leading-none">{displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{email}</p>
                </div>
              )}
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
            <DropdownMenuItem onClick={() => {
              signOut();
              if(isMobile) setIsMobileMenuOpen(false);
            }}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>{t.auth.logout}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
    return <AuthForm />;
  }

  const navLinks = (
    <>
      {user && (
        <>
        <Link href="/my-recipes/new" prefetch={true} onClick={() => setIsMobileMenuOpen(false)}>
            <Button variant="ghost" className="w-full justify-start gap-2 px-2">
              <Soup className="h-4 w-4" />
              <span>New Recipe</span>
            </Button>
        </Link>
        <Link href="/history" prefetch={true} onClick={() => setIsMobileMenuOpen(false)}>
            <Button variant="ghost" className="w-full justify-start gap-2 px-2">
              <History className="h-4 w-4" />
              <span>{t.history.title}</span>
            </Button>
        </Link>
        </>
      )}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-2 px-2">
              <Globe className="h-4 w-4" />
              <span>{t.languageName}</span>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup value={language} onValueChange={(value) => {
            setLanguage(value as 'en' | 'bn');
            setIsMobileMenuOpen(false);
          }}>
            <DropdownMenuRadioItem value="en">English</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="bn">বাংলা</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-2 px-2">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute left-2 h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span>Toggle theme</span>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="theme-indigo">Indigo</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="theme-green-orange">Green/Orange</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );

  const desktopNavLinks = (
     <>
      {user && (
        <>
        <Link href="/my-recipes/new" prefetch={true}>
            <Button variant="outline" size="sm" className="relative md:w-auto w-9 p-0 md:px-3">
              <Soup className="h-4 w-4" />
              <span className="hidden md:inline ml-2">New Recipe</span>
              <span className="sr-only">New Recipe</span>
            </Button>
        </Link>
        <Link href="/history" prefetch={true}>
            <Button variant="outline" size="sm" className="relative md:w-auto w-9 p-0 md:px-3">
              <History className="h-4 w-4" />
              <span className="hidden md:inline ml-2">{t.history.title}</span>
              <span className="sr-only">{t.history.title}</span>
            </Button>
        </Link>
        </>
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="relative w-9 h-9">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <Palette className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 theme-indigo:rotate-0 theme-indigo:scale-100 theme-green-orange:rotate-0 theme-green-orange:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="theme-indigo">Indigo</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="theme-green-orange">Green/Orange</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );


  return (
    <header className="bg-card border-b p-4">
      <div className="container mx-auto flex items-center justify-between gap-2">
        <Link href="/" className="flex items-center gap-3 flex-shrink-0">
          <Logo className="w-10 h-10" />
          <h1 className="text-2xl font-bold font-headline text-primary">
            {t.appName}
          </h1>
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-1 sm:gap-2">
          {desktopNavLinks}
          <UserMenu />
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-9 w-9" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-3/4">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col space-y-2 pt-6">
                <div className="mb-4"><UserMenu isMobile={true} /></div>
                {navLinks}
              </div>
            </SheetContent>
          </Sheet>
        </div>

      </div>
    </header>
  );
}
