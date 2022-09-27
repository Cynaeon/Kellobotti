import "reflect-metadata";
import { Client } from "discordx";
import { Intents, Interaction, Message, TextChannel } from "discord.js";
import { dirname, importx } from "@discordx/importer";
import { CronJob } from "cron";
import { StatsHandler } from "./stats-handler";
import config from '../config.json'; 
import { Globals } from "./globals";
import moment from "moment";
import { StatsModel } from "./models/stats-model";

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
    botGuilds: [config.guildId],
});

const getTimes: { hour: number, minute: number }[] = [
    { hour: 0, minute: 7},
    { hour: 6, minute: 9 },
    { hour: 11, minute: 11 },
    { hour: 13, minute: 37 },
    { hour: 16, minute: 20 },
    { hour: 21, minute: 12 },
];

let seasonResetJob: CronJob;

client.on("ready", () => {
    console.log("Bot ready!");
    void client.initApplicationCommands();

    // Create kello get jobs
    getTimes.forEach(time => {
        new CronJob(`00 ${time.minute.toString()} ${time.hour.toString()} * * *`, () => {
            Globals.kelloOn = true;
        });

        // End gets after the minute changes
        new CronJob(`00 ${(time.minute + 1).toString()} ${time.hour.toString()} * * *`, () => {
            Globals.kelloOn = false;
            StatsHandler.resetStreakForUsersExcept(Globals.usersWhoGot);
            Globals.usersWhoGot = []; 
        });
    })

    // Season reset on the first day of the month
    seasonResetJob = new CronJob('0 0 1 * *', () => {
        StatsHandler.resetSeason();
    }, null, true, 'Europe/Helsinki');
});

client.on("interactionCreate", (interaction: Interaction) => {
    client.executeInteraction(interaction);
});

client.on('messageCreate', (message: Message) => {
    if (message.channelId !== config.channelId) { return; }

    const userId = message.author.id;

    if (
        !Globals.kelloOn
        || Globals.usersWhoGot.includes(userId)
        || StatsHandler.isUserOnCooldown(userId)
    ) {
        Globals.getCooldowns[userId] = message.createdAt;
        return;
    }

    thumbsUp(message);
    StatsHandler.increaseUserScore(message.author, message.createdTimestamp);
    Globals.usersWhoGot.push(message.author.id);
});

async function run() {
    await importx(dirname(import.meta.url) + "/commands.{ts,js}");
    void client.login(config.token);
}

void run();

function thumbsUp(message: Message) {
    const sharedFirstPlace = StatsHandler.getTopList().length >= 2
        && StatsHandler.getTopList()[0].score === StatsHandler.getTopList()[1].score;

    const emojiId = !sharedFirstPlace && message.author.id === StatsHandler.getTopList()[0].userId
        ? '890243525361405953' // Hymy hyytyy
        : '406099801814466560'; // Paavopeukku
    setTimeout(() => {
        message.react(emojiId).catch(() => void message.react('👌'));
    }, 1000);
}

function listCommandGets() {
    const channel = client.channels.cache.get(config.channelId) as TextChannel | undefined;

    if (Globals.commandGets.length) {
        let commandMessageStr = 'Command gets:\n';
        Globals.commandGets.forEach(get => {
            commandMessageStr += get.userName;
            if (get.message) {
                commandMessageStr += `: "${get.message}"`
            }
            commandMessageStr += '\n';
        });
        void channel?.send(commandMessageStr);
        Globals.commandGets = [];
    }
}

export function getDaysUntilSeasonReset(): number {
    return seasonResetJob.nextDate().diff(moment(), 'days');
}