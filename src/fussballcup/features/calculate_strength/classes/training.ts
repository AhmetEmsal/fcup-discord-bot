import T_FixedArray from "../type/t_fixed_array.js";
import E_PlayerPosition from "../type/enums/e_player_position.js";
import Player from "./player.js";
import PlayerSkills from "./player_skills.js";
import TRAINING_PLANS from "../const/common/training_plans.js";
import E_PlayerSkill from "../type/enums/e_player_skill.js";
import GameGeneral from "./game_general.js";

type T_TrainingsTimeCycle<L extends number> = T_FixedArray<number[], L>;
type T_TrainingResultForMaxLevelSkill = { remainingTrainings: number, maxSkillValue: number };
type T_TrainingDayTimeMode = 'training_after_dayTime' | 'training_before_dayTime';

export default class Training {
    //#region FIELDS: Related for Training Time Cycle
    private static _daysInATrainingCycle: 4 = 4;
    private static _normalTrainingsTimeCycle: T_TrainingsTimeCycle<typeof this._daysInATrainingCycle> = [
        [this._convertDayTimeToSec(10), this._convertDayTimeToSec(15)],
        [this._convertDayTimeToSec(10), this._convertDayTimeToSec(15)],
        [
            this._convertDayTimeToSec(7),
            this._convertDayTimeToSec(10),
            this._convertDayTimeToSec(15),
        ],
        [this._convertDayTimeToSec(10), this._convertDayTimeToSec(15)],
    ];
    private static _premiumTrainingsTimeCycle: T_TrainingsTimeCycle<typeof this._daysInATrainingCycle> = [
        [this._convertDayTimeToSec(7)],
        [],
        [],
        [],
    ];

    private static _normalTrainingsInACycle: number = this._normalTrainingsTimeCycle.reduce(
        (acc, v) => acc + v.length, 0
    );
    private static _premiumTrainingsInACycle: number = this._premiumTrainingsTimeCycle.reduce(
        (acc, v) => acc + v.length, 0
    );
    //#endregion

    private static _convertDayTimeToSec(hour: number, minute = 0) {
        return (hour * 60 + minute) * 60;
    }

    public static getTrainingPlanByPosition(position: E_PlayerPosition): E_PlayerSkill[] {
        return TRAINING_PLANS[position];
    }

    //#region Get Current Developing Skill
    public static getCurDevelopingSkillFromPlayer(
        player: Player,
        untilSkillValueForDeveloping = PlayerSkills.skillImprovableWhenLowerThan
    ): E_PlayerSkill | null {
        const { position, skills } = player;

        return this.getCurDevelopingSkill(
            position,
            skills.points,
            untilSkillValueForDeveloping
        );
    }

    public static getCurDevelopingSkill(
        position: E_PlayerPosition,
        valueArrayOfSkills: number[],
        untilSkillValueForDeveloping = PlayerSkills.skillImprovableWhenLowerThan
    ): E_PlayerSkill | null {
        let trainingPlans = this.getTrainingPlanByPosition(position);

        for (let i = 0, len = trainingPlans.length; i < len; i++) {
            const skillIndex = trainingPlans[i];
            let skillValue = valueArrayOfSkills[skillIndex];
            if (skillValue < untilSkillValueForDeveloping)
                return skillIndex as E_PlayerSkill;
        }

        return null;
    }
    //#endregion

    //#region Get points per traninig for [young/non young] player
    static calcPointsPerTrainingForYoungPlayer(youngTrainerLevel: number): number {
        return youngTrainerLevel + 0.5;
    }
    static calcPointsPerTrainingForNormalPlayer(trainerLevel: number): number {
        return trainerLevel / 4 + 0.5;
    }
    //#endregion

