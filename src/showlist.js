import {inject} from "aurelia-framework";
import {State} from "./state";

@inject(State)
export class Shows {

  constructor(state) {
    this.state = state;
  }
}
