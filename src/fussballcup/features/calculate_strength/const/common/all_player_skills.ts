import E_PlayerSkill from "../../type/enums/e_player_skill.js";

class PlayerSkill {
    private readonly _skillIndex;

    constructor(skillIndex: number) {
        this._skillIndex = skillIndex;
    }

    get skillIndex() {
        return this._skillIndex;
    }
}

type T_ALlPlayerSkills = { [key in E_PlayerSkill]: PlayerSkill };

const ALL_PLAYER_SKILLS: T_ALlPlayerSkills = {
    [E_PlayerSkill.penalty_area_safety]: new PlayerSkill(0),
    [E_PlayerSkill.catch_safety]: new PlayerSkill(1),
    [E_PlayerSkill.two_footed]: new PlayerSkill(2),
    [E_PlayerSkill.fitness]: new PlayerSkill(3),
    [E_PlayerSkill.shot]: new PlayerSkill(4),
    [E_PlayerSkill.header]: new PlayerSkill(5),
    [E_PlayerSkill.duell]: new PlayerSkill(6),
    [E_PlayerSkill.cover]: new PlayerSkill(7),
    [E_PlayerSkill.speed]: new PlayerSkill(8),
    [E_PlayerSkill.pass]: new PlayerSkill(9),
    [E_PlayerSkill.endurance]: new PlayerSkill(10),
    [E_PlayerSkill.running]: new PlayerSkill(11),
    [E_PlayerSkill.ball_control]: new PlayerSkill(12),
    [E_PlayerSkill.aggressive]: new PlayerSkill(13)
}

export default ALL_PLAYER_SKILLS;