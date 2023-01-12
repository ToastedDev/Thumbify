import { ChatInputCommandInteraction, GuildMember } from "discord.js";
import { Event } from "../structures/Event";

interface Interaction extends ChatInputCommandInteraction {
  member: GuildMember;
}

export default new Event({
  name: "interactionCreate",
  run: async (client, interaction) => {
    if (!interaction.isChatInputCommand()) return;
    if (!interaction.inGuild())
      return (interaction as ChatInputCommandInteraction).reply({
        content: "Commands can only be ran in a guild.",
      });

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    interaction.member = interaction.guild.members.cache.get(
      interaction.user.id
    );

    try {
      await command.run({
        client,
        interaction: interaction as Interaction,
      });
    } catch (err) {
      console.error(err);
      if (interaction.replied)
        interaction.followUp({
          content: "An error occured.",
          ephemeral: true,
        });
      else
        interaction.reply({
          content: "An error occured.",
          ephemeral: true,
        });
    }
  },
});
