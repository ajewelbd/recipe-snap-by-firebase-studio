'use client';
import { useContext, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/auth-context';
import { LanguageContext, content } from '@/context/language-context';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { MailCheck, X } from 'lucide-react';

export function AuthForm() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const { signInWithPassword, signUp } = useAuth();
  const { language } = useContext(LanguageContext);
  const t = content[language].auth;
  const { toast } = useToast();

  const handleAuthAction = async (action: 'login' | 'signup') => {
    setIsSubmitting(true);
    setError(null);
    let authError = null;

    if (action === 'login') {
      const { error } = await signInWithPassword({ email, password });
      authError = error;
    } else {
      const { error } = await signUp({ email, password, fullName });
      if (!error) {
        setShowSuccessMessage(true);
      }
      authError = error;
    }

    setIsSubmitting(false);

    if (authError) {
      if (authError.message.includes('Invalid login credentials')) {
        setError(t.errors.invalid);
      } else if (authError.message.includes('Email not confirmed')) {
        setShowSuccessMessage(true); // Show the 'check your email' message
      } else if (authError.message.includes('already in use')) {
        setError(t.errors.emailInUse);
      } else if (authError.message.includes('should be at least')) {
        setError(t.errors.weakPassword);
      } else {
        setError(t.errors.unknown);
      }
    } else {
      setOpen(false); // Close dialog on successful login
    }
  };

  const onOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
        setEmail('');
        setPassword('');
        setFullName('');
        setError(null);
        setShowSuccessMessage(false);
    }
    setOpen(isOpen);
  }

  const renderForm = (type: 'login' | 'signup') => (
    <div className="space-y-4">
       {type === 'signup' && (
        <div className="space-y-2">
          <Label htmlFor="signup-name">{t.fullNameLabel}</Label>
          <Input
            id="signup-name"
            type="text"
            placeholder={t.fullNamePlaceholder}
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor={`${type}-email`}>Email</Label>
        <Input
          id={`${type}-email`}
          type="email"
          placeholder={t.emailPlaceholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isSubmitting}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor={`${type}-password`}>Password</Label>
        <Input
          id={`${type}-password`}
          type="password"
          placeholder={t.passwordPlaceholder}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={isSubmitting}
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button
        onClick={() => handleAuthAction(type)}
        disabled={isSubmitting || !email || !password || (type === 'signup' && !fullName)}
        className="w-full"
      >
        {isSubmitting
          ? '...'
          : type === 'login'
          ? t.loginButton
          : t.signupButton}
      </Button>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          {t.login}
        </Button>
      </DialogTrigger>
      <DialogContent className="p-6">
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
        </DialogClose>
        {showSuccessMessage ? (
           <div className="p-4">
             <Alert>
               <MailCheck className="h-4 w-4" />
               <AlertTitle>{t.signupSuccess}</AlertTitle>
               <AlertDescription>
                 {t.signupSuccessDescription}
               </AlertDescription>
             </Alert>
           </div>
        ) : (
        <Tabs defaultValue="login" className="w-full pt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">{t.login}</TabsTrigger>
            <TabsTrigger value="signup">{t.signup}</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <DialogHeader className="mb-4">
              <DialogTitle>{t.login}</DialogTitle>
              <DialogDescription>{t.loginDescription}</DialogDescription>
            </DialogHeader>
            {renderForm('login')}
          </TabsContent>
          <TabsContent value="signup">
            <DialogHeader className="mb-4">
              <DialogTitle>{t.signup}</DialogTitle>
              <DialogDescription>{t.signupDescription}</DialogDescription>
            </DialogHeader>
            {renderForm('signup')}
          </TabsContent>
        </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
