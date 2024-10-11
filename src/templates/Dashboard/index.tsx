import { createResource, type Component } from "solid-js";
import { useNavigate, useParams } from "@solidjs/router";

import { Team, Trainer } from "@webfoot/core/models";
import useDBReady from "@webfoot/hooks/useDBReady";

const Dashboard: Component = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const dbReady = useDBReady();

  const [trainer] = createResource(dbReady, async () => {
    const trainer = await Trainer.getById(+id);
    if (!trainer.human) {
      navigate("/");
    }
    return trainer;
  });
  const [team] = createResource(trainer, async () => Team.getById(trainer()!.teamId!));

  return (
    <div>
      <p>Trainer: {trainer()?.name}</p>
      <p>Team: {team()?.name}</p>
    </div>
  );
};

export default Dashboard;
