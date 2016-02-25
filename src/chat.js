import {State} from "./state";
import {inject} from "aurelia-framework";
import {EventAggregator} from "aurelia-event-aggregator";
import {Cookie} from "aurelia-cookie";

@inject(State, EventAggregator)
export class Chat {
  constructor(state, eventAggregator) {
    this.state       = state;
    this.lots        = 9999999;
    this.scrollTop   = 0;
    this.username    = Cookie.get("username");
    this.message     = "";
    this.nameTimeout = null;

    this.scrollMessagesToBottom();

    eventAggregator.subscribe("message", message => {
      this.scrollMessagesToBottom();
    }.bind(this));
  }

  scrollMessagesToBottom() {
    setTimeout(() => {
      this.scrollTop = this.lots;
    }.bind(this), 50);
  }

  shout() {
    this.message = this.message.trim();
    if (!this.message) return;
    this.state.lobby.push("new:msg", {user: this.username, body: this.message});
    console.log('------>', this.username, this.message);
    this.message = '';
    Cookie.set("username", $event.target.value);
  }
}
