import { createResource } from "solid-js";

export default function useAvailableSaves() {
  const [saves] = createResource(async () => {
    try {
      const dbs = await window.indexedDB.databases();
      return dbs.map(({ name }) => name!);
    } catch (error) {
      console.error(error);
      return [];
    }
  });

  return saves;
}
