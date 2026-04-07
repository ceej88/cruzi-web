// Neural Scribe - IndexedDB Audio Storage Service
// Provides local caching of audio snippets for reliability

const DB_NAME = 'CruziNeuralScribe';
const DB_VERSION = 1;
const STORE_NAME = 'audioSnippets';

export interface AudioSnippet {
  id: string;
  lessonId: string;
  studentId: string;
  blob: Blob;
  timestamp: string;
  duration: number;
  isProcessed: boolean;
}

let dbInstance: IDBDatabase | null = null;

export const openDatabase = (): Promise<IDBDatabase> => {
  if (dbInstance) return Promise.resolve(dbInstance);

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('Failed to open IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('lessonId', 'lessonId', { unique: false });
        store.createIndex('studentId', 'studentId', { unique: false });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
};

export const saveSnippet = async (snippet: AudioSnippet): Promise<void> => {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(snippet);

    request.onerror = () => {
      console.error('Failed to save snippet:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => resolve();
  });
};

export const getSnippetsByLesson = async (lessonId: string): Promise<AudioSnippet[]> => {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('lessonId');
    const request = index.getAll(lessonId);

    request.onerror = () => {
      console.error('Failed to get snippets:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => resolve(request.result || []);
  });
};

export const getSnippetsByStudent = async (studentId: string): Promise<AudioSnippet[]> => {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('studentId');
    const request = index.getAll(studentId);

    request.onerror = () => {
      console.error('Failed to get snippets:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => resolve(request.result || []);
  });
};

export const getUnprocessedSnippets = async (): Promise<AudioSnippet[]> => {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onerror = () => {
      console.error('Failed to get snippets:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      const all = request.result || [];
      resolve(all.filter(s => !s.isProcessed));
    };
  });
};

export const markSnippetProcessed = async (id: string): Promise<void> => {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const getRequest = store.get(id);

    getRequest.onerror = () => reject(getRequest.error);
    
    getRequest.onsuccess = () => {
      const snippet = getRequest.result;
      if (snippet) {
        snippet.isProcessed = true;
        const putRequest = store.put(snippet);
        putRequest.onerror = () => reject(putRequest.error);
        putRequest.onsuccess = () => resolve();
      } else {
        resolve();
      }
    };
  });
};

export const deleteSnippet = async (id: string): Promise<void> => {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onerror = () => {
      console.error('Failed to delete snippet:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => resolve();
  });
};

export const clearLessonSnippets = async (lessonId: string): Promise<void> => {
  const snippets = await getSnippetsByLesson(lessonId);
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    let completed = 0;
    const total = snippets.length;

    if (total === 0) {
      resolve();
      return;
    }

    snippets.forEach(snippet => {
      const request = store.delete(snippet.id);
      request.onsuccess = () => {
        completed++;
        if (completed === total) resolve();
      };
      request.onerror = () => reject(request.error);
    });
  });
};

export const clearAllSnippets = async (): Promise<void> => {
  const db = await openDatabase();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
};

// Utility to convert Blob to Base64 for API transmission
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      // Remove the data URL prefix (e.g., "data:audio/webm;base64,")
      const base64Data = base64.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Generate unique ID for snippets
export const generateSnippetId = (): string => {
  return `snippet_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};
