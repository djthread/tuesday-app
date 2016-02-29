import {inject} from "aurelia-framework";
import {State} from "./state";

@inject(State)
export class Shows {

  constructor(state) {
    this.state = state;
  }

  configureRouter(config, router) {
    this.router = router;

    var gotDefault = false;

    config.map(this.state.shows.map((show) => {
      return {
        route:    (gotDefault ? [] : [""]).concat([show.slug]),
        name:     show.slug,
        title:    show.name,
        moduleId: "./show",
        nav:      true
      };
      gotDefault = true;
    }));
  }
}
