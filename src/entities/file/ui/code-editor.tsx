"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Editor, { Monaco } from "@monaco-editor/react";
import type * as MonacoEditor from "monaco-editor";
import { Button } from "@/shared/ui/components/button";
import { Badge } from "@/shared/ui/components/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/components/tooltip";
import { Save, Users, Wifi, WifiOff, Clock, Search, X } from "lucide-react";
import { FileContent } from "../model/types";
import { getMonacoLanguage, formatFileSize } from "../lib/file-utils";
import { useWebSocket } from "../lib/use-websocket";
import { cn } from "@/shared/lib/utils";

interface CodeEditorProps {
  file: FileContent | null;
  projectId: string;
  onSave?: (content: string) => void;
  onContentChange?: (content: string) => void;
  className?: string;
  readOnly?: boolean;
}

interface CursorPosition {
  line: number;
  column: number;
}

interface ActiveUser {
  userId: string;
  userName: string;
  userEmail: string;
  filePath: string;
  cursor?: CursorPosition;
  lastSeen: string;
}

export function CodeEditor({
  file,
  projectId,
  onSave,
  onContentChange,
  className,
  readOnly = false,
}: CodeEditorProps) {
  const editorRef = useRef<MonacoEditor.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<
    Array<{ line: number; column: number; text: string }>
  >([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Поиск в коде
  const performSearch = useCallback(() => {
    if (!searchTerm || !editorRef.current) {
      setSearchResults([]);
      setCurrentSearchIndex(0);
      return;
    }

    const editor = editorRef.current;
    const model = editor.getModel();
    if (!model) return;

    const lines = model.getLinesContent();
    const results: Array<{ line: number; column: number; text: string }> = [];

    lines.forEach((line: string, lineIndex: number) => {
      const lineNumber = lineIndex + 1;
      let column = 0;

      while (true) {
        const index = line
          .toLowerCase()
          .indexOf(searchTerm.toLowerCase(), column);
        if (index === -1) break;

        results.push({
          line: lineNumber,
          column: index + 1,
          text: line.trim(),
        });

        column = index + 1;
      }
    });

    setSearchResults(results);
    setCurrentSearchIndex(0);

    // Переходим к первому результату
    if (results.length > 0) {
      editor.revealLineInCenter(results[0].line);
      editor.setPosition({
        lineNumber: results[0].line,
        column: results[0].column,
      });
    }
  }, [searchTerm]);

  // Навигация по результатам поиска
  const navigateSearchResult = useCallback(
    (direction: "next" | "prev") => {
      if (searchResults.length === 0) return;

      let newIndex;
      if (direction === "next") {
        newIndex = (currentSearchIndex + 1) % searchResults.length;
      } else {
        newIndex =
          currentSearchIndex === 0
            ? searchResults.length - 1
            : currentSearchIndex - 1;
      }

      setCurrentSearchIndex(newIndex);

      const result = searchResults[newIndex];
      if (editorRef.current && result) {
        editorRef.current.revealLineInCenter(result.line);
        editorRef.current.setPosition({
          lineNumber: result.line,
          column: result.column,
        });
      }
    },
    [searchResults, currentSearchIndex]
  );

  // Эффект для выполнения поиска при изменении поискового запроса
  useEffect(() => {
    const timeoutId = setTimeout(performSearch, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, performSearch]);

  // WebSocket для real-time обновлений
  const { isConnected, activeUsers, sendMessage } = useWebSocket({
    projectId,
    onMessage: (message) => {
      if (message.type === "file_modified" && message.filePath === file?.path) {
        // Обработка обновлений от других пользователей
        console.log("File modified by another user:", message);
      }
    },
  });

  // Сохранение файла
  const handleSave = useCallback(
    async (content?: string, isAutoSave = false) => {
      if (!file || !onSave || readOnly) return;

      const contentToSave =
        content !== undefined ? content : editorRef.current?.getValue();

      if (!contentToSave) return;

      try {
        setIsSaving(true);

        // Сохраняем черновик
        if (isAutoSave) {
          await fetch(`/api/projects/${projectId}/files/draft`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              filePath: file.path,
              content: contentToSave,
            }),
          });
        } else {
          // Полное сохранение
          await onSave(contentToSave);
          setLastSaved(new Date());
          setHasUnsavedChanges(false);

          if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
          }
        }
      } catch (error) {
        console.error("Save failed:", error);
      } finally {
        setIsSaving(false);
      }
    },
    [file, projectId, onSave, readOnly]
  );

  // Автосохранение через 2 секунды после последнего изменения
  const scheduleAutoSave = useCallback(
    (content: string) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        handleSave(content, true);
      }, 2000);
    },
    [handleSave]
  );

  // Обработка изменений в редакторе
  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      const content = value || "";
      setHasUnsavedChanges(true);
      onContentChange?.(content);
      scheduleAutoSave(content);
    },
    [onContentChange, scheduleAutoSave]
  );

  // Обработка монтирования редактора
  // Подсветка курсоров других пользователей
  const highlightOtherUsersCursors = useCallback(
    (
      editor: MonacoEditor.editor.IStandaloneCodeEditor,
      monaco: Monaco,
      users: ActiveUser[]
    ) => {
      // Удаляем старые декорации курсоров
      const decorations = editor.deltaDecorations(
        editor
          .getModel()
          ?.getAllDecorations()
          .map((d: MonacoEditor.editor.IModelDecoration) => d.id) || [],
        []
      );

      const otherUsersInFile = users.filter(
        (user) => user.filePath === file?.path && user.cursor
      );

      if (otherUsersInFile.length > 0) {
        const newDecorations = otherUsersInFile.map((user, index) => ({
          range: new monaco.Range(
            user.cursor!.line,
            user.cursor!.column,
            user.cursor!.line,
            user.cursor!.column + 1
          ),
          options: {
            className: `other-user-cursor-${index}`,
            stickiness:
              monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
            afterContentClassName: `other-user-cursor-${index}-label`,
            after: {
              content: ` ${user.userName}`,
              inlineClassName: `other-user-cursor-${index}-label-text`,
            },
          },
        }));

        editor.deltaDecorations(decorations, newDecorations);
      }
    },
    [file]
  );

  const handleEditorDidMount = useCallback(
    (editor: MonacoEditor.editor.IStandaloneCodeEditor, monaco: Monaco) => {
      editorRef.current = editor;
      monacoRef.current = monaco;

      // Настройка горячих клавиш
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
        handleSave();
      });

      // Настройка курсора для совместного редактирования
      const originalSetPosition = editor.setPosition.bind(editor);

      editor.setPosition = (position: {
        lineNumber: number;
        column: number;
      }) => {
        const result = originalSetPosition(position);

        // Отправляем позицию курсора через WebSocket
        sendMessage({
          type: "cursor_moved",
          filePath: file?.path || "",
          cursor: {
            line: position.lineNumber,
            column: position.column,
          },
        });

        return result;
      };

      // Подсветка курсоров других пользователей
      if (file) {
        highlightOtherUsersCursors(editor, monaco, activeUsers);
      }
    },
    [file, sendMessage, activeUsers, highlightOtherUsersCursors, handleSave]
  );

  // Обновление декораций курсоров при изменении активных пользователей
  useEffect(() => {
    if (editorRef.current && monacoRef.current && file) {
      highlightOtherUsersCursors(
        editorRef.current,
        monacoRef.current,
        activeUsers
      );
    }
  }, [activeUsers, highlightOtherUsersCursors, file]);

  // Очистка таймера при размонтировании
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  if (!file) {
    return (
      <div
        className={cn(
          "flex items-center justify-center h-full text-muted-foreground",
          className
        )}
      >
        Выберите файл для редактирования
      </div>
    );
  }

  const language = getMonacoLanguage(file.name);

  return (
    <TooltipProvider>
      <div className={cn("flex flex-col h-full", className)}>
        {/* Панель инструментов */}
        <div className="flex items-center justify-between p-2 border-b bg-background">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{file.name}</Badge>
            <span className="text-sm text-muted-foreground">
              {formatFileSize(file.size)}
            </span>
            {file.warnings?.largeFile && (
              <Badge variant="secondary">
                <Clock className="w-3 h-3 mr-1" />
                Большой файл
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Поиск в коде */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <input
                type="text"
                placeholder="Поиск в коде..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-7 pr-7 py-1 text-xs border rounded w-48 focus:outline-none focus:ring-1 focus:ring-ring"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    navigateSearchResult("next");
                  } else if (e.key === "Escape") {
                    setSearchTerm("");
                  }
                }}
              />
              {searchTerm && (
                <>
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    title="Очистить поиск"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  {searchResults.length > 0 && (
                    <div className="absolute -bottom-6 left-0 text-xs text-muted-foreground whitespace-nowrap">
                      {currentSearchIndex + 1} из {searchResults.length}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Статус подключения */}
            <Tooltip>
              <TooltipTrigger>
                <div
                  className={cn(
                    "flex items-center gap-1 text-xs",
                    isConnected ? "text-green-600" : "text-red-600"
                  )}
                >
                  {isConnected ? (
                    <Wifi className="w-3 h-3" />
                  ) : (
                    <WifiOff className="w-3 h-3" />
                  )}
                  <span>{activeUsers.length} пользователей</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                {isConnected ? "Подключено к серверу" : "Отключено от сервера"}
              </TooltipContent>
            </Tooltip>

            {/* Статус сохранения */}
            <div className="flex items-center gap-2">
              {isSaving && (
                <Badge variant="secondary">
                  <Clock className="w-3 h-3 mr-1" />
                  Сохраняется...
                </Badge>
              )}

              {hasUnsavedChanges && !isSaving && (
                <Badge variant="outline">Несохраненные изменения</Badge>
              )}

              {lastSaved && !hasUnsavedChanges && (
                <span className="text-xs text-muted-foreground">
                  Сохранено {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </div>

            {/* Кнопки действий */}
            <div className="flex gap-1">
              {/* Навигация по результатам поиска */}
              {searchResults.length > 0 && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateSearchResult("prev")}
                        title="Предыдущий результат (Shift+F3)"
                      >
                        ↑
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Предыдущий результат</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateSearchResult("next")}
                        title="Следующий результат (F3)"
                      >
                        ↓
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Следующий результат</TooltipContent>
                  </Tooltip>
                </>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSave()}
                    disabled={isSaving || readOnly}
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Сохранить (Ctrl+S)</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Редактор */}
        <div className="flex-1">
          <Editor
            height="100%"
            language={language}
            value={file.content}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            options={{
              readOnly,
              minimap: { enabled: true },
              fontSize: 14,
              lineNumbers: "on",
              roundedSelection: false,
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: "on",
              folding: true,
              lineDecorationsWidth: 10,
              lineNumbersMinChars: 3,
              renderWhitespace: "selection",
              bracketPairColorization: { enabled: true },
              guides: {
                bracketPairs: true,
                indentation: true,
              },
            }}
            loading={
              <div className="flex items-center justify-center h-full">
                Загрузка редактора...
              </div>
            }
          />
        </div>

        {/* Активные пользователи */}
        {activeUsers.length > 0 && (
          <div className="p-2 border-t bg-muted/50">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">
                Активные пользователи:
              </span>
              <div className="flex gap-1">
                {activeUsers.slice(0, 3).map((user) => (
                  <Badge key={user.userId} variant="outline">
                    {user.userName}
                  </Badge>
                ))}
                {activeUsers.length > 3 && (
                  <Badge variant="outline">+{activeUsers.length - 3}</Badge>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
