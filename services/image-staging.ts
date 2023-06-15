const dbName = "locblog-admin";
const dbVersion = 1;
const storeName = "staged-images";
const primaryKey = "name";

function keyOf(file: File) {
  let path = file.webkitRelativePath;
  if (path == "") path = file.name;
  return path;
}

const valueOf = keyOf;

function promisify<T>(target: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    target.onsuccess = () => resolve(target.result);
    target.onerror = () => reject();
  });
}

class ImageStagingService {
  private async openDatabase() {
    return await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(dbName, dbVersion);
      request.onerror = () => reject();
      request.onsuccess = () => resolve(request.result);
      request.onupgradeneeded = () => this.initializeDatabase(request.result);
    });
  }

  private async initializeDatabase(db: IDBDatabase) {
    return await new Promise<void>((resolve, reject) => {
      const store = db.createObjectStore(storeName);
      store.createIndex(primaryKey, primaryKey, { unique: true });
      store.transaction.oncomplete = () => resolve();
      store.transaction.onerror = () => reject();
    });
  }

  private async beginTransaction(mode: IDBTransactionMode) {
    const db = await this.openDatabase();
    return db.transaction(storeName, mode);
  }

  public async setStaged(file: File, stage = true) {
    const transaction = await this.beginTransaction("readwrite");
    if (stage) {
      return await promisify(
        transaction.objectStore(storeName).put(valueOf(file), keyOf(file)),
      );
    } else {
      return await promisify(
        transaction.objectStore(storeName).delete(keyOf(file)),
      );
    }
  }

  public async isStaged(file: File) {
    const transaction = await this.beginTransaction("readonly");
    const request = transaction.objectStore(storeName).getKey(keyOf(file));
    return await promisify(request) ? true : false;
  }

  public async list() {
    const transaction = await this.beginTransaction("readonly");
    const request = transaction.objectStore(storeName).getAll();
    return await promisify(request) as File[];
  }

  public async clear() {
    const transaction = await this.beginTransaction("readwrite");
    const request = transaction.objectStore(storeName).clear();
    return await promisify(request);
  }

  public setDescription(file: File, description: string) {
    localStorage.setItem(keyOf(file), description);
  }

  public getDescription(file: File) {
    return localStorage.getItem(keyOf(file));
  }

  public deleteDescription(file: File) {
    return localStorage.removeItem(keyOf(file));
  }
}

const stager = new ImageStagingService();
export default stager;
