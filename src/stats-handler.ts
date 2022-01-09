import { StatsModel } from "./models/stats-model";
import fs from 'fs';
import { User } from "discord.js";
import stats from '../stats/stats.json';

export abstract class StatsHandler {
    static getTopList(): StatsModel[] {
        return stats.sort((a, b) => b.score - a.score);
    }
    
    static getStatStringForUser(userId: string): string {
        const stat = stats.find(s => s.userId === userId);
        if (!stat) { return 'No stats!' }

        const standing = getStanding(stat);
        const userName = stat.userName;
        const score = stat.score
        const streak = stat.streak;
        const medal = getMedalEmoji(standing);
        let statsString = `${medal} ${standing}. ${userName}: **${score}**`;
        if (streak) {
            statsString += ` (${streak} streak)`;
        }
         statsString += '\n';
        return statsString;
    }

    static getTotalKelloScore(): string {
        const totalKello = stats.reduce((prev, curr) => prev + curr.score, 0);
        return `Total: **${totalKello}**`;
    }

    static increaseUserScore(user: User): void {
        const userStat = stats.find(s => s.userId === user.id);
        
        if (userStat) {
            userStat.score++;
            userStat.streak++;
        } else {
            stats.push({
                userId: user.id,
                userName: user.username,
                score: 1,
                streak: 1,
            });
        }

        save();
    }

    static resetStreakForUsersExcept(userIds: string[]): void {
        stats.forEach(stat => {
            if (!userIds.includes(stat.userId)) {
                stat.streak = 0;
            }
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
    stats.forEach(s => {
        if (s.score > stat.score) { usersWithHigherScore++; }
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
