import { EncryptedData } from '../types/api-key'

const DB_NAME = 'APIKeyManager'
const DB_VERSION = 1
const STORE_NAME = 'encrypted_keys'

interface StoredData {
  id: string
  data: EncryptedData
  timestamp: number
}

class IndexedDBStorage {
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = event => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
          store.createIndex('timestamp', 'timestamp', { unique: false })
        }
      }
    })
  }

  async storeData(key: string, data: EncryptedData): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)

      const storedData: StoredData = {
        id: key,
        data,
        timestamp: Date.now(),
      }

      const request = store.put(storedData)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async getData(key: string): Promise<EncryptedData | null> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(key)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        const result = request.result as StoredData | undefined
        resolve(result ? result.data : null)
      }
    })
  }

  async deleteData(key: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.delete(key)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }

  async clearAll(): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.clear()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }
}

// Fallback to localStorage if IndexedDB is not available
export const createSecureStorage = () => {
  const indexedDBStorage = new IndexedDBStorage()

  return {
    async setItem(key: string, data: EncryptedData): Promise<void> {
      try {
        await indexedDBStorage.storeData(key, data)
      } catch (error) {
        // Fallback to localStorage
        console.warn('IndexedDB not available, falling back to localStorage:', error)
        localStorage.setItem(key, JSON.stringify(data))
      }
    },

    async getItem(key: string): Promise<EncryptedData | null> {
      try {
        return await indexedDBStorage.getData(key)
      } catch (error) {
        // Fallback to localStorage
        console.warn('IndexedDB not available, falling back to localStorage:', error)
        try {
          const stored = localStorage.getItem(key)
          return stored ? JSON.parse(stored) : null
        } catch {
          return null
        }
      }
    },

    async removeItem(key: string): Promise<void> {
      try {
        await indexedDBStorage.deleteData(key)
      } catch (error) {
        // Fallback to localStorage
        console.warn('IndexedDB not available, falling back to localStorage:', error)
        localStorage.removeItem(key)
      }
    },

    async clear(): Promise<void> {
      try {
        await indexedDBStorage.clearAll()
      } catch (error) {
        // Fallback to localStorage
        console.warn('IndexedDB not available, falling back to localStorage:', error)
        localStorage.clear()
      }
    },
  }
}
