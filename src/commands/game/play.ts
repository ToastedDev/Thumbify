import { Command } from "@toastify/structures/SlashCommand";
import {
  ActionRowBuilder,
  APIApplicationCommandOptionChoice,
  ComponentType,
  EmbedBuilder,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from "discord.js";

import Parser from "rss-parser";
const parser = new Parser();

const options: APIApplicationCommandOptionChoice<string>[] = [
  { name: "MrBeast", value: "UCX6OQ3DkcsbYNE6H8uQQuVA" },
  { name: "PewDiePie", value: "UC-lHJZR3Gqxm24_Vd_AJ5Yw" },
  { name: "JackSucksAtLife", value: "UCewMTclBJZPaNEfbf-qYMGA" },
  { name: "JackSucksAtStuff", value: "UCxLIJccyaRQDeyu6RzUsPuw" },
  { name: "JackSucksAtGeography", value: "UCd15dSPPT-EhTXekA7_UNAQ" },
  { name: "Jack Massey Welsh", value: "UCyktGLVQchOpvKgL7GShDWA" },
  { name: "Tom Scott", value: "UCBa659QWEk1AI4Tg--mrJ2A" },
  { name: "Timeworks", value: "UCv5mo0iXze8aKFjvdp51Fjg" },
  { name: "Dhar Mann", value: "UC_hK9fOxyy_TM8FJGXIyG8Q" },
];

export default new Command({
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play the Guess The Thumbnail game!")
    .addStringOption((option) =>
      option
        .setName("channel")
        .setDescription("The channel to guess the thumbnails of.")
        .addChoices(...options)
        .setRequired(false)
    ),
  run: async ({ interaction }) => {
    const channel =
      interaction.options.getString("channel") ||
      options[Math.floor(Math.random() * options.length)].value;

    const { items, title } = await parser.parseURL(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${channel}`
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
          .setColor("Blurple")
          .setFooter({
            text: title,
            iconURL: `https://www.banner.yt/${channel}/avatar`,
          }),
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
              .setColor("Red")
              .setFooter({
                text: title,
                iconURL: `https://www.banner.yt/${channel}/avatar`,
              }),
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
              .setColor("Green")
              .setFooter({
                text: title,
                iconURL: `https://www.banner.yt/${channel}/avatar`,
              }),
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
                  .setColor("Red")
                  .setFooter({
                    text: title,
                    iconURL: `https://www.banner.yt/${channel}/avatar`,
                  }),
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
