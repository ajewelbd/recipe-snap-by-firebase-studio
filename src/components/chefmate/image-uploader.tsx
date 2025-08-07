'use client';
import { useState, useRef, useEffect } from 'react';
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

// DataTransferItemList item type guard
function isFile(item: DataTransferItem): item is FileSystemFileEntry {
    return item.kind === 'file';
}

export default function ImageUploader({ name, multiple = false }: ImageUploaderProps) {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (newFiles: File[]) => {
    const processedFiles = newFiles
        .filter(file => file.type.startsWith('image/'))
        .map(file =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );
      
      if (multiple) {
        setFiles(prev => [...prev, ...processedFiles]);
      } else {
        // Revoke previous object URLs to prevent memory leaks
        files.forEach(file => URL.revokeObjectURL(file.preview));
        setFiles(processedFiles);
      }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      handleFiles(Array.from(event.target.files));
      // Reset file input to allow selecting the same file again
      event.target.value = '';
    }
  };

  const removeFile = (index: number) => {
    setFiles(prevFiles => {
      const newFiles = [...prevFiles];
      const removedFile = newFiles.splice(index, 1)[0];
      URL.revokeObjectURL(removedFile.preview);
      return newFiles;
    });
  };
  
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.dataTransfer.files) {
         handleFiles(Array.from(event.dataTransfer.files));
      }
  };
  
  // Cleanup object URLs on unmount
  useEffect(() => {
    return () => {
        files.forEach(file => URL.revokeObjectURL(file.preview));
    }
  }, [files]);


  return (
    <div>
        {/* Hidden file inputs to hold the actual file data for the form */}
        {files.map((file, index) => (
            <input 
                key={index}
                type="file"
                name={name}
                className="hidden"
                ref={input => {
                    if (input) {
                        const dataTransfer = new DataTransfer();
                        dataTransfer.items.add(file);
                        input.files = dataTransfer.files;
                    }
                }}
                onChange={() => {}} // Dummy onChange to satisfy React
            />
        ))}

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
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
                multiple={multiple}
                onChange={handleFileChange}
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
