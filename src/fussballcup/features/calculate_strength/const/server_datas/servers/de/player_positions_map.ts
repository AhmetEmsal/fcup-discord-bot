import { T_AllPlayerPositionsMap } from "../../../../type/t_all_servers_player_positions_map.js";
import E_PlayerPosition from "../../../../type/enums/e_player_position.js";

const allPlayerPositionsMap: T_AllPlayerPositionsMap = {
    [E_PlayerPosition.GoalKeeper]: "TW",
    [E_PlayerPosition.CentreBack]: "AV",
    [E_PlayerPosition.Wingback]: "IV",
    [E_PlayerPosition.DefensiveMidfielder]: "DM",
    [E_PlayerPosition.LeftMidfielder]: "LM",
    [E_PlayerPosition.RightMidfielder]: "RM",
    [E_PlayerPosition.AttackingMidfielder]: "OM",
    [E_PlayerPosition.Striker]: "ST",
};

export default allPlayerPositionsMap;