    //#region Obtain training results for max level skill
    static obtainTrainingResultsForMaxLevelSkillForPlayer(
        skillVal: number,
        trainerLevel: number,
        limit = PlayerSkills.skillImprovableWhenLowerThan
    ): T_TrainingResultForMaxLevelSkill {
        const remainingToMax = limit - skillVal;
        if (remainingToMax <= 0)
            return { remainingTrainings: 0, maxSkillValue: skillVal };

        const pointsPerTrainingOfNormalPlayer =
            this.calcPointsPerTrainingForNormalPlayer(trainerLevel),
            remainingTrainings = Math.ceil(
                remainingToMax / pointsPerTrainingOfNormalPlayer
            ),
            maxSkillValue = Math.min(
                skillVal +
                remainingTrainings * pointsPerTrainingOfNormalPlayer,
                PlayerSkills.valueLimit
            );

        return { remainingTrainings, maxSkillValue };
    }

    static obtainTrainingResultsForMaxLevelSkillForYoungPlayer(
        skillVal: number,
        withPremiumTrainings: boolean,
        trainerLevel: number,
        youngTrainerLevel: number,
        now: Date,
        youngUntil: Date,
        limit = PlayerSkills.skillImprovableWhenLowerThan
    ): T_TrainingResultForMaxLevelSkill {
        const remainingToMax = limit - skillVal;
        if (remainingToMax <= 0)
            return { remainingTrainings: 0, maxSkillValue: skillVal };

        const pointsPerTrainingOfYoungPlayer =
            this.calcPointsPerTrainingForYoungPlayer(youngTrainerLevel),
            remainingTrainingsInYouth = this.findTrainingsBetweenDates(
                now,
                youngUntil
            ),
            countOfTrainingsInYouth =
                remainingTrainingsInYouth.normal +
                (withPremiumTrainings
                    ? remainingTrainingsInYouth.premium
                    : 0),
            totalTrainingsPointsInYouth =
                countOfTrainingsInYouth * pointsPerTrainingOfYoungPlayer;

        if (remainingToMax <= totalTrainingsPointsInYouth) {
            const remainingTrainings = Math.ceil(
                remainingToMax / totalTrainingsPointsInYouth
            ),
                maxSkillValue = Math.min(
                    skillVal +
                    remainingTrainings * pointsPerTrainingOfYoungPlayer,
                    PlayerSkills.valueLimit
                );
            return { remainingTrainings, maxSkillValue };
        }

        let result =
            Training.obtainTrainingResultsForMaxLevelSkillForPlayer(
                skillVal + totalTrainingsPointsInYouth,
                trainerLevel,
                limit
            );
        return {
            remainingTrainings:
                result.remainingTrainings + countOfTrainingsInYouth,
            maxSkillValue: result.maxSkillValue,
        };
    }
    //#endregion

    // return 0 | 1 | ... | _daysInATrainingCycle-1
    public static getTrainingDayIndexInTrainingCycle(gameDate: Date): number {
        const msInADay = 24 * 60 * 60 * 1e3,
            daysInATrainingDayCycle = this._daysInATrainingCycle;

        return (
            Math.floor(
                (gameDate.getTime() - gameDate.getTimezoneOffset() * 60 * 1e3) /
                msInADay
            ) % daysInATrainingDayCycle
        );
    }

    static getTrainingsByTrainingDayIndex(
        dayIndex: number,
        withPremiumTrainings = false,
        dayTime = this._convertDayTimeToSec(0, 0),
        dayTimeMod: T_TrainingDayTimeMode = "training_after_dayTime"
    ): {
        time: number;
        type: 'normal' | 'premium';
    }[] {
        const mod_multipier = dayTimeMod == "training_before_dayTime" ? 1 : -1,
            dayTime_withMultipier = dayTime * mod_multipier;

        let times = this._normalTrainingsTimeCycle[dayIndex]
            .map((time) => {
                return { time, type: "normal" } as { time: number, type: 'normal' | 'premium' };
            })
            .slice();
        if (withPremiumTrainings)
            times = times.concat(
                this._premiumTrainingsTimeCycle[dayIndex].map((time) => {
                    return { time, type: "premium" };
                })
            );

        return times
            .sort((a, b) => a.time - b.time)
            .filter(({ time }) => time * mod_multipier < dayTime_withMultipier);
    }

