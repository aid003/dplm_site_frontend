"use client";

import { useState, useCallback, useMemo } from 'react';
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Search } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/ui/components/button';
import { Input } from '@/shared/ui/components/input';
import { FileTreeItem } from '../model/types';
import { getFileIcon, getFileExtension } from '../lib/file-utils';
import { FileContextMenu } from './file-context-menu';

interface FileTreeProps {
  items: FileTreeItem[];
  selectedFile?: string;
  expandedFolders?: Set<string>;
  onFileSelect: (filePath: string) => void;
  onFolderToggle: (folderPath: string) => void;
  onCreateFile?: (parentPath: string) => void;
  onCreateFolder?: (parentPath: string) => void;
  onRename?: (filePath: string, newName: string) => void;
  onDelete?: (filePath: string) => void;
  onCopy?: (filePath: string) => void;
  onCut?: (filePath: string) => void;
  onPaste?: (targetPath: string) => void;
  onDownload?: (filePath: string) => void;
  onLoadChildren?: (folderPath: string) => void;
  canPaste?: boolean;
  className?: string;
}

interface FileTreeNodeProps {
  item: FileTreeItem;
  level: number;
  selectedFile?: string;
  expandedFolders?: Set<string>;
  onFileSelect: (filePath: string) => void;
  onFolderToggle: (folderPath: string) => void;
  onCreateFile?: (parentPath: string) => void;
  onCreateFolder?: (parentPath: string) => void;
  onRename?: (filePath: string, newName: string) => void;
  onDelete?: (filePath: string) => void;
  onCopy?: (filePath: string) => void;
  onCut?: (filePath: string) => void;
  onPaste?: (targetPath: string) => void;
  onDownload?: (filePath: string) => void;
  onLoadChildren?: (folderPath: string) => void;
  canPaste?: boolean;
}

