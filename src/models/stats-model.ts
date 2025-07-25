export interface StatsModel {
    userId: string;
    userName: string;
    score: number;
    gets: number;
    streak: number;
    wins?: number;
    perKello?: PerKelloStats;
    lastTenGets?: boolean[];
}

export interface PerKelloStats {
    [kelloName: string]: {
        getCount: number;
        streak: number;
    }
}