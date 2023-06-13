import { Message } from "discord.js";
import Player, { I_StrengthBoostResult } from "./classes/player.js";
import PlayerSkills, { T_PlayerSkillPoints } from "./classes/player_skills.js";
import GameGeneral from "./classes/game_general.js";
import T_FixedArray from "./type/t_fixed_array.js";
import getServerData from "./const/server_datas/get_server_data.js";
import E_GameServer from "./type/enums/e_game_server.js";
import E_PlayerPosition from "./type/enums/e_player_position.js";
import convertPositionStrToEnum from "./const/common/get_player_position.js";

let errors: string[] = [];
let params: { [key: string]: any } = {};

let trDeHourDifference: number = 0,
    positionInStr: string = "TW",
    trainerLevel: number = 10,
    premiumTrainingEnabled: boolean = true,
    playerSkillPoints: T_PlayerSkillPoints,
    youngUntil: Date = new Date(),
    youngTrainerLevel: number = 10,
    limit: number = Infinity;

function paramsExtractor(args: string[]) {
    const expectedParamKeys = [
        "trDeSaatFarkı",
        "pozisyon",
        "antrenör",
        "premiumAntrenman",
        "beceriler",
    ];
    const optionalParamKeys = ["gençlikBitisi", "gençAntrenör", "limit"];

    params = args.reduce((acc, param) => {
        let a = param.split("=").map((s) => s.trim());
        const key = a[0];
        if (
            !expectedParamKeys.includes(key) &&
            !optionalParamKeys.includes(key)
        )
            return acc;

        if (a.length > 1) {
            let val = a.slice(1);
            acc[key] = val.length == 1 ? val[0] : val;
        } else acc[key] = 1;

        return acc;
    }, {} as { [key: string]: any });
}

function checkParams() {
    errors = [];

    if (!("trDeSaatFarkı" in params))
        errors.push("trDeSaatFarkı parametresi gerekli");
    else if (
        isNaN((trDeHourDifference = parseInt(params["trDeSaatFarkı"])))
    )
        errors.push("trDeSaatFarkı numerik bir değer olmalı");

    const allPosition = "TW|IV|AV|DM|LM|RM|OM|ST".split("|");
    if (!("pozisyon" in params))
        errors.push("pozisyon parametresi gerekli");
    else if (!allPosition.includes((positionInStr = params["pozisyon"])))
        errors.push(
            "pozisyon parametresi hatalı, şu değerlerden birisi olmalı: (" +
            allPosition.join(",") +
            ")"
        );

    if (!("antrenör" in params))
        errors.push("antrenör parametresi gerekli");
    else if (isNaN((trainerLevel = parseInt(params["antrenör"]))))
        errors.push("antrenör numerik bir değer olmalı");

    const booleanArr = [
        "0",
        "1",
        "false",
        "true",
        "no",
        "yes",
        "hayır",
        "evet",
    ];
    if (!("premiumAntrenman" in params))
        errors.push("premiumAntrenman parametresi gerekli");
    else {
        const val = params["premiumAntrenman"].trim().toLowerCase();
        const foundIndex = booleanArr.findIndex((str) => str == val);
        if (foundIndex == -1)
            errors.push(
                "premiumAntrenman parametresi hatalı, şu değerlerden birisi olmalı: (" +
                booleanArr.join(",") +
                ")"
            );
        else premiumTrainingEnabled = foundIndex % 2 == 1;
    }

    if (!("beceriler" in params))
        errors.push("beceriler parametresi gerekli");
    else {
        let val = params["beceriler"].trim();

        if (!val.startsWith("(") || !val.endsWith(")"))
            errors.push(
                "beceriler parametresi hatalı, şu formatta girmelisiniz: (0, 0, 85, 998, 81, 110, 61, 62, 991, 80, 993.5, 61, 64, 62)"
            );
        else {
            val = val.slice(1, -1);
            var test = (val as string).split(",").map((s) => parseFloat(s.trim()));

            if (test.length != 14)
                errors.push(
                    "beceriler parametresinde eksiklik var, 14 beceri virgüller ile ayrılıp girilmesi gerekiyor"
                );

            playerSkillPoints = test as T_PlayerSkillPoints;
            let incorrectCount = playerSkillPoints.reduce(
                (acc, skill) => acc + (isNaN(skill) ? 1 : 0),
                0
            );
            if (incorrectCount > 0)
                errors.push(
                    "beceriler parametresindeki değerlerde hata var, " +
                    incorrectCount +
                    " beceri numerik değildi"
                );
        }
    }

    /*const optionalYoungParamKeys = ["gençlikBitisi", "gençAntrenör"];
    let exists;
    if((exists = optionalYoungParamKeys.map(paramKey=> paramKey in params)).find(exist=> !exist) ){
    }*/

    if ("gençlikBitisi" in params) {
        const val = (params["gençlikBitisi"] as string)
            .trim()
            .split(".")
            .map((s) => parseInt(s.trim()));
        if (
            val.length != 3 ||
            !(
                (youngUntil = new Date(
                    val[2],
                    val[1] - 1,
                    val[0]
                )) instanceof Date
            )
        )
            errors.push(
                "gençlikBitisi parametresi hatalı, gün.ay.yıl formatında bir tarih girmeniz gerekiyor"
            );
        else {
            if (!("gençAntrenör" in params))
                errors.push(
                    "gençlikBitisi parametresi giriliyorsa gençAntrenör parametresi de gerekli"
                );
            else if (isNaN((youngTrainerLevel = params["gençAntrenör"])))
                errors.push("gençAntrenör numerik bir değer olmalı");
        }
    } else if ("gençAntrenör" in params)
        errors.push(
            "gençAntrenör parametresi, gençlikBitisi parametresi ile birlikte girilmeli"
        );

    if ("limit" in params && isNaN((limit = params["limit"])))
        errors.push(
            "opsiyonal limit parametresi girildi fakat numerik olması gerekir"
        );
}

