
'use client';

import React, { createContext, useState, ReactNode } from 'react';

type Language = 'en' | 'bn';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

export const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
});

interface LanguageProviderProps {
  children: ReactNode;
}

export const content = {
    en: {
        appName: 'ChefMate',
        languageName: 'English',
        publicRecipes: 'Recent Community Recipes',
        auth: {
            login: 'Login',
            logout: 'Log out',
            signup: 'Sign Up',
            fullNameLabel: 'Full Name',
            fullNamePlaceholder: 'e.g. John Doe',
            emailPlaceholder: 'your@email.com',
            passwordPlaceholder: '••••••••',
            loginButton: 'Login',
            signupButton: 'Sign Up',
            loginDescription: 'Enter your credentials to access your account.',
            signupDescription: 'Create an account to save your recipe history.',
            signupSuccess: 'Check your email!',
            signupSuccessDescription: 'We have sent you a confirmation link. Please check your inbox to complete the registration.',
            or: 'OR',
            errors: {
                invalid: 'Invalid login credentials.',
                emailInUse: 'Email is already in use.',
                weakPassword: 'Password should be at least 6 characters.',
                unknown: 'An unknown error occurred. Please try again.',
            }
        },
        header: {
            myRecipes: 'My Recipes',
            newRecipe: 'New Recipe',
            toggleTheme: 'Toggle theme',
            menu: 'Menu',
            openMenu: 'Open menu',
            light: 'Light',
            dark: 'Dark',
            system: 'System',
            indigo: 'Indigo',
            greenOrange: 'Green/Orange',
        },
        history: {
            title: 'History',
            loginPrompt: {
                title: 'Please Log In',
                description: 'Log in to see your recipe history.',
            },
            empty: 'No history found.',
            ingredientsUsed: 'Ingredients Used',
            suggestedRecipes: 'Suggested Recipes',
            manualEntry: 'Manual Entry',
        },
        uploader: {
            title: 'Upload a Photo',
            description: 'Snap a photo of your ingredients or upload one from your device.',
            cameraDescription: 'Center your ingredients in the frame and take a clear photo.',
            click: 'Click to upload',
            drag: 'or drag and drop',
            types: 'PNG, JPG or WEBP',
            useCamera: 'Use Camera',
            uploadButton: 'Upload Photo',
            previewAlt: 'Ingredients preview',
            change: 'Change',
            retake: 'Retake',
            remove: 'Remove',
            analyzing: 'Analyzing...',
            analyzeButton: 'Analyze Ingredients',
        },
        ingredients: {
            title: 'Your Ingredients',
            description: 'Add or remove ingredients to customize your recipes.',
            addPlaceholder: 'Enter ingredients...',
            addAriaLabel: 'Add ingredient',
            addMore: 'Add',
            voiceAriaLabel: 'Add ingredient by voice',
            loading: 'Finding Recipes...',
            getButton: 'Find Recipes',
            notFound: 'No ingredients found. Please try another image or add some manually.',
            searchesLeft: (count: number) => `You have ${count} free ${count === 1 ? 'search' : 'searches'} left.`,
            loginForMore: 'Please log in for unlimited searches.',
            list: {
                "orange": "Orange",
                "guava": "Guava",
                "mango": "Mango",
                "lime": "Lime",
            }
        },
        recipes: {
            title: 'Recipe Ideas',
            description: 'Here are some recipe ideas based on your ingredients.',
            empty: 'No recipes to show yet. Try generating some!',
            ready: 'Ready to Cook?',
            prompt: 'Your delicious recipe suggestions will appear here once you add ingredients and click "Find Recipes".',
            listen: 'Listen to recipe',
            nutrition: 'Nutritional Information',
            calories: 'Calories',
            protein: 'Protein',
            carbs: 'Carbs',
            fat: 'Fat',
            servingSize: 'Serving Size',
            ingredientsUsed: (count: number) => `Uses ${count} of your ingredients`,
            filters: {
                cuisine: 'Cuisine',
                diet: 'Diet',
                time: 'Time',
                any: 'Any',
            },
        },
        videos: {
            title: 'Video Tutorials',
            search: 'Search on YouTube',
            prompt: (query: string) => `Click the button to search for "${query}" on YouTube.`,
            unavailable: 'Could not find any relevant video tutorials for this recipe.',
        },
        camera: {
            accessRequired: 'Camera Access Required',
            allowAccess: 'Please allow camera access to use this feature. You may need to change permissions in your browser settings.',
            cancel: 'Cancel',
            snap: 'Snap Photo',
        },
        toast: {
            error: {
                title: 'Uh oh! Something went wrong.',
                analyze: 'Failed to analyze ingredients from the image.',
                recipes: 'Failed to generate new recipes.',
                speech: 'Failed to generate audio for the recipe.',
                camera: 'Camera Access Denied',
                cameraPermission: 'Please enable camera permissions in your browser settings.',
            },
            limit: {
                title: 'Search Limit Reached',
                description: 'Please log in to get unlimited recipe searches.',
            }
        }
    },
    bn: {
        appName: 'শেফমেট',
        languageName: 'বাংলা',
        publicRecipes: 'সাম্প্রতিক কমিউনিটি রেসিপি',
        auth: {
            login: 'লগইন',
            logout: 'লগ আউট',
            signup: 'নিবন্ধন করুন',
            fullNameLabel: 'পুরো নাম',
            fullNamePlaceholder: 'যেমন জন ডো',
            emailPlaceholder: 'your@email.com',
            passwordPlaceholder: '••••••••',
            loginButton: 'লগইন',
            signupButton: 'নিবন্ধন করুন',
            loginDescription: 'আপনার অ্যাকাউন্টে প্রবেশ করতে আপনার পরিচয়পত্র লিখুন।',
            signupDescription: 'আপনার রেসিপির ইতিহাস সংরক্ষণ করতে একটি অ্যাকাউন্ট তৈরি করুন।',
            signupSuccess: 'আপনার ইমেইল চেক করুন!',
            signupSuccessDescription: 'আমরা আপনাকে একটি নিশ্চিতকরণ লিঙ্ক পাঠিয়েছি। নিবন্ধন সম্পন্ন করতে আপনার ইনবক্স চেক করুন।',
            or: 'অথবা',
            errors: {
                invalid: 'অকার্যকর লগইন পরিচয়পত্র।',
                emailInUse: 'ইমেল ইতিমধ্যে ব্যবহৃত হচ্ছে।',
                weakPassword: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।',
                unknown: 'একটি অজানা ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।',
            }
        },
        header: {
            myRecipes: 'আমার রেসিপি',
            newRecipe: 'নতুন রেসিপি',
            toggleTheme: 'থিম পরিবর্তন করুন',
            menu: 'মেনু',
            openMenu: 'মেনু খুলুন',
            light: 'হালকা',
            dark: 'অন্ধকার',
            system: 'সিস্টেম',
            indigo: 'নীল',
            greenOrange: 'সবুজ/কমলা',
        },
        history: {
            title: 'ইতিহাস',
            loginPrompt: {
                title: 'অনুগ্রহ করে লগইন করুন',
                description: 'আপনার রেসিপির ইতিহাস দেখতে লগইন করুন।',
            },
            empty: 'কোনো ইতিহাস পাওয়া যায়নি।',
            ingredientsUsed: 'ব্যবহৃত উপাদান',
            suggestedRecipes: 'প্রস্তাবিত রেসিপি',
            manualEntry: 'ম্যানুয়াল এন্ট্রি',
        },
        uploader: {
            title: 'ছবি আপলোড করুন',
            description: 'আপনার উপাদানগুলির একটি ছবি তুলুন বা আপনার ডিভাইস থেকে একটি আপলোড করুন।',
            cameraDescription: 'আপনার উপাদানগুলি ফ্রেমে কেন্দ্রীভূত করুন এবং একটি পরিষ্কার ছবি তুলুন।',
            click: 'আপলোড করতে ক্লিক করুন',
            drag: 'বা টেনে আনুন',
            types: 'PNG, JPG বা WEBP',
            useCamera: 'ক্যামেরা ব্যবহার করুন',
            uploadButton: 'ছবি আপলোড',
            previewAlt: 'উপাদানগুলির প্রাকদর্শন',
            change: 'পরিবর্তন',
            retake: 'পুনরায় নিন',
            remove: 'অপসারণ',
            analyzing: 'বিশ্লেষণ করা হচ্ছে...',
            analyzeButton: 'উপাদান বিশ্লেষণ করুন',
        },
        ingredients: {
            title: 'আপনার উপাদান',
            description: 'আপনার রেসিপি কাস্টমাইজ করতে উপাদান যোগ করুন বা সরান।',
            addPlaceholder: 'উপাদান লিখুন...',
            addAriaLabel: 'উপাদান যোগ করুন',
            addMore: 'যোগ করুন',
            voiceAriaLabel: 'ভয়েসের মাধ্যমে উপাদান যোগ করুন',
            loading: 'রেসিপি খোঁজা হচ্ছে...',
            getButton: 'রেসিপি খুঁজুন',
            notFound: 'কোন উপাদান পাওয়া যায়নি। অনুগ্রহ করে অন্য একটি ছবি চেষ্টা করুন বা ম্যানুয়ালি কিছু যোগ করুন।',
            searchesLeft: (count: number) => `আপনার ${count}টি বিনামূল্যে অনুসন্ধান বাকি আছে।`,
            loginForMore: 'সীমাহীন অনুসন্ধানের জন্য অনুগ্রহ করে লগইন করুন।',
            list: {
                "orange": "কমলা",
                "guava": "পেয়ারা",
                "mango": "আম",
                "lime": "লেবু",
            }
        },
        recipes: {
            title: 'রেসিপির ধারণা',
            description: 'আপনার উপাদানগুলির উপর ভিত্তি করে এখানে কিছু রেসিপির ধারণা রয়েছে।',
            empty: 'এখনও দেখানোর মতো কোনো রেসিপি নেই। কিছু তৈরি করার চেষ্টা করুন!',
            ready: 'রান্না করতে প্রস্তুত?',
            prompt: 'আপনি উপাদান যোগ করার পর "রেসিপি খুঁজুন" ক্লিক করলে আপনার সুস্বাদু রেসিপির পরামর্শ এখানে প্রদর্শিত হবে।',
            listen: 'রেসিপি শুনুন',
            nutrition: 'পুষ্টি সম্পর্কিত তথ্য',
            calories: 'ক্যালোরি',
            protein: 'প্রোটিন',
            carbs: 'কার্বোহাইড্রেট',
            fat: 'চর্বি',
            servingSize: 'পরিবেশনের আকার',
            ingredientsUsed: (count: number) => `আপনার ${count}টি উপাদান ব্যবহার করে`,
            filters: {
                cuisine: 'রন্ধনপ্রণালী',
                diet: 'পথ্য',
                time: 'সময়',
                any: 'যেকোনো',
            },
        },
        videos: {
            title: 'ভিডিও টিউটোরিয়াল',
            search: 'YouTube-এ অনুসন্ধান করুন',
            prompt: (query: string) => `"${query}" ইউটিউবে অনুসন্ধান করতে বোতামে ক্লিক করুন।`,
            unavailable: 'এই রেসিপির জন্য কোনো প্রাসঙ্গিক ভিডিও টিউটোরিয়াল খুঁজে পাওয়া যায়নি।',
        },
        camera: {
            accessRequired: 'ক্যামেরা অ্যাক্সেস প্রয়োজন',
            allowAccess: 'এই বৈশিষ্ট্যটি ব্যবহার করতে অনুগ্রহ করে ক্যামেরা অ্যাক্সেসের অনুমতি দিন। আপনাকে আপনার ব্রাউজার সেটিংসে অনুমতি পরিবর্তন করতে হতে পারে।',
            cancel: 'বাতিল করুন',
            snap: 'ছবি তুলুন',
        },
        toast: {
            error: {
                title: 'ওহ হো! কিছু ভুল হয়েছে।',
                analyze: 'ছবি থেকে উপাদান বিশ্লেষণ করতে ব্যর্থ হয়েছে।',
                recipes: 'নতুন রেসিপি তৈরি করতে ব্যর্থ হয়েছে।',
                speech: 'রেসিপির জন্য অডিও তৈরি করতে ব্যর্থ হয়েছে।',
                camera: 'ক্যামেরা অ্যাক্সেস প্রত্যাখ্যাত হয়েছে',
                cameraPermission: 'অনুগ্রহ করে আপনার ব্রাউজার সেটিংসে ক্যামেরার অনুমতি সক্ষম করুন।',
            },
            limit: {
                title: 'অনুসন্ধানের সীমা শেষ',
                description: 'সীমাহীন রেসিপি অনুসন্ধানের জন্য অনুগ্রহ করে লগইন করুন।',
            }
        }
    },
};


export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
