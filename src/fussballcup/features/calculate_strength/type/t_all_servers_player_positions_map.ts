import E_GameServer from "./enums/e_game_server.js"
import E_PlayerPosition from "./enums/e_player_position.js";

export type T_AllPlayerPositionsMap = { [key in E_PlayerPosition]: string }

type T_AllServersPlayerPositionsMap = { [key in E_GameServer]: T_AllPlayerPositionsMap };
export default T_AllServersPlayerPositionsMap;