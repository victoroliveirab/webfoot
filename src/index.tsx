/* @refresh reload */
import { render } from "solid-js/web";
import { Route, Router } from "@solidjs/router";

import "./index.css";
import Home from "./templates/Home";
import About from "./templates/About";
import Dashboard from "./templates/Dashboard";
import MatchDay from "./templates/MatchDay";
import Setup from "./templates/Setup";
import Standings from "./templates/Standings";

const [root] = document.getElementsByTagName("main");

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?",
  );
}

const App = () => (
  <Router>
    <Route path="/" component={Home} />
    <Route path="/about" component={About} />
    <Route path="/dashboard/:id" component={Dashboard} />
    <Route path="/match-day" component={MatchDay} />
    <Route path="/setup" component={Setup} />
    <Route path="/standings" component={Standings} />
    <Route path="*404" component={() => <p>Not found</p>} />
  </Router>
);

render(() => <App />, root);
