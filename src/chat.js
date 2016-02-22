import {State} from "./state";
import {inject} from "aurelia-framework";
import {EventAggregator} from 'aurelia-event-aggregator';

@inject(State, EventAggregator)
export class Chat {
  state;
  lots      = 999999;
  scrollTop = 0;
  username  = "";    // form field value
  message   = "";    // form field value

  constructor(state, eventAggregator) {
    this.state = state;

    this.scrollMessagesToBottom();

    eventAggregator.subscribe("message", message => {
      this.scrollMessagesToBottom();
    }.bind(this));
  }

  attached() {
    // setTimeout(function() {
    //   this.scrollMessagesToBottom();
    // }.bind(this), 10000);  // stupid hax
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
  }
}
