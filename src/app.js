import {State} from "./state";
import videojs from "video.js";
import {inject} from "aurelia-framework";

@inject(State)
export class App {

  ttTabs = [];
  video  = null;  // dom element

  configureRouter(config, router) {
    // config.title = 'Techno Tuesday';
    // config.map([
    //   { route:    ['', 'chat'],
    //     name:     'chat',
    //     moduleId: './chat',
    //     nav:      true
    //   }
    // ]);
    // this.router = router;
  }

  constructor(state) {
    this.state = state;
    this.ttTabs = [
      {id: "section-chat",     label: "Chat", selected: true},
      {id: "section-schedule", label: "Schedule"},
      {id: "section-podcast",  label: "Podcast"},
      {id: "section-info",     label: "Info"}
    ];
  }

  attached() {
    videojs.options.flash.swf = "/jspm_packages/npm/video.js@5.8.0/dist/video-js.swf"
    videojs(document.getElementById('thevideo'), {"fluid": true, "aspectRatio": "16:9"});
  }
}
