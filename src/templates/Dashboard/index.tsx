import { createResource, type Component } from "solid-js";

import { Team, Trainer } from "@webfoot/core/models";
import useDBReady from "@webfoot/hooks/useDBReady";

const Dashboard: Component = () => {
  const dbReady = useDBReady();
  const [trainer] = createResource(dbReady, async () => Trainer.getById(1));
  const [team] = createResource(trainer, async () => Team.getById(trainer()!.teamId!));

  return (
    <div>
      <p>Trainer: {trainer()?.name}</p>
      <p>Team: {team()?.name}</p>
    </div>
  );
};

export default Dashboard;
