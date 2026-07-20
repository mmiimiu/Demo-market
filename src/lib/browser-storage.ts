export interface BrowserStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): boolean;
  removeItem(key: string): boolean;
  clear(): boolean;
  getJSON<T>(key: string, fallback: T): T;
  setJSON<T>(key: string, value: T): boolean;
}

type StorageName = 'localStorage' | 'sessionStorage';

function resolveStorage(name: StorageName): Storage | null {
  if (typeof window === 'undefined') return null;

  try {
    return window[name];
  } catch {
    return null;
  }
}

function createBrowserStorage(name: StorageName): BrowserStorage {
  const getStorage = () => resolveStorage(name);

  return {
    getItem(key) {
      try {
        return getStorage()?.getItem(key) ?? null;
      } catch {
        return null;
      }
    },
    setItem(key, value) {
      try {
        const storage = getStorage();
        if (!storage) return false;
        storage.setItem(key, value);
        return true;
      } catch {
        return false;
      }
    },
    removeItem(key) {
      try {
        const storage = getStorage();
        if (!storage) return false;
        storage.removeItem(key);
        return true;
      } catch {
        return false;
      }
    },
    clear() {
      try {
        const storage = getStorage();
        if (!storage) return false;
        storage.clear();
        return true;
      } catch {
        return false;
      }
    },
    getJSON<T>(key: string, fallback: T): T {
      const value = this.getItem(key);
      if (value === null) return fallback;

      try {
        return JSON.parse(value) as T;
      } catch {
        return fallback;
      }
    },
    setJSON<T>(key: string, value: T): boolean {
      try {
        return this.setItem(key, JSON.stringify(value));
      } catch {
        return false;
      }
    },
  };
}

export const browserStorage = createBrowserStorage('localStorage');
export const browserSessionStorage = createBrowserStorage('sessionStorage');
