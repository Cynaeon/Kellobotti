import { StatsModel } from "./models/stats-model";
import fs from 'fs';
import { User } from "discord.js";
import stats from '../stats/stats.json';

export abstract class StatsHandler {
    static getTopList(): StatsModel[] {
        return stats.sort((a, b) => a.score - b.score);
    }
    
    static getStatStringForUser(userId: string): string {
        const stat = stats.find(s => s.userId === userId);
        if (!stat) { return 'No stats!' }

        const standing = StatsHandler.getTopList().findIndex(x => x.userId === userId) + 1;
        const userName = stat.userName;
        const score = stat.score
        const streak = stat.streak;
        let statsString = standing + '. ' + userName + ': ' + '**' + score + '**';
        if (streak) {
            statsString += ' (' + streak + ' streak)';
        }
        statsString += '\n';
        return statsString;
    }

    static getTotalKelloScore(): string {
        const totalKello = stats.reduce((prev, curr) => prev + curr.score, 0);
        return 'Total: **' + totalKello + '**';
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
