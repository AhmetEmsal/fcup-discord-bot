import ALL_PLAYER_POSITIONS_SKILLS_FACTORS from "../const/common/all_player_positions_skills_factors.js";
import E_PlayerPosition from "../type/enums/e_player_position.js";
import E_PlayerSkill, { PLAYER_SKILL_COUNT } from "../type/enums/e_player_skill.js";
import GameGeneral from "./game_general.js";
import PlayerSkills from "./player_skills.js";
import Training from "./training.js";

interface I_AfterDevelopedSkillStatus {
    skillId: number,
    countOfTrainingsThatGived: number,
    countOfYouthTrainingSpent: number,
    playerAfterTrained: Player,
    lastTrainingDate: Date,
};

export interface I_StrengthBoostResult {
    strengthBoosts: {
        trainedSkills: Array<I_AfterDevelopedSkillStatus>,
        increment: number,
        playerAfterStrengthBoost: Player,
        boostDate: Date,
        totalNeededTrainings: number,
    }[],
    warning?: string,
};

export default class Player {

    //#region Fields
    private readonly _id: number;
    private readonly _name: string;
    private readonly _position: E_PlayerPosition;
    private readonly _skills: PlayerSkills;
    private _youngUntil: Date | null;
    private readonly _defenseAttribute: number;
    private readonly _attackAttribute: number;
    private readonly _strength: number;
    //#endregion

    constructor(id: number, name: string, position: E_PlayerPosition, skills: PlayerSkills, youngUntil: Date | null = null) {
        this._id = id;
        this._name = name;
        this._position = position;
        this._skills = skills;
        this._youngUntil = youngUntil;
        this._defenseAttribute = this.defenseAttribute;
        this._attackAttribute = this.attackAttribute;
        this._strength = this.strength;
    }

    static clone(player: Player) {
        let newSkills = PlayerSkills.fromArrayOfSkillPoints(player.skills.points);
        return new Player(
            player.id,
            player.name,
            player.position,
            newSkills,
            player.isYoung ? new Date((player.youngUntil as Date).getTime()) : null
        );
    }

    //#region Getters
    get id() {
        return this._id;
    }
    get name() {
        return this._name;
    }
    get position() {
        return this._position;
    }

    get skills() {
        return this._skills;
    }

    get isYoung() {
        return this._youngUntil instanceof Date;
    }
    get youngUntil() {
        return this._youngUntil;
    }

    get defenseAttribute() {
        return Player.calcDefenseAttribute(
            this.position,
            this.skills.points
        );
    }
    get roundedDefenseAttribute() {
        return Player.roundDefenseOrAttackAttribute(this.defenseAttribute);
    }

    get attackAttribute() {
        return Player.calcAttackAttribute(this.position, this.skills.points);
    }
    get roundedAttackAttribute() {
        return Player.roundDefenseOrAttackAttribute(this.attackAttribute);
    }

    get strength() {
        return Player.calcStrength(this.position, this.skills.points);
    }
    get realStrength() {
        return Player.calcRealStrength(this.position, this.skills.points);
    }
    get factorsOfSkills() {
        return Player.getSkillFactorsByPosition(this.position);
    }
    //#endregion


    //#region Private Static Methods
    private static getSkillFactorsByPosition(position: E_PlayerPosition) {
        return ALL_PLAYER_POSITIONS_SKILLS_FACTORS[position];
    }

    private static roundDefenseOrAttackAttribute(defOrAtkAttribute: number) {
        return Math.round(Math.floor(defOrAtkAttribute) / 10) * 10;
    }

    private static calcDefOrAtkAttribute(
        position: E_PlayerPosition,
        valueArrayOfSkills: number[],
        atkOrDef: 'atk' | 'def'
    ) {
        let positionSkillFactors = this.getSkillFactorsByPosition(position);
        return (
            valueArrayOfSkills.reduce(
                (acc, skillVal, skillIdx) =>
                    acc + skillVal * positionSkillFactors[skillIdx as E_PlayerSkill][atkOrDef],
                0
            ) / valueArrayOfSkills.length
        );
    }

    private static calcNeededPointsForDefOrAtkBoost(defOrAtkValue: number) {
        let mod = defOrAtkValue % 10;
        if (mod == 5) return 10;
        else if (mod < 5) return 5 - mod;
        else return 5 + 10 - mod;
    }