function FileTreeNode({
  item,
  level,
  selectedFile,
  expandedFolders = new Set(),
  onFileSelect,
  onFolderToggle,
  onCreateFile,
  onCreateFolder,
  onRename,
  onDelete,
  onCopy,
  onCut,
  onPaste,
  onDownload,
  onLoadChildren,
  canPaste = false,
}: FileTreeNodeProps) {
  const isSelected = selectedFile === item.path;
  const isExpanded = expandedFolders.has(item.path);
  const hasChildren = item.type === 'DIRECTORY' && (item.hasChildren || item.childrenCount || 0 > 0);
  const canLoadChildren = item.type === 'DIRECTORY' && !item.children && hasChildren;

  const handleClick = useCallback(() => {
    if (item.type === 'FILE') {
      onFileSelect(item.path);
    } else {
      if (canLoadChildren && onLoadChildren) {
        onLoadChildren(item.path);
      }
      onFolderToggle(item.path);
    }
  }, [item, onFileSelect, onFolderToggle, canLoadChildren, onLoadChildren]);

  const handleCreateFile = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onCreateFile?.(item.path);
  }, [onCreateFile, item.path]);

  const handleCreateFolder = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onCreateFolder?.(item.path);
  }, [onCreateFolder, item.path]);

  const getIcon = () => {
    if (item.type === 'DIRECTORY') {
      return isExpanded ? (
        <FolderOpen className="w-4 h-4 text-blue-500" />
      ) : (
        <Folder className="w-4 h-4 text-blue-500" />
      );
    }

    // Для файлов используем кастомные иконки на основе типа
    const icon = getFileIcon(item.type, item.name);
    return <span className="text-sm">{icon}</span>;
  };

  const renderChildren = () => {
    if (item.type !== 'DIRECTORY' || !isExpanded || !item.children) {
      return null;
    }

    return (
      <div>
        {item.children.map((child) => (
          <FileTreeNode
            key={child.path}
            item={child}
            level={level + 1}
            selectedFile={selectedFile}
            expandedFolders={expandedFolders}
            onFileSelect={onFileSelect}
            onFolderToggle={onFolderToggle}
            onCreateFile={onCreateFile}
            onCreateFolder={onCreateFolder}
            onRename={onRename}
            onDelete={onDelete}
            onLoadChildren={onLoadChildren}
          />
        ))}
      </div>
    );
  };

  return (
    <div>
      <FileContextMenu
        item={item}
        onRename={onRename}
        onDelete={onDelete}
        onCopy={onCopy}
        onCut={onCut}
        onPaste={onPaste}
        onDownload={onDownload}
        onView={handleClick}
        canPaste={canPaste}
      >
        <div
          className={cn(
            'flex items-center gap-1 py-1 px-2 hover:bg-accent rounded-sm cursor-pointer group',
            isSelected && 'bg-accent',
            level > 0 && 'ml-4'
          )}
          style={{ paddingLeft: `${8 + level * 16}px` }}
        >
          {/* Стрелка для папок */}
          {item.type === 'DIRECTORY' && hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="w-4 h-4 p-0 hover:bg-transparent"
              onClick={(e) => {
                e.stopPropagation();
                onFolderToggle(item.path);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </Button>
          )}

          {/* Иконка файла/папки */}
          {getIcon()}

          {/* Название */}
          <span className="flex-1 text-sm truncate" title={item.name}>
            {item.name}
          </span>

          {/* Кнопки действий (показываются при наведении) */}
          {item.type === 'DIRECTORY' && (
            <div className="opacity-0 group-hover:opacity-100 flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-4 h-4 p-0"
                onClick={handleCreateFile}
                title="Создать файл"
              >
                <File className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-4 h-4 p-0"
                onClick={handleCreateFolder}
                title="Создать папку"
              >
                <Folder className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>
      </FileContextMenu>

      {/* Дочерние элементы */}
      {renderChildren()}
    </div>
  );
}

export function FileTree({
  items,
  selectedFile,
  expandedFolders = new Set(),
  onFileSelect,
  onFolderToggle,
  onCreateFile,
  onCreateFolder,
  onRename,
  onDelete,
  onCopy,
  onCut,
  onPaste,
  onDownload,
  onLoadChildren,
  canPaste = false,
  className,
}: FileTreeProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;

    const filterTree = (treeItems: FileTreeItem[]): FileTreeItem[] => {
      return treeItems.filter(item => {
        // Расширенный поиск: по имени, пути и типу файла
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          item.name.toLowerCase().includes(searchLower) ||
          item.path.toLowerCase().includes(searchLower) ||
          (item.type === 'FILE' && getFileExtension(item.name).includes(searchLower));

        if (item.type === 'DIRECTORY' && item.children) {
          const filteredChildren = filterTree(item.children);
          if (filteredChildren.length > 0 || matchesSearch) {
            return {
              ...item,
              children: filteredChildren.length > 0 ? filteredChildren : item.children,
            };
          }
        }

        return matchesSearch;
      });
    };

    return filterTree(items);
  }, [items, searchTerm]);

  const searchResultsCount = useMemo(() => {
    if (!searchTerm) return items.length;

    const countTree = (treeItems: FileTreeItem[]): number => {
      return treeItems.reduce((count, item) => {
        let itemCount = 0;
        if (item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.path.toLowerCase().includes(searchTerm.toLowerCase())) {
          itemCount = 1;
        }

        if (item.type === 'DIRECTORY' && item.children) {
          itemCount += countTree(item.children);
        }

        return count + itemCount;
      }, 0);
    };

    return countTree(items);
  }, [items, searchTerm]);

  return (
    <div className={cn('w-full', className)}>
      {/* Поиск */}
      <div className="p-2 border-b">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Поиск файлов..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-8 text-sm"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 transform -translate-y-1/2 w-6 h-6 p-0"
              onClick={() => setSearchTerm('')}
              title="Очистить поиск"
            >
              ×
            </Button>
          )}
        </div>
        {searchTerm && (
          <div className="mt-2 text-xs text-muted-foreground">
            Найдено: {searchResultsCount} файлов
          </div>
        )}
      </div>

      {/* Дерево файлов */}
      <div className="overflow-auto max-h-[600px]">
        {filteredItems.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            {searchTerm ? 'Файлы не найдены' : 'Файлы не загружены'}
          </div>
        ) : (
          filteredItems.map((item) => (
            <FileTreeNode
              key={item.path}
              item={item}
              level={0}
              selectedFile={selectedFile}
              expandedFolders={expandedFolders}
              onFileSelect={onFileSelect}
              onFolderToggle={onFolderToggle}
              onCreateFile={onCreateFile}
              onCreateFolder={onCreateFolder}
              onRename={onRename}
              onDelete={onDelete}
              onCopy={onCopy}
              onCut={onCut}
              onPaste={onPaste}
              onDownload={onDownload}
              onLoadChildren={onLoadChildren}
              canPaste={canPaste}
            />
          ))
        )}
      </div>
    </div>
  );
}
