# ChefMate Application Features

This document outlines the key features of the ChefMate application.

## Core Functionality

- **Ingredient-Based Recipe Generation**: Users can input a list of ingredients, and the application's AI will suggest a variety of recipes that can be made with them.
- **Multiple Input Methods**:
    - **Manual Text Entry**: Type ingredients in a comma-separated list.
    - **Voice Input**: Use the microphone to speak a list of ingredients, which are automatically parsed by AI.
    - **Image Upload**: Upload a photo of ingredients, and the AI will identify them.
    - **Camera Input**: Take a live photo of ingredients to be analyzed by AI.
- **Recipe Filtering**: Suggested recipes can be filtered by cuisine type (e.g., Italian, Mexican), dietary restrictions (e.g., Vegan, Gluten-Free), and maximum preparation time.

## AI-Powered Features (Genkit)

- **Recipe Suggestion & Creation**: Generates 4 diverse recipes based on user inputs and preferences.
- **Nutritional Analysis**: Provides an estimated breakdown of calories, protein, carbohydrates, and fat for each AI-generated recipe.
- **Recipe Categorization**: Automatically generates relevant tags (e.g., "quick", "dessert") and a broad category (e.g., "Dinner") for recipes.
- **AI Image Generation**: Creates a unique, photorealistic image for each AI-generated recipe suggestion.
- **Text-to-Speech**: Reads recipe instructions aloud in a natural-sounding voice.
- **YouTube Video Integration**: Automatically finds and displays relevant YouTube video tutorials for suggested recipes.

## User Accounts & Data Management (Supabase)

- **Email & Password Authentication**: Users can sign up and log in to a personal account.
- **Guest Access**: Non-logged-in users have a limited number of free recipe searches.
- **Search History**: Logged-in users have their search history saved, including the ingredients they used and the recipes that were suggested.
- **"My Recipes" Collection**: Users can create, save, edit, and delete their own custom recipes.
- **Image Storage**: User-uploaded images for their custom recipes are securely stored using Supabase Storage.

## Community & Social Features

- **Public & Private Recipes**: Users can choose to make their saved recipes public for the community to see or keep them private.
- **Community Recipe Feed**: The home page features a list of recent recipes created by other users.
- **Likes**: Users can "like" recipes.
- **Comments**: Users can post comments on recipes.
- **Real-Time Updates**: Likes and comments update in real-time for all users viewing a recipe.

## User Experience & Interface

- **Multilingual Support**: The entire application interface and all AI-generated content can be toggled between **English** and **Bengali (বাংলা)**.
- **Multiple Color Themes**: Users can choose from several color themes (Light, Dark, System, Indigo, Green/Orange) to customize their experience.
- **Responsive Design**: The UI is fully responsive and works seamlessly on desktop and mobile devices.
- **Modern Component Library**: Built with shadcn/ui and Tailwind CSS for a clean and modern aesthetic.