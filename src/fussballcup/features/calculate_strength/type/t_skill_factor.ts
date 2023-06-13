import E_PlayerPosition from "./enums/e_player_position.js";
import E_PlayerSkill from "./enums/e_player_skill.js";

export type T_SkillFactors = { def: number, atk: number };
export type T_PositionSkillFactors = { [key in E_PlayerSkill]: T_SkillFactors };
export type T_AllPositionsSkillFactors = { [key in E_PlayerPosition]: T_PositionSkillFactors };