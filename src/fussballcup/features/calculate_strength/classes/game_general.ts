export default class GameGeneral {
    static getServerDate(localTimeDiffToServerAsHour: number) {
        const localTimeDiffToServer = localTimeDiffToServerAsHour * 3600;
        return new Date(
            new Date().getTime() - localTimeDiffToServer * 1e3
        );
    }
};