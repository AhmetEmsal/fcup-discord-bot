import T_FixedArray from "../type/t_fixed_array.js";
import ALL_PLAYER_SKILLS from "../const/common/all_player_skills.js";
import E_PlayerSkill, { PLAYER_SKILL_COUNT } from "../type/enums/e_player_skill.js";
import { T_SkillFactors } from "../type/t_skill_factor.js";


export type T_PlayerSkillPoints = T_FixedArray<number, typeof PLAYER_SKILL_COUNT>;
export default class PlayerSkills {
    static valueLimit = 1000;
    static skillImprovableWhenLowerThan = 990;

    private readonly _points = Array.from({ length: PLAYER_SKILL_COUNT }).fill(0) as T_PlayerSkillPoints;

    constructor(
        penaltyAreaSafety: number,
        catchSafety: number,
        twoFooted: number,
        fitness: number,
        shot: number,
        header: number,
        duell: number,
        cover: number,
        speed: number,
        pass: number,
        endurance: number,
        running: number,
        ballControl: number,
        aggressive: number
    ) {
        this.penaltyAreaSafety = penaltyAreaSafety;
        this.catchSafety = catchSafety;
        this.twoFooted = twoFooted;
        this.fitness = fitness;
        this.shot = shot;
        this.header = header;
        this.duell = duell;
        this.cover = cover;
        this.speed = speed;
        this.pass = pass;
        this.endurance = endurance;
        this.running = running;
        this.ballControl = ballControl;
        this.aggressive = aggressive;
    }

    static fromArrayOfSkillPoints(array: T_PlayerSkillPoints) {
        return new PlayerSkills(...array);
    }

    get points() {
        return this._points;
    }

    //#region Skill Getters
    get penaltyAreaSafety() {
        return this.getSkillPoints(E_PlayerSkill.penalty_area_safety);
    }
    get catchSafety() {
        return this.getSkillPoints(E_PlayerSkill.catch_safety);
    }
    get twoFooted() {
        return this.getSkillPoints(E_PlayerSkill.two_footed);
    }
    get fitness() {
        return this.getSkillPoints(E_PlayerSkill.fitness);
    }
    get shot() {
        return this.getSkillPoints(E_PlayerSkill.shot);
    }
    get header() {
        return this.getSkillPoints(E_PlayerSkill.header);
    }
    get duell() {
        return this.getSkillPoints(E_PlayerSkill.duell);
    }
    get cover() {
        return this.getSkillPoints(E_PlayerSkill.cover);
    }
    get speed() {
        return this.getSkillPoints(E_PlayerSkill.speed);
    }
    get pass() {
        return this.getSkillPoints(E_PlayerSkill.pass);
    }
    get endurance() {
        return this.getSkillPoints(E_PlayerSkill.endurance);
    }
    get running() {
        return this.getSkillPoints(E_PlayerSkill.running);
    }
    get ballControl() {
        return this.getSkillPoints(E_PlayerSkill.ball_control);
    }
    get aggressive() {
        return this.getSkillPoints(E_PlayerSkill.aggressive);
    }
    //#endregion


    //#region Setters
    set penaltyAreaSafety(pen) {
        this.setSkillPoints(E_PlayerSkill.penalty_area_safety, pen);
    }
    set catchSafety(catc) {
        this.setSkillPoints(E_PlayerSkill.catch_safety, catc);
    }
    set twoFooted(foot) {
        this.setSkillPoints(E_PlayerSkill.two_footed, foot);
    }
    set fitness(fit) {
        this.setSkillPoints(E_PlayerSkill.fitness, fit);
    }
    set shot(sht) {
        this.setSkillPoints(E_PlayerSkill.shot, sht);
    }
    set header(head) {
        this.setSkillPoints(E_PlayerSkill.header, head);
    }
    set duell(duel) {
        this.setSkillPoints(E_PlayerSkill.duell, duel);
    }
    set cover(cov) {
        this.setSkillPoints(E_PlayerSkill.cover, cov);
    }
    set speed(spe) {
        this.setSkillPoints(E_PlayerSkill.speed, spe);
    }
    set pass(pas) {
        this.setSkillPoints(E_PlayerSkill.pass, pas);
    }
    set endurance(end) {
        this.setSkillPoints(E_PlayerSkill.endurance, end);
    }
    set running(run) {
        this.setSkillPoints(E_PlayerSkill.running, run);
    }
    set ballControl(ball) {
        this.setSkillPoints(E_PlayerSkill.ball_control, ball);
    }
    set aggressive(agg) {
        this.setSkillPoints(E_PlayerSkill.aggressive, agg);
    }
    //#endregion


    //#region Get Points of a Skill
    public getSkillPoints(skill: E_PlayerSkill) {
        return this.getSkillPointsBySkillIndex(ALL_PLAYER_SKILLS[skill].skillIndex);
    }

    public getSkillPointsBySkillIndex(index: number) {
        return this._points[index];
    }
    //#endregion

    //#region Set Points of a Skill
    public setSkillPoints(skill: E_PlayerSkill, points: number) {
        this.setSkillPointsBySkillIndex(ALL_PLAYER_SKILLS[skill].skillIndex, points);
    }
    public setSkillPointsBySkillIndex(index: number, points: number) {
        this._points[index] = this._valCntrl(points);
    }

    //#endregion

    public getEffectOfOneSkillOnTheStrength(skillId: number, skillFactors: T_SkillFactors) {
        const totalOfFactors: number = Object.values(skillFactors).reduce((sum, factor) => sum + factor, 0),
            countOfFactors: number = Object.keys(skillFactors).length,
            skillValue: number = this.getSkillPointsBySkillIndex(skillId);

        return (
            (skillValue * totalOfFactors) / (PLAYER_SKILL_COUNT * countOfFactors)
        );
    }

    private _valCntrl(val: number) {
        return Math.max(0, Math.min(PlayerSkills.valueLimit, val));
    }
};