import type { TableName } from "./constants";

const instances: ORM<any>[] = [];

export function notifyORMs(conn: IDBDatabase) {
  for (const instance of instances) {
    instance.assignDbConnection(conn);
  }
}

export default abstract class ORM<T extends { id: number }, I extends keyof T = never> {
  // @ts-expect-error
  protected connection: IDBDatabase;
  constructor(protected readonly storeName: TableName) {}

  protected observeNewConnections(instance: ORM<T, I>) {
    instances.push(instance);
  }

  assignDbConnection(connection: IDBDatabase) {
    this.connection = connection;
  }

  async add(value: Omit<T, "id">): Promise<T["id"]> {
    const { connection: instance, storeName } = this;
    const transaction = instance.transaction(storeName, "readwrite");
    const request = transaction.objectStore(storeName).add(value);
    return new Promise((resolve, reject) => {
      request.onsuccess = (event) => {
        const target = event.target as IDBRequest<T["id"]>;
        resolve(target.result);
      };

      request.onerror = (event) => {
        const target = event.target as IDBRequest<T["id"]>;
        console.error(target.error);
        reject(target.error);
      };
    });
  }

  async getById(id: T["id"]): Promise<T> {
    const { connection: instance, storeName } = this;
    const transaction = instance.transaction(storeName, "readonly");
    const request = transaction.objectStore(storeName).get(id);
    return new Promise((resolve, reject) => {
      request.onsuccess = (event) => {
        const target = event.target as IDBRequest<T>;
        resolve(target.result);
      };
      request.onerror = (event) => {
        const target = event.target as IDBRequest<T>;
        console.error(target.error);
        reject(target.error);
      };
    });
  }

  async getMultipleByIds(ids: T["id"][]): Promise<T[]> {
    const promises: Promise<T>[] = [];
    // REFACTOR: this can bite me in the butt for the amount of promises being created
    // but for now it's fine
    for (const id of ids) {
      promises.push(this.getById(id));
    }
    return Promise.all(promises);
  }

  async getAll(): Promise<T[]> {
    const { connection: instance, storeName } = this;
    const transaction = instance.transaction(storeName, "readonly");
    const request = transaction.objectStore(storeName).getAll();
    return new Promise((resolve, reject) => {
      request.onsuccess = (event) => {
        const target = event.target as IDBRequest<T[]>;
        resolve(target.result);
      };
      request.onerror = (event) => {
        const target = event.target as IDBRequest<T[]>;
        console.error(target.error);
        reject(target.error);
      };
    });
  }

  async getMultipleByIndex(
    indexName: I,
    indexValue: NonNullable<T[I]>,
    max: number = Number.MAX_SAFE_INTEGER,
  ): Promise<T[]> {
    const { connection: instance, storeName } = this;
    const transaction = instance.transaction(storeName, "readonly");
    const index = transaction.objectStore(storeName).index(indexName as string);
    const cursorRequest = index.openCursor(IDBKeyRange.only(indexValue));

    const matches: T[] = [];

    return new Promise((resolve, reject) => {
      cursorRequest.onsuccess = (event) => {
        const target = event.target as IDBRequest<T>;
        const cursor = target.result as unknown as IDBCursorWithValue;
        if (cursor) {
          matches.push(cursor.value);
          if (matches.length >= max) {
            resolve(matches);
          }
          cursor.continue();
        } else {
          resolve(matches);
        }
      };
      cursorRequest.onerror = (event) => {
        const target = event.target as IDBRequest<T>;
        console.error(target.error);
        reject(target.error);
      };
    });
  }

  async update(value: T): Promise<T["id"]> {
    const { connection: instance, storeName } = this;
    const transaction = instance.transaction(storeName, "readwrite");
    const request = transaction.objectStore(storeName).put(value);
    return new Promise((resolve, reject) => {
      request.onsuccess = (event) => {
        const target = event.target as IDBRequest<T["id"]>;
        resolve(target.result);
      };
      request.onerror = (event) => {
        const target = event.target as IDBRequest<T["id"]>;
        console.error(target.error);
        reject(target.error);
      };
    });
  }

  async patch(value: { id: T["id"] } & Partial<T>) {
    const entity = await this.getById(value.id);
    const newEntity = {
      ...entity,
      ...value,
    };
    return this.update(newEntity);
  }
}
