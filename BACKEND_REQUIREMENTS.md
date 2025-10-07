# Требования к бэкенду для работы с загрузкой файлов

## API эндпоинты

### 1. Создание проекта
```
POST /api/projects
Content-Type: multipart/form-data

Поля формы:
- name: string (обязательно)
- description: string (необязательно)
- projectFile: File (обязательно, .zip/.rar, макс. 100MB)
```

### 2. Получение списка проектов
```
GET /api/projects?search={query}&status={status}&limit={limit}&offset={offset}

Ответ:
{
  "projects": [
    {
      "id": "string",
      "name": "string", 
      "description": "string",
      "projectFile": "string", // имя файла или URL
      "createdAt": "ISO string",
      "updatedAt": "ISO string",
      "status": "active" | "archived" | "deleted"
    }
  ],
  "total": number,
  "hasMore": boolean
}
```

### 3. Получение проекта по ID
```
GET /api/projects/{id}

Ответ:
{
  "project": {
    "id": "string",
    "name": "string",
    "description": "string", 
    "projectFile": "string",
    "createdAt": "ISO string",
    "updatedAt": "ISO string",
    "status": "active" | "archived" | "deleted"
  }
}
```

### 4. Обновление проекта
```
PATCH /api/projects/{id}
Content-Type: multipart/form-data

Поля формы:
- name: string (необязательно)
- description: string (необязательно)
- projectFile: File (необязательно, .zip/.rar, макс. 100MB)
```

### 5. Удаление проекта
```
DELETE /api/projects/{id}

Ответ: 204 No Content
```

### 6. Архивирование проекта
```
POST /api/projects/{id}/archive

Ответ:
{
  "project": { ... }
}
```

### 7. Восстановление проекта
```
POST /api/projects/{id}/restore

Ответ:
{
  "project": { ... }
}
```

## Обработка файлов

### Валидация файлов
- Типы файлов: `.zip`, `.rar`
- Максимальный размер: 100MB
- MIME типы: `application/zip`, `application/x-rar-compressed`, `application/x-zip-compressed`

### Хранение файлов
- Сохранять файлы в безопасной директории
- Генерировать уникальные имена файлов
- Возвращать имя файла или URL в ответе

### Безопасность
- Проверка типов файлов
- Сканирование на вирусы (рекомендуется)
- Ограничение размера файлов
- Санитизация имен файлов

## Структура базы данных

### Таблица projects
```sql
CREATE TABLE projects (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  project_file VARCHAR(255), -- имя файла
  status ENUM('active', 'archived', 'deleted') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Обработка ошибок

### Коды ответов
- `200` - Успешный запрос
- `201` - Ресурс создан
- `400` - Ошибка валидации
- `404` - Ресурс не найден
- `413` - Файл слишком большой
- `415` - Неподдерживаемый тип файла
- `500` - Внутренняя ошибка сервера

### Формат ошибок
```json
{
  "message": "Описание ошибки",
  "errors": {
    "field": ["Сообщение об ошибке"]
  }
}
```

## Аутентификация

Если используется аутентификация:
- Проверка токена в заголовке `Authorization: Bearer {token}`
- Возврат `401` при отсутствии или недействительности токена

## CORS

Настроить CORS для фронтенда:
- Origin: домен фронтенда
- Methods: `GET, POST, PATCH, DELETE`
- Headers: `Content-Type, Authorization`
- Credentials: `true`

## Примеры ответов

### Успешное создание проекта
```json
{
  "project": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Мой проект",
    "description": "Описание проекта",
    "projectFile": "project_123e4567.zip",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z", 
    "status": "active"
  }
}
```

### Ошибка валидации
```json
{
  "message": "Ошибка валидации",
  "errors": {
    "name": ["Название проекта обязательно"],
    "projectFile": ["Файл проекта обязателен"]
  }
}
```

## Отображение прогресса загрузки

### Реализация на фронтенде

Фронтенд использует моковый прогресс загрузки для демонстрации. Для реальной интеграции с бэкендом рекомендуется:

#### 1. Использование XMLHttpRequest для отслеживания прогресса
```javascript
const uploadWithProgress = (formData, onProgress) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        const percentComplete = (event.loaded / event.total) * 100;
        onProgress(percentComplete);
      }
    });
    
    xhr.addEventListener('load', () => {
      if (xhr.status === 200 || xhr.status === 201) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(xhr.statusText));
      }
    });
    
    xhr.addEventListener('error', () => {
      reject(new Error('Ошибка загрузки'));
    });
    
    xhr.open('POST', '/api/projects');
    xhr.send(formData);
  });
};
```

#### 2. Обновление компонента FileUpload
```typescript
// В компоненте FileUpload добавить поддержку реального прогресса
interface FileUploadProps {
  // ... существующие props
  onUploadProgress?: (progress: number) => void;
}