    private static calcNeededTrainingsForDefOrAtkBoost(
        neededPoints: number,
        pointsPerTraining: number,
        skillFactor: number
    ) {
        return Math.ceil(
            (neededPoints * PLAYER_SKILL_COUNT) /
            (pointsPerTraining * skillFactor)
        );
    }
    //#endregion


    //#region Public Static Methods
    public static calcDefenseAttribute(position: E_PlayerPosition, valueArrayOfSkills: number[]) {
        return this.calcDefOrAtkAttribute(
            position,
            valueArrayOfSkills,
            "def"
        );
    }

    public static calcAttackAttribute(position: E_PlayerPosition, valueArrayOfSkills: number[]) {
        return this.calcDefOrAtkAttribute(
            position,
            valueArrayOfSkills,
            "atk"
        );
    }

    public static calcStrength(position: E_PlayerPosition, valueArrayOfSkills: number[]) {
        return this.calcStrengthByDefAndAtkAttributes(
            this.calcDefenseAttribute(position, valueArrayOfSkills),
            this.calcAttackAttribute(position, valueArrayOfSkills)
        );
    }

    public static calcStrengthByDefAndAtkAttributes(defense: number, attack: number) {
        return (
            (this.roundDefenseOrAttackAttribute(defense) +
                this.roundDefenseOrAttackAttribute(attack)) /
            2
        );
    }

    public static calcRealStrength(position: E_PlayerPosition, valueArrayOfSkills: number[]) {
        return (
            (this.calcDefenseAttribute(position, valueArrayOfSkills) +
                this.calcAttackAttribute(position, valueArrayOfSkills)) /
            2
        );
    }
    //#endregion


