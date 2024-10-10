type Params = {
  name: string;
  initSchema?: (db: IDBDatabase) => void;
};

export default async function connect(params: Params) {
  const request = window.indexedDB.open(params.name);
  return new Promise<IDBDatabase>((resolve, reject) => {
    request.onerror = (event) => {
      const target = event.target as IDBOpenDBRequest;
      console.error(target.error);
      reject(target.error);
    };

    request.onsuccess = (event) => {
      const target = event.target as IDBOpenDBRequest;
      resolve(target.result);
    };

    request.onupgradeneeded = (event) => {
      const target = event.target as IDBOpenDBRequest;
      params.initSchema?.(target.result);
    };
  });
}
