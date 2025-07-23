import { StatsModel } from "./models/stats-model";
import fs from 'fs';
import { User } from "discord.js";
import stats from '../stats/stats.json';
import { markdownTable } from 'markdown-table'
import { GET_TIMES, Globals } from "./globals";

const tableLabels = ['', 'NAME', 'SCORE', 'PERCENTAGE'];
const victoryTableLabels = ['', 'NAME', 'VICTORIES'];

export abstract class StatsHandler {
    static getTopList(): StatsModel[] {
        return stats.sort((a, b) => b.score - a.score).filter(s => s.score !== 0);
    }

    static getScoreboard(length?: number): string {
        const topList = StatsHandler.getTopList();

        const markdownRows = []
        markdownRows.push(tableLabels);

        for (let i = 0; i < (length ?? topList.length); i++) {
            const user = topList[i];
            if (!user || user.score === 0) { break; }
            const entry = StatsHandler.getStatTableEntryForUser(user.userId);
            if (entry) {
                markdownRows.push(entry);
            }
        }
        return "```" + markdownTable(markdownRows) + "```";
    }
    
    static getStatTableEntryForUser(userId: string): string[] | undefined {
        const stat = stats.find(s => s.userId === userId);
        if (!stat) { return; }

        const standing = getStanding(stat);
        const userName = stat.userName;
        const score = stat.score
        const gets = stat.gets;
        const percentage = getPercentage(gets);
        return [standing.toString(), userName, score.toString(), percentage];
    }

    static getVictoryTableEntryForUser(userId: string): string[] | undefined {
        const stat = stats.find(s => s.userId === userId);
        if (!stat || !stat.wins) { return; }

        const standing = getVictoriesStanding(stat);
        const userName = stat.userName;
        const wins = stat.wins;
        return [standing.toString(), userName, wins.toString()];
    }

    static getStatStringForUser(userId: string): string {
        const entry = StatsHandler.getStatTableEntryForUser(userId);
        if (!entry) { return 'No stats!'; }
        return "```" + markdownTable([tableLabels, entry]) + "```";
    }

    static getTotalKelloScore(): string {
        const totalKello = stats.reduce((prev, curr) => prev + curr.score, 0);
        return `Total: **${totalKello}**`;
    }

    static getVictoriesScoreboard(): string {
        const markdownRows = []
        markdownRows.push(victoryTableLabels);

        const topList = stats.filter(s => s.wins).sort((a, b) => (b.wins as number) - (a.wins as number));
        for (let i = 0; i < topList.length; i++) {
            const user = topList[i];
            if (!user || !user.wins) { continue; }
            const entry = StatsHandler.getVictoryTableEntryForUser(user.userId);
            if (entry) {
                markdownRows.push(entry);
            }
        }
        return "```" + markdownTable(markdownRows) + "```";
    }

    static increaseUserScore(user: User, timestamp: number): void {
        const userStat = stats.find(s => s.userId === user.id);
        const seconds =  new Date(timestamp).getSeconds();
        // const points = Math.round(100 - seconds / 2); // Points scale: 70 - 100
        const points = 1;

        if (userStat) {
            userStat.score += points;
            userStat.gets++;
            userStat.streak++;
        } else {
            stats.push({
                userId: user.id,
                userName: user.username,
                score: points,
                gets: 1,
                streak: 1,
            });
        }

        StatsHandler.increasePerKelloStat(user);

        save();
    }

    static increasePerKelloStat(user: User): void {
        const userStat = stats.find(s => s.userId === user.id) as StatsModel | undefined;
        if (!userStat || !Globals.kelloName) { return; }

        if (!userStat.perKello) {
            userStat.perKello = {};
        }

        if (!userStat.perKello[Globals.kelloName]) {
            userStat.perKello[Globals.kelloName] = {
                getCount: 0,
                streak: 0,
            };
        }

        userStat.perKello[Globals.kelloName].getCount++;
        userStat.perKello[Globals.kelloName].streak++;
    }

    static resetStreakForUsersExcept(userIds: string[]): void {
        (stats as StatsModel[]).forEach(stat => {
            if (!userIds.includes(stat.userId)) {
                stat.streak = 0;

                if (stat.perKello?.[Globals.kelloName]) {
                    stat.perKello[Globals.kelloName].streak = 0;
                }
            }
        });

        save();
    }

    static isUserOnCooldown(userId: string): boolean {
        const cooldownSeconds = 5;
        const cooldownUntil = Globals.getCooldowns[userId]
            ? new Date(Globals.getCooldowns[userId]).getTime()
            : undefined;
        return cooldownUntil
            ? (new Date().getTime() - cooldownUntil) / 1000 < cooldownSeconds
            : false;
    }

    static resetSeason(): void {
        const winner = this.getTopList()[0];
        winner.wins = (winner.wins ?? 0) + 1;
        (stats as StatsModel[]).forEach(s => {
            s.score = 0;
            s.streak = 0;
            s.gets = 0;
            s.perKello = undefined;
        });

        save();
    }
}

function save() {
    fs.writeFile("stats/stats.json", JSON.stringify(stats), (err) => {
        if (err) { console.error('Error saving stats: ', err); }
    });
}

function getStanding(stat: StatsModel): number {
    let usersWithHigherScore = 0;
    stats.filter(s => s.score !== 0).forEach(s => {
        if (s.score > stat.score) { usersWithHigherScore++; }
    });
    
    return usersWithHigherScore + 1;
}

function getVictoriesStanding(stat: StatsModel): number {
    let usersWithHigherScore = 0;
    stats.forEach(s => {
        if (!s.wins) { return; }
        if (s.wins > (stat.wins ?? 0)) { usersWithHigherScore++; }
    });
    
    return usersWithHigherScore + 1;
}

function getMedalEmoji(standing: number): string {
    switch (standing) {
        case 1:
            return '<:first_place:929025322660278352>';
        case 2: 
            return '<:second_place:929025582954582087>';
        case 3: 
            return '<:third_place:929025920516362330>';
        default:
            return '';
    }
}

function getPercentage(gets: number): string {
    const date = new Date();
    const fullDays = date.getDate() - 1;
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const getsToday = GET_TIMES.reduce((prev, time) => {
        return hours > time.hour || hours === time.hour && minutes >= time.minute
            ? prev + 1
            : prev;
    }, 0);
    const totalGets = fullDays * GET_TIMES.length + getsToday;
    const percentage = totalGets ? gets / totalGets * 100 : 0;
    return percentage.toFixed(0) + ' %';
}

function getMomentumEmoji(gets: number): string | undefined {
    if (gets < 10) { return undefined; }
    // if get percentage during last 10 gets is >80%, return 🔥 
    // if get percentage during last 10 gets is >10%, return 🛌
}
