export interface StatsModel {
    userId: string;
    userName: string;
    score: number;
    gets: number;
    streak: number;
    wins?: number;
    perKello?: PerKelloStats;
}

export interface PerKelloStats {
    [kelloName: string]: {
        getCount: number;
        streak: number;
    }
}