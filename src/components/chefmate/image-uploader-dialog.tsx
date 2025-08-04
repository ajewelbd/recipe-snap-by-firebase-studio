
'use client';

import { useState, useRef, useEffect, useContext, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { LanguageContext, content } from '@/context/language-context';
import { analyzeImageIngredients } from '@/ai/flows/analyze-image-ingredients';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Loader2, Camera, UploadCloud, X, RefreshCw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


interface ImageUploaderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onComplete: (ingredients: string[], imageUrl: string) => void;
    defaultView?: 'upload' | 'camera';
}

export default function ImageUploaderDialog({ open, onOpenChange, onComplete, defaultView = 'upload' }: ImageUploaderDialogProps) {
    const [image, setImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [view, setView] = useState<'upload' | 'camera' | 'preview'>('upload');
    const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
    const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
    const [currentDeviceIndex, setCurrentDeviceIndex] = useState(0);
    
    const { toast } = useToast();
    const { language } = useContext(LanguageContext);
    const t = content[language];
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    }, []);

    const startCamera = useCallback(async () => {
        try {
            if (streamRef.current) stopCamera();
            
            // Get permission first to enumerate devices
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            setHasCameraPermission(true);

            // Enumerate devices after getting permission
            const allDevices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = allDevices.filter(device => device.kind === 'videoinput');
            setDevices(videoDevices);
            
            // Prefer the rear camera if available
            const rearCameraIndex = videoDevices.findIndex(device => 
              device.label.toLowerCase().includes('back') || 
              device.label.toLowerCase().includes('rear')
            );

            const initialDeviceIndex = rearCameraIndex !== -1 ? rearCameraIndex : currentDeviceIndex;
            if (currentDeviceIndex !== initialDeviceIndex) {
              setCurrentDeviceIndex(initialDeviceIndex);
            }
            
            // Now start the stream with the selected device
            const deviceId = videoDevices[initialDeviceIndex]?.deviceId;
            const newStream = await navigator.mediaDevices.getUserMedia({ 
                video: { deviceId: deviceId ? { exact: deviceId } : undefined }
            });

            streamRef.current = newStream;
            if (videoRef.current) {
                videoRef.current.srcObject = newStream;
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);
            toast({
                variant: 'destructive',
                title: t.toast.error.camera,
                description: t.toast.error.cameraPermission,
            });
            setView('upload');
        }
    }, [t.toast.error.camera, t.toast.error.cameraPermission, toast, stopCamera, currentDeviceIndex]);

    const handleSwitchCamera = () => {
        setCurrentDeviceIndex(prevIndex => (prevIndex + 1) % devices.length);
    };

    useEffect(() => {
        if (open) {
            // Reset state when dialog opens
            setImage(null);
            setIsAnalyzing(false);
            setView(defaultView);
            setHasCameraPermission(null);
            setCurrentDeviceIndex(0);
        } else {
            // Cleanup camera stream when dialog closes
            stopCamera();
        }
    }, [open, stopCamera, defaultView]);
    
    useEffect(() => {
      if(view === 'camera' && open) {
        startCamera();
      } else {
        stopCamera();
      }
    }, [view, open, startCamera, stopCamera, currentDeviceIndex]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImage(e.target?.result as string);
                setView('preview');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSnap = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            const dataUri = canvas.toDataURL('image/jpeg');
            setImage(dataUri);
            setView('preview');
            stopCamera();
        }
    };

    const handleAnalyze = async () => {
        if (!image) return;
        setIsAnalyzing(true);
        try {
            const result = await analyzeImageIngredients({ photoDataUri: image });
            if (result.ingredients.length === 0) {
                 toast({
                    title: 'No ingredients found',
                    description: "I couldn't identify any ingredients in the photo. Please try a different one or add them manually.",
                 });
                 setView('upload');
                 setImage(null);
            } else {
                onComplete(result.ingredients, image);
            }
        } catch (error) {
            console.error('Error analyzing ingredients:', error);
            toast({
                variant: 'destructive',
                title: t.toast.error.title,
                description: t.toast.error.analyze,
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        const file = event.dataTransfer.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImage(e.target?.result as string);
                setView('preview');
            };
            reader.readAsDataURL(file);
        }
    };

    const reset = () => {
        setImage(null);
        setView(defaultView);
        if(fileInputRef.current) fileInputRef.current.value = '';
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg p-6">
                <DialogHeader>
                    <DialogTitle>{t.uploader.title}</DialogTitle>
                    <DialogDescription>
                        { view === 'camera' ? t.uploader.cameraDescription : t.uploader.description}
                    </DialogDescription>
                </DialogHeader>
                 <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </DialogClose>

                <Tabs value={view} onValueChange={(v) => setView(v as 'upload' | 'camera' | 'preview')} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upload" disabled={view === 'preview'}>
                            <UploadCloud className="mr-2" />
                            {t.uploader.uploadButton}
                        </TabsTrigger>
                        <TabsTrigger value="camera" disabled={view === 'preview'}>
                            <Camera className="mr-2" />
                            {t.uploader.useCamera}
                        </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="upload" className="mt-4">
                        <div
                            className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80"
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => {e.preventDefault(); e.stopPropagation();}}
                            onDrop={handleDrop}
                        >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                                <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                                <p className="mb-2 text-sm text-muted-foreground">
                                    <span className="font-semibold text-primary">{t.uploader.click}</span> {t.uploader.drag}
                                </p>
                                <p className="text-xs text-muted-foreground">{t.uploader.types}</p>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/png, image/jpeg, image/webp"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="camera" className="mt-4">
                        <div className="space-y-4">
                            <div className="w-full bg-muted rounded-lg overflow-hidden aspect-video relative">
                                <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                                {hasCameraPermission === false && (
                                     <div className="absolute inset-0 flex items-center justify-center p-4 bg-black/50">
                                         <Alert variant="destructive">
                                            <AlertTitle>{t.camera.accessRequired}</AlertTitle>
                                            <AlertDescription>{t.camera.allowAccess}</AlertDescription>
                                        </Alert>
                                     </div>
                                )}
                                {devices.length > 1 && (
                                    <Button onClick={handleSwitchCamera} variant="ghost" size="icon" aria-label="Switch camera" className="absolute bottom-2 right-2 bg-black/20 hover:bg-black/40 text-white hover:text-white">
                                        <RefreshCw className="w-5 h-5" />
                                    </Button>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button onClick={handleSnap} disabled={!hasCameraPermission} className="w-full">
                                    <Camera className="mr-2" />
                                    {t.camera.snap}
                                </Button>
                            </div>
                        </div>
                    </TabsContent>
                    
                    <TabsContent value="preview" className="mt-4">
                         <div className="space-y-4">
                            {image && (
                                <div className="w-full bg-muted rounded-lg overflow-hidden aspect-video relative">
                                    <img src={image} alt={t.uploader.previewAlt} className="w-full h-full object-contain" />
                                </div>
                            )}
                             <Button onClick={handleAnalyze} disabled={isAnalyzing} className="w-full">
                                 {isAnalyzing ? <Loader2 className="mr-2 animate-spin" /> : <Camera className="mr-2" />}
                                 {t.uploader.analyzeButton}
                             </Button>
                             <Button onClick={reset} variant="outline" className="w-full">
                                 {t.uploader.change}
                             </Button>
                         </div>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
