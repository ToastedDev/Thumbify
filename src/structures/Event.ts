import { Event as ToastifyEvent } from "@toastify/structures";
import { ClientEvents } from "discord.js";
import { BotClient } from "./BotClient";

type EventOptions<Key extends keyof ClientEvents> = {
  name: Key;
  once?: boolean;
  run: (client: BotClient, ...args: ClientEvents[Key]) => any;
};

export class Event<Key extends keyof ClientEvents> extends ToastifyEvent<Key> {
  constructor(options: EventOptions<Key>) {
    super(options);
  }
}
