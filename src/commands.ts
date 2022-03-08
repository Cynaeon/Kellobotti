import { CommandInteraction, User } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { Globals } from "./globals";
import { StatsHandler } from "./stats-handler";

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class BotCommands {
    @Slash("getkello", { description: 'Get kello!' })
    getkello(
        @SlashOption("message", {
            description: "Write an optional message",
            type: 'STRING',
            required: false
        }) message: string | undefined,
        interaction: CommandInteraction
    ): void {
        if (Globals.kelloOn) {
            if (Globals.postedToday.includes(interaction.user.id)) {
                void interaction.reply({ content: 'Already got.', ephemeral: true });
            } else if (StatsHandler.isUserOnCooldown(interaction.user.id)) {
                void interaction.reply({ content: 'On cooldown.', ephemeral: true });
            } else {
                StatsHandler.increaseUserScore(interaction.user, interaction.createdTimestamp);
                Globals.postedToday.push(interaction.user.id);
                Globals.commandGets.push({ userName: interaction.user.username, message });
                void interaction.reply({ content: 'Get!', ephemeral: true });
            }
        } else {
            Globals.getCooldowns[interaction.user.id] = interaction.createdAt;
            void interaction.reply({ content: 'It\'s not kello', ephemeral: true });
        }
    }

    @Slash("topkello", { description: 'List five of the most kello people.' })
    topkello(interaction: CommandInteraction): void {
        void interaction.reply(StatsHandler.getScoreboard(5) || 'No stats!');
    }

    @Slash("fulltopkello", { description: 'List complete scoreboard.' })
    fulltopkello(interaction: CommandInteraction): void {
        void interaction.reply({ content: StatsHandler.getScoreboard() || 'No stats!', ephemeral: true });
    }

    @Slash("mykello", { description: 'Display your stats.' })
    mykello(interaction: CommandInteraction): void {
        void interaction.reply(StatsHandler.getStatStringForUser(interaction.user.id));
    }

    @Slash("userkello", { description: 'Display user\'s stats.' })
    userkello(
        @SlashOption("user", { type: "USER" }) user: User,
        interaction: CommandInteraction
    ): void {
        void interaction.reply(StatsHandler.getStatStringForUser(user.id));
    }

    @Slash("totalkello", { description: 'Display total kello.' })
    totalkello(interaction: CommandInteraction): void {
        void interaction.reply(StatsHandler.getTotalKelloScore());
    }
}
