"use client";

import { useState, useCallback } from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '@/shared/ui/components/context-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/components/dialog';
import { Button } from '@/shared/ui/components/button';
import { Input } from '@/shared/ui/components/input';
import { Label } from '@/shared/ui/components/label';
import {
  Edit,
  Trash2,
  Copy,
  Scissors,
  FileText,
  Download,
  Upload,
  Eye
} from 'lucide-react';
import { FileTreeItem } from '../model/types';

interface FileContextMenuProps {
  item: FileTreeItem;
  children: React.ReactNode;
  onRename?: (filePath: string, newName: string) => void;
  onDelete?: (filePath: string) => void;
  onCopy?: (filePath: string) => void;
  onCut?: (filePath: string) => void;
  onPaste?: (targetPath: string) => void;
  onDownload?: (filePath: string) => void;
  onView?: (filePath: string) => void;
  canPaste?: boolean;
}

export function FileContextMenu({
  item,
  children,
  onRename,
  onDelete,
  onCopy,
  onCut,
  onPaste,
  onDownload,
  onView,
  canPaste = false,
}: FileContextMenuProps) {
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newName, setNewName] = useState(item.name);

  const handleRename = useCallback(() => {
    if (newName.trim() && newName !== item.name && onRename) {
      onRename(item.path, newName.trim());
    }
    setIsRenameDialogOpen(false);
    setNewName(item.name);
  }, [newName, item.name, item.path, onRename]);

  const handleDelete = useCallback(() => {
    if (onDelete) {
      onDelete(item.path);
    }
    setIsDeleteDialogOpen(false);
  }, [item.path, onDelete]);

  const handleCopy = useCallback(() => {
    if (onCopy) {
      onCopy(item.path);
    }
  }, [item.path, onCopy]);

  const handleCut = useCallback(() => {
    if (onCut) {
      onCut(item.path);
    }
  }, [item.path, onCut]);

  const handlePaste = useCallback(() => {
    if (onPaste) {
      onPaste(item.path);
    }
  }, [item.path, onPaste]);

  const handleDownload = useCallback(() => {
    if (onDownload) {
      onDownload(item.path);
    }
  }, [item.path, onDownload]);

  const handleView = useCallback(() => {
    if (onView) {
      onView(item.path);
    }
  }, [item.path, onView]);


  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger asChild>
          {children}
        </ContextMenuTrigger>
        <ContextMenuContent className="w-56">
          {/* Основные действия */}
          <ContextMenuItem onClick={handleView}>
            <Eye className="w-4 h-4 mr-2" />
            Открыть
          </ContextMenuItem>

          {item.type === 'FILE' && (
            <ContextMenuItem onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Скачать
            </ContextMenuItem>
          )}

          <ContextMenuSeparator />

          {/* Правка */}
          <ContextMenuItem onClick={() => setIsRenameDialogOpen(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Переименовать
          </ContextMenuItem>

          <ContextMenuItem onClick={handleCopy}>
            <Copy className="w-4 h-4 mr-2" />
            Копировать
          </ContextMenuItem>

          <ContextMenuItem onClick={handleCut}>
            <Scissors className="w-4 h-4 mr-2" />
            Вырезать
          </ContextMenuItem>

          {canPaste && (
            <ContextMenuItem onClick={handlePaste}>
              <FileText className="w-4 h-4 mr-2" />
              Вставить
            </ContextMenuItem>
          )}

          {item.type === 'DIRECTORY' && (
            <>
              <ContextMenuSeparator />
              <ContextMenuItem onClick={handlePaste}>
                <Upload className="w-4 h-4 mr-2" />
                Загрузить файл
              </ContextMenuItem>
            </>
          )}

          <ContextMenuSeparator />

          {/* Удаление */}
          <ContextMenuItem
            onClick={() => setIsDeleteDialogOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Удалить
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      {/* Диалог переименования */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Переименование</DialogTitle>
            <DialogDescription>
              Введите новое имя для {item.type === 'DIRECTORY' ? 'папки' : 'файла'} &ldquo;{item.name}&rdquo;
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Имя
              </Label>
              <Input
                id="name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="col-span-3"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleRename();
                  } else if (e.key === 'Escape') {
                    setIsRenameDialogOpen(false);
                    setNewName(item.name);
                  }
                }}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleRename} disabled={!newName.trim() || newName === item.name}>
              Переименовать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Диалог подтверждения удаления */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Подтверждение удаления</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить {item.type === 'DIRECTORY' ? 'папку' : 'файл'} &ldquo;{item.name}&rdquo;?
              {item.type === 'DIRECTORY' && item.childrenCount && item.childrenCount > 0 && (
                <span className="block mt-2 text-destructive">
                  Папка содержит {item.childrenCount} элементов и будет удалена вместе со всем содержимым.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
