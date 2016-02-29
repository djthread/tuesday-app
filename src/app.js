import {State} from "./state";
import videojs from "video.js";
import {inject} from "aurelia-framework";

@inject(State)
export class App {

  configureRouter(config, router) {
    this.router = router;

    config.map([
      { route:    ["", "chat"], title: "Chat",     name: "chat",
        moduleId: "./chat",     nav:   true
      },
      { route:    ["schedule"], title: "Schedule", name: "schedule",
        moduleId: "./schedule", nav:   true
      },
      { route:    ["shows"],    title: "Shows",    name: "shows",
        moduleId: "./shows",    nav:   true
      },
      { route:    ["about"],    title: "About",    name: "about",
        moduleId: "./about",    nav:   true
      },
    ]);
  }

  constructor(state) {
    this.state = state;
  }

  activate() {
    return new Promise((accept, reject) => {
      this.state.startup(() => {
        accept()
      });
    }.bind(this));
  }

  attached() {
    videojs.options.flash.swf =
      "/jspm_packages/npm/video.js@5.8.0/dist/video-js.swf"
    videojs(document.getElementById('thevideo'),
      {"fluid": true, "aspectRatio": "16:9"});
  }
}
