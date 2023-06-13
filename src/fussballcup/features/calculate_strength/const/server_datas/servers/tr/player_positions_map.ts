import { T_AllPlayerPositionsMap } from "../../../../type/t_all_servers_player_positions_map.js";
import E_PlayerPosition from "../../../../type/enums/e_player_position.js";

const allPlayerPositionsMap: T_AllPlayerPositionsMap = {
    [E_PlayerPosition.GoalKeeper]: "KL",
    [E_PlayerPosition.CentreBack]: "DI",
    [E_PlayerPosition.Wingback]: "DD",
    [E_PlayerPosition.DefensiveMidfielder]: "OD",
    [E_PlayerPosition.LeftMidfielder]: "OL",
    [E_PlayerPosition.RightMidfielder]: "OR",
    [E_PlayerPosition.AttackingMidfielder]: "OH",
    [E_PlayerPosition.Striker]: "FO",
};

export default allPlayerPositionsMap;