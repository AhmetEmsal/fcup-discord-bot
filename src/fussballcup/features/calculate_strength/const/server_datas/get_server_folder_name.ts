import E_GameServer from "../../type/enums/e_game_server.js";

export default function getServerFolderName(gameServer: E_GameServer) {
    switch (gameServer) {
        case E_GameServer.DE: return "de";
        case E_GameServer.TR: return "tr";
        default: throw new Error(`There is no folder for the server: ${gameServer}.`);
    }
}