    static findWhenXthTrainingWillBeOn(
        trainings: number,
        premiumTrainingsEnabled = false,
        fromDate: Date,
    ): {
        lastTrainingDate: Date,
        trainings: { normal: number, premium: number }
    } {

        if (trainings < 1) throw new RangeError("Trainings must be bigger than 0!");


        //#region constants
        const startTrainingDayIndex = this.getTrainingDayIndexInTrainingCycle(fromDate),
            startTrainingDayTime = this._convertDayTimeToSec(fromDate.getHours(), fromDate.getSeconds());

        const totalTrainingsInACycle = Training._normalTrainingsInACycle + (premiumTrainingsEnabled ? Training._premiumTrainingsInACycle : 0),
            countOfTrainingCycles = Math.floor(trainings / totalTrainingsInACycle);
        //#endregion

        //#region variables
        let lastTrainingDate: Date | null = null,
            remainingTrainings = trainings,
            counterOfTrainings = { normal: 0, premium: 0 };
        //#endregion

        if (countOfTrainingCycles > 0) {

            // assign total trainings in the training cycles
            counterOfTrainings.normal = countOfTrainingCycles * Training._normalTrainingsInACycle;
            if (premiumTrainingsEnabled) counterOfTrainings.premium = countOfTrainingCycles * Training._premiumTrainingsInACycle;

            // update remaining trainings
            remainingTrainings -= countOfTrainingCycles * totalTrainingsInACycle;

            // calc days and last training time to update date
            let addDays = countOfTrainingCycles * Training._daysInATrainingCycle;
            let trainingsTimeInTheDay = this.getTrainingsByTrainingDayIndex(
                startTrainingDayIndex,
                premiumTrainingsEnabled,
                startTrainingDayTime,
                "training_before_dayTime"
            );

            const latestTrainingInEndOfDayTheLastDayInTheTrainingCycle = trainingsTimeInTheDay.length == 0;
            if (latestTrainingInEndOfDayTheLastDayInTheTrainingCycle) {
                addDays -= 1;

                trainingsTimeInTheDay = this.getTrainingsByTrainingDayIndex(
                    startTrainingDayIndex > 0
                        ? startTrainingDayIndex - 1
                        : Training._daysInATrainingCycle - 1,
                    premiumTrainingsEnabled,
                    this._convertDayTimeToSec(23, 59),
                    "training_before_dayTime"
                );

            }

            // get last training time
            const lastTrainingDayTime = trainingsTimeInTheDay.at(-1)!.time;

            // update date
            lastTrainingDate = new Date(fromDate.getTime());
            lastTrainingDate.setDate(lastTrainingDate.getDate() + addDays);
            lastTrainingDate.setHours(
                Math.floor(lastTrainingDayTime / 3600),
                Math.floor((lastTrainingDayTime % 3600) / 60),
                lastTrainingDayTime % 60,
                0
            );
        }

        if (remainingTrainings != 0) {

            if (lastTrainingDate == null) lastTrainingDate = new Date(fromDate.getTime());
            let trainingDayIndex: number = this.getTrainingDayIndexInTrainingCycle(lastTrainingDate)

            while (true) {
                let trainingTimesInTheDay = this.getTrainingsByTrainingDayIndex(
                    trainingDayIndex,
                    premiumTrainingsEnabled,
                    this._convertDayTimeToSec(
                        lastTrainingDate.getHours(),
                        lastTrainingDate.getSeconds()
                    ),
                    "training_after_dayTime"
                );

                if (trainingTimesInTheDay.length == 0) {
                    // go next day
                    lastTrainingDate.setHours(24, 0, 0, 0);
                    trainingDayIndex = (trainingDayIndex + 1) % Training._daysInATrainingCycle;
                    continue;
                }


                const processTrainings = Math.min(
                    remainingTrainings,
                    trainingTimesInTheDay.length
                );
                trainingTimesInTheDay = trainingTimesInTheDay.slice(0, processTrainings);
                trainingTimesInTheDay.forEach(({ type }) => {
                    if (type == "normal") ++counterOfTrainings.normal;
                    else ++counterOfTrainings.premium;
                });

                const lastTrainingDayTime = trainingTimesInTheDay.at(-1)!.time;
                lastTrainingDate.setHours(
                    Math.floor(lastTrainingDayTime / 3600),
                    Math.floor((lastTrainingDayTime % 3600) / 60),
                    lastTrainingDayTime % 60,
                    0
                );

                remainingTrainings -= processTrainings;
                if (remainingTrainings == 0) break;

            }
        }

        return { lastTrainingDate: lastTrainingDate!, trainings: counterOfTrainings };
    }

