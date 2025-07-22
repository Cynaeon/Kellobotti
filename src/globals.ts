interface GlobalsModel {
    kelloOn: boolean;
    kelloName: string;
    usersWhoGot: string[];
    commandGets: { userName: string, message?: string }[];
    getCooldowns: { [userId: string]: Date };
}

export interface KelloTime {
    hour: number,
    minute: number,
    name: string,
}

export const Globals: GlobalsModel = {
    kelloOn: false,
    kelloName: '',
    usersWhoGot: [],
    commandGets: [],
    getCooldowns: {},
};

export const GET_TIMES: KelloTime[] = [
    // { name: 'Bond', hour: 0, minute: 7},
    { name: 'John', hour: 1, minute: 17},
    { name: 'Havu', hour: 6, minute: 9 },
    { name: 'Todd', hour: 11, minute: 11 },
    { name: 'Leet', hour: 13, minute: 37 },
    { name: 'Weed', hour: 16, minute: 20 },
    // { name: 'Rush', hour: 21, minute: 12 },
    { name: 'Niilo', hour: 22, minute: 22 },
];

