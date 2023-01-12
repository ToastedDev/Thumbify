import { Command } from "@toastify/structures/SlashCommand";
import {
  ActionRowBuilder,
  ComponentType,
  EmbedBuilder,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";

import Parser from "rss-parser";
const parser = new Parser();

export default new Command({
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play the Guess The Thumbnail game!")
    .addStringOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel to guess the thumbnails of.")
        .addChoices(
          { name: "MrBeast", value: "UCX6OQ3DkcsbYNE6H8uQQuVA" },
          { name: "PewDiePie", value: "UC-lHJZR3Gqxm24_Vd_AJ5Yw" },
          { name: "JackSucksAtLife", value: "UCewMTclBJZPaNEfbf-qYMGA" },
          { name: "JackSucksAtStuff", value: "UCxLIJccyaRQDeyu6RzUsPuw" },
          { name: "Tom Scott", value: "UCBa659QWEk1AI4Tg--mrJ2A" }
        )
        .setRequired(true)
    ),
  run: async ({ interaction }) => {
    const { items } = await parser.parseURL(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${interaction.options.getString(
        "channel"
      )}`
    );
    const videos = items.sort(() => Math.random() - Math.random()).slice(0, 5);
    const video = videos[Math.floor(Math.random() * videos.length)];

    const res = await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle("What's the title of this video?")
          .setImage(
            `https://img.youtube.com/vi/${video.id.slice(9)}/mqdefault.jpg`
          )
          .setColor("Blurple"),
      ],
      components: [
        new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
          new StringSelectMenuBuilder()
            .setCustomId("videos-menu")
            .setPlaceholder("Select an option...")
            .addOptions(
              videos.map((video) =>
                new StringSelectMenuOptionBuilder()
                  .setValue(video.id)
                  .setLabel(video.title)
              )
            )
        ),
      ],
      fetchReply: true,
    });

    const collector = res.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 30 * 1000,
    });
    collector.on("collect", (i) => {
      if (i.user.id !== interaction.user.id)
        return void i.reply({
          content: "You can't use this menu.",
          ephemeral: true,
        });

      const selected = i.values[0];
      if (selected !== video.id) {
        collector.stop("wrong");
        i.update({
          embeds: [
            new EmbedBuilder()
              .setTitle("You chose the wrong answer!")
              .setDescription(
                `It was "[${video.title}](https://youtu.be/${video.id.slice(
                  9
                )})".`
              )
              .setColor("Red"),
          ],
          components: [],
        });
        return;
      } else {
        collector.stop("right");
        i.update({
          embeds: [
            new EmbedBuilder()
              .setTitle("You chose the right answer!")
              .setDescription(
                `It was "[${video.title}](https://youtu.be/${video.id.slice(
                  9
                )})".`
              )
              .setColor("Green"),
          ],
          components: [],
        });
        return;
      }
    });
    collector.on("end", (_, reason) => {
      switch (reason) {
        case "time":
          {
            interaction.editReply({
              embeds: [
                new EmbedBuilder()
                  .setTitle("You ran out of time!")
                  .setDescription(
                    `It was "[${video.title}](https://youtu.be/${video.id.slice(
                      9
                    )})".`
                  )
                  .setColor("Red"),
              ],
              components: [],
            });
          }
          break;
        default:
          break;
      }
    });
  },
});
