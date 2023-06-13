import E_PlayerPosition from "./enums/e_player_position.js";

export type T_DefensivePlayerPositions = E_PlayerPosition.CentreBack | E_PlayerPosition.Wingback | E_PlayerPosition.DefensiveMidfielder;
export type T_OffensivePlayerPositions = E_PlayerPosition.Striker | E_PlayerPosition.AttackingMidfielder;
export type T_MidfieldPlayerPositions = E_PlayerPosition.LeftMidfielder | E_PlayerPosition.RightMidfielder | E_PlayerPosition.AttackingMidfielder | E_PlayerPosition.DefensiveMidfielder;