export default function main(message: Message | null, args: string[]) {
    //!güç-hesapla trDeSaatFarkı=1 pozisyon={TW|IV|AV|DM|LM|RM|OM|ST} antrenör=10 premiumAntrenman={false|true} beceriler=(0,0,85,998,81,110,61,62,991,80,993.5,61,64,62) [gençlikBitisi=15.12.2022 gençAntrenör=10] [limit=5]
    //!güç-hesapla trDeSaatFarkı=1 pozisyon=LM antrenör=10 premiumAntrenman=true beceriler=(0,0,85,998,81,110,61,62,991,80,993.5,61,64,62) gençlikBitisi=15.7.2023 gençAntrenör=10 limit=10

    paramsExtractor(args)
    checkParams();

    let message_content: string;

    if (errors.length > 0) {
        message_content = "Komutta " +
            errors.length +
            " hata bulundu:\n\t" +
            errors.join(",\n\t");
    }
    else {
        message_content = calculate_strength(
            trDeHourDifference,
            limit
        ).substring(0, 2000);
    }

    console.log(message_content);
    message?.reply(message_content);
}

export function calculate_strength(
    localTimeDiffToServerAsHour: number,
    limit = Infinity
) {

    const serverData = getServerData(E_GameServer.DE);
    const playerPosition: E_PlayerPosition = convertPositionStrToEnum(positionInStr, serverData.allPlayerPositionsMap);

    const player = new Player(
        1,
        "Joe Doe",
        playerPosition,
        PlayerSkills.fromArrayOfSkillPoints(playerSkillPoints),
        youngUntil instanceof Date ? youngUntil : null
    );

    const result: I_StrengthBoostResult = player.getAllStrengthBoosts(
        trainerLevel,
        youngTrainerLevel,
        GameGeneral.getServerDate(localTimeDiffToServerAsHour),
        premiumTrainingEnabled,
        limit
    );
    console.log('Lengh of strength boosts: %o', result.strengthBoosts.length);

    if (result.warning != null) return `Bir hata mevcut: ${result.warning}`;
    else if (result.strengthBoosts.length == 0) return `Hesapta bir hata var yada bu oyuncunun geliştirilecek hiçbir yeteneği kalmamış.`

    return "Güç atlama tarihleri:\n   " +
        result.strengthBoosts
            .map((strengthBoost, index) => {
                const { playerAfterStrengthBoost } = strengthBoost;
                const prevPlayer = index == 0
                    ? player
                    : result.strengthBoosts[index - 1].playerAfterStrengthBoost;

                return `${prevPlayer.strength}->${playerAfterStrengthBoost.strength} (+${strengthBoost.increment})` +
                    ` [${strengthBoost.boostDate.toLocaleString("tr-TR")}]` +
                    `${playerAfterStrengthBoost.isYoung ? " (young)" : ""}`;
            })
            .join("\n   ");
}
