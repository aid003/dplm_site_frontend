"use client";

import { useState, useCallback, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/shared/ui/components/resizable';
import { Button } from '@/shared/ui/components/button';
import { Badge } from '@/shared/ui/components/badge';
import { ArrowLeft, Plus, FolderPlus, RefreshCw } from 'lucide-react';
import { FileTree } from '@/entities/file/ui/file-tree';
import { CodeEditor } from '@/entities/file/ui/code-editor';
import { FileAPI } from '@/entities/file/api/file-api';
import { useWebSocket } from '@/entities/file/lib/use-websocket';
import type {
  FileTreeItem,
  FileContent,
  SaveFileParams,
  CreateFileParams,
  CreateDirectoryParams,
  WebSocketIncomingMessage,
  WebSocketOutgoingMessage,
} from '@/entities/file/model/types';
import { toast } from 'sonner';

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;

  // Состояние
  const [fileTree, setFileTree] = useState<FileTreeItem[]>([]);
  const [currentFile, setCurrentFile] = useState<FileContent | null>(null);
  const [selectedFilePath, setSelectedFilePath] = useState<string>('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const sendMessageRef = useRef<((message: WebSocketOutgoingMessage) => void) | null>(null);

  // Загрузка дерева файлов
  const loadFileTree = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await FileAPI.getFileTree(projectId, { lazy: true });
      setFileTree(response.items);
    } catch (error) {
      console.error('Failed to load file tree:', error);
      toast.error('Ошибка загрузки дерева файлов');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  // Загрузка содержимого файла
  const loadFileContent = useCallback(async (filePath: string) => {
    try {
      const response = await FileAPI.getFileContent(projectId, { filePath });
      setCurrentFile(response);
      setSelectedFilePath(filePath);

      // Отправляем сообщение об открытии файла
      if (sendMessageRef.current) {
        sendMessageRef.current({
          type: 'file_opened',
          filePath,
        });
      }
    } catch (error) {
      console.error('Failed to load file content:', error);
      toast.error('Ошибка загрузки файла');
    }
  }, [projectId]);

  // WebSocket для real-time обновлений
  const handleWsMessage = useCallback((message: WebSocketIncomingMessage) => {
    if (message.type === 'file_modified') {
      if (message.filePath === selectedFilePath) {
        loadFileContent(selectedFilePath);
      }
      loadFileTree();
    }
  }, [selectedFilePath, loadFileContent, loadFileTree]);

  const { isConnected, sendMessage } = useWebSocket({
    projectId,
    onMessage: handleWsMessage,
  });

  useEffect(() => {
    sendMessageRef.current = sendMessage;
  }, [sendMessage]);

  

  // Сохранение файла
  const handleSaveFile = useCallback(async (content: string) => {
    if (!currentFile) return;

    try {
      const params: SaveFileParams = {
        filePath: currentFile.path,
        content,
        message: `Обновление файла ${currentFile.name}`,
      };

      await FileAPI.saveFile(projectId, params);

      // Обновляем локальное состояние
      setCurrentFile(prev => prev ? { ...prev, content, updatedAt: new Date().toISOString() } : null);

      toast.success('Файл сохранен');
    } catch (error) {
      console.error('Failed to save file:', error);
      toast.error('Ошибка сохранения файла');
      throw error; // Пробрасываем ошибку для обработки в редакторе
    }
  }, [currentFile, projectId]);

  // Создание файла
  const handleCreateFile = useCallback(async (parentPath: string) => {
    const fileName = prompt('Введите имя файла:');
    if (!fileName) return;

    try {
      const params: CreateFileParams = {
        filePath: parentPath,
        name: fileName,
      };

      await FileAPI.createFile(projectId, params);
      toast.success('Файл создан');
      loadFileTree();
    } catch (error) {
      console.error('Failed to create file:', error);
      toast.error('Ошибка создания файла');
    }
  }, [projectId, loadFileTree]);

  // Создание папки
  const handleCreateFolder = useCallback(async (parentPath: string) => {
    const folderName = prompt('Введите имя папки:');
    if (!folderName) return;

    try {
      const params: CreateDirectoryParams = {
        filePath: parentPath,
        name: folderName,
      };

      await FileAPI.createDirectory(projectId, params);
      toast.success('Папка создана');
      loadFileTree();
    } catch (error) {
      console.error('Failed to create folder:', error);
      toast.error('Ошибка создания папки');
    }
  }, [projectId, loadFileTree]);

  // Загрузка дочерних элементов папки
  const handleLoadChildren = useCallback(async (folderPath: string) => {
    try {
      const response = await FileAPI.getChildren(projectId, folderPath);

      setFileTree(prevTree => {
        const updateTree = (items: FileTreeItem[]): FileTreeItem[] => {
          return items.map(item => {
            if (item.path === folderPath && item.type === 'DIRECTORY') {
              return {
                ...item,
                children: response.items,
                hasChildren: false, // Загружено, больше не нужно ленивой загрузки
              };
            }

            if (item.children && item.type === 'DIRECTORY') {
              return {
                ...item,
                children: updateTree(item.children),
              };
            }

            return item;
          });
        };

        return updateTree(prevTree);
      });
    } catch (error) {
      console.error('Failed to load children:', error);
      toast.error('Ошибка загрузки содержимого папки');
    }
  }, [projectId]);

  // Переименование файла/папки
  const handleRename = useCallback(async (filePath: string, newName: string) => {
    try {
      // Здесь должна быть реализация переименования через API
      // Пока просто показываем уведомление
      toast.success(`Файл переименован в ${newName}`);
      loadFileTree(); // Обновляем дерево файлов
    } catch (error) {
      console.error('Failed to rename:', error);
      toast.error('Ошибка переименования');
    }
  }, [loadFileTree]);

  // Удаление файла/папки
  const handleDelete = useCallback(async (filePath: string) => {
    try {
      await FileAPI.deleteFile(projectId, filePath);
      toast.success('Файл удален');
      loadFileTree();

      // Если удаляем текущий открытый файл, закрываем его
      if (filePath === selectedFilePath) {
        setCurrentFile(null);
        setSelectedFilePath('');
      }
    } catch (error) {
      console.error('Failed to delete:', error);
      toast.error('Ошибка удаления файла');
    }
  }, [projectId, loadFileTree, selectedFilePath]);

  // Копирование файла/папки
  const handleCopy = useCallback(() => {
    // Здесь должна быть реализация копирования в буфер обмена
    toast.success('Файл скопирован');
  }, []);

  // Вырезание файла/папки
  const handleCut = useCallback(() => {
    // Здесь должна быть реализация вырезания в буфер обмена
    toast.success('Файл вырезан');
  }, []);

  // Вставка файла/папки
  const handlePaste = useCallback(() => {
    // Здесь должна быть реализация вставки из буфера обмена
    toast.success('Файл вставлен');
  }, []);

  // Скачивание файла
  const handleDownload = useCallback(async (filePath: string) => {
    try {
      const response = await FileAPI.getFileContent(projectId, { filePath });
      const blob = new Blob([response.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Файл скачан');
    } catch (error) {
      console.error('Failed to download:', error);
      toast.error('Ошибка скачивания файла');
    }
  }, [projectId]);

  // Переключение развернутости папки
  const handleFolderToggle = useCallback((folderPath: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderPath)) {
        newSet.delete(folderPath);
      } else {
        newSet.add(folderPath);
      }
      return newSet;
    });
  }, []);

  // Выбор файла
  const handleFileSelect = useCallback((filePath: string) => {
    loadFileContent(filePath);
  }, [loadFileContent]);

  // Возврат к списку проектов
  const handleBackToProjects = useCallback(() => {
    router.push('/project');
  }, [router]);

  // Загрузка данных при монтировании
  useEffect(() => {
    loadFileTree();
  }, [loadFileTree]);

  return (
    <div className="h-screen flex flex-col">
      {/* Заголовок */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleBackToProjects}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            К проектам
          </Button>
          <div>
            <h1 className="text-xl font-semibold">Редактор кода</h1>
            <p className="text-sm text-muted-foreground">Проект: {projectId}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? 'Подключено' : 'Отключено'}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={loadFileTree}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Обновить
          </Button>
        </div>
      </div>

      {/* Основная область редактора */}
      <div className="flex-1">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {/* Панель с деревом файлов */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
            <div className="h-full border-r">
              <div className="p-4 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="font-medium">Файлы проекта</h2>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCreateFile('')}
                      title="Создать файл в корне"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCreateFolder('')}
                      title="Создать папку в корне"
                    >
                      <FolderPlus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <FileTree
                items={fileTree}
                selectedFile={selectedFilePath}
                expandedFolders={expandedFolders}
                onFileSelect={handleFileSelect}
                onFolderToggle={handleFolderToggle}
                onCreateFile={handleCreateFile}
                onCreateFolder={handleCreateFolder}
                onRename={handleRename}
                onDelete={handleDelete}
                onCopy={handleCopy}
                onCut={handleCut}
                onPaste={handlePaste}
                onDownload={handleDownload}
                onLoadChildren={handleLoadChildren}
                canPaste={false}
              />
            </div>
          </ResizablePanel>

          <ResizableHandle />

          {/* Панель с редактором кода */}
          <ResizablePanel defaultSize={75}>
            <CodeEditor
              file={currentFile}
              projectId={projectId}
              onSave={handleSaveFile}
              readOnly={false}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
