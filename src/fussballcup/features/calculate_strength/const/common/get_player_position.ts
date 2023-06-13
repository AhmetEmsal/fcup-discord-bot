import E_PlayerPosition from "../../type/enums/e_player_position.js";
import E_PlayerSkill from "../../type/enums/e_player_skill.js";
import { T_AllPlayerPositionsMap } from "../../type/t_all_servers_player_positions_map.js";

export default function convertPositionStrToEnum(positionStr: string, map: T_AllPlayerPositionsMap): E_PlayerPosition {
    const vals = Object.values(map);
    const index = vals.indexOf(positionStr);
    if(index == -1) throw new Error("PositionStr not includes as value in T_AllPlayerPositionsMap");
    return parseInt(Object.keys(map)[index]) as number;
}