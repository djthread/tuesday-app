import {inject} from "aurelia-framework";
import {State} from "./state";

@inject(State)
export class Podcast {
  constructor(state) {
    this.state    = state;
    this.showId   = null;
    this.episodes = [];
  }

  activate(params, navigationInstruction) {
    var slug = this.state.current.showslug;

    this.push("episodes", {slug: slug, page: 1}, (r) => {
      this.initEpisodes(r.shows);
    }.bind(this));
  }

  initEpisodes(episodes, showId) {
    this.showId   = showId;
    this.episodes = episodes
  }

  push(message, args, happyCb) {
    this.state.push(
      this.state.chan.episode, message, args, happyCb);
  }
}
