import "dotenv/config";

import { BotClient } from "./structures/BotClient";
import { ActivityType } from "discord.js";

const client = new BotClient();

client.connect();
client.register();
