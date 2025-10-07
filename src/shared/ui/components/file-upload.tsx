"use client";

import * as React from "react";
import { cn } from "@/shared/lib/utils";
import { Upload, FileText, X } from "lucide-react";
import { Progress } from "@/shared/ui/components/progress";

interface FileUploadProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  onFileSelect?: (file: File | null) => void;
  selectedFile?: File | null;
  accept?: string;
  maxSize?: number; // в байтах
  uploadProgress?: number; // прогресс загрузки в процентах (0-100)
  isUploading?: boolean;
}

export function FileUpload({
  className,
  onFileSelect,
  selectedFile,
  accept = ".zip,.rar",
  maxSize = 100 * 1024 * 1024, // 100MB по умолчанию
  disabled,
  uploadProgress = 0,
  isUploading = false,
  ...props
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const validateFile = (file: File): boolean => {
    if (maxSize && file.size > maxSize) {
      setError(`Размер файла не должен превышать ${Math.round(maxSize / 1024 / 1024)}MB`);
      return false;
    }

    if (accept && !accept.split(',').some(type => file.name.toLowerCase().endsWith(type.replace('.', '')))) {
      setError(`Разрешены только файлы: ${accept}`);
      return false;
    }

    setError(null);
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file && validateFile(file)) {
      onFileSelect?.(file);
    } else if (!file) {
      onFileSelect?.(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const file = e.dataTransfer.files?.[0];
    if (file && validateFile(file)) {
      onFileSelect?.(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFileSelect?.(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer",
          isDragOver ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50",
          disabled && "opacity-50 cursor-not-allowed",
          selectedFile && "border-green-500 bg-green-50 dark:bg-green-950/20",
          className
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={!disabled ? handleClick : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={disabled}
          className="hidden"
          {...props}
        />

        {selectedFile ? (
          <div className="space-y-3">
            <div className="flex items-center justify-center space-x-2">
              <FileText className="w-8 h-8 text-green-600" />
              <span className="font-medium text-green-700 dark:text-green-300">
                {selectedFile.name}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
            </p>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Загрузка...</span>
                  <span className="text-muted-foreground">{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            <button
              type="button"
              onClick={handleRemove}
              disabled={isUploading}
              className="inline-flex items-center px-2 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded disabled:opacity-50"
            >
              <X className="w-3 h-3 mr-1" />
              Удалить
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <Upload className={cn(
              "w-8 h-8 mx-auto",
              isDragOver ? "text-primary" : "text-muted-foreground"
            )} />
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {isDragOver ? "Отпустите файл здесь" : "Перетащите файл сюда или нажмите"}
              </p>
              <p className="text-xs text-muted-foreground">
                Поддерживаются: {accept} (макс. {Math.round(maxSize / 1024 / 1024)}MB)
              </p>
              {!selectedFile && (
                <p className="text-xs text-destructive font-medium">
                  Файл обязателен
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}
