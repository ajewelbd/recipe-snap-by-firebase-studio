'use client';

import { type ChangeEvent, useState } from 'react';
import Image from 'next/image';
import { Upload, FileImage, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  imagePreview: string | null;
}

export default function ImageUploader({ onImageUpload, onAnalyze, isLoading, imagePreview }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImageUpload(e.target.files[0]);
    }
  };

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onImageUpload(e.dataTransfer.files[0]);
    }
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>1. Upload Your Ingredients</CardTitle>
        <CardDescription>Upload a photo of your ingredients to get started.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!imagePreview && (
          <label 
            className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-primary bg-accent' : 'border-border hover:bg-muted'}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragEnter}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
              <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
              <p className="text-xs text-muted-foreground">PNG, JPG or WEBP</p>
            </div>
            <Input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" />
          </label>
        )}
        {imagePreview && (
          <div className="relative w-full h-64 rounded-lg overflow-hidden border shadow-sm">
            <Image src={imagePreview} alt="Ingredients preview" layout="fill" objectFit="cover" data-ai-hint="food ingredients" />
            <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2 bg-card/80 backdrop-blur-sm"
                onClick={() => document.getElementById('dropzone-file')?.click()}
            >
              <FileImage className="mr-2 h-4 w-4" />
              Change Photo
            </Button>
          </div>
        )}
        <Button onClick={onAnalyze} disabled={!imagePreview || isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Analyze Ingredients'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
