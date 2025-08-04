'use client';
import { useState, useRef } from 'react';
import { Button } from '../ui/button';
import { UploadCloud, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface ImageUploaderProps {
  name: string;
  multiple?: boolean;
}

interface FileWithPreview extends File {
  preview: string;
}

export default function ImageUploader({ name, multiple = false }: ImageUploaderProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files).map(file =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );
      
      if (multiple) {
        setFiles(prev => [...prev, ...newFiles]);
      } else {
        // Revoke previous object URLs to prevent memory leaks
        files.forEach(file => URL.revokeObjectURL(file.preview));
        setFiles(newFiles);
      }
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    const removedFile = newFiles.splice(index, 1)[0];
    URL.revokeObjectURL(removedFile.preview);
    setFiles(newFiles);
  };
  
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.dataTransfer.files) {
         const newFiles = Array.from(event.dataTransfer.files).map(file =>
            Object.assign(file, {
              preview: URL.createObjectURL(file),
            })
          );
          if (multiple) {
            setFiles(prev => [...prev, ...newFiles]);
          } else {
            files.forEach(file => URL.revokeObjectURL(file.preview));
            setFiles(newFiles);
          }
      }
  };


  return (
    <div>
        <div
            className="flex flex-col items-center justify-center w-full min-h-[10rem] p-4 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => {e.preventDefault(); e.stopPropagation();}}
            onDrop={handleDrop}
        >
            <div className="flex flex-col items-center justify-center text-center">
                <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">PNG, JPG, or WEBP</p>
            </div>
            <input
                ref={fileInputRef}
                type="file"
                name={name}
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                multiple={multiple}
                onChange={handleFileChange}
                // By leaving the value uncontrolled, we can add more files in multiple mode
            />
        </div>

      {files.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {files.map((file, index) => (
            <div key={index} className="relative group aspect-square">
              <Image
                src={file.preview}
                alt={`preview ${index}`}
                fill
                className="object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-1 right-1 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeFile(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {files.length === 0 && (
          <div className="mt-4 flex items-center justify-center text-sm text-muted-foreground p-4 border rounded-lg">
            <ImageIcon className="mr-2 h-5 w-5"/>
            No image selected
          </div>
      )}
    </div>
  );
}
