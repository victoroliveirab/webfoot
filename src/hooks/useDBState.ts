import { type Accessor, createEffect, createResource, createSignal } from "solid-js";
import { useNavigate } from "@solidjs/router";

import connect from "@webfoot/core/db/connect";
import { notifyORMs } from "@webfoot/core/db/orm";
import { GameLoop } from "@webfoot/models";

type State = {
  error: boolean | null;
  loading: boolean;
  ready: boolean;
};

export default function useDBState(): Accessor<State> | undefined {
  const navigate = useNavigate();
  const currentGame = GameLoop.getCurrentSave();

  if (currentGame === null) {
    navigate("/");
    return;
  }

  const [state, setState] = createSignal<State>({
    error: null,
    loading: true,
    ready: false,
  });
  const [db] = createResource(async () => connect({ name: currentGame }));

  createEffect(() => {
    if (db.state === "ready") {
      notifyORMs(db());
      setState({
        error: false,
        loading: false,
        ready: true,
      });
    } else if (db.state === "errored") {
      setState({
        error: true,
        loading: false,
        ready: false,
      });
    } else {
      setState({
        error: null,
        loading: true,
        ready: false,
      });
    }
  });

  return state;
}
