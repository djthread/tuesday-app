import {customElement, inject, bindable} from "aurelia-framework";
import videojs from "video.js";

@customElement("player")
@inject(Element)
export class Player {
  @bindable episode;

  constructor(element) {
    this.element = element;
    console.log('ELEMENT', this.element);
  }

  attached() {
    videojs(this.player, {"fluid": true, "components": {"posterImage": false, "BigPlayButton": false, "PlayToggle": false}});
  }
}
