import {inject} from "aurelia-framework";
import {State} from "./state";

@inject(State)
export class Show {

  constructor(state) {
    this.state = state;
  }

  configureRouter(config, router) {
    this.router = router;

    config.map([
      {
        route:    ["", "podcast"],
        name:     "podcast",
        title:    "Podcast",
        moduleId: "./podcast",
        nav:      true
      },
      {
        route:    ["info"],
        name:     "info",
        title:    "Info",
        moduleId: "./info",
        nav:      true
      }
    ]);
  }

  activate(params, navigationInstruction) {
    this.state.current.showslug = navigationInstruction.name;
  }
}
