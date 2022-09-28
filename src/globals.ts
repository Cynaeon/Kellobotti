interface GlobalsModel {
    kelloOn: boolean;
    usersWhoGot: string[];
    commandGets: { userName: string, message?: string }[];
    getCooldowns: { [userId: string]: Date };
}

export const Globals: GlobalsModel = {
    kelloOn: false,
    usersWhoGot: [],
    commandGets: [],
    getCooldowns: {},
};


export const GET_TIMES: { hour: number, minute: number }[] = [
    { hour: 0, minute: 7},
    { hour: 6, minute: 9 },
    { hour: 11, minute: 11 },
    { hour: 13, minute: 37 },
    { hour: 16, minute: 20 },
    { hour: 21, minute: 12 },
];
