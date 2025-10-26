import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const PhotoUpload = ({ photos, onPhotosChange }) => {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (e?.type === "dragenter" || e?.type === "dragover") {
      setDragActive(true);
    } else if (e?.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e?.dataTransfer?.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e?.target?.files);
    handleFiles(files);
  };

  const handleFiles = (files) => {
    const imageFiles = files?.filter(file => file?.type?.startsWith('image/'));
    
    if (imageFiles?.length === 0) {
      alert('Please select only image files');
      return;
    }

    if (photos?.length + imageFiles?.length > 5) {
      alert('Maximum 5 photos allowed');
      return;
    }

    const newPhotos = imageFiles?.map((file, index) => ({
      id: Date.now() + index,
      file,
      url: URL.createObjectURL(file),
      name: file?.name,
      size: file?.size,
      timestamp: new Date()
    }));

    onPhotosChange([...photos, ...newPhotos]);
  };

  const removePhoto = (photoId) => {
    const updatedPhotos = photos?.filter(photo => photo?.id !== photoId);
    onPhotosChange(updatedPhotos);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i))?.toFixed(2)) + ' ' + sizes?.[i];
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-2">Photo Evidence</h3>
        <p className="text-sm text-muted-foreground">Upload photos to document the environmental issue (max 5 photos)</p>
      </div>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-200 ${
          dragActive 
            ? 'border-primary bg-primary/5' :'border-border hover:border-muted-foreground/50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="space-y-3">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
              <Icon name="Camera" size={24} className="text-muted-foreground" />
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-foreground mb-1">
              Drag and drop photos here, or click to select
            </p>
            <p className="text-xs text-muted-foreground">
              Supports JPG, PNG, WebP up to 10MB each
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => fileInputRef?.current?.click()}
            iconName="Upload"
            iconPosition="left"
          >
            Choose Photos
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>
      {/* Photo Preview Grid */}
      {photos?.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-foreground">Uploaded Photos ({photos?.length}/5)</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onPhotosChange([])}
              iconName="Trash2"
              iconPosition="left"
            >
              Clear All
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos?.map((photo) => (
              <div key={photo?.id} className="relative bg-card border border-border rounded-lg overflow-hidden">
                <div className="aspect-video relative">
                  <Image
                    src={photo?.url}
                    alt={`Environmental issue photo ${photo?.name}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-200" />
                </div>
                
                <div className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{photo?.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(photo?.size)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removePhoto(photo?.id)}
                      className="h-6 w-6 text-error hover:bg-error/10"
                    >
                      <Icon name="X" size={14} />
                    </Button>
                  </div>
                </div>

                {/* Photo timestamp */}
                <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  {photo?.timestamp?.toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Upload Guidelines */}
      <div className="bg-muted/30 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <Icon name="Info" size={16} className="text-primary mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Photo Guidelines</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Take clear, well-lit photos showing the environmental issue</li>
              <li>• Include context and surroundings for better assessment</li>
              <li>• Multiple angles help provide comprehensive documentation</li>
              <li>• Avoid including personal information or faces in photos</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoUpload;