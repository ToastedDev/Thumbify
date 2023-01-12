import {
  ApplicationCommandDataResolvable,
  Client,
  ClientOptions,
  Collection,
  GatewayIntentBits,
} from "discord.js";
import fs from "fs";
import path from "path";
import { guildId } from "../config";
import { CommandOptions } from "@toastify/structures/SlashCommand";

export class BotClient<Ready extends boolean = boolean> extends Client<Ready> {
  commands = new Collection<string, CommandOptions>();

  constructor(options?: Omit<ClientOptions, "intents">) {
    super({
      intents: [GatewayIntentBits.Guilds],
      ...options,
    });
  }

  connect() {
    this.login(process.env.TOKEN);
  }

  private filterFiles(file: string) {
    return file.endsWith("ts") || file.endsWith("js");
  }

  private async importFile(path: string) {
    try {
      return await import(path).then((x) => x.default);
    } catch {
      return null;
    }
  }

  register() {
    // Slash commands
    const commands: ApplicationCommandDataResolvable[] = [];
    fs.readdirSync(path.join(__dirname, "../commands")).forEach(async (dir) => {
      const commandFiles = fs
        .readdirSync(path.join(__dirname, `../commands/${dir}`))
        .filter((file) => this.filterFiles(file));

      for (const file of commandFiles) {
        const command = await this.importFile(`../commands/${dir}/${file}`);
        if (!command?.data || !command?.run) continue;

        this.commands.set(command.data.toJSON().name, command);
        commands.push(command.data.toJSON());
      }
    });

    this.on("ready", async () => {
      if (guildId) {
        const guild = this.guilds.cache.get(guildId);
        if (!guild)
          throw new SyntaxError(`No guild exists with ID ${guildId}.`);

        await guild.commands.set(commands);
        console.log(`Registered commands in ${guild.name}.`);
      } else {
        await this.application?.commands.set(commands);
        console.log("Registered commands globally.");
      }
    });

    // Events
    fs.readdirSync(path.join(__dirname, "../events"))
      .filter((file) => this.filterFiles(file))
      .forEach(async (file) => {
        const event = await this.importFile(`../events/${file}`);
        if (!event?.name || !event?.run) return;

        if (event.once) this.once(event.name, event.run.bind(null, this));
        else this.on(event.name, event.run.bind(null, this));
      });
  }
}
