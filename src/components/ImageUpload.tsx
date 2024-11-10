import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { uploadImage, uploadImageFromUrl } from '../services/storage';

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImageUrl?: string;
}

export function ImageUpload({ onImageUploaded, currentImageUrl }: ImageUploadProps) {
  const { user } = useAuth();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!user?.id || acceptedFiles.length === 0) return;

    try {
      const file = acceptedFiles[0];
      const imageUrl = await uploadImage(file, user.id);
      if (imageUrl) {
        onImageUploaded(imageUrl);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  }, [user?.id, onImageUploaded]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    maxFiles: 1,
    multiple: false
  });

  return (
    <div className="space-y-4">
      {currentImageUrl && (
        <div className="mb-4">
          <img
            src={currentImageUrl}
            alt="Current profile"
            className="w-32 h-32 rounded-full object-cover mx-auto"
          />
        </div>
      )}
      
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
      >
        <input {...getInputProps()} />
        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600">
          {isDragActive
            ? 'Drop the image here'
            : 'Drag and drop an image here, or click to select'}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Supports: JPG, PNG, GIF (max 5MB)
        </p>
      </div>
    </div>
  );
}