// В форме создания проекта
const onSubmit = async (values: ProjectCreateFormData) => {
  setServerError(null);
  setIsUploading(true);
  setUploadProgress(0);

  try {
    const formData = new FormData();
    formData.append('name', values.name);
    if (values.description) formData.append('description', values.description);
    if (values.projectFile) formData.append('projectFile', values.projectFile);

    await uploadWithProgress(formData, (progress) => {
      setUploadProgress(progress);
    });

    router.push(ROUTES.project.build());
  } catch (error) {
    setIsUploading(false);
    setUploadProgress(0);
    setServerError(error.message);
  }
};
```

### Требования к бэкенду для прогресса

#### 1. Поддержка chunked upload (опционально)
```
POST /api/projects/upload/start
{
  "fileName": "project.zip",
  "fileSize": 1048576,
  "contentType": "application/zip"
}

Ответ:
{
  "uploadId": "uuid",
  "chunkSize": 1024
}

POST /api/projects/upload/chunk
Content-Type: application/octet-stream
X-Upload-ID: uuid
X-Chunk-Number: 1

[бинарные данные чанка]

POST /api/projects/upload/complete
{
  "uploadId": "uuid",
  "projectData": {
    "name": "Название проекта",
    "description": "Описание"
  }
}
```

#### 2. WebSocket для реального времени (опционально)
```javascript
// Подключение к WebSocket для получения прогресса
const ws = new WebSocket('ws://backend/api/upload/progress');
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.uploadId === currentUploadId) {
    setUploadProgress(data.progress);
  }
};
```

### Рекомендации по производительности

#### 1. Оптимизация загрузки
- Использовать сжатие файлов на клиенте
- Реализовать resume upload для больших файлов
- Добавить предварительную валидацию файлов

#### 2. Обработка на сервере
- Асинхронная обработка файлов
- Очередь задач для тяжелых операций
- Кэширование результатов

#### 3. Мониторинг
- Логирование прогресса загрузки
- Метрики производительности
- Алерты при ошибках

## Переменные окружения

Добавить в `.env` файл фронтенда:
```env
NEXT_PUBLIC_API_URL=http://your-backend-domain.com/api
```

## Тестирование

### Тестовые файлы
- Создать тестовые .zip и .rar файлы разных размеров
- Проверить загрузку файлов до 100MB
- Тестировать ошибки валидации

### Автоматизированные тесты
```javascript
// Пример теста для API
describe('Project Upload API', () => {
  it('should upload project file successfully', async () => {
    const formData = new FormData();
    formData.append('name', 'Test Project');
    formData.append('projectFile', testZipFile);
    
    const response = await fetch('/api/projects', {
      method: 'POST',
      body: formData
    });
    
    expect(response.status).toBe(201);
    const result = await response.json();
    expect(result.project.name).toBe('Test Project');
  });
});
```

Этот документ содержит все необходимые требования для реализации бэкенда, который будет работать с текущим фронтендом и поддерживать загрузку файлов с отображением прогресса.