    static findTrainingsBetweenDates(startDate: Date, endDate: Date): { normal: number, premium: number } {

        if (endDate.getTime() <= startDate.getTime()) throw new TypeError("endDate must be bigger than startDate");

        // counters
        let normalTrainings = 0,
            premiumTrainings = 0;

        // constants
        const normalTrainingsInACycle = Training._normalTrainingsInACycle,
            premiumTrainingsInACycle = Training._premiumTrainingsInACycle,
            daysInATrainingCycle = Training._daysInATrainingCycle;

        const getDaysBetweenDates = (s: Date, e: Date) =>
            (new Date(
                e.getFullYear(),
                e.getMonth(),
                e.getDate()
            ).getTime() -
                new Date(
                    s.getFullYear(),
                    s.getMonth(),
                    s.getDate()
                ).getTime()) /
            86400000 -
            1,
            addTrainingsInTheGivenDate = (
                date: Date,
                traininDayTimeMode: T_TrainingDayTimeMode = "training_after_dayTime"
            ) => {
                const trainingDayIndex = Training.getTrainingDayIndexInTrainingCycle(date);
                addTrainingsInTheGivenDayIndex(
                    trainingDayIndex,
                    this._convertDayTimeToSec(
                        date.getHours(),
                        date.getSeconds()
                    ),
                    traininDayTimeMode
                );
            },
            addTrainingsInTheGivenDayIndex = (
                trainingDayIndex: number,
                dayTime: number,
                traininDayTimeMode: T_TrainingDayTimeMode = "training_after_dayTime"
            ) => {
                const trainingTimesInTheDay =
                    this.getTrainingsByTrainingDayIndex(
                        trainingDayIndex,
                        true,
                        dayTime,
                        traininDayTimeMode
                    );

                trainingTimesInTheDay.forEach(({ type }) => {
                    if (type == "normal") ++normalTrainings;
                    else ++premiumTrainings;
                });
            };

        let days = getDaysBetweenDates(startDate, endDate),
            dayIndex = Training.getTrainingDayIndexInTrainingCycle(startDate);

        if (days != -1) {
            // 1- Calculate the day index using the start date and add trainings in the starting day.
            addTrainingsInTheGivenDate(startDate, "training_after_dayTime");

            // 2- Başlangıç ve bitiş günleri arasındaki gün sayısını bul. Gün sayısını kullanarak döngü sayısını bul. Döngü kadar antrenman ekle
            let cycle_count = Math.floor(days / daysInATrainingCycle);
            normalTrainings += cycle_count * normalTrainingsInACycle;
            premiumTrainings += cycle_count * premiumTrainingsInACycle;

            // 3- Döngüsü tamamlanmamış günleri tek tek ekle
            for (
                let i = 0, len = days % daysInATrainingCycle;
                i < len;
                i++
            ) {
                dayIndex = (dayIndex + 1) % daysInATrainingCycle;
                addTrainingsInTheGivenDayIndex(
                    dayIndex,
                    this._convertDayTimeToSec(0, 0),
                    "training_after_dayTime"
                );
            }
        } else {
            if (dayIndex == Training.getTrainingDayIndexInTrainingCycle(endDate)) {
                addTrainingsInTheGivenDate(
                    startDate,
                    "training_before_dayTime"
                );
                normalTrainings *= -1;
                premiumTrainings *= -1;
            }
        }

        // 4- Bitiş günündeki anrenman sayısını ekle
        addTrainingsInTheGivenDate(endDate, "training_before_dayTime");

        return { normal: normalTrainings, premium: premiumTrainings };
    }
};