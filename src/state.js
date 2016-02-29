import {Socket, LongPoller} from "phoenix.js";
import {EventAggregator} from "aurelia-event-aggregator";
import {inject} from "aurelia-framework";
import {Configure} from "aurelia-configuration";

@inject(Configure, EventAggregator)
export class State {
  constructor(config, eventAggregator) {
    this.ea        = eventAggregator;
    this.socketUri = config.get("socket.endpoint");
    this.messages  = [];
    this.lastStamp = null;
    this.infoline  = "";
    this.shows     = [];
    this.current   = {
      showslug: null
    };

    this.socket  = null;
    this.chan    = {
      lobby:   null,
      stat:    null,
      episode: null
    };
  }

  startup(cb) {
    this.startSocket((socket, lobby, stat, episode) => {
      this.socket       = socket;
      this.chan.lobby   = lobby;
      this.chan.stat    = stat;
      this.chan.episode = episode;
      cb();
    }.bind(this));
  }

  join(channel, args, happyCb) {
    var channel = this.socket.channel(channel, args);
    channel.join()
      .receive("ignore", () => console.log(channel + ": auth error"))
      .receive("ok",     happyCb)
      .receive("error",  () => console.log(channel + ": Connection interruption"));
    return channel;
  }

  push(channel, message, args, happyCb) {
    channel.push(message, args, 10000)
      .receive("ok", happyCb)
      .receive("error", (reasons) => console.log("Show list failed:", reasons))
      .receive("timeout", () => console.log("Networking issue..."));
  }

  pushEvent(ev, msg) {
    msg = this.setupStamps(msg);
    msg.ev = ev;
    this.messages.push(msg);
    this.ea.publish("message", msg);
  }

  startSocket(cb) {
    var socket = new Socket(this.socketUri, {
      logger: ((kind, msg, data) => { console.log(`${kind}: ${msg}`, data) })
    });

    this.socket = socket;

    socket.connect();

    socket.onOpen(ev => {
      console.log("OPEN", ev)
      this.messages = [];
      this.stat     = {};
    }.bind(this));

    socket.onError(ev => console.log("ERROR", ev));
    socket.onClose(e => console.log("CLOSE", e));

    var lobby, stat, episode;

    // This could be better
    this.setupChat(socket, (_lobby) => {
      lobby = _lobby;
      this.setupStat(socket, (_stat) => {
        stat = _stat;
        this.setupEpisode(socket, (_episode) => {
          episode = _episode;
          cb(socket, lobby, stat, episode);
        });
      });
    });
  }

  setupChat(socket, cb) {
    var lobby = socket.channel("rooms:lobby", {})

    lobby.join().receive("ignore", () => console.log("auth error"))
                .receive("ok",     () => console.log("join ok"))
                .receive("error",  () => console.log("Connection interruption"));

    lobby.onError(e => console.log("something went wrong", e));
    lobby.onClose(e => console.log("channel closed", e));

    lobby.on("new:msg", msg => {
      this.pushEvent("new:msg", msg);
    }.bind(this));

    lobby.on("user:entered", msg => {
      this.pushEvent("user:entered", msg);
    }.bind(this));

    cb(lobby);
  }

  setupStat(socket, cb) {
    var stat = socket.channel("rooms:stat", {})

    stat.join().receive("ignore", () => console.log("auth error"))
               .receive("ok",     () => console.log("join ok"))
               .receive("error",  () => console.log("Connection interruption"));

    stat.onError(e => console.log("something went wrong", e));
    stat.onClose(e => console.log("channel closed", e));

    stat.on("update", stat => {
      this.infoline = stat.viewers + " viewer" + (stat.viewers == 1 ? "" : "s")
                    + " / " + stat.online + " online";
    }.bind(this));

    cb(stat);
  }

  setupEpisode(socket, cb) {
    var episode = this.join(
      "episode", {}, () => console.log("join ok")
    );
    this.push(episode, "shows", {}, (r) => {
      this.shows = r.shows;
      cb(episode);
    }.bind(this));
  }

  setupStamps(msg) {
    let username  = msg.user || "anonymous"
    let body      = msg.body
    let date      = new Date(msg.stamp)

    let ampm, hours;

    if (date.getHours() >= 12) {
      hours = date.getHours() - 12;
      ampm  = 'p';
    } else {
      hours = date.getHours();
      ampm  = 'a';
    }

    hours = hours || '12';

    let minutes   = (date.getMinutes() < 10 ? "0" : "")+date.getMinutes();
    let stamp     = hours+":"+minutes+ampm;
    let fullStamp = (date.getMonth()+1)+"/"+date.getDate()+" "+stamp;

    if (this.lastStamp === fullStamp) {
      stamp = fullStamp = null;
    }

    this.lastStamp = fullStamp;

    msg.stamp      = stamp;
    msg.fullStamp  = fullStamp;

    return msg;
  }
}
