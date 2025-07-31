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
        appName: 'Recipe Snap',
        languageName: 'English',
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
        history: {
            title: 'History',
            loginPrompt: {
                title: 'Please Log In',
                description: 'Log in to see your recipe history.',
            },
            empty: 'No history found.',
            ingredientsUsed: 'Ingredients Used',
            suggestedRecipes: 'Suggested Recipes',
        },
        uploader: {
            title: '1. Your Ingredients',
            description: 'Upload a photo or manually add ingredients to get started.',
            cameraDescription: 'Capture a photo of your ingredients.',
            click: 'Click to upload',
            drag: 'or drag and drop',
            types: 'PNG, JPG or WEBP',
            useCamera: 'Use Camera',
            previewAlt: 'Ingredients preview',
            change: 'Change',
            retake: 'Retake',
            remove: 'Remove',
            analyzing: 'Analyzing...',
            analyzeButton: 'Analyze Ingredients',
        },
        ingredients: {
            title: '2. Refine Your Ingredients',
            description: 'Add or remove ingredients to customize your recipes.',
            addPlaceholder: 'Add an ingredient...',
            addAriaLabel: 'Add ingredient',
            loading: 'Finding Recipes...',
            getButton: 'Get Recipes',
            list: {
                "orange": "Orange",
                "guava": "Guava",
                "mango": "Mango",
                "lime": "Lime",
            }
        },
        recipes: {
            title: '3. Your Personalized Recipes',
            description: 'Here are some recipe ideas based on your ingredients.',
            empty: 'No recipes to show yet. Try generating some!',
            ready: 'Ready to Cook?',
            prompt: 'Your delicious recipe suggestions will appear here once you click "Get Recipes".',
            listen: 'Listen to recipe',
            nutrition: 'Nutritional Information',
            calories: 'Calories',
            protein: 'Protein',
            carbs: 'Carbs',
            fat: 'Fat',
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
            }
        }
    },
    bn: {
        appName: 'রেসিপি স্ন্যাপ',
        languageName: 'বাংলা',
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
        history: {
            title: 'ইতিহাস',
            loginPrompt: {
                title: 'অনুগ্রহ করে লগইন করুন',
                description: 'আপনার রেসিপির ইতিহাস দেখতে লগইন করুন।',
            },
            empty: 'কোনো ইতিহাস পাওয়া যায়নি।',
            ingredientsUsed: 'ব্যবহৃত উপাদান',
            suggestedRecipes: 'প্রস্তাবিত রেসিপি',
        },
        uploader: {
            title: '১. আপনার উপাদান',
            description: 'শুরু করতে একটি ফটো আপলোড করুন বা ম্যানুয়ালি উপাদান যোগ করুন।',
            cameraDescription: 'আপনার উপাদানগুলির একটি ছবি তুলুন।',
            click: 'আপলোড করতে ক্লিক করুন',
            drag: 'বা টেনে আনুন',
            types: 'PNG, JPG বা WEBP',
            useCamera: 'ক্যামেরা ব্যবহার করুন',
            previewAlt: 'উপাদানগুলির প্রাকদর্শন',
            change: 'পরিবর্তন',
            retake: 'পুনরায় নিন',
            remove: 'অপসারণ',
            analyzing: 'বিশ্লেষণ করা হচ্ছে...',
            analyzeButton: 'উপাদান বিশ্লেষণ করুন',
        },
        ingredients: {
            title: '২. আপনার উপাদান পরিমার্জন করুন',
            description: 'আপনার রেসিপি কাস্টমাইজ করতে উপাদান যোগ করুন বা সরান।',
            addPlaceholder: 'একটি উপাদান যোগ করুন...',
            addAriaLabel: 'উপাদান যোগ করুন',
            loading: 'রেসিপি খোঁজা হচ্ছে...',
            getButton: 'রেসিপি পান',
            list: {
                "orange": "কমলা",
                "guava": "পেয়ারা",
                "mango": "আম",
                "lime": "লেবু",
            }
        },
        recipes: {
            title: '৩. আপনার ব্যক্তিগতকৃত রেসিপি',
            description: 'আপনার উপাদানগুলির উপর ভিত্তি করে এখানে কিছু রেসিপির ধারণা রয়েছে।',
            empty: 'এখনও দেখানোর মতো কোনো রেসিপি নেই। কিছু তৈরি করার চেষ্টা করুন!',
            ready: 'রান্না করতে প্রস্তুত?',
            prompt: 'আপনি "রেসিপি পান" ক্লিক করলে আপনার সুস্বাদু রেসিপির পরামর্শ এখানে প্রদর্শিত হবে।',
            listen: 'রেসিপি শুনুন',
            nutrition: 'পুষ্টি সম্পর্কিত তথ্য',
            calories: 'ক্যালোরি',
            protein: 'প্রোটিন',
            carbs: 'কার্বোহাইড্রেট',
            fat: 'চর্বি',
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
