import {Socket, LongPoller} from "phoenix.js";
import {EventAggregator} from "aurelia-event-aggregator";
import {inject} from "aurelia-framework";

@inject(EventAggregator)
export class State {
  constructor(eventAggregator) {
    this.socketUri = "//localhost:4000/socket";
    this.messages  = [];
    this.lastStamp = null;
    this.infoline  = "";
    this.ea        = eventAggregator;

    [this.socket, this.lobby, this.stat] = this.startSocket();
  }

  pushEvent(ev, msg) {
    msg = this.setupStamps(msg);
    console.log("-->", ev, msg);
    msg.ev = ev;
    this.messages.push(msg);
    this.ea.publish("message", msg);
  }

  startSocket() {
    var socket = new Socket(this.socketUri, {
      logger: ((kind, msg, data) => { console.log(`${kind}: ${msg}`, data) })
    });

    socket.connect();

    socket.onOpen(ev => {
        console.log("OPEN", ev)
        this.messages = [];
        this.stat     = {};
    }.bind(this));

    socket.onError(ev => console.log("ERROR", ev));
    socket.onClose(e => console.log("CLOSE", e));

    var lobby = this.setupChat(socket),
        stat  = this.setupStat(socket);

    return [socket, lobby, stat];
  }

  setupChat(socket) {
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

    return lobby;
  }

  setupStat(socket) {
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
