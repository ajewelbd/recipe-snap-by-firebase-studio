'use client';

import { type ChangeEvent, useState, useRef, useEffect, useContext } from 'react';
import Image from 'next/image';
import { Upload, FileImage, Loader2, Camera, X, RefreshCw, Trash2, SwitchCamera } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { LanguageContext, content } from '@/context/language-context';

interface ImageUploaderProps {
  onImageUpload: (file: File) => void;
  onImageCapture: (dataUri: string) => void;
  onAnalyze: () => void;
  onRemove: () => void;
  isLoading: boolean;
  imagePreview: string | null;
}

export default function ImageUploader({ onImageUpload, onImageCapture, onAnalyze, onRemove, isLoading, imagePreview }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [activeDeviceId, setActiveDeviceId] = useState<string | undefined>(undefined);
  const { toast } = useToast();
  const { language } = useContext(LanguageContext);
  const t = content[language];
  const fileInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const getCameraPermission = async () => {
      if (!isCameraOpen) return;
      try {
        // Get initial stream to request permission
        await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);

        // Enumerate devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(device => device.kind === 'videoinput');
        setVideoDevices(videoInputs);

        // Set initial device (prefer back camera)
        const rearCamera = videoInputs.find(device => device.label.toLowerCase().includes('back'));
        const initialDeviceId = rearCamera?.deviceId || videoInputs[0]?.deviceId;
        setActiveDeviceId(initialDeviceId);

      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: t.toast.error.camera,
          description: t.toast.error.cameraPermission,
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
  }, [isCameraOpen, toast, t]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    const startStream = async () => {
      if (videoRef.current && activeDeviceId) {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: activeDeviceId } },
        });
        videoRef.current.srcObject = stream;
      }
    };

    if (isCameraOpen && hasCameraPermission) {
      startStream();
    }
    
    return () => {
        stream?.getTracks().forEach(track => track.stop());
    }
  }, [activeDeviceId, isCameraOpen, hasCameraPermission]);

  const handleSwitchCamera = () => {
    if (videoDevices.length > 1) {
      const currentIndex = videoDevices.findIndex(device => device.deviceId === activeDeviceId);
      const nextIndex = (currentIndex + 1) % videoDevices.length;
      setActiveDeviceId(videoDevices[nextIndex].deviceId);
    }
  };


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
        {videoDevices.length > 1 && (
            <Button onClick={handleSwitchCamera} variant="outline" size="icon" aria-label={language === 'en' ? 'Switch Camera' : 'ক্যামেরা পরিবর্তন করুন'} className="absolute bottom-2 right-2 bg-card/80 backdrop-blur-sm">
                <SwitchCamera className="h-4 w-4" />
            </Button>
        )}
      </div>
      {hasCameraPermission === false && (
         <Alert variant="destructive">
            <AlertTitle>{t.camera.accessRequired}</AlertTitle>
            <AlertDescription>
              {t.camera.allowAccess}
            </AlertDescription>
        </Alert>
      )}
      <div className="flex justify-center gap-4">
        <Button onClick={() => setIsCameraOpen(false)} variant="outline">
            <X className="mr-2" />
            {t.camera.cancel}
        </Button>
        <Button onClick={handleCapture} disabled={hasCameraPermission !== true}>
            <Camera className="mr-2" />
            {t.camera.snap}
        </Button>
      </div>
    </div>
  );
  
  const renderUploader = () => (
    <div className="space-y-4">
      {!imagePreview && (
        <div className="space-y-2">
          <label 
            htmlFor="dropzone-file"
            className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-primary bg-accent' : 'border-border hover:bg-muted'}`}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragEnter}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 mb-3 text-muted-foreground" />
              <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">{t.uploader.click}</span> {t.uploader.drag}</p>
              <p className="text-xs text-muted-foreground">{t.uploader.types}</p>
            </div>
          </label>
           <Button onClick={() => setIsCameraOpen(true)} variant="outline" className="w-full">
            <Camera className="mr-2" />
            {t.uploader.useCamera}
          </Button>
        </div>
      )}
      {imagePreview && (
        <div className="relative w-full h-64 rounded-lg overflow-hidden border shadow-sm">
          <Image src={imagePreview} alt={t.uploader.previewAlt} fill objectFit="cover" data-ai-hint="food ingredients" />
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
                variant="destructive"
                size="icon"
                className="bg-card/80 backdrop-blur-sm hover:bg-destructive/80"
                onClick={onRemove}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">{t.uploader.remove}</span>
            </Button>
            <Button
                variant="outline"
                size="sm"
                className="bg-card/80 backdrop-blur-sm"
                onClick={() => fileInputRef.current?.click()}
            >
              <FileImage className="mr-2 h-4 w-4" />
              {t.uploader.change}
            </Button>
          </div>
           <div className="absolute bottom-2 right-2">
             <Button
                variant="outline"
                size="icon"
                className="bg-card/80 backdrop-blur-sm"
                onClick={() => setIsCameraOpen(true)}
            >
              <SwitchCamera className="h-4 w-4" />
              <span className="sr-only">{t.uploader.retake}</span>
            </Button>
           </div>
        </div>
      )}
      <Button onClick={onAnalyze} disabled={!imagePreview || isLoading} className="w-full">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {t.uploader.analyzing}
          </>
        ) : (
          t.uploader.analyzeButton
        )}
      </Button>
      <Input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg, image/webp" ref={fileInputRef}/>
    </div>
  );


  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.uploader.title}</CardTitle>
        <CardDescription>
          {isCameraOpen ? t.uploader.cameraDescription : t.uploader.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isCameraOpen ? renderCameraView() : renderUploader()}
      </CardContent>
    </Card>
  );
}
