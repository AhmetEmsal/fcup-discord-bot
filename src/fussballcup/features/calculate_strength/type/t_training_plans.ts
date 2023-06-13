import E_PlayerPosition from "./enums/e_player_position.js";
import E_PlayerSkill from "./enums/e_player_skill.js";

type T_TrainingPlans = {
    [Key in E_PlayerPosition]: Array<E_PlayerSkill>
};

export default T_TrainingPlans;