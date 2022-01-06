import { CommandInteraction } from "discord.js";
import { Discord, Slash } from "discordx";
import { Globals } from "./globals";
import { StatsHandler } from "./stats-handler";

@Discord()
class BotCommands {
    @Slash("getkello", { description: 'Get kello!' })
    async getkello(interaction: CommandInteraction): Promise<void> {
        if (Globals.kelloOn) {
            if (Globals.postedToday.includes(interaction.user.id)) {
                await interaction.reply({ content: 'Already got.', ephemeral: true });
            } else {
                StatsHandler.increaseUserScore(interaction.user);
                await interaction.reply({ content: 'Get!', ephemeral: true });
            }
        } else {
            await interaction.reply({ content: 'Kello is not.', ephemeral: true });
        }
    }

    @Slash("topkello", { description: 'List the most kello people.' })
    async topkello(interaction: CommandInteraction): Promise<void> {
        const topList = StatsHandler.getTopList();
        let statsString = '';
        for (let i = 0; i < topList.length; i++) {
            const user = topList[i];
            statsString += StatsHandler.getStatStringForUser(user.userId);
            if (i >= 4) { break; }
        }
        await interaction.reply(statsString || 'No stats!');
    }

    @Slash("mykello", { description: 'Display your stats.' })
    async mykello(interaction: CommandInteraction): Promise<void> {
        await interaction.reply(StatsHandler.getStatStringForUser(interaction.user.id));
    }

    @Slash("userkello", { description: 'DOES NOT WORK YET.' })
    async userkello(interaction: CommandInteraction): Promise<void> {
        await interaction.reply( { content: 'Command does not yet work.', ephemeral: true });
    }

    @Slash("totalkello", { description: 'Display total kello.' })
    async totalkello(interaction: CommandInteraction): Promise<void> {
        await interaction.reply(StatsHandler.getTotalKelloScore());
    }
}
