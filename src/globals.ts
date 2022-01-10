interface GlobalsModel {
    kelloOn: boolean;
    postedToday: string[];
    commandGets: { userName: string, message?: string }[];
}

export const Globals: GlobalsModel = {
    kelloOn: false,
    postedToday: [],
    commandGets: [],
};
