import { Index, type Accessor } from "solid-js";

import type Simulator from "@webfoot/core/engine/simulator";
import { getAllPlayersOnSimulator } from "@webfoot/core/engine/simulator/helpers";

type Props = {
  simulation: Accessor<Simulator | null>;
};

const Occurances = ({ simulation }: Props) => {
  const occurancesToRender = () => {
    if (!simulation()) return null;
    // TODO: filter out injuries and/or redcards when checkbox implemented
    return simulation()!.occurances;
  };

  const players = () => {
    if (!simulation()) return [];
    return getAllPlayersOnSimulator(simulation()!);
  };

  return (
    <div class="flex flex-col justify-between py-4">
      <ul class="pl-6 text-sm">
        <Index each={occurancesToRender()}>
          {(occurance) => {
            const type = occurance().type;
            const player = players().find((player) => player.id === occurance().playerId)!;
            switch (type) {
              case "REDCARD": {
                return (
                  <li class="flex gap-1">
                    <span>{occurance().time}'</span>
                    <span>{player.name}</span>
                    <span>(cartão vermelho)</span>
                  </li>
                );
              }
              case "INJURY": {
                return (
                  <li class="flex gap-1">
                    <span>{occurance().time}'</span>
                    <span>{player.name}</span>
                    <span>(lesionado)</span>
                  </li>
                );
              }
              default: {
                return (
                  <li class="flex gap-1">
                    <span>{simulation()!.scoreline[occurance().time].join(":")}</span>
                    <span>{player.name}</span>
                    <span>{occurance().time}'</span>
                  </li>
                );
              }
            }
          }}
        </Index>
      </ul>
    </div>
  );
};

export default Occurances;