    public calcNextStrengthBoost(
        trainerLevel: number,
        youngTrainerLevel: number,
        startDate: Date,
        withPremiumTrainings = false,
    ): null | { warning: string } | I_StrengthBoostResult["strengthBoosts"][number] {
        let currentSkillToBeDeveloped: E_PlayerSkill;
        {
            let res = Training.getCurDevelopingSkillFromPlayer(this);
            if (res == null) return { warning: "all skills were been developed" };
            currentSkillToBeDeveloped = res;
        }

        const skillFactors = Player.getSkillFactorsByPosition(this.position),
            trainingPlan: number[] = Training.getTrainingPlanByPosition(this.position),
            skillCountInThePlan: number = trainingPlan.length;

        // calc remainingJuniorTrainings
        let remainingJuniorTrainings = 0;
        if (this.isYoung) {
            let resultTrainings = Training.findTrainingsBetweenDates(startDate, this.youngUntil as Date);
            remainingJuniorTrainings = resultTrainings.normal + (withPremiumTrainings ? resultTrainings.premium : 0);
        }

        let tempDate: Date = new Date(startDate.getTime()),
            tempPlayer: Player = Player.clone(this),
            trainedSkills: Array<I_AfterDevelopedSkillStatus> = [],
            totalNeededTrainings: number = 0,
            indexOfSkillToBeDevelopedInPlan: number = trainingPlan.indexOf(currentSkillToBeDeveloped);

        while (indexOfSkillToBeDevelopedInPlan < skillCountInThePlan) {
            currentSkillToBeDeveloped = trainingPlan[indexOfSkillToBeDevelopedInPlan];

            // get points of skill and check if it can be developed or not
            const pointsOfSkill = tempPlayer.skills.getSkillPointsBySkillIndex(currentSkillToBeDeveloped);
            if (pointsOfSkill >= PlayerSkills.skillImprovableWhenLowerThan) {
                ++indexOfSkillToBeDevelopedInPlan;
                continue;
            }

            // skill factors for the skill to be developed
            const skillFactorsForTheSkill = skillFactors[currentSkillToBeDeveloped];

            // needed points for boost
            const neededPointsForDefenseBoost = Player.calcNeededPointsForDefOrAtkBoost(tempPlayer.defenseAttribute),
                neededPointsForAttackBoost = Player.calcNeededPointsForDefOrAtkBoost(tempPlayer.attackAttribute);

            // calculate trainings for ...
            const resultsOfTrainingsToMaxSkillValue =
                remainingJuniorTrainings > 0
                    ? Training.obtainTrainingResultsForMaxLevelSkillForYoungPlayer(
                        pointsOfSkill,
                        withPremiumTrainings,
                        trainerLevel,
                        youngTrainerLevel,
                        tempDate,
                        tempPlayer.youngUntil as Date
                    )
                    : Training.obtainTrainingResultsForMaxLevelSkillForPlayer(
                        pointsOfSkill,
                        trainerLevel
                    );


            // counters
            let countOfTrainingsThatCanBeGivenToSkill: number,
                totalPointsThatCanBeGivenToSkill: number,
                countOfYouthTrainingSpent: number = 0;

            let minimumNeededTrainingsForStrengthBoost: number;

            if (remainingJuniorTrainings > 0) {
                // calc points per training as a young player
                const pointsPerTrainingOfYoungPlayer = Training.calcPointsPerTrainingForYoungPlayer(youngTrainerLevel);

                // calc needed trainigs for boost
                let neededTrainingsForDefenseBoost = Player.calcNeededTrainingsForDefOrAtkBoost(
                    neededPointsForDefenseBoost,
                    pointsPerTrainingOfYoungPlayer,
                    skillFactorsForTheSkill.def
                );
                let neededTrainingsForAttackBoost = Player.calcNeededTrainingsForDefOrAtkBoost(
                    neededPointsForAttackBoost,
                    pointsPerTrainingOfYoungPlayer,
                    skillFactorsForTheSkill.atk
                );

                // minimum needed trainigs for boost
                minimumNeededTrainingsForStrengthBoost = Math.min(
                    neededTrainingsForDefenseBoost,
                    neededTrainingsForAttackBoost
                );

                //  calc trainings for spent
                const numberOfJuniorTrainingsThatCanBeGivenToSkill = Math.min(
                    minimumNeededTrainingsForStrengthBoost,
                    remainingJuniorTrainings
                );

                // calc points of trainings that given
                const totalJuniorPointsThatCanBeGivenToSkill =
                    numberOfJuniorTrainingsThatCanBeGivenToSkill *
                    pointsPerTrainingOfYoungPlayer;

                //
                const isEnoughJuniorTrainingsForBoost: boolean = remainingJuniorTrainings >= minimumNeededTrainingsForStrengthBoost;
                let totalNormalPlayerPointsThatCanBeGivenToSkill = 0;

                if (!isEnoughJuniorTrainingsForBoost) {
                    const pointsPerTrainingOfNormalPlayer = Training.calcPointsPerTrainingForNormalPlayer(trainerLevel);

                    neededTrainingsForDefenseBoost =
                        numberOfJuniorTrainingsThatCanBeGivenToSkill +
                        Math.ceil(
                            (
                                (neededPointsForDefenseBoost * PLAYER_SKILL_COUNT) -
                                (totalJuniorPointsThatCanBeGivenToSkill * skillFactorsForTheSkill.def)
                            ) /
                            (pointsPerTrainingOfNormalPlayer * skillFactorsForTheSkill.def)
                        );
                    neededTrainingsForAttackBoost =
                        numberOfJuniorTrainingsThatCanBeGivenToSkill +
                        Math.ceil(
                            (
                                (neededPointsForAttackBoost * PLAYER_SKILL_COUNT) -
                                (totalJuniorPointsThatCanBeGivenToSkill * skillFactorsForTheSkill.atk)
                            ) /
                            (pointsPerTrainingOfNormalPlayer * skillFactorsForTheSkill.atk)
                        );

                    minimumNeededTrainingsForStrengthBoost = Math.min(
                        neededTrainingsForDefenseBoost,
                        neededTrainingsForAttackBoost
                    );

                    const numberOfNormalTrainingsThatCanBeGivenToSkill = minimumNeededTrainingsForStrengthBoost - numberOfJuniorTrainingsThatCanBeGivenToSkill;
                    totalNormalPlayerPointsThatCanBeGivenToSkill = numberOfNormalTrainingsThatCanBeGivenToSkill * pointsPerTrainingOfNormalPlayer;

                    countOfYouthTrainingSpent = remainingJuniorTrainings;
                } else countOfYouthTrainingSpent = minimumNeededTrainingsForStrengthBoost;

                countOfTrainingsThatCanBeGivenToSkill = Math.min(
                    minimumNeededTrainingsForStrengthBoost,
                    resultsOfTrainingsToMaxSkillValue.remainingTrainings
                );
                totalPointsThatCanBeGivenToSkill = totalJuniorPointsThatCanBeGivenToSkill + totalNormalPlayerPointsThatCanBeGivenToSkill;
            } else {
                const pointsPerTrainingOfNormalPlayer = Training.calcPointsPerTrainingForNormalPlayer(trainerLevel);
                const neededTrainingsForDefenseBoost = Player.calcNeededTrainingsForDefOrAtkBoost(
                    neededPointsForDefenseBoost,
                    pointsPerTrainingOfNormalPlayer,
                    skillFactorsForTheSkill.def
                );
                const neededTrainingsForAttackBoost = Player.calcNeededTrainingsForDefOrAtkBoost(
                    neededPointsForAttackBoost,
                    pointsPerTrainingOfNormalPlayer,
                    skillFactorsForTheSkill.atk
                );

                minimumNeededTrainingsForStrengthBoost = Math.min(
                    neededTrainingsForDefenseBoost,
                    neededTrainingsForAttackBoost
                );
                countOfTrainingsThatCanBeGivenToSkill = Math.min(
                    minimumNeededTrainingsForStrengthBoost,
                    resultsOfTrainingsToMaxSkillValue.remainingTrainings
                );
                totalPointsThatCanBeGivenToSkill = countOfTrainingsThatCanBeGivenToSkill * pointsPerTrainingOfNormalPlayer;
            }

            // training
            let playerAfterTrained = Player.clone(tempPlayer);
            playerAfterTrained.skills.setSkillPoints(
                currentSkillToBeDeveloped,
                playerAfterTrained.skills.getSkillPoints(currentSkillToBeDeveloped) + totalPointsThatCanBeGivenToSkill
            );

            // update youth status if trainings finished
            remainingJuniorTrainings -= countOfYouthTrainingSpent;
            if (remainingJuniorTrainings == 0) playerAfterTrained.comeOutOfYouth();

            let result = Training.findWhenXthTrainingWillBeOn(
                countOfTrainingsThatCanBeGivenToSkill,
                withPremiumTrainings,
                tempDate
            );
            tempDate = result.lastTrainingDate;
            totalNeededTrainings += countOfTrainingsThatCanBeGivenToSkill;

            trainedSkills.push({
                skillId: currentSkillToBeDeveloped,
                countOfTrainingsThatGived: countOfTrainingsThatCanBeGivenToSkill,
                countOfYouthTrainingSpent,
                playerAfterTrained,
                lastTrainingDate: tempDate,
            });

            if (minimumNeededTrainingsForStrengthBoost <= resultsOfTrainingsToMaxSkillValue.remainingTrainings) {
                const increment = playerAfterTrained.strength - this.strength;

                return {
                    trainedSkills,
                    increment: increment,
                    playerAfterStrengthBoost: playerAfterTrained,
                    boostDate: tempDate,
                    totalNeededTrainings,
                };
            }

            tempPlayer = playerAfterTrained;
            ++indexOfSkillToBeDevelopedInPlan;
        }

        return null;
    }

    public getAllStrengthBoosts(
        trainerLevel: number,
        youngTrainerLevel: number,
        startDate: Date,
        withPremiumTrainings = false,
        limit = Infinity,
    ): I_StrengthBoostResult {
        let strengthBoosts: I_StrengthBoostResult["strengthBoosts"] = [],
            tempPlayer: Player = this,
            tempDate = startDate,
            warning,
            counter = 0;

        while (counter < limit) {
            const result = tempPlayer.calcNextStrengthBoost(
                trainerLevel,
                youngTrainerLevel,
                tempDate,
                withPremiumTrainings
            );

            if (result == null) break;
            else if ("warning" in result) {
                warning = result.warning;
                break;
            }

            // add boost
            strengthBoosts.push(result);

            // updates
            tempDate = result.boostDate;
            tempPlayer = result.playerAfterStrengthBoost;
            ++counter;
        }

        return { strengthBoosts, warning };
    }

    public getEffectOfSkillOnPower(skillIndex: number) {
        return this.skills.getEffectOfOneSkillOnTheStrength(
            skillIndex,
            this.factorsOfSkills[skillIndex as E_PlayerSkill]
        );
    }

    private comeOutOfYouth() {
        this._youngUntil = null;
    }
};