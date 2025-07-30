'use client';

import { type ChangeEvent, useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Upload, FileImage, Loader2, Camera, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  onImageCapture: (dataUri: string) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  imagePreview: string | null;
}

export default function ImageUploader({ onImageUpload, onImageCapture, onAnalyze, isLoading, imagePreview }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    let stream: MediaStream | null = null;
    const getCameraPermission = async () => {
      if (!isCameraOpen) return;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings.',
        });
        setIsCameraOpen(false);
      }
    };

    getCameraPermission();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCameraOpen, toast]);

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
  
  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUri = canvas.toDataURL('image/jpeg');
        onImageCapture(dataUri);
      }
      setIsCameraOpen(false);
    }
  };

  const renderCameraView = () => (
    <div className="space-y-4">
      <div className="relative w-full aspect-video rounded-lg overflow-hidden border bg-muted">
        <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
      </div>
      {hasCameraPermission === false && (
         <Alert variant="destructive">
            <AlertTitle>Camera Access Required</AlertTitle>
            <AlertDescription>
                Please allow camera access to use this feature. You may need to change permissions in your browser settings.
            </AlertDescription>
        </Alert>
      )}
      <div className="flex justify-center gap-4">
        <Button onClick={() => setIsCameraOpen(false)} variant="outline">
            <X className="mr-2" />
            Cancel
        </Button>
        <Button onClick={handleCapture} disabled={hasCameraPermission !== true}>
            <Camera className="mr-2" />
            Snap Photo
        </Button>
      </div>
    </div>
  );
  
  const renderUploader = () => (
    <div className="space-y-4">
      {!imagePreview && (
        <div className="space-y-2">
          <label 
            className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-primary bg-accent' : 'border-border hover:bg-muted'}`}
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
           <Button onClick={() => setIsCameraOpen(true)} variant="outline" className="w-full">
            <Camera className="mr-2" />
            Use Camera
          </Button>
        </div>
      )}
      {imagePreview && (
        <div className="relative w-full h-64 rounded-lg overflow-hidden border shadow-sm">
          <Image src={imagePreview} alt="Ingredients preview" layout="fill" objectFit="cover" data-ai-hint="food ingredients" />
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
                variant="outline"
                size="sm"
                className="bg-card/80 backdrop-blur-sm"
                onClick={() => document.getElementById('dropzone-file')?.click()}
            >
              <FileImage className="mr-2 h-4 w-4" />
              Change
            </Button>
            <Button
                variant="outline"
                size="sm"
                className="bg-card/80 backdrop-blur-sm"
                onClick={() => setIsCameraOpen(true)}
            >
              <Camera className="mr-2 h-4 w-4" />
              Retake
            </Button>
          </div>
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
    </div>
  );


  return (
    <Card>
      <CardHeader>
        <CardTitle>1. Upload Your Ingredients</CardTitle>
        <CardDescription>
          {isCameraOpen ? "Capture a photo of your ingredients." : "Upload a photo of your ingredients to get started."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isCameraOpen ? renderCameraView() : renderUploader()}
      </CardContent>
    </Card>
  );
}
