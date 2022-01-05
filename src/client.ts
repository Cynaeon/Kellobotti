import "reflect-metadata";
import { Client } from "discordx";
import { Intents, Interaction, Message, TextChannel } from "discord.js";
import { dirname, importx } from "@discordx/importer";
import { CronJob } from "cron";
import { StatsHandler } from "./stats-handler";
import config from '../config.json'; 

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
});

let kelloOn = false;
let postedToday: string[] = [];

client.on("ready", () => {
    console.log("Bot ready!");
    client.initApplicationCommands();

    new CronJob('00 37 13 * * *', () => {
        kelloOn = true;
    }, null, true, 'Europe/Helsinki');

    new CronJob('00 38 13 * * *', () => {
        kelloOn = false;
        const topKelloUser = StatsHandler.getTopList()[0];

        if (postedToday.length > 0 && !postedToday.includes(topKelloUser.userId)) {
            // Mock the player in first place since they missed the kello
            const channel = client.channels.cache.get(config.channelId) as TextChannel | undefined;
            const emoji = client.emojis.cache.get('645997733894684692'); // Nauris
            channel?.send(`${topKelloUser.userName} ${emoji}`);
        }

        StatsHandler.resetStreakForUsersExcept(postedToday);
        postedToday = []; 
    }, null, true, 'Europe/Helsinki');
});

client.on("interactionCreate", (interaction: Interaction) => {
    client.executeInteraction(interaction);
});

client.on('messageCreate', (message: Message) => {
    const userId = message.author.id;
    if (
        !kelloOn
        || message.channelId !== config.channelId
        || postedToday.includes(userId)
    ) { return; }

    StatsHandler.increaseUserScore(message.author);
    setTimeout(() => thumbsUp(message), 1000);
});

async function run() {
    await importx(dirname(import.meta.url) + "/commands.{ts,js}");
    client.login(config.token);
}

run();

function thumbsUp(message: Message) {
    const emojiId = message.author.id === StatsHandler.getTopList()[0].userId
        ? '890243525361405953' // Hymy hyytyy
        : '406099801814466560'; // Paavopeukku
    message.react(emojiId).catch(() => {
        message.react('👌');
    });
}