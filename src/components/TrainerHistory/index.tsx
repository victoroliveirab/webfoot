import { createResource, type Accessor, For } from "solid-js";

import { Trainer } from "@webfoot/core/models";
import type { ITrainer } from "@webfoot/core/models/types";

type Props = {
  class?: HTMLDivElement["className"];
  trainerId: Accessor<ITrainer["id"]>;
};

export default function TrainerHistory(props: Props) {
  const [trainer] = createResource(async () => Trainer.getById(props.trainerId()));

  return (
    <div role="table" class={props.class}>
      <For each={trainer()?.history}>
        {(line) => (
          <div role="row" class="flex gap-2 text-sm px-1">
            <div role="cell">{line.season}</div>
            <div role="cell">{line.description}</div>
          </div>
        )}
      </For>
    </div>
  );
}
