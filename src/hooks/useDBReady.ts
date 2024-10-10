import { createEffect, createSignal } from "solid-js";

import useDBState from "./useDBState";

export default function useDBReady() {
  const state = useDBState();
  const [ready, setReady] = createSignal(false);

  createEffect(() => {
    setReady(state ? state().ready : false);
  });

  return ready;
}
