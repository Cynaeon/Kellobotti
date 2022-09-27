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
