import "reflect-metadata";
import { Client } from "discordx";
import { Intents, Interaction, Message, TextChannel } from "discord.js";
import { dirname, importx } from "@discordx/importer";
import { CronJob, CronTime } from "cron";
import { StatsHandler } from "./stats-handler";
import config from '../config_dev.json'; 
import { GET_TIMES, Globals, KelloTime } from "./globals";
import moment from "moment";
import { isValidRandomKello } from "./util";

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_MESSAGE_REACTIONS],
    botGuilds: [config.guildId],
});

let seasonResetJob: CronJob;
let randomKelloTimeJob: CronJob;
let randomKelloTimeEndJob: CronJob;
let dailyBonusKello: KelloTime = { name: 'Bonus', hour: 0, minute: 0 };

client.on("ready", () => {
    console.log("Bot ready!");
    void client.initApplicationCommands();

    // Create kello get jobs
    GET_TIMES.forEach(time => {
        new CronJob(`00 ${time.minute} ${time.hour} * * *`, () => {
            kelloOn()
        }, null, true, 'Europe/Helsinki');

        // End gets after the minute changes
        new CronJob(`00 ${time.minute + 1} ${time.hour} * * *`, () => {
            kelloOff()
        }, null, true, 'Europe/Helsinki');
    });

    randomKelloTimeJob = new CronJob(`00 00 00 * * *`, () => {
        kelloOn();
    }, null, true, 'Europe/Helsinki');

    randomKelloTimeEndJob = new CronJob(`00 00 00 * * *`, () => {
        kelloOff();
    }, null, true, 'Europe/Helsinki');

    initDailyRandomKello();

    new CronJob('00 59 23 * * * ', () => {
        initDailyRandomKello();
    });

    randomKelloTimeJob.stop();

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

function kelloOn() {
    Globals.kelloOn = true;
}

function kelloOff() {
    Globals.kelloOn = false;
    StatsHandler.resetStreakForUsersExcept(Globals.usersWhoGot);
    Globals.usersWhoGot = []; 
}

/** Generate new random get time. */
function initDailyRandomKello() {
    do {
        dailyBonusKello = { hour: getRandomInt(0, 23), minute: getRandomInt(0, 59), name: 'Bonus' };
    } while (!isValidRandomKello(dailyBonusKello));

    const startTime = new CronTime(`00 ${dailyBonusKello.minute} ${dailyBonusKello.hour} * * *`);
    const endTime = new CronTime(`00 ${dailyBonusKello.minute + 1} ${dailyBonusKello.hour} * * *`);
    randomKelloTimeJob.setTime(startTime);
    randomKelloTimeEndJob.setTime(endTime)
    console.log('Daily bonus kello set to', dailyBonusKello);
}

function thumbsUp(message: Message) {
    const sharedFirstPlace = StatsHandler.getTopList().length >= 2
        && StatsHandler.getTopList()[0].score === StatsHandler.getTopList()[1].score;

    const emojiId = !sharedFirstPlace && message.author.id === StatsHandler.getTopList()[0].userId
        ? '890243525361405953' // Hymy hyytyy
        : '406099801814466560'; // Paavopeukku

    // React after setTimeout because sometimes the reaction wasn't showing for the message author.
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

function getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getDaysUntilSeasonReset(): number {
    return seasonResetJob.nextDate().diff(moment(), 'days');
}