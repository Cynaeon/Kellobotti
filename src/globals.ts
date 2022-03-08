interface GlobalsModel {
    kelloOn: boolean;
    postedToday: string[];
    commandGets: { userName: string, message?: string }[];
    getCooldowns: { [userId: string]: Date };
}

export const Globals: GlobalsModel = {
    kelloOn: false,
    postedToday: [],
    commandGets: [],
    getCooldowns: {},
};
