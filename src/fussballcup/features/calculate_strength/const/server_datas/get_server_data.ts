import { join as path_join } from "path";
import E_GameServer from "../../type/enums/e_game_server.js";
import getServerFolderName from "./get_server_folder_name.js";
import I_ServerData from "./i_server_data.js";
import de_allPlayerPositionsMap from "./servers/de/player_positions_map.js"

export default function getServerData(gameServer: E_GameServer) {
    // const serverFolderName = getServerFolderName(gameServer);
    // const serverFolderPath = path_join(".", "servers", serverFolderName);
    // let allPlayerPositionsMap: I_ServerData['allPlayerPositionsMap'] =
    //     require(path_join(serverFolderPath, 'player_positions_map'));



    return {
        refYouth: {
            time: new Date(2021, 10, 21).getTime(),
            dateVal: 21637442000,
        },

        allPlayerPositionsMap: de_allPlayerPositionsMap,
    };

};
