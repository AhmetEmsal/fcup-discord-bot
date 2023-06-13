import E_PlayerPosition from "../../type/enums/e_player_position.js";
import E_PlayerSkill from "../../type/enums/e_player_skill.js";
import { T_AllPositionsSkillFactors, T_PositionSkillFactors } from "../../type/t_skill_factor.js";

// CentreBack | Wingback | DefensiveMidfielder
const DEFENSIVE_POSITIONS_SKILLS_FACTORS: T_PositionSkillFactors = {
    [E_PlayerSkill.penalty_area_safety]: { def: 0, atk: 0 },
    [E_PlayerSkill.catch_safety]: { def: 0, atk: 0 },
    [E_PlayerSkill.two_footed]: { def: 0, atk: 1 },
    [E_PlayerSkill.fitness]: { def: 1, atk: 2 },
    [E_PlayerSkill.shot]: { def: 1, atk: 1 },
    [E_PlayerSkill.header]: { def: 1, atk: 1 },
    [E_PlayerSkill.duell]: { def: 2, atk: 2 },
    [E_PlayerSkill.cover]: { def: 2, atk: 0 },
    [E_PlayerSkill.speed]: { def: 1, atk: 1 },
    [E_PlayerSkill.pass]: { def: 2, atk: 2 },
    [E_PlayerSkill.endurance]: { def: 1, atk: 1 },
    [E_PlayerSkill.running]: { def: 1, atk: 1 },
    [E_PlayerSkill.ball_control]: { def: 0, atk: 0 },
    [E_PlayerSkill.aggressive]: { def: 0, atk: 0 },
};

// LeftMidfielder | RightMidfielder
const MIDFIELD_POSITIONS_SKILLS_FACTORS: T_PositionSkillFactors = {
    [E_PlayerSkill.penalty_area_safety]: { def: 0, atk: 0 },
    [E_PlayerSkill.catch_safety]: { def: 0, atk: 0 },
    [E_PlayerSkill.two_footed]: { def: 0, atk: 1 },
    [E_PlayerSkill.fitness]: { def: 2, atk: 2 },
    [E_PlayerSkill.shot]: { def: 0, atk: 2 },
    [E_PlayerSkill.header]: { def: 2, atk: 1 },
    [E_PlayerSkill.duell]: { def: 1, atk: 1 },
    [E_PlayerSkill.cover]: { def: 2, atk: 0 },
    [E_PlayerSkill.speed]: { def: 2, atk: 1 },
    [E_PlayerSkill.pass]: { def: 0, atk: 2 },
    [E_PlayerSkill.endurance]: { def: 2, atk: 2 },
    [E_PlayerSkill.running]: { def: 1, atk: 1 },
    [E_PlayerSkill.ball_control]: { def: 0, atk: 0 },
    [E_PlayerSkill.aggressive]: { def: 0, atk: 0 },
};

// AttackingMidfielder | Striker
const OFFENSIVE_POSITIONS_SKILLS_FACTORS: T_PositionSkillFactors = {
    [E_PlayerSkill.penalty_area_safety]: { def: 0, atk: 0 },
    [E_PlayerSkill.catch_safety]: { def: 0, atk: 0 },
    [E_PlayerSkill.two_footed]: { def: 1, atk: 2 },
    [E_PlayerSkill.fitness]: { def: 2, atk: 1 },
    [E_PlayerSkill.shot]: { def: 0, atk: 2 },
    [E_PlayerSkill.header]: { def: 0, atk: 1 },
    [E_PlayerSkill.duell]: { def: 2, atk: 0 },
    [E_PlayerSkill.cover]: { def: 1, atk: 0 },
    [E_PlayerSkill.speed]: { def: 1, atk: 2 },
    [E_PlayerSkill.pass]: { def: 0, atk: 1 },
    [E_PlayerSkill.endurance]: { def: 2, atk: 1 },
    [E_PlayerSkill.running]: { def: 2, atk: 2 },
    [E_PlayerSkill.ball_control]: { def: 0, atk: 0 },
    [E_PlayerSkill.aggressive]: { def: 0, atk: 0 },
};

const ALL_PLAYER_POSITIONS_SKILLS_FACTORS: T_AllPositionsSkillFactors = {
    [E_PlayerPosition.GoalKeeper]: {
        [E_PlayerSkill.penalty_area_safety]: { def: 3, atk: 2 },
        [E_PlayerSkill.catch_safety]: { def: 3, atk: 2 },
        [E_PlayerSkill.two_footed]: { def: 0, atk: 1 },
        [E_PlayerSkill.fitness]: { def: 2, atk: 2 },
        [E_PlayerSkill.shot]: { def: 0, atk: 1 },
        [E_PlayerSkill.header]: { def: 0, atk: 0 },
        [E_PlayerSkill.duell]: { def: 1, atk: 1 },
        [E_PlayerSkill.cover]: { def: 0, atk: 0 },
        [E_PlayerSkill.speed]: { def: 2, atk: 1 },
        [E_PlayerSkill.pass]: { def: 0, atk: 0 },
        [E_PlayerSkill.endurance]: { def: 0, atk: 1 },
        [E_PlayerSkill.running]: { def: 0, atk: 0 },
        [E_PlayerSkill.ball_control]: { def: 0, atk: 0 },
        [E_PlayerSkill.aggressive]: { def: 0, atk: 0 },
    },
    [E_PlayerPosition.CentreBack]: MIDFIELD_POSITIONS_SKILLS_FACTORS,
    [E_PlayerPosition.Wingback]: MIDFIELD_POSITIONS_SKILLS_FACTORS,
    [E_PlayerPosition.DefensiveMidfielder]: MIDFIELD_POSITIONS_SKILLS_FACTORS,
    [E_PlayerPosition.LeftMidfielder]: MIDFIELD_POSITIONS_SKILLS_FACTORS,
    [E_PlayerPosition.RightMidfielder]: MIDFIELD_POSITIONS_SKILLS_FACTORS,
    [E_PlayerPosition.AttackingMidfielder]: OFFENSIVE_POSITIONS_SKILLS_FACTORS,
    [E_PlayerPosition.Striker]: OFFENSIVE_POSITIONS_SKILLS_FACTORS
};

export default ALL_PLAYER_POSITIONS_SKILLS_FACTORS;