import {inject} from "aurelia-framework";
import {State} from "./state";

@inject(State)
export class Podcast {
  constructor(state) {
    this.state    = state;
    this.showId   = null;
    this.channel  = null;
    this.episodes = [];
    this.shows    = [];
  }

  attached() {
    this.channel = this.state.join(
      "episode", {}, () => console.log("join ok")
    );
    this.push("shows", {}, (r) => {
      this.initShows(r.shows);
    }.bind(this));
  }

  initShows(shows) {
    var showId = shows[0] ? shows[0].id : null

    this.shows = shows;

    if (!showId) return;

    push("episodes", {show_id: showId}, (r) => {
      this.initEpisodes(r.episodes, showId);
    }.bind(this));
  }

  initEpisodes(episodes, showId) {
    this.showId   = showId;
    this.episodes = episodes
  }

  push(message, args, happyCb) {
    this.state.push(this.channel, message, args, happyCb);
  }
}
