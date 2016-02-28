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
    if (!this.channel) {
      this.channel = this.state.socket.channel("episode", {});
      this.channel.join()
        .receive("ignore", () => console.log("auth error"))
        .receive("ok",     () => console.log("join ok"))
        .receive("error",  () => console.log("Connection interruption"));
    }
    this.channel.push("shows", {}, 10000)
      .receive("ok", (r) => { this.initShows(r.shows); }.bind(this))
      .receive("error", (reasons) => console.log("Show list failed:", reasons))
      .receive("timeout", () => console.log("Networking issue..."));
  }

  initShows(shows) {
    this.shows = shows;
    var showId = shows[0].id
    this.channel.push("episodes", {show_id: showId}, 10000)
      .receive("ok", (r) => { this.initEpisodes(r.episodes, showId); }.bind(this))
      .receive("error", (reasons) => console.log("Episode list failed:", reasons))
      .receive("timeout", () => console.log("Networking issue..."));
  }

  initEpisodes(episodes, showId) {
    this.showId   = showId;
    this.episodes = episodes
  }
}
