import { type Component } from "solid-js";

import Button from "@webfoot/components/Button";

const Home: Component = () => {
  return (
    <div class="flex flex-col items-center gap-4">
      <h1>Home</h1>
      <Button class="style-98">Button</Button>
      <Button class="style-98 default">Default</Button>
    </div>
  );
};

export default Home;
