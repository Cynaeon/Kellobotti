import { CommandInteraction, User } from "discord.js";
import { Discord, Slash, SlashOption } from "discordx";
import { getDaysUntilSeasonReset } from "./client";
import { GET_TIMES } from "./globals";
import { StatsHandler } from "./stats-handler";
import bonusTime from './bonus_time.json';
import { addLeadingZero } from "./util";

@Discord()
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class BotCommands {
    /* @Slash("getkello", { description: 'Get kello!' })
    async getkello(
        @SlashOption("message", {
            description: "Write an optional message",
            type: 'STRING',
            required: false
        }) message: string | undefined,
        interaction: CommandInteraction
    ): Promise<void> {
        await interaction.deferReply({ ephemeral: true });

        if (Globals.kelloOn) {
            if (Globals.usersWhoGot.includes(interaction.user.id)) {
                void interaction.editReply({ content: 'Already got.' });
            } else if (StatsHandler.isUserOnCooldown(interaction.user.id)) {
                void interaction.editReply({ content: 'On cooldown.' });
            } else {
                StatsHandler.increaseUserScore(interaction.user, interaction.createdTimestamp);
                Globals.usersWhoGot.push(interaction.user.id);
                Globals.commandGets.push({ userName: interaction.user.username, message });
                void interaction.editReply({ content: 'Get!' });
            }
        } else {
            Globals.getCooldowns[interaction.user.id] = interaction.createdAt;
            void interaction.editReply({ content: 'It\'s not kello' });
        }
    } */

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

    @Slash("kelloseason", { description: 'Display days until season reset.' })
    kelloseason(interaction: CommandInteraction): void {
        const days = getDaysUntilSeasonReset();
        void interaction.reply(`Season reset in ${days} days.`);
    }

    @Slash("kellovictories", { description: 'List season victories.' })
    async kellovictories(interaction: CommandInteraction): Promise<void> {
        await interaction.deferReply();
        void interaction.editReply(StatsHandler.getVictoriesScoreboard());
    }

    @Slash("kellorules", { description: 'Current rules of kello.' })
    kellorules(interaction: CommandInteraction): void {
        const getTimes = GET_TIMES.map(time => {
            return `**${time.name}** (${addLeadingZero(time.hour)}:${addLeadingZero(time.minute)})`;
        }).join(', ');
        void interaction.reply(`Current get times: ${getTimes}`);
    